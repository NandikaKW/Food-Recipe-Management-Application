import { View, Text, Pressable, StyleSheet } from "react-native";

export default function App() {
  return (
    <View style={styles.container}>
      {/* App Title */}
      <Text style={styles.title}>CookBook 🍽️</Text>

      {/* Subtitle */}
      <Text style={styles.subtitle}>
        Organize, explore, and manage your favorite recipes with style!
      </Text>

      {/* Get Started Button */}
      <Pressable style={styles.button}>
        <Text style={styles.buttonText}>Get Started</Text>
      </Pressable>

      {/* Footer Note */}
      <Text style={styles.footer}>NativeWind is working perfectly! 🌟</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFD580", 
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 36,
    color: "#FF6600",
    fontWeight: "bold",
    textShadowColor: "#FFA500",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 3,
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: "#333333",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 22,
  },
  button: {
    backgroundColor: "#F97316",
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8, 
    marginBottom: 20,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
  footer: {
    fontSize: 14,
    color: "#666666",
    textAlign: "center",
  },
});
