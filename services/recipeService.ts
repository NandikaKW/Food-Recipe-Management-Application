import { 
  collection, 
  addDoc, 
  getDocs, 
  getDoc, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  Timestamp ,
  setDoc
} from 'firebase/firestore';
import { db } from './firebase';
import { getCurrentUser } from './authService';

export interface Recipe {
  id?: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  cookingTime: number; // in minutes
  ingredients: string[];
  steps: string[];
  imageUrl?: string;
  createdBy: string;
  createdAt: Date;
}
export interface Review {
  id?: string;
  recipeId: string;
  userId: string;
  userName: string;
  rating: number; // 1-5
  comment: string;
  createdAt: Date;
}
const CLOUD_NAME = "dvqm3oewy"; 
const UPLOAD_PRESET = "expoapp"; 

//  Add new recipe
export const addRecipe = async (recipeData: Omit<Recipe, 'id' | 'createdAt'>, imageUri?: string): Promise<string> => {
  try {
    let imageUrl = '';
    
    // Upload image to Cloudinary if provided
    if (imageUri) {
      imageUrl = await uploadImageToCloudinary(imageUri);
    }
    
    const user = getCurrentUser();
    if (!user) throw new Error('User must be logged in');
    
    const recipeToAdd = {
      ...recipeData,
      imageUrl,
      createdBy: user.uid,
      createdAt: Timestamp.now()
    };
    
    const docRef = await addDoc(collection(db, 'recipes'), recipeToAdd);
    return docRef.id;
  } catch (error) {
    console.error('Error adding recipe:', error);
    throw error;
  }
};

//  Get all recipes
export const getAllRecipes = async (): Promise<Recipe[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, 'recipes'));
    const recipes: Recipe[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      recipes.push({
        id: doc.id,
        title: data.title,
        description: data.description,
        category: data.category,
        difficulty: data.difficulty,
        cookingTime: data.cookingTime,
        ingredients: data.ingredients,
        steps: data.steps,
        imageUrl: data.imageUrl,
        createdBy: data.createdBy,
        createdAt: data.createdAt?.toDate() || new Date()
      });
    });
    
    return recipes;
  } catch (error) {
    console.error('Error getting recipes:', error);
    throw error;
  }
};

//  Get recipe by ID
export const getRecipeById = async (recipeId: string): Promise<Recipe | null> => {
  try {
    const docRef = doc(db, 'recipes', recipeId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        title: data.title,
        description: data.description,
        category: data.category,
        difficulty: data.difficulty,
        cookingTime: data.cookingTime,
        ingredients: data.ingredients,
        steps: data.steps,
        imageUrl: data.imageUrl,
        createdBy: data.createdBy,
        createdAt: data.createdAt?.toDate() || new Date()
      };
    }
    return null;
  } catch (error) {
    console.error('Error getting recipe:', error);
    throw error;
  }
};

// Get user's recipes
export const getUserRecipes = async (userId: string): Promise<Recipe[]> => {
  try {
    const q = query(collection(db, 'recipes'), where('createdBy', '==', userId));
    const querySnapshot = await getDocs(q);
    const recipes: Recipe[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      recipes.push({
        id: doc.id,
        title: data.title,
        description: data.description,
        category: data.category,
        difficulty: data.difficulty,
        cookingTime: data.cookingTime,
        ingredients: data.ingredients,
        steps: data.steps,
        imageUrl: data.imageUrl,
        createdBy: data.createdBy,
        createdAt: data.createdAt?.toDate() || new Date()
      });
    });
    
    return recipes;
  } catch (error) {
    console.error('Error getting user recipes:', error);
    throw error;
  }
};

// Update recipe
export const updateRecipe = async (
  recipeId: string, 
  updatedData: Partial<Recipe>, 
  newImageUri?: string
): Promise<void> => {
  try {
    let imageUrl = updatedData.imageUrl;
    
    // Upload new image if provided
    if (newImageUri) {
      imageUrl = await uploadImageToCloudinary(newImageUri);
    }
    
    const recipeRef = doc(db, 'recipes', recipeId);
    const updatePayload = {
      ...updatedData,
      ...(imageUrl && { imageUrl })
    };
    
    await updateDoc(recipeRef, updatePayload);
  } catch (error) {
    console.error('Error updating recipe:', error);
    throw error;
  }
};

//  DELETE: Delete recipe
export const deleteRecipe = async (recipeId: string): Promise<void> => {
  try {
    // Note: Cloudinary images are not deleted automatically
    // You might want to add Cloudinary admin API to delete images
    const recipeRef = doc(db, 'recipes', recipeId);
    await deleteDoc(recipeRef);
  } catch (error) {
    console.error('Error deleting recipe:', error);
    throw error;
  }
};

// Helper: Upload image to Cloudinary
export const uploadImageToCloudinary = async (imageUri: string): Promise<string> => {
  try {
    const formData = new FormData();
    formData.append('file', {
      uri: imageUri,
      type: 'image/jpeg',
      name: `recipe_${Date.now()}.jpg`,
    } as any);
    formData.append('upload_preset', UPLOAD_PRESET);
    
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );
    
    const data = await response.json();
    
    if (data.secure_url) {
      return data.secure_url;
    } else {
      throw new Error('Upload failed');
    }
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};


// Add recipe to favorites
export const addToFavorites = async (userId: string, recipeId: string): Promise<void> => {
  try {
    const favoriteRef = doc(db, 'users', userId, 'favorites', recipeId);
    await setDoc(favoriteRef, {
      recipeId,
      addedAt: Timestamp.now()
    });
  } catch (error) {
    console.error('Error adding to favorites:', error);
    throw error;
  }
};

