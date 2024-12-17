# fastapi-backend/main.py
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from models import UserInput
from llm import get_therapy_response

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/get-therapy-response")
async def get_therapy_response_route(user_input: UserInput):
    """Handle user input and return the therapist's response."""
    try:
        print("[DEBUG] Received input:", user_input)
        
        # Generate the response
        result = get_therapy_response(user_input.user_id, user_input.input)
        print("[DEBUG] Generated response:", result)
        
        # Clean up the response text
        response_text = result["response"]
        if "RESPONSE:" in response_text:
            response_text = response_text.split("RESPONSE:")[1].strip()
        
        # Format the response properly
        response_data = {
            "response": {
                "response": response_text,
                "emotion": result["emotion"]
            }
        }
        print("[DEBUG] Sending response:", response_data)
        
        return JSONResponse(content=response_data, status_code=200)
        
    except Exception as e:
        print(f"[ERROR] Error processing request: {str(e)}")
        return JSONResponse(
            content={"error": str(e)},
            status_code=500
        )

