# backend/main.py
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
from dotenv import load_dotenv
from google import genai
from google.genai import types

# 1. Load Secrets
# Create a .env file later, or sets it in terminal. 
# For now, ensure your API key is ready.
load_dotenv()
api_key = os.getenv("GOOGLE_API_KEY")

# Check if key exists
if not api_key:
    print("WARNING: GOOGLE_API_KEY not found. Please set it in .env")

client = genai.Client(api_key=api_key)

# 2. Initialize the App
app = FastAPI(title="AI Reading Companion API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"], # The address of your frontend
    allow_credentials=True,
    allow_methods=["*"], # Allow all methods (GET, POST, etc.)
    allow_headers=["*"], # Allow all headers
)


# 3. Define Data Models (Pydantic)
# This acts like a "Security Guard". It checks that the data 
# sent from the frontend matches EXACTLY this structure.
class ExplanationRequest(BaseModel):
    selected_text: str
    page_context: str # The full text of the page for context

# 4. The Health Check Route
# Used to verify the server is running.
@app.get("/")
def read_root():
    return {"status": "Server is Online", "model": "Gemini 2.5 Flash"}

# 5. The Explanation Endpoint
# The Frontend will send data here via a POST request.
@app.post("/explain")
async def explain_text(request: ExplanationRequest):
    try:
        # Construct the Prompt
        # We give the AI the 'Page Context' so it knows what the user is reading.
        prompt = f"""
        You are an expert Reading Tutor.
        
        CONTEXT (The user is reading this page):
        "{request.page_context}"
        
        USER QUESTION:
        Please explain this specific text from the page: "{request.selected_text}"
        
        INSTRUCTIONS:
        1. Explain the meaning clearly.
        2. If there are difficult words, define them.
        3. Keep it concise.
        """
        
        # Send to Gemini
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt
        )
        
        # Return the answer
        return {"explanation": response.text}

    except Exception as e:
        # If anything breaks, tell the frontend what happened
        raise HTTPException(status_code=500, detail=str(e))