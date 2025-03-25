from fastapi import APIRouter, Request, Response, HTTPException, Depends, Cookie, Form
import logging
from fastapi.responses import JSONResponse
from sqlalchemy import select
from db import user_table, engine
from auth import create_access_token, get_password_hash, verify_password, SECRET_KEY, ALGORITHM
import jwt
import os
from datetime import datetime, timedelta
from api_key import SENDGRID_API_KEY
# Import SendGrid client and helper
import sendgrid
from sendgrid.helpers.mail import Mail

router = APIRouter()
logger = logging.getLogger(__name__)

# ================================
# Define validate_token dependency first
# ================================
async def validate_token(token: str = Cookie(None)):
    """Validate JWT token on every request."""
    if not token:
        raise HTTPException(status_code=401, detail="Unauthorized")
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

# ================================
# New: Forgot/Reset Password using SendGrid
# ================================
RESET_TOKEN_EXPIRY_MINUTES = 15  # Reset token valid for 15 minutes

SENDER_EMAIL = "prateeksinghkhutail@gmail.com"    # Replace with your verified sender email
# URL of your frontend reset page
RESET_PASSWORD_URL = "http://localhost:3000/reset-password"

def send_email(to_email: str, subject: str, body: str):
    """Send an email using SendGrid."""
    try:
        sg = sendgrid.SendGridAPIClient(api_key=SENDGRID_API_KEY)
        message = Mail(
            from_email=SENDER_EMAIL,
            to_emails=to_email,
            subject=subject,
            html_content=body
        )
        response = sg.send(message)
        logger.info("SendGrid response status code: %s", response.status_code)
    except Exception as e:
        logger.exception("Failed to send email with SendGrid: %s", e)
        raise HTTPException(status_code=500, detail="Failed to send reset email.")

@router.post("/forgot-password")
async def forgot_password(request: Request):
    """
    Endpoint to initiate forgot password flow.
    Expects JSON body with:
      - email
    If the user exists, a reset token is generated and emailed.
    """
    try:
        data = await request.json()
        email = data.get("email")
        if not email:
            raise HTTPException(status_code=400, detail="Email is required.")
        
        with engine.connect() as connection:
            user = connection.execute(select(user_table).where(user_table.c.email == email)).fetchone()
        if not user:
            raise HTTPException(status_code=404, detail="User not found.")
        
        reset_token = create_access_token(
            {"sub": email, "type": "reset"},
            expires_delta=timedelta(minutes=RESET_TOKEN_EXPIRY_MINUTES)
        )
        
        reset_link = f"{RESET_PASSWORD_URL}?token={reset_token}"
        email_body = f"""
        <h3>Password Reset Request</h3>
        <p>Please click the link below to reset your password. This link is valid for {RESET_TOKEN_EXPIRY_MINUTES} minutes.</p>
        <p><a href="{reset_link}">Reset Password</a></p>
        """
        send_email(email, "Password Reset Request", email_body)
        return {"message": "Password reset email sent successfully."}
    except Exception as e:
        logger.exception("Error in forgot-password endpoint")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/reset-password")
async def reset_password(token: str = Form(...), new_password: str = Form(...)):
    """
    Endpoint to reset password using the reset token.
    Expects form-data with:
      - token: The reset token from the email link.
      - new_password: The new password.
    """
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("sub")
        token_type = payload.get("type")
        if token_type != "reset":
            raise HTTPException(status_code=400, detail="Invalid token type.")
        
        with engine.connect() as connection:
            user = connection.execute(select(user_table).where(user_table.c.email == email)).fetchone()
        if not user:
            raise HTTPException(status_code=404, detail="User not found.")
        
        hashed_password = get_password_hash(new_password)
        with engine.begin() as connection:
            connection.execute(
                user_table.update().where(user_table.c.email == email).values(hashed_password=hashed_password)
            )
        return {"message": "Password has been reset successfully."}
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=400, detail="Reset token expired.")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=400, detail="Invalid reset token.")
    except Exception as e:
        logger.exception("Error in reset-password endpoint")
        raise HTTPException(status_code=500, detail=str(e))

# ================================
# Existing auth endpoints (register, login, validate-token, logout, user)
# ================================

