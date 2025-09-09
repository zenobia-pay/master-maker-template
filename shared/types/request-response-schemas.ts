import { z } from "zod";
import type { Order, Transaction, MerchantSettings, DashboardStats } from "./merchant";
import { 
  OrderSchema, 
  TransactionSchema, 
  MerchantSettingsSchema,
  DashboardStatsSchema,
  OrderInsertSchema,
  AddressSchema,
  OrderItemSchema 
} from "./primitives";

export const ErrorResponseSchema = z.object({
  success: z.literal(false),
  error: z.string(),
  statusCode: z.number(),
});

export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;

// Dashboard schemas
export const LoadDashboardRequestSchema = z.object({});

// Change schema - use unknown since it's a complex union type
const ChangeSchema = z.unknown();

export const LoadDashboardResponseSchema = z.object({
  orders: z.array(OrderSchema),
  transactions: z.array(TransactionSchema),
  settings: MerchantSettingsSchema,
  stats: DashboardStatsSchema,
});

export const SaveDashboardRequestSchema = z.object({
  changes: z.array(ChangeSchema),
});

export const SaveDashboardResponseSchema = z.object({
  success: z.boolean(),
  processedCount: z.number(),
  totalChanges: z.number(),
  failedChanges: z.array(ChangeSchema).optional(),
});

export type LoadDashboardRequest = z.infer<typeof LoadDashboardRequestSchema>;
export type LoadDashboardResponse = {
  orders: Order[];
  transactions: Transaction[];
  settings: MerchantSettings;
  stats: DashboardStats;
};

export type SaveDashboardRequest = z.infer<typeof SaveDashboardRequestSchema>;
export type SaveDashboardResponse = z.infer<typeof SaveDashboardResponseSchema>;

// Order schemas
export const CreateOrderRequestSchema = z.object({
  customerName: z.string().min(1),
  customerEmail: z.string().email(),
  amount: z.number().positive(),
  currency: z.string().length(3),
  items: z.array(z.object({
    name: z.string().min(1),
    quantity: z.number().positive(),
    price: z.number().positive(),
    sku: z.string().optional(),
  })),
  shippingAddress: z.object({
    street: z.string(),
    city: z.string(),
    state: z.string(),
    postalCode: z.string(),
    country: z.string(),
  }).optional(),
  notes: z.string().optional(),
});

export const UpdateOrderRequestSchema = z.object({
  id: z.string(),
  customerName: z.string().optional(),
  customerEmail: z.string().email().optional(),
  status: z.enum(["pending", "processing", "shipped", "delivered", "cancelled"]).optional(),
  items: z.array(z.object({
    name: z.string().min(1),
    quantity: z.number().positive(),
    price: z.number().positive(),
    sku: z.string().optional(),
  })).optional(),
  shippingAddress: z.object({
    street: z.string(),
    city: z.string(),
    state: z.string(),
    postalCode: z.string(),
    country: z.string(),
  }).optional(),
  notes: z.string().optional(),
});

export const DeleteOrderRequestSchema = z.object({
  id: z.string(),
});

export const OrderResponseSchema = z.object({
  order: OrderSchema,
});

export const OrdersResponseSchema = z.object({
  orders: z.array(OrderSchema),
});

export type CreateOrderRequest = z.infer<typeof CreateOrderRequestSchema>;
export type UpdateOrderRequest = z.infer<typeof UpdateOrderRequestSchema>;
export type DeleteOrderRequest = z.infer<typeof DeleteOrderRequestSchema>;

export type OrderResponse = {
  order: Order;
};

export type OrdersResponse = {
  orders: Order[];
};

// Transaction schemas
export const GetTransactionsRequestSchema = z.object({
  page: z.number().optional(),
  limit: z.number().optional(),
  status: z.enum(["pending", "completed", "failed", "cancelled"]).optional(),
  type: z.enum(["payment", "refund", "chargeback"]).optional(),
});

export const TransactionsResponseSchema = z.object({
  transactions: z.array(TransactionSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
});

export type GetTransactionsRequest = z.infer<typeof GetTransactionsRequestSchema>;
export type TransactionsResponse = {
  transactions: Transaction[];
  total: number;
  page: number;
  limit: number;
};

// Settings schemas
export const UpdateSettingsRequestSchema = z.object({
  businessName: z.string().optional(),
  businessEmail: z.string().email().optional(),
  businessPhone: z.string().optional(),
  businessAddress: z.object({
    street: z.string(),
    city: z.string(),
    state: z.string(),
    postalCode: z.string(),
    country: z.string(),
  }).optional(),
  currency: z.string().length(3).optional(),
  timezone: z.string().optional(),
  notifications: z.object({
    emailOnNewOrder: z.boolean(),
    emailOnPayment: z.boolean(),
    emailOnRefund: z.boolean(),
  }).optional(),
});

export const SettingsResponseSchema = z.object({
  settings: MerchantSettingsSchema,
});

export type UpdateSettingsRequest = z.infer<typeof UpdateSettingsRequestSchema>;
export type SettingsResponse = {
  settings: MerchantSettings;
};

export const AgentCommandResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  data: z.unknown().optional(),
  availableCommands: z.record(z.string()).optional(),
});

export type AgentCommandResponse = z.infer<typeof AgentCommandResponseSchema>;