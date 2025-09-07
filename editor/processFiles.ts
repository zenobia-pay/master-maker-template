import { parse } from '@babel/parser';
import _traverse from '@babel/traverse';
import _generate from '@babel/generator';
import * as t from '@babel/types';
import { readFileSync, writeFileSync } from 'fs';
import { relative, join } from 'path';
import { glob } from 'glob';
import { MapStore } from './mapStore';
import { generateXid, AstPathBuilder } from './idGenerator';
import type { XMapEntry } from './types';

// Handle ESM/CJS compatibility
const traverse = (_traverse as any).default || _traverse;
const generate = (_generate as any).default || _generate;

export class TSXProcessor {
  private mapStore: MapStore;
  private rootDir: string;

  constructor(rootDir: string) {
    this.rootDir = rootDir;
    this.mapStore = new MapStore(rootDir);
  }

  async processAllFiles() {
    console.log('[TSXProcessor] Starting to process all TSX files...');
    
    // Find all TSX files in src/client
    const pattern = join(this.rootDir, 'src/client/**/*.{tsx,jsx}');
    const files = await glob(pattern);
    
    console.log(`[TSXProcessor] Found ${files.length} files to process`);
    
    for (const file of files) {
      await this.processFile(file);
    }
    
    // Persist the map after processing all files
    this.mapStore.persist();
    console.log('[TSXProcessor] Processing complete');
  }

  private async processFile(filePath: string) {
    const relPath = relative(this.rootDir, filePath);
    console.log(`[TSXProcessor] Processing ${relPath}`);
    
    try {
      // Read the file
      const code = readFileSync(filePath, 'utf-8');
      
      // Parse the TSX file
      const ast = parse(code, {
        sourceType: 'module',
        plugins: ['typescript', 'jsx'],
      });
      
      // Clear existing entries for this file
      this.mapStore.clearFile(relPath);
      
      const pathBuilder = new AstPathBuilder();
      let modified = false;
      
      // Capture this reference for use in callbacks
      const mapStore = this.mapStore;
      
      // Traverse and inject data-xid attributes
      traverse(ast, {
        enter(path: any) {
          // Track the path indices
          const key = path.key;
          if (typeof key === 'number') {
            pathBuilder.push(key);
          }
          
          // Only process JSX elements
          if (!t.isJSXElement(path.node) && !t.isJSXFragment(path.node)) {
            return;
          }
          
          // Skip fragments for now
          if (t.isJSXFragment(path.node)) {
            return;
          }
          
          const element = path.node as t.JSXElement;
          const openingElement = element.openingElement;
          
          // Generate deterministic ID
          const astPath = pathBuilder.current();
          const xid = generateXid(relPath, astPath);
          
          // Check if data-xid already exists
          const hasXid = openingElement.attributes.some(
            attr => t.isJSXAttribute(attr) && 
                   t.isJSXIdentifier(attr.name) && 
                   attr.name.name === 'data-xid'
          );
          
          if (!hasXid) {
            // Add data-xid attribute
            const xidAttr = t.jsxAttribute(
              t.jsxIdentifier('data-xid'),
              t.stringLiteral(xid)
            );
            openingElement.attributes.push(xidAttr);
            modified = true;
          }
          
          // Get component name
          let componentType = 'unknown';
          if (t.isJSXIdentifier(openingElement.name)) {
            componentType = openingElement.name.name;
          } else if (t.isJSXMemberExpression(openingElement.name)) {
            componentType = generate(openingElement.name).code;
          }
          
          // Store in map
          const entry: XMapEntry = {
            xid,
            file: relPath,
            astPath: astPath.join('.'),
            componentType,
            loc: {
              start: {
                line: element.loc?.start.line || 0,
                column: element.loc?.start.column || 0,
              },
              end: {
                line: element.loc?.end.line || 0,
                column: element.loc?.end.column || 0,
              },
            },
          };
          
          mapStore.set(entry);
        },
        
        exit(path: any) {
          const key = path.key;
          if (typeof key === 'number') {
            pathBuilder.pop();
          }
        },
      });
      
      if (modified) {
        // Generate the modified code
        const output = generate(ast, {
          retainLines: true,
          retainFunctionParens: true,
          compact: false,
        });
        
        // Write the modified file back
        writeFileSync(filePath, output.code);
        console.log(`[TSXProcessor] Modified ${relPath} with ${this.getFileEntryCount(relPath)} elements`);
      } else {
        console.log(`[TSXProcessor] No changes needed for ${relPath}`);
      }
    } catch (error) {
      console.error(`[TSXProcessor] Error processing ${filePath}:`, error);
    }
  }

  private getFileEntryCount(filePath: string): number {
    const allEntries = this.mapStore.getAll();
    return Object.values(allEntries).filter(entry => entry.file === filePath).length;
  }

  getXMap() {
    return this.mapStore.getAll();
  }
}

// If run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const processor = new TSXProcessor(process.cwd());
  processor.processAllFiles().catch(console.error);
}