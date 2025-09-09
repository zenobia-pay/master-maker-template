import { z } from "zod";
import * as userShardSchema from "../../src/durable-objects/user-shard/schema";

// Export DB types derived from the schema
export type OrderDB = typeof userShardSchema.orders.$inferSelect;
export type OrderInsert = typeof userShardSchema.orders.$inferInsert;
export type TransactionDB = typeof userShardSchema.transactions.$inferSelect;
export type TransactionInsert = typeof userShardSchema.transactions.$inferInsert;
export type MerchantSettingsDB = typeof userShardSchema.merchantSettings.$inferSelect;
export type MerchantSettingsInsert = typeof userShardSchema.merchantSettings.$inferInsert;

// Re-export schema types
export type { Address, OrderItem, PaymentProcessorConfigs, NotificationSettings } from "../../src/durable-objects/user-shard/schema";

// Zod primitives for validation
export const AddressSchema = z.object({
  street: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().optional(),
});

export const OrderItemSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  quantity: z.number().positive(),
  price: z.number().positive(),
  sku: z.string().optional(),
});

export const PaymentProcessorConfigsSchema = z.object({
  stripe: z.object({
    enabled: z.boolean(),
    publicKey: z.string().optional(),
    webhookEndpoint: z.string().optional(),
  }).optional(),
  paypal: z.object({
    enabled: z.boolean(),
    clientId: z.string().optional(),
  }).optional(),
  square: z.object({
    enabled: z.boolean(),
    applicationId: z.string().optional(),
  }).optional(),
});

export const NotificationSettingsSchema = z.object({
  emailOnNewOrder: z.boolean(),
  emailOnPayment: z.boolean(),
  emailOnRefund: z.boolean(),
});

// DB record schemas (with integer timestamps)
export const OrderDBSchema = z.object({
  id: z.string(),
  customerName: z.string(),
  customerEmail: z.string(),
  amount: z.number(),
  currency: z.string(),
  status: z.enum(["pending", "processing", "shipped", "delivered", "cancelled"]),
  items: z.array(OrderItemSchema),
  shippingAddress: AddressSchema.optional(),
  notes: z.string().nullable().optional(),
  createdAt: z.number(),
  updatedAt: z.number(),
});

export const TransactionDBSchema = z.object({
  id: z.string(),
  orderId: z.string().nullable().optional(),
  customerName: z.string(),
  customerEmail: z.string(),
  amount: z.number(),
  currency: z.string(),
  type: z.enum(["payment", "refund", "chargeback"]),
  status: z.enum(["pending", "completed", "failed", "cancelled"]),
  paymentMethod: z.enum(["card", "bank_transfer", "digital_wallet"]).nullable().optional(),
  paymentProcessor: z.enum(["stripe", "paypal", "square", "manual"]).nullable().optional(),
  processorTransactionId: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  metadata: z.record(z.unknown()).nullable().optional(),
  processedAt: z.number().nullable().optional(),
  createdAt: z.number(),
  updatedAt: z.number(),
});

export const MerchantSettingsDBSchema = z.object({
  id: z.string(),
  businessName: z.string(),
  businessEmail: z.string().nullable().optional(),
  businessPhone: z.string().nullable().optional(),
  businessAddress: AddressSchema.nullable().optional(),
  taxId: z.string().nullable().optional(),
  currency: z.string(),
  timezone: z.string(),
  paymentProcessors: PaymentProcessorConfigsSchema.nullable().optional(),
  notifications: NotificationSettingsSchema.nullable().optional(),
  createdAt: z.number(),
  updatedAt: z.number(),
});

// Application schemas (with Date objects)
export const OrderSchema = OrderDBSchema.extend({
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const TransactionSchema = TransactionDBSchema.extend({
  createdAt: z.date(),
  updatedAt: z.date(),
  processedAt: z.date().nullable().optional(),
});

export const MerchantSettingsSchema = MerchantSettingsDBSchema.extend({
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Insert schemas for API requests
export const OrderInsertSchema = z.object({
  customerName: z.string().min(1),
  customerEmail: z.string().email(),
  amount: z.number().positive(),
  currency: z.string().length(3).default("USD"),
  status: z.enum(["pending", "processing", "shipped", "delivered", "cancelled"]).default("pending"),
  items: z.array(OrderItemSchema),
  shippingAddress: AddressSchema.optional(),
  notes: z.string().optional(),
});

export const MerchantSettingsInsertSchema = z.object({
  businessName: z.string().min(1).default("Your Business"),
  businessEmail: z.string().email().optional(),
  businessPhone: z.string().optional(),
  businessAddress: AddressSchema.optional(),
  taxId: z.string().optional(),
  currency: z.string().length(3).default("USD"),
  timezone: z.string().default("America/New_York"),
  paymentProcessors: PaymentProcessorConfigsSchema.optional(),
  notifications: NotificationSettingsSchema.optional(),
});

// Application types with Date conversion
export interface Order extends Omit<OrderDB, 'createdAt' | 'updatedAt'> {
  createdAt: Date;
  updatedAt: Date;
}

export interface Transaction extends Omit<TransactionDB, 'createdAt' | 'updatedAt' | 'processedAt'> {
  createdAt: Date;
  updatedAt: Date;
  processedAt?: Date;
}

export interface MerchantSettings extends Omit<MerchantSettingsDB, 'createdAt' | 'updatedAt'> {
  createdAt: Date;
  updatedAt: Date;
}

// Stats and derived types  
export const DashboardStatsSchema = z.object({
  totalRevenue: z.number(),
  totalOrders: z.number(),
  totalTransactions: z.number(),
  pendingOrders: z.number(),
  recentTransactions: z.array(TransactionSchema),
  monthlyRevenue: z.array(z.object({
    month: z.string(),
    revenue: z.number(),
  })),
  ordersByStatus: z.array(z.object({
    status: z.string(),
    count: z.number(),
  })),
});

export type DashboardView = "overview" | "orders" | "transactions" | "settings";