const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { v2 } = require('@google-cloud/translate');

// Initialize Firebase Admin
admin.initializeApp();

// Initialize Google Cloud Translate
// The projectId is typically auto-detected in the GCP environment
const translate = new v2.Translate();

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
