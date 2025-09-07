import React, { useState, useRef, useEffect, useCallback } from 'react';
import { fileToBase64 } from '../utils/fileUtils';
import { SparklesIcon, ProductIcon, TrashIcon, UploadIcon } from './IconComponents';

interface ImageUploaderProps {
  title: string;
  icon?: React.ReactNode;
  onImageUpload: (base64: string) => void;
  imagePreview: string | null;
  disabled: boolean;
  onGenerate: (prompt: string) => Promise<void>;
  isGenerating: boolean;
  onRemove?: () => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  title,
  icon = <ProductIcon className="w-12 h-12" />,
  onImageUpload,
  imagePreview,
  disabled,
  onGenerate,
  isGenerating,
  onRemove
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<'upload' | 'generate'>('upload');
  const [generationPrompt, setGenerationPrompt] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (disabled) {
      setActiveTab('upload');
    }
  }, [disabled]);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      await processFile(file);
    }
  };

  const processFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      return;
    }
    
    setIsUploading(true);
    try {
      const base64 = await fileToBase64(file);
      onImageUpload(base64);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragOver(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    
    if (disabled) return;
    
    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find(file => file.type.startsWith('image/'));
    
    if (imageFile) {
      await processFile(imageFile);
    }
  }, [disabled]);

  const handleUploadClick = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  const handleGenerateClick = () => {
    if (!disabled && !isGenerating) {
      onGenerate(generationPrompt);
    }
  };

  const TabButton: React.FC<{ tabName: 'upload' | 'generate'; children: React.ReactNode }> = ({ tabName, children }) => (
    <button
      onClick={() => !disabled && setActiveTab(tabName)}
      disabled={disabled}
      className={`flex-1 text-sm font-semibold py-3 px-4 transition-all duration-200 relative ${
        activeTab === tabName
          ? 'text-cyan-400 bg-cyan-400/10'
          : 'text-gray-400 hover:text-gray-300 hover:bg-gray-700/30'
      } ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
    >
      {children}
      {activeTab === tabName && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-400 to-purple-500"></div>
      )}
    </button>
  );

  return (
    <div className={`card hover-lift transition-all duration-300 ${disabled ? 'opacity-60' : ''}`}>
      {/* Image Preview Area */}
      <div 
        ref={dropZoneRef}
        className={`relative aspect-video w-full rounded-xl overflow-hidden group transition-all duration-300 ${
          isDragOver ? 'ring-2 ring-cyan-400 ring-offset-2 ring-offset-gray-900' : ''
        } ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={activeTab === 'upload' && !imagePreview ? handleUploadClick : undefined}
      >
        {imagePreview ? (
          <div className="relative w-full h-full">
            <img 
              src={imagePreview} 
              alt={title} 
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" 
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300"></div>
            {onRemove && !disabled && (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove();
                }}
                className="absolute top-3 right-3 bg-red-500/80 hover:bg-red-500 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110"
                aria-label={`Remove ${title}`}
              >
                <TrashIcon className="w-4 h-4" />
              </button>
            )}
          </div>
        ) : (
          <div className={`w-full h-full flex flex-col items-center justify-center transition-all duration-300 ${
            isDragOver ? 'bg-cyan-400/10 border-2 border-dashed border-cyan-400' : 'bg-gray-800/50 border-2 border-dashed border-gray-600'
          }`}>
            {isUploading ? (
              <div className="flex flex-col items-center space-y-3">
                <div className="spinner"></div>
                <p className="text-sm text-gray-400">Processing...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-3 text-gray-400">
                {isDragOver ? (
                  <>
                    <UploadIcon className="w-12 h-12 text-cyan-400 animate-bounce" />
                    <p className="text-sm font-medium text-cyan-400">Drop your image here</p>
                  </>
                ) : (
                  <>
                    <div className="text-gray-500">{icon}</div>
                    <p className="text-sm font-medium">Click to upload or drag & drop</p>
                    <p className="text-xs text-gray-500">PNG, JPG, WEBP up to 10MB</p>
                  </>
                )}
              </div>
            )}
          </div>
        )}
        
        {/* Title Badge */}
        <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium text-white">
          {title}
        </div>
      </div>
      
      {/* Tab Navigation */}
      <div className="flex mt-4 rounded-lg overflow-hidden bg-gray-800/50">
        <TabButton tabName="upload">
          <div className="flex items-center justify-center space-x-2">
            <UploadIcon className="w-4 h-4" />
            <span>Upload</span>
          </div>
        </TabButton>
        <TabButton tabName="generate">
          <div className="flex items-center justify-center space-x-2">
            <SparklesIcon className="w-4 h-4" />
            <span>Generate</span>
          </div>
        </TabButton>
      </div>

      {/* Content Area */}
      <div className="mt-4">
        {activeTab === 'upload' ? (
          <button
            onClick={handleUploadClick}
            disabled={disabled || isUploading}
            className="w-full btn-secondary flex items-center justify-center space-x-2 py-3"
          >
            <UploadIcon className="w-5 h-5" />
            <span>Choose File</span>
          </button>
        ) : (
          <div className="space-y-3">
            <div className="relative">
              <textarea
                value={generationPrompt}
                onChange={(e) => setGenerationPrompt(e.target.value)}
                placeholder={`Describe the ${title.toLowerCase()}...`}
                rows={3}
                className="input-primary resize-none pr-12"
                disabled={disabled || isGenerating}
              />
              <button
                onClick={handleGenerateClick}
                disabled={disabled || isGenerating || !generationPrompt.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center justify-center w-8 h-8 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-lg font-semibold hover:from-cyan-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105"
                aria-label="Generate image"
              >
                {isGenerating ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <SparklesIcon className="w-4 h-4"/>
                )}
              </button>
            </div>
            {generationPrompt.trim() && (
              <p className="text-xs text-gray-400 text-center">
                Press Enter or click the sparkle to generate
              </p>
            )}
          </div>
        )}
      </div>
      
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/png, image/jpeg, image/webp"
        disabled={disabled}
      />
    </div>
  );
};