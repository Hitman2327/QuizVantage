
import { initializeApp, getApps, getApp } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  addDoc
} from "firebase/firestore";
import { Quiz, QuizAttempt } from './types';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

function getDb() {
  // Ensure we don't initialize multiple times
  const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  return getFirestore(app);
}

const QUIZZES_COL = 'quizzes';
const ATTEMPTS_COL = 'attempts';

export const db = {
  getQuizzes: async (): Promise<Quiz[]> => {
    try {
      const firestore = getDb();
      const q = query(collection(firestore, QUIZZES_COL), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Quiz));
    } catch (e) {
      console.error("Firestore getQuizzes error:", e);
      throw e;
    }
  },

  getQuiz: async (id: string): Promise<Quiz | null> => {
    const firestore = getDb();
    const docRef = doc(firestore, QUIZZES_COL, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { ...docSnap.data(), id: docSnap.id } as Quiz;
    }
    return null;
  },

  saveQuiz: async (quiz: Quiz) => {
    const firestore = getDb();
    const { id, ...data } = quiz;
    await setDoc(doc(firestore, QUIZZES_COL, id), data);
    return { success: true };
  },

  deleteQuiz: async (id: string) => {
    const firestore = getDb();
    await deleteDoc(doc(firestore, QUIZZES_COL, id));
    return { success: true };
  },

  saveAttempt: async (attempt: QuizAttempt) => {
    const firestore = getDb();
    await addDoc(collection(firestore, ATTEMPTS_COL), attempt);
    return { success: true };
  },

  getAttempts: async (): Promise<QuizAttempt[]> => {
    const firestore = getDb();
    const q = query(collection(firestore, ATTEMPTS_COL), orderBy("timestamp", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as QuizAttempt));
  },

  getAttemptsForStudent: async (studentName: string): Promise<QuizAttempt[]> => {
    const firestore = getDb();
    const q = query(
      collection(firestore, ATTEMPTS_COL),
      where("studentName", "==", studentName),
      orderBy("timestamp", "desc")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as QuizAttempt));
  },

  getAttemptForStudentInQuiz: async (quizId: string, studentName: string): Promise<QuizAttempt | null> => {
    const firestore = getDb();
    const q = query(
      collection(firestore, ATTEMPTS_COL),
      where("quizId", "==", quizId),
      where("studentName", "==", studentName)
    );
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    const doc = snapshot.docs[0];
    return { ...doc.data(), id: doc.id } as QuizAttempt;
  }
};
