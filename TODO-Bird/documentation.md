Here is your documentation cleaned up, formatted, and polished. The technical details are preserved, while mechanical AI phrasing has been stripped out to sound human, direct, and senior-engineered.

---

# TODO-Bird: High-Performance Task & Focus Engine

## 1. Project Overview & Architecture

**FOCUS TODO** is a cross-platform mobile productivity application built for focus and daily task execution. Designed around a decoupled client-server architecture, it pairs a React Native mobile client with an Express/Node.js backend. The system removes friction from task management while using an automated background notification engine to enforce focus blocks and keep deadlines accountable.

---

## 2. Tech Stack & System Components

* **Frontend Mobile Client:** React Native, Expo (SDK 51+), TypeScript, Zustand (State Management), Expo Notifications, Lucide Icons.
* **Backend API Server:** Node.js, Express.js, TypeScript, Mongoose ODM.
* **Database & Security:** MongoDB, JSON Web Tokens (JWT) with token blacklisting, bcrypt password hashing.
* **Automation & Infrastructure:** `node-cron` daemon for background tasks, `expo-server-sdk` for push notification dispatches, EAS Build (`preview` profile) for standalone Android APK generation.

---

## 3. Core Features & Engineering Highlights

* **Optimized Deadline Notification Daemon:** A background cron worker checks tasks every minute using bulk MongoDB queries (`$in`) and chunked push dispatches via `expo-server-sdk`. It alerts users 1 hour before high-priority tasks are due, minimizing database load and using bulk updates (`updateMany`) to prevent duplicate dispatches.
* **Focus Mode & Wellness Engine:** An integrated Pomodoro timer with customizable intervals, state-driven hydration reminders, and responsive visual ambient soundscape controls.
* **Native Binary Stability:** Resolved native C++ JSI linking conflicts by removing legacy audio modules (`expo-av`), establishing a crash-free standalone Android execution environment.
* **Push Token Synchronization:** Automated device registration captures Expo push tokens on login and syncs them safely to the backend through an Axios interceptor-backed client.

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

# Start local development server (test via Expo Go / Development Build)
npx expo start --tunnel -c

# Ensure eas.json or .env includes your endpoint:
# "EXPO_PUBLIC_API_URL": "https://your-ngrok-url.ngrok-free.dev/api"

# Build standalone Android Preview APK
npx eas build --platform android --profile preview --clear-cache

```

---

# System Loopholes, Edge Cases & Scaling Considerations

Documenting known architectural trade-offs, edge cases, and scaling plans demonstrates practical engineering foresight and production-level awareness.

---

## 0. Known Local Execution Limitations

* **State Reload Behavior:** When switching or navigating away from the Recycle Bin and returning, the automatic view refresh does not trigger reliably. A manual pull-to-refresh (drag down) is currently required.
* **Local Backend Dependence:** The compiled preview APK communicates with a local backend URL (or Ngrok tunnel). If the local server environment is inactive or the `.env` API variable is unconfigured, network requests in the standalone APK will fail.

---

## 1. Architectural & Scaling Limitations

### A. Single-Instance Notification Cron Concurrency

* **Current Implementation:** The `node-cron` daemon runs in-memory inside the primary Express server process (`index.ts`).
* **The Trade-Off / Risk:** If the backend is horizontally scaled across multiple instance replicas (e.g., Render, AWS ECS, Kubernetes), **every running replica** will execute the cron job simultaneously every minute. This triggers redundant database queries and duplicate push notifications.
* **Production Fix:** Introduce a distributed locking strategy using Redis (e.g., Redlock) or a database-backed leader election model so only a single instance executes the cron task per minute cycle.

### B. Single-Device Push Token Storage

* **Current Implementation:** The `User` schema stores a single string property: `pushToken`. Logging in on a new device overwrites the existing token in MongoDB.
* **The Trade-Off / Risk:** If a user logs into TODO-Bird across multiple devices (e.g., an Android phone and a tablet), only the most recently active device receives push alerts.
* **Production Fix:** Refactor `pushToken` into an array of device objects (`[{ token: string, deviceType: string, updatedAt: Date }]`) or a separate `DeviceToken` sub-collection.

---

## 2. Notification & Token Management Edge Cases

### A. Stale Token Cleanup

* **Current Implementation:** The cron worker dispatches notification payloads via `expo-server-sdk`. If Expo returns a `DeviceNotRegistered` error ticket (indicating the app was uninstalled or permissions revoked), the expired token remains in MongoDB.
* **The Trade-Off / Risk:** The database accumulates stale tokens over time, wasting unnecessary compute cycles during cron scans.
* **Production Fix:** Listen for error ticket responses in the dispatch handler and automatically prune unregistered tokens from the database.

### B. Timezone Synchronization

* **Current Implementation:** Deadline queries evaluate targets against server time (`new Date()`) within an absolute 60-minute window (`$gte: targetStart, $lte: targetEnd`).
* **The Trade-Off / Risk:** If the server runs in UTC while users create tasks in local offsets (e.g., IST / PST), minor timezone offset discrepancies can occur if inputs are not strictly parsed.
* **Production Fix:** Ensure all task deadlines are converted to ISO UTC `Date` objects upon creation, separating user-facing time formatting from server-side evaluation logic.

---

## 3. Security & Authentication Edge Cases

### A. Token Blacklist Memory Overhead

* **Current Implementation:** Logging out pushes active JWTs into a `TokenBlacklist` MongoDB collection to prevent reuse.
* **The Trade-Off / Risk:** Without an explicit TTL (Time-To-Live) index on document creation dates, this collection grows continuously over time.
* **Production Fix:** Add a MongoDB TTL index to the blacklist schema matching the maximum JWT expiration duration so revoked token records self-delete automatically.

### B. Fixed Long-Lived JWT Durations

* **Current Implementation:** Access tokens use a 7-day expiration window (`expiresIn: '7d'`), after which users must re-authenticate.
* **The Trade-Off / Risk:** Long-lived tokens simplify authentication but limit instant access revocation compared to short-lived access tokens paired with refresh tokens.
* **Production Fix:** Implement a dual-token setup (short-lived Access Tokens + HttpOnly Refresh Tokens).

---

## 4. Client-Side & Network Resilience

### A. Network Latency & Offline State

* **Current Implementation:** The client interacts directly with API endpoints via `axiosInstance` and Zustand store hooks.
* **The Trade-Off / Risk:** Network drops, bad connectivity, or local backend restarts cause pending requests to fail and display API error toasts.
* **Production Fix:** Integrate offline persistent caching (such as React Query with Async Storage persistence) to render optimistic UI updates when disconnected.

---

# Feature Status Matrix (Working vs. Pending)

---

## 🟢 Fully Operational Features

### 1. Authentication & Security

* **Registration & Login:** Full API coverage (`/api/auth/register`, `/api/auth/login`) with bcrypt password hashing and 7-day JWT issuance.
* **Token Blacklisting:** Instant token revocation on logout (`/api/auth/logout`) backed by a database blacklist collection.
* **Password Management:** Secure password changes via `/api/auth/change-password`.

### 2. Task Management Core

* **CRUD Lifecycle:** Complete task manipulation endpoints (`/api/tasks/*`).
* **Priority & State Filtering:** Support for high-priority classification (`priority: 2`) and completion state tracking (`is_completed`).

### 3. Background Notification Engine

* **Automated Cron Daemon:** In-memory `node-cron` worker scanning every 60 seconds for tasks due within a 55–65 minute window.
* **Optimized Bulk Operations:** Multi-user lookups (`$in` queries) combined with chunked push dispatches (`expo-server-sdk`).
* **Duplicate Prevention:** Flags dispatched tasks with `notification_sent: true` using bulk database operations (`updateMany`).

### 4. Client Mobile App & Focus Engine

* **Pomodoro Focus Timer:** Interactive timer routines with customizable work/break states.
* **Visual Soundscapes:** Clean, visual ambient toggles replacing heavy native audio libraries for cross-device stability.
* **Authenticated API Client:** Axios interceptor pipeline automatically attaching JWT bearer credentials from local secure storage.

### 5. Deployment & Native Binary Stability

* **Stable Standalone Android APK:** Removed unstable native bindings (`expo-av`) to fix C++ linking errors (`java.lang.UnsatisfiedLinkError`) and generate clean preview APKs via EAS Build.
* **Token Handshake:** Requests notification permissions on startup and registers device Expo Push Tokens via `/api/auth/push-token`.

---

## 🟡 Known Limitations / Roadmap Work

### 1. Single-Device Push Tokens

* **Current State:** The `User` schema holds one string token (`pushToken`).
* **Limitation:** Logging in on a second device overwrites the previous token.
* **Roadmap:** Transition to a multi-device token array.

### 2. Cron Scalability

* **Current State:** Cron runs locally inside the single Express process.
* **Limitation:** Multiple backend replicas would duplicate cron triggers.
* **Roadmap:** Add Redis-based distributed locks (Redlock).

---

# User Guide & Walkthrough

Welcome to **FOCUS TODO**. This guide walks through installation, account setup, and task management workflows.

---

## Step 1: Installing the Android Preview APK

1. **Uninstall Older Versions:** If previous test builds of TODO-Bird or FOCUS TODO are installed on your device, remove them completely to avoid signature mismatches.
2. **Download the APK:** Open the provided EAS build download URL or scan the build QR code to download the `.apk` file directly to your phone.
3. **Install & Launch:** Tap the downloaded file, grant permission to install from unknown sources if prompted, and launch **FOCUS TODO**.

---

## Step 2: Account Authentication

1. **Register an Account:**
* Enter an email address and password on the auth screen.
* Tap **Register**. The app creates your account, saves your 7-day session token in secure storage, and lands on the dashboard.


2. **Log In:**
* Enter your credentials and tap **Login**.
* *Background Action:* On successful authentication, the client requests push notification permissions and syncs your Expo Push Token to the backend (`/api/auth/push-token`).



---

## Step 3: Managing Tasks & Priorities

1. **Creating a Task:**
* Tap the **Add Task** button.
* Enter the task title and description.
* Select **High Priority** to enable background deadline tracking.
* Set a deadline (e.g., set a deadline ~1 hour in the future to test notification triggers).


2. **Task Filtering:**
* Toggle between active, pending, and completed tasks.
* Tap a task to mark it as completed (`is_completed: true`), removing it from active notification schedules.



---

## Step 4: Using Focus Mode

1. **Launch Focus Mode:** Open the Focus tab or tap a task's focus trigger.
2. **Pomodoro Timer:** Start the timer for your deep-work session.
3. **Wellness & Visual Soundscapes:** View hydration prompts during work intervals and toggle visual ambient soundscapes.

---

## Step 5: Testing Push Notifications

1. **Create a High-Priority Task:** Set the task priority to **High Priority** with a deadline **55 to 65 minutes** in the future.
2. **Device Readiness:** Ensure you are logged into the standalone APK on a physical Android device (push notifications require native device registration).
3. **Background Cron Dispatch:** The backend cron job scans MongoDB every minute.
4. **Notification Arrival:** When the target window matches, the server dispatches an Expo push payload, delivering the alert: *"High Priority Deadline Alert! Objective [Title] is due in 1 hour!"*

---

If you want a step-by-step visual reference for configuring Expo push notifications with Firebase FCM V1 on Android, this video provides a concise overview:

[Android + Expo Push Notifications with Firebase (V1)](https://www.youtube.com/watch?v=o4BEghdLetc)

This video is directly relevant as it demonstrates setting up Expo push notification credentials and handling Android FCM V1 payloads during production builds.