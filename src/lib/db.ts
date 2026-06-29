
import { initializeApp, getApps, getApp } from "firebase/app";
import { 
  getDatabase, 
  ref, 
  set, 
  get, 
  remove, 
  child,
  query,
  orderByChild,
  equalTo
} from "firebase/database";
import { Quiz, QuizAttempt } from './types';

// Hardcoded URL is correct for this project as confirmed by user's console
const DATABASE_URL = "https://studio-4519492786-48ff8-default-rtdb.asia-southeast1.firebasedatabase.app";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  databaseURL: DATABASE_URL // Use the correct hardcoded URL
};

function getRtdb() {
  if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
    console.error("FIREBASE CONFIG MISSING. Check .env file.");
  }
  const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  return getDatabase(app);
}

export const db = {
  getQuizzes: async (): Promise<Quiz[]> => {
    try {
      const rtdb = getRtdb();
      const snapshot = await get(ref(rtdb, 'quizzes'));
      if (snapshot.exists()) {
        const data = snapshot.val();
        return Object.keys(data).map(key => ({ ...data[key], id: key }));
      }
      return [];
    } catch (e) {
      console.error("RTDB getQuizzes error:", e);
      throw e; // Re-throw to be caught by server action
    }
  },

  getQuiz: async (id: string): Promise<Quiz | null> => {
    const rtdb = getRtdb();
    const snapshot = await get(ref(rtdb, `quizzes/${id}`));
    if (snapshot.exists()) {
      return { ...snapshot.val(), id } as Quiz;
    }
    return null;
  },

  saveQuiz: async (quiz: Quiz) => {
    const rtdb = getRtdb();
    return set(ref(rtdb, `quizzes/${quiz.id}`), quiz);
  },

  deleteQuiz: async (id: string) => {
    const rtdb = getRtdb();
    return remove(ref(rtdb, `quizzes/${id}`));
  },

  saveAttempt: async (attempt: QuizAttempt) => {
    const rtdb = getRtdb();
    return set(ref(rtdb, `attempts/${attempt.id}`), attempt);
  },

  getAttempts: async (): Promise<QuizAttempt[]> => {
    const rtdb = getRtdb();
    const snapshot = await get(ref(rtdb, 'attempts'));
    if (snapshot.exists()) {
      const data = snapshot.val();
      // Sort results by timestamp descending
      return Object.keys(data)
        .map(key => ({ ...data[key], id: key }))
        .sort((a, b) => b.timestamp - a.timestamp);
    }
    return [];
  },

  getAttemptsForStudent: async (name: string): Promise<QuizAttempt[]> => {
    const rtdb = getRtdb();
    const attemptsRef = ref(rtdb, 'attempts');
    const studentQuery = query(attemptsRef, orderByChild('studentName'), equalTo(name));
    const snapshot = await get(studentQuery);
    if (snapshot.exists()) {
      const data = snapshot.val();
      return Object.keys(data).map(key => ({ ...data[key], id: key }));
    }
    return [];
  },
  
  getAttemptForStudentInQuiz: async (quizId: string, studentName: string): Promise<QuizAttempt | null> => {
    const rtdb = getRtdb();
    const attemptsRef = ref(rtdb, 'attempts');
    const studentQuery = query(attemptsRef, orderByChild('studentName'), equalTo(studentName));
    const snapshot = await get(studentQuery);

    if (snapshot.exists()) {
      const attempts = snapshot.val();
      const relevantAttempt = Object.values(attempts as Record<string, QuizAttempt>).find(att => att.quizId === quizId);
      return relevantAttempt || null;
    }
    return null;
  }
};