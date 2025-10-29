"""
Seed script for creating default categories and flashcards
Run this script once to populate the database with default data

Usage:
    python seed_default_data.py
"""
import sys
import os

# Add backend directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import categories_collection, flashcards_collection
from models import Category, Flashcard
from datetime import datetime

# Default categories with flashcards
DEFAULT_DATA = [
    {
        "name": "Basic Verbs",
        "description": "Essential English verbs for everyday communication",
        "color": "#3B82F6",
        "flashcards": [
            {"word": "To be", "translation": "бути"},
            {"word": "To have", "translation": "мати"},
            {"word": "To go", "translation": "йти, їхати"},
            {"word": "To do", "translation": "робити"},
            {"word": "To make", "translation": "робити, створювати"},
            {"word": "To get", "translation": "отримувати, ставати"},
            {"word": "To see", "translation": "бачити"},
            {"word": "To come", "translation": "приходити"},
            {"word": "To think", "translation": "думати"},
            {"word": "To take", "translation": "брати"},
        ]
    },
    {
        "name": "Common Adjectives",
        "description": "Most frequently used adjectives in English",
        "color": "#8B5CF6",
        "flashcards": [
            {"word": "Good", "translation": "хороший, добрий"},
            {"word": "Bad", "translation": "поганий"},
            {"word": "Big", "translation": "великий"},
            {"word": "Small", "translation": "малий, маленький"},
            {"word": "New", "translation": "новий"},
            {"word": "Old", "translation": "старий"},
            {"word": "Happy", "translation": "щасливий"},
            {"word": "Sad", "translation": "сумний"},
            {"word": "Easy", "translation": "легкий, простий"},
            {"word": "Difficult", "translation": "важкий, складний"},
        ]
    },
    {
        "name": "Daily Routines",
        "description": "Words and phrases for describing your daily activities",
        "color": "#10B981",
        "flashcards": [
            {"word": "Wake up", "translation": "прокидатися"},
            {"word": "Get up", "translation": "вставати"},
            {"word": "Breakfast", "translation": "сніданок"},
            {"word": "Lunch", "translation": "обід"},
            {"word": "Dinner", "translation": "вечеря"},
            {"word": "Sleep", "translation": "спати"},
            {"word": "Work", "translation": "працювати, робота"},
            {"word": "Study", "translation": "вчитися, навчатися"},
            {"word": "Rest", "translation": "відпочивати"},
            {"word": "Exercise", "translation": "тренуватися, вправи"},
        ]
    },
    {
        "name": "Food & Drinks",
        "description": "Essential vocabulary for food and beverages",
        "color": "#F59E0B",
        "flashcards": [
            {"word": "Water", "translation": "вода"},
            {"word": "Bread", "translation": "хліб"},
            {"word": "Milk", "translation": "молоко"},
            {"word": "Coffee", "translation": "кава"},
            {"word": "Tea", "translation": "чай"},
            {"word": "Apple", "translation": "яблуко"},
            {"word": "Banana", "translation": "банан"},
            {"word": "Rice", "translation": "рис"},
            {"word": "Chicken", "translation": "курка, куряче м'ясо"},
            {"word": "Fish", "translation": "риба"},
        ]
    },
    {
        "name": "Family Members",
        "description": "Words for talking about your family",
        "color": "#EC4899",
        "flashcards": [
            {"word": "Mother", "translation": "мати, мама"},
            {"word": "Father", "translation": "батько, тато"},
            {"word": "Sister", "translation": "сестра"},
            {"word": "Brother", "translation": "брат"},
            {"word": "Son", "translation": "син"},
            {"word": "Daughter", "translation": "дочка"},
            {"word": "Grandmother", "translation": "бабуся"},
            {"word": "Grandfather", "translation": "дідусь"},
            {"word": "Uncle", "translation": "дядько"},
            {"word": "Aunt", "translation": "тітка"},
        ]
    },
    {
        "name": "Weather",
        "description": "Vocabulary for describing weather conditions",
        "color": "#06B6D4",
        "flashcards": [
            {"word": "Sun", "translation": "сонце"},
            {"word": "Rain", "translation": "дощ"},
            {"word": "Snow", "translation": "сніг"},
            {"word": "Wind", "translation": "вітер"},
            {"word": "Cloud", "translation": "хмара"},
            {"word": "Hot", "translation": "спекотний, гарячий"},
            {"word": "Cold", "translation": "холодний"},
            {"word": "Warm", "translation": "теплий"},
            {"word": "Cool", "translation": "прохолодний"},
            {"word": "Storm", "translation": "буря, шторм"},
        ]
    },
    {
        "name": "Colors",
        "description": "Basic colors in English",
        "color": "#EF4444",
        "flashcards": [
            {"word": "Red", "translation": "червоний"},
            {"word": "Blue", "translation": "синій, блакитний"},
            {"word": "Green", "translation": "зелений"},
            {"word": "Yellow", "translation": "жовтий"},
            {"word": "Black", "translation": "чорний"},
            {"word": "White", "translation": "білий"},
            {"word": "Brown", "translation": "коричневий"},
            {"word": "Orange", "translation": "помаранчевий"},
            {"word": "Purple", "translation": "фіолетовий"},
            {"word": "Pink", "translation": "рожевий"},
        ]
    },
    {
        "name": "Numbers",
        "description": "Numbers from one to ten",
        "color": "#6366F1",
        "flashcards": [
            {"word": "One", "translation": "один"},
            {"word": "Two", "translation": "два"},
            {"word": "Three", "translation": "три"},
            {"word": "Four", "translation": "чотири"},
            {"word": "Five", "translation": "п'ять"},
            {"word": "Six", "translation": "шість"},
            {"word": "Seven", "translation": "сім"},
            {"word": "Eight", "translation": "вісім"},
            {"word": "Nine", "translation": "дев'ять"},
            {"word": "Ten", "translation": "десять"},
        ]
    },
    {
        "name": "Time",
        "description": "Words related to time and periods",
        "color": "#14B8A6",
        "flashcards": [
            {"word": "Hour", "translation": "година"},
            {"word": "Minute", "translation": "хвилина"},
            {"word": "Second", "translation": "секунда"},
            {"word": "Day", "translation": "день"},
            {"word": "Week", "translation": "тиждень"},
            {"word": "Month", "translation": "місяць"},
            {"word": "Year", "translation": "рік"},
            {"word": "Morning", "translation": "ранок"},
            {"word": "Evening", "translation": "вечір"},
            {"word": "Night", "translation": "ніч"},
        ]
    },
    {
        "name": "Transport",
        "description": "Different types of transportation",
        "color": "#F97316",
        "flashcards": [
            {"word": "Car", "translation": "автомобіль, машина"},
            {"word": "Bus", "translation": "автобус"},
            {"word": "Train", "translation": "поїзд"},
            {"word": "Plane", "translation": "літак"},
            {"word": "Bike", "translation": "велосипед"},
            {"word": "Boat", "translation": "човен"},
            {"word": "Ship", "translation": "корабель"},
            {"word": "Taxi", "translation": "таксі"},
            {"word": "Metro", "translation": "метро"},
            {"word": "Tram", "translation": "трамвай"},
        ]
    },
]


def seed_default_data():
    """Seed database with default categories and flashcards"""
    try:
        print("🌱 Starting to seed default data...")
        
        # Check if default data already exists
        existing_count = categories_collection.count_documents({"is_default": True})
        if existing_count > 0:
            print(f"⚠️  Found {existing_count} existing default categories")
            response = input("Do you want to delete them and recreate? (yes/no): ")
            if response.lower() != 'yes':
                print("❌ Seeding cancelled")
                return
            
            # Delete existing default data
            print("🗑️  Deleting existing default data...")
            flashcards_collection.delete_many({"is_default": True})
            categories_collection.delete_many({"is_default": True})
            print("✓ Existing default data deleted")
        
        # Insert new default data
        total_categories = 0
        total_flashcards = 0
        
        for category_data in DEFAULT_DATA:
            # Create category
            category = Category(
                user_id="system",  # System user for default categories
                name=category_data["name"],
                description=category_data["description"],
                color=category_data["color"]
            )
            
            category_dict = category.to_dict()
            category_dict["is_default"] = True  # Mark as default
            
            result = categories_collection.insert_one(category_dict)
            category_id = str(result.inserted_id)
            total_categories += 1
            
            print(f"✓ Created category: {category_data['name']}")
            
            # Create flashcards for this category
            for flashcard_data in category_data["flashcards"]:
                flashcard = Flashcard(
                    user_id="system",
                    category_id=category_id,
                    word=flashcard_data["word"],
                    translation=flashcard_data["translation"],
                    example="",
                    explanation="",
                    difficulty="medium"
                )
                
                flashcard_dict = flashcard.to_dict()
                flashcard_dict["is_default"] = True  # Mark as default
                
                flashcards_collection.insert_one(flashcard_dict)
                total_flashcards += 1
            
            print(f"  → Added {len(category_data['flashcards'])} flashcards")
        
        print(f"\n✅ Successfully seeded {total_categories} categories with {total_flashcards} flashcards!")
        print("🎉 Default data is now available for all users!")
        
    except Exception as e:
        print(f"❌ Error seeding data: {e}")


if __name__ == "__main__":
    seed_default_data()
