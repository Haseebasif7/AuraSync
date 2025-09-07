import React, { useState, useCallback } from 'react';
import { UndoIcon, RedoIcon, HistoryIcon } from './IconComponents';

interface HistoryState {
  id: string;
  timestamp: number;
  generatedImage: string | null;
  prompt: string;
  roomImage: string | null;
  products: Array<{
    id: string;
    image: string | null;
    isGenerating: boolean;
  }>;
  isInitialGeneration: boolean;
}

interface HistoryManagerProps {
  currentState: {
    generatedImage: string | null;
    prompt: string;
    roomImage: string | null;
    products: Array<{
      id: string;
      image: string | null;
      isGenerating: boolean;
    }>;
    isInitialGeneration: boolean;
  };
  onStateRestore: (state: HistoryState) => void;
  maxHistorySize?: number;
}

export const useHistoryManager = ({
  currentState,
  onStateRestore,
  maxHistorySize = 3
}: HistoryManagerProps) => {
  const [history, setHistory] = useState<HistoryState[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);

  // Save current state to history
  const saveToHistory = useCallback(() => {
    if (!currentState.generatedImage) return; // Only save states with generated images

    const newState: HistoryState = {
      id: `state-${Date.now()}`,
      timestamp: Date.now(),
      generatedImage: currentState.generatedImage,
      prompt: currentState.prompt,
      roomImage: currentState.roomImage,
      products: currentState.products.map(p => ({ ...p })),
      isInitialGeneration: currentState.isInitialGeneration
    };

    setHistory(prev => {
      const newHistory = [...prev];
      
      // Remove any states after current index (when branching from history)
      if (currentIndex >= 0) {
        newHistory.splice(currentIndex + 1);
      }
      
      // Add new state
      newHistory.push(newState);
      
      // Limit history size
      if (newHistory.length > maxHistorySize) {
        newHistory.shift();
      }
      
      setCurrentIndex(newHistory.length - 1);
      return newHistory;
    });
  }, [currentState, currentIndex, maxHistorySize]);

  // Undo to previous state
  const undo = useCallback(() => {
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1;
      setCurrentIndex(newIndex);
      onStateRestore(history[newIndex]);
    }
  }, [currentIndex, history, onStateRestore]);

  // Redo to next state
  const redo = useCallback(() => {
    if (currentIndex < history.length - 1) {
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      onStateRestore(history[newIndex]);
    }
  }, [currentIndex, history, onStateRestore]);

  // Clear history
  const clearHistory = useCallback(() => {
    setHistory([]);
    setCurrentIndex(-1);
  }, []);

  const canUndo = currentIndex > 0;
  const canRedo = currentIndex < history.length - 1;
  const hasHistory = history.length > 0;

  return {
    saveToHistory,
    undo,
    redo,
    clearHistory,
    canUndo,
    canRedo,
    hasHistory,
    historyLength: history.length,
    currentIndex
  };
};

// History Controls Component
interface HistoryControlsProps {
  canUndo: boolean;
  canRedo: boolean;
  hasHistory: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onClearHistory: () => void;
  historyLength: number;
}

export const HistoryControls: React.FC<HistoryControlsProps> = ({
  canUndo,
  canRedo,
  hasHistory,
  onUndo,
  onRedo,
  onClearHistory,
  historyLength
}) => {
  // Show history controls even when there's no history to inform users about the feature
  // if (!hasHistory) return null;

  return (
    <div className="flex items-center space-x-2 animate-slide-in-up">
      {/* History indicator */}
      <div className="flex items-center space-x-2 bg-gray-800/50 backdrop-blur-sm border border-gray-600/50 rounded-lg px-3 py-2">
        <HistoryIcon className="w-4 h-4 text-gray-400" />
        <span className="text-xs text-gray-400 font-medium">
          {hasHistory ? `${historyLength} saved` : 'History will appear here'}
        </span>
      </div>

      {/* Undo Button */}
      <button
        onClick={onUndo}
        disabled={!canUndo}
        className={`group flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 ${
          canUndo
            ? 'bg-gray-800/50 hover:bg-gray-700/50 border border-gray-600/50 hover:border-cyan-400/50 text-gray-300 hover:text-white hover:scale-105'
            : 'bg-gray-800/30 border border-gray-700/30 text-gray-500 cursor-not-allowed'
        }`}
        title={canUndo ? 'Undo to previous state' : 'No previous state available'}
        aria-label="Undo to previous state"
      >
        <UndoIcon className={`w-4 h-4 transition-colors ${
          canUndo ? 'text-gray-400 group-hover:text-cyan-400' : 'text-gray-600'
        }`} />
        <span className="text-sm font-medium">Undo</span>
      </button>

      {/* Redo Button */}
      <button
        onClick={onRedo}
        disabled={!canRedo}
        className={`group flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 ${
          canRedo
            ? 'bg-gray-800/50 hover:bg-gray-700/50 border border-gray-600/50 hover:border-cyan-400/50 text-gray-300 hover:text-white hover:scale-105'
            : 'bg-gray-800/30 border border-gray-700/30 text-gray-500 cursor-not-allowed'
        }`}
        title={canRedo ? 'Redo to next state' : 'No next state available'}
        aria-label="Redo to next state"
      >
        <RedoIcon className={`w-4 h-4 transition-colors ${
          canRedo ? 'text-gray-400 group-hover:text-cyan-400' : 'text-gray-600'
        }`} />
        <span className="text-sm font-medium">Redo</span>
      </button>

      {/* Clear History Button */}
      <button
        onClick={onClearHistory}
        disabled={!hasHistory}
        className={`group flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 ${
          hasHistory
            ? 'bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/40 text-red-400 hover:text-red-300 hover:scale-105'
            : 'bg-gray-800/30 border border-gray-700/30 text-gray-500 cursor-not-allowed'
        }`}
        title={hasHistory ? "Clear all history" : "No history to clear"}
        aria-label="Clear all history"
      >
        <span className="text-sm font-medium">Clear</span>
      </button>
    </div>
  );
};
