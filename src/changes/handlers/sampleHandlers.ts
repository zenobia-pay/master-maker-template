import { eq } from "drizzle-orm";
import { samples } from "../../durable-objects/user-shard/schema";
import type { Change } from "@shared/types/events";

export async function handleSampleChanges(db: any, change: Change) {
  switch (change.type) {
    case "SAMPLE_CREATED": {
      const { sample, projectId } = change;
      await db.insert(samples).values(sample);
      return { success: true };
    }

    case "SAMPLE_UPDATED": {
      const { sampleId, newValues } = change;
      const updateData = {
        ...newValues,
        updatedAt: Date.now(),
      };

      await db.update(samples).set(updateData).where(eq(samples.id, sampleId));

      return { success: true };
    }

    case "SAMPLE_DELETED": {
      const { sampleId } = change;
      await db.delete(samples).where(eq(samples.id, sampleId));

      return { success: true };
    }

    case "SAMPLE_STATUS_CHANGED": {
      const { sampleId, newStatus } = change;
      await db
        .update(samples)
        .set({
          status: newStatus,
          updatedAt: Date.now(),
        })
        .where(eq(samples.id, sampleId));

      return { success: true };
    }

    default:
      throw new Error(`Unhandled sample change type: ${(change as any).type}`);
  }
}
