import React, { useState, useEffect } from 'react';
import { SparklesIcon } from './IconComponents';

interface LoadingProgressProps {
  progress: number;
  status: string;
  isVisible: boolean;
}

export const LoadingProgress: React.FC<LoadingProgressProps> = ({
  progress,
  status,
  isVisible
}) => {
  const [displayProgress, setDisplayProgress] = useState(0);
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; delay: number }>>([]);

  useEffect(() => {
    if (isVisible) {
      // Animate progress bar
      const timer = setTimeout(() => {
        setDisplayProgress(progress);
      }, 100);
      return () => clearTimeout(timer);
    } else {
      setDisplayProgress(0);
    }
  }, [progress, isVisible]);

  useEffect(() => {
    if (isVisible) {
      // Generate floating particles
      const newParticles = Array.from({ length: 20 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        delay: Math.random() * 2
      }));
      setParticles(newParticles);
    }
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
      {/* Background particles */}
      <div className="absolute inset-0 overflow-hidden">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute w-1 h-1 bg-cyan-400/30 rounded-full animate-pulse"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              animationDelay: `${particle.delay}s`,
              animationDuration: '3s'
            }}
          />
        ))}
      </div>

      <div className="relative bg-gray-900/95 backdrop-blur-md rounded-2xl p-8 max-w-lg w-full mx-4 border border-gray-700/50 shadow-2xl">
        {/* Glow effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400/20 to-purple-500/20 rounded-2xl blur-sm"></div>
        
        <div className="relative text-center">
          {/* Animated spinner */}
          <div className="w-20 h-20 mx-auto mb-6 relative">
            <div className="absolute inset-0 w-20 h-20 border-4 border-gray-600/30 rounded-full"></div>
            <div className="absolute inset-0 w-20 h-20 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
            <div className="absolute inset-2 w-16 h-16 border-2 border-purple-400 border-b-transparent rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
            <div className="absolute inset-4 w-12 h-12 border-2 border-pink-400 border-r-transparent rounded-full animate-spin" style={{ animationDuration: '2s' }}></div>
            
            {/* Center sparkle */}
            <div className="absolute inset-0 flex items-center justify-center">
              <SparklesIcon className="w-8 h-8 text-cyan-400 animate-pulse" />
            </div>
          </div>
          
          <h3 className="text-2xl font-bold text-white mb-2 gradient-text">Crafting Your Vision</h3>
          <p className="text-gray-300 text-lg mb-6 animate-fade-in">{status}</p>
          
          {/* Progress bar */}
          <div className="relative mb-4">
            <div className="w-full bg-gray-700/50 rounded-full h-3 overflow-hidden">
              <div 
                className="progress-fill h-3 rounded-full relative"
                style={{ width: `${Math.min(displayProgress, 100)}%` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 rounded-full"></div>
                <div className="absolute inset-0 bg-white/20 rounded-full animate-shimmer"></div>
              </div>
            </div>
            
            {/* Progress percentage */}
            <div className="absolute -top-8 right-0 text-sm font-semibold text-cyan-400">
              {Math.round(displayProgress)}%
            </div>
          </div>
          
          {/* Status dots */}
          <div className="flex justify-center space-x-2">
            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
          
          {/* Tips */}
          <div className="mt-6 text-sm text-gray-400">
            <p>✨ AI is analyzing your images and prompt</p>
            <p className="mt-1">🎨 Creating a personalized design just for you</p>
          </div>
        </div>
      </div>
    </div>
  );
};
