import type {
  LoadDashboardResponse,
  SaveDashboardRequest,
  SaveDashboardResponse,
  CreateOrderRequest,
  UpdateOrderRequest,
  DeleteOrderRequest,
  OrderResponse,
  OrdersResponse,
  GetTransactionsRequest,
  TransactionsResponse,
  UpdateSettingsRequest,
  SettingsResponse,
} from "@shared/types/request-response-schemas";

class ApiClient {
  private baseUrl = "/api";

  async loadDashboard(): Promise<LoadDashboardResponse> {
    const response = await fetch(`${this.baseUrl}/dashboard/load`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) throw new Error("Failed to load dashboard");
    return response.json();
  }

  async saveDashboard(
    changes: SaveDashboardRequest["changes"]
  ): Promise<SaveDashboardResponse> {
    const response = await fetch(`${this.baseUrl}/dashboard/save`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ changes }),
    });

    if (!response.ok) throw new Error("Failed to save dashboard changes");
    return response.json();
  }

  // Order management
  async createOrder(request: CreateOrderRequest): Promise<OrderResponse> {
    const response = await fetch(`${this.baseUrl}/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    });

    if (!response.ok) throw new Error("Failed to create order");
    return response.json();
  }

  async updateOrder(request: UpdateOrderRequest): Promise<OrderResponse> {
    const response = await fetch(`${this.baseUrl}/orders/${request.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    });

    if (!response.ok) throw new Error("Failed to update order");
    return response.json();
  }

  async deleteOrder(request: DeleteOrderRequest): Promise<void> {
    const response = await fetch(`${this.baseUrl}/orders/${request.id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) throw new Error("Failed to delete order");
  }

  async getOrders(): Promise<OrdersResponse> {
    const response = await fetch(`${this.baseUrl}/orders`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) throw new Error("Failed to get orders");
    return response.json();
  }

  // Transaction management
  async getTransactions(
    request: GetTransactionsRequest = {}
  ): Promise<TransactionsResponse> {
    const params = new URLSearchParams();
    if (request.page) params.set("page", request.page.toString());
    if (request.limit) params.set("limit", request.limit.toString());
    if (request.status) params.set("status", request.status);
    if (request.type) params.set("type", request.type);

    const response = await fetch(`${this.baseUrl}/transactions?${params}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) throw new Error("Failed to get transactions");
    return response.json();
  }

  // Settings management
  async updateSettings(
    request: UpdateSettingsRequest
  ): Promise<SettingsResponse> {
    const response = await fetch(`${this.baseUrl}/settings`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    });

    if (!response.ok) throw new Error("Failed to update settings");
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
}

export const apiClient = new ApiClient();
