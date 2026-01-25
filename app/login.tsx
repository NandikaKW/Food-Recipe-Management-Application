import { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  Pressable,
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
  StyleSheet
} from 'react-native'
import { router } from 'expo-router'
import { loginUser } from '../services/authService'
import { MaterialIcons } from '@expo/vector-icons'
import Preloader from './components/Preloader' 

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showPreloader, setShowPreloader] = useState(false) 

  const handleLogin = async () => {
    if (!email || !password) {
      return Alert.alert('Validation Error', 'Please enter email and password')
    }

    setIsLoading(true)
    try {
      await loginUser(email, password)
      
      
      setShowPreloader(true) 
      
      
      setTimeout(() => {
        router.replace('/')
      }, 2000)
      
    } catch (error: any) {
      Alert.alert('Login Error', error.message)
      setIsLoading(false)
    }
  }

  
  if (showPreloader) {
    return <Preloader />
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.container}>
        {/* Login Card */}
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconCircle}>
              <MaterialIcons name="lock" size={32} color="white" />
            </View>
            <Text style={styles.title}>Login</Text>
            <Text style={styles.subtitle}>Access your account</Text>
          </View>

          {/* Email Field */}
          <View style={styles.inputGroup}>
            <View style={styles.labelContainer}>
              <MaterialIcons name="email" size={18} color="#F97316" />
              <Text style={styles.label}>Email</Text>
            </View>
            <View style={styles.inputContainer}>
              <TextInput
                placeholder="Enter your email"
                value={email}
                onChangeText={setEmail}
                placeholderTextColor="#9CA3AF"
                style={styles.textInput}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          {/* Password Field */}
          <View style={styles.inputGroup}>
            <View style={styles.labelContainer}>
              <MaterialIcons name="lock" size={18} color="#F97316" />
              <Text style={styles.label}>Password</Text>
            </View>
            <View style={styles.inputContainer}>
              <TextInput
                placeholder="Enter your password"
                value={password}
                onChangeText={setPassword}
                placeholderTextColor="#9CA3AF"
                secureTextEntry={!showPassword}
                style={[styles.textInput, { flex: 1 }]}
              />
              <Pressable
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeButton}
              >
                <MaterialIcons
                  name={showPassword ? 'visibility' : 'visibility-off'}
                  size={22}
                  color="#6B7280"
                />
              </Pressable>
            </View>
          </View>

          {/* Login Button */}
          <Pressable
            onPress={handleLogin}
            disabled={isLoading}
            style={[styles.loginButton, isLoading && styles.buttonDisabled]}
          >
            {isLoading ? (
              <View style={styles.buttonContent}>
                <MaterialIcons name="refresh" size={22} color="white" />
                <Text style={styles.buttonText}>Authenticating...</Text>
              </View>
            ) : (
              <View style={styles.buttonContent}>
                <MaterialIcons name="login" size={22} color="white" />
                <Text style={styles.buttonText}>Login</Text>
              </View>
            )}
          </Pressable>

          {/* Sign Up Link */}
          <View style={styles.signupContainer}>
            <Text style={styles.signupText}>Don't have an account? </Text>
            <Pressable
              onPress={() => router.push('/signup')}
              style={styles.signupLink}
            >
              <Text style={styles.signupLinkText}>Sign Up</Text>
              <MaterialIcons
                name="arrow-forward"
                size={16}
                color="#F97316"
                style={{ marginLeft: 4 }}
              />
            </Pressable>
          </View>
        </View>
      </View>
    </TouchableWithoutFeedback>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    padding: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  iconCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#F97316',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
    shadowColor: '#F97316',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 20,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    marginLeft: 4,
  },
  label: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
    marginLeft: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    backgroundColor: 'white',
    overflow: 'hidden',
  },
  textInput: {
    flex: 1,
    padding: 15,
    fontSize: 16,
    color: '#1f2937',
  },
  eyeButton: {
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  loginButton: {
    backgroundColor: '#F97316',
    padding: 16,
    borderRadius: 12,
    marginTop: 10,
    shadowColor: '#F97316',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 10,
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 25,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  signupText: {
    fontSize: 16,
    color: '#4b5563',
  },
  signupLink: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  signupLinkText: {
    fontSize: 16,
    color: '#F97316',
    fontWeight: '600',
  },
})