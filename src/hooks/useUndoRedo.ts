import { useCallback, useReducer } from 'react';

interface UndoRedoState<T> {
  past: T[];
  present: T;
  future: T[];
}

type UndoRedoAction<T> =
  | { type: 'SET'; payload: T }
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'CLEAR_HISTORY' };

const undoRedoReducer = <T>(state: UndoRedoState<T>, action: UndoRedoAction<T>): UndoRedoState<T> => {
  switch (action.type) {
    case 'SET': {
      const { payload } = action;
      
      // Don't add to history if the state hasn't actually changed
      if (JSON.stringify(state.present) === JSON.stringify(payload)) {
        return state;
      }

      return {
        past: [...state.past, state.present],
        present: payload,
        future: [], // Clear future when new action is performed
      };
    }
    
    case 'UNDO': {
      if (state.past.length === 0) return state;
      
      const previous = state.past[state.past.length - 1];
      const newPast = state.past.slice(0, state.past.length - 1);
      
      return {
        past: newPast,
        present: previous,
        future: [state.present, ...state.future],
      };
    }
    
    case 'REDO': {
      if (state.future.length === 0) return state;
      
      const next = state.future[0];
      const newFuture = state.future.slice(1);
      
      return {
        past: [...state.past, state.present],
        present: next,
        future: newFuture,
      };
    }
    
    case 'CLEAR_HISTORY': {
      return {
        past: [],
        present: state.present,
        future: [],
      };
    }
    
    default:
      return state;
  }
};

export const useUndoRedo = <T>(initialState: T) => {
  const [state, dispatch] = useReducer(undoRedoReducer<T>, {
    past: [],
    present: initialState,
    future: [],
  });

  const set = useCallback((newState: T) => {
    dispatch({ type: 'SET', payload: newState });
  }, []);

  const undo = useCallback(() => {
    dispatch({ type: 'UNDO' });
  }, []);

  const redo = useCallback(() => {
    dispatch({ type: 'REDO' });
  }, []);

  const clearHistory = useCallback(() => {
    dispatch({ type: 'CLEAR_HISTORY' });
  }, []);

  return {
    state: state.present,
    canUndo: state.past.length > 0,
    canRedo: state.future.length > 0,
    undo,
    redo,
    set,
    clearHistory,
  };
};