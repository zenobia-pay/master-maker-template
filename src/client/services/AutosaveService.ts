/**
 * Autosave service that batches editor events into changes and saves them to the server
 * This creates a separate save queue that doesn't interfere with the immediate client-side updates
 */

import { createSignal } from "solid-js";
import type { EditorEvent } from "@shared/types/events";
import type { Change } from "@shared/types/events";
import { apiClient } from "../utils/api/client";

// Helper function to convert EditorEvent to Change
function editorEventToChange(event: EditorEvent): Change {
  return {
    ...event,
    id: crypto.randomUUID(),
    timestamp: Date.now(),
    description: getEventDescription(event),
  };
}

function getEventDescription(event: EditorEvent): string {
  switch (event.type) {
    case "ORDER_CREATED":
      return `Created order for "${event.order.customerName}"`;
    case "ORDER_UPDATED":
      return `Updated order #${event.orderId}`;
    case "ORDER_DELETED":
      return `Deleted order for "${event.previousOrder.customerName}"`;
    case "MERCHANT_SETTINGS_UPDATED":
      return `Updated setting "${event.propertyKey}"`;
    default:
      return "Unknown change";
  }
}

export class AutosaveService {
  private saveQueue: Change[] = [];
  private projectId: string;
  private saveTimer: number | null = null;
  private readonly AUTOSAVE_DELAY_MS = 3000; // 3 seconds
  private readonly MAX_BATCH_SIZE = 50; // Prevent huge batches
  private onChangesFailedCallback?: (failedChanges: Change[]) => void;
  private beforeUnloadHandler: ((e: BeforeUnloadEvent) => void) | null = null;
  private isDashboard: boolean;

  // Reactive signals for UI
  private isSavingSignal = createSignal(false);
  private pendingCountSignal = createSignal(0);
  private isSaving = this.isSavingSignal[0];
  private setIsSaving = this.isSavingSignal[1];
  private pendingCount = this.pendingCountSignal[0];
  private setPendingCount = this.pendingCountSignal[1];

  constructor(projectId: string) {
    this.projectId = projectId;
    this.isDashboard = projectId === "dashboard";
  }

  /**
   * Set a callback to be called when changes fail to save
   * This allows the client to be notified of failures
   */
  onChangesFailed(callback: (failedChanges: Change[]) => void): void {
    this.onChangesFailedCallback = callback;
  }

  /**
   * Queue an editor event to be saved
   * This converts the event to a Change and adds it to the save queue
   */
  queueForSave(event: EditorEvent): void {
    const change = editorEventToChange(event);
    this.saveQueue.push(change);
    this.setPendingCount(this.saveQueue.length);

    console.log(`📝 Queued for save: ${change.description}`);

    // Reset the timer - batch multiple rapid changes together
    this.scheduleAutosave();
  }

  /**
   * Queue multiple events at once
   */
  queueMultipleForSave(events: EditorEvent[]): void {
    const changes = events.map(editorEventToChange);
    this.saveQueue.push(...changes);
    this.setPendingCount(this.saveQueue.length);

    console.log(`📝 Queued ${changes.length} changes for save`);

    this.scheduleAutosave();
  }

  /**
   * Legacy method for backward compatibility
   */
  queueChange(change: Change): void {
    this.saveQueue.push(change);
    this.setPendingCount(this.saveQueue.length);
    console.log(`📝 Queued for save: ${change.description}`);
    this.scheduleAutosave();
  }

  /**
   * Force an immediate save of all queued changes
   */
  async forceSave(): Promise<void> {
    if (this.saveTimer) {
      clearTimeout(this.saveTimer);
      this.saveTimer = null;
      this.removeBeforeUnloadHandler();
    }

    await this.performSave();
  }

  /**
   * Check if there are pending changes to save
   */
  hasPendingChanges(): boolean {
    return this.pendingCount() > 0;
  }

  /**
   * Get the number of pending changes
   */
  getPendingChangeCount(): number {
    return this.pendingCount();
  }

  /**
   * Clear all pending changes (useful for cleanup or cancellation)
   */
  clearPendingChanges(): void {
    this.saveQueue = [];
    this.setPendingCount(0);
    if (this.saveTimer) {
      clearTimeout(this.saveTimer);
      this.saveTimer = null;
      this.removeBeforeUnloadHandler();
    }
  }

  /**
   * Check if currently saving
   */
  isSavingChanges(): boolean {
    return this.isSaving();
  }

  /**
   * Schedule an autosave after the delay period
   */
  private scheduleAutosave(): void {
    // Clear existing timer
    if (this.saveTimer) {
      clearTimeout(this.saveTimer);
    }

    // Schedule new save
    this.saveTimer = setTimeout(() => {
      this.performSave();
    }, this.AUTOSAVE_DELAY_MS);

    // Add beforeunload handler when timer is active
    this.addBeforeUnloadHandler();
  }

