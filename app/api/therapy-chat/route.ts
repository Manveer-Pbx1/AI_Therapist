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
      "https://ai-therapy-bot-backend-81f7h80uv-manveers-projects-5a610783.vercel.app/get-therapy-response",
      {
        input: body.input.trim(),
        user_id: body.user_id || 'anonymous'
      }
    );

    // Clean and format the response
    let responseText = '';
    let emotion = 'neutral';

    if (response.data.response?.response) {
      responseText = response.data.response.response;
      emotion = response.data.response.emotion;
    } else if (typeof response.data.response === 'string') {
      // Clean up the response if it still contains the format markers
      responseText = response.data.response.includes('RESPONSE:') 
        ? response.data.response.split('RESPONSE:')[1].trim()
        : response.data.response;
      emotion = response.data.emotion || 'neutral';
    }

    // Remove any remaining "EMOTION:" or "RESPONSE:" markers
    responseText = responseText
      .replace(/EMOTION:.*\n?/i, '')
      .replace(/RESPONSE:.*\n?/i, '')
      .trim();

    const formattedResponse = {
      response: responseText,
      emotion: emotion
    };

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

