/**
 * Dashboard Event Queue Processor
 *
 * Handles all dashboard events and updates the store accordingly
 */
import { batch } from "solid-js";
import { SetStoreFunction, produce } from "solid-js/store";
import type { DashboardStore } from "./DashboardContext";
import type { DashboardEvent } from "@shared/types/events";

export function processDashboardEventQueue(
  events: DashboardEvent[],
  store: DashboardStore,
  setStore: SetStoreFunction<DashboardStore>
): void {
  if (events.length === 0) return;

  // Process all events in batch
  batch(() => {
    for (const event of events) {
      switch (event.type) {
        case "ORDER_CREATED": {
          setStore(
            produce((s) => {
              s.orders.push(event.order);
              s.isCreatingOrder = false;
              s.showCreateOrderDialog = false;
            })
          );
          console.log("✅ Order created:", event.order.customerName);
          break;
        }

        case "ORDER_UPDATED": {
          setStore(
            produce((s) => {
              const orderIndex = s.orders.findIndex(
                (o) => o.id === event.orderId
              );
              if (orderIndex !== -1) {
                s.orders[orderIndex] = {
                  ...s.orders[orderIndex],
                  ...event.newValues,
                };
              }
              s.isUpdatingOrder = false;
              s.showEditOrderDialog = false;
              s.editingOrder = null;
            })
          );
          console.log("✅ Order updated:", event.orderId);
          break;
        }

        case "ORDER_DELETED": {
          setStore(
            produce((s) => {
              s.orders = s.orders.filter((o) => o.id !== event.orderId);
              s.deletingOrderId = null;
            })
          );
          console.log("✅ Order deleted:", event.orderId);
          break;
        }

        case "MERCHANT_SETTINGS_UPDATED": {
          setStore(
            produce((s) => {
              if (s.settings) {
                (s.settings as any)[event.propertyKey] = event.newValue;
                s.settings.updatedAt = new Date();
              }
              s.isUpdatingSettings = false;
            })
          );
          console.log(
            "✅ Settings updated:",
            event.propertyKey,
            event.newValue
          );
          break;
        }

        default: {
          console.warn("Unhandled dashboard event type:", (event as any).type);
          break;
        }
      }
    }
  });
}
