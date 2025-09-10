import { DurableObject } from "cloudflare:workers";
import { drizzle, DrizzleSqliteDODatabase } from "drizzle-orm/durable-sqlite";
import { eq, inArray } from "drizzle-orm";
import { migrate } from "drizzle-orm/durable-sqlite/migrator";
import migrations from "../../../user-shard-drizzle/migrations";
import * as schema from "./schema";
import { handleChange } from "../../changes/handlers";
import type { Change } from "@shared/types/events";
import type {
  LoadDashboardResponse,
  SaveDashboardResponse,
  ErrorResponse,
} from "@shared/types/request-response-schemas";
import type {
  Order,
  Transaction,
  MerchantSettings,
  DashboardStats,
} from "@shared/types/merchant";

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

  async executeAgentCommand(
    command: string,
    context: unknown
  ): Promise<
    | {
        success: boolean;
        data?: unknown;
        message?: string;
        availableCommands?: Record<string, string>;
      }
    | ErrorResponse
  > {
    try {
      // Simple command execution for merchant operations
      const availableCommands = {
        listOrders: "Get all orders",
        listTransactions: "Get all transactions",
        getDashboardStats: "Get dashboard statistics",
      };

      // Handle basic commands
      switch (command) {
        case "listOrders":
          const orders = await this.db.select().from(schema.orders);
          return { success: true, data: orders };

        case "listTransactions":
          const transactions = await this.db.select().from(schema.transactions);
          return { success: true, data: transactions };

        case "getDashboardStats":
          const allOrders = await this.db.select().from(schema.orders);
          const allTransactions = await this.db
            .select()
            .from(schema.transactions);
          const stats = {
            totalRevenue: allOrders.reduce(
              (sum, order) => sum + order.amount,
              0
            ),
            orderCount: allOrders.length,
            transactionCount: allTransactions.length,
          };
          return { success: true, data: stats };

        default:
          return {
            success: true,
            message: `Command '${command}' recognized`,
            availableCommands,
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

  async loadDashboard(): Promise<LoadDashboardResponse | ErrorResponse> {
    try {
      // Load all merchant dashboard data from DB
      const ordersDB = await this.db.select().from(schema.orders);
      const transactionsDB = await this.db.select().from(schema.transactions);
      const [settingsDB] = await this.db.select().from(schema.merchantSettings);

      const orders: Order[] = ordersDB;
      const transactions: Transaction[] = transactionsDB;
      const now = Date.now();
      const settings: MerchantSettings = settingsDB || {
        id: crypto.randomUUID(),
        businessName: "Your Business",
        businessEmail: null,
        businessPhone: null,
        businessAddress: null,
        taxId: null,
        currency: "USD",
        timezone: "America/New_York",
        paymentProcessors: null,
        notifications: null,
        createdAt: now,
        updatedAt: now,
      };

      // Calculate stats
      const totalRevenue = orders.reduce((sum, order) => sum + order.amount, 0);
      const totalOrders = orders.length;
      const pendingOrders = orders.filter((o) => o.status === "pending").length;
      const totalTransactions = transactions.length;
      const recentTransactions = transactions
        .sort((a, b) => b.createdAt - a.createdAt)
        .slice(0, 5);

      // Calculate monthly revenue (last 12 months)
      const monthlyRevenue = [];
      for (let i = 11; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthKey = date.toISOString().slice(0, 7); // YYYY-MM format
        const monthOrders = orders.filter(
          (order) =>
            new Date(order.createdAt).toISOString().slice(0, 7) === monthKey
        );
        monthlyRevenue.push({
          month: monthKey,
          revenue: monthOrders.reduce((sum, order) => sum + order.amount, 0),
        });
      }

      // Calculate orders by status
      const statusCounts = orders.reduce(
        (acc, order) => {
          acc[order.status] = (acc[order.status] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      );

      const ordersByStatus = Object.entries(statusCounts).map(
        ([status, count]) => ({
          status,
          count,
        })
      );

      const stats: DashboardStats = {
        totalRevenue,
        totalOrders,
        totalTransactions,
        pendingOrders,
        recentTransactions,
        monthlyRevenue,
        ordersByStatus,
      };

      return {
        orders,
        transactions,
        settings,
        stats,
      };
    } catch (error) {
      console.error("Failed to load dashboard:", error);
      return {
        error: "Failed to load dashboard",
        success: false,
        statusCode: 500,
      };
    }
  }

  async saveDashboard(
    changes: Change[]
  ): Promise<SaveDashboardResponse | ErrorResponse> {
    try {
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
          console.error("Change data:", change);
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
      console.error("Save dashboard error:", error);
      return {
        success: false,
        error: "Failed to save dashboard: " + (error as Error).message,
        statusCode: 500,
      };
    }
  }
}