  /**
   * Add beforeunload event listener to warn about unsaved changes
   */
  private addBeforeUnloadHandler(): void {
    // Remove any existing handler first
    this.removeBeforeUnloadHandler();

    // Only add handler if there's actually a timer active (unsaved changes)
    if (this.saveTimer) {
      this.beforeUnloadHandler = (e: BeforeUnloadEvent) => {
        // Standard way to trigger the browser's confirmation dialog
        // Modern browsers ignore the custom message and show their own
        const message =
          "You have unsaved changes. Are you sure you want to leave?";
        e.preventDefault();
        // For compatibility with older browsers
        (e as any).returnValue = message;
        return message;
      };

      window.addEventListener("beforeunload", this.beforeUnloadHandler);
    }
  }

  /**
   * Remove beforeunload event listener
   */
  private removeBeforeUnloadHandler(): void {
    if (this.beforeUnloadHandler) {
      window.removeEventListener("beforeunload", this.beforeUnloadHandler);
      this.beforeUnloadHandler = null;
    }
  }

  /**
   * Perform the actual save operation
   */
  private async performSave(): Promise<void> {
    if (this.isSaving() || this.saveQueue.length === 0) {
      return;
    }

    this.setIsSaving(true);
    this.saveTimer = null;
    this.removeBeforeUnloadHandler();

    // Take a snapshot of current queue and clear it
    // This allows new changes to be queued while we're saving
    const changesToSave = [...this.saveQueue];
    this.saveQueue = [];
    this.setPendingCount(0);

    try {
      // Limit batch size to prevent server overload
      const batchesToSave = [];
      for (let i = 0; i < changesToSave.length; i += this.MAX_BATCH_SIZE) {
        batchesToSave.push(changesToSave.slice(i, i + this.MAX_BATCH_SIZE));
      }

      console.log(
        `💾 Saving ${changesToSave.length} changes in ${batchesToSave.length} batch(es)...`
      );

      // Process batches sequentially to maintain order
      const allFailedChanges: Change[] = [];

      for (const batch of batchesToSave) {
        try {
          const response = this.isDashboard 
            ? await apiClient.saveDashboard(batch)
            : await apiClient.saveChanges(this.projectId, batch);
          console.log(
            `✅ Saved batch of ${batch.length} changes (${response.processedCount}/${response.totalChanges} processed)`
          );

          // Check if there were any failed changes in the response
          if (response.failedChanges && response.failedChanges.length > 0) {
            allFailedChanges.push(...response.failedChanges);
          }
        } catch (error: any) {
          console.error("❌ Failed to save batch:", error);

          // Extract failed changes from the error or use the entire batch
          const failedChanges = error.failedChanges || batch;
          allFailedChanges.push(...failedChanges);

          // Since this is atomic, stop processing further batches
          // Add remaining batches to failed changes
          const remainingBatches = batchesToSave.slice(
            batchesToSave.indexOf(batch) + 1
          );
          for (const remainingBatch of remainingBatches) {
            allFailedChanges.push(...remainingBatch);
          }
          break;
        }
      }

      if (allFailedChanges.length > 0) {
        console.error(`❌ ${allFailedChanges.length} changes failed to save`);

        // Notify the client about failed changes
        if (this.onChangesFailedCallback) {
          this.onChangesFailedCallback(allFailedChanges);
        }

        // Re-queue failed changes at the front of the queue for retry
        this.saveQueue = [...allFailedChanges, ...this.saveQueue];
        this.setPendingCount(this.saveQueue.length);

        // Schedule a retry after a longer delay
        setTimeout(() => {
          this.scheduleAutosave();
        }, this.AUTOSAVE_DELAY_MS * 2);
      } else {
        console.log(`✅ All changes saved successfully`);
      }
    } catch (error) {
      console.error("❌ Unexpected error during save:", error);

      // In case of unexpected error, re-queue all changes
      this.saveQueue = [...changesToSave, ...this.saveQueue];
      this.setPendingCount(this.saveQueue.length);

      // Schedule a retry after a longer delay
      setTimeout(() => {
        this.scheduleAutosave();
      }, this.AUTOSAVE_DELAY_MS * 2);
    } finally {
      this.setIsSaving(false);
    }
  }

  /**
   * Legacy method for backward compatibility
   */
  async flush(): Promise<void> {
    await this.forceSave();
  }

  /**
   * Cleanup method to be called when service is no longer needed
   */
  destroy(): void {
    if (this.saveTimer) {
      clearTimeout(this.saveTimer);
      this.saveTimer = null;
    }
    this.removeBeforeUnloadHandler();
    this.saveQueue = [];
    this.setIsSaving(false);
    this.setPendingCount(0);
  }

  // Public getters for reactive signals
  public getIsSaving() {
    return this.isSaving;
  }

  public getPendingCount() {
    return this.pendingCount;
  }
}
