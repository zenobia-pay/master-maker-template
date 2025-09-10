// Merchant Dashboard Types - derived from DB schema
import type { orders, transactions, merchantSettings } from "~/durable-objects/user-shard/schema";

// Base DB types inferred from schema
export type OrderDB = typeof orders.$inferSelect;
export type OrderInsert = typeof orders.$inferInsert;
export type TransactionDB = typeof transactions.$inferSelect;
export type TransactionInsert = typeof transactions.$inferInsert;
export type MerchantSettingsDB = typeof merchantSettings.$inferSelect;
export type MerchantSettingsInsert = typeof merchantSettings.$inferInsert;

// Re-export types from schema
export type { Address, OrderItem, PaymentProcessorConfigs, NotificationSettings } from "~/durable-objects/user-shard/schema";

// Application types - use same as DB (integer timestamps)
export type Order = OrderDB;
export type Transaction = TransactionDB;
export type MerchantSettings = MerchantSettingsDB;

export interface DashboardStats {
  totalRevenue: number; // in cents
  totalOrders: number;
  totalTransactions: number;
  pendingOrders: number;
  recentTransactions: Transaction[];
  monthlyRevenue: Array<{
    month: string;
    revenue: number;
  }>;
  ordersByStatus: Array<{
    status: string;
    count: number;
  }>;
}

export type DashboardView = "overview" | "orders" | "transactions" | "settings";