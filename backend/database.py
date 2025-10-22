import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

# MongoDB connection
MONGODB_URI = os.getenv('MONGODB_URI', 'mongodb+srv://admin:YOUR_PASSWORD@flashengdotnet.iijlrb7.mongodb.net/?retryWrites=true&w=majority&appName=FlashEngDotNET')

try:
    client = MongoClient(MONGODB_URI)
    db = client['flasheng_db']

    # Collections
    users_collection = db['users']
    roles_collection = db['roles']

    # Test connection
    client.admin.command('ping')
    print("✓ Connected to MongoDB!")

except Exception as e:
    print(f"✗ MongoDB connection error: {e}")
    db = None
    users_collection = None
    roles_collection = None


def init_roles():
    """Initialize default roles in database"""
    if roles_collection is None:
        return

    # Check if roles exist
    if roles_collection.count_documents({}) == 0:
        default_roles = [
            {
                'name': 'user',
                'description': 'Regular user - can create flashcards and practice',
                'permissions': ['create_flashcard', 'edit_own_flashcard', 'practice']
            },
            {
                'name': 'admin',
                'description': 'Administrator - full system access',
                'permissions': ['all']
            }
        ]
        roles_collection.insert_many(default_roles)
        print("✓ Default roles created!")


# Initialize roles on startup
init_roles()