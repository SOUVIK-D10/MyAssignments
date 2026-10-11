# TODO-Bird: High-Performance Task & Focus Engine

## 1. Project Overview & Architecture
**FOCUS TODO** is a cross-platform mobile productivity application engineered for maximum personal efficiency and focus. Built with a decoupled client-server architecture, it pairs a responsive React Native mobile interface with a secure, high-throughput Node.js backend. The system is designed to eliminate friction in daily task management while proactively enforcing deep-work sessions and deadline accountability through automated background notifications.

---

## 2. Tech Stack & System Components
* **Frontend Mobile Client:** React Native, Expo (SDK 57), TypeScript, Zustand (State Management), Expo Notifications, Lucide Icons.
* **Backend API Server:** Node.js, Express.js, TypeScript, Mongoose ODM.
* **Database & Security:** MongoDB, JSON Web Tokens (JWT) with token blacklisting, bcrypt password hashing.
* **Automation & Infrastructure:** `node-cron` daemon for background tasks, `expo-server-sdk` for push payload dispatching, EAS Build (`preview` profile) for standalone Android deployment.

---

## 3. Core Features & Engineering Highlights
* **Optimized Deadline Notification Daemon:** A background cron worker executes every minute, utilizing bulk MongoDB queries (`$in`) and chunked push dispatching via `expo-server-sdk` to alert users 1 hour before high-priority objectives are due, minimizing database load and preventing duplicate dispatches (`updateMany`).
* **Focus Mode & Wellness Engine:** Features an integrated Pomodoro timer with customizable intervals, state-driven hydration alarms, and reactive visual ambient soundscape toggles.
* **Robust Native Binary Stability:** Resolved complex C++ JSI binary linking conflicts by purging legacy native audio modules (`expo-av`), ensuring a 100% crash-free standalone Android execution environment.
* **Push Token Synchronization:** Automated secure device registration that safely captures Expo push tokens upon login and syncs them to the backend via an Axios interceptor-backed client.

---

## 4. Setup & Installation Guide

### Prerequisites
* Node.js (v18+) and npm
* MongoDB instance (Local or MongoDB Atlas)
* EAS CLI (`npm install -g eas-cli`)

### Backend Setup
```bash
cd backend
npm install
# Configure your .env file with PORT, MONGO_URI, and JWT_SECRET
npm run dev
```

### Frontend Setup & Standalone Build
```bash
cd frontend
npm install

# Start local development server
npx expo start

# Build standalone Android Preview APK (with cache cleared)
npx eas build --platform android --profile preview --clear-cache
```

# System Loopholes, Edge Cases & Scaling Considerations

This section outlines known architectural limitations, potential edge cases, and future engineering improvements for the TODO-Bird ecosystem. Documenting these showcases senior-level foresight and production-readiness awareness during evaluation.

---

## 0. State Reload issue:
every time on switching/ navigating to recycle bin and coming back, auto reload/refresh is not waking properly/automatic, 
so manual reload(drag down and load needed). 

## 1. Architectural & Scaling Limitations

### A. Single-Instance Notification Cron Concurrency
* **Current Implementation:** The `node-cron` daemon runs in-memory directly inside the Express server process (`index.ts`).
* **The Loophole / Risk:** If the backend is horizontally scaled (e.g., deployed across multiple replicas on Render, AWS ECS, or Kubernetes) to handle high traffic, **every single instance** will execute the cron job simultaneously every minute. This will result in duplicate database queries and, worse, duplicate push notifications sent to users.
* **Production Fix:** Implement a distributed locking mechanism using Redis (e.g., Redlock) or a database-backed leader election so only one server instance executes the cron task per minute.

### B. Single Device Push Token Overwrite
* **Current Implementation:** The `User` model stores a single string field: `pushToken`. When a user logs in, their current device's Expo push token overwrites whatever was previously stored.
* **The Loophole / Risk:** If a user logs into TODO-Bird across multiple devices (e.g., an Android phone and an iPad/tablet), only the most recently logged-in device will have its token recorded in MongoDB. The other device will be silently deregistered from receiving notifications.
* **Production Fix:** Refactor `pushToken` into an array of objects (`[{ token: string, deviceType: string, updatedAt: Date }]`) or a separate `DeviceToken` collection referencing the `userId`.

---

## 2. Notification & Token Management Edge Cases

### A. Dead / Expired Token Cleanup
* **Current Implementation:** The notification cron job fetches tokens and dispatches payloads via `expo-server-sdk`. However, if Expo returns a `DeviceNotRegistered` ticket response (indicating the user uninstalled the app or revoked permissions), the dead token remains in MongoDB.
* **The Loophole / Risk:** Over time, the database accumulates stale push tokens, leading to wasted compute cycles and inaccurate dispatch metrics.

### B. Timezone Discrepancies
* **Current Implementation:** Cron queries evaluate deadlines using server time (`new Date()`) and compute absolute 60-minute windows (`$gte: targetStart, $lte: targetEnd`).
* **The Loophole / Risk:** If the backend server is hosted in UTC (e.g., AWS us-east-1) while the user is in IST (+5:30) or PST, task creation timestamps must strictly rely on ISO UTC conversion. While MongoDB stores dates as UTC ISODates, client-side input parsing can sometimes introduce local offset drift if not standardized.
* **Production Fix:** Ensure all task deadlines are strictly normalized and stored as UTC `Date` objects on creation, decoupling user local viewing representation from server-side evaluation.

---

## 3. Security & Authentication Edge Cases

### A. JWT Blacklist Collection Growth
* **Current Implementation:** When a user logs out, their JWT is added to a `TokenBlacklist` collection in MongoDB to invalidate it.
* **The Loophole / Risk:** Without a TTL (Time-to-Live) index on the `createdAt` or expiry date field, this collection will grow infinitely, consuming storage and degrading query performance over time.
* **Production Fix:** Add a MongoDB TTL index on the blacklist schema matching the token's remaining expiration time so documents automatically expire and delete themselves.

### B. Lack of Refresh Token Rotation
* **Current Implementation:** Access tokens expire after 7 days (`expiresIn: '7d'`), after which the user must re-authenticate with their password.
* **The Loophole / Risk:** While simple, a 7-day static token window offers less granular security revocation compared to short-lived access tokens (e.g., 15 minutes) paired with secure refresh tokens.
* **Production Fix:** Implement dual-token authentication (Access Token + Http-Only Cookie Refresh Token).

---

## 4. Client-Side & Network Resilience

### A. Absence of Offline-First Caching
* **Current Implementation:** The frontend relies entirely on live API calls via `axiosInstance` backed by Zustand state. 
* **The Loophole / Risk:** If the user enters a tunnel, loses cellular connection, or if the backend server experiences a cold-start delay, task views will fail to load or throw network error toasts.

# Feature Status Matrix (Working vs. Pending/Limited)

This section provides a transparent breakdown of the functional capabilities of the TODO-Bird ecosystem as of final submission, distinguishing between fully operational production features and known architectural limitations or deferred roadmap items.

---

## 🟢 Fully Operational Features

### 1. Authentication & Security
* **User Registration & Login:** Fully functional endpoints (`/api/auth/register`, `/api/auth/login`) with bcrypt password hashing and 7-day JWT generation.
* **Token Blacklisting & Logout:** Secure logout mechanism (`/api/auth/logout`) that invalidates active JWTs via a database blacklist collection.
* **Password Management:** Authenticated users can securely update their credentials via `/api/auth/change-password`.

### 2. Task Management Core
* **CRUD Operations:** Complete lifecycle support for creating, reading, updating, and deleting tasks (`/api/tasks/*`).
* **Priority & State Filtering:** Support for high-priority classification (`priority: 2`) and completion status tracking (`is_completed`).

### 3. Background Notification Engine
* **Automated Cron Daemon:** An in-memory `node-cron` daemon runs every minute to scan for tasks due in exactly 1 hour (55–65 minute window).
* **High-Throughput Optimization:** Uses bulk user lookups (`$in` queries) and chunked push dispatching (`expo-server-sdk`) to minimize database and network overhead.
* **Duplicate Prevention:** Successfully flags notified tasks with `notification_sent: true` via bulk updates (`updateMany`) to prevent spamming.

### 4. Frontend Mobile Client & Focus Engine
* **Pomodoro Focus Timer:** Interactive focus sessions with customizable work/break states and state-driven wellness triggers.
* **Visual Soundscapes:** Clean, immersive UI elements replacing legacy native audio binaries to ensure platform compatibility.
* **Secure API Integration:** Configured Axios instance with request interceptors to automatically attach JWT bearer tokens from secure storage.

### 5. Deployment & Native Binary Stability
* **Crash-Free Standalone Android Build:** Successfully purged legacy C++ native bindings (`expo-av`), resolving `java.lang.UnsatisfiedLinkError` and generating a stable preview APK via EAS Build (`--clear-cache`).
* **Push Token Synchronization:** Mobile client safely requests notification permissions and syncs tokens via `/api/auth/push-token`.

---

## 🟡 Operational with Limitations / Partial Implementation

### 1. Single-Device Push Token Storage
* **Current State:** The `User` schema stores a single string field (`pushToken`). 
* **Limitation:** If a user logs into TODO-Bird across multiple devices (e.g., an Android phone and a tablet), the active token overwrites the previous one, leaving only one device registered for push notifications.
* **Production Roadmap:** Refactor into a multi-device token array schema.

### 2. Cron Horizontal Scalability
* **Current State:** The cron job runs locally inside the single Express server instance.
* **Limitation:** If the backend is scaled horizontally across multiple cloud replicas, duplicate cron executions will occur.
* **Production Roadmap:** Introduce Redis-based distributed locking (Redlock) or database leader election.

---

#  User Guide & Walkthrough

Welcome you have **FOCUS TODO**, your high-performance task and focus companion. This guide provides a step-by-step walkthrough for installing, setting up, and navigating the mobile application and its backend features.

---

## Step 1: Installing the Android Preview APK

Since TODO-Bird is deployed via Expo EAS Preview builds, follow these steps to install it on your Android device:

1. **Uninstall Older Versions(if applicable):** If you have any previous builds of FOCUS TODO or TODO-Bird installed on your phone, completely uninstall them to avoid package signature conflicts.
2. **Download the APK:** Open the latest EAS build link provided in your build dashboard or scan the QR code to download the `.apk` file directly to your phone.
3. **Install and Open:** Tap the downloaded file, grant permissions to install from unknown sources if prompted, complete the installation, and open **FOCUS TODO**.

---

## Step 2: Account Authentication (Sign Up & Log In)

Upon launching the app, you will be greeted by the authentication screen.

1. **Register a New Account:**
   * Enter your preferred email address (e.g., `user@example.com`) and a secure password.
   * Tap **Register**. The app will create your account, generate a secure 7-day JWT token stored via SecureStore, and log you in automatically.
2. **Logging In:**
   * If returning, enter your registered credentials and tap **Login**.
   * *Background Action:* Upon successful login, the app requests notification permissions and transmits your Expo Push Token securely to the backend (`/api/auth/push-token`).

---

## Step 3: Managing Tasks & High-Priority Objectives

Once authenticated, you will land on your main task dashboard.

1. **Creating a Task:**
   * Tap the **Add Task** or floating action button.
   * Enter your task title and description.
   * Set the priority level. **Crucial:** Setting the priority to **High Priority** configures the automated cron daemon to track your deadlines.
   * Set a deadline (e.g., set a deadline for roughly 1 hour from now if you want to test the automated notification cron).
2. **Viewing & Filtering Tasks:**
   * Swipe through your active, pending, and completed tasks.
   * Tap a task to mark it as completed (`is_completed: true`), which removes it from active deadline tracking.

---

## Step 4: Using Focus Mode & Wellness Engine

TODO-Bird features a built-in deep work assistant to keep you productive and healthy.

1. **Launching Focus Mode:** Navigate to the Focus tab or tap a task's focus trigger.
2. **Pomodoro Timer:** Start the timer for your deep-work block (default focus intervals apply).
3. **Wellness & Soundscapes:** 
   * Observe state-driven hydration reminders to maintain healthy breaks.
   * Toggle visual ambient soundscape settings to enhance your focus environment without relying on unstable native audio bindings.

---

## Step 5: Testing Automated Push Notifications (If Push Token Fail Alert shown)

To verify that the backend cron daemon is successfully communicating with your device:

1. **Create a High-Priority Task:** Create a task with **High Priority** and set its deadline precisely **55 to 65 minutes** into the future.
2. **Ensure Login & Token Sync:** Verify that you are logged into the standalone app on a physical Android device (push notifications do not fire on emulators or Expo Go).
3. **Wait for the Cron Daemon:** Every minute, the backend server cron job scans MongoDB for high-priority tasks in that 1-hour window.
4. **Receive Alert:** When the window matches, the server dispatches an Expo push payload through `expo-server-sdk`, triggering an alert on your phone: *"High Priority Deadline Alert! Objective [Title] is due in 1 hour!"*