
import React from 'react';
import { MagicWandIcon, GithubIcon } from './IconComponents';

export const Header: React.FC = () => {
  return (
    <header className="glass-effect sticky top-0 z-50 border-b border-primary/20">
      <div className="container mx-auto px-4 md:px-8 py-6">
        <div className="flex items-center justify-between">
          {/* Developer Button */}
          <div className="animate-slide-in-left">
            <a
              href="https://github.com/Haseebasif7"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center space-x-2 bg-gray-800/50 hover:bg-gray-700/50 backdrop-blur-sm border border-gray-600/50 hover:border-cyan-400/50 rounded-lg px-4 py-2 transition-all duration-300 hover:scale-105"
              aria-label="Visit Haseeb Asif's GitHub profile"
            >
              <GithubIcon className="w-5 h-5 text-gray-400 group-hover:text-cyan-400 transition-colors" />
              <span className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">
                Developer
              </span>
            </a>
          </div>

          {/* Center Logo */}
          <div className="flex items-center space-x-4 animate-slide-in-up">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full blur-lg opacity-30 animate-pulse-glow"></div>
              <MagicWandIcon className="relative w-10 h-10 text-cyan-400 animate-float" />
            </div>
            <div className="text-center">
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight gradient-text">
                AuraSync
              </h1>
              <p className="text-sm md:text-base text-secondary/80 font-medium" style={{ animationDelay: '0.2s' }}>
                Your Vision. Your Space. Instantly.
              </p>
            </div>
          </div>

          {/* Right side spacer for balance */}
          <div className="w-24"></div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
          <div className="absolute top-4 left-1/4 w-2 h-2 bg-cyan-400/30 rounded-full animate-pulse"></div>
          <div className="absolute top-8 right-1/3 w-1 h-1 bg-purple-500/40 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-6 right-1/4 w-1.5 h-1.5 bg-pink-500/30 rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>
      </div>
    </header>
  );
};
