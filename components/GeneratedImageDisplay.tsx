
import React, { useState, useEffect } from 'react';
import { MagicWandIcon, DownloadIcon, EyeIcon, XMarkIcon, ShareIcon } from './IconComponents';

interface GeneratedImageDisplayProps {
  image: string | null;
  isLoading: boolean;
}

// Download functionality
const downloadImage = (imageData: string, filename: string = 'aura-design') => {
  const link = document.createElement('a');
  link.href = imageData;
  link.download = `${filename}-${new Date().toISOString().slice(0, 10)}.png`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Share functionality
const shareImage = async (imageData: string) => {
  if (navigator.share) {
    try {
      const response = await fetch(imageData);
      const blob = await response.blob();
      const file = new File([blob], 'aura-design.png', { type: 'image/png' });
      await navigator.share({
        title: 'My AuraSync Design',
        text: 'Check out this design I created with AuraSync!',
        files: [file]
      });
    } catch (error) {
      console.log('Error sharing:', error);
      // Fallback to copy to clipboard
      copyToClipboard(imageData);
    }
  } else {
    copyToClipboard(imageData);
  }
};

const copyToClipboard = async (imageData: string) => {
  try {
    const response = await fetch(imageData);
    const blob = await response.blob();
    await navigator.clipboard.write([
      new ClipboardItem({ 'image/png': blob })
    ]);
    // You could show a toast notification here
  } catch (error) {
    console.log('Error copying to clipboard:', error);
  }
};

const LoadingMessage: React.FC = () => {
  const messages = [
    "Crafting your vision...",
    "Polishing the pixels...",
    "Syncing auras...",
    "Compositing reality...",
    "Rendering your design...",
    "Adding magical touches...",
    "Finalizing your masterpiece...",
  ];
  const [message, setMessage] = useState(messages[0]);
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setMessageIndex(prev => (prev + 1) % messages.length);
    }, 2000);

    return () => clearInterval(intervalId);
  }, [messages.length]);

  useEffect(() => {
    setMessage(messages[messageIndex]);
  }, [messageIndex, messages]);

  return (
    <div className="flex flex-col items-center justify-center text-center p-8">
      <div className="relative mb-6">
        <div className="w-16 h-16 border-4 border-cyan-400/30 rounded-full"></div>
        <div className="absolute inset-0 w-16 h-16 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
        <div className="absolute inset-2 w-12 h-12 border-2 border-purple-400 border-b-transparent rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
      </div>
      <p className="text-lg font-semibold text-gray-300 mb-2 animate-fade-in">{message}</p>
      <div className="flex space-x-1">
        <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"></div>
        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
        <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
      </div>
    </div>
  );
};

const ImageModal: React.FC<{ image: string; onClose: () => void }> = ({ image, onClose }) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="relative max-w-7xl max-h-full">
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors z-10"
          aria-label="Close modal"
        >
          <XMarkIcon className="w-8 h-8" />
        </button>
        
        <div className="relative bg-gray-900 rounded-2xl overflow-hidden shadow-2xl">
          <img 
            src={image} 
            alt="Generated design - full view" 
            className="max-w-full max-h-[90vh] object-contain"
          />
          
          {/* Action buttons */}
          <div className="absolute bottom-4 right-4 flex space-x-2">
            <button
              onClick={() => downloadImage(image)}
              className="bg-cyan-600 hover:bg-cyan-500 text-white p-3 rounded-lg shadow-lg transition-all duration-200 hover:scale-105 flex items-center space-x-2"
              title="Download image"
            >
              <DownloadIcon className="w-5 h-5" />
              <span className="hidden sm:inline">Download</span>
            </button>
            <button
              onClick={() => shareImage(image)}
              className="bg-purple-600 hover:bg-purple-500 text-white p-3 rounded-lg shadow-lg transition-all duration-200 hover:scale-105 flex items-center space-x-2"
              title="Share image"
            >
              <ShareIcon className="w-5 h-5" />
              <span className="hidden sm:inline">Share</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const GeneratedImageDisplay: React.FC<GeneratedImageDisplayProps> = ({ image, isLoading }) => {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <div className="card hover-lift transition-all duration-300">
        <div className="aspect-video w-full bg-gray-900/30 rounded-xl flex items-center justify-center border-2 border-gray-600/50 overflow-hidden relative group">
          {isLoading ? (
            <LoadingMessage />
          ) : image ? (
            <>
              <img 
                src={image} 
                alt="Generated design" 
                className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105" 
              />
              
              {/* Overlay with actions */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300"></div>
              
              {/* Action buttons */}
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                <div className="flex space-x-2">
                  <button
                    onClick={() => setShowModal(true)}
                    className="bg-white/90 hover:bg-white text-gray-900 p-2 rounded-lg shadow-lg transition-all duration-200 hover:scale-105"
                    title="View full size"
                    aria-label="View full size"
                  >
                    <EyeIcon className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => downloadImage(image)}
                    className="bg-cyan-600 hover:bg-cyan-500 text-white p-2 rounded-lg shadow-lg transition-all duration-200 hover:scale-105"
                    title="Download image"
                    aria-label="Download image"
                  >
                    <DownloadIcon className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => shareImage(image)}
                    className="bg-purple-600 hover:bg-purple-500 text-white p-2 rounded-lg shadow-lg transition-all duration-200 hover:scale-105"
                    title="Share image"
                    aria-label="Share image"
                  >
                    <ShareIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              {/* Success indicator */}
              <div className="absolute top-4 left-4 bg-green-500/90 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                <span>Generated</span>
              </div>
            </>
          ) : (
            <div className="text-center text-gray-500 p-8 animate-fade-in">
              <div className="relative mb-6">
                <MagicWandIcon className="w-20 h-20 mx-auto text-gray-600 animate-float" />
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 to-purple-500/20 rounded-full blur-xl"></div>
              </div>
              <h3 className="text-xl font-semibold text-gray-400 mb-2">Your Personalized Design Awaits</h3>
              <p className="text-gray-500 max-w-md mx-auto">
                Upload your images, describe your vision, and watch as AI transforms your space into something extraordinary.
              </p>
            </div>
          )}
        </div>
        
        {/* Image info */}
        {image && (
          <div className="mt-4 flex items-center justify-between text-sm text-gray-400">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span>Design ready</span>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowModal(true)}
                className="text-cyan-400 hover:text-cyan-300 transition-colors flex items-center space-x-1"
              >
                <EyeIcon className="w-4 h-4" />
                <span>View full size</span>
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Modal */}
      {showModal && image && (
        <ImageModal image={image} onClose={() => setShowModal(false)} />
      )}
    </>
  );
};
