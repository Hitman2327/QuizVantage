
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

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  databaseURL: `https://${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}.firebaseio.com`
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
      throw e;
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
    const { id, ...data } = quiz;
    console.log(`Syncing quiz to RTDB: ${id}`);
    try {
      await set(ref(rtdb, `quizzes/${id}`), {
        ...data,
        createdAt: data.createdAt || Date.now()
      });
      return { success: true };
    } catch (err: any) {
      console.error("RTDB set error:", err);
      throw err;
    }
  },

  deleteQuiz: async (id: string) => {
    const rtdb = getRtdb();
    await remove(ref(rtdb, `quizzes/${id}`));
    return { success: true };
  },

  saveAttempt: async (attempt: QuizAttempt) => {
    const rtdb = getRtdb();
    const attemptId = `att-${Date.now()}`;
    await set(ref(rtdb, `attempts/${attemptId}`), attempt);
    return { success: true };
  },

  getAttempts: async (): Promise<QuizAttempt[]> => {
    const rtdb = getRtdb();
    const snapshot = await get(ref(rtdb, 'attempts'));
    if (snapshot.exists()) {
      const data = snapshot.val();
      return Object.keys(data).map(key => ({ ...data[key], id: key }));
    }
    return [];
  },

  getAttemptsForStudent: async (studentName: string): Promise<QuizAttempt[]> => {
    const rtdb = getRtdb();
    // In RTDB, complex queries are restricted without specific indices.
    // For this prototype, we'll fetch and filter to ensure it works immediately.
    const snapshot = await get(ref(rtdb, 'attempts'));
    if (snapshot.exists()) {
      const data = snapshot.val();
      return Object.keys(data)
        .map(key => ({ ...data[key], id: key }))
        .filter((a: QuizAttempt) => a.studentName === studentName);
    }
    return [];
  },

  getAttemptForStudentInQuiz: async (quizId: string, studentName: string): Promise<QuizAttempt | null> => {
    const rtdb = getRtdb();
    const snapshot = await get(ref(rtdb, 'attempts'));
    if (snapshot.exists()) {
      const data = snapshot.val();
      const match = Object.keys(data)
        .map(key => ({ ...data[key], id: key }))
        .find((a: QuizAttempt) => a.quizId === quizId && a.studentName === studentName);
      return match || null;
    }
    return null;
  }
};
