import os
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError
from dotenv import load_dotenv
import time

load_dotenv()

# MongoDB connection
MONGODB_URI = os.getenv('MONGODB_URI', 'mongodb+srv://admin:1234567890@flashengdotnet.iijlrb7.mongodb.net/?retryWrites=true&w=majority&appName=FlashEngDotNET')

# Global variables
client = None
db = None
users_collection = None
roles_collection = None


def connect_to_mongodb(max_retries=3):
    """Connect to MongoDB with retry logic"""
    global client, db, users_collection, roles_collection

    for attempt in range(max_retries):
        try:
            # Create client with timeout settings
            client = MongoClient(
                MONGODB_URI,
                serverSelectionTimeoutMS=5000,  # 5 seconds timeout
                connectTimeoutMS=5000,
                socketTimeoutMS=5000
            )

            # Test connection
            client.admin.command('ping')

            # Set up database and collections
            db = client['flasheng_db']
            users_collection = db['users']
            roles_collection = db['roles']

            print("✓ Connected to MongoDB!")
            return True

        except (ConnectionFailure, ServerSelectionTimeoutError) as e:
            print(f"✗ MongoDB connection attempt {attempt + 1}/{max_retries} failed: {e}")
            if attempt < max_retries - 1:
                time.sleep(2)  # Wait 2 seconds before retry
            else:
                print("✗ Could not connect to MongoDB after all retries")
                return False
        except Exception as e:
            print(f"✗ Unexpected error connecting to MongoDB: {e}")
            return False

    return False


def get_db():
    """Get database connection (with auto-reconnect)"""
    global client, db

    if db is None:
        connect_to_mongodb()

    try:
        # Test if connection is alive
        client.admin.command('ping')
        return db
    except:
        print("Lost connection to MongoDB, reconnecting...")
        connect_to_mongodb()
        return db


def init_roles():
    """Initialize default roles in database"""
    if roles_collection is None:
        return

    try:
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
    except Exception as e:
        print(f"✗ Error initializing roles: {e}")


# Connect when module is imported
if connect_to_mongodb():
    init_roles()