import { database } from "../config/firebase";
import { doc, getDoc } from "firebase/firestore";
import * as Notifications from "expo-notifications";

// Function to send a push notification to a specific user
export async function sendPushNotification(userId, title, body) {
  try {
    // Retrieve the expoPushToken for the user from the Firestore database
    const userDoc = await getDoc(doc(database, `users/${userId}`));
    const expoPushToken = userDoc.data()?.expoPushToken;

    // Check if expoPushToken exists
    if (expoPushToken) {
      // Send the push notification
      await Notifications.scheduleNotificationAsync({
        content: {
          title: title,
          body: body,
          sound: "default",
        },
        to: expoPushToken,
      });
      console.log("Push notification sent successfully!");
    } else {
      console.error("User's expoPushToken not found!");
    }
  } catch (error) {
    console.error("Error sending push notification:", error);
    throw error; // Rethrow the error to handle it where the function is called
  }
}
