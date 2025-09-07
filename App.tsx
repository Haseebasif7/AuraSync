import React, { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { ImageUploader } from './components/ImageUploader';
import { PromptInput } from './components/PromptInput';
import { GeneratedImageDisplay } from './components/GeneratedImageDisplay';
import { LoadingProgress } from './components/LoadingProgress';
import { useHistoryManager, HistoryControls } from './components/HistoryManager';
import { generateVisual, generateSourceImage } from './services/geminiService';
import { INITIAL_ROOM_IMAGE, INITIAL_PRODUCT_IMAGE } from './constants';
import { UploadIcon, PlusIcon } from './components/IconComponents';

interface Product {
  id: string;
  image: string | null;
  isGenerating: boolean;
}

const App: React.FC = () => {
  const [roomImage, setRoomImage] = useState<string | null>(INITIAL_ROOM_IMAGE);
  const [products, setProducts] = useState<Product[]>([
    { id: `prod-${Date.now()}`, image: INITIAL_PRODUCT_IMAGE, isGenerating: false }
  ]);
  const [prompt, setPrompt] = useState<string>('');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialGeneration, setIsInitialGeneration] = useState<boolean>(true);
  const [isGeneratingRoom, setIsGeneratingRoom] = useState<boolean>(false);
  
  // Loading progress states
  const [loadingProgress, setLoadingProgress] = useState<number>(0);
  const [loadingStatus, setLoadingStatus] = useState<string>('Initializing...');
  const [showLoadingProgress, setShowLoadingProgress] = useState<boolean>(false);

  // History management
  const currentState = {
    generatedImage,
    prompt,
    roomImage,
    products,
    isInitialGeneration
  };

  const {
    saveToHistory,
    undo,
    redo,
    clearHistory,
    canUndo,
    canRedo,
    hasHistory,
    historyLength
  } = useHistoryManager({
    currentState,
    onStateRestore: (state) => {
      setGeneratedImage(state.generatedImage);
      setPrompt(state.prompt);
      setRoomImage(state.roomImage);
      setProducts(state.products);
      setIsInitialGeneration(state.isInitialGeneration);
      setError(null);
    }
  });

  const handleAddProduct = () => {
    setProducts(prev => [...prev, { id: `prod-${Date.now()}`, image: null, isGenerating: false }]);
  };

  const handleRemoveProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const handleUpdateProductImage = (id: string, image: string) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, image } : p));
  };
    
  const handlePromptChange = (newPrompt: string) => {
    setPrompt(newPrompt);
    if (error) {
      setError(null);
    }
  };


  // Progress simulation for loading
  const simulateProgress = (callback: () => Promise<void>) => {
    setShowLoadingProgress(true);
    setLoadingProgress(0);
    setLoadingStatus('Initializing...');

    const progressInterval = setInterval(() => {
      setLoadingProgress(prev => {
        if (prev >= 90) return prev;
        return prev + Math.random() * 15;
      });
    }, 200);

    const statusMessages = [
      'Analyzing your images...',
      'Understanding your prompt...',
      'Generating design concepts...',
      'Rendering your vision...',
      'Adding final touches...',
      'Almost ready...'
    ];

    let statusIndex = 0;
    const statusInterval = setInterval(() => {
      setLoadingStatus(statusMessages[statusIndex] || 'Finalizing...');
      statusIndex++;
    }, 1000);

    callback().finally(() => {
      clearInterval(progressInterval);
      clearInterval(statusInterval);
      setLoadingProgress(100);
      setLoadingStatus('Complete!');
      setTimeout(() => {
        setShowLoadingProgress(false);
      }, 500);
    });
  };

  const handleGenerateProduct = async (id: string, genPrompt: string, index: number) => {
    if (!genPrompt) {
        setError(`Please enter a prompt to generate Product ${index + 1}.`);
        return;
    }
    setProducts(prev => prev.map(p => (p.id === id ? { ...p, isGenerating: true } : p)));
    setError(null);
    try {
        const result = await generateSourceImage(genPrompt, '1:1');
        handleUpdateProductImage(id, result);
    } catch (e) {
        const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
        console.error(errorMessage);
        setError(`Error generating product ${index + 1}: ${errorMessage}`);
    } finally {
        setProducts(prev => prev.map(p => (p.id === id ? { ...p, isGenerating: false } : p)));
    }
  };

  const handleGenerateRoom = useCallback(async (genPrompt: string) => {
    if (!genPrompt) {
      setError(`Please enter a prompt to generate the room image.`);
      return;
    }
    setIsGeneratingRoom(true);
    setError(null);
    try {
      const result = await generateSourceImage(genPrompt, '16:9');
      setRoomImage(result);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
      console.error(errorMessage);
      setError(`Error generating room: ${errorMessage}`);
    } finally {
      setIsGeneratingRoom(false);
    }
  }, []);

  const handleGeneration = useCallback(async () => {
    const validProducts = products.filter(p => p.image);
    if (isInitialGeneration && (!roomImage || validProducts.length === 0)) {
      setError('Please provide a room image and at least one product image.');
      return;
    }
    if (!isInitialGeneration && !generatedImage) {
      setError('An initial image must be generated before you can refine it.');
      return;
    }
    if (!prompt) {
      setError('Please enter a prompt to generate the design.');
      return;
    }

    console.log('Starting generation with:', {
      prompt,
      roomImage: !!roomImage,
      validProducts: validProducts.length,
      generatedImage: !!generatedImage,
      isInitialGeneration
    });

    setIsLoading(true);
    setError(null);

    await simulateProgress(async () => {
      try {
        const result = await generateVisual({
          prompt,
          roomImage: isInitialGeneration ? roomImage : null,
          productImages: isInitialGeneration ? validProducts.map(p => p.image!) : [],
          baseImage: isInitialGeneration ? null : generatedImage,
        });

        console.log('Generation result:', { hasImage: !!result.image, hasText: !!result.text });

        if (result.image) {
          setGeneratedImage(`data:image/png;base64,${result.image}`);
          setIsInitialGeneration(false);
          setPrompt("");
          console.log('Image successfully generated and set');
          
          // Save to history after successful generation
          setTimeout(() => {
            saveToHistory();
          }, 100);
        } else {
          const errorMsg = result.text || 'Failed to generate image. The model may not have returned an image.';
          console.error('No image in result:', errorMsg);
          setError(errorMsg);
        }
      } catch (e) {
        const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
        console.error('Generation error:', errorMessage);
        setError(`Error: ${errorMessage}`);
      } finally {
        setIsLoading(false);
      }
    });
  }, [prompt, roomImage, products, generatedImage, isInitialGeneration]);

  const resetExperience = () => {
    // Clear history first to prevent any state restoration
    clearHistory();
    
    // Reset all state
    setRoomImage(INITIAL_ROOM_IMAGE);
    setProducts([{ id: `prod-${Date.now()}`, image: INITIAL_PRODUCT_IMAGE, isGenerating: false }]);
    setGeneratedImage(null);
    setIsInitialGeneration(true);
    setError(null);
    setIsLoading(false);
    
    // Ensure prompt is cleared - use setTimeout to ensure it happens after any potential state updates
    setTimeout(() => {
      setPrompt('');
    }, 0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-200 font-sans">
      <Header />
      
      <main className="container mx-auto px-4 md:px-6 py-8" role="main" aria-label="AuraSync Design Interface">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          {/* Left Panel - Input Controls */}
          <div className="xl:col-span-5 space-y-8">
            {/* Step 1: Room Upload */}
            <section className="animate-slide-in-left" aria-labelledby="step1-title">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm" aria-hidden="true">
                    1
                  </div>
                  <h2 id="step1-title" className="text-xl font-semibold text-white">Provide Your Scene</h2>
                </div>
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" aria-hidden="true"></div>
              </div>
              
              <ImageUploader
                title="Your Room"
                onImageUpload={setRoomImage}
                icon={<UploadIcon className="w-12 h-12" />}
                imagePreview={roomImage}
                disabled={!isInitialGeneration}
                onGenerate={handleGenerateRoom}
                isGenerating={isGeneratingRoom}
              />
            </section>

            {/* Step 2: Products */}
            <section className="animate-slide-in-left" style={{ animationDelay: '0.1s' }}>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    2
                  </div>
                  <h2 className="text-xl font-semibold text-white">Add Your Products</h2>
                </div>
                {isInitialGeneration && (
                  <button 
                    onClick={handleAddProduct}
                    className="btn-secondary flex items-center space-x-2 py-2 px-4 text-sm hover:scale-105 transition-transform"
                  >
                    <PlusIcon className="w-4 h-4" />
                    <span>Add Product</span>
                  </button>
                )}
              </div>
              
              <div className="space-y-4">
                {products.map((product, index) => (
                  <div key={product.id} className="animate-scale-in" style={{ animationDelay: `${index * 0.1}s` }}>
                    <ImageUploader
                      title={`Product ${index + 1}`}
                      onImageUpload={(img) => handleUpdateProductImage(product.id, img)}
                      imagePreview={product.image}
                      disabled={!isInitialGeneration}
                      onGenerate={(p) => handleGenerateProduct(product.id, p, index)}
                      isGenerating={product.isGenerating}
                      onRemove={products.length > 1 ? () => handleRemoveProduct(product.id) : undefined}
                    />
                  </div>
                ))}
              </div>
            </section>

            {/* Step 3: Prompt */}
            <section className="animate-slide-in-left" style={{ animationDelay: '0.2s' }}>
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-8 h-8 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {isInitialGeneration ? '3' : '2'}
                </div>
                <h2 className="text-xl font-semibold text-white">
                  {isInitialGeneration ? 'Describe Your Vision' : 'Refine Your Design'}
                </h2>
              </div>

              <PromptInput
                prompt={prompt}
                onPromptChange={handlePromptChange}
                onSubmit={handleGeneration}
                isLoading={isLoading}
                placeholder={
                  isInitialGeneration 
                    ? 'e.g., Transform the side of a moving subway train into a glowing digital canvas...' 
                    : 'e.g., Change the banner text to bold white letters and add a brand logo...'
                }
              />

              {/* Tips and Help */}
              <div className="mt-6 space-y-3">
                {isInitialGeneration && products.length > 1 && (
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-white text-xs font-bold">💡</span>
                      </div>
                      <div>
                        <p className="text-sm text-blue-300 font-medium">Pro Tip</p>
                        <p className="text-sm text-blue-200/80 mt-1">
                          Refer to products by their appearance (e.g., "the blue sofa", "the wooden table") for better results.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {!isInitialGeneration && (
                  <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-white text-xs font-bold">⚡</span>
                      </div>
                      <div>
                        <p className="text-sm text-yellow-300 font-medium">Refinement Mode</p>
                        <p className="text-sm text-yellow-200/80 mt-1">
                          Inputs are locked. Use the prompt to refine your design or{' '}
                          <button 
                            onClick={resetExperience} 
                            className="underline font-semibold hover:text-yellow-300 transition-colors"
                          >
                            start over
                          </button>.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* Error Display */}
            {error && (
              <div className="animate-slide-in-up">
                <div className="bg-red-500/10 border border-red-500/20 text-red-300 p-4 rounded-lg text-center font-medium">
                  <div className="flex items-center justify-center space-x-2">
                    <span>⚠️</span>
                    <span>{error}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Panel - Results */}
          <div className="xl:col-span-7 animate-slide-in-right">
            <div className="sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {isInitialGeneration ? '4' : '3'}
                  </div>
                  <h2 className="text-xl font-semibold text-white">
                    {isInitialGeneration ? 'See the Magic' : 'Your Result'}
                  </h2>
                </div>
                {!isInitialGeneration && (
                  <button 
                    onClick={resetExperience} 
                    className="btn-primary text-sm py-2 px-4 hover:scale-105 transition-transform"
                  >
                    Start New Design
                  </button>
                )}
              </div>

              {/* History Controls */}
              <div className="mb-6">
                <HistoryControls
                  canUndo={canUndo}
                  canRedo={canRedo}
                  hasHistory={hasHistory}
                  onUndo={undo}
                  onRedo={redo}
                  onClearHistory={clearHistory}
                  historyLength={historyLength}
                />
              </div>
              
              <GeneratedImageDisplay image={generatedImage} isLoading={isLoading} />
            </div>
          </div>
        </div>
      </main>

      {/* Enhanced Footer */}
      <footer className="mt-16 border-t border-gray-700/50 bg-gray-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">A</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-white">AuraSync</p>
                <p className="text-xs text-gray-400">Your Vision. Your Space. Instantly.</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-6 text-sm text-gray-400">
              <span>Powered by Gemini AI</span>
              <span>•</span>
              <span>Built with React & TypeScript</span>
              <span>•</span>
              <span>© 2025 AuraSync</span>
            </div>
          </div>
        </div>
      </footer>
      
      {/* Loading Progress Modal */}
      <LoadingProgress
        progress={loadingProgress}
        status={loadingStatus}
        isVisible={showLoadingProgress}
      />
    </div>
  );
};

export default App;