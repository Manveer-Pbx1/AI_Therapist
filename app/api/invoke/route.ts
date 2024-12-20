import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

// Define the POST handler for the route
export async function POST(request: Request) {
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
    console.log('Raw Curl Response:', stdout); // Debugging log

    // Attempt to parse the response as JSON
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(stdout);
    } catch (parseError) {
      if (parseError instanceof Error) {
        console.error('Error parsing JSON:', parseError.message);
      } else {
        console.error('Error parsing JSON:', parseError);
      }
      return NextResponse.json(
        { error: 'Failed to parse response as JSON.', rawResponse: stdout },
        { status: 500 }
      );
    }

    // Respond with the parsed JSON
    return NextResponse.json({ response: parsedResponse }, { status: 200 });
  } catch (error: any) {
    console.error('Error executing curl:', error.message);
    return NextResponse.json({ error: `Error executing curl: ${error.message}` }, { status: 500 });
  }
}
