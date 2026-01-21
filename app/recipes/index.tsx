import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  Pressable,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { getAllRecipes, deleteRecipe } from '../../services/recipeService';
import { getCurrentUser } from '../../services/authService';
import { MaterialIcons } from '@expo/vector-icons';

interface RecipeItem {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  cookingTime: number;
  imageUrl?: string;
  createdBy: string;
}

export default function Recipes() {
  const [recipes, setRecipes] = useState<RecipeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const currentUser = getCurrentUser();

  useEffect(() => {
    loadRecipes();
  }, []);

  const loadRecipes = async () => {
    try {
      setLoading(true);
      const allRecipes = await getAllRecipes();
      const transformedRecipes: RecipeItem[] = allRecipes.map(recipe => ({
        id: recipe.id || '',
        title: recipe.title,
        description: recipe.description,
        category: recipe.category,
        difficulty: recipe.difficulty,
        cookingTime: recipe.cookingTime,
        imageUrl: recipe.imageUrl,
        createdBy: recipe.createdBy
      }));
      setRecipes(transformedRecipes);
    } catch (error: any) {
      Alert.alert('Error', 'Failed to load recipes');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (recipeId: string, recipeTitle: string) => {
    Alert.alert(
      'Delete Recipe',
      `Are you sure you want to delete "${recipeTitle}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteRecipe(recipeId);
              setRecipes(recipes.filter(recipe => recipe.id !== recipeId));
              Alert.alert('Success', 'Recipe deleted successfully');
            } catch (error: any) {
              Alert.alert('Error', 'Failed to delete recipe');
            }
          },
        },
      ]
    );
  };

  const handleEdit = (recipeId: string) => {
    router.push(`/recipes/edit/${recipeId}`);
  };

  const handleView = (recipeId: string) => {
    router.push(`/recipes/${recipeId}`);
  };

  const goToHome = () => {
    router.push('/');
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return '#10B981';
      case 'Medium': return '#F59E0B';
      case 'Hard': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'sentiment-very-satisfied';
      case 'Medium': return 'sentiment-satisfied';
      case 'Hard': return 'sentiment-dissatisfied';
      default: return 'sentiment-neutral';
    }
  };

 const renderRecipeItem = ({ item }: { item: RecipeItem }) => {
  const isOwner = currentUser?.uid === item.createdBy;

  return (
    <Pressable 
      style={styles.recipeCard} 
      onPress={() => handleView(item.id)}
    >
      {/* Recipe Image */}
      {item.imageUrl ? (
        <Image source={{ uri: item.imageUrl }} style={styles.recipeImage} />
      ) : (
        <View style={[styles.recipeImage, styles.noImage]}>
          <MaterialIcons name="local-dining" size={40} color="#9CA3AF" />
        </View>
      )}

      <View style={styles.recipeContent}>
        <View style={styles.recipeHeader}>
          <View style={styles.recipeInfo}>
            <Text style={styles.recipeTitle}>{item.title}</Text>
            
            <View style={styles.metaContainer}>
              <View style={styles.metaItem}>
                {/* Updated Category Icon - Changed from 'category' to 'restaurant-menu' */}
                <MaterialIcons name="restaurant-menu" size={16} color="#6B7280" />
                <Text style={styles.metaText}>{item.category}</Text>
              </View>
              
              <View style={styles.metaItem}>
                <MaterialIcons name="access-time" size={16} color="#6B7280" />
                <Text style={styles.metaText}>{item.cookingTime} min</Text>
              </View>
              
              <View style={styles.metaItem}>
                <MaterialIcons 
                  name={getDifficultyIcon(item.difficulty)} 
                  size={16} 
                  color={getDifficultyColor(item.difficulty)} 
                />
                <Text style={[styles.metaText, { color: getDifficultyColor(item.difficulty) }]}>
                  {item.difficulty}
                </Text>
              </View>
            </View>
            
            <Text style={styles.recipeDescription} numberOfLines={2}>
              {item.description}
            </Text>
          </View>

          {/* Action Buttons - Only show if owner */}
          {isOwner && (
            <View style={styles.actionButtons}>
              <Pressable
                style={styles.iconButton}
                onPress={() => handleEdit(item.id)}
              >
                <MaterialIcons name="edit-note" size={20} color="#3B82F6" />
              </Pressable>
              
              <Pressable
                style={styles.iconButton}
                onPress={() => handleDelete(item.id, item.title)}
              >
                <MaterialIcons name="delete-outline" size={20} color="#EF4444" />
              </Pressable>
            </View>
          )}
        </View>
        
        {/* View Button */}
        <Pressable 
          style={styles.viewButton}
          onPress={() => handleView(item.id)}
        >
          <Text style={styles.viewButtonText}>View Recipe</Text>
          <MaterialIcons name="chevron-right" size={20} color="#F97316" />
        </Pressable>
      </View>
    </Pressable>
  );
};

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingCard}>
          <MaterialIcons name="restaurant-menu" size={40} color="#F97316" />
          <ActivityIndicator size="large" color="#F97316" style={{ marginTop: 15 }} />
          <Text style={styles.loadingText}>Loading recipes...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={goToHome}>
          <MaterialIcons name="home" size={24} color="#F97316" />
          <Text style={styles.backButtonText}>Back to Home</Text>
        </Pressable>
        
        <View style={styles.headerContent}>
          <View style={styles.headerIcon}>
            <MaterialIcons name="menu-book" size={28} color="white" />
          </View>
          <Text style={styles.title}>All Recipes</Text>
          <Text style={styles.subtitle}>Discover delicious recipes</Text>
        </View>
      </View>

      {/* Stats Bar */}
      <View style={styles.statsBar}>
        <View style={styles.statItem}>
          <MaterialIcons name="local-dining" size={22} color="#F97316" />
          <Text style={styles.statNumber}>{recipes.length}</Text>
          <Text style={styles.statLabel}>Recipes</Text>
        </View>
        
        <View style={styles.statDivider} />
        
        <View style={styles.statItem}>
          <MaterialIcons name="timer" size={22} color="#10B981" />
          <Text style={styles.statNumber}>
            {recipes.reduce((sum, recipe) => sum + recipe.cookingTime, 0)}
          </Text>
          <Text style={styles.statLabel}>Total Min</Text>
        </View>
        
        <View style={styles.statDivider} />
        
        <View style={styles.statItem}>
          <MaterialIcons name="emoji-events" size={22} color="#3B82F6" />
          <Text style={styles.statNumber}>
            {recipes.filter(r => r.difficulty === 'Easy').length}
          </Text>
          <Text style={styles.statLabel}>Easy</Text>
        </View>
      </View>

      {/* Add Recipe Button */}
      <Pressable 
        style={styles.addButton}
        onPress={() => router.push('/recipes/add')}
      >
        <View style={styles.addButtonContent}>
          <MaterialIcons name="add-circle-outline" size={24} color="white" />
          <Text style={styles.addButtonText}>Add New Recipe</Text>
        </View>
      </Pressable>

      {/* Recipes List */}
      {recipes.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyCard}>
            <MaterialIcons name="kitchen" size={48} color="#9CA3AF" />
            <Text style={styles.emptyTitle}>No Recipes Yet</Text>
            <Text style={styles.emptyText}>
              Your recipe collection is empty. Start cooking!
            </Text>
            <Pressable 
              style={styles.emptyButton}
              onPress={() => router.push('/recipes/add')}
            >
              <MaterialIcons name="add" size={20} color="white" />
              <Text style={styles.emptyButtonText}>Add First Recipe</Text>
            </Pressable>
          </View>
        </View>
      ) : (
        <FlatList
          data={recipes}
          renderItem={renderRecipeItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
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
  header: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    padding: 5,
  },
  backButtonText: {
    fontSize: 16,
    color: '#F97316',
    fontWeight: '500',
    marginLeft: 8,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F97316',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#F97316',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  statsBar: {
    flexDirection: 'row',
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E5E7EB',
  },
  addButton: {
    backgroundColor: '#10B981',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 16,
    borderRadius: 14,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  addButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 10,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  recipeCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  recipeImage: {
    width: '100%',
    height: 160,
  },
  noImage: {
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recipeContent: {
    padding: 16,
  },
  recipeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  recipeInfo: {
    flex: 1,
    marginRight: 10,
  },
  recipeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  metaContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
    gap: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 4,
  },
  recipeDescription: {
    color: '#6B7280',
    fontSize: 14,
    lineHeight: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    paddingVertical: 10,
    backgroundColor: '#FFEDD5',
    borderRadius: 10,
  },
  viewButtonText: {
    color: '#F97316',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emptyCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    width: '100%',
    maxWidth: 400,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  emptyButton: {
    backgroundColor: '#F97316',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  emptyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});