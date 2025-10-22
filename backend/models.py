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


class Category:
    """Category model for organizing flashcards"""

    def __init__(self, user_id, name, description='', color='#3B82F6'):
        self.user_id = user_id
        self.name = name
        self.description = description
        self.color = color
        self.created_at = datetime.utcnow()
        self.updated_at = datetime.utcnow()

    def to_dict(self):
        """Convert category to dictionary"""
        return {
            'user_id': self.user_id,
            'name': self.name,
            'description': self.description,
            'color': self.color,
            'created_at': self.created_at,
            'updated_at': self.updated_at
        }


class Flashcard:
    """Flashcard model for learning words"""

    def __init__(self, user_id, category_id, word, translation,
                 example='', explanation='', difficulty='medium'):
        self.user_id = user_id
        self.category_id = category_id
        self.word = word
        self.translation = translation
        self.example = example
        self.explanation = explanation
        self.difficulty = difficulty  # easy, medium, hard
        self.times_practiced = 0
        self.times_correct = 0
        self.last_practiced = None
        self.created_at = datetime.utcnow()
        self.updated_at = datetime.utcnow()

    def to_dict(self):
        """Convert flashcard to dictionary"""
        return {
            'user_id': self.user_id,
            'category_id': self.category_id,
            'word': self.word,
            'translation': self.translation,
            'example': self.example,
            'explanation': self.explanation,
            'difficulty': self.difficulty,
            'times_practiced': self.times_practiced,
            'times_correct': self.times_correct,
            'last_practiced': self.last_practiced,
            'created_at': self.created_at,
            'updated_at': self.updated_at
        }


class PracticeSession:
    """Practice session model for tracking user progress"""

    def __init__(self, user_id, category_id, total_cards,
                 correct_answers, session_duration):
        self.user_id = user_id
        self.category_id = category_id
        self.total_cards = total_cards
        self.correct_answers = correct_answers
        self.session_duration = session_duration  # in seconds
        self.score_percentage = (correct_answers / total_cards * 100) if total_cards > 0 else 0
        self.created_at = datetime.utcnow()

    def to_dict(self):
        """Convert session to dictionary"""
        return {
            'user_id': self.user_id,
            'category_id': self.category_id,
            'total_cards': self.total_cards,
            'correct_answers': self.correct_answers,
            'session_duration': self.session_duration,
            'score_percentage': self.score_percentage,
            'created_at': self.created_at
        }