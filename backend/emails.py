import os
from dotenv import load_dotenv
from fastapi_mail import ConnectionConfig, FastMail,MessageSchema,MessageType

load_dotenv()
conf = ConnectionConfig(
    
    MAIL_USERNAME=os.getenv("MAIL_USERNAME"),
    MAIL_PASSWORD=os.getenv("MAIL_PASSWORD"),
    MAIL_FROM=os.getenv("MAIL_FROM"),
    MAIL_PORT=int(os.getenv("MAIL_PORT", 587)),
    MAIL_SERVER=os.getenv("MAIL_SERVER"),
    SUPPRESS_SEND=os.getenv("MAIL_SUPPRESS_SEND")=="True",
    MAIL_STARTTLS=False,
    MAIL_SSL_TLS=False,
    USE_CREDENTIALS=False,
    VALIDATE_CERTS=True
    
)

async def send_verification_email(email_to:str,token:str):
    html = f"""
    <p>Thank you for registering. Please click the link below to verify your email address:</p>
    <p><a href="http://localhost:8000/verify?token={token}">Click here to verify your email</a></p>   
    <p>If you did not sign up for this account, please ignore this email.</p>
    """
    
    if conf.SUPPRESS_SEND:
        print("\n" + "="*20 + " FAKE EMAIL " + "="*20)
        print(f"TO: {email_to}")
        print(f"LINK: http://localhost:8000/verify?token={token}")
        print("="*52 + "\n")
        
        
    message = MessageSchema(
        subject="Email Verification",
        recipients=[email_to],
        body=html,
        subtype=MessageType.html
    )
    
    fm = FastMail(conf)
    await fm.send_message(message)
    

