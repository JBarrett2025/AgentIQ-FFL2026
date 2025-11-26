import { GoogleGenAI, Type } from "@google/genai";

let ai: GoogleGenAI | null = null;

const getAiClient = () => {
    if (!ai) {
 if (!import.meta.env.VITE_GEMINI_API_KEY) {
            throw new Error("VITE_GEMINI_API_KEY environment variable not set");
        }
       ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
    }
    return ai;
};

/**
 * Generates content using the Gemini API.
 * @param prompt The prompt to send to the model.
 * @returns The generated text, or an empty string if an error occurs.
 */
export const generateContent = async (prompt: string): Promise<string> => {
    try {
        const genAI = getAiClient();
        const response = await genAI.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        
        const text = response.text;
        
        if (!text) {
            console.warn("Gemini API returned an empty response.");
            return "";
        }
        
        return text.trim();

    } catch (error) {
        console.error("Error calling Gemini API:", error);
        // Propagate a user-friendly error message
        throw new Error("Failed to generate content. Please check your API key and network connection.");
    }
};

/**
 * Finds a relevant YouTube video and its thumbnail using the Gemini API.
 * @param topic The topic to search for.
 * @returns An object with videoUrl and thumbnailUrl, or null if not found.
 */
export const findVideoWithAi = async (topic: string): Promise<{ videoUrl: string; thumbnailUrl: string } | null> => {
    try {
        const genAI = getAiClient();
        
        const prompt = `Find a single, highly relevant YouTube video about "${topic}". Provide its full video URL and a high-quality thumbnail URL.`;

        const response = await genAI.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        videoUrl: {
                            type: Type.STRING,
                            description: "The full URL of the YouTube video."
                        },
                        thumbnailUrl: {
                            type: Type.STRING,
                            description: "The URL of the video's high-quality thumbnail."
                        }
                    },
                    required: ["videoUrl", "thumbnailUrl"]
                }
            }
        });

        const jsonString = response.text;
        if (!jsonString) {
            console.warn("AI video search returned an empty response.");
            return null;
        }

        const result = JSON.parse(jsonString);
        if (result.videoUrl && result.thumbnailUrl) {
            return result;
        }

        return null;

    } catch (error) {
        console.error("Error in AI video search:", error);
        throw new Error("Failed to find video with AI. Please try again.");
    }
};

/**
 * Generates an image using the Gemini API (Imagen model).
 * @param prompt The prompt describing the image to generate.
 * @returns A base64 data URL of the generated image, or null on failure.
 */
export const generateImageWithAi = async (prompt: string): Promise<string | null> => {
    try {
        const genAI = getAiClient();

        // This prompt embraces the AI's strength in creating logos on a white background for reliability.
        const enhancedPrompt = `Create a clean, modern logo for the following concept: "${prompt}". The logo must be on a plain, solid white (#FFFFFF) background.`;

        const response = await genAI.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: enhancedPrompt,
            config: {
              numberOfImages: 1,
              outputMimeType: 'image/png',
              aspectRatio: '1:1',
            },
        });

        const base64ImageBytes = response.generatedImages?.[0]?.image?.imageBytes;
        
        if (base64ImageBytes) {
            return `data:image/png;base64,${base64ImageBytes}`;
        }
        
        console.warn("AI image generation returned no images.");
        return null;

    } catch (error) {
        console.error("Error in AI image generation:", error);
        throw new Error("Failed to generate image with AI. Please try again.");
    }
};

/**
 * Generates design suggestions (color and font) using the Gemini API.
 * @param topic A description of the tile's content or desired mood.
 * @param availableFonts A list of font names the AI must choose from.
 * @returns An object with color and font, or null on failure.
 */
export const generateDesignSuggestionsWithAi = async (
    topic: string,
    availableFonts: string[]
): Promise<{ color: string; font: string } | null> => {
    try {
        const genAI = getAiClient();
        
        const prompt = `Based on the topic "${topic}", suggest a single background color and a suitable font.
        - The color must be a single, valid hexadecimal color code (e.g., #1A2B3C).
        - The font must be one of the following options: ${availableFonts.join(', ')}.
        Return ONLY the JSON object.`;

        const response = await genAI.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        color: {
                            type: Type.STRING,
                            description: "A single hexadecimal color code, like #RRGGBB."
                        },
                        font: {
                            type: Type.STRING,
                            description: `One of the following fonts: ${availableFonts.join(', ')}.`
                        }
                    },
                    required: ["color", "font"]
                }
            }
        });

        const jsonString = response.text;
        if (!jsonString) {
            console.warn("AI design suggestion returned an empty response.");
            return null;
        }

        const result = JSON.parse(jsonString);

        // Validate the response
        const isValidColor = /^#[0-9A-F]{6}$/i.test(result.color);
        const isValidFont = availableFonts.includes(result.font);

        if (isValidColor && isValidFont) {
            return result;
        } else {
            console.warn("AI design suggestion returned invalid data:", result);
            return null;
        }

    } catch (error) {
        console.error("Error in AI design suggestion:", error);
        throw new Error("Failed to generate design suggestions with AI. Please try again.");
    }
};