import type {
  LoadProjectResponse,
  SaveChangesRequest,
  SaveChangesResponse,
  GetProjectsResponse,
  CreateProjectRequest,
  CreateProjectResponse,
  DeleteProjectRequest,
  DeleteProjectResponse,
} from "@shared/types/request-response-schemas";

class ApiClient {
  private baseUrl = "/api";

  async loadProject(projectId: string): Promise<LoadProjectResponse> {
    const response = await fetch(`${this.baseUrl}/${projectId}/load-project`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) throw new Error("Failed to load project");
    return response.json();
  }

  async saveChanges(
    projectId: string,
    changes: SaveChangesRequest["changes"]
  ): Promise<SaveChangesResponse> {
    const response = await fetch(`${this.baseUrl}/${projectId}/save`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ changes }),
    });

    if (!response.ok) throw new Error("Failed to save changes");
    return response.json();
  }

  async executeAgentCommand(command: string, context: any): Promise<any> {
    const response = await fetch(`${this.baseUrl}/agent-command`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ command, context }),
    });

    if (!response.ok) throw new Error("Failed to execute command");
    return response.json();
  }

  async getProjects(): Promise<GetProjectsResponse> {
    const response = await fetch(`${this.baseUrl}/projects`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) throw new Error("Failed to get projects");
    return response.json();
  }

  async createProject(
    request: CreateProjectRequest
  ): Promise<CreateProjectResponse> {
    const response = await fetch(`${this.baseUrl}/projects`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    });

    if (!response.ok) throw new Error("Failed to create project");
    return response.json();
  }

  async deleteProject(id: string): Promise<DeleteProjectResponse> {
    const response = await fetch(`${this.baseUrl}/projects/${id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) throw new Error("Failed to delete project");
    return response.json();
  }
}

export const apiClient = new ApiClient();
