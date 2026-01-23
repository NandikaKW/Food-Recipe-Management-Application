import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  Alert,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { getRecipeById, deleteRecipe, toggleFavorite, isRecipeInFavorites } from '../../services/recipeService';
import { getCurrentUser, getUserData } from '../../services/authService';
import { MaterialIcons } from '@expo/vector-icons';

export default function RecipeDetail() {
  const { id } = useLocalSearchParams();
  const [recipe, setRecipe] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const currentUser = getCurrentUser();
  const [creatorName, setCreatorName] = useState<string>('User');
  
  // 🟣 SIMPLE COOKING TIMER STATE
  const [cookingTimer, setCookingTimer] = useState({
    seconds: 0,
    active: false,
    paused: false,
  });
  const timerInterval = useRef<any>(null);

  useEffect(() => {
    if (typeof id === 'string') {
      loadRecipe(id);
    }
  }, [id]);

  useEffect(() => {
    if (currentUser && recipe) {
      checkIfFavorite();
    }
  }, [currentUser, recipe]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerInterval.current) {
        clearInterval(timerInterval.current);
      }
    };
  }, []);

  const loadRecipe = async (recipeId: string) => {
    try {
      setLoading(true);
      const recipeData = await getRecipeById(recipeId);
      if (!recipeData) {
        setRecipe(null);
        return;
      }
      setRecipe(recipeData);

      if (recipeData.createdBy) {
        const userData = await getUserData(recipeData.createdBy);
        setCreatorName(userData?.name || 'Unknown User');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load recipe');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const checkIfFavorite = async () => {
    if (!currentUser || !recipe) return;
    
    try {
      const favorite = await isRecipeInFavorites(currentUser.uid, recipe.id);
      setIsFavorite(favorite);
    } catch (error) {
      console.error('Error checking favorite:', error);
    }
  };

  const handleToggleFavorite = async () => {
    if (!currentUser) {
      Alert.alert('Login Required', 'Please login to save favorites');
      router.push('/login');
      return;
    }

    if (!recipe) return;

    try {
      setFavoriteLoading(true);
      await toggleFavorite(currentUser.uid, recipe.id, isFavorite);
      setIsFavorite(!isFavorite);
      
      Alert.alert('Success', isFavorite ? 'Removed from favorites' : 'Added to favorites');
    } catch (error: any) {
      Alert.alert('Error', 'Failed to update favorites');
      console.error(error);
    } finally {
      setFavoriteLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert('Delete Recipe', 'Are you sure you want to delete this recipe?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            setDeleting(true);
            if (typeof id === 'string') {
              await deleteRecipe(id);
              Alert.alert('Success', 'Recipe deleted', [{ text: 'OK', onPress: () => router.back() }]);
            }
          } catch (error) {
            Alert.alert('Error', 'Failed to delete recipe');
          } finally {
            setDeleting(false);
          }
        },
      },
    ]);
  };

  const handleEdit = () => {
    if (typeof id === 'string') router.push(`/recipes/edit/${id}`);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy':
        return '#10B981';
      case 'Medium':
        return '#F59E0B';
      case 'Hard':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  // 🟣 SIMPLE TIMER FUNCTIONS (keep it simple)

  // Start timer with minutes
  const startCookingTimer = (minutes: number) => {
    if (minutes <= 0) return;
    
    // Stop any existing timer
    if (timerInterval.current) {
      clearInterval(timerInterval.current);
    }
    
    // Start new timer
    const seconds = minutes * 60;
    setCookingTimer({ seconds, active: true, paused: false });
    
    timerInterval.current = setInterval(() => {
      setCookingTimer(prev => {
        if (prev.seconds <= 1) {
          clearInterval(timerInterval.current);
          Alert.alert('⏰ Timer Complete!', 'Your cooking time is up!');
          return { seconds: 0, active: false, paused: false };
        }
        return { ...prev, seconds: prev.seconds - 1 };
      });
    }, 1000);
  };

  // Pause timer
  const pauseCookingTimer = () => {
    if (!cookingTimer.active || cookingTimer.paused) return;
    
    clearInterval(timerInterval.current);
    setCookingTimer(prev => ({ ...prev, paused: true }));
  };

  // Resume timer
  const resumeCookingTimer = () => {
    if (!cookingTimer.active || !cookingTimer.paused) return;
    
    setCookingTimer(prev => ({ ...prev, paused: false }));
    
    timerInterval.current = setInterval(() => {
      setCookingTimer(prev => {
        if (prev.seconds <= 1) {
          clearInterval(timerInterval.current);
          Alert.alert('⏰ Timer Complete!', 'Your cooking time is up!');
          return { seconds: 0, active: false, paused: false };
        }
        return { ...prev, seconds: prev.seconds - 1 };
      });
    }, 1000);
  };

  // Reset timer
  const resetCookingTimer = () => {
    if (timerInterval.current) {
      clearInterval(timerInterval.current);
    }
    setCookingTimer({ seconds: 0, active: false, paused: false });
  };

  // Format time display
  const formatCookingTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingCard}>
          <ActivityIndicator size="large" color="#F97316" />
          <Text style={styles.loadingText}>Loading recipe...</Text>
        </View>
      </View>
    );
  }

  if (!recipe) {
    return (
      <View style={styles.container}>
        <View style={styles.errorCard}>
          <MaterialIcons name="error-outline" size={48} color="#EF4444" />
          <Text style={styles.errorTitle}>Recipe Not Found</Text>
          <Text style={styles.errorText}>The recipe you're looking for doesn't exist.</Text>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  const isOwner = currentUser?.uid === recipe.createdBy;

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Recipe Image */}
        {recipe.imageUrl ? (
          <Image source={{ uri: recipe.imageUrl }} style={styles.image} />
        ) : (
          <View style={[styles.image, styles.noImage]}>
            <MaterialIcons name="restaurant" size={60} color="#9CA3AF" />
          </View>
        )}

        <View style={styles.contentCard}>
          {/* Header */}
          <View style={styles.header}>
            <Pressable style={styles.backButtonIcon} onPress={() => router.back()}>
              <MaterialIcons name="arrow-back" size={24} color="#6B7280" />
            </Pressable>
            
            <View style={styles.headerActions}>
              {/* Favorite Button */}
              <Pressable 
                style={styles.headerIconButton} 
                onPress={handleToggleFavorite}
                disabled={favoriteLoading}
              >
                {favoriteLoading ? (
                  <ActivityIndicator size="small" color="#EF4444" />
                ) : (
                  <MaterialIcons 
                    name={isFavorite ? "favorite" : "favorite-border"} 
                    size={20} 
                    color="#EF4444" 
                  />
                )}
              </Pressable>
              
              {/* Edit and Delete buttons for owner */}
              {isOwner && (
                <>
                  <Pressable style={styles.headerIconButton} onPress={handleEdit}>
                    <MaterialIcons name="edit" size={20} color="#3B82F6" />
                  </Pressable>
                  <Pressable 
                    style={styles.headerIconButton} 
                    onPress={handleDelete}
                    disabled={deleting}
                  >
                    {deleting ? (
                      <ActivityIndicator size="small" color="#EF4444" />
                    ) : (
                      <MaterialIcons name="delete-outline" size={20} color="#EF4444" />
                    )}
                  </Pressable>
                </>
              )}
            </View>
          </View>

          {/* Recipe Title and Creator */}
          <View style={styles.titleSection}>
            <Text style={styles.title}>{recipe.title}</Text>
            
            {/* Creator Info */}
            <View style={styles.creatorContainer}>
              <View style={styles.creatorIcon}>
                <MaterialIcons name="person" size={16} color="#6B7280" />
              </View>
              <Text style={styles.creatorText}>
                Added by{' '}
                <Text style={styles.creatorName}>
                  {recipe.createdBy === currentUser?.uid ? 'You' : creatorName}
                </Text>
              </Text>
            </View>
          </View>

          {/* 🟣 Simple Cooking Timer */}
          <View style={styles.simpleTimerCard}>
            <View style={styles.timerHeader}>
              <MaterialIcons name="timer" size={22} color="#10B981" />
              <Text style={styles.timerTitle}>Cooking Timer</Text>
            </View>
            
            {cookingTimer.active ? (
              <>
                <View style={styles.timerDisplay}>
                  <Text style={styles.timerText}>
                    {formatCookingTime(cookingTimer.seconds)}
                  </Text>
                  <Text style={styles.timerStatus}>
                    {cookingTimer.paused ? '⏸️ Paused' : '⏳ Cooking...'}
                  </Text>
                </View>
                
                <View style={styles.timerButtons}>
                  {cookingTimer.paused ? (
                    <Pressable 
                      style={styles.timerButtonGreen}
                      onPress={resumeCookingTimer}
                    >
                      <MaterialIcons name="play-arrow" size={18} color="white" />
                      <Text style={styles.buttonText}>Resume</Text>
                    </Pressable>
                  ) : (
                    <Pressable 
                      style={styles.timerButtonYellow}
                      onPress={pauseCookingTimer}
                    >
                      <MaterialIcons name="pause" size={18} color="white" />
                      <Text style={styles.buttonText}>Pause</Text>
                    </Pressable>
                  )}
                  
                  <Pressable 
                    style={styles.timerButtonGray}
                    onPress={resetCookingTimer}
                  >
                    <MaterialIcons name="refresh" size={18} color="white" />
                    <Text style={styles.buttonText}>Reset</Text>
                  </Pressable>
                </View>
              </>
            ) : (
              <Pressable 
                style={styles.startTimerButton}
                onPress={() => startCookingTimer(recipe.cookingTime)}
              >
                <MaterialIcons name="play-arrow" size={20} color="white" />
                <Text style={styles.startButtonText}>Start {recipe.cookingTime} min Timer</Text>
              </Pressable>
            )}
          </View>

          {/* Recipe Meta Cards */}
          <View style={styles.metaCards}>
            <View style={styles.metaCard}>
              <View style={styles.metaIconContainer}>
                <MaterialIcons name="category" size={24} color="#F97316" />
              </View>
              <Text style={styles.metaLabel}>Category</Text>
              <Text style={styles.metaValue}>{recipe.category}</Text>
            </View>

            <View style={styles.metaCard}>
              <View style={[styles.metaIconContainer, { backgroundColor: getDifficultyColor(recipe.difficulty) + '20' }]}>
                <MaterialIcons 
                  name="speed" 
                  size={24} 
                  color={getDifficultyColor(recipe.difficulty)} 
                />
              </View>
              <Text style={styles.metaLabel}>Difficulty</Text>
              <Text style={[styles.metaValue, { color: getDifficultyColor(recipe.difficulty) }]}>
                {recipe.difficulty}
              </Text>
            </View>

            <View style={styles.metaCard}>
              <View style={styles.metaIconContainer}>
                <MaterialIcons name="timer" size={24} color="#10B981" />
              </View>
              <Text style={styles.metaLabel}>Time</Text>
              <Text style={[styles.metaValue, { color: '#10B981' }]}>{recipe.cookingTime} min</Text>
            </View>
          </View>

          {/* Description Card */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <MaterialIcons name="description" size={22} color="#F97316" />
              <Text style={styles.sectionTitle}>Description</Text>
            </View>
            <Text style={styles.description}>{recipe.description}</Text>
          </View>

          {/* Ingredients Card */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <MaterialIcons name="restaurant" size={22} color="#F97316" />
              <Text style={styles.sectionTitle}>Ingredients</Text>
              <View style={styles.countBadge}>
                <Text style={styles.countBadgeText}>{recipe.ingredients?.length || 0}</Text>
              </View>
            </View>
            <View style={styles.ingredientsGrid}>
              {recipe.ingredients?.map((ingredient: string, index: number) => (
                <View key={index} style={styles.ingredientItem}>
                  <View style={styles.ingredientBullet}>
                    <MaterialIcons name="check-circle" size={16} color="#10B981" />
                  </View>
                  <Text style={styles.ingredientText}>{ingredient}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Steps Card */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <MaterialIcons name="list" size={22} color="#F97316" />
              <Text style={styles.sectionTitle}>Steps</Text>
              <View style={styles.countBadge}>
                <Text style={styles.countBadgeText}>{recipe.steps?.length || 0}</Text>
              </View>
            </View>
            <View style={styles.stepsList}>
              {recipe.steps?.map((step: string, index: number) => (
                <View key={index} style={styles.stepItem}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>{index + 1}</Text>
                  </View>
                  <View style={styles.stepContent}>
                    <Text style={styles.stepText}>{step}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    paddingTop: 50,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 40,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#6B7280',
  },
  errorCard: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 20,
    marginBottom: 10,
  },
  errorText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 30,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  image: {
    width: '100%',
    height: 280,
  },
  noImage: {
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentCard: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginTop: -30,
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    marginBottom: 30,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButtonIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerIconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleSection: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  creatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  creatorIcon: {
    marginRight: 6,
  },
  creatorText: {
    fontSize: 14,
    color: '#6B7280',
  },
  creatorName: {
    fontWeight: '600',
    color: '#1f2937',
  },
  // 🟣 Timer Styles
  simpleTimerCard: {
    backgroundColor: '#F0FDF4',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#10B98120',
  },
  timerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  timerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#10B981',
    marginLeft: 10,
  },
  timerDisplay: {
    alignItems: 'center',
    marginBottom: 16,
  },
  timerText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#10B981',
  },
  timerStatus: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  timerButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  timerButtonGreen: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    padding: 12,
    borderRadius: 10,
    gap: 8,
  },
  timerButtonYellow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F59E0B',
    padding: 12,
    borderRadius: 10,
    gap: 8,
  },
  timerButtonGray: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6B7280',
    padding: 12,
    borderRadius: 10,
    gap: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  startTimerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    padding: 16,
    borderRadius: 12,
    gap: 10,
  },
  startButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  // End Timer Styles
  metaCards: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 28,
    gap: 12,
  },
  metaCard: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  metaIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFEDD5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  metaLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  metaValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  sectionCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginLeft: 10,
    flex: 1,
  },
  countBadge: {
    backgroundColor: 'white',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  countBadgeText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '600',
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#4B5563',
  },
  ingredientsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  ingredientItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    flexBasis: '48%',
    flexGrow: 1,
  },
  ingredientBullet: {
    marginRight: 8,
  },
  ingredientText: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
  },
  stepsList: {
    gap: 12,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
  },
  stepNumber: {
    width: 40,
    height: 40,
    backgroundColor: '#F97316',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumberText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  stepContent: {
    flex: 1,
    padding: 14,
  },
  stepText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#374151',
  },
  backButton: {
    backgroundColor: '#F97316',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});