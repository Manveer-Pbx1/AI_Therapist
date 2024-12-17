export const getWelcomeEmailTemplate = (name: string) => `
<!DOCTYPE html>
<html>
<head>
    <style>
        body {
            font-family: 'Arial', sans-serif;
            line-height: 1.6;
            color: #333;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8f9fa;
        }
        .header {
            text-align: center;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border-radius: 10px 10px 0 0;
        }
        .content {
            background: white;
            padding: 30px;
            border-radius: 0 0 10px 10px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .quote {
            font-style: italic;
            color: #666;
            border-left: 4px solid #764ba2;
            padding-left: 15px;
            margin: 20px 0;
        }
        .image {
            width: 100%;
            max-width: 400px;
            margin: 20px auto;
            display: block;
            border-radius: 8px;
        }
        .button {
            display: inline-block;
            padding: 12px 24px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-decoration: none;
            border-radius: 25px;
            margin: 20px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Welcome to Your Mental Health Journey</h1>
        </div>
        <div class="content">
            <h2>Hello ${name},</h2>
            
            <p>Welcome to our AI Therapy companion! We're here to support you on your journey to better mental health.</p>

            <img src="https://images.unsplash.com/photo-1512696577596-5d1bd31f36a1" alt="Peaceful scenery" class="image">

            <div class="quote">
                "The greatest glory in living lies not in never falling, but in rising every time we fall." - Nelson Mandela
            </div>

            <p>What you can expect from us:</p>
            <ul>
                <li>24/7 AI companion to talk to</li>
                <li>Safe and judgment-free space</li>
                <li>Personalized conversations</li>
                <li>Regular check-ins and support</li>
            </ul>

            <img src="https://images.unsplash.com/photo-1499209974431-9dddcece7f88" alt="Meditation" class="image">

            <p>Remember, seeking support is a sign of strength, not weakness. We're honored to be part of your journey.</p>

            <a href="${process.env.NEXTAUTH_URL}" class="button">Start Your Journey</a>

            <p>Take care,<br>Your AI Therapy Team</p>
        </div>
    </div>
</body>
</html>
`;

export const getReminderEmailTemplate = (name: string) => `
<!DOCTYPE html>
<html>
<head>
    <style>
        body {
            font-family: 'Arial', sans-serif;
            line-height: 1.6;
            color: #333;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8f9fa;
        }
        .header {
            text-align: center;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border-radius: 10px 10px 0 0;
        }
        .content {
            background: white;
            padding: 30px;
            border-radius: 0 0 10px 10px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .quote {
            font-style: italic;
            color: #666;
            border-left: 4px solid #764ba2;
            padding-left: 15px;
            margin: 20px 0;
        }
        .image {
            width: 100%;
            max-width: 400px;
            margin: 20px auto;
            display: block;
            border-radius: 8px;
        }
        .button {
            display: inline-block;
            padding: 12px 24px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-decoration: none;
            border-radius: 25px;
            margin: 20px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Time for Your Mental Health Check-in</h1>
        </div>
        <div class="content">
            <h2>Hi ${name},</h2>
            
            <p>We noticed it's been a while since your last session. Taking care of your mental health is important!</p>

            <img src="https://images.unsplash.com/photo-1506126613408-eca07ce68773" alt="Peaceful nature" class="image">

            <div class="quote">
                "Self-care is not self-indulgence, it is self-preservation." - Audre Lorde
            </div>

            <p>Take a moment today to:</p>
            <ul>
                <li>Practice mindful breathing</li>
                <li>Share your thoughts with our AI companion</li>
                <li>Reflect on your progress</li>
                <li>Set new wellness goals</li>
            </ul>

            <a href="${process.env.NEXTAUTH_URL}" class="button">Start a Session</a>

            <p>Be well,<br>Your AI Therapy Team</p>
        </div>
    </div>
</body>
</html>
`;
