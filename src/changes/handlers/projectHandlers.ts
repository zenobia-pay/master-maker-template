import { eq } from "drizzle-orm";
import { projects } from "../../durable-objects/user-shard/schema";
import type { Change } from "@shared/types/events";

export async function handleProjectChanges(db: any, change: Change) {
  switch (change.type) {
    case "PROJECT_CREATED": {
      const { project } = change;
      await db.insert(projects).values(project);
      return { success: true };
    }
    
    case "PROJECT_PROPERTY_UPDATED": {
      const { projectId, propertyKey, newValue } = change;
      
      // Build the update object dynamically based on the property key
      const updateData: any = {
        updatedAt: new Date()
      };
      
      // Set the specific property that's being updated
      updateData[propertyKey] = newValue;
      
      const result = await db
        .update(projects)
        .set(updateData)
        .where(eq(projects.id, projectId));
        
      return { success: true, result };
    }
    
    case "PROJECT_DELETED": {
      const { projectId } = change;
      await db
        .delete(projects)
        .where(eq(projects.id, projectId));
      
      return { success: true };
    }
    
    default:
      throw new Error(`Unhandled project change type: ${(change as any).type}`);
  }
}