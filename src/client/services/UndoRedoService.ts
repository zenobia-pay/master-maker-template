interface Action {
  undo: () => void;
  redo: () => void;
}

export class UndoRedoService {
  private undoStack: Action[] = [];
  private redoStack: Action[] = [];
  private maxStackSize = 100;

  pushAction(action: Action) {
    this.undoStack.push(action);
    this.redoStack = [];

    if (this.undoStack.length > this.maxStackSize) {
      this.undoStack.shift();
    }
  }

  undo() {
    const action = this.undoStack.pop();
    if (!action) return;

    action.undo();
    this.redoStack.push(action);
  }

  redo() {
    const action = this.redoStack.pop();
    if (!action) return;

    action.redo();
    this.undoStack.push(action);
  }

  canUndo(): boolean {
    return this.undoStack.length > 0;
  }

  canRedo(): boolean {
    return this.redoStack.length > 0;
  }

  clear() {
    this.undoStack = [];
    this.redoStack = [];
  }
}
