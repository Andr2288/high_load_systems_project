"""
Prompts configuration for AI generation
Python version of prompts.js
"""
import random

# Масив типів текстів для reading comprehension
TEXT_TYPES = [
    "documentary",
    "story",
    "news",
    "article",
    "blog",
    "scientific",
    "announcement",
    "advertisement",
    "instruction",
    "review on product / video / post etc",
    "letter",
    "documentation",
    "speech",
    "comment",
    "social media post",
]


def get_random_text_type():
    """Get random text type for reading comprehension"""
    return random.choice(TEXT_TYPES)


def get_random_sentence_type():
    """Get random sentence type"""
    return random.choice(TEXT_TYPES)


def generate_prompt(prompt_type, text, english_level, category_context=""):
    """
    Generate prompt based on type
    
    Args:
        prompt_type: Type of prompt to generate
        text: The word/phrase to use
        english_level: User's English level
        category_context: Additional context
    
    Returns:
        str: Generated prompt
    """
    
    if prompt_type == "definition":
        return f"""English level you must to use in your output: {english_level}. A detailed definition/explanation of meaning and usage (can be longer and more comprehensive) for: {text}. Format example for output: A valley is a long, low area of land between hills or mountains. It is often formed by rivers or glaciers and can be wide or narrow. Valleys are places where people can live, grow crops, or travel through because they are lower and sometimes flatter than the surrounding land.{category_context}"""
    
    elif prompt_type == "exerciseExplanation":
        return f"""English level: {english_level}. 
Task: Create an detailed explanation/description for the word/phrase: "{text}". 

Rules:
- Write 1-2 sentences max.
- Do NOT use the target word itself but you can use synonims.
- OPTIONALLY start with a categorization like "It's a thing that...", "It's a feeling when...", "It's a verb that means...", "It's a noun for..." etc.
- Do NOT add extra phrases like "Here is an explanation" or "Certainly".
- The explanation should be in the given English level.
- If the given English level is A1 - use very simple language for beginners and explain in simple words 
- Output must be only the explanation sentence.

{category_context}

✅ Correct example for word "happiness": "It's a feeling when you are very pleased and satisfied with something good that happens to you."
✅ Correct example for word "bicycle": "A two-wheeled vehicle that you move forward by pedaling with your feet. It usually has handlebars to steer, a seat to sit on, and is powered only by the rider."
❌ Incorrect example for word "bicycle": "A bicycle is a bike people ride." (uses the word and direct synonym)
❌ Incorrect example for word "Indubitably": "Certainly! Here is a clear and concise explanation for the word 'Indubitably' at A1 level: 'Used to say something is true without any doubt.'" (extra phrases, not 1 sentence)"""
    
    elif prompt_type == "shortDescription":
        return f"""English level you must to use in your output: {english_level}. Write a very short description (1-2 sentences max, under 100 characters) for English word/phrase: "{text}". The description should be concise, clear and appropriate for {english_level} level learners.{category_context}"""
    
    elif prompt_type == "example":
        return f"""Create a sentence. English level you must to use in your output: {english_level}. Word to use: {text}{category_context}"""
    
    elif prompt_type == "examples":
        return f"""Create 3 different example sentences using the word/phrase: "{text}". English level you must to use in your output: {english_level}. Each sentence should show different contexts or meanings. Return as a JSON array of strings.{category_context}"""
    
    elif prompt_type == "transcription":
        return f"""You are integrated in English LMS. Provide me with the transcription for: {text}. Resources: Oxford Learner's Dictionaries. String format example for output: UK: [ˌjuːnɪˈvɜːsəti]; US: [ˌjuːnɪˈvɜːrsəti];{category_context}"""
    
    elif prompt_type == "translateToUkrainian":
        return f"""Translate to Ukrainian. Provide several translation variants for: "{text}". Output only in this format: "Виглядати; дивитися; вигляд; зовнішність". No extra text. Only the string.{category_context}"""
    
    elif prompt_type == "completeFlashcard":
        return f"""Create a comprehensive flashcard for an English vocabulary word/phrase. Word: "{text}".
The output must be in English level: {english_level}.

Return JSON format:
{{
  "text": "{text}",
  "transcription": "Resources: Oxford Learner's Dictionaries. Must use \\n\\n between each variant. Format for output: UK: [ˌjuːnɪˈvɜːsəti] US: [ˌjuːnɪˈvɜːrsəti];",
  "translation": "Several possible Ukrainian translation variants (1-2 or more) for: "{text}". Output only in the format like: "Виглядати; дивитися; вигляд; зовнішність". No extra text. Only the string.",
  "shortDescription": "A very short description (1-2 sentences max, under 100 characters). The description should be concise and clear",
  "explanation": "Write a comprehensive, detailed explanation of the word/phrase that includes ALL of the following elements:

1. DETAILED MEANING: Start with a clear, complete definition of the word. Explain what it means in depth, including any nuances or variations
2. USAGE CONTEXT: Describe when and how this word is typically used in simple words to understand
3. REAL-WORLD APPLICATION: Describe practical situations where this word is used and explain the meaning (for example you can use synonims)
4. SOME INTERESTING FACTS: some facts form life or specific examples 

Your explanation must be written in an engaging, educational article style appropriate for {english_level} level learners (must use \\n\\n between paragraphs). Think of it as a mini-encyclopedia entry that thoroughly covers the topic. Use simple language but provide comprehensive information.

Examples structure:
  "examples": ["Example sentence 1 using the word", "Example sentence 2 showing different context", "Example sentence 3 with another usage"],
  "notes": ""
}}

Requirements:
- Ensure all content is in {english_level} English level
- Don't use conclusion at the end of explanation like "In conclusion" or "Overall, ...", only the main information without unnecessary text
- The "explanation" property text must be 3-4 paragraphs max

Example for word "opportunity":

{{
  "text": "opportunity",
  "transcription": "UK: [ˌɒpəˈtjuːnəti]\\\\n\\\\nUS: [ˌɑːpərˈtuːnəti]",
  "translation": "можливість; нагода; шанс; перспектива",
  "shortDescription": "A chance to do something good or important that can help you succeed.",
  "explanation": "An opportunity is a chance to do something that can be good for you. It is like a special moment when you can try something new or improve your life. When you have an opportunity, it means the right time has come to do something important.\\n\\nOpportunities can happen in many parts of your life. At work, you might get an opportunity to get a better job or learn new skills. At school, you might have an opportunity to join a club or study in another country. In your personal life, you might get an opportunity to meet new friends or visit new places. Some opportunities come and go quickly, so you need to act fast. Other opportunities stay for a longer time. The important thing is to notice them and decide if you want to try.\\n\\nThe word 'opportunity' is very common in English. People use it when they talk about jobs, education, and life in general. For example, your teacher might say 'This is a good opportunity to practice English.' Here, opportunity means a special chance or the right moment to improve your English skills by practicing. Your boss might say 'We have an opportunity to work with a new company.' It means we can start working together with another company. In real life, opportunities are everywhere. When you meet new people, that's an opportunity to make friends. When you see a job advertisement, that's an opportunity to get work. The word 'opportunity' is a noun. You can also use the word 'chance' which means almost the same thing.",
  "examples": [
    "This job is a good opportunity for me to learn new things.",
    "I missed the opportunity to see my favorite band in concert.",
    "Going to university is an opportunity to meet new friends."
  ],
  "notes": ""
}}
{category_context}"""
    
    else:
        return f"Generate content for: {text}"


def generate_regenerate_examples_prompt(text, english_level, category_context=""):
    """Prompt for regenerating examples"""
    return f"""Create 3 NEW and DIFFERENT example sentences using the word/phrase: "{text}". 
English level: {english_level}. 
Each sentence should show different contexts or meanings than previous examples.
Make them creative and varied.
Return as a JSON array of strings.{category_context}"""
