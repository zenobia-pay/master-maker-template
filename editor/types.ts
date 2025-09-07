export interface XMapEntry {
  xid: string;
  file: string;
  astPath: string;
  componentType?: string;
  loc: {
    start: { line: number; column: number };
    end: { line: number; column: number };
  };
}

export interface XMap {
  [xid: string]: XMapEntry;
}

export type EditOperation = 
  | { type: 'setText'; xid: string; text: string }
  | { type: 'setProp'; xid: string; name: string; value: any }
  | { type: 'moveChild'; parentXid: string; from: number; to: number }
  | { type: 'remove'; xid: string }
  | { type: 'insert'; parentXid: string; position: number; element: ElementSpec };

export interface ElementSpec {
  component: string;
  props?: Record<string, any>;
  children?: (string | ElementSpec)[];
}

export interface EditableManifest {
  [componentName: string]: {
    [propName: string]: 'string' | 'number' | 'boolean' | 'url' | 'color';
  };
}