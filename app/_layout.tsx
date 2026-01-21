import "../global.css";
import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import { getCurrentUser } from "../services/authService";
import Preloader from "./components/Preloader";
import { View, StyleSheet } from "react-native";

export default function RootLayout() {
  const [loading, setLoading] = useState(true);
  const [user] = useState(getCurrentUser());

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000); // Match the preloader duration
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <Preloader />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: "#f8fafc",
        },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="login" />
      <Stack.Screen name="signup" />
      <Stack.Screen name="recipes/index" />
      <Stack.Screen name="recipes/add" />
      <Stack.Screen name="recipes/[id]" />
      <Stack.Screen name="recipes/edit/[id]" />
    </Stack>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});