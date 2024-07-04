import React, { useState } from "react";
import {
  StyleSheet,
  TextInput,
  View,
  Text,
  TouchableOpacity,
} from "react-native";
import { signInWithEmailAndPassword } from "@firebase/auth";
import { auth } from "../config/firebase";
import { useDispatch } from "react-redux";
import { login } from "../slices/authSlice";
import { Entypo, MaterialIcons } from "@expo/vector-icons";
import { FontAwesome } from "@expo/vector-icons";
import * as SecureStore from "expo-secure-store";

const saveAuthDetails = async (userId, email) => {
  try {
    await SecureStore.setItemAsync("userId", userId);
    await SecureStore.setItemAsync("email", email);
  } catch (error) {
    console.error("Error saving authentication details:", error);
  }
};

const LoginForm = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const dispatch = useDispatch();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const userLogged = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userLogged.user;
      console.log(user);

      if (user) {
        dispatch(
          login({
            userId: user.uid,
            email: user.email,
          })
        );
        navigation.navigate("Home");
        // saveAuthDetails(user.uid, user.email);
      } else {
        console.log("User data not found in Firestore");
      }
    } catch (error) {
      console.error("Unable to Login", error.message);
    }
  };

  const handleSignup = () => {
    navigation.navigate("Signup");
  };

  return (
    <View style={styles.container}>
      <FontAwesome name="wechat" size={45} color="#5864F2" />
      <Text style={styles.title}>iChat</Text>
      <Text style={styles.subtitle}>Please enter your credentials</Text>
      <View style={styles.inputContainer}>
        <MaterialIcons
          name="email"
          size={25}
          color="gray"
          style={styles.icon}
        />
        <TextInput
          style={styles.input}
          placeholder="someone@example.com"
          placeholderTextColor="#999"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          value={email}
          onChangeText={(text) => setEmail(text)}
        />
      </View>
      <View style={styles.inputContainer}>
        <Entypo name="lock" size={25} color="gray" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Someone@123"
          placeholderTextColor="#999"
          secureTextEntry={true}
          value={password}
          onChangeText={(text) => setPassword(text)}
        />
      </View>
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Let's Go!</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={handleSignup}>
        <Text style={styles.signupText}>
          Don't have an account? Sign up now!
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: "35%",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
    paddingTop: "15%",
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 20,
    color: "#666",
  },
  inputContainer: {
    width: "100%",
    marginBottom: 20,
    position: "relative",
  },
  input: {
    width: "100%",
    height: 45,
    paddingHorizontal: 40,
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 15,
    color: "#333",
    backgroundColor: "#eee",
    paddingLeft: 50,
  },
  icon: {
    position: "absolute",
    left: 10,
    top: 10,
    zIndex: 100,
  },
  button: {
    backgroundColor: "#5864F2",
    paddingVertical: 12,
    paddingHorizontal: "40%",
    borderRadius: 15,
    marginBottom: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  signupText: {
    color: "#5864F2",
    fontWeight: "bold",
    fontSize: 14,
  },
});

export default LoginForm;
