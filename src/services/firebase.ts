import { initializeApp } from "firebase/app";
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
initializeApp(firebaseConfig);

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
