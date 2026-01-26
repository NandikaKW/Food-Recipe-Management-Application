import { useState, useEffect } from 'react'
import { 
  View, 
  Text, 
  Pressable, 
  StyleSheet, 
  Image,
  Dimensions 
} from 'react-native'
import { router } from 'expo-router'
import { getCurrentUser, logoutUser } from '../services/authService'
import { MaterialIcons } from '@expo/vector-icons'
import RecipePreloader from './components/RecipePreloader'

const { width } = Dimensions.get('window')
//Home Screen
export default function App() {
  const [user, setUser] = useState(getCurrentUser())
  const [showPreloader, setShowPreloader] = useState(false)
  const [isNavigating, setIsNavigating] = useState(false)

  useEffect(() => {
    setUser(getCurrentUser())
  }, [])

  const handleLogout = async () => {
    await logoutUser()
    setUser(null)
    router.replace('/')
  }

  const navigateWithPreloader = (path: any) => {
    if (isNavigating) return
    
    setIsNavigating(true)
    setShowPreloader(true)
    
    setTimeout(() => {
      router.push(path)
      setShowPreloader(false)
      setIsNavigating(false)
    }, 3000)
  }

  if (showPreloader) {
    return <RecipePreloader />
  }

  return (
    <View style={styles.container}>
      {/* Main Logo  like preloader */}
      <View style={styles.logoContainer}>
        <Image 
          source={require('../assets/images/logo4.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      {/* Welcome Section  */}
      <View style={styles.welcomeSection}>
        <View style={styles.welcomeContainer}>
          <Text style={styles.welcomeText}>
            {user ? `Welcome, ${user.email?.split('@')[0]}` : 'Welcome to CookBook'}
          </Text>
          <View style={styles.welcomeUnderline} />
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.buttonsSection}>
        {user ? (
          <>
            <Pressable
              style={[styles.button, styles.buttonOrange]}
              onPress={() => navigateWithPreloader('/recipes')}
            >
              <MaterialIcons name="menu-book" size={24} color="white" />
              <Text style={styles.buttonText}>Browse Recipes</Text>
            </Pressable>

            <Pressable
              style={[styles.button, styles.buttonGreen]}
              onPress={() => navigateWithPreloader('/recipes/add')}
            >
              <MaterialIcons name="add-circle" size={24} color="white" />
              <Text style={styles.buttonText}>Add New Recipe</Text>
            </Pressable>

            <Pressable
              style={[styles.button, styles.buttonRed]}
              onPress={handleLogout}
            >
              <MaterialIcons name="logout" size={24} color="white" />
              <Text style={styles.buttonText}>Logout</Text>
            </Pressable>
          </>
        ) : (
          <Pressable
            style={[styles.button, styles.buttonOrange]}
            onPress={() => router.push('/login')}
          >
            <MaterialIcons name="restaurant" size={24} color="white" />
            <Text style={styles.buttonText}>Login to Get Started</Text>
          </Pressable>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  logoContainer: {
    width: width * 0.9,
    height: width * 0.9,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  welcomeSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  welcomeContainer: {
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 28,
    color: '#000000', 
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 3,
  },
  welcomeUnderline: {
    width: 60,
    height: 3,
    backgroundColor: '#F97316',
    marginTop: 8,
    borderRadius: 2,
  },
  buttonsSection: {
    width: '100%',
    maxWidth: 300,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    width: '100%',
  },
  buttonOrange: {
    backgroundColor: '#F97316',
  },
  buttonGreen: {
    backgroundColor: '#10B981',
  },
  buttonRed: {
    backgroundColor: '#EF4444',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
})