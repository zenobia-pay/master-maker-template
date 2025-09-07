import type { ViteDevServer } from 'vite';
import { parse } from '@babel/parser';
import _traverse from '@babel/traverse';
import _generate from '@babel/generator';
import * as t from '@babel/types';

// Handle ESM/CJS compatibility
const traverse = (_traverse as any).default || _traverse;
const generate = (_generate as any).default || _generate;
import { relative } from 'path';
import MagicString from 'magic-string';
import { MapStore } from './mapStore';
import { generateXid, AstPathBuilder } from './idGenerator';
import type { XMapEntry } from './types';

let mapStore: MapStore;
let server: ViteDevServer;

export function editorPlugin(): any {
  console.log('[EditorPlugin] Plugin initialized');
  return {
    name: 'vite-plugin-editor',
    enforce: 'pre',
    
    configureServer(_server) {
      console.log('[EditorPlugin] Configuring server');
      server = _server;
      mapStore = new MapStore(server.config.root);
      
      // Expose the xmap endpoint
      server.middlewares.use('/__xmap', (req, res) => {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(mapStore.getAll()));
      });
      
      // Save endpoint for mutations (we'll implement this later)
      server.middlewares.use('/__save', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.end('Method not allowed');
          return;
        }
        
        // TODO: Implement save operations
        res.statusCode = 501;
        res.end('Not implemented yet');
      });
    },
    
    transform(code: string, id: string) {
      // Only process TSX/JSX files in dev mode
      if (!id.match(/\.[jt]sx$/)) return null;
      if (!server || server.config.mode !== 'development') return null;
      
      const relPath = relative(server.config.root, id);
      
      console.log(`[EditorPlugin] Processing ${relPath}`);
      
      // Skip node_modules and editor files
      if (relPath.includes('node_modules') || relPath.includes('editor/')) {
        console.log(`[EditorPlugin] Skipping ${relPath} (excluded path)`);
        return null;
      }
      
      try {
        // Parse the TSX file
        const ast = parse(code, {
          sourceType: 'module',
          plugins: ['typescript', 'jsx'],
        });
        
        // Clear existing entries for this file
        mapStore.clearFile(relPath);
        
        const pathBuilder = new AstPathBuilder();
        let modified = false;
        
        // Traverse and inject data-xid attributes
        traverse(ast, {
          enter(path) {
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
          
          exit(path) {
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
          
          // Persist the map
          mapStore.persist();
          
          return {
            code: output.code,
            map: output.map,
          };
        }
      } catch (error) {
        console.error(`[EditorPlugin] Error processing ${id}:`, error);
      }
      
      return null;
    },
  };
}