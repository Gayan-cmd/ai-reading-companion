# backend/main.py
from datetime import timedelta
from fastapi import FastAPI, HTTPException, Depends,BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
from dotenv import load_dotenv
from google import genai
from google.genai import types
from contextlib import asynccontextmanager
from database import create_db_and_tables
from auth import create_access_token, get_password_hash, verify_password
from models import User, UserCreate
from database import get_session
from sqlmodel import Session,select
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from emails import send_verification_email
from jose import ExpiredSignatureError, JWTError, jwt


# 1. Load Secrets
# Create a .env file later, or sets it in terminal. 
# For now, ensure your API key is ready.
load_dotenv()
api_key = os.getenv("GOOGLE_API_KEY")
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # This runs BEFORE the app starts
    create_db_and_tables() 
    yield
    # Anything after 'yield' would run when the app shuts down

# Check if key exists
if not api_key:
    print("WARNING: GOOGLE_API_KEY not found. Please set it in .env")

client = genai.Client(api_key=api_key)

# 2. Initialize the App
app = FastAPI(lifespan=lifespan)

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
    

@app.post("/register")
def register_user(user_data:UserCreate,background_tasks:BackgroundTasks,session:Session=Depends(get_session)):
    statement1 = select(User).where(User.username==user_data.username)
    result1= session.exec(statement1)   
    user1 = result1.first()
    statement = select(User).where(User.email==user_data.email)
    result= session.exec(statement)   
    user = result.first()
    if user:
        raise HTTPException(status_code=400,detail="Email already registered")
    if user1:
        raise HTTPException(status_code=400,detail="Username already taken Try another one")
    hashed_password = get_password_hash(user_data.password)
    
    new_user = User(email=user_data.email,username=user_data.username,hashed_password=hashed_password)
    session.add(new_user)
    session.commit()
    session.refresh(new_user)
    
    verify_token = create_access_token(data={"sub":new_user.username},expires_delta=timedelta(hours=24))
    background_tasks.add_task(send_verification_email,new_user.email,verify_token)
    
    message = {"message": "User Created successfully. Please check your email to verify"}

    return message

@app.post("/token")
def login_for_access_token(form_data: OAuth2PasswordRequestForm=Depends(),session: Session=Depends(get_session)):
    
    statement = select(User).where(User.username==form_data.username)
    result=session.exec(statement)
    user =result.first()
    
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=401, # 401 = Unauthorized
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    if not user.is_verified:
       raise HTTPException(status_code=400, detail="Please verify your email address before logging in.")
    
    access_token = create_access_token(data={"sub": user.username}, expires_delta=timedelta(minutes=30))
    
    return {"access_token":access_token,"token_type":"bearer"}
    
    
@app.get("/verify")
def verify_email(token:str,session:Session=Depends(get_session)):
    try:
        payload = jwt.decode(token,SECRET_KEY,algorithms=[ALGORITHM])
        username = payload.get("sub")
        
        statement = select(User).where(User.username==username)
        result=session.exec(statement)
        user =result.first()
        
        if not user:
            raise HTTPException(
                status_code=400,
                detail="User not found"
            )
            
        if user.is_verified:
            return {"message":"User already verified"}
        
        user.is_verified = True
        session.add(user)
        session.commit()
        session.refresh(user)
        
        return {"message": "Email verified successfully! You can now log in."}
        
    except JWTError,ExpiredSignatureError :
        raise HTTPException(
            status_code=400,
            detail= "Invalid or Expired Token"

        )
        

    
    
    

    

    
