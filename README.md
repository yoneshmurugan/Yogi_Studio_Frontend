# 📸 Yogi Digital Studio — Frontend & Mobile App

Welcome to the **Yogi Digital Studio** Frontend & Mobile Client repository! This application is a cutting-edge, dynamic digital studio platform built for photography studios and their clients to seamlessly view, share, download, and curate memories with high-resolution performance.

---

## 📲 Download the App

| Platform | Download Link | Status |
| :--- | :--- | :--- |
| **Google Play Store (Android)** | <!-- REPLACE_WITH_YOUR_PLAYSTORE_LINK_HERE --> *(Coming Soon)* | Under Review / Available |
| **Apple App Store (iOS & iPadOS)** | <!-- REPLACE_WITH_YOUR_APPSTORE_LINK_HERE --> *(Coming Soon)* | Under Review / Available |
| **Live Web App** | [https://yogidigitalstudio.in](https://yogidigitalstudio.in) | Live 🚀 |

*(Note: Replace the placeholders above with your official Play Store and App Store URLs once published!)*

---

## 🌟 Key Features

### 👤 Client Portal & Customer Experience
- **Secure SMS OTP Login:** Fast, frictionless authentication powered by Firebase Auth.
- **Face Recognition Ready:** Built-in disclosures and local processing design to seamlessly scan and highlight photos of a specific client without third-party sharing.
- **Dynamic Interactive Lightbox:** Smooth zooming, swiping, and browsing powered by Framer Motion and sleek modern UX.
- **Native Memory Preservation:** Save single images or export all high-resolution memories directly to the device’s **native Camera Roll / Photo Library** (using `@capacitor-community/media`).
- **Apple Compliant Account Deletion:** Secure self-serve account management inside the app allowing customers to delete their authenticated identity (compliant with App Store Guideline 5.1.1(v)).

### 🛠️ Admin Dashboard (Photographer Suite)
- **Studio Command Center:** Complete real-time overview of active events, uploaded galleries, and studio clients.
- **Event & Folder Management:** Create structured gallery hierarchies, upload bulk event shots, and manage portfolio highlights.
- **AI Photo Model Suite:** Integrated workflows to power cutting-edge AI photo transformation features.
- **Client Access Management:** Add new clients and grant exclusive access to protected event collections.

---

## 🔀 Repository Branch Structure & Mobile Support

This repository utilizes a **multi-platform branching strategy** to manage both standard modern web deployments and specialized native mobile wrappers:

### 🌐 `main` Branch — Core Web Application & PWA
- Optimized for standard browser viewing and Progressive Web App (PWA) installation.
- Lightweight bundling, blazing-fast HMR via **Vite**, and responsive layouts.
- Hosts the official public website, Client Portal, and desktop-optimized Admin Panel.

### 📱 `mobile` Branch — iOS & Android Native Builds
- Integrated natively with **Capacitor** (`ios/` and `android/` directories).
- **iOS & iPadOS Optimized:** Includes full interface orientation configurations (`Info.plist`), multitasking support for iPads, and native Apple Push Notification service (APNs) fallback bindings.
- **Android Capabilities:** Optimized file permissions, SDK configurations, and Google Services integration for seamless Play Store deployment.
- **Native Device Sensors & Hardware:** Deep integration with Capacitor Haptics, native Camera Roll saving, and Native Firebase Authentication bypasses for smooth native app performance.

---

## 🛠️ Tech Stack & Architecture

- **Core Framework:** React 18, Vite
- **Styling & Aesthetics:** Vanilla CSS with custom modern design system tokens, Framer Motion animations
- **Mobile Runtime:** Capacitor (iOS + Android)
- **Authentication:** Firebase Authentication (Phone Number SMS OTP & Email Admin Login)
- **State & Data Management:** TanStack React Query (`@tanstack/react-query`)
- **Backend API Integration:** Communicates with the secure AWS Serverless backend (`api.yogidigitalstudio.in`).

---

## 🚀 Getting Started (Development Setup)

### 1️⃣ Prerequisites
- **Node.js** (v18 or above recommended)
- **npm** or yarn
- **Xcode** (for iOS native testing) & **CocoaPods** installed
- **Android Studio** (for Android builds)

### 2️⃣ Installation & Web Development
```bash
# Clone the project and navigate to the root directory
git clone https://github.com/yoneshmurugan/Yogi_Studio_Frontend.git
cd Yogi_Studio_Frontend

# Install dependencies
npm install

# Start the Vite local development server
npm run dev
```
Open your browser at `http://localhost:5173`.

### 3️⃣ Building & Running for Mobile (iOS & Android)

To access and build the iOS and Android packages, ensure you switch to the **`mobile` branch**:

```bash
# Switch to the dedicated mobile development branch
git checkout mobile
npm install

# Step 1: Build the production bundle of the React application
npm run build

# Step 2: Sync the built assets and plugins to the native iOS and Android folders
npx cap sync

# Step 3A: Launch Xcode to test/publish on iPhone or iPad
npx cap open ios

# Step 3B: Launch Android Studio to test/publish on Android devices
npx cap open android
```

---

## 📄 License & Ownership
All design assets, photographs, logos, and codebase architecture are strictly confidential and proprietary property of **Yogi Digital Studio**.
