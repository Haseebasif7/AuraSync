import React, { useState, useRef, useEffect } from 'react';
import { ArrowRightIcon, SparklesIcon } from './IconComponents';

interface PromptInputProps {
  prompt: string;
  onPromptChange: (prompt: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
  placeholder: string;
}

export const PromptInput: React.FC<PromptInputProps> = ({ prompt, onPromptChange, onSubmit, isLoading, placeholder }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [charCount, setCharCount] = useState(0);

  useEffect(() => {
    setCharCount(prompt.length);
  }, [prompt]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      if (!isLoading && prompt.trim()) {
        onSubmit();
      }
    }
  };

  const handleSubmit = () => {
    if (!isLoading && prompt.trim()) {
      onSubmit();
    }
  };

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [prompt]);

  return (
    <div className="space-y-4">
      {/* Prompt Input Container */}
      <div className="relative group">
        <div className={`relative transition-all duration-300 ${
          isFocused ? 'scale-[1.02]' : ''
        }`}>
          {/* Glow effect when focused */}
          {isFocused && (
            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400/20 to-purple-500/20 rounded-xl blur-sm"></div>
          )}
          
          <div className="relative bg-gray-900/50 backdrop-blur-sm border border-gray-600/50 rounded-xl overflow-hidden hover:border-cyan-400/50 transition-all duration-300">
            <textarea
              ref={textareaRef}
              value={prompt}
              onChange={(e) => onPromptChange(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder={placeholder}
              rows={3}
              className="w-full bg-transparent border-none outline-none p-4 pr-20 text-white placeholder-gray-400 resize-none transition-all duration-300"
              disabled={isLoading}
              style={{ minHeight: '80px' }}
            />
            
            {/* Character count */}
            <div className="absolute bottom-2 left-4 text-xs text-gray-500">
              {charCount > 0 && (
                <span className={charCount > 500 ? 'text-yellow-400' : 'text-gray-500'}>
                  {charCount}/1000
                </span>
              )}
            </div>
            
            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={isLoading || !prompt.trim()}
              className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-12 h-12 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-lg font-semibold hover:from-cyan-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 group hover:scale-105 shadow-lg"
              aria-label="Generate design"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <div className="flex items-center space-x-1">
                  <SparklesIcon className="w-5 h-5 group-hover:rotate-12 transition-transform duration-200" />
                  <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
                </div>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Helper Text */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center space-x-4 text-gray-400">
          <span className="flex items-center space-x-1">
            <kbd className="px-2 py-1 bg-gray-700 rounded text-xs">Enter</kbd>
            <span>to generate</span>
          </span>
          <span className="flex items-center space-x-1">
            <kbd className="px-2 py-1 bg-gray-700 rounded text-xs">Shift + Enter</kbd>
            <span>for new line</span>
          </span>
        </div>
        
        {prompt.trim() && (
          <div className="flex items-center space-x-2 text-cyan-400">
            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
            <span className="text-xs font-medium">Ready to generate</span>
          </div>
        )}
      </div>

      {/* Loading State Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-black/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
          <div className="flex items-center space-x-3 text-cyan-400">
            <div className="spinner"></div>
            <span className="text-sm font-medium">Crafting your vision...</span>
          </div>
        </div>
      )}
    </div>
  );
};