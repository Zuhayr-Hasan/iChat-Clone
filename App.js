import React, { useEffect } from "react";
import { NavigationContainer, StackActions } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Provider, useDispatch } from "react-redux";
import store from "./utils/store";
import * as SecureStore from "expo-secure-store";
import { login } from "./slices/authSlice";
// import { AppRegistry } from "react-native";
// import { usePushNotifications } from "./screens/usePushNotifications";
import messaging from "@react-native-firebase/messaging";

import Chat from "./screens/Chat";
import Login from "./screens/Login";
import Signup from "./screens/Signup";
import Home from "./screens/Home";

const Stack = createStackNavigator();

function AuthStack() {
  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="Signup" component={Signup} />
    </Stack.Navigator>
  );
}

function ChatStack() {
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Chat" component={Chat} />
      <Stack.Screen name="Home" component={Home} />
    </Stack.Navigator>
  );
}

function RootNavigator({ navigation }) {
  const dispatch = useDispatch();

  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        const userId = await SecureStore.getItemAsync("userId");
        const email = await SecureStore.getItemAsync("email");
        console.log(userId, email);
        if (userId && email) {
          dispatch(login({ userId, email }));
          // Replace the current screen with "Home"
          navigation.dispatch(StackActions.replace("Home"));

          const fcmToken = await messaging().getToken();
          await updateDoc(doc(database, "users", userId), { fcmToken });
        }
      } catch (error) {
        console.error("Error checking authentication:", error);
      }
    };

    checkAuthentication();
  }, [dispatch, navigation]);

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Auth"
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="Auth" component={AuthStack} />
        <Stack.Screen name="Home" component={ChatStack} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  // const getToken = async () => {
  //   const authStatus = await messaging().requestPermission();
  //   const enabled =
  //     authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
  //     authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  //   const token = await messaging().getToken();
  //   console.log("TOKEN__", token);
  // };

  // useEffect(() => {
  //   getToken();
  // }, []);

  //------------------------------
  useEffect(() => {
    const getToken = async () => {
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (enabled) {
        const fcmToken = await messaging().getToken();
        console.log("TOKEN__", fcmToken);

        // Save the FCM token to the Firestore user document
        const userId = await SecureStore.getItemAsync("userId");
        if (userId) {
          await updateDoc(doc(database, "users", userId), { fcmToken });
        }
      }
    };

    getToken();
  }, []);
  //------------------------------

  // useEffect(() => {
  //   const unsubscribe = messaging().onMessage(async (remoteMessage) => {
  //     Alert.alert("A new FCM message arrived!", JSON.stringify(remoteMessage));
  //   });

  //   return unsubscribe;
  // }, []);

  // const { expoPushNotifications, notifications } = usePushNotifications();

  // const data = JSON.stringify(notifications, undefined, 2);

  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <RootNavigator />
      </SafeAreaProvider>
    </Provider>
  );
}