ALLOWED_ROLES = {"admin", "view", "view_and_withdraw"}

@router.post("/register")
async def register_user(request: Request, response: Response):
    """
    Register a new user.
    Expects JSON body with:
      - name
      - email
      - contact
      - campus
      - password
      - confirmPassword
      - (optional) role
    Only roles admin, view, and view_and_withdraw are allowed.
    If no role is provided, defaults to "view".
    """
    try:
        data = await request.json()
        name = data.get("name")
        email = data.get("email")
        contact = data.get("contact")
        campus = data.get("campus")
        password = data.get("password")
        confirm_password = data.get("confirmPassword")
        role = data.get("role", "view")  # default to "view" if not provided
        
        required_fields = [name, email, contact, campus, password, confirm_password]
        if not all(required_fields):
            raise HTTPException(status_code=400, detail="All fields are required.")
        if password != confirm_password:
            raise HTTPException(status_code=400, detail="Passwords do not match.")
        if campus not in ["Pilani", "Goa", "Hyderabad"]:
            raise HTTPException(status_code=400, detail="Invalid campus selection.")
        if role not in ALLOWED_ROLES:
            raise HTTPException(status_code=400, detail="Invalid role. Allowed roles: admin, view, view_and_withdraw.")

        with engine.connect() as connection:
            existing_user = connection.execute(select(user_table).where(user_table.c.email == email)).fetchone()
            if existing_user:
                raise HTTPException(status_code=400, detail="User already exists.")

        hashed_password = get_password_hash(password)
        with engine.begin() as connection:
            connection.execute(
                user_table.insert().values(
                    name=name,
                    email=email,
                    contact=contact,
                    campus=campus,
                    hashed_password=hashed_password,
                    role=role
                )
            )
        access_token = create_access_token({"sub": email, "role": role})
        response.set_cookie(
            key="token",
            value=access_token,
            httponly=True,
            secure=False,
            path="/",
            samesite="lax"
        )
        return {"token": access_token, "message": "User registered successfully."}
    except Exception as e:
        logger.exception("Error during registration for email: %s", data.get("email", ""))
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/login")
async def login_user(request: Request, response: Response):
    """
    Log in an existing user.
    Expects JSON body with:
      - email
      - password
    The response token includes the user's role.
    """
    user_ip = request.client.host
    try:
        data = await request.json()
        email = data.get("email")
        password = data.get("password")
        logger.info("Attempting login for email: %s", email)
        if not email or not password:
            raise HTTPException(status_code=400, detail="Email and password required.")
        with engine.connect() as connection:
            user = connection.execute(
                select(user_table).where(user_table.c.email == email)
            ).mappings().fetchone()
            if not user:
                logger.info("User not found for email: %s", email)
                raise HTTPException(status_code=400, detail="Invalid email or password.")
            hashed_password = user["hashed_password"]
            if not verify_password(password, hashed_password):
                logger.info("Password verification failed for email: %s", email)
                raise HTTPException(status_code=400, detail="Invalid email or password.")
        # Include role in the token
        access_token = create_access_token({"sub": email, "role": user["role"]})
        response.set_cookie(
            key="token",
            value=access_token,
            httponly=True,
            secure=False,
            path="/",
            samesite="lax"
        )
        logger.info("Login successful for email: %s", email)
        return {"token": access_token, "message": "Login successful."}
    except HTTPException as he:
        logger.error("HTTPException during login: %s", he.detail)
        raise he
    except Exception as e:
        logger.exception("Unhandled error during login for email: %s", email)
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/validate-token")
async def validate_token_endpoint(payload: dict = Depends(validate_token)):
    return {"valid": True}

@router.post("/logout")
async def logout_user(response: Response):
    response.delete_cookie(key="token")
    return {"message": "Logged out"}

@router.get("/user")
async def get_user(payload: dict = Depends(validate_token)):
    email = payload.get("sub")
    if not email:
        raise HTTPException(status_code=401, detail="Invalid token payload.")
    with engine.connect() as connection:
        user = connection.execute(
            select(user_table).where(user_table.c.email == email)
        ).mappings().fetchone()
        if not user:
            raise HTTPException(status_code=404, detail="User not found.")
        return {"name": user["name"], "role": user["role"]}
