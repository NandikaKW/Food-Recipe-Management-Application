# 🍳 CookBook – Recipe Management Mobile Application

> A modern cross-platform mobile app to **discover, create, and manage recipes** using **React Native (Expo) + Firebase**.

---

## 📱 Project Overview

**CookBook** is a recipe management mobile application that allows users to explore recipes, create their own, upload images, rate dishes, and manage favorites.
The app focuses on **clean UI**, **secure authentication**, **state management**, and **real-time data persistence** with Firebase.

This project was developed for:

> **ITS 2127 – Advanced Mobile Developer (Final Project)**

---
🎯 Project Objective

The objective of this project is to design and develop a cross-platform mobile application using React Native Expo with proper authentication, state management, navigation, and real-time database integration while following clean architecture and reusable component design principles.

---

## ✨ Core Features

### 🔐 User Authentication (Firebase Auth)

* Email/Password Sign Up & Login
* Persistent login sessions
* Protected routes for authenticated users

---

### 🍽️ Recipe Management – Full CRUD

Users can:

* ➕ Create new recipes (title, category, time, difficulty, ingredients, steps, image)
* 📖 View all recipes in a list & detailed screen
* ✏️ Edit their own recipes
* 🗑️ Delete their own recipes
* 🖼️ Upload recipe images using **Cloudinary**

---

### 🔍 Recipe Discovery

* Search by title, description, or category
* Filter by cooking time and difficulty
* Category-based organization
* Favorites system ❤️

---

### 👥 Social Interaction

* ⭐ Rate recipes (1–5 stars)
* 💬 Add reviews/comments
* 📊 View average ratings from users

---

### ⏲️ Cooking Tools

* Built-in cooking timer (Start / Pause / Resume / Reset)
* Step-by-step cooking instructions

---

## 🧠 Technical Implementation

| Layer            | Technology                        |
| ---------------- | --------------------------------- |
| Frontend         | React Native + TypeScript         |
| Navigation       | Expo Router (Stack Navigation)    |
| State Management | React Context API + Hooks         |
| Backend (BaaS)   | Firebase (Auth, Firestore)        |
| Image Upload     | Expo ImagePicker + **Cloudinary** |
| Lists            | Optimized with FlatList           |

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

* Consistent Orange theme (#F97316)
* Card-based modern layout
* Smooth navigation & loading states
* Responsive across Android & iOS
* Proper keyboard handling

---

## 🔐 Security

* Only authenticated users can access app features
* Users can edit/delete **only their own** recipes
* Input validation and error handling

---

## 📁 Project Structure

```
/app            → Screens (Expo Router)
/components     → Reusable UI components
/services       → Firebase & business logic (includes Types)
firebase.ts     → Firebase configuration
```

*Note: TypeScript interfaces are defined in `RecipeService.ts`*

---

## 🚀 Setup & Run Instructions (Important for Evaluation)

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

Create file:

```
firebase.ts
```

Add your Firebase keys:

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

* Create a Cloudinary account
* Add your cloud name, API key & secret to `.env` file (or config)
* Used for storing recipe images

---

### 5️⃣ Run the App

```bash
npx expo start
```

Scan QR using **Expo Go** or run on emulator.

---

## 📦 Build APK (Android)

APK available via:

[Download APK](https://expo.dev/artifacts/eas/aUNwxggYNVrcQN6no8fddi.apk)

Or build using Expo EAS:

```bash
eas build -p android
```

---

## 🧪 Validation & Testing

* Form validation for all inputs
* Error & success messages
* Smooth list rendering
* Proper loading states

---

## ✅ Assignment Requirement Checklist

| Requirement      | Implemented        |
| ---------------- | ------------------ |
| Authentication   | ✅ Firebase Auth    |
| CRUD Operations  | ✅ Recipes          |
| Navigation       | ✅ Stack Navigation |
| State Management | ✅ Context API      |
| Data Persistence | ✅ Firestore        |
| Image Upload     | ✅ Cloudinary       |
| Android Build    | ✅ APK Provided     |
| Git Commits      | ✅ Proper History   |
| README           | ✅ Complete         |

---

## 🔗 Important Links

* **GitHub Repository:** [https://github.com/NandikaKW/Food-Recipe-Management-Application](https://github.com/NandikaKW/Food-Recipe-Management-Application)
* **APK Download:** [https://expo.dev/artifacts/eas/aUNwxggYNVrcQN6no8fddi.apk](https://expo.dev/artifacts/eas/aUNwxggYNVrcQN6no8fddi.apk)

---

## 👨‍💻 Author

**Nandika Kaweesha Fernando**
Sri Lanka 🇱🇰
MERN & MEAN Stack Developer | Mobile App Developer
