import axios from "axios";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const userInput = body.input;
    const userId = body.user_id || 'anonymous';

    if (!userInput || typeof userInput !== 'string') {
      return NextResponse.json(
        { error: "Invalid input" },
        { status: 400 }
      );
    }

    const response = await axios.post(
      "https://ai-therapist-backend-7rre.onrender.com/get-therapy-response",
      {
        input: userInput.trim(),
        user_id: userId
      },
      {
        headers: {
          "Content-Type": "application/json"
        },
        timeout: 60000, // 60 second timeout
        timeoutErrorMessage: "Request timed out. The server is taking too long to respond."
      }
    );

    // Log the exact structure
    console.log("Raw FastAPI response:", response.data);
    
    if (!response.data || !response.data.response) {
      throw new Error("Invalid response format from backend");
    }

    const responseData = response.data.response;
    console.log("Response data object:", responseData);
    
    return NextResponse.json({
      response: responseData.response,
      emotion: responseData.emotion
    });

  } catch (error: any) {
    console.error("Detailed error:", error);
    let errorMessage = "Something went wrong";
    let statusCode = 500;

    if (error.code === 'ECONNABORTED') {
      errorMessage = "Request timed out. Please try again.";
      statusCode = 504;
    } else if (error.response) {
      errorMessage = error.response.data?.error || "Server error occurred";
      statusCode = error.response.status;
    }

    return NextResponse.json(
      { 
        error: errorMessage,
        response: "I apologize, but I'm having trouble connecting to the server. Please try again in a moment." 
      },
      { status: statusCode }
    );
  }
}

