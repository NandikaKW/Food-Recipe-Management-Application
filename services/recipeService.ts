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
  Timestamp 
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

const CLOUD_NAME = "dvqm3oewy"; 
const UPLOAD_PRESET = "expoapp"; 

// 🔹 5️⃣ CREATE: Add new recipe
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

// 🔹 6️⃣ READ: Get all recipes
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

// 🔹 7️⃣ READ: Get recipe by ID
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

// 🔹 8️⃣ READ: Get user's recipes
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

// 🔹 9️⃣ UPDATE: Update recipe
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

// 🔹 🔟 DELETE: Delete recipe
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

// 🔹 Helper: Upload image to Cloudinary
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