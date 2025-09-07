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
import { promises as fs } from 'fs';
import { join } from 'path';

let mapStore: MapStore;
let server: ViteDevServer;

async function saveTextChange(change: { xid: string; newText: string }, mapStore: MapStore) {
  console.log('[EditorPlugin] Processing text change for xid:', change.xid);
  
  // Get the element info from the map
  const elementInfo = mapStore.get(change.xid);
  if (!elementInfo) {
    throw new Error(`Element with xid ${change.xid} not found in map`);
  }

  // Get the absolute file path
  const templateRoot = server.config.root.includes('src/client') 
    ? server.config.root.replace('/src/client', '') 
    : server.config.root;
  const filePath = join(templateRoot, elementInfo.file);

  console.log('[EditorPlugin] Updating file:', filePath);
  console.log('[EditorPlugin] Element location:', elementInfo.loc);
  console.log('[EditorPlugin] New text:', change.newText);

  // Read the current file content
  const fileContent = await fs.readFile(filePath, 'utf-8');
  
  // Parse the file with Babel
  const ast = parse(fileContent, {
    sourceType: 'module',
    plugins: ['typescript', 'jsx'],
  });

  // Find the element by xid and update its text content
  let elementFound = false;
  traverse(ast, {
    JSXElement(path) {
      const openingElement = path.node.openingElement;
      
      // Check if this element has the matching xid
      const xidAttr = openingElement.attributes.find(
        attr => t.isJSXAttribute(attr) && 
               t.isJSXIdentifier(attr.name) && 
               attr.name.name === 'data-xid' &&
               t.isStringLiteral(attr.value) &&
               attr.value.value === change.xid
      );
      
      if (xidAttr) {
        elementFound = true;
        console.log('[EditorPlugin] Found element with xid:', change.xid);
        
        // Update text content - find first text child
        const textChild = path.node.children.find(child => t.isJSXText(child));
        if (textChild && t.isJSXText(textChild)) {
          textChild.value = change.newText;
          console.log('[EditorPlugin] Updated text content to:', change.newText);
        } else {
          // If no text child exists, create one
          const newTextNode = t.jsxText(change.newText);
          path.node.children = [newTextNode];
          console.log('[EditorPlugin] Created new text child:', change.newText);
        }
      }
    }
  });

  if (!elementFound) {
    throw new Error(`Element with xid ${change.xid} not found in AST`);
  }

  // Generate the updated code
  const output = generate(ast, {
    retainLines: true,
    retainFunctionParens: true,
    compact: false,
  });

  // Write the updated content back to the file
  await fs.writeFile(filePath, output.code, 'utf-8');
  console.log('[EditorPlugin] Successfully updated file:', filePath);

  return {
    xid: change.xid,
    file: elementInfo.file,
    success: true
  };
}

export function editorPlugin(): any {
  console.log('[EditorPlugin] Plugin initialized');
  return {
    name: 'vite-plugin-editor',
    enforce: 'pre',
    
    configureServer(_server) {
      console.log('[EditorPlugin] Configuring server');
      server = _server;
      // Use the template root directory, not the src/client root
      const templateRoot = server.config.root.includes('src/client') 
        ? server.config.root.replace('/src/client', '') 
        : server.config.root;
      mapStore = new MapStore(templateRoot);
      
      // Expose the xmap endpoint
      server.middlewares.use('/__xmap', (req, res) => {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(mapStore.getAll()));
      });
      
      // Serve the overlay script
      server.middlewares.use('/__editor-overlay.js', async (req, res) => {
        const fs = await import('fs');
        const path = await import('path');
        const overlayPath = '/Users/ryanprendergast/Documents/master-maker/template/editor/overlay.js';
        
        try {
          // Read the JavaScript overlay file
          const overlayContent = fs.readFileSync(overlayPath, 'utf-8');
          
          res.setHeader('Content-Type', 'application/javascript');
          res.end(overlayContent);
        } catch (error) {
          console.error('[EditorPlugin] Error serving overlay:', error);
          res.statusCode = 404;
          res.end('Overlay script not found');
        }
      });
      
      // Save endpoint for mutations
      server.middlewares.use('/__save', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.end('Method not allowed');
          return;
        }
        
        try {
          // Parse the request body
          let body = '';
          req.on('data', (chunk) => {
            body += chunk.toString();
          });
          
          req.on('end', async () => {
            try {
              const changes = JSON.parse(body);
              console.log('[EditorPlugin] Received save request:', changes);
              
              // Process each change
              const results = [];
              for (const change of changes) {
                const result = await saveTextChange(change, mapStore);
                results.push(result);
              }
              
              res.setHeader('Content-Type', 'application/json');
              res.statusCode = 200;
              res.end(JSON.stringify({ success: true, results }));
            } catch (error) {
              console.error('[EditorPlugin] Error processing save:', error);
              res.statusCode = 500;
              res.end(JSON.stringify({ error: error.message }));
            }
          });
          
        } catch (error) {
          console.error('[EditorPlugin] Error in save endpoint:', error);
          res.statusCode = 500;
          res.end(JSON.stringify({ error: error.message }));
        }
      });
    },
    
    transform(code: string, id: string) {
      if (!server || server.config.mode !== 'development') return null;
      
      // Inject overlay script into HTML files
      if (id.endsWith('.html')) {
        const injectedCode = code.replace(
          '</head>',
          `  <script type="module" src="/__editor-overlay.js"></script>\n  </head>`
        );
        return injectedCode !== code ? { code: injectedCode } : null;
      }
      
      // Only process TSX/JSX files
      if (!id.match(/\.[jt]sx$/)) return null;
      
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