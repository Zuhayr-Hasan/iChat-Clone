import React, { useState, useEffect, useCallback } from "react";
import { GiftedChat, Bubble } from "react-native-gifted-chat";
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  doc,
  getDoc,
} from "firebase/firestore";
import { database } from "../config/firebase";
import { useSelector } from "react-redux";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { TouchableOpacity, View, Text, StyleSheet } from "react-native";

function Chat({ route, navigation }) {
  const { userId, username } = route.params;
  const currentUserId = useSelector((state) => state.auth.userId);
  const currentUserEmail = useSelector((state) => state.auth.email);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const checkFriendship = async () => {
      try {
        const friendDoc = await getDoc(doc(database, `users/${currentUserId}`));
        const friends = friendDoc.data()?.friends || [];
        if (!friends.includes(userId)) {
          alert("You are not friends with this user.");
          navigation.goBack();
        }
      } catch (error) {
        console.error("Error checking friendship:", error);
        alert("Error checking friendship. Please try again later.");
      }
    };

    const fetchMessages = () => {
      const chatId =
        currentUserId < userId
          ? `${currentUserId}_${userId}`
          : `${userId}_${currentUserId}`;
      const messagesRef = collection(database, "chats", chatId, "messages"); 
      const q = query(messagesRef, orderBy("createdAt", "desc"));

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const allMessages = snapshot.docs.map((doc) => ({
            _id: doc.id,
            text: doc.data().text,
            createdAt: doc.data().createdAt.toDate(),
            user: {
              _id: doc.data().user._id,
              name: doc.data().user.name,
              avatar: "https://placeimg.com/140/140/any",
            },
          }));
          setMessages(allMessages);
        },
        (error) => {
          console.error("Error fetching messages: ", error);
          alert("Error fetching messages. Please try again later.");
        }
      );

      return unsubscribe;
    };

    checkFriendship();
    const unsubscribeMessages = fetchMessages();

    return () => unsubscribeMessages();
  }, [currentUserId, userId, navigation]);

  const onSend = useCallback(
    async (messages = []) => {
      setMessages((previousMessages) =>
        GiftedChat.append(previousMessages, messages)
      );

      const { _id, createdAt, text, user } = messages[0];
      const chatId =
        currentUserId < userId
          ? `${currentUserId}_${userId}`
          : `${userId}_${currentUserId}`;
      addDoc(collection(database, "chats", chatId, "messages"), {
        _id,
        createdAt,
        text,
        user,
      });

      // No push notification sent
    },
    [currentUserId, userId]
  );

  const handleLogout = () => {
    navigation.navigate("Login");
  };

  const renderBubble = (props) => {
    return (
      <Bubble
        {...props}
        wrapperStyle={{
          right: {
            backgroundColor: "#5865f2", // Change this to the desired color
          },
        }}
      />
    );
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <MaterialCommunityIcons name="logout" size={24} color="black" />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
      <GiftedChat
        messages={messages}
        onSend={(messages) => onSend(messages)}
        user={{
          _id: currentUserId,
          name: currentUserEmail,
        }}
        renderBubble={renderBubble}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 35,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    backgroundColor: "#f5f5f5",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  logoutText: {
    marginLeft: 5,
    fontSize: 16,
    color: "black",
  },
});

export default Chat;
