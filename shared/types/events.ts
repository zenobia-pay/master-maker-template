import type { Project, Sample } from "./primitives";

export type BaseEditorEvent =
  | {
      type: "SAMPLE_CREATED";
      projectId: string;
      sample: Sample;
    }
  | {
      type: "SAMPLE_UPDATED";
      sampleId: string;
      previousValues: Partial<Sample>;
      newValues: Partial<Sample>;
    }
  | {
      type: "SAMPLE_DELETED";
      sampleId: string;
      projectId: string;
      // For undo: need the deleted sample data
      previousSample: Sample;
    }
  | {
      type: "SAMPLE_STATUS_CHANGED";
      sampleId: string;
      previousStatus: string;
      newStatus: string;
    }
  | {
      type: "PROJECT_CREATED";
      project: Project;
    }
  | {
      type: "PROJECT_PROPERTY_UPDATED";
      projectId: string;
      propertyKey: string;
      previousValue: string | null;
      newValue: string | null;
    }
  | {
      type: "PROJECT_DELETED";
      projectId: string;
      // For undo: restore the project and its samples
      previousProject: Project;
      previousSamples: Sample[];
    };

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
  db: any,
  change: T
) => Promise<{ success: boolean; result?: any }>;

export type AssertNever = (x: never) => never;
