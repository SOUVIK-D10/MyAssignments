import os
import uvicorn
import json
import httpx
from typing import List, Optional
from dotenv import load_dotenv
from fastapi import FastAPI, Request, Response, WebSocket, WebSocketDisconnect, BackgroundTasks, status
from pydantic import BaseModel

load_dotenv()

VERIFY_TOKEN = os.getenv("META_VERIFY_TOKEN", "my_lans_secure_token_2026")
PAGE_ACCESS_TOKEN = os.getenv("META_PAGE_ACCESS_TOKEN", "YOUR_PAGE_ACCESS_TOKEN_HERE")
GRAPH_API_VERSION = "v26.0"

app = FastAPI(
    title="LANS - Live Notification System API",
    description="Backend service for relaying Meta Lead Ad webhooks via WebSockets",
    version="1.0.0",
)

# ------------------------------------------------------------------------------
# Pydantic Schemas for Normalized Lead Output
# ------------------------------------------------------------------------------
class LeadPayload(BaseModel):
    leadgen_id: str
    form_id: Optional[str] = "N/A"
    created_time: Optional[int] = None
    name: Optional[str] = "N/A"
    email: Optional[str] = "N/A"
    phone: Optional[str] = "N/A"

# ------------------------------------------------------------------------------
# WebSocket Connection Manager
# ------------------------------------------------------------------------------
class ConnectionManager:
    """Manages active client WebSocket connections and broadcasts lead payloads."""
    
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        print(f"[WebSocket] Client connected. Total active connections: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
            print(f"[WebSocket] Client disconnected. Total active connections: {len(self.active_connections)}")

    async def broadcast(self, data: dict):
        """Pushes JSON payload to all connected clients."""
        disconnected_clients = []
        for connection in self.active_connections:
            try:
                await connection.send_json(data)
            except Exception as e:
                print(f"[WebSocket] Error broadcasting to client: {e}")
                disconnected_clients.append(connection)
        
        for client in disconnected_clients:
            self.disconnect(client)

manager = ConnectionManager()

# ------------------------------------------------------------------------------
# Helper: Graph API Lead Fetcher
# ------------------------------------------------------------------------------
async def fetch_and_broadcast_lead(leadgen_id: str, form_id: str, created_time: Optional[int]):
    """
    Asynchronously queries Meta Graph API to fetch form submission details
    (name, email, phone) using the leadgen_id, then broadcasts via WebSockets.
    """
    url = f"https://graph.facebook.com/{GRAPH_API_VERSION}/{leadgen_id}"
    params = {"access_token": PAGE_ACCESS_TOKEN}

    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(url, params=params)
            if response.status_code == 200:
                lead_data = response.json()
                print(f"[Graph API] Successfully retrieved lead data for ID: {leadgen_id}")

                field_data = lead_data.get("field_data", [])
                parsed_fields = {}
                
                for field in field_data:
                    name = field.get("name")
                    values = field.get("values", [])
                    if values:
                        parsed_fields[name] = values[0]

                normalized_lead = LeadPayload(
                    leadgen_id=leadgen_id,
                    form_id=form_id,
                    created_time=created_time,
                    name=parsed_fields.get("full_name") or parsed_fields.get("name") or "N/A",
                    email=parsed_fields.get("email") or "N/A",
                    phone=parsed_fields.get("phone_number") or "N/A",
                )

                # Push to all connected WebSocket clients
                await manager.broadcast(normalized_lead.model_dump())
                print("See What we got\n",normalized_lead.model_dump())
            else:
                print(f"[Graph API Error] Status {response.status_code}: {response.text}")
        except Exception as e:
            print(f"[Graph API Exception] Failed to query lead details: {e}")

# ------------------------------------------------------------------------------
# Routes
# ------------------------------------------------------------------------------
@app.get("/")
async def root():
    return {
        "status": "online",
        "service": "LANS - Live Notification System Backend",
        "active_sockets": len(manager.active_connections),
    }


@app.get("/webhook")
async def verify_webhook(request: Request):
    params = request.query_params
    mode = params.get("hub.mode")
    token = params.get("hub.verify_token")
    challenge = params.get("hub.challenge")

    if mode == "subscribe" and token == VERIFY_TOKEN:
        print("[Meta Webhook] Verification handshake successful!")
        return Response(content=challenge, media_type="text/plain", status_code=status.HTTP_200_OK)
    
    print("[Meta Webhook] Verification failed. Token mismatch or bad mode.")
    return Response(content="Verification failed", status_code=status.HTTP_403_FORBIDDEN)


@app.post("/webhook")
async def receive_webhook(request: Request, background_tasks: BackgroundTasks):
    """
    Receives LeadGen webhook notifications from Meta, responds instantly with 200 OK,
    and dispatches a background task to fetch full lead payload from Graph API.
    """
    try:
        raw_body = await request.json()
        print("[Meta Webhook] Event received:", json.dumps(raw_body, indent=2))

        entries = raw_body.get("entry", [])
        for entry in entries:
            changes = entry.get("changes", [])
            for change in changes:
                if change.get("field") == "leadgen":
                    value = change.get("value", {})
                    leadgen_id = str(value.get("leadgen_id"))
                    form_id = str(value.get("form_id", "N/A"))
                    created_time = value.get("created_time")

                    if leadgen_id:
                        # Offload Graph API retrieval to background task to prevent webhook timeout
                        background_tasks.add_task(
                            fetch_and_broadcast_lead, 
                            leadgen_id, 
                            form_id, 
                            created_time
                        )
                        
    except Exception as e:
        print(f"[Meta Webhook] Error parsing webhook body: {e}")
        return {"status": "error", "message": str(e)}

    return {"status": "success"}


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # Keep socket connection alive by listening for ping/text
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)