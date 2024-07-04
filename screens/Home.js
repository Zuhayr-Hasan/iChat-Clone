import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
} from "react-native";
import {
  collection,
  getDocs,
  addDoc,
  query,
  where,
  doc,
  updateDoc,
  arrayUnion,
} from "firebase/firestore";
import { database } from "../config/firebase";
import { useSelector } from "react-redux";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { firebaseConfig } from "../config/firebase"; // Adjust the import based on your structure

// import { SafeAreaView } from "react-native-safe-area-context";

function Home({ navigation }) {
  const [users, setUsers] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const email = useSelector((state) => state.auth.email);
  const userId = useSelector((state) => state.auth.userId);

  const username = email.split("@")[0];
  const capitalizedUsername =
    username.charAt(0).toUpperCase() + username.slice(1);

  // useEffect(() => {
  //   const fetchUsers = async () => {
  //     const usersCollection = collection(database, "users");
  //     const usersSnapshot = await getDocs(usersCollection);
  //     const usersData = usersSnapshot.docs.map((doc) => ({
  //       id: doc.id,
  //       ...doc.data(),
  //     }));
  //     setUsers(usersData);
  //     console.log(users);
  //   };

  //   const fetchFriendRequests = async () => {
  //     const friendRequestsCollection = collection(database, "friendRequests");
  //     const receivedQuery = query(
  //       friendRequestsCollection,
  //       where("receiverId", "==", userId),
  //       where("status", "==", "pending")
  //     );
  //     const sentQuery = query(
  //       friendRequestsCollection,
  //       where("senderId", "==", userId),
  //       where("status", "==", "pending")
  //     );
  //     const [receivedSnapshot, sentSnapshot] = await Promise.all([
  //       getDocs(receivedQuery),
  //       getDocs(sentQuery),
  //     ]);
  //     const receivedRequestsData = receivedSnapshot.docs.map((doc) => ({
  //       id: doc.id,
  //       ...doc.data(),
  //     }));
  //     const sentRequestsData = sentSnapshot.docs.map((doc) => ({
  //       id: doc.id,
  //       ...doc.data(),
  //     }));
  //     setFriendRequests(receivedRequestsData);
  //     setSentRequests(sentRequestsData);
  //   };

  //   fetchUsers();
  //   fetchFriendRequests();
  // }, [userId, friendRequests]);

  useEffect(() => {
    const fetchUsersAndRequests = async () => {
      // Fetch Users
      const usersCollection = collection(database, "users");
      const usersSnapshot = await getDocs(usersCollection);
      const usersData = usersSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUsers(usersData);

      // Fetch Friend Requests
      const friendRequestsCollection = collection(database, "friendRequests");
      const receivedQuery = query(
        friendRequestsCollection,
        where("receiverId", "==", userId),
        where("status", "==", "pending")
      );
      const sentQuery = query(
        friendRequestsCollection,
        where("senderId", "==", userId),
        where("status", "==", "pending")
      );
      const [receivedSnapshot, sentSnapshot] = await Promise.all([
        getDocs(receivedQuery),
        getDocs(sentQuery),
      ]);
      const receivedRequestsData = receivedSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      const sentRequestsData = sentSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setFriendRequests(receivedRequestsData);
      setSentRequests(sentRequestsData);
    };

    fetchUsersAndRequests();
  }, [userId]); // Only depend on userId

  console.log({ userId });
  console.log("friend R", friendRequests);

  // Initialize Firebase
  // const app = initializeApp(firebaseConfig);
  // const functions = getFunctions(app);

  const handleAddFriend = async (friendId) => {
    try {
      await addDoc(collection(database, "friendRequests"), {
        senderId: userId,
        receiverId: friendId,
        status: "pending",
        senderName: capitalizedUsername,
      });
      //--------
      // const sendNotification = httpsCallable(
      //   functions,
      //   "sendFriendRequestNotification"
      // );
      // await sendNotification({
      //   receiverId: friendId,
      //   senderName: capitalizedUsername,
      // });
      //---------
      setSentRequests((prevRequests) => [
        ...prevRequests,
        { senderId: userId, receiverId: friendId, status: "pending" },
      ]);
      alert("Friend request sent!");
    } catch (error) {
      console.error("Error sending friend request:", error);
      alert("Error sending friend request. Please try again later.");
    }
  };

  const handleAcceptFriendRequest = async (requestId, senderId) => {
    try {
      await updateDoc(doc(database, "friendRequests", requestId), {
        status: "accepted",
      });
      await updateDoc(doc(database, "users", userId), {
        friends: arrayUnion(senderId),
      });
      await updateDoc(doc(database, "users", senderId), {
        friends: arrayUnion(userId),
      });
      alert("Friend request accepted!");
    } catch (error) {
      console.error("Error accepting friend request:", error);
      alert("Error accepting friend request. Please try again later.");
    }
  };

  const handleUserPress = async (friendId, friendName) => {
    navigation.navigate("Chat", { userId: friendId, username: friendName });
  };

  const renderItem = ({ item }) => {
    const isFriend =
      item.friends &&
      Array.isArray(item.friends) &&
      item.friends.includes(userId);
    const receivedFriendRequest = friendRequests.find(
      (request) => request.senderId === item.id
    );
    const sentFriendRequest = sentRequests.find(
      (request) => request.receiverId === item.id
    );

    return (
      <View style={styles.userItem}>
        <View style={styles.userInfo}>
          <Text style={styles.username}>{item.username}</Text>
          {isFriend ? (
            <TouchableOpacity
              onPress={() => handleUserPress(item.id, item.username)}
              style={styles.chatButton}
            >
              <Text style={styles.chatButtonText}>Chat</Text>
            </TouchableOpacity>
          ) : receivedFriendRequest ? (
            <TouchableOpacity
              onPress={() =>
                handleAcceptFriendRequest(receivedFriendRequest.id, item.id)
              }
              style={styles.addFriend}
            >
              <Text style={styles.addFriendText}>Accept Request</Text>
            </TouchableOpacity>
          ) : sentFriendRequest ? (
            <View style={styles.pendingRequest}>
              <Text style={styles.pendingRequestText}>Pending</Text>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.addFriend}
              onPress={() => handleAddFriend(item.id)}
            >
              <Text style={styles.addFriendText}>Add Friend</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  const handleLogout = () => {
    navigation.navigate("Login");
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <MaterialCommunityIcons name="logout" size={24} color="black" />
      </TouchableOpacity>
      <View style={styles.header}>
        <Text style={styles.title}>Welcome {capitalizedUsername}</Text>
        <Text style={styles.subtitle}>Connect with your friends</Text>
      </View>

      <FlatList
        data={users.filter((user) => user.id !== userId)}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 20,
    paddingTop: 90,
  },
  header: {
    marginBottom: 40,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 18,
    color: "#666",
    textAlign: "center",
  },
  userItem: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  },
  username: {
    fontSize: 18,
    color: "#333",
    flex: 1,
  },
  addFriend: {
    backgroundColor: "#5865f2",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 10,
    width: 100
  },
  addFriendText: {
    color: "#ffffff",
    fontWeight: "bold",
  },
  chatButton: {
    backgroundColor: "#5865f2",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 10,
    width: "27%",
  },
  chatButtonText: {
    color: "#ffffff",
    fontWeight: "bold",
  },
  pendingRequest: {
    backgroundColor: "#ccc",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 10,
  },
  pendingRequestText: {
    color: "#333",
    fontWeight: "bold",
  },
  logoutButton: {
    alignItems: "flex-end",
  },
});

export default Home;
