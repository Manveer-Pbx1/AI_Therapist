import axios from "axios";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const userInput = body.input;
    const userId = body.user_id || 'anonymous'; // Provide default if missing

    if (!userInput || typeof userInput !== 'string') {
      return NextResponse.json(
        { error: "Invalid input" },
        { status: 400 }
      );
    }

    const response = await axios.post("https://ai-therapist-backend-7rre.onrender.com/get-therapy-response", {
      input: userInput.trim(),
      user_id: userId
    },
    {
      headers: {
        "Content-Type": "application/json"
      }
    });

    // Log the exact structure
    console.log("Raw FastAPI response:", response.data);
    
    // Correct way to access nested data
    const responseData = response.data.response;
    console.log("Response data object:", responseData);
    
    // Extract emotion and response from the correct nesting
    return NextResponse.json({
      response: responseData.response,
      emotion: responseData.emotion
    });
  } catch (error) {
    console.error("Detailed error:", error);
    return NextResponse.json(
      { response: "Something went wrong" }, 
      { status: 500 }
    );
  }
}

