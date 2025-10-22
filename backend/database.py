import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

# MongoDB connection
MONGODB_URI = os.getenv('MONGODB_URI', 'mongodb+srv://admin:1234567890@flashengdotnet.iijlrb7.mongodb.net/?retryWrites=true&w=majority&appName=FlashEngDotNET')

try:
    client = MongoClient(MONGODB_URI)
    db = client['flasheng_db']

    # Collections
    users_collection = db['users']
    categories_collection = db['categories']
    flashcards_collection = db['flashcards']
    user_settings_collection = db['user_settings']
    practice_sessions_collection = db['practice_sessions']

    # Test connection
    client.admin.command('ping')
    print("✓ Connected to MongoDB!")

except Exception as e:
    print(f"✗ MongoDB connection error: {e}")
    db = None
    users_collection = None
    categories_collection = None
    flashcards_collection = None
    user_settings_collection = None
    practice_sessions_collection = None


# Database is ready