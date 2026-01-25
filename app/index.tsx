import { useState, useEffect } from 'react'
import { View, Text, Pressable, StyleSheet } from 'react-native'
import { router } from 'expo-router'
import { getCurrentUser, logoutUser } from '../services/authService'
import { MaterialIcons } from '@expo/vector-icons'
import RecipePreloader from './components/RecipePreloader'

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
      {/* Header Card */}
      <View style={styles.headerCard}>
        <View style={styles.iconCircle}>
          <MaterialIcons name="restaurant" size={36} color="white" />
        </View>
        <Text style={styles.title}>CookBook App</Text>
        <Text style={styles.subtitle}>
          Organize, explore, and manage your favorite recipes with style!
        </Text>
      </View>

      {/* User Status */}
      <View style={styles.userCard}>
        {user ? (
          <View style={styles.userInfo}>
            <MaterialIcons name="account-circle" size={24} color="#F97316" />
            <Text style={styles.userEmail}>
              Welcome, {user.email?.split('@')[0]}!
            </Text>
          </View>
        ) : (
          <View style={styles.userInfo}>
            <MaterialIcons name="restaurant-menu" size={24} color="#6B7280" />
            <Text style={styles.guestText}>
              Sign in to create and explore recipes!
            </Text>
          </View>
        )}
      </View>

      {/* Action Buttons */}
      <View style={styles.actionsCard}>
        {user ? (
          <>
            {/* Browse Recipes Button */}
            <Pressable
              style={[styles.actionButton, styles.primaryButton]}
              onPress={() => navigateWithPreloader('/recipes')}
              disabled={isNavigating}
            >
              <View style={styles.buttonContent}>
                <MaterialIcons name="menu-book" size={24} color="white" />
                <Text style={styles.buttonText}>Browse Recipes</Text>
              </View>
              <MaterialIcons name="chevron-right" size={24} color="white" />
            </Pressable>

            {/* Add Recipe Button */}
            <Pressable
              style={[styles.actionButton, styles.successButton]}
              onPress={() => navigateWithPreloader('/recipes/add')}
              disabled={isNavigating}
            >
              <View style={styles.buttonContent}>
                <MaterialIcons name="add-circle-outline" size={24} color="white" />
                <Text style={styles.buttonText}>Add New Recipe</Text>
              </View>
              <MaterialIcons name="chevron-right" size={24} color="white" />
            </Pressable>

            {/* Logout Button */}
            <Pressable
              style={[styles.actionButton, styles.dangerButton]}
              onPress={handleLogout}
              disabled={isNavigating}
            >
              <View style={styles.buttonContent}>
                <MaterialIcons name="exit-to-app" size={24} color="white" />
                <Text style={styles.buttonText}>Logout</Text>
              </View>
              <MaterialIcons name="chevron-right" size={24} color="white" />
            </Pressable>
          </>
        ) : (
          
          <Pressable
            style={[styles.actionButton, styles.primaryButton]}
            onPress={() => router.push('/login')}
            disabled={isNavigating}
          >
            <View style={styles.buttonContent}>
              <MaterialIcons name="restaurant-menu" size={24} color="white" />
              <Text style={styles.buttonText}>Login to Get Started</Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color="white" />
          </Pressable>
        )}

        {/* Quick Stats */}
        {user && (
          <View style={styles.statsCard}>
            <View style={styles.statItem}>
              <MaterialIcons name="local-dining" size={20} color="#F59E0B" />
              <Text style={styles.statNumber}>∞</Text>
              <Text style={styles.statLabel}>Recipes</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <MaterialIcons name="timer" size={20} color="#10B981" />
              <Text style={styles.statNumber}>∞</Text>
              <Text style={styles.statLabel}>Cooking</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <MaterialIcons name="share" size={20} color="#3B82F6" />
              <Text style={styles.statNumber}>∞</Text>
              <Text style={styles.statLabel}>Share</Text>
            </View>
          </View>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    padding: 20,
    paddingTop: 40,
  },
  headerCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    marginBottom: 20,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F97316',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
    shadowColor: '#F97316',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 22,
  },
  userCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userEmail: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
    marginLeft: 10,
  },
  guestText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 10,
  },
  actionsCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    padding: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    marginBottom: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 18,
    borderRadius: 14,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  primaryButton: {
    backgroundColor: '#F97316',
  },
  successButton: {
    backgroundColor: '#10B981',
  },
  dangerButton: {
    backgroundColor: '#EF4444',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 12,
  },
  statsCard: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 15,
    marginTop: 10,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#E5E7EB',
  },
})