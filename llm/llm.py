from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
import os
from dotenv import load_dotenv
from pymongo import MongoClient
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage

# Load environment variables
load_dotenv()

# Initialize MongoDB
MONGO_URI = os.getenv("MONGODB_URI")
if not MONGO_URI:
    raise ValueError("MONGO_URI is not set. Check your .env file.")

client = MongoClient(MONGO_URI)
db = client["therapy_bot"]
chat_history_collection = db["chat_history"]

# Retrieve API key from environment variables
api_key = os.getenv("GOOGLE_API_KEY")
if not api_key:
    raise ValueError("GOOGLE_API_KEY is not set. Check your .env file.")

# Initialize the Gemini model
llm = ChatGoogleGenerativeAI(
    api_key=api_key,
    model="gemini-2.0-flash",
    temperature=0.9,
    max_tokens=None,
    timeout=None,
    max_retries=2, 
)

# Define the system message for the therapist role
SYSTEM_PROMPT = (
    "You are a compassionate and understanding therapist. Your role is to provide thoughtful, empathetic, "
    "and supportive responses to users, helping them navigate their emotions and mental health challenges. "
    "You are like a friend of the user. So you can also be occasionally sarcastic with your responses and throw around some jokes!"
    "You must analyze the user's message and identify their primary emotion from these categories: "
    "sad, angry, frustrated, or anxious. Include this emotion detection in your response using the format: "
    "EMOTION: [emotion]\nRESPONSE: [your therapeutic response]"
    "Based on the emotions, you can provide youtube links to songs that match their emotions"
    "Whenever you are about to suggest meditation, inform users about the Meditation Exercise functionality but"
    "don't mention it in every response of yours."
    "You are also able to provide general advice on mental health and well-being. "
    "You are built with context memory, so you can remember past conversations and refer back to them."
)

# Function to get or create user context
def get_or_create_user_context(user_id: str) -> list:
    """Retrieve or create a new context for a user."""
    print(f"Retrieving context for user_id: {user_id}")
    user_context = chat_history_collection.find_one({"user_id": user_id})
    if not user_context:
        print("No context found, creating a new one.")
        chat_history_collection.insert_one({"user_id": user_id, "history": []})
        return []
    return user_context["history"]

# Function to update user context
def update_user_context(user_id: str, new_message: dict):
    """Append a new message to the user's context."""
    print(f"Updating context for user_id: {user_id} with message: {new_message}")
    chat_history_collection.update_one(
        {"user_id": user_id},
        {"$push": {"history": new_message}}
    )

def detect_emotion(text: str) -> str:
    """Analyze text to detect the primary emotion."""
    print(f"Analyzing text for emotion: {text}")
    
    emotions_keywords = {
        'sad': ['sad', 'depressed', 'down', 'unhappy', 'lonely', 'grief', 'hopeless'],
        'angry': ['angry', 'mad', 'furious', 'rage', 'hate', 'irritated'],
        'frustrated': ['frustrated', 'stuck', 'annoyed', 'helpless', 'overwhelmed'],
        'anxious': ['anxious', 'worried', 'nervous', 'scared', 'panic', 'stress', 'fear']
    }
    
    text = text.lower()
    emotion_counts = {emotion: sum(1 for word in keywords if word in text)
                     for emotion, keywords in emotions_keywords.items()}
    
    print("Emotion counts:", emotion_counts)
    
    detected = max(emotion_counts.items(), key=lambda x: x[1])[0] if any(emotion_counts.values()) else ''
    print(f"Detected emotion: {detected}")
    
    return detected

# Main function to get therapy response
def get_therapy_response(user_id: str, user_input: str) -> dict:
    """Process user input and generate a therapist's response with emotion detection."""
    # Check if user input is valid
    if not user_input.strip():
        raise ValueError("User input cannot be empty.")

    # Detect emotion
    detected_emotion = detect_emotion(user_input)
    print(f"Python backend - Detected emotion: {detected_emotion}")

    # Retrieve conversation context
    print(f"Processing request for user_id: {user_id}")
    context = get_or_create_user_context(user_id)

    # Format messages for LangChain
    messages = [SystemMessage(content=SYSTEM_PROMPT)]

    for msg in context:
        if msg["role"] == "human":
            messages.append(HumanMessage(content=msg["content"]))
        elif msg["role"] == "assistant":
            messages.append(AIMessage(content=msg["content"]))

    # Add current user message
    messages.append(HumanMessage(content=user_input))

    # Debugging: Print the messages being sent
    print("Messages being sent to the LLM:", messages)

    # Generate response
    response = llm.invoke(messages)

    # Check for empty response
    if not response or not response.content:
        raise RuntimeError("Received an empty response from the Gemini API.")

    print(f"LLM Response: {response.content}")
    print(f"Returning emotion: {detected_emotion}")

    # Update context
    update_user_context(user_id, {"role": "human", "content": user_input})
    update_user_context(user_id, {"role": "assistant", "content": response.content})

    # Debug print the response and emotion
    result = {
        "emotion": detected_emotion,
        "response": response.content
    }
    print("Python backend - Returning result:", result)

    return result

# Debugging: Print confirmation that the code is running
print("Code running successfully!")
