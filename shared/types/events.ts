import type { Order, Transaction, MerchantSettings, OrderInsert, MerchantSettingsInsert } from "./merchant";
import type { DrizzleSqliteDODatabase } from "drizzle-orm/durable-sqlite";
import type * as schema from "~/durable-objects/user-shard/schema";

export type BaseEditorEvent =
  | {
      type: "ORDER_CREATED";
      order: OrderInsert;
    }
  | {
      type: "ORDER_UPDATED";
      orderId: string;
      previousValues: Partial<Order>;
      newValues: Partial<Order>;
    }
  | {
      type: "ORDER_DELETED";
      orderId: string;
      previousOrder: Order;
    }
  | {
      type: "MERCHANT_SETTINGS_UPDATED";
      propertyKey: keyof MerchantSettings;
      previousValue: MerchantSettings[keyof MerchantSettings];
      newValue: MerchantSettings[keyof MerchantSettings];
    };

export type DashboardEvent = BaseEditorEvent;

/**
 * Persistence metadata added by the server
 */
export interface PersistenceMetadata {
  id: string;
  timestamp: number;
  description: string;
}

/**
 * Change type for server-side persistence
 * Includes all event data plus persistence metadata
 */
export type Change = BaseEditorEvent & PersistenceMetadata;

/**
 * Client-side event type (alias for BaseEditorEvent)
 */
export type EditorEvent = BaseEditorEvent;

/**
 * Types for change handlers
 */
export type ChangeType = Change["type"];

export type ChangeHandler<T extends Change = Change> = (
  db: DrizzleSqliteDODatabase<typeof schema>,
  change: T
) => Promise<{ success: boolean; result?: unknown }>;

export type AssertNever = (x: never) => never;
