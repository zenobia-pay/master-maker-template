import { createHash } from 'crypto';

/**
 * Generate a deterministic ID for an AST node
 * @param filePath - Relative path to the file
 * @param astPath - Array of indices from root to node (e.g., [0, 2, 5])
 * @returns 8-character base64url ID
 */
export function generateXid(filePath: string, astPath: number[]): string {
  const pathString = `${filePath}:${astPath.join('.')}`;
  const hash = createHash('sha1').update(pathString).digest('base64url');
  return hash.slice(0, 8);
}

/**
 * Build the AST path as we traverse the tree
 */
export class AstPathBuilder {
  private path: number[] = [];
  
  push(index: number) {
    this.path.push(index);
  }
  
  pop() {
    this.path.pop();
  }
  
  current(): number[] {
    return [...this.path];
  }
  
  toString(): string {
    return this.path.join('.');
  }
}