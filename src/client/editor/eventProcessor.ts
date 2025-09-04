/**
 * Event Queue Processor
 *
 * Handles all editor events and updates the store accordingly
 */
import { batch } from "solid-js";
import { SetStoreFunction, produce } from "solid-js/store";
import type { ProjectStore } from "../contexts/ProjectContext";
import type { EditorEvent } from "@shared/types/events";

export function processEventQueue(
  events: EditorEvent[],
  store: ProjectStore,
  setStore: SetStoreFunction<ProjectStore>
): void {
  if (events.length === 0) return;

  // Process all events in batch
  batch(() => {
    for (const event of events) {
      switch (event.type) {
        case "SAMPLE_CREATED": {
          setStore(
            produce((s) => {
              s.samples.push({
                ...event.sample,
                createdAt: event.sample.createdAt,
                updatedAt: event.sample.updatedAt,
              });
            })
          );
          console.log("✅ Sample added to store:", event.sample.name);
          break;
        }

        case "SAMPLE_UPDATED": {
          setStore(
            produce((s) => {
              const sampleIndex = s.samples.findIndex(
                (sample) => sample.id === event.sampleId
              );
              if (sampleIndex !== -1) {
                s.samples[sampleIndex] = {
                  ...s.samples[sampleIndex],
                  ...event.newValues,
                };
              }
            })
          );
          console.log("✅ Sample updated in store:", event.sampleId);
          break;
        }

        case "SAMPLE_DELETED": {
          setStore(
            produce((s) => {
              s.samples = s.samples.filter(
                (sample) => sample.id !== event.sampleId
              );
              // Clear selection if this sample was selected
              if (s.selectedSampleId === event.sampleId) {
                s.selectedSampleId = null;
              }
            })
          );
          console.log("✅ Sample deleted from store:", event.sampleId);
          break;
        }

        case "SAMPLE_STATUS_CHANGED": {
          setStore(
            produce((s) => {
              const sample = s.samples.find(
                (sample) => sample.id === event.sampleId
              );
              if (sample) {
                sample.status = event.newStatus as
                  | "draft"
                  | "active"
                  | "completed"
                  | "archived";
                sample.updatedAt = Date.now();
              }
            })
          );
          console.log(
            "✅ Sample status changed:",
            event.sampleId,
            event.newStatus
          );
          break;
        }

        case "PROJECT_CREATED": {
          setStore(
            produce((s) => {
              s.projectId = event.project.id;
              s.projectName = event.project.name;
            })
          );
          console.log("✅ Project created in store:", event.project.name);
          break;
        }

        case "PROJECT_PROPERTY_UPDATED": {
          setStore(
            produce((s) => {
              // For now, we don't have a properties field in ProjectStore
              // This could be extended when project properties are added
            })
          );
          console.log("✅ Project property updated:", event.propertyKey);
          break;
        }

        case "PROJECT_DELETED": {
          // Handle project deletion - might redirect or clear store
          console.log("✅ Project deleted:", event.projectId);
          break;
        }

        default: {
          console.warn("Unhandled event type:", (event as any).type);
          break;
        }
      }
    }
  });
}
