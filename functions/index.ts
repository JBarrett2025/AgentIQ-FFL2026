const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { v2 } = require('@google-cloud/translate');
const { GoogleGenAI, Type } = require('@google/genai');

// Initialize Firebase Admin
admin.initializeApp();

// Initialize Google Cloud Translate
const translate = new v2.Translate();

let aiClient: any = null;
function getAiClient() {
    if (!aiClient) {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            throw new functions.https.HttpsError('failed-precondition', 'GEMINI_API_KEY environment variable is not set on the server.');
        }
        aiClient = new GoogleGenAI({ apiKey });
    }
    return aiClient;
}

exports.autoTranslateText = functions.https.onCall(async (data: any, context: any) => {
    // 1. Basic validation
    if (!data || !data.text) {
        throw new functions.https.HttpsError('invalid-argument', 'The function must be called with a "text" argument.');
    }

    if (!data.targetLanguageCode) {
        throw new functions.https.HttpsError('invalid-argument', 'The function must be called with a "targetLanguageCode" argument.');
    }

    try {
        // 2. Perform translation
        const [translation] = await translate.translate(data.text, data.targetLanguageCode);

        // 3. Return the exact structure the frontend expects
        return {
            originalLanguage: 'en',
            targetLanguage: data.targetLanguageCode,
            translatedText: translation
        };

    } catch (error: any) {
        console.error('Translation error:', error);
        throw new functions.https.HttpsError('internal', 'Unable to translate text at this time.', error.message);
    }
});

exports.geminiGenerateContent = functions
    .runWith({ secrets: ['GEMINI_API_KEY'] })
    .https.onCall(async (data: any, context: any) => {
        if (!context.auth) {
            throw new functions.https.HttpsError('unauthenticated', 'The function must be called by an authenticated user.');
        }

        if (!data || !data.prompt) {
            throw new functions.https.HttpsError('invalid-argument', 'The function must be called with a "prompt" argument.');
        }

        try {
            const ai = getAiClient();
            const requestPayload: any = {
                model: data.model || 'gemini-2.5-flash',
                contents: data.prompt,
            };

            if (data.config) {
                requestPayload.config = data.config;
            }

            const response = await ai.models.generateContent(requestPayload);
            return { text: response.text || "" };
        } catch (error: any) {
            console.error("Gemini API call failed:", error);
            throw new functions.https.HttpsError('internal', error.message || 'Failed to call Gemini API.');
        }
    });

exports.geminiFindVideo = functions
    .runWith({ secrets: ['GEMINI_API_KEY'] })
    .https.onCall(async (data: any, context: any) => {
        if (!context.auth) {
            throw new functions.https.HttpsError('unauthenticated', 'The function must be called by an authenticated user.');
        }

        if (!data || !data.topic) {
            throw new functions.https.HttpsError('invalid-argument', 'The function must be called with a "topic" argument.');
        }

        try {
            const ai = getAiClient();
            const prompt = `Find a single, highly relevant YouTube video about "${data.topic}". Provide its full video URL and a high-quality thumbnail URL.`;

            const response = await ai.models.generateContent({
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

            return { text: response.text || "" };
        } catch (error: any) {
            console.error("Gemini Find Video failed:", error);
            throw new functions.https.HttpsError('internal', error.message || 'Failed to find video.');
        }
    });

exports.geminiGenerateImages = functions
    .runWith({ secrets: ['GEMINI_API_KEY'] })
    .https.onCall(async (data: any, context: any) => {
        if (!context.auth) {
            throw new functions.https.HttpsError('unauthenticated', 'The function must be called by an authenticated user.');
        }

        if (!data || !data.prompt) {
            throw new functions.https.HttpsError('invalid-argument', 'The function must be called with a "prompt" argument.');
        }

        try {
            const ai = getAiClient();
            const enhancedPrompt = `Create a clean, modern logo for the following concept: "${data.prompt}". The logo must be on a plain, solid white (#FFFFFF) background.`;

            const response = await ai.models.generateImages({
                model: 'imagen-4.0-generate-001',
                prompt: enhancedPrompt,
                config: {
                    numberOfImages: 1,
                    outputMimeType: 'image/png',
                    aspectRatio: '1:1',
                },
            });

            const base64ImageBytes = response.generatedImages?.[0]?.image?.imageBytes;
            return { base64ImageBytes: base64ImageBytes || null };
        } catch (error: any) {
            console.error("Imagen image generation failed:", error);
            throw new functions.https.HttpsError('internal', error.message || 'Failed to generate image.');
        }
    });

exports.geminiGenerateDesignSuggestions = functions
    .runWith({ secrets: ['GEMINI_API_KEY'] })
    .https.onCall(async (data: any, context: any) => {
        if (!context.auth) {
            throw new functions.https.HttpsError('unauthenticated', 'The function must be called by an authenticated user.');
        }

        if (!data || !data.topic || !data.availableFonts) {
            throw new functions.https.HttpsError('invalid-argument', 'The function must be called with "topic" and "availableFonts" arguments.');
        }

        try {
            const ai = getAiClient();
            const prompt = `Based on the topic "${data.topic}", suggest a single background color and a suitable font.
            - The color must be a single, valid hexadecimal color code (e.g., #1A2B3C).
            - The font must be one of the following options: ${data.availableFonts.join(', ')}.
            Return ONLY the JSON object.`;

            const response = await ai.models.generateContent({
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
                                description: `One of the following fonts: ${data.availableFonts.join(', ')}.`
                            }
                        },
                        required: ["color", "font"]
                    }
                }
            });

            return { text: response.text || "" };
        } catch (error: any) {
            console.error("Gemini Design suggestions failed:", error);
            throw new functions.https.HttpsError('internal', error.message || 'Failed to generate design suggestions.');
        }
    });
