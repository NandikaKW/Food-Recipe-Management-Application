# 🍳 CookBook – Recipe Management Mobile Application

> A modern cross-platform mobile app to **discover, create, and manage recipes** using **React Native (Expo) + Firebase**.

---

## 📱 Project Overview

**CookBook** is a recipe management mobile application that allows users to explore recipes, create their own, upload images, rate dishes, and manage favorites.

The app focuses on **clean UI**, **secure authentication**, **state management**, and **real-time data persistence** with Firebase.

Developed for:

> **ITS 2127 – Advanced Mobile Developer (Final Project)**

---

## 🎯 Project Objective

To design and develop a cross-platform mobile application using **React Native Expo** with proper authentication, navigation, state management, and real-time database integration while following clean architecture and reusable component design principles.

---

## ✨ Core Features

### 🔐 User Authentication (Firebase Auth)

* Email/Password Sign Up & Login
* Persistent login sessions
* Protected routes for authenticated users

### 🍽️ Recipe Management – Full CRUD

Users can:

* Create new recipes (title, category, time, difficulty, ingredients, steps, image)
* View all recipes and detailed screens
* Edit their own recipes
* Delete their own recipes
* Upload recipe images using **Cloudinary**

### 🔍 Recipe Discovery

* Search by title, description, or category
* Filter by cooking time and difficulty
* Category-based organization
* Favorites system

### 👥 Social Interaction

* Rate recipes (1–5 stars)
* Add reviews/comments
* View average ratings

### ⏲️ Cooking Tools

* Built-in cooking timer
* Step-by-step cooking instructions

---

## 🧠 Technical Implementation

| Layer            | Technology                     |
| ---------------- | ------------------------------ |
| Frontend         | React Native + TypeScript      |
| Navigation       | Expo Router (Stack Navigation) |
| State Management | React Context API + Hooks      |
| Backend (BaaS)   | Firebase (Auth, Firestore)     |
| Image Upload     | Expo ImagePicker + Cloudinary  |
| Lists            | Optimized using FlatList       |

---

## 🗄️ Firestore Database Structure

```
Collections:
- recipes
- users
- favorites
- reviews
```

---

## 🎨 UI / UX Highlights

* Consistent theme and modern card layout
* Smooth navigation & loading states
* Responsive on Android & iOS
* Proper keyboard handling

---

## 🔐 Security Rules

* Only authenticated users can access features
* Users can edit/delete only their own recipes
* Input validation and error handling implemented

---

## 📁 Project Structure

```
/app            → Screens (Expo Router)
/components     → Reusable UI components
/services       → Firebase & business logic
firebase.ts     → Firebase configuration
```

> TypeScript interfaces are defined inside service files.

---

## 🚀 Setup & Run Instructions (For Evaluation)

### 1️⃣ Clone Repository

```bash
git clone https://github.com/NandikaKW/Food-Recipe-Management-Application.git
cd Food-Recipe-Management-Application
```

### 2️⃣ Install Dependencies

```bash
npm install
```

### 3️⃣ Firebase Configuration

Create a Firebase project and enable:

* Firebase Authentication (Email/Password)
* Firestore Database

Create `firebase.ts` and add your keys:

```ts
import { initializeApp } from 'firebase/app';

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

export const app = initializeApp(firebaseConfig);
```

### 4️⃣ Cloudinary Configuration

Create a Cloudinary account and add credentials to `.env`.

### 5️⃣ Run the App

```bash
npx expo start
```

Run using **Expo Go** or an emulator.

---

## 🧪 Validation & Testing

* Form validation
* Error & success messages
* Proper loading states
* Optimized list rendering

---

## ✅ Assignment Requirement Checklist

| Requirement      | Status |
| ---------------- | ------ |
| Authentication   | ✅      |
| CRUD Operations  | ✅      |
| Navigation       | ✅      |
| State Management | ✅      |
| Data Persistence | ✅      |
| Image Upload     | ✅      |
| Git History      | ✅      |
| README           | ✅      |

---

## 🔗 GitHub Repository

**[https://github.com/NandikaKW/Food-Recipe-Management-Application](https://github.com/NandikaKW/Food-Recipe-Management-Application)**

---

## 👨‍💻 Author

**Nandika Kaweesha Fernando**
Sri Lanka 🇱🇰
Mobile & Full-Stack Developer
