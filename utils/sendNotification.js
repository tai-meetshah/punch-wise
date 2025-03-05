const admin = require('firebase-admin');

// Initialize the Firebase Admin SDK
const serviceAccount = require('./rafflerush-vendor-firebase-adminsdk-prfm7-9c77d2a112.json');
const vendorApp = admin.initializeApp(
    { credential: admin.credential.cert(serviceAccount) },
    'vendorApp'
);

const sendNotification = async (title, body, registrationToken, data) => {
    try {
        const message = {
            notification: { title, body },
            data,
            token: registrationToken,
        };

        const response = await vendorApp.messaging().send(message);

        console.log('Successfully sent message.');
        return response;
    } catch (error) {
        console.log('Error sending notification:', error);
        throw error;
    }
};

const sendNotificationsToTokens = async (title, body, registrationTokens) => {
    // Split registration tokens into batches
    const batchSize = 500;
    const tokenBatches = [];
    for (let i = 0; i < registrationTokens.length; i += batchSize) {
        tokenBatches.push(registrationTokens.slice(i, i + batchSize));
    }

    const message = { notification: { title, body } };

    try {
        const sendPromises = tokenBatches.map(batch => {
            const batchMessages = batch.map(token => ({ ...message, token }));
            return vendorApp.messaging().sendEach(batchMessages);
        });

        const response = await Promise.all(sendPromises);

        console.log('Successfully sent all messages');
        return response;
    } catch (error) {
        console.log('Error sending notification:', error);
        throw error;
    }
};

module.exports = {
    sendNotification,
    sendNotificationsToTokens,
};
