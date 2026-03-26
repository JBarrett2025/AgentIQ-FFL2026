import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { generateContent } from "../utils/aiUtils";

// Your web app's Firebase configuration
const firebaseConfig = {
    // Replace with actual config later when deploying the DB
    apiKey: "AIzaSyDummyKeyForLocalDev_CHANGE_ME",
    authDomain: "nextgen-nested-site-builder.firebaseapp.com",
    projectId: "nextgen-nested-site-builder",
    storageBucket: "nextgen-nested-site-builder.appspot.com",
    messagingSenderId: "1234567890",
    appId: "1:1234567890:web:abcd1234567890",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);

export const requestTranslation = async (text: string, targetLanguageCode: string = 'es'): Promise<string> => {
    try {
        const languageMap: Record<string, string> = { 'es': 'Spanish', 'en': 'English' };
        const targetLanguage = languageMap[targetLanguageCode] || 'Spanish';

        const prompt = `Translate the following short UI text into ${targetLanguage}. Return ONLY the translated string, with no additional commentary, quotes, or markdown: "${text}"`;

        const result = await generateContent(prompt);
        return result || '';
    } catch (error) {
        console.error("Translation Engine Error:", error);
        throw new Error(`Translation failed: ${(error as Error).message}`);
    }
};

export const requestBatchTranslation = async (texts: Record<string, string>, targetLanguageCode: string = 'es'): Promise<Record<string, string>> => {
    const languageMap: Record<string, string> = { 'es': 'Spanish', 'en': 'English' };
    const targetLanguage = languageMap[targetLanguageCode] || 'Spanish';

    const prompt = `Translate the following JSON object's string values into ${targetLanguage}. Keep the exact same JSON keys. Return ONLY the translated JSON object, with no markdown formatting or commentary:\n\n${JSON.stringify(texts)}`;

    const config = {
        responseMimeType: "application/json"
    };

    let retries = 3;
    let delayMs = 2000;

    while (retries > 0) {
        try {
            const result = await generateContent(prompt, config);
            if (!result) return {};

            // Sometimes models return ```json wrappers even with JSON mimeTypes
            const cleanedResult = result.replace(/```(?:json)?\n?/gi, '').replace(/```\n?/g, '').trim();
            return JSON.parse(cleanedResult);
        } catch (error) {
            retries--;
            console.error(`Batch Translation Error (Retries left: ${retries}):`, error);

            if (retries === 0) {
                // If we've exhausted retries, throw the RAW error so the caller can see exactly what went wrong
                throw error;
            }
            // Exponential backoff
            await new Promise(resolve => setTimeout(resolve, delayMs));
            delayMs *= 2;
        }
    }
    return {};
};
