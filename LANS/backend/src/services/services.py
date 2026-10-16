from typing import Optional
from fastapi import WebSocket, WebSocketDisconnect, BackgroundTasks
import json
import httpx

from config.config import Config
from .WebSockets import ConnectionManager
from model.Payload import LeadPayload


class Service:
    def __init__(self):
        self.config = Config()
        self.manager = ConnectionManager()

    async def fetch_and_broadcast_lead(self, leadgen_id: str, form_id: str, created_time: Optional[int]):
        """
        Asynchronously queries Meta Graph API to fetch form submission details
        (name, email, phone) using the leadgen_id, then broadcasts via WebSockets.
        """
        url = f"https://graph.facebook.com/{self.config.graph_api_version}/{leadgen_id}"
        params = {"access_token": self.config.page_access_token} 
    
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
                    await self.manager.broadcast(normalized_lead.model_dump())
                    print("[WebSocket] Broadcasted lead notofication data\n")
                else:
                    print(f"[Graph API Error] Status {response.status_code}: {response.text}")
            except Exception as e:
                print(f"[Graph API Exception] Failed to query lead details: {e}")
    
    async def process_webhook(self, raw_body: dict, background_tasks: BackgroundTasks):
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
                        # Pass FastAPI's background_tasks here correctly
                        background_tasks.add_task(
                            self.fetch_and_broadcast_lead, 
                            leadgen_id, 
                            form_id, 
                            created_time
                        )
        
        return {"status": "success"}
    
    async def verify_recived_webhook(self, mode, token):
        if mode == "subscribe" and token == self.config.verify_token:
            print("[Meta Webhook] Verification handshake successful!")
            return True
        print("[Meta Webhook] Verification failed. Token mismatch or bad mode.")
        return False
    
    async def connect_to_frontend(self, websocket: WebSocket):
        await self.manager.connect(websocket)
        try:
            while True:
                await websocket.receive_text()
        except WebSocketDisconnect:
            self.manager.disconnect(websocket)