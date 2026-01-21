// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// @ts-ignore - TypeScript might not recognize React Native specific exports
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyDcSDLHbh3N580xEovUKJDKD2JssFgVe10",
  authDomain: "cookbook-18bb4.firebaseapp.com",
  projectId: "cookbook-18bb4",
  storageBucket: "cookbook-18bb4.firebasestorage.app",
  messagingSenderId: "172620470798",
  appId: "1:172620470798:web:783ae5952ee2016a6cfa5f",
  measurementId: "G-BESSGGS5L3"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Firebase Auth with persistence
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});