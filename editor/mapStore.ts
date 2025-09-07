import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import type { XMap, XMapEntry } from './types';

export class MapStore {
  private map: XMap = {};
  private persistPath: string;
  
  constructor(rootDir: string) {
    console.log('[MapStore] Initializing with root:', rootDir);
    const editorDir = join(rootDir, '.editor');
    if (!existsSync(editorDir)) {
      console.log('[MapStore] Creating .editor directory');
      mkdirSync(editorDir, { recursive: true });
    }
    this.persistPath = join(editorDir, 'xmap.json');
    console.log('[MapStore] Persist path:', this.persistPath);
    this.load();
  }
  
  /**
   * Add or update an entry in the map
   */
  set(entry: XMapEntry) {
    this.map[entry.xid] = entry;
  }
  
  /**
   * Get an entry by XID
   */
  get(xid: string): XMapEntry | undefined {
    return this.map[xid];
  }
  
  /**
   * Get all entries
   */
  getAll(): XMap {
    return { ...this.map };
  }
  
  /**
   * Clear all entries for a specific file
   */
  clearFile(filePath: string) {
    for (const [xid, entry] of Object.entries(this.map)) {
      if (entry.file === filePath) {
        delete this.map[xid];
      }
    }
  }
  
  /**
   * Persist the map to disk
   */
  persist() {
    try {
      writeFileSync(this.persistPath, JSON.stringify(this.map, null, 2));
      console.log(`[MapStore] Persisted ${Object.keys(this.map).length} entries`);
    } catch (error) {
      console.error('[MapStore] Failed to persist:', error);
    }
  }
  
  /**
   * Load the map from disk
   */
  private load() {
    if (existsSync(this.persistPath)) {
      try {
        const content = readFileSync(this.persistPath, 'utf-8');
        this.map = JSON.parse(content);
        console.log(`[MapStore] Loaded ${Object.keys(this.map).length} entries`);
      } catch (error) {
        console.error('[MapStore] Failed to load:', error);
        this.map = {};
      }
    }
  }
  
  /**
   * Clear all entries
   */
  clear() {
    this.map = {};
  }
}