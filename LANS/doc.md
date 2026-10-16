# Lead Application Notification System (LANS)

## 1. Overview - Architecture

The **Lead Application Notification System (LANS)** is a real-time, event-driven integration platform designed to capture, process, and instantly broadcast Meta Lead Ad submissions to a mobile client interface. 

```
[Meta Lead Ads] ---> (POST /webhook) ---> [FastAPI Backend] ---> (WebSocket /ws) ---> [React Native App]
```

### Key Components:
- **Backend**: Python FastAPI server handling webhook verification, payload ingestion, Meta Graph API fetching, and active WebSocket client broadcasting via a custom `ConnectionManager`.
- **Frontend**: Cross-platform React Native (Expo) application utilizing Zustand for state management, AsyncStorage for persistent configuration overrides, and a custom `WebSocket.tsx -> useWebSocket` component hook for reliable socket management.
- **Tunneling**: Ngrok secure tunneling for exposing local development environments to Meta's webhook servers and mobile simulators.

---

## 2. Backend Architecture (FastAPI)

The backend is structured into modular layers separation of concerns: routing, business logic, configuration, and stateful socket management.

### Directory Structure
```text
backend/
├── src/
│   ├── config/
│   │   └── config.py          # Environment variables & runtime constants
│   ├── model/
│   │   └── Payload.py         # Pydantic schemas for data validation
│   ├── services/
│   │   ├── services.py        # Core logic & Graph API integration
│   │   └── WebSockets.py      # ConnectionManager for active client tracking
│   └── main.py                # FastAPI application entrypoint & routes
```

### Core Endpoints (`main.py`)
- `GET /`: Check endpoint returning online status.
- `GET /webhook`: Meta Webhook challenge verification endpoint.
- `POST /webhook`: Receives Meta LeadGen events, validates payloads, fetches lead details from the Graph API, and broadcasts normalization outputs.
- `WEBSOCKET /ws`: Connection endpoint of websockets.

---

## 3. Frontend Architecture (React Native / Expo)

Built with a modular design pattern emphasizing state persistence and automatic reconnection.

### Directory Structure
```text
frontend/
├── src/
│   ├── api/
│   │   └── WebSockets.tsx     # Custom useWebSocket connection hook
│   ├── file/
│   │   └── handleConfig.ts    # AsyncStorage config handlers & URL cleaners
│   ├── modal/
│   │   └── ConfigModal.tsx    # Settings modal for runtime domain configuration
│   ├── screen/
│   │   └── HomeScreen.tsx     # Feed display for incoming lead cards
│   └── state/
│       └── useStore.ts        # Zustand global state container
```

### Global State (`useStore.ts`)
Manages target host overrides, active WebSocket URLs, theme preferences (`dark`/`light`), connection status text, and the incoming leads array.

### Custom WebSocket Hook (`WebSockets.tsx`)
Encapsulates native WebSocket lifecycle management with automatic exponential or interval-based retries:
- Automatically listens to changes in the target URL.
- Parses incoming JSON strings safely with error boundary protection.
- Cleans up active socket streams on component unmount.

---

## 4. Setup & Deployment Guide

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend/src
   ```
2. Create and activate a virtual environment, then install dependencies:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows use: venv\Scripts\activate
   pip install fastapi uvicorn python-dotenv requests pydantic
   ```
3. Configure your `.env` file in the root/src directory:
   ```env
   META_VERIFY_TOKEN=my_lans_secure_token_2026
   META_PAGE_ACCESS_TOKEN=your_valid_page_access_token_here
   GRAPH_API_VERSION=v26.0
   ```
4. Run the backend server:
   ```bash
   python main.py
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install project packages:
   ```bash
   npm install
   ```
3. Start Expo with tunneling enabled:
   ```bash
   npx expo start --tunnel -c
   ```

---

## 5. Troubleshooting & Maintenance

- **Ngrok URL Expiration**: Free-tier ngrok tunnels change on restart. Update your active ngrok URL inside the mobile app's **Gateway Settings Modal** whenever restarting your backend tunnel.
- **Meta Token Expiration**: Page Access Tokens expire periodically. Ensure your `.env` file contains an active token to prevent Graph API `400 Bad Request` OAuth exceptions during webhook processing.
- **WebSocket Handshake Loops**: Ensure your backend WebSocket route is correctly bound to `/ws` and that mobile clients utilize the `wss://` protocol formatter (`getFormattedWsUrl`).