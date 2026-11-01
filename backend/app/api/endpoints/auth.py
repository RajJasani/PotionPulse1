import hashlib
import secrets
from datetime import datetime, timedelta
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, Header
from sqlalchemy.orm import Session

from backend.app.core.database import get_db, Base, engine
from backend.app.models import User
from backend.app.schemas import UserRegister, UserLogin, UserOut, AuthResponse

router = APIRouter(prefix="/auth", tags=["Authentication"])

# Ensure users table is created
Base.metadata.create_all(bind=engine)

def hash_password(password: str, salt: str = "potion_salt_2026") -> str:
    """Hashes password with salt using SHA-256."""
    return hashlib.sha256(f"{salt}:{password}".encode("utf-8")).hexdigest()

def generate_token(user_id: str) -> str:
    """Generates a secure pseudo-token for session state."""
    raw = f"{user_id}:{secrets.token_hex(16)}:{datetime.utcnow().timestamp()}"
    return hashlib.sha256(raw.encode("utf-8")).hexdigest()

# Simple in-memory token store mapping token -> user_id
ACTIVE_TOKENS: dict[str, str] = {}

def get_current_user(
    authorization: str = Header(None),
    db: Session = Depends(get_db)
) -> User:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Arcane seal missing or invalid. Please sign in."
        )
    token = authorization.replace("Bearer ", "").strip()
    user_id = ACTIVE_TOKENS.get(token)
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session charm has expired. Please sign in again."
        )
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Alchemist not found in grimoire."
        )
    return user

def ensure_demo_users(db: Session):
    """Seed initial demo users if not present."""
    demo_accounts = [
        {
            "id": "usr_hexley_master",
            "email": "hexley@potionpulse.io",
            "username": "Madam Hexley",
            "password": hash_password("alchemist2026"),
            "role": "Master Alchemist",
            "title": "High Priestess of the Cauldron",
            "avatar_emoji": "🧙‍♀️"
        },
        {
            "id": "usr_pip_apprentice",
            "email": "pip@potionpulse.io",
            "username": "Apprentice Pip",
            "password": hash_password("potion123"),
            "role": "Guild Apprentice",
            "title": "Keeper of the Vials",
            "avatar_emoji": "🧪"
        },
        {
            "id": "usr_morgath_brewer",
            "email": "morgath@potionpulse.io",
            "username": "Morgath the Shadow Brewer",
            "password": hash_password("shadow2026"),
            "role": "Potions Master",
            "title": "Celestial Demand Seer",
            "avatar_emoji": "🦇"
        }
    ]

    for demo in demo_accounts:
        existing = db.query(User).filter(User.email == demo["email"]).first()
        if not existing:
            user = User(
                id=demo["id"],
                email=demo["email"],
                username=demo["username"],
                hashed_password=demo["password"],
                role=demo["role"],
                title=demo["title"],
                avatar_emoji=demo["avatar_emoji"]
            )
            db.add(user)
    try:
        db.commit()
    except Exception:
        db.rollback()

@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
def register(data: UserRegister, db: Session = Depends(get_db)):
    """Registers a new Alchemist in the Grimoire."""
    ensure_demo_users(db)
    
    clean_email = data.email.strip().lower()
    existing = db.query(User).filter(User.email == clean_email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An alchemist with this mystical email already holds a page in the grimoire."
        )

    # Determine default avatar by role
    avatar = data.avatar_emoji or "🧙‍♂️"
    if "Apprentice" in (data.role or ""):
        avatar = "🧪"
    elif "Shadow" in (data.role or "") or "Bat" in (data.role or ""):
        avatar = "🦇"
    elif "Master" in (data.role or ""):
        avatar = "🧙‍♀️"

    user = User(
        email=clean_email,
        username=data.username.strip(),
        hashed_password=hash_password(data.password),
        role=data.role or "Master Alchemist",
        title=data.title or "Hearth Brewer",
        avatar_emoji=avatar
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = generate_token(user.id)
    ACTIVE_TOKENS[token] = user.id

    return AuthResponse(token=token, user=UserOut.model_validate(user))

@router.post("/login", response_model=AuthResponse)
def login(data: UserLogin, db: Session = Depends(get_db)):
    """Signs into the Arcane Council Grimoire."""
    ensure_demo_users(db)

    clean_email = data.email.strip().lower()
    user = db.query(User).filter(User.email == clean_email).first()
    if not user or user.hashed_password != hash_password(data.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="The arcane phrase or email does not align with our grimoire stars."
        )

    token = generate_token(user.id)
    ACTIVE_TOKENS[token] = user.id

    return AuthResponse(token=token, user=UserOut.model_validate(user))

@router.get("/me", response_model=UserOut)
def get_me(user: User = Depends(get_current_user)):
    """Returns the authenticated Alchemist profile."""
    return UserOut.model_validate(user)

@router.get("/demo-users")
def get_demo_users(db: Session = Depends(get_db)):
    """Returns preset council profiles for 1-click demonstration access."""
    ensure_demo_users(db)
    return [
        {
            "name": "Madam Hexley",
            "email": "hexley@potionpulse.io",
            "password": "alchemist2026",
            "role": "Master Alchemist",
            "avatar": "🧙‍♀️",
            "badge": "High Priestess"
        },
        {
            "name": "Apprentice Pip",
            "email": "pip@potionpulse.io",
            "password": "potion123",
            "role": "Guild Apprentice",
            "avatar": "🧪",
            "badge": "Inventory Novice"
        },
        {
            "name": "Morgath",
            "email": "morgath@potionpulse.io",
            "password": "shadow2026",
            "role": "Potions Master",
            "avatar": "🦇",
            "badge": "Night Brewer"
        }
    ]
