import { GoogleGenAI, Modality } from "@google/genai";
import { dataUrlToGeminiPart } from '../utils/fileUtils';

const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY) {
  throw new Error("GEMINI_API_KEY environment variable not set. Please add your Gemini API key to the .env file.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });
const editModel = 'gemini-2.5-flash-image-preview';
const imageGenModel = 'gemini-2.5-flash-image-preview';

interface GenerateVisualParams {
  prompt: string;
  roomImage?: string | null;
  productImages?: (string | null)[];
  baseImage?: string | null;
}

interface GenerateVisualResult {
    image: string | null;
    text: string | null;
}

export const generateSourceImage = async (
    prompt: string,
    aspectRatio: '1:1' | '16:9' | '9:16' | '4:3' | '3:4'
): Promise<string> => {
    try {
        console.log('Generating source image with prompt:', prompt);
        console.log('Using model:', imageGenModel);
        
        const response = await ai.models.generateContent({
            model: imageGenModel,
            contents: [{ parts: [{ text: prompt }] }],
            config: {
                responseModalities: [Modality.IMAGE],
            },
        });

        console.log('API Response received:', response);

        if (response.candidates && response.candidates.length > 0) {
            console.log('Number of candidates:', response.candidates.length);
            console.log('First candidate parts:', response.candidates[0].content.parts);
            
            for (const part of response.candidates[0].content.parts) {
                if (part.inlineData?.data) {
                    console.log('Image data found, length:', part.inlineData.data.length);
                    return `data:image/png;base64,${part.inlineData.data}`;
                }
            }
        }
        
        console.error('No image data found in response');
        throw new Error('Image generation failed: The API did not return image data.');
    } catch (error) {
        console.error("Error generating source image with Gemini:", error);
        if (error instanceof Error) {
            throw new Error(`Gemini API Error: ${error.message}`);
        }
        throw new Error("An unknown error occurred while generating the image.");
    }
};

export const generateVisual = async ({
  prompt,
  roomImage,
  productImages,
  baseImage,
}: GenerateVisualParams): Promise<GenerateVisualResult> => {
  try {
    console.log('Generating visual with prompt:', prompt);
    console.log('Room image provided:', !!roomImage);
    console.log('Product images provided:', productImages?.length || 0);
    console.log('Base image provided:', !!baseImage);
    
    // Try multimodal approach first
    try {
      const parts: any[] = [];

      if (baseImage) {
          console.log('Using base image for refinement');
          parts.push(dataUrlToGeminiPart(baseImage));
      } else {
          if (roomImage) {
              console.log('Adding room image to parts');
              parts.push(dataUrlToGeminiPart(roomImage));
          }
          if (productImages) {
              console.log('Adding product images to parts');
              for (const pImage of productImages) {
                  if (pImage) parts.push(dataUrlToGeminiPart(pImage));
              }
          }
      }
      
      parts.push({ text: prompt });
      console.log('Total parts for API call:', parts.length);

      const response = await ai.models.generateContent({
          model: editModel,
          contents: [{ parts }],
          config: {
              responseModalities: [Modality.IMAGE, Modality.TEXT],
          },
      });

      console.log('Visual generation API response received:', response);

      let resultImage: string | null = null;
      let resultText: string | null = null;

      if (response.candidates && response.candidates.length > 0) {
          console.log('Number of candidates:', response.candidates.length);
          console.log('First candidate parts:', response.candidates[0].content.parts);
          
          for (const part of response.candidates[0].content.parts) {
              if (part.inlineData?.data) {
                  console.log('Image data found in visual generation, length:', part.inlineData.data.length);
                  resultImage = part.inlineData.data;
              } else if (part.text) {
                  console.log('Text data found:', part.text);
                  resultText = part.text;
              }
          }
      }
      
      if(resultImage) {
          console.log('Multimodal generation successful');
          return { image: resultImage, text: resultText };
      }
      
      console.log('Multimodal generation did not return image, trying text-only approach');
    } catch (multimodalError) {
      console.log('Multimodal generation failed, trying text-only approach:', multimodalError);
    }
    
    // Fallback to text-only generation with enhanced prompt
    const enhancedPrompt = `Create a professional interior design visualization. ${prompt}. 
    Generate a high-quality, realistic interior design image with proper lighting, composition, and professional photography style.`;
    
    console.log('Trying text-only generation with enhanced prompt:', enhancedPrompt);
    
    const response = await ai.models.generateContent({
        model: imageGenModel,
        contents: [{ parts: [{ text: enhancedPrompt }] }],
        config: {
            responseModalities: [Modality.IMAGE],
        },
    });

    console.log('Text-only generation API response received:', response);

    let resultImage: string | null = null;
    let resultText: string | null = null;

    if (response.candidates && response.candidates.length > 0) {
        console.log('Number of candidates:', response.candidates.length);
        console.log('First candidate parts:', response.candidates[0].content.parts);
        
        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData?.data) {
                console.log('Image data found in text-only generation, length:', part.inlineData.data.length);
                resultImage = part.inlineData.data;
            } else if (part.text) {
                console.log('Text data found:', part.text);
                resultText = part.text;
            }
        }
    }
    
    if(!resultImage && !resultText) {
        console.log('No image or text content found in response');
        const promptFeedback = response.promptFeedback;
        if (promptFeedback?.blockReason) {
            console.error('Request was blocked:', promptFeedback.blockReason, promptFeedback.blockReasonMessage);
            throw new Error(`Request was blocked: ${promptFeedback.blockReason} - ${promptFeedback.blockReasonMessage}`);
        }
        resultText = "The model did not return any content. Try adjusting your prompt.";
    }

    console.log('Final result - Image:', !!resultImage, 'Text:', !!resultText);
    return { image: resultImage, text: resultText };

  } catch (error) {
    console.error("Error generating visual with Gemini:", error);
    if (error instanceof Error) {
        throw new Error(`Gemini API Error: ${error.message}`);
    }
    throw new Error("An unknown error occurred while communicating with the Gemini API.");
  }
};