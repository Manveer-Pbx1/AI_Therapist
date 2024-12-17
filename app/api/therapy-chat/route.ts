import axios from "axios";
import { NextResponse } from "next/server";

const MAX_RETRIES = 3;
const INITIAL_TIMEOUT = 120000; // 120 seconds

async function makeRequestWithRetry(url: string, data: any, retryCount = 0) {
  try {
    console.log(`[DEBUG] Attempt ${retryCount + 1} - Sending request to: ${url}`);
    const response = await axios.post(url, data, {
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      timeout: INITIAL_TIMEOUT,
      validateStatus: (status) => status < 500, // Accept any status < 500
    });
    
    console.log(`[DEBUG] Received response:`, response.data);
    return response;
  } catch (error: any) {
    console.error(`[ERROR] Attempt ${retryCount + 1} failed:`, error.message);
    
    if (retryCount < MAX_RETRIES) {
      const delay = Math.min(1000 * Math.pow(2, retryCount), 10000);
      console.log(`[DEBUG] Waiting ${delay}ms before retry...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return makeRequestWithRetry(url, data, retryCount + 1);
    }
    throw error;
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log("[DEBUG] Received request body:", body);

    const response = await makeRequestWithRetry(
      "https://ai-therapist-backend-7rre.onrender.com/get-therapy-response",
      {
        input: body.input.trim(),
        user_id: body.user_id || 'anonymous'
      }
    );

    // Handle different response structures
    let formattedResponse;
    if (response.data.response?.response) {
      // New structure
      formattedResponse = {
        response: response.data.response.response,
        emotion: response.data.response.emotion || 'neutral'
      };
    } else if (typeof response.data === 'object') {
      // Old structure
      formattedResponse = {
        response: response.data.response || response.data.message || "Received response",
        emotion: response.data.emotion || 'neutral'
      };
    } else {
      formattedResponse = {
        response: String(response.data),
        emotion: 'neutral'
      };
    }

    console.log("[DEBUG] Sending formatted response:", formattedResponse);
    return NextResponse.json(formattedResponse);

  } catch (error: any) {
    console.error("[ERROR] Full error details:", error);
    
    // Send a more graceful error response
    return NextResponse.json({
      error: true,
      response: "I'm still processing your message. Please give me a moment.",
      emotion: 'neutral'
    }, { status: 200 }); // Send 200 instead of error status
  }
}

