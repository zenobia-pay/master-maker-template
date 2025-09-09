import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

// Use crypto.randomUUID() instead of nanoid to avoid ES module issues
const generateId = () => crypto.randomUUID();

// Merchant schema types
export interface Address {
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number; // in cents
  sku?: string;
}

export interface PaymentProcessorConfigs {
  stripe?: {
    enabled: boolean;
    publicKey?: string;
    webhookEndpoint?: string;
  };
  paypal?: {
    enabled: boolean;
    clientId?: string;
  };
  square?: {
    enabled: boolean;
    applicationId?: string;
  };
}

export interface NotificationSettings {
  emailOnNewOrder: boolean;
  emailOnPayment: boolean;
  emailOnRefund: boolean;
}

// Merchant tables
export const orders = sqliteTable("orders", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => generateId()),
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email").notNull(),
  amount: integer("amount").notNull(), // in cents
  currency: text("currency").notNull().default("USD"),
  status: text("status", { enum: ["pending", "processing", "shipped", "delivered", "cancelled"] })
    .notNull()
    .default("pending"),
  items: text("items", { mode: "json" }).$type<OrderItem[]>().notNull(),
  shippingAddress: text("shipping_address", { mode: "json" }).$type<Address>(),
  notes: text("notes"),
  createdAt: integer("created_at")
    .notNull()
    .$defaultFn(() => Date.now()),
  updatedAt: integer("updated_at")
    .notNull()
    .$defaultFn(() => Date.now()),
});

export const transactions = sqliteTable("transactions", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => generateId()),
  orderId: text("order_id").references(() => orders.id),
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email").notNull(),
  amount: integer("amount").notNull(), // in cents
  currency: text("currency").notNull().default("USD"),
  type: text("type", { enum: ["payment", "refund", "chargeback"] })
    .notNull()
    .default("payment"),
  status: text("status", { enum: ["pending", "completed", "failed", "cancelled"] })
    .notNull()
    .default("pending"),
  paymentMethod: text("payment_method", { enum: ["card", "bank_transfer", "digital_wallet"] }),
  paymentProcessor: text("payment_processor", { enum: ["stripe", "paypal", "square", "manual"] }),
  processorTransactionId: text("processor_transaction_id"),
  description: text("description"),
  metadata: text("metadata", { mode: "json" }),
  processedAt: integer("processed_at"),
  createdAt: integer("created_at")
    .notNull()
    .$defaultFn(() => Date.now()),
  updatedAt: integer("updated_at")
    .notNull()
    .$defaultFn(() => Date.now()),
});

export const merchantSettings = sqliteTable("merchant_settings", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => generateId()),
  businessName: text("business_name").notNull().default("Your Business"),
  businessEmail: text("business_email"),
  businessPhone: text("business_phone"),
  businessAddress: text("business_address", { mode: "json" }).$type<Address>(),
  taxId: text("tax_id"),
  currency: text("currency").notNull().default("USD"),
  timezone: text("timezone").notNull().default("America/New_York"),
  paymentProcessors: text("payment_processors", { mode: "json" }).$type<PaymentProcessorConfigs>(),
  notifications: text("notifications", { mode: "json" }).$type<NotificationSettings>(),
  createdAt: integer("created_at")
    .notNull()
    .$defaultFn(() => Date.now()),
  updatedAt: integer("updated_at")
    .notNull()
    .$defaultFn(() => Date.now()),
});
