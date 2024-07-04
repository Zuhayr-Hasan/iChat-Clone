// const {onRequest} = require("firebase-functions/v2/https");
// const logger = require("firebase-functions/logger");

const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

exports.sendFriendRequestNotification = functions.firestore
    .document("friendRequests/{requestId}")
    .onCreate(async (snapshot) => {
        const requestData = snapshot.data();
        const receiverId = requestData.receiverId;

        // Fetch receiver's FCM token
        const userDoc = await admin
            .firestore()
            .collection("users")
            .doc(receiverId)
            .get();
        const fcmToken = userDoc.data().fcmToken;

        if (fcmToken) {
            const payload = {
                notification: {
                    title: "New Friend Request",
                    body: `${requestData.senderName} wants to be your friend`,
                },
            };

            // Send notification
            await admin.messaging().sendToDevice(fcmToken, payload);
        }
    });

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//     logger.info("Hello logs!", {structuredData: true});
//     response.send("Hello from Firebase!");
// });
