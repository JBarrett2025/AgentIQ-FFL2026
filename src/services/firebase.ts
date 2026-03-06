import { initializeApp } from "firebase/app";
import { getFunctions, httpsCallable } from "firebase/functions";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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
const functions = getFunctions(app);

// In development, point to the local emulator if needed
if (import.meta.env.DEV) {
    // import { connectFunctionsEmulator } from "firebase/functions";
    // connectFunctionsEmulator(functions, "127.0.0.1", 5001);
}

export const requestTranslation = async (text: string, targetLanguageCode: string = 'es'): Promise<string> => {
    try {
        const autoTranslateText = httpsCallable(functions, 'autoTranslateText');
        const result = await autoTranslateText({ text, targetLanguageCode });
        const data = result.data as any;
        return data.translatedText || '';
    } catch (error) {
        console.error("Firebase Translation Function Error:", error);
        return '';
    }
};
