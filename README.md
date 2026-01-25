# 🍳 CookBook – Recipe Management Mobile Application

> A modern, feature-rich mobile application to **discover, create, and manage recipes**, built with **React Native** and **Firebase**.

---

## 📱 Project Overview

**CookBook** is a cross-platform mobile recipe management app designed to help users explore new dishes, manage their own recipes, and enhance their cooking experience.
It offers a **beautiful UI**, **secure authentication**, and **powerful recipe discovery tools**.

---

## ✨ Core Features

### 🔐 1. User Authentication

* Secure **Sign Up / Login** using Firebase Authentication
* Persistent user sessions
* Protected routes for authenticated users only

---

### 🍽️ 2. Recipe Management (CRUD)

* ➕ Create recipes with:

  * Title, description, category
  * Difficulty level
  * Cooking time
  * Ingredients & steps
* 📖 View all recipes with detailed screens
* ✏️ Edit existing recipes
* 🗑️ Delete your own recipes
* 🖼️ Upload recipe images from device gallery

---

### 🔍 3. Advanced Recipe Discovery

* Search recipes by **title, description, or category**
* Filter recipes by:

  * ⏱️ Cooking time (Quick / Medium / Long)
  * 🔥 Difficulty (Easy / Medium / Hard)
* ❤️ Favorites system for quick access
* 📂 Category-based organization (Breakfast, Dessert, Italian, etc.)

---

### 👥 4. Social Features

* ⭐ Rate recipes (1–5 stars)
* 💬 Add reviews and comments
* 📊 View average ratings
* 🌍 Read feedback from other users

---

### ⏲️ 5. Cooking Tools

* Built-in **cooking timer** (Start, Pause, Resume, Reset)
* Step-by-step cooking instructions
* Organized ingredient lists

---

## 🛠️ Technical Implementation

### 🧱 Architecture

* **Frontend:** React Native + TypeScript
* **Backend:** Firebase

  * Authentication
  * Firestore Database
  * Firebase Storage
* **Routing:** Expo Router (file-based navigation)
* **State Management:** React Hooks & Context API
* **Platform:** iOS & Android

---

### 🔧 Key Technical Components

* **Authentication Service:** User signup, login, logout & session handling
* **Recipe Service:** CRUD operations, favorites & reviews
* **Firebase Integration:** Real-time database sync
* **Image Handling:** Upload & store images using Firebase Storage
* **Form Validation:** Real-time validation with user feedback

---

## 🧩 Code Structure

* ♻️ Modular reusable components (Preloader, ReviewModal, etc.)
* 🧠 Service layer separated from UI logic
* 🧾 TypeScript interfaces for all data models
* 🚨 Centralized error handling with friendly messages

---

## 🎨 User Experience (UX)

### Visual Design

* 🎨 Consistent **Orange Theme** (`#F97316`)
* 📦 Card-based recipe layout
* 👆 Interactive buttons with feedback
* ⏳ Smooth loading states

### Navigation

* Easy and intuitive screen flow
* Clear back navigation
* Modal interfaces for filters & reviews

### Performance

* ⚡ Optimized lists using `FlatList`
* 🖼️ Lazy-loaded images
* 🔁 Reduced unnecessary re-renders

---

## 🔐 Security Implementation

* Firebase Email/Password authentication
* Users can **only edit/delete their own recipes**
* Protected database operations
* Input validation & sanitization

---

## 🗄️ Database Structure

```
Firestore Collections:
- recipes   → All recipe data
- favorites → User-specific favorites
- reviews   → Ratings & comments
- users     → User profile information
```

---

## ✅ Testing & Validation

* Form-level validation for all inputs
* Graceful error handling
* Clear success & error messages
* Prevents invalid data submission

---

## 📱 Platform Compatibility

* ✅ iOS (iPhone optimized)
* ✅ Android support
* 📐 Responsive for all screen sizes
* ⌨️ Proper keyboard handling

---

## 📋 Requirements & Implementation Status

### Mandatory Requirements

✅ Firebase Authentication
✅ Full CRUD Operations
✅ Multi-screen Navigation
✅ State Management
✅ Firestore & Storage Integration

### Advanced Features

✅ Image Upload
✅ Search & Filter
✅ Favorites System
✅ Reviews & Ratings
✅ Cooking Timer
✅ Professional Responsive UI

---

## 🧰 Technologies Used

* **React Native**
* **TypeScript**
* **Expo**
* **Firebase (Auth, Firestore, Storage)**
* **Expo ImagePicker**
* **Material Icons**

---

## 📊 Project Scope

* 🖥️ Screens: 8+ main screens
* 🧩 Components: 3+ reusable components
* 🔧 Services: Authentication & Recipe services
* 🚀 Features: 10+ advanced features

---

## 👨‍💻 Author

**Nandika Kaweesha Fernando**
📍 Sri Lanka
🚀 MERN & MEAN Stack Developer | Mobile App Developer


