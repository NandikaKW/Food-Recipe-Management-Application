import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  Alert,
  Pressable,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { 
  getRecipeById, 
  deleteRecipe, 
  toggleFavorite, 
  isRecipeInFavorites,
  addRecipeReview, 
  getRecipeReviews, 
  calculateAverageRating,
  getUserReview,
  updateRecipeReview,
  deleteRecipeReview,
  type Review 
} from '../../services/recipeService';
import { getCurrentUser, getUserData } from '../../services/authService';
import { MaterialIcons } from '@expo/vector-icons';
import ReviewModal from './../components/ReviewModal';
import RecipePreloader from '../components/SplashScreen'; 

export default function RecipeDetail() {
  const { id } = useLocalSearchParams();
  const [recipe, setRecipe] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const currentUser = getCurrentUser();
  const [creatorName, setCreatorName] = useState<string>('User');

  // REVIEW STATES
  const [reviews, setReviews] = useState<Review[]>([]);
  const [averageRating, setAverageRating] = useState({ average: 0, total: 0, count: 0 });
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [userReview, setUserReview] = useState<Review | null>(null);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  
  
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
    if (recipe) {
      loadReviews();
      if (currentUser) {
        checkUserReview();
      }
    }
  }, [recipe, currentUser]);

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

  // REVIEW FUNCTIONS
  const loadReviews = async () => {
    if (!recipe) return;
    
    try {
      setReviewsLoading(true);
      const [fetchedReviews, ratingData] = await Promise.all([
        getRecipeReviews(recipe.id),
        calculateAverageRating(recipe.id)
      ]);
      
      setReviews(fetchedReviews);
      setAverageRating(ratingData);
    } catch (error) {
      console.error('Error loading reviews:', error);
    } finally {
      setReviewsLoading(false);
    }
  };

  const checkUserReview = async () => {
    if (!recipe || !currentUser) return;
    
    try {
      const review = await getUserReview(recipe.id, currentUser.uid);
      setUserReview(review);
    } catch (error) {
      console.error('Error checking user review:', error);
    }
  };

  const handleAddReview = async (rating: number, comment: string) => {
    if (!currentUser || !recipe) return;
    
    try {
      if (userReview) {
        // Update existing review
        await updateRecipeReview(userReview.id!, recipe.id, { rating, comment });
        Alert.alert('Success', 'Review updated successfully');
      } else {
        // Add new review
        await addRecipeReview(recipe.id, {
          userId: currentUser.uid,
          userName: currentUser.displayName || currentUser.email?.split('@')[0] || 'User',
          rating,
          comment
        });
        Alert.alert('Success', 'Review added successfully');
      }
      
      // Reload reviews
      await loadReviews();
      await checkUserReview();
    } catch (error) {
      Alert.alert('Error', 'Failed to save review');
      console.error(error);
    }
  };

  const handleDeleteReview = async () => {
    if (!userReview || !recipe) return;
    
    Alert.alert('Delete Review', 'Are you sure you want to delete your review?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteRecipeReview(recipe.id, userReview.id!);
            setUserReview(null);
            await loadReviews();
            Alert.alert('Success', 'Review deleted successfully');
          } catch (error) {
            Alert.alert('Error', 'Failed to delete review');
          }
        },
      },
    ]);
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

  // SIMPLE TIMER FUNCTIONS
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

  const pauseCookingTimer = () => {
    if (!cookingTimer.active || cookingTimer.paused) return;
    
    clearInterval(timerInterval.current);
    setCookingTimer(prev => ({ ...prev, paused: true }));
  };

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

  const resetCookingTimer = () => {
    if (timerInterval.current) {
      clearInterval(timerInterval.current);
    }
    setCookingTimer({ seconds: 0, active: false, paused: false });
  };

  const formatCookingTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Use the preloader when loading
  if (loading) {
    return <RecipePreloader />;
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
                  <View style={styles.favoriteLoadingContainer}>
                    <MaterialIcons 
                      name={isFavorite ? "favorite" : "favorite-border"} 
                      size={20} 
                      color="#EF4444" 
                    />
                  </View>
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
                      <View style={styles.deleteLoadingContainer}>
                        <MaterialIcons name="delete-outline" size={20} color="#EF4444" />
                      </View>
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

          {/* Simple Cooking Timer */}
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

          {/* Recipe Meta Cards UI */}
          <View style={styles.metaCardsContainer}>
            <Text style={styles.metaCardsTitle}>Recipe Details</Text>
            <View style={styles.metaCards}>
              <View style={styles.metaCard}>
                <View style={styles.metaIconContainer}>
                  <MaterialIcons name="category" size={22} color="#F97316" />
                </View>
                <Text style={styles.metaLabel}>Category</Text>
                <Text style={styles.metaValue} numberOfLines={1}>{recipe.category}</Text>
              </View>

              <View style={styles.metaCard}>
                <View style={[styles.metaIconContainer, { backgroundColor: getDifficultyColor(recipe.difficulty) + '15' }]}>
                  <MaterialIcons 
                    name="speed" 
                    size={22} 
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
                  <MaterialIcons name="timer" size={22} color="#10B981" />
                </View>
                <Text style={styles.metaLabel}>Time</Text>
                <Text style={[styles.metaValue, { color: '#10B981' }]}>{recipe.cookingTime} min</Text>
              </View>

              {/* Rating Card */}
              <View style={styles.metaCard}>
                <View style={styles.metaIconContainer}>
                  <MaterialIcons name="star" size={22} color="#F59E0B" />
                </View>
                <Text style={styles.metaLabel}>Rating</Text>
                <View style={styles.ratingContainer}>
                  <Text style={styles.ratingValue}>{averageRating.average.toFixed(1)}</Text>
                  <MaterialIcons name="star" size={12} color="#F59E0B" />
                </View>
                <Text style={styles.ratingCount}>{averageRating.count} reviews</Text>
              </View>
            </View>
          </View>

          {/* Description Card */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <MaterialIcons name="description" size={20} color="#F97316" />
              <Text style={styles.sectionTitle}>Description</Text>
            </View>
            <Text style={styles.description}>{recipe.description}</Text>
          </View>

          {/* Ingredients Card */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <MaterialIcons name="restaurant" size={20} color="#F97316" />
              <Text style={styles.sectionTitle}>Ingredients</Text>
              <View style={styles.countBadge}>
                <Text style={styles.countBadgeText}>{recipe.ingredients?.length || 0}</Text>
              </View>
            </View>
            <View style={styles.ingredientsList}>
              {recipe.ingredients?.map((ingredient: string, index: number) => (
                <View key={index} style={styles.ingredientItem}>
                  <View style={styles.ingredientBullet}>
                    <MaterialIcons name="check" size={14} color="#10B981" />
                  </View>
                  <Text style={styles.ingredientText}>{ingredient}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Steps Card */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <MaterialIcons name="list" size={20} color="#F97316" />
              <Text style={styles.sectionTitle}>Steps</Text>
              <View style={styles.countBadge}>
                <Text style={styles.countBadgeText}>{recipe.steps?.length || 0}</Text>
              </View>
            </View>
            <View style={styles.stepsList}>
              {recipe.steps?.map((step: string, index: number) => (
                <View key={index} style={styles.stepItem}>
                  <Text style={styles.stepNumber}>Step {index + 1}</Text>
                  <Text style={styles.stepText}>{step}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Reviews Card */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <MaterialIcons name="reviews" size={20} color="#F97316" />
              <Text style={styles.sectionTitle}>Reviews</Text>
              <View style={styles.countBadge}>
                <Text style={styles.countBadgeText}>{reviews.length}</Text>
              </View>
            </View>

            {/* Add Review Button */}
            {currentUser ? (
              userReview ? (
                <View style={styles.userReviewActions}>
                  <Pressable 
                    style={styles.editReviewButton}
                    onPress={() => setShowReviewModal(true)}
                  >
                    <MaterialIcons name="edit" size={16} color="#3B82F6" />
                    <Text style={styles.editReviewText}>Edit Your Review</Text>
                  </Pressable>
                  <Pressable 
                    style={styles.deleteReviewButton}
                    onPress={handleDeleteReview}
                  >
                    <MaterialIcons name="delete-outline" size={16} color="#EF4444" />
                    <Text style={styles.deleteReviewText}>Delete</Text>
                  </Pressable>
                </View>
              ) : (
                <Pressable 
                  style={styles.addReviewButton}
                  onPress={() => setShowReviewModal(true)}
                >
                  <MaterialIcons name="add-comment" size={18} color="white" />
                  <Text style={styles.addReviewText}>Add Your Review</Text>
                </Pressable>
              )
            ) : (
              <Pressable 
                style={styles.loginToReviewButton}
                onPress={() => router.push('/login')}
              >
                <MaterialIcons name="login" size={18} color="white" />
                <Text style={styles.loginToReviewText}>Login to Review</Text>
              </Pressable>
            )}

            {/* Reviews List */}
            {reviewsLoading ? (
              <View style={styles.reviewsLoadingContainer}>
                <MaterialIcons name="star" size={24} color="#F97316" />
                <Text style={styles.reviewsLoadingText}>Loading reviews...</Text>
              </View>
            ) : reviews.length > 0 ? (
              <View style={styles.reviewsList}>
                {reviews.slice(0, 3).map((review) => (
                  <View key={review.id} style={styles.reviewItem}>
                    <View style={styles.reviewHeader}>
                      <View style={styles.reviewerInfo}>
                        <MaterialIcons name="person" size={14} color="#6B7280" />
                        <Text style={styles.reviewerName}>{review.userName}</Text>
                      </View>
                      <View style={styles.reviewRating}>
                        <Text style={styles.reviewRatingText}>{review.rating}.0</Text>
                        <MaterialIcons name="star" size={12} color="#F59E0B" />
                      </View>
                    </View>
                    <Text style={styles.reviewComment}>{review.comment}</Text>
                    <Text style={styles.reviewDate}>
                      {new Date(review.createdAt).toLocaleDateString()}
                    </Text>
                  </View>
                ))}
                
                {reviews.length > 3 && (
                  <Pressable 
                    style={styles.viewAllReviewsButton}
                    onPress={() => Alert.alert('Info', 'More reviews feature coming soon!')}
                  >
                    <Text style={styles.viewAllReviewsText}>
                      View all {reviews.length} reviews
                    </Text>
                    <MaterialIcons name="chevron-right" size={16} color="#F97316" />
                  </Pressable>
                )}
              </View>
            ) : (
              <View style={styles.noReviews}>
                <MaterialIcons name="rate-review" size={36} color="#D1D5DB" />
                <Text style={styles.noReviewsText}>No reviews yet. Be the first!</Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Review Modal */}
      <ReviewModal
        visible={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        onSubmit={handleAddReview}
        userReview={userReview}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    paddingTop: 50,
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
    padding: 20,
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
    marginBottom: 16,
  },
  backButtonIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 6,
  },
  headerIconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  favoriteLoadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteLoadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleSection: {
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  creatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  creatorIcon: {
    marginRight: 5,
  },
  creatorText: {
    fontSize: 13,
    color: '#6B7280',
  },
  creatorName: {
    fontWeight: '600',
    color: '#1f2937',
  },
  // Timer Styles
  simpleTimerCard: {
    backgroundColor: '#F0FDF4',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#10B98120',
  },
  timerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  timerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#10B981',
    marginLeft: 8,
  },
  timerDisplay: {
    alignItems: 'center',
    marginBottom: 14,
  },
  timerText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#10B981',
  },
  timerStatus: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
  },
  timerButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  timerButtonGreen: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    padding: 10,
    borderRadius: 10,
    gap: 6,
  },
  timerButtonYellow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F59E0B',
    padding: 10,
    borderRadius: 10,
    gap: 6,
  },
  timerButtonGray: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6B7280',
    padding: 10,
    borderRadius: 10,
    gap: 6,
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  startTimerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    padding: 14,
    borderRadius: 12,
    gap: 8,
  },
  startButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  
  metaCardsContainer: {
    marginBottom: 24,
  },
  metaCardsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  metaCards: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  metaCard: {
    width: '48%', 
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    marginBottom: 10,
  },
  metaIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFEDD5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  metaLabel: {
    fontSize: 11,
    color: '#6B7280',
    marginBottom: 4,
    textAlign: 'center',
  },
  metaValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    textAlign: 'center',
  },

  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginBottom: 2,
  },
  ratingValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  ratingCount: {
    fontSize: 10,
    color: '#6B7280',
  },
  // Section Cards
  sectionCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#1f2937',
    marginLeft: 8,
    flex: 1,
  },
  countBadge: {
    backgroundColor: 'white',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  countBadgeText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    color: '#4B5563',
  },
  // Ingredients List
  ingredientsList: {
    gap: 10,
  },
  ingredientItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'white',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
  },
  ingredientBullet: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#10B98115',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    marginTop: 2,
  },
  ingredientText: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
    lineHeight: 20,
  },
  // Steps List 
  stepsList: {
    gap: 12,
  },
  stepItem: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 14,
  },
  stepNumber: {
    fontSize: 13,
    fontWeight: '600',
    color: '#F97316',
    marginBottom: 6,
  },
  stepText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#374151',
  },
  // Review Styles
  userReviewActions: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  editReviewButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EFF6FF',
    padding: 10,
    borderRadius: 10,
    gap: 5,
  },
  editReviewText: {
    color: '#3B82F6',
    fontSize: 13,
    fontWeight: '500',
  },
  deleteReviewButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF2F2',
    padding: 10,
    borderRadius: 10,
    gap: 5,
  },
  deleteReviewText: {
    color: '#EF4444',
    fontSize: 13,
    fontWeight: '500',
  },
  addReviewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    padding: 12,
    borderRadius: 12,
    gap: 8,
    marginBottom: 16,
  },
  addReviewText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '600',
  },
  loginToReviewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F97316',
    padding: 12,
    borderRadius: 12,
    gap: 8,
    marginBottom: 16,
  },
  loginToReviewText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '600',
  },
  reviewsLoadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    gap: 10,
  },
  reviewsLoadingText: {
    fontSize: 14,
    color: '#6B7280',
  },
  reviewsList: {
    gap: 14,
  },
  reviewItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  reviewerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  reviewerName: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '500',
  },
  reviewRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#FFFBEB',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  reviewRatingText: {
    fontSize: 11,
    color: '#92400E',
    fontWeight: '600',
  },
  reviewComment: {
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 18,
    marginBottom: 8,
  },
  reviewDate: {
    fontSize: 11,
    color: '#9CA3AF',
    textAlign: 'right',
  },
  viewAllReviewsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    gap: 5,
  },
  viewAllReviewsText: {
    color: '#F97316',
    fontSize: 13,
    fontWeight: '500',
  },
  noReviews: {
    alignItems: 'center',
    padding: 16,
  },
  noReviewsText: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 10,
  },
  backButton: {
    backgroundColor: '#F97316',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  backButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});