
/**
 * Converts a File object to a base64 encoded string (data URL).
 * @param file The File object to convert.
 * @returns A promise that resolves with the base64 data URL.
 */
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

/**
 * Converts a base64 data URL into a Gemini-compatible Part object.
 * @param dataUrl The base64 data URL (e.g., "data:image/png;base64,...").
 * @returns An object with inlineData containing the mimeType and base64 data.
 */
export const dataUrlToGeminiPart = (dataUrl: string) => {
    const parts = dataUrl.split(';base64,');
    const mimeType = parts[0].split(':')[1];
    const base64Data = parts[1];
    
    return {
      inlineData: {
        mimeType,
        data: base64Data,
      },
    };
};
