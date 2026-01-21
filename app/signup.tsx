import { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  Pressable,
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from 'react-native'
import { router } from 'expo-router'
import { registerUser } from '../services/authService'
import { MaterialIcons } from '@expo/vector-icons'

export default function Signup() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const handleSignup = async () => {
    if (!name || !email || !password || !confirmPassword) {
      return Alert.alert('Validation Error', 'Please fill all fields')
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match')
      return
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters')
      return
    }

    setIsLoading(true)
    try {
      await registerUser(name, email, password)
      Alert.alert('Success', 'Account created successfully!')
      router.replace('/login')
    } catch (error: any) {
      Alert.alert('Error', error.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.card}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.iconCircle}>
                <MaterialIcons name="person-add" size={28} color="white" />
              </View>
              <Text style={styles.title}>Create Account</Text>
              <Text style={styles.subtitle}>Join our recipe community</Text>
            </View>

            {/* Form Fields */}
            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <View style={styles.labelRow}>
                  <MaterialIcons name="person" size={16} color="#F97316" />
                  <Text style={styles.label}>Full Name</Text>
                </View>
                <TextInput
                  placeholder="Enter your full name"
                  value={name}
                  onChangeText={setName}
                  placeholderTextColor="#9CA3AF"
                  style={styles.input}
                  autoCapitalize="words"
                />
              </View>

              <View style={styles.inputGroup}>
                <View style={styles.labelRow}>
                  <MaterialIcons name="email" size={16} color="#F97316" />
                  <Text style={styles.label}>Email</Text>
                </View>
                <TextInput
                  placeholder="Enter your email"
                  value={email}
                  onChangeText={setEmail}
                  placeholderTextColor="#9CA3AF"
                  style={styles.input}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputGroup}>
                <View style={styles.labelRow}>
                  <MaterialIcons name="lock" size={16} color="#F97316" />
                  <Text style={styles.label}>Password</Text>
                </View>
                <View style={styles.passwordContainer}>
                  <TextInput
                    placeholder="Enter password (min 6 chars)"
                    value={password}
                    onChangeText={setPassword}
                    placeholderTextColor="#9CA3AF"
                    secureTextEntry={!showPassword}
                    style={styles.passwordInput}
                  />
                  <Pressable onPress={() => setShowPassword(!showPassword)}>
                    <MaterialIcons
                      name={showPassword ? 'visibility' : 'visibility-off'}
                      size={20}
                      color="#6B7280"
                    />
                  </Pressable>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <View style={styles.labelRow}>
                  <MaterialIcons name="lock" size={16} color="#F97316" />
                  <Text style={styles.label}>Confirm Password</Text>
                </View>
                <View style={styles.passwordContainer}>
                  <TextInput
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    placeholderTextColor="#9CA3AF"
                    secureTextEntry={!showConfirmPassword}
                    style={styles.passwordInput}
                  />
                  <Pressable onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                    <MaterialIcons
                      name={showConfirmPassword ? 'visibility' : 'visibility-off'}
                      size={20}
                      color="#6B7280"
                    />
                  </Pressable>
                </View>
              </View>
            </View>

            {/* Requirements */}
            <View style={styles.requirements}>
              <View style={styles.reqRow}>
                <MaterialIcons
                  name={password.length >= 6 ? 'check-circle' : 'circle'}
                  size={14}
                  color={password.length >= 6 ? '#10B981' : '#9CA3AF'}
                />
                <Text style={[styles.reqText, password.length >= 6 && styles.reqMet]}>
                  At least 6 characters
                </Text>
              </View>
              <View style={styles.reqRow}>
                <MaterialIcons
                  name={password === confirmPassword && password.length > 0 ? 'check-circle' : 'circle'}
                  size={14}
                  color={password === confirmPassword && password.length > 0 ? '#10B981' : '#9CA3AF'}
                />
                <Text style={[styles.reqText, password === confirmPassword && password.length > 0 && styles.reqMet]}>
                  Passwords match
                </Text>
              </View>
            </View>

            {/* Signup Button */}
            <Pressable
              onPress={handleSignup}
              disabled={isLoading}
              style={[styles.button, isLoading && styles.buttonDisabled]}
            >
              {isLoading ? (
                <View style={styles.buttonRow}>
                  <MaterialIcons name="refresh" size={20} color="white" />
                  <Text style={styles.buttonText}>Creating Account...</Text>
                </View>
              ) : (
                <View style={styles.buttonRow}>
                  <MaterialIcons name="how-to-reg" size={20} color="white" />
                  <Text style={styles.buttonText}>Create Account</Text>
                </View>
              )}
            </Pressable>

            {/* Login Link */}
            <View style={styles.loginRow}>
              <Text style={styles.loginText}>Already have an account?</Text>
              <Pressable onPress={() => router.back()} style={styles.loginLink}>
                <Text style={styles.loginLinkText}>Login</Text>
                <MaterialIcons name="arrow-forward" size={14} color="#F97316" />
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 16,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  form: {
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  label: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
    marginLeft: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    backgroundColor: 'white',
    padding: 12,
    fontSize: 15,
    color: '#1f2937',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    backgroundColor: 'white',
    paddingHorizontal: 12,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 15,
    color: '#1f2937',
  },
  requirements: {
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    padding: 12,
    marginBottom: 20,
  },
  reqRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  reqText: {
    fontSize: 13,
    color: '#6B7280',
    marginLeft: 8,
  },
  reqMet: {
    color: '#10B981',
    fontWeight: '500',
  },
  button: {
    backgroundColor: '#10B981',
    padding: 14,
    borderRadius: 10,
    marginBottom: 16,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  loginText: {
    fontSize: 14,
    color: '#4b5563',
  },
  loginLink: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 6,
  },
  loginLinkText: {
    fontSize: 14,
    color: '#F97316',
    fontWeight: '600',
    marginRight: 4,
  },
})