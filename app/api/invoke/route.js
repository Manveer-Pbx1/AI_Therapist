import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

// Define the POST handler for the route
export async function POST(request) {
  try {
    const body = await request.json();

    const user_id = body.user_id || '';
    const input = body.input || '';

    if (!user_id || !input) {
      return NextResponse.json({ error: 'Invalid input. user_id and input are required.' }, { status: 400 });
    }

    // Prepare the curl command
    const curlCommand = `
      curl -s -X POST \
        -H "Content-Type: application/json" \
        -d '${JSON.stringify({ user_id, input })}' \
        https://ai-therapist-backend-7rre.onrender.com/get-therapy-response
    `;

    // Execute the command
    const { stdout } = await execPromise(curlCommand);

    // Respond with the curl output
    return NextResponse.json({ response: stdout }, { status: 200 });
  } catch (error) {
    console.error('Error executing curl:', error.message);
    return NextResponse.json({ error: `Error executing curl: ${error.message}` }, { status: 500 });
  }
}
