import { AppRegistry } from "react-native";
import App from "./App";
import { name as appName } from "./app.json";

AppRegistry.registerComponent(appName, () => App);

// const functions = require("firebase-functions");
// const admin = require("firebase-admin");
// admin.initializeApp();

// exports.sendFriendRequestNotification = functions.https.onCall(
//   async (data, context) => {
//     const { receiverId, senderName } = data;

//     // Fetch the receiver's FCM token from Firestore
//     const userDoc = await admin
//       .firestore()
//       .collection("users")
//       .doc(receiverId)
//       .get();
//     const fcmToken = userDoc.data().fcmToken;

//     if (!fcmToken) {
//       throw new functions.https.HttpsError(
//         "failed-precondition",
//         "FCM token not available"
//       );
//     }

//     const message = {
//       notification: {
//         title: "New Friend Request",
//         body: `${senderName} has sent you a friend request.`,
//       },
//       token: fcmToken,
//     };

//     try {
//       await admin.messaging().send(message);
//       return { success: true };
//     } catch (error) {
//       throw new functions.https.HttpsError(
//         "unknown",
//         "Failed to send notification",
//         error
//       );
//     }
//   }
// );
