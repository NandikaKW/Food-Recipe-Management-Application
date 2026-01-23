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
  TextInput,
  Modal,
} from 'react-native';
import { router } from 'expo-router';
import { 
  getAllRecipes, 
  deleteRecipe, 
  toggleFavorite, 
  isRecipeInFavorites 
} from '../../services/recipeService';
import { getCurrentUser, getUserData } from '../../services/authService';
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
  const [filteredRecipes, setFilteredRecipes] = useState<RecipeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const currentUser = getCurrentUser();
  const [userNames, setUserNames] = useState<Record<string, string>>({});
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});
  
  // Search & Filter States
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedTime, setSelectedTime] = useState<string>('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showFavorites, setShowFavorites] = useState(false);
  
  // Time ranges for filtering
  const timeRanges = [
    { label: 'All', min: 0, max: 9999 },
    { label: 'Quick (<15 min)', min: 0, max: 15 },
    { label: 'Medium (15-30 min)', min: 15, max: 30 },
    { label: 'Long (>30 min)', min: 30, max: 9999 },
  ];

  // Difficulty options
  const difficultyOptions = ['All', 'Easy', 'Medium', 'Hard'];

  useEffect(() => {
    loadRecipes();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [recipes, searchKeyword, selectedTime, selectedDifficulty, showFavorites, favorites]);

  const loadRecipes = async () => {
    try {
      setLoading(true);
      const allRecipes = await getAllRecipes();

      const usersMap: Record<string, string> = {};

      // Fetch user names for createdBy field
      for (const recipe of allRecipes) {
        if (!usersMap[recipe.createdBy]) {
          const userData = await getUserData(recipe.createdBy);
          usersMap[recipe.createdBy] = userData?.name || 'Unknown User';
        }
      }

      setUserNames(usersMap);

      const transformedRecipes: RecipeItem[] = allRecipes.map(recipe => ({
        id: recipe.id || '',
        title: recipe.title,
        description: recipe.description,
        category: recipe.category,
        difficulty: recipe.difficulty,
        cookingTime: recipe.cookingTime,
        imageUrl: recipe.imageUrl,
        createdBy: recipe.createdBy,
      }));

      setRecipes(transformedRecipes);
      setFilteredRecipes(transformedRecipes);

      // Load favorites for current user
      if (currentUser) {
        loadUserFavorites(currentUser.uid, transformedRecipes.map(r => r.id));
      }
    } catch (error: any) {
      Alert.alert('Error', 'Failed to load recipes');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserFavorites = async (userId: string, recipeIds: string[]) => {
    try {
      const newFavorites: Record<string, boolean> = {};
      
      for (const recipeId of recipeIds) {
        const isFavorite = await isRecipeInFavorites(userId, recipeId);
        newFavorites[recipeId] = isFavorite;
      }
      
      setFavorites(newFavorites);
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  };

  // 🟡 SEARCH FUNCTION: searchRecipes(keyword)
  const searchRecipes = (keyword: string) => {
    if (!keyword.trim()) {
      return recipes;
    }

    return recipes.filter(recipe => 
      recipe.title.toLowerCase().includes(keyword.toLowerCase()) ||
      recipe.description.toLowerCase().includes(keyword.toLowerCase()) ||
      recipe.category.toLowerCase().includes(keyword.toLowerCase())
    );
  };

  // 🟡 FILTER FUNCTION: filterRecipesByTime(time)
  const filterRecipesByTime = (timeRange: string) => {
    setSelectedTime(timeRange);
    setShowFilterModal(false);
  };

  // 🟡 FILTER FUNCTION: filterRecipesByDifficulty(level)
  const filterRecipesByDifficulty = (level: string) => {
    setSelectedDifficulty(level);
    setShowFilterModal(false);
  };

  // Apply all active filters
  const applyFilters = () => {
    let result = [...recipes];

    // Apply search filter
    if (searchKeyword.trim()) {
      result = searchRecipes(searchKeyword);
    }

    // Apply time filter
    if (selectedTime !== 'All') {
      const timeRange = timeRanges.find(tr => tr.label === selectedTime);
      if (timeRange) {
        result = result.filter(recipe => 
          recipe.cookingTime >= timeRange.min && recipe.cookingTime <= timeRange.max
        );
      }
    }

    // Apply difficulty filter
    if (selectedDifficulty !== 'All') {
      result = result.filter(recipe => recipe.difficulty === selectedDifficulty);
    }

    // Apply favorites filter
    if (showFavorites) {
      result = result.filter(recipe => favorites[recipe.id]);
    }

    setFilteredRecipes(result);
  };

  // Reset all filters
  const resetFilters = () => {
    setSearchKeyword('');
    setSelectedTime('All');
    setSelectedDifficulty('All');
    setShowFavorites(false);
    setFilteredRecipes(recipes);
    setShowFilterModal(false);
  };

  // 🟡 FAVORITE FUNCTION: toggleFavorite(recipeId)
  const handleToggleFavorite = async (recipeId: string) => {
    if (!currentUser) {
      Alert.alert('Login Required', 'Please login to save favorites');
      router.push('/login');
      return;
    }

    try {
      const isFavorite = favorites[recipeId] || false;
      await toggleFavorite(currentUser.uid, recipeId, isFavorite);
      
      // Update local state
      setFavorites(prev => ({
        ...prev,
        [recipeId]: !isFavorite
      }));
      
      // Show success message
      if (!isFavorite) {
        Alert.alert('Success', 'Added to favorites!');
      }
    } catch (error: any) {
      Alert.alert('Error', 'Failed to update favorites');
      console.error(error);
    }
  };

  const handleSearchChange = (text: string) => {
    setSearchKeyword(text);
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
              const updatedRecipes = recipes.filter(recipe => recipe.id !== recipeId);
              setRecipes(updatedRecipes);
              setFilteredRecipes(updatedRecipes);
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
    const displayName = item.createdBy === currentUser?.uid 
      ? 'You' 
      : userNames[item.createdBy] || 'User';
    const isFavorite = favorites[item.id] || false;

    return (
      <Pressable
        style={styles.recipeCard}
        onPress={() => handleView(item.id)}
      >
        {/* Favorite Button */}
        <Pressable
          style={styles.favoriteButton}
          onPress={(e) => {
            e.stopPropagation();
            handleToggleFavorite(item.id);
          }}
        >
          <MaterialIcons 
            name={isFavorite ? "favorite" : "favorite-border"} 
            size={24} 
            color={isFavorite ? "#EF4444" : "white"} 
          />
        </Pressable>

        {item.imageUrl ? (
          <Image source={{ uri: item.imageUrl }} style={styles.recipeImage} />
        ) : (
          <View style={[styles.recipeImage, styles.noImage]}>
            <MaterialIcons name="local-dining" size={40} color="#9CA3AF" />
          </View>
        )}

        <View style={styles.recipeContent}>
          <View style={styles.recipeHeader}>
            <View style={styles.titleSection}>
              <Text style={styles.recipeTitle} numberOfLines={1}>
                {item.title}
              </Text>
              
              <View style={styles.creatorBadge}>
                <MaterialIcons name="person-outline" size={14} color="#6B7280" />
                <Text style={styles.creatorText}>
                  {displayName}
                </Text>
              </View>
            </View>

            {isOwner && (
              <View style={styles.actionButtons}>
                <Pressable
                  style={styles.iconButton}
                  onPress={(e) => {
                    e.stopPropagation();
                    handleEdit(item.id);
                  }}
                >
                  <MaterialIcons name="edit-note" size={20} color="#3B82F6" />
                </Pressable>

                <Pressable
                  style={styles.iconButton}
                  onPress={(e) => {
                    e.stopPropagation();
                    handleDelete(item.id, item.title);
                  }}
                >
                  <MaterialIcons name="delete-outline" size={20} color="#EF4444" />
                </Pressable>
              </View>
            )}
          </View>

          <View style={styles.metaContainer}>
            <View style={styles.metaRow}>
              <View style={styles.metaItem}>
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
          </View>

          <Text style={styles.recipeDescription} numberOfLines={2}>
            {item.description}
          </Text>

          <Pressable
            style={styles.viewButton}
            onPress={(e) => {
              e.stopPropagation();
              handleView(item.id);
            }}
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

  const favoriteCount = Object.values(favorites).filter(fav => fav).length;

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

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <MaterialIcons name="search" size={20} color="#9CA3AF" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search recipes..."
            value={searchKeyword}
            onChangeText={handleSearchChange}
            placeholderTextColor="#9CA3AF"
          />
          {searchKeyword ? (
            <Pressable onPress={() => setSearchKeyword('')}>
              <MaterialIcons name="close" size={20} color="#9CA3AF" />
            </Pressable>
          ) : null}
        </View>

        {/* Filter Button */}
        <Pressable 
          style={styles.filterButton}
          onPress={() => setShowFilterModal(true)}
        >
          <MaterialIcons name="filter-list" size={22} color="white" />
          <Text style={styles.filterButtonText}>Filter</Text>
        </Pressable>

        {/* Favorites Button */}
        <Pressable 
          style={[styles.favoritesButton, showFavorites && styles.favoritesButtonActive]}
          onPress={() => {
            if (!currentUser) {
              Alert.alert('Login Required', 'Please login to view favorites');
              router.push('/login');
              return;
            }
            setShowFavorites(!showFavorites);
          }}
        >
          <MaterialIcons 
            name="favorite" 
            size={22} 
            color={showFavorites ? "#EF4444" : "white"} 
          />
        </Pressable>
      </View>

      {/* Active Filters Display */}
      {(selectedTime !== 'All' || selectedDifficulty !== 'All' || showFavorites) && (
        <View style={styles.activeFiltersContainer}>
          <Text style={styles.activeFiltersText}>Active Filters:</Text>
          <View style={styles.activeFiltersRow}>
            {showFavorites && (
              <View style={styles.activeFilterBadge}>
                <Text style={styles.activeFilterText}>Favorites Only</Text>
                <Pressable onPress={() => setShowFavorites(false)}>
                  <MaterialIcons name="close" size={14} color="#6B7280" />
                </Pressable>
              </View>
            )}
            {selectedTime !== 'All' && (
              <View style={styles.activeFilterBadge}>
                <Text style={styles.activeFilterText}>Time: {selectedTime}</Text>
                <Pressable onPress={() => setSelectedTime('All')}>
                  <MaterialIcons name="close" size={14} color="#6B7280" />
                </Pressable>
              </View>
            )}
            {selectedDifficulty !== 'All' && (
              <View style={styles.activeFilterBadge}>
                <Text style={styles.activeFilterText}>Difficulty: {selectedDifficulty}</Text>
                <Pressable onPress={() => setSelectedDifficulty('All')}>
                  <MaterialIcons name="close" size={14} color="#6B7280" />
                </Pressable>
              </View>
            )}
          </View>
        </View>
      )}

      {/* Stats Bar */}
      <View style={styles.statsBar}>
        <View style={styles.statItem}>
          <MaterialIcons name="local-dining" size={22} color="#F97316" />
          <Text style={styles.statNumber}>{filteredRecipes.length}</Text>
          <Text style={styles.statLabel}>Recipes</Text>
        </View>

        <View style={styles.statDivider} />

        <View style={styles.statItem}>
          <MaterialIcons name="favorite" size={22} color="#EF4444" />
          <Text style={styles.statNumber}>{favoriteCount}</Text>
          <Text style={styles.statLabel}>Favorites</Text>
        </View>

        <View style={styles.statDivider} />

        <View style={styles.statItem}>
          <MaterialIcons name="emoji-events" size={22} color="#3B82F6" />
          <Text style={styles.statNumber}>
            {filteredRecipes.filter(r => r.difficulty === 'Easy').length}
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

      {/* Recipe List */}
      {filteredRecipes.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyCard}>
            <MaterialIcons name="kitchen" size={48} color="#9CA3AF" />
            <Text style={styles.emptyTitle}>
              {showFavorites ? 'No Favorite Recipes' : 'No Recipes Found'}
            </Text>
            <Text style={styles.emptyText}>
              {showFavorites 
                ? 'Add recipes to your favorites to see them here!' 
                : searchKeyword || selectedTime !== 'All' || selectedDifficulty !== 'All'
                  ? 'Try adjusting your search or filters'
                  : 'Your recipe collection is empty. Start cooking!'}
            </Text>
            {(searchKeyword || selectedTime !== 'All' || selectedDifficulty !== 'All' || showFavorites) && (
              <Pressable
                style={styles.emptyButton}
                onPress={resetFilters}
              >
                <MaterialIcons name="refresh" size={20} color="white" />
                <Text style={styles.emptyButtonText}>Clear Filters</Text>
              </Pressable>
            )}
          </View>
        </View>
      ) : (
        <FlatList
          data={filteredRecipes}
          renderItem={renderRecipeItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Filter Modal */}
      <Modal
        visible={showFilterModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowFilterModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filter Recipes</Text>
              <Pressable onPress={() => setShowFilterModal(false)}>
                <MaterialIcons name="close" size={24} color="#6B7280" />
              </Pressable>
            </View>

            {/* Time Filter */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Cooking Time</Text>
              <View style={styles.filterOptions}>
                {timeRanges.map(timeRange => (
                  <Pressable
                    key={timeRange.label}
                    style={[
                      styles.filterOption,
                      selectedTime === timeRange.label && styles.filterOptionActive
                    ]}
                    onPress={() => filterRecipesByTime(timeRange.label)}
                  >
                    <Text style={[
                      styles.filterOptionText,
                      selectedTime === timeRange.label && styles.filterOptionTextActive
                    ]}>
                      {timeRange.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Difficulty Filter */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Difficulty</Text>
              <View style={styles.filterOptions}>
                {difficultyOptions.map(level => (
                  <Pressable
                    key={level}
                    style={[
                      styles.filterOption,
                      selectedDifficulty === level && styles.filterOptionActive
                    ]}
                    onPress={() => filterRecipesByDifficulty(level)}
                  >
                    <Text style={[
                      styles.filterOptionText,
                      selectedDifficulty === level && styles.filterOptionTextActive
                    ]}>
                      {level}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.modalActions}>
              <Pressable style={styles.resetButton} onPress={resetFilters}>
                <Text style={styles.resetButtonText}>Reset All</Text>
              </Pressable>
              <Pressable 
                style={styles.applyButton} 
                onPress={() => setShowFilterModal(false)}
              >
                <Text style={styles.applyButtonText}>Apply Filters</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
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
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 15,
    gap: 10,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchInput: {
    flex: 1,
    padding: 12,
    fontSize: 16,
    color: '#1f2937',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F97316',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6,
  },
  filterButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  favoritesButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F97316',
    alignItems: 'center',
    justifyContent: 'center',
  },
  favoritesButtonActive: {
    backgroundColor: '#FEE2E2',
  },
  activeFiltersContainer: {
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  activeFiltersText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  activeFiltersRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  activeFilterBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E5E7EB',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  activeFilterText: {
    fontSize: 12,
    color: '#4B5563',
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
    position: 'relative',
  },
  favoriteButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recipeImage: {
    width: '100%',
    height: 180,
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
    marginBottom: 12,
  },
  titleSection: {
    flex: 1,
    marginRight: 12,
  },
  recipeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 6,
  },
  creatorBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  creatorText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
    fontWeight: '500',
  },
  metaContainer: {
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  metaText: {
    fontSize: 13,
    color: '#6B7280',
    marginLeft: 6,
    fontWeight: '500',
  },
  recipeDescription: {
    color: '#6B7280',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
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
    paddingVertical: 12,
    backgroundColor: '#FFEDD5',
    borderRadius: 12,
  },
  viewButtonText: {
    color: '#F97316',
    fontSize: 15,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  filterSection: {
    marginBottom: 24,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  filterOption: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  filterOptionActive: {
    backgroundColor: '#FFEDD5',
    borderColor: '#F97316',
  },
  filterOptionText: {
    fontSize: 14,
    color: '#6B7280',
  },
  filterOptionTextActive: {
    color: '#F97316',
    fontWeight: '600',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  resetButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  resetButtonText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '500',
  },
  applyButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#F97316',
  },
  applyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});