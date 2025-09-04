import type { Change } from '@shared/types/events';
import { apiClient } from '../utils/api/client';

export class AutosaveService {
  private changeQueue: Change[] = [];
  private saveTimeout: NodeJS.Timeout | null = null;
  private readonly DEBOUNCE_MS = 1000;

  queueChange(change: Change) {
    this.changeQueue.push(change);
    this.scheduleSave();
  }

  private scheduleSave() {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }

    this.saveTimeout = setTimeout(() => {
      this.flush();
    }, this.DEBOUNCE_MS);
  }

  async flush() {
    if (this.changeQueue.length === 0) return;

    const changes = [...this.changeQueue];
    this.changeQueue = [];

    try {
      await apiClient.saveChanges(changes);
    } catch (error) {
      console.error('Failed to save changes:', error);
      this.changeQueue.unshift(...changes);
    }
  }
}