import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";

import { auth, db } from "./firebase";
import { doc, setDoc , getDoc } from "firebase/firestore";


//  Register user
export const registerUser = async (name: string, email: string, password: string) => {
  try {
    // Create user with email and password
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    
    // Update user profile with name
    await updateProfile(userCredential.user, {
      displayName: name,
    });

    // Store additional user data in Firestore
    await setDoc(doc(db, "users", userCredential.user.uid), {
      name: name,
      email: email,
      createdAt: new Date().toISOString(),
      uid: userCredential.user.uid,
    });

    return userCredential.user;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

//  Login user
export const loginUser = async (email: string, password: string) => {
  const userCredential = await signInWithEmailAndPassword(
    auth,
    email,
    password
  );
  return userCredential.user;
};

//  Logout user
export const logoutUser = async () => {
  await signOut(auth);
};

//  Get current user
export const getCurrentUser = () => {
  return auth.currentUser;
};

// Get user data by ID
export const getUserData = async (userId: string) => {
  try {
    if (!userId) return null;
    
    const userDoc = await getDoc(doc(db, "users", userId));
    if (userDoc.exists()) {
      return userDoc.data();
    }
    return null;
  } catch (error) {
    console.error("Error getting user data:", error);
    return null;
  }
};