// Remove recipe from favorites
export const removeFromFavorites = async (userId: string, recipeId: string): Promise<void> => {
  try {
    const favoriteRef = doc(db, 'users', userId, 'favorites', recipeId);
    await deleteDoc(favoriteRef);
  } catch (error) {
    console.error('Error removing from favorites:', error);
    throw error;
  }
};

// Toggle favorite status
export const toggleFavorite = async (userId: string, recipeId: string, isFavorite: boolean): Promise<void> => {
  if (isFavorite) {
    await removeFromFavorites(userId, recipeId);
  } else {
    await addToFavorites(userId, recipeId);
  }
};

// Get user's favorite recipe IDs
export const getFavoriteRecipes = async (userId: string): Promise<string[]> => {
  try {
    const favoritesRef = collection(db, 'users', userId, 'favorites');
    const querySnapshot = await getDocs(favoritesRef);
    
    const favoriteIds: string[] = [];
    querySnapshot.forEach((doc) => {
      favoriteIds.push(doc.id);
    });
    
    return favoriteIds;
  } catch (error) {
    console.error('Error getting favorite recipes:', error);
    return [];
  }
};

// Check if recipe is in favorites
export const isRecipeInFavorites = async (userId: string, recipeId: string): Promise<boolean> => {
  try {
    if (!userId || !recipeId) return false;
    
    const favoriteRef = doc(db, 'users', userId, 'favorites', recipeId);
    const docSnap = await getDoc(favoriteRef);
    return docSnap.exists();
  } catch (error) {
    console.error('Error checking favorite:', error);
    return false;
  }
};

// 🟠 FUNCTION: addRecipeReview(recipeId, reviewData)
export const addRecipeReview = async (
  recipeId: string, 
  reviewData: Omit<Review, 'id' | 'recipeId' | 'createdAt'>
): Promise<string> => {
  try {
    const reviewToAdd = {
      ...reviewData,
      recipeId,
      createdAt: Timestamp.now()
    };
    
    const docRef = await addDoc(collection(db, 'recipes', recipeId, 'reviews'), reviewToAdd);
    return docRef.id;
  } catch (error) {
    console.error('Error adding review:', error);
    throw error;
  }
};

// 🟠 FUNCTION: getRecipeReviews(recipeId)
export const getRecipeReviews = async (recipeId: string): Promise<Review[]> => {
  try {
    const reviewsRef = collection(db, 'recipes', recipeId, 'reviews');
    const querySnapshot = await getDocs(reviewsRef);
    
    const reviews: Review[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      reviews.push({
        id: doc.id,
        recipeId: data.recipeId,
        userId: data.userId,
        userName: data.userName,
        rating: data.rating,
        comment: data.comment,
        createdAt: data.createdAt?.toDate() || new Date()
      });
    });
    
    // Sort by newest first
    return reviews.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  } catch (error) {
    console.error('Error getting reviews:', error);
    return [];
  }
};

// 🟠 FUNCTION: calculateAverageRating(recipeId)
export const calculateAverageRating = async (recipeId: string): Promise<{
  average: number;
  total: number;
  count: number;
}> => {
  try {
    const reviews = await getRecipeReviews(recipeId);
    
    if (reviews.length === 0) {
      return { average: 0, total: 0, count: 0 };
    }
    
    const total = reviews.reduce((sum, review) => sum + review.rating, 0);
    const average = total / reviews.length;
    
    return {
      average: Number(average.toFixed(1)),
      total,
      count: reviews.length
    };
  } catch (error) {
    console.error('Error calculating average rating:', error);
    return { average: 0, total: 0, count: 0 };
  }
};

// Check if user has already reviewed a recipe
export const hasUserReviewed = async (recipeId: string, userId: string): Promise<boolean> => {
  try {
    const reviewsRef = collection(db, 'recipes', recipeId, 'reviews');
    const q = query(reviewsRef, where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    
    return !querySnapshot.empty;
  } catch (error) {
    console.error('Error checking user review:', error);
    return false;
  }
};

// Get user's review for a recipe
export const getUserReview = async (recipeId: string, userId: string): Promise<Review | null> => {
  try {
    const reviewsRef = collection(db, 'recipes', recipeId, 'reviews');
    const q = query(reviewsRef, where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      const data = doc.data();
      return {
        id: doc.id,
        recipeId: data.recipeId,
        userId: data.userId,
        userName: data.userName,
        rating: data.rating,
        comment: data.comment,
        createdAt: data.createdAt?.toDate() || new Date()
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error getting user review:', error);
    return null;
  }
};

// Update user's review
export const updateRecipeReview = async (
  reviewId: string,
  recipeId: string,
  updatedData: { rating: number; comment: string }
): Promise<void> => {
  try {
    const reviewRef = doc(db, 'recipes', recipeId, 'reviews', reviewId);
    await updateDoc(reviewRef, updatedData);
  } catch (error) {
    console.error('Error updating review:', error);
    throw error;
  }
};

// Delete review
export const deleteRecipeReview = async (recipeId: string, reviewId: string): Promise<void> => {
  try {
    const reviewRef = doc(db, 'recipes', recipeId, 'reviews', reviewId);
    await deleteDoc(reviewRef);
  } catch (error) {
    console.error('Error deleting review:', error);
    throw error;
  }
};