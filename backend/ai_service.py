"""
AI Service for OpenAI integration
Handles all AI generation requests for flashcards and exercises
"""
import os
from openai import OpenAI
from dotenv import load_dotenv
import json
import sys

# Add backend directory to path for imports
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

load_dotenv()

# Initialize OpenAI client
client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))

# Default model
DEFAULT_MODEL = "gpt-4o-mini"  # or "gpt-3.5-turbo" for cheaper option


def generate_complete_flashcard(word, english_level="intermediate", category_context=""):
    """
    Generate complete flashcard data for a word/phrase
    Returns: dict with all flashcard fields
    """
    try:
        prompt = f"""Create a comprehensive flashcard for an English vocabulary word/phrase. Word: "{word}".
The output must be in English level: {english_level}.

Return JSON format:
{{
  "text": "{word}",
  "transcription": "Resources: Oxford Learner's Dictionaries. Must use \\n\\n between each variant. Format for output: UK: [ˌjuːnɪˈvɜːsəti]\\n\\nUS: [ˌjuːnɪˈvɜːrsəti]",
  "translation": "Several possible Ukrainian translation variants (1-2 or more) for: "{word}". Output only in the format like: "Виглядати; дивитися; вигляд; зовнішність". No extra text. Only the string.",
  "short_description": "A very short description (1-2 sentences max, under 100 characters). The description should be concise and clear",
  "explanation": "Write a comprehensive, detailed explanation of the word/phrase that includes ALL of the following elements:

1. DETAILED MEANING: Start with a clear, complete definition of the word. Explain what it means in depth, including any nuances or variations
2. USAGE CONTEXT: Describe when and how this word is typically used in simple words to understand
3. REAL-WORLD APPLICATION: Describe practical situations where this word is used and explain the meaning (for example you can use synonyms)
4. SOME INTERESTING FACTS: some facts from life or specific examples 

Your explanation must be written in an engaging, educational article style appropriate for {english_level} level learners (must use \\n\\n between paragraphs). Think of it as a mini-encyclopedia entry that thoroughly covers the topic. Use simple language but provide comprehensive information.

Example structure for "opportunity":
An opportunity is a chance to do something that can be good for you. It is like a special moment when you can try something new or improve your life. When you have an opportunity, it means the right time has come to do something important.

Opportunities can happen in many parts of your life. At work, you might get an opportunity to get a better job or learn new skills. At school, you might have an opportunity to join a club or study in another country. In your personal life, you might get an opportunity to meet new friends or visit new places. Some opportunities come and go quickly, so you need to act fast. Other opportunities stay for a longer time. The important thing is to notice them and decide if you want to try.

The word 'opportunity' is very common in English. People use it when they talk about jobs, education, and life in general. For example, your teacher might say 'This is a good opportunity to practice English.' Here, opportunity means a special chance or the right moment to improve your English skills by practicing. Your boss might say 'We have an opportunity to work with a new company.' It means we can start working together with another company. In real life, opportunities are everywhere. When you meet new people, that's an opportunity to make friends. When you see a job advertisement, that's an opportunity to get work. The word 'opportunity' is a noun. You can also use the word 'chance' which means almost the same thing.",
  "examples": ["Example sentence 1 using the word", "Example sentence 2 showing different context", "Example sentence 3 with another usage"],
  "notes": ""
}}

Requirements:
- Ensure all content is in {english_level} English level
- Don't use conclusion at the end of explanation like "In conclusion" or "Overall, ...", only the main information without unnecessary text
- The "explanation" property text must be 3-4 paragraphs max
- If the given English level is A1 - use very simple language for beginners

{category_context}

Create complete flashcard for: "{word}"
"""

        response = client.chat.completions.create(
            model=DEFAULT_MODEL,
            messages=[
                {"role": "system", "content": "You are an expert English language teacher creating educational flashcards. Always respond with valid JSON only."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            response_format={"type": "json_object"}
        )

        result = json.loads(response.choices[0].message.content)
        return {
            "success": True,
            "data": result
        }

    except Exception as e:
        print(f"❌ AI Generation Error: {e}")
        return {
            "success": False,
            "error": str(e)
        }


def generate_definition(text, english_level="intermediate", category_context=""):
    """Generate detailed definition/explanation"""
    try:
        prompt = f"""English level you must to use in your output: {english_level}. A detailed definition/explanation of meaning and usage (can be longer and more comprehensive) for: {text}. Format example for output: A valley is a long, low area of land between hills or mountains. It is often formed by rivers or glaciers and can be wide or narrow. Valleys are places where people can live, grow crops, or travel through because they are lower and sometimes flatter than the surrounding land.{category_context}"""

        response = client.chat.completions.create(
            model=DEFAULT_MODEL,
            messages=[
                {"role": "system", "content": "You are an expert English language teacher. Provide clear, educational explanations."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7
        )

        return {
            "success": True,
            "data": response.choices[0].message.content.strip()
        }

    except Exception as e:
        print(f"❌ AI Generation Error: {e}")
        return {
            "success": False,
            "error": str(e)
        }


def generate_examples(text, english_level="intermediate", category_context=""):
    """Generate 3 example sentences"""
    try:
        prompt = f"""Create 3 different example sentences using the word/phrase: "{text}". English level you must to use in your output: {english_level}. Each sentence should show different contexts or meanings. Return as a JSON array of strings.{category_context}"""

        response = client.chat.completions.create(
            model=DEFAULT_MODEL,
            messages=[
                {"role": "system", "content": "You are an expert English language teacher. Always respond with valid JSON array only."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.8,
            response_format={"type": "json_object"}
        )

        result = json.loads(response.choices[0].message.content)
        
        # Handle different possible JSON structures
        if isinstance(result, list):
            examples = result
        elif isinstance(result, dict):
            # Try to find the array in the response
            examples = result.get('examples', result.get('sentences', list(result.values())[0] if result else []))
        else:
            examples = []

        return {
            "success": True,
            "data": examples[:3]  # Ensure only 3 examples
        }

    except Exception as e:
        print(f"❌ AI Generation Error: {e}")
        return {
            "success": False,
            "error": str(e)
        }


def regenerate_examples(text, english_level="intermediate", category_context=""):
    """Regenerate examples with more variety"""
    try:
        prompt = f"""Create 3 NEW and DIFFERENT example sentences using the word/phrase: "{text}". 
English level: {english_level}. 
Each sentence should show different contexts or meanings than previous examples.
Make them creative and varied.
Return as a JSON array of strings.{category_context}"""

        response = client.chat.completions.create(
            model=DEFAULT_MODEL,
            messages=[
                {"role": "system", "content": "You are an expert English language teacher creating varied examples. Always respond with valid JSON array only."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.9,  # Higher temperature for more variety
            response_format={"type": "json_object"}
        )

        result = json.loads(response.choices[0].message.content)
        
        # Handle different possible JSON structures
        if isinstance(result, list):
            examples = result
        elif isinstance(result, dict):
            examples = result.get('examples', result.get('sentences', list(result.values())[0] if result else []))
        else:
            examples = []

        return {
            "success": True,
            "data": examples[:3]
        }

    except Exception as e:
        print(f"❌ AI Generation Error: {e}")
        return {
            "success": False,
            "error": str(e)
        }


def translate_to_ukrainian(text):
    """Translate English to Ukrainian"""
    try:
        prompt = f"""Translate to Ukrainian. Provide several translation variants for: "{text}". Output only in this format: "Виглядати; дивитися; вигляд; зовнішність". No extra text. Only the string."""

        response = client.chat.completions.create(
            model=DEFAULT_MODEL,
            messages=[
                {"role": "system", "content": "You are a professional English-Ukrainian translator. Provide only the translation string, no extra text."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3
        )

        return {
            "success": True,
            "data": response.choices[0].message.content.strip()
        }

    except Exception as e:
        print(f"❌ AI Generation Error: {e}")
        return {
            "success": False,
            "error": str(e)
        }


def translate_sentence_to_ukrainian(text):
    """Translate English sentence to Ukrainian"""
    try:
        prompt = f"""Translate the following English sentence to Ukrainian. Make the translation natural, accurate and appropriate for language learning context.

English sentence: "{text}"

Requirements:
- Provide a clear, natural Ukrainian translation
- Use proper grammar and word order
- Make it sound natural for native Ukrainian speakers
- Keep the meaning accurate but not word-for-word literal
- Consider the context of language learning exercises
- Output ONLY the Ukrainian translation, no additional text

Example:
English: "I go to work every day."
Ukrainian: "Я йду на роботу щодня."

Translate: "{text}" """

        response = client.chat.completions.create(
            model=DEFAULT_MODEL,
            messages=[
                {"role": "system", "content": "You are a professional English-Ukrainian translator. Provide only the translation, no extra text."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3
        )

        return {
            "success": True,
            "data": response.choices[0].message.content.strip()
        }

    except Exception as e:
        print(f"❌ AI Generation Error: {e}")
        return {
            "success": False,
            "error": str(e)
        }


# Test function
if __name__ == "__main__":
    print("🧪 Testing AI Service...")
    
    # Test complete flashcard generation
    print("\n1️⃣ Testing complete flashcard generation...")
    result = generate_complete_flashcard("opportunity", "intermediate")
    
    if result["success"]:
        print("✅ Success!")
        print(json.dumps(result["data"], indent=2, ensure_ascii=False))
    else:
        print(f"❌ Error: {result['error']}")
    
    # Test translation
    print("\n2️⃣ Testing translation...")
    result = translate_to_ukrainian("hello")
    
    if result["success"]:
        print(f"✅ Translation: {result['data']}")
    else:
        print(f"❌ Error: {result['error']}")
