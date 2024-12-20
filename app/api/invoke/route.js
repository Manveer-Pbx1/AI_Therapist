import { exec } from 'child_process';

export default function handler(req, res) {
  const curlCommand = `
    curl -s -X POST \
      -H "Content-Type: application/json" \
      -d '{"user_id":"123", "input":"Hi. Just say hi back to me."}' \
      https://ai-therapist-backend-7rre.onrender.com/get-therapy-response
  `;

  exec(curlCommand, (error, stdout, stderr) => {
    if (error) {
      res.status(500).json({ error: `Error executing curl: ${error.message}` });
      return;
    }

    if (stderr) {
      res.status(500).json({ error: `Curl stderr: ${stderr}` });
      return;
    }

    res.status(200).json({ response: stdout });
  });
}
