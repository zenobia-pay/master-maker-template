import type {
  Change,
  ChangeType,
  ChangeHandler,
  AssertNever,
} from "@shared/types/events";
import type { DrizzleSqliteDODatabase } from "drizzle-orm/durable-sqlite";
import * as schema from "~/durable-objects/user-shard/schema";
import { eq } from "drizzle-orm";

// Generic handler function that properly types the change
async function handleOrderCreated(
  db: DrizzleSqliteDODatabase<typeof schema>,
  change: Change
): Promise<{ success: boolean; result?: unknown }> {
  if (change.type !== "ORDER_CREATED") throw new Error("Invalid change type");

  try {
    // Convert any Date fields to timestamps and ensure proper data format
    const { createdAt: _, updatedAt: __, ...orderWithoutDates } = change.order;
    const orderData = {
      ...orderWithoutDates,
      id: change.order.id || crypto.randomUUID(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await db.insert(schema.orders).values(orderData);
    return { success: true };
  } catch (error) {
    console.error("Failed to create order:", error);
    throw error;
  }
}

async function handleOrderUpdated(
  db: DrizzleSqliteDODatabase<typeof schema>,
  change: Change
): Promise<{ success: boolean; result?: unknown }> {
  if (change.type !== "ORDER_UPDATED") throw new Error("Invalid change type");

  try {
    // Filter out Date fields and convert to proper format
    const { createdAt: _, updatedAt: __, ...valuesWithoutDates } = change.newValues;
    const updateData = {
      ...valuesWithoutDates,
      updatedAt: Date.now(),
    };

    await db
      .update(schema.orders)
      .set(updateData)
      .where(eq(schema.orders.id, change.orderId));

    return { success: true };
  } catch (error) {
    console.error("Failed to update order:", error);
    throw error;
  }
}

async function handleOrderDeleted(
  db: DrizzleSqliteDODatabase<typeof schema>,
  change: Change
): Promise<{ success: boolean; result?: unknown }> {
  if (change.type !== "ORDER_DELETED") throw new Error("Invalid change type");

  try {
    await db.delete(schema.orders).where(eq(schema.orders.id, change.orderId));

    return { success: true };
  } catch (error) {
    console.error("Failed to delete order:", error);
    throw error;
  }
}

async function handleMerchantSettingsUpdated(
  db: DrizzleSqliteDODatabase<typeof schema>,
  change: Change
): Promise<{ success: boolean; result?: unknown }> {
  if (change.type !== "MERCHANT_SETTINGS_UPDATED")
    throw new Error("Invalid change type");

  try {
    // Check if settings record exists
    const [existingSettings] = await db
      .select()
      .from(schema.merchantSettings)
      .limit(1);

    if (existingSettings) {
      // Update existing settings
      const updateData = {
        [change.propertyKey]: change.newValue,
        updatedAt: Date.now(),
      };

      await db
        .update(schema.merchantSettings)
        .set(updateData)
        .where(eq(schema.merchantSettings.id, existingSettings.id));
    } else {
      // Create new settings record
      const settingsData = {
        id: crypto.randomUUID(),
        businessName: "Your Business",
        currency: "USD",
        timezone: "America/New_York",
        [change.propertyKey]: change.newValue,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      await db.insert(schema.merchantSettings).values(settingsData);
    }

    return { success: true };
  } catch (error) {
    console.error("Failed to update merchant settings:", error);
    throw error;
  }
}

const handlers: Record<ChangeType, ChangeHandler> = {
  ORDER_CREATED: handleOrderCreated,
  ORDER_UPDATED: handleOrderUpdated,
  ORDER_DELETED: handleOrderDeleted,
  MERCHANT_SETTINGS_UPDATED: handleMerchantSettingsUpdated,
};

export async function handleChange(
  db: DrizzleSqliteDODatabase<typeof schema>,
  change: Change
) {
  const handler = handlers[change.type];

  if (!handler) {
    const assertNever: AssertNever = (_x) => {
      throw new Error(`Unhandled change type: ${(_x as any).type}`);
    };
    return assertNever(change as never);
  }

  return handler(db, change);
}
