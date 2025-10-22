from datetime import datetime
from bson import ObjectId
import bcrypt


class User:
    """User model for MongoDB"""

    def __init__(self, full_name, email, password, role='user'):
        self.full_name = full_name
        self.email = email
        self.password = self._hash_password(password)
        self.role = role
        self.created_at = datetime.utcnow()
        self.updated_at = datetime.utcnow()
        self.is_active = True
        self.profile_picture = None

    @staticmethod
    def _hash_password(password):
        """Hash password with bcrypt"""
        salt = bcrypt.gensalt()
        return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

    @staticmethod
    def verify_password(plain_password, hashed_password):
        """Verify password"""
        return bcrypt.checkpw(
            plain_password.encode('utf-8'),
            hashed_password.encode('utf-8')
        )

    def to_dict(self):
        """Convert user to dictionary for MongoDB"""
        return {
            'full_name': self.full_name,
            'email': self.email,
            'password': self.password,
            'role': self.role,
            'created_at': self.created_at,
            'updated_at': self.updated_at,
            'is_active': self.is_active,
            'profile_picture': self.profile_picture
        }

    @staticmethod
    def from_dict(user_dict):
        """Create User object from dictionary"""
        user = User.__new__(User)
        user.full_name = user_dict.get('full_name')
        user.email = user_dict.get('email')
        user.password = user_dict.get('password')
        user.role = user_dict.get('role', 'user')
        user.created_at = user_dict.get('created_at')
        user.updated_at = user_dict.get('updated_at')
        user.is_active = user_dict.get('is_active', True)
        user.profile_picture = user_dict.get('profile_picture')
        user._id = user_dict.get('_id')
        return user


class UserSettings:
    """User settings model"""

    def __init__(self, user_id, language_level='beginner', ai_model='gpt-3.5',
                 voice_enabled=True, notifications_enabled=True):
        self.user_id = user_id
        self.language_level = language_level
        self.ai_model = ai_model
        self.voice_enabled = voice_enabled
        self.notifications_enabled = notifications_enabled
        self.created_at = datetime.utcnow()
        self.updated_at = datetime.utcnow()

    def to_dict(self):
        """Convert settings to dictionary"""
        return {
            'user_id': self.user_id,
            'language_level': self.language_level,
            'ai_model': self.ai_model,
            'voice_enabled': self.voice_enabled,
            'notifications_enabled': self.notifications_enabled,
            'created_at': self.created_at,
            'updated_at': self.updated_at
        }