import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { getRecipeById, deleteRecipe } from '../../services/recipeService';
import { getCurrentUser } from '../../services/authService';
import { Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export default function RecipeDetail() {
  const { id } = useLocalSearchParams();
  const [recipe, setRecipe] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const currentUser = getCurrentUser();

  useEffect(() => {
    loadRecipe();
  }, [id]);

  const loadRecipe = async () => {
    try {
      setLoading(true);
      if (typeof id === 'string') {
        const recipeData = await getRecipeById(id);
        setRecipe(recipeData);
      }
    } catch (error: any) {
      Alert.alert('Error', 'Failed to load recipe');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Recipe',
      'Are you sure you want to delete this recipe?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setDeleting(true);
              if (typeof id === 'string') {
                await deleteRecipe(id);
                Alert.alert('Success', 'Recipe deleted', [
                  { text: 'OK', onPress: () => router.back() }
                ]);
              }
            } catch (error: any) {
              Alert.alert('Error', 'Failed to delete recipe');
            } finally {
              setDeleting(false);
            }
          },
        },
      ]
    );
  };

  const handleEdit = () => {
    router.push(`/recipes/edit/${id}`);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return '#10B981';
      case 'Medium': return '#F59E0B';
      case 'Hard': return '#EF4444';
      default: return '#6B7280';
    }
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
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Recipe Image */}
        {recipe.imageUrl ? (
          <Image source={{ uri: recipe.imageUrl }} style={styles.image} />
        ) : (
          <View style={[styles.image, styles.noImage]}>
            <MaterialIcons name="restaurant" size={60} color="#9CA3AF" />
          </View>
        )}

        <View style={styles.contentCard}>
          {/* Header with Actions */}
          <View style={styles.header}>
            <View style={styles.titleContainer}>
              <Text style={styles.title}>{recipe.title}</Text>
              <Text style={styles.byText}>
                <MaterialIcons name="person" size={14} color="#6B7280" />
                {' '}Added by {recipe.createdBy === currentUser?.uid ? 'You' : 'User'}
              </Text>
            </View>
            
            <Pressable style={styles.backButtonIcon} onPress={() => router.back()}>
              <MaterialIcons name="close" size={24} color="#6B7280" />
            </Pressable>
          </View>

          {/* Recipe Meta */}
          <View style={styles.metaCard}>
            <View style={styles.metaItem}>
              <View style={styles.metaIcon}>
                <MaterialIcons name="category" size={20} color="#F97316" />
              </View>
              <Text style={styles.metaLabel}>Category</Text>
              <Text style={styles.metaValue}>{recipe.category}</Text>
            </View>
            
            <View style={styles.metaDivider} />
            
            <View style={styles.metaItem}>
              <View style={[
                styles.difficultyBadge,
                { backgroundColor: getDifficultyColor(recipe.difficulty) }
              ]}>
                <Text style={styles.difficultyText}>{recipe.difficulty[0]}</Text>
              </View>
              <Text style={styles.metaLabel}>Difficulty</Text>
              <Text style={[styles.metaValue, { color: getDifficultyColor(recipe.difficulty) }]}>
                {recipe.difficulty}
              </Text>
            </View>
            
            <View style={styles.metaDivider} />
            
            <View style={styles.metaItem}>
              <View style={styles.metaIcon}>
                <MaterialIcons name="timer" size={20} color="#F97316" />
              </View>
              <Text style={styles.metaLabel}>Time</Text>
              <Text style={styles.metaValue}>{recipe.cookingTime} min</Text>
            </View>
          </View>

          {/* Description */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialIcons name="description" size={22} color="#F97316" />
              <Text style={styles.sectionTitle}>Description</Text>
            </View>
            <Text style={styles.description}>{recipe.description}</Text>
          </View>

          {/* Ingredients */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialIcons name="restaurant" size={22} color="#F97316" />
              <Text style={styles.sectionTitle}>Ingredients</Text>
              <Text style={styles.countBadge}>{recipe.ingredients.length}</Text>
            </View>
            <View style={styles.ingredientsList}>
              {recipe.ingredients.map((ingredient: string, index: number) => (
                <View key={index} style={styles.ingredientItem}>
                  <MaterialIcons name="check-circle" size={18} color="#10B981" />
                  <Text style={styles.ingredientText}>{ingredient}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Steps */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialIcons name="list" size={22} color="#F97316" />
              <Text style={styles.sectionTitle}>Steps</Text>
              <Text style={styles.countBadge}>{recipe.steps.length}</Text>
            </View>
            <View style={styles.stepsList}>
              {recipe.steps.map((step: string, index: number) => (
                <View key={index} style={styles.stepItem}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>{index + 1}</Text>
                  </View>
                  <Text style={styles.stepText}>{step}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Floating Action Buttons */}
      {isOwner && (
        <View style={styles.floatingActions}>
          <Pressable 
            style={[styles.actionButton, styles.editButton]}
            onPress={handleEdit}
          >
            <MaterialIcons name="edit" size={22} color="white" />
            <Text style={styles.actionButtonText}>Edit</Text>
          </Pressable>
          
          <Pressable 
            style={[styles.actionButton, styles.deleteButton]}
            onPress={handleDelete}
            disabled={deleting}
          >
            {deleting ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <MaterialIcons name="delete" size={22} color="white" />
            )}
            <Text style={styles.actionButtonText}>
              {deleting ? 'Deleting...' : 'Delete'}
            </Text>
          </Pressable>
        </View>
      )}
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
    paddingBottom: 100,
  },
  image: {
    width: '100%',
    height: 250,
  },
  noImage: {
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentCard: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginTop: -40,
    borderRadius: 20,
    padding: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  titleContainer: {
    flex: 1,
    marginRight: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 5,
  },
  byText: {
    fontSize: 14,
    color: '#6B7280',
  },
  backButtonIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  metaCard: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 20,
    marginBottom: 25,
  },
  metaItem: {
    flex: 1,
    alignItems: 'center',
  },
  metaIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFEDD5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  difficultyBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  difficultyText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  metaLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  metaValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  metaDivider: {
    width: 1,
    height: 60,
    backgroundColor: '#E5E7EB',
  },
  section: {
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginLeft: 10,
  },
  countBadge: {
    marginLeft: 10,
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#4B5563',
  },
  ingredientsList: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 15,
  },
  ingredientItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  ingredientText: {
    fontSize: 16,
    color: '#374151',
    marginLeft: 12,
    flex: 1,
  },
  stepsList: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 15,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  stepNumber: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#F97316',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  stepNumberText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  stepText: {
    fontSize: 16,
    lineHeight: 22,
    color: '#374151',
    flex: 1,
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
  floatingActions: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  editButton: {
    backgroundColor: '#3B82F6',
  },
  deleteButton: {
    backgroundColor: '#EF4444',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});