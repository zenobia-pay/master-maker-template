import { DurableObject } from "cloudflare:workers";
import { drizzle, DrizzleSqliteDODatabase } from "drizzle-orm/durable-sqlite";
import { eq, inArray } from "drizzle-orm";
import { migrate } from "drizzle-orm/durable-sqlite/migrator";
import migrations from "../../../user-shard-drizzle/migrations";
import * as schema from "./schema";
import { handleChange } from "../../changes/handlers";
import type { Change } from "@shared/types/events";
import type {
  LoadProjectResponse,
  GetProjectsResponse,
  CreateProjectRequest,
  CreateProjectResponse,
  SaveChangesResponse,
  DeleteProjectResponse,
  ErrorResponse,
} from "@shared/types/request-response-schemas";

type UserShardEnv = {
  DB: D1Database;
  USER_SHARD: DurableObjectNamespace;
  MEDIA_BUCKET: R2Bucket;
  BETTER_AUTH_SECRET: string;
};

export class UserShard extends DurableObject<UserShardEnv> {
  private db: DrizzleSqliteDODatabase<typeof schema>;
  private storage: DurableObjectStorage;

  constructor(ctx: DurableObjectState, env: UserShardEnv) {
    super(ctx, env);
    this.storage = ctx.storage;
    this.db = drizzle(this.storage, { schema, logger: true });

    // Run migrations before accepting any requests
    ctx.blockConcurrencyWhile(async () => {
      await this.migrate();
    });
  }

  private async migrate() {
    await migrate(this.db, migrations);
  }

  async loadProject(
    projectId: string
  ): Promise<LoadProjectResponse | ErrorResponse> {
    try {
      const [project] = await this.db
        .select()
        .from(schema.projects)
        .where(eq(schema.projects.id, projectId));

      if (!project) {
        return { error: "Project not found", success: false, statusCode: 404 };
      }

      const samples = await this.db
        .select()
        .from(schema.samples)
        .where(eq(schema.samples.projectId, projectId));

      return {
        project: {
          ...project,
          description: project.description ?? null,
          settings: project.settings ?? {
            resolution: { width: 1920, height: 1080 },
            fps: 30,
            backgroundColor: "#000000",
          },
        },
        samples,
      };
    } catch (error) {
      console.error("Failed to load project:", error);
      return {
        error: "Failed to load project",
        success: false,
        statusCode: 500,
      };
    }
  }

  async saveChanges(
    changes: Change[],
    projectId: string
  ): Promise<SaveChangesResponse | ErrorResponse> {
    try {
      // Verify project exists (basic validation)
      const project = this.db
        .select()
        .from(schema.projects)
        .where(eq(schema.projects.id, projectId))
        .get();

      if (!project) {
        return {
          success: false,
          error: "Project not found",
          statusCode: 404,
        };
      }

      // Process each change individually - each change is atomic
      let processedCount = 0;
      const processedChanges: Change[] = [];
      const failedChanges: Change[] = [];

      for (const change of changes) {
        try {
          await handleChange(this.db, change);
          processedCount++;
          processedChanges.push(change);
        } catch (error) {
          console.error(
            `Failed to process change: ${change?.id || "null change"}:`,
            error
          );
          failedChanges.push(change);

          const remainingChanges = changes.slice(processedCount + 1);
          failedChanges.push(...remainingChanges);
          break;
        }
      }

      // Return appropriate response based on results
      if (failedChanges.length > 0) {
        return {
          success: true,
          processedCount,
          totalChanges: changes.length,
          failedChanges,
        };
      }

      return {
        success: true,
        processedCount,
        totalChanges: changes.length,
      };
    } catch (error) {
      console.error("Save changes error:", error);
      return {
        success: false,
        error: "Failed to save changes: " + (error as Error).message,
        statusCode: 500,
      };
    }
  }

  async executeAgentCommand(
    command: string,
    context: any
  ): Promise<any | ErrorResponse> {
    try {
      // Simple command execution - can be extended based on needs
      // For now, just return available commands
      const availableCommands = {
        listProjects: "Get all projects",
        createSample: "Create a new sample",
        updateSample: "Update an existing sample",
        deleteSample: "Delete a sample",
        querySamples: "Query samples with filters",
      };

      // Handle basic commands
      switch (command) {
        case "listProjects":
          const projects = await this.db.select().from(schema.projects);
          return { success: true, data: projects };

        case "listSamples":
          const samples = await this.db.select().from(schema.samples);
          return { success: true, data: samples };

        default:
          return {
            success: true,
            message: `Command '${command}' recognized`,
            availableCommands,
            context,
          };
      }
    } catch (error) {
      console.error("Failed to execute agent command:", error);
      return {
        error: "Failed to execute agent command",
        success: false,
        statusCode: 500,
      };
    }
  }

  // WebSocket support for real-time communication
  async handleWebSocketUpgrade(_request: Request): Promise<Response> {
    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);

    // Accept the WebSocket connection
    server.accept();

    // Handle WebSocket messages
    server.addEventListener("message", async (event) => {
      try {
        const message = JSON.parse(event.data as string);

        // Handle different message types
        switch (message.type) {
          case "ping":
            server.send(
              JSON.stringify({ type: "pong", timestamp: Date.now() })
            );
            break;

          case "command":
            const result = await this.executeAgentCommand(
              message.command,
              message.context
            );
            server.send(JSON.stringify({ type: "response", data: result }));
            break;

          case "subscribe":
            // Handle subscription to project changes
            server.send(
              JSON.stringify({
                type: "subscribed",
                projectId: message.projectId,
              })
            );
            break;

          default:
            server.send(
              JSON.stringify({
                type: "error",
                message: "Unknown message type",
              })
            );
        }
      } catch (error) {
        server.send(
          JSON.stringify({
            type: "error",
            message: "Failed to process message",
          })
        );
      }
    });

    // Handle WebSocket close
    server.addEventListener("close", () => {
      console.log("WebSocket connection closed");
    });

    return new Response(null, { status: 101, webSocket: client });
  }

  async getProjects(): Promise<GetProjectsResponse | ErrorResponse> {
    try {
      const projects = await this.db.select().from(schema.projects);
      return {
        projects: projects.map((project) => ({
          ...project,
          description: project.description ?? null,
          settings: project.settings ?? {
            resolution: { width: 1920, height: 1080 },
            fps: 30,
            backgroundColor: "#000000",
          },
        })),
      };
    } catch (error) {
      console.error("Failed to get projects:", error);
      return {
        error: "Failed to get projects",
        success: false,
        statusCode: 500,
      };
    }
  }

  async createProject(
    request: CreateProjectRequest & { userId: string }
  ): Promise<CreateProjectResponse | ErrorResponse> {
    try {
      const { name, description, userId } = request;

      const projectId = crypto.randomUUID();
      const now = new Date();

      const defaultSettings = {
        resolution: { width: 1920, height: 1080 },
        fps: 30,
        backgroundColor: "#000000",
      };

      const newProject = {
        id: projectId,
        userId,
        name,
        description: description || "",
        settings: defaultSettings,
        createdAt: now,
        updatedAt: now,
      };

      await this.db.insert(schema.projects).values(newProject);

      return { project: newProject };
    } catch (error) {
      console.error("Failed to create project:", error);
      return {
        error: "Failed to create project",
        success: false,
        statusCode: 500,
      };
    }
  }

  async deleteProject(
    projectId: string
  ): Promise<DeleteProjectResponse | ErrorResponse> {
    try {
      await this.db
        .delete(schema.projects)
        .where(eq(schema.projects.id, projectId));

      return { success: true };
    } catch (error) {
      console.error("Failed to delete project:", error);
      return {
        error: "Failed to delete project",
        success: false,
        statusCode: 500,
      };
    }
  }
}
