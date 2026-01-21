import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
  ScrollView,
  Image,
  ActivityIndicator,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { getRecipeById, updateRecipe } from '../../../services/recipeService';
import { getCurrentUser } from '../../../services/authService';
import { MaterialIcons } from '@expo/vector-icons';

export default function EditRecipe() {
  const { id } = useLocalSearchParams();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Easy');
  const [cookingTime, setCookingTime] = useState('');
  const [ingredients, setIngredients] = useState('');
  const [steps, setSteps] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const user = getCurrentUser();
  if (!user) {
    router.replace('/login');
    return null;
  }

  useEffect(() => {
    loadRecipe();
  }, [id]);

  const loadRecipe = async () => {
    try {
      setLoading(true);
      if (typeof id === 'string') {
        const recipeData = await getRecipeById(id);
        
        if (recipeData) {
          setTitle(recipeData.title);
          setDescription(recipeData.description);
          setCategory(recipeData.category);
          setDifficulty(recipeData.difficulty);
          setCookingTime(recipeData.cookingTime.toString());
          setIngredients(recipeData.ingredients.join('\n'));
          setSteps(recipeData.steps.join('\n'));
          setExistingImageUrl(recipeData.imageUrl || null);
        }
      }
    } catch (error: any) {
      Alert.alert('Error', 'Failed to load recipe');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!granted) {
      Alert.alert('Permission required', 'Please allow access to photos!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (!title || !description || !category || !cookingTime || !ingredients || !steps) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (isNaN(Number(cookingTime)) || Number(cookingTime) <= 0) {
      Alert.alert('Error', 'Please enter a valid cooking time (in minutes)');
      return;
    }

    try {
      setSaving(true);
      
      const ingredientsArray = ingredients.split('\n').filter(ing => ing.trim() !== '');
      const stepsArray = steps.split('\n').filter(step => step.trim() !== '');

      const updateData = {
        title,
        description,
        category,
        difficulty,
        cookingTime: Number(cookingTime),
        ingredients: ingredientsArray,
        steps: stepsArray,
      };

      await updateRecipe(
        id as string,
        updateData,
        imageUri || undefined
      );

      Alert.alert('Success', 'Recipe updated successfully!', [
        { 
          text: 'OK', 
          onPress: () => {
            router.replace('/recipes');
          }
        }
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update recipe');
    } finally {
      setSaving(false);
    }
  };

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'Easy': return '#10B981';
      case 'Medium': return '#F59E0B';
      case 'Hard': return '#EF4444';
      default: return '#6B7280';
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingCard}>
          <ActivityIndicator size="large" color="#F97316" />
          <Text style={styles.loadingText}>Loading recipe...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <MaterialIcons name="arrow-back" size={24} color="#F97316" />
            <Text style={styles.backButtonText}>Back</Text>
          </Pressable>
          
          <View style={styles.headerContent}>
            <View style={styles.headerIcon}>
              <MaterialIcons name="edit" size={28} color="white" />
            </View>
            <Text style={styles.title}>Edit Recipe</Text>
            <Text style={styles.subtitle}>Update your recipe details</Text>
          </View>
        </View>

        {/* Form Card */}
        <View style={styles.formCard}>
          {/* Image Picker */}
          <Pressable style={styles.imagePicker} onPress={pickImage}>
            {imageUri ? (
              <View style={styles.imageContainer}>
                <Image source={{ uri: imageUri }} style={styles.image} />
                <View style={styles.imageOverlay}>
                  <MaterialIcons name="edit" size={20} color="white" />
                  <Text style={styles.changeImageText}>Change Image</Text>
                </View>
              </View>
            ) : existingImageUrl ? (
              <View style={styles.imageContainer}>
                <Image source={{ uri: existingImageUrl }} style={styles.image} />
                <View style={styles.imageOverlay}>
                  <MaterialIcons name="edit" size={20} color="white" />
                  <Text style={styles.changeImageText}>Change Image</Text>
                </View>
              </View>
            ) : (
              <View style={styles.imagePlaceholder}>
                <MaterialIcons name="add-a-photo" size={40} color="#9CA3AF" />
                <Text style={styles.imagePlaceholderText}>Tap to add image</Text>
                <Text style={styles.imagePlaceholderSubtext}>Optional</Text>
              </View>
            )}
          </Pressable>

          {/* Title */}
          <View style={styles.inputGroup}>
            <View style={styles.labelContainer}>
              <MaterialIcons name="title" size={18} color="#F97316" />
              <Text style={styles.label}>Recipe Title *</Text>
            </View>
            <TextInput
              placeholder="Enter recipe title"
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholderTextColor="#9CA3AF"
            />
          </View>

          {/* Description */}
          <View style={styles.inputGroup}>
            <View style={styles.labelContainer}>
              <MaterialIcons name="description" size={18} color="#F97316" />
              <Text style={styles.label}>Description *</Text>
            </View>
            <TextInput
              placeholder="Describe your recipe..."
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
              placeholderTextColor="#9CA3AF"
            />
          </View>

          {/* Category */}
          <View style={styles.inputGroup}>
            <View style={styles.labelContainer}>
              <MaterialIcons name="category" size={18} color="#F97316" />
              <Text style={styles.label}>Category *</Text>
            </View>
            <TextInput
              placeholder="e.g., Breakfast, Italian, Dessert"
              style={styles.input}
              value={category}
              onChangeText={setCategory}
              placeholderTextColor="#9CA3AF"
            />
          </View>

          {/* Difficulty */}
          <View style={styles.inputGroup}>
            <View style={styles.labelContainer}>
              <MaterialIcons name="trending-up" size={18} color="#F97316" />
              <Text style={styles.label}>Difficulty *</Text>
            </View>
            <View style={styles.difficultyContainer}>
              {(['Easy', 'Medium', 'Hard'] as const).map((level) => (
                <Pressable
                  key={level}
                  style={[
                    styles.difficultyButton,
                    difficulty === level && [
                      styles.difficultyButtonActive,
                      { borderColor: getDifficultyColor(level) }
                    ],
                  ]}
                  onPress={() => setDifficulty(level)}
                >
                  <View style={[
                    styles.difficultyDot,
                    { backgroundColor: getDifficultyColor(level) }
                  ]} />
                  <Text
                    style={[
                      styles.difficultyButtonText,
                      difficulty === level && styles.difficultyButtonTextActive,
                    ]}
                  >
                    {level}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Cooking Time */}
          <View style={styles.inputGroup}>
            <View style={styles.labelContainer}>
              <MaterialIcons name="timer" size={18} color="#F97316" />
              <Text style={styles.label}>Cooking Time (minutes) *</Text>
            </View>
            <TextInput
              placeholder="Enter cooking time"
              style={styles.input}
              value={cookingTime}
              onChangeText={setCookingTime}
              keyboardType="numeric"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          {/* Ingredients */}
          <View style={styles.inputGroup}>
            <View style={styles.labelContainer}>
              <MaterialIcons name="restaurant" size={18} color="#F97316" />
              <Text style={styles.label}>Ingredients *</Text>
              <Text style={styles.hintText}>One per line</Text>
            </View>
            <TextInput
              placeholder="Enter each ingredient on a new line..."
              style={[styles.input, styles.textArea]}
              value={ingredients}
              onChangeText={setIngredients}
              multiline
              numberOfLines={4}
              placeholderTextColor="#9CA3AF"
            />
          </View>

          {/* Steps */}
          <View style={styles.inputGroup}>
            <View style={styles.labelContainer}>
              <MaterialIcons name="list" size={18} color="#F97316" />
              <Text style={styles.label}>Steps *</Text>
              <Text style={styles.hintText}>One per line</Text>
            </View>
            <TextInput
              placeholder="Enter each step on a new line..."
              style={[styles.input, styles.textArea]}
              value={steps}
              onChangeText={setSteps}
              multiline
              numberOfLines={4}
              placeholderTextColor="#9CA3AF"
            />
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <Pressable
              style={[styles.updateButton, saving && styles.buttonDisabled]}
              onPress={handleSubmit}
              disabled={saving}
            >
              {saving ? (
                <View style={styles.buttonContent}>
                  <ActivityIndicator size="small" color="white" />
                  <Text style={styles.updateButtonText}>Saving...</Text>
                </View>
              ) : (
                <View style={styles.buttonContent}>
                  <MaterialIcons name="save" size={22} color="white" />
                  <Text style={styles.updateButtonText}>Update Recipe</Text>
                </View>
              )}
            </Pressable>

            <Pressable 
              style={styles.cancelButton}
              onPress={() => router.back()}
            >
              <View style={styles.buttonContent}>
                <MaterialIcons name="close" size={22} color="#6B7280" />
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </View>
            </Pressable>
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
  loadingCard: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 20,
    padding: 40,
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
  content: {
    paddingBottom: 40,
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
    backgroundColor: '#F59E0B',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#F59E0B',
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
    textAlign: 'center',
  },
  formCard: {
    backgroundColor: 'white',
    marginHorizontal: 20,
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
  imagePicker: {
    marginBottom: 25,
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 180,
    borderRadius: 12,
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 10,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  changeImageText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
  },
  imagePlaceholder: {
    width: '100%',
    height: 180,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
  },
  imagePlaceholderText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
    marginTop: 8,
  },
  imagePlaceholderSubtext: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  inputGroup: {
    marginBottom: 20,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  label: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
    marginLeft: 8,
  },
  hintText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginLeft: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    backgroundColor: 'white',
    padding: 15,
    fontSize: 16,
    color: '#1f2937',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  difficultyContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  difficultyButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: 'white',
  },
  difficultyButtonActive: {
    backgroundColor: '#FFEDD5',
    borderWidth: 2,
  },
  difficultyDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  difficultyButtonText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  difficultyButtonTextActive: {
    color: '#1f2937',
    fontWeight: '600',
  },
  actionButtons: {
    marginTop: 20,
  },
  updateButton: {
    backgroundColor: '#3B82F6',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
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
  updateButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 10,
  },
  cancelButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
    backgroundColor: '#F3F4F6',
  },
  cancelButtonText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 10,
  },
});