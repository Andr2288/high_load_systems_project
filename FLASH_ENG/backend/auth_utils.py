import jwt
import os
from datetime import datetime, timedelta, timezone
from dotenv import load_dotenv

load_dotenv()

SECRET_KEY = os.getenv('JWT_SECRET', 'your-secret-key-change-in-production')
ALGORITHM = 'HS256'
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days


def create_access_token(user_id, email, role):
    """Create JWT access token"""
    # Use timezone-aware datetime (fixed deprecated utcnow)
    now = datetime.now(timezone.utc)
    expire = now + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)

    payload = {
        'user_id': str(user_id),
        'email': email,
        'role': role,
        'exp': expire,
        'iat': now
    }

    token = jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)
    return token


def verify_token(token):
    """Verify and decode JWT token"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None
    except Exception as e:
        print(f"Token verification error: {e}")
        return None


def get_user_from_token(token):
    """Extract user info from token"""
    if not token:
        return None

    payload = verify_token(token)
    if payload:
        return {
            'user_id': payload.get('user_id'),
            'email': payload.get('email'),
            'role': payload.get('role')
        }
    return None