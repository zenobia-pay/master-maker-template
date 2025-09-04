import type { Change, ChangeType, ChangeHandler, AssertNever } from "@shared/types/events";
import { handleProjectChanges } from "./projectHandlers";
import { handleSampleChanges } from "./sampleHandlers";

const handlers: Record<ChangeType, ChangeHandler> = {
  // Sample-related handlers
  SAMPLE_CREATED: handleSampleChanges,
  SAMPLE_UPDATED: handleSampleChanges,
  SAMPLE_DELETED: handleSampleChanges,
  SAMPLE_STATUS_CHANGED: handleSampleChanges,

  // Project-related handlers
  PROJECT_CREATED: handleProjectChanges,
  PROJECT_PROPERTY_UPDATED: handleProjectChanges,
  PROJECT_DELETED: handleProjectChanges,
};

export async function handleChange(db: any, change: Change) {
  const handler = handlers[change.type];

  if (!handler) {
    const assertNever: AssertNever = (_x) => {
      throw new Error(`Unhandled change type: ${(_x as any).type}`);
    };
    return assertNever(change as never);
  }

  return handler(db, change);
}
