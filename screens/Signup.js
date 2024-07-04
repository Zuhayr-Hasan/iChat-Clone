import React, { useState } from "react";
import {
  StyleSheet,
  TextInput,
  View,
  Text,
  TouchableOpacity,
} from "react-native";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, database } from "../config/firebase"; // Assuming you have database imported in config
import { collection, doc, setDoc } from "firebase/firestore";

const SignupForm = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignup = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Store user data in Firestore
      const userDocRef = doc(collection(database, "users"), user.uid);
      await setDoc(userDocRef, {
        email: user.email,
        uid: user.uid,
        username: email.split("@")[0], // You can change this to take input from user for username
        friends: [],
        userId: Math.floor(Math.random() * 100000), // For example purposes, a random number as userId
      });

      console.log("Successfully signed up and stored user data");
      navigation.navigate("Login");
    } catch (error) {
      console.log("Unable to Signup", error.message);
    }
  };

  const handleLogin = () => {
    navigation.navigate("Login");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.signup}>Signup</Text>
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="someone@example.com"
          placeholderTextColor="#999"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={(text) => setEmail(text)}
        />
      </View>
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          placeholder="Someone@123"
          placeholderTextColor="#999"
          secureTextEntry={true}
          value={password}
          onChangeText={(text) => setPassword(text)}
        />
      </View>
      <TouchableOpacity style={styles.button} onPress={handleSignup}>
        <Text style={styles.buttonText}>Sign Up</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={handleLogin}>
        <Text style={styles.signupText}>
          Already have an account? Log in now!
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 20,
    backgroundColor: "#fff",
    paddingTop: "50%",
  },
  signup: {
    fontSize: 24,
    marginBottom: 25,
  },
  inputContainer: {
    width: "100%",
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: "#333",
  },
  input: {
    width: "100%",
    height: 45,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 15,
    color: "#333",
    backgroundColor: "#eee",
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

export default SignupForm;
