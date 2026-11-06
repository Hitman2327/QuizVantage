# QuizVantage Cloud

An AI-powered assessment platform for educators and students, featuring real-time cloud synchronization and automated question extraction.

## Features
- **AI Extraction**: Convert documents (PDF/Text) into multiple-choice quizzes instantly using Google Genkit.
- **Real-time Sync**: Uses Firebase Realtime Database (asia-southeast1) for global quiz sharing and result tracking.
- **Student Portal**: Students can take quizzes, view detailed explanations, and track their performance history.
- **Robust Scoring**: Smart normalization handles MCQ prefixes and formatting differences automatically.

## Local Development
1. Clone the repository.
2. Install dependencies: `npm install`.
3. Set up your `.env` file with Firebase keys.
4. Run the dev server: `npm run dev`.

## Deployment
This app is optimized for **Firebase App Hosting** or **Vercel**.
1. Push your code to a GitHub repository.
2. Connect the repository to Firebase App Hosting in the Firebase Console.
3. Ensure your environment variables are configured in the deployment settings.

## Database Rules
Ensure your Firebase Realtime Database rules allow read/write access:
```json
{
  "rules": {
    ".read": "true",
    ".write": "true"
  }
}
```
*Note: In production, refine these rules to secure your data.*