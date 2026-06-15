import { httpsCallable } from "firebase/functions";
import { functions } from "../services/firebase";

/**
 * Generates content using the Gemini API.
 * @param prompt The prompt to send to the model.
 * @param config Optional configuration object to pass to the model, like responseMimeType
 * @returns The generated text, or an empty string if an error occurs.
 */
export const generateContent = async (prompt: string, config?: any): Promise<string> => {
    try {
        const geminiGenerateContent = httpsCallable(functions, 'geminiGenerateContent');
        const response: any = await geminiGenerateContent({ prompt, config });
        return response.data.text || "";
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        throw error;
    }
};

/**
 * Finds a relevant YouTube video and its thumbnail using the Gemini API.
 * @param topic The topic to search for.
 * @returns An object with videoUrl and thumbnailUrl, or null if not found.
 */
export const findVideoWithAi = async (topic: string): Promise<{ videoUrl: string; thumbnailUrl: string } | null> => {
    try {
        const geminiFindVideo = httpsCallable(functions, 'geminiFindVideo');
        const response: any = await geminiFindVideo({ topic });
        const jsonString = response.data.text;
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
        const geminiGenerateImages = httpsCallable(functions, 'geminiGenerateImages');
        const response: any = await geminiGenerateImages({ prompt });
        const base64ImageBytes = response.data.base64ImageBytes;

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
        const geminiGenerateDesignSuggestions = httpsCallable(functions, 'geminiGenerateDesignSuggestions');
        const response: any = await geminiGenerateDesignSuggestions({ topic, availableFonts });
        const jsonString = response.data.text;
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