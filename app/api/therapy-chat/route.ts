import axios from "axios";
import { NextResponse } from "next/server";

const MAX_RETRIES = 3;
const INITIAL_TIMEOUT = 30000; // 30 seconds

async function makeRequestWithRetry(url: string, data: any, retryCount = 0) {
  try {
    const response = await axios.post(url, data, {
      headers: {
        "Content-Type": "application/json"
      },
      timeout: INITIAL_TIMEOUT * (retryCount + 1), // Increase timeout with each retry
      timeoutErrorMessage: "Request timed out. The server is taking too long to respond."
    });
    
    return response;
  } catch (error: any) {
    console.error(`Attempt ${retryCount + 1} failed:`, error.message);
    
    if (retryCount < MAX_RETRIES && 
        (error.code === 'ECONNABORTED' || error.response?.status === 504)) {
      console.log(`Retrying... Attempt ${retryCount + 2}`);
      return makeRequestWithRetry(url, data, retryCount + 1);
    }
    throw error;
  }
}

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

    console.log("Sending request to backend with data:", {
      input: userInput.trim(),
      user_id: userId
    });

    const response = await makeRequestWithRetry(
      "https://ai-therapist-backend-7rre.onrender.com/get-therapy-response",
      {
        input: userInput.trim(),
        user_id: userId
      }
    );

    console.log("Raw backend response:", response.data);

    // Validate response structure
    if (!response.data || typeof response.data !== 'object') {
      throw new Error("Invalid response format from backend");
    }

    const responseData = response.data.response || response.data;
    
    return NextResponse.json({
      response: responseData.response || responseData,
      emotion: responseData.emotion || 'neutral'
    });

  } catch (error: any) {
    console.error("Detailed error in route handler:", error);
    
    const errorResponse = {
      error: true,
      response: "I apologize, but I'm having trouble connecting. Please try again in a moment.",
      details: error.message
    };

    // Determine appropriate status code
    let statusCode = 500;
    if (error.code === 'ECONNABORTED' || error.response?.status === 504) {
      statusCode = 504;
      errorResponse.response = "The server is taking too long to respond. Please try again.";
    } else if (error.response?.status) {
      statusCode = error.response.status;
    }

    return NextResponse.json(errorResponse, { status: statusCode });
  }
}

