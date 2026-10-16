
import json

from fastapi.responses import JSONResponse
import uvicorn
from fastapi import BackgroundTasks, FastAPI, Request, Response, WebSocket, status

from services.services import Service


app = FastAPI(
    title="LANS - Live Notification System API",
    description="Backend service for relaying Meta Lead Ad webhooks via WebSockets",
    version="1.0.0",
)


service = Service()

# ------------------------------------------------------------------------------
# Routes
# ------------------------------------------------------------------------------
@app.get("/")
async def root():
    return {
        "status": "online",
        "service": "LANS - Live Notification System Backend",
    }


@app.get("/webhook")
async def verify_webhook(request: Request):
    params = request.query_params
    mode = params.get("hub.mode")
    token = params.get("hub.verify_token")
    challenge = params.get("hub.challenge")
    if(await service.verify_recived_webhook(mode=mode,token=token)):
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
        print("[Meta Webhook] Event received")
        
        # Pass background_tasks into process_webhook
        response_data = await service.process_webhook(raw_body=raw_body, background_tasks=background_tasks)
        
        # Use JSONResponse since response_data is a dictionary
        return JSONResponse(content=response_data, status_code=status.HTTP_200_OK)
        
    except json.JSONDecodeError:
        print("[Webhook Error] Failed to parse JSON body")
        return JSONResponse(content={"error": "Invalid JSON body"}, status_code=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        print(f"[Webhook Error] Processing failed: {e}")
        return JSONResponse(content={"error": str(e)}, status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await service.connect_to_frontend(websocket)

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)