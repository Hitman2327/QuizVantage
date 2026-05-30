
import { initializeApp, getApps } from "firebase/app";
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

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const firestore = getFirestore(app);

const QUIZZES_COL = 'quizzes';
const ATTEMPTS_COL = 'attempts';

export const db = {
  // --- Quizzes ---
  getQuizzes: async (): Promise<Quiz[]> => {
    const q = query(collection(firestore, QUIZZES_COL), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Quiz));
  },

  getQuiz: async (id: string): Promise<Quiz | null> => {
    const docRef = doc(firestore, QUIZZES_COL, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Quiz;
    }
    return null;
  },

  saveQuiz: async (quiz: Quiz) => {
    const { id, ...data } = quiz;
    await setDoc(doc(firestore, QUIZZES_COL, id), data);
  },

  deleteQuiz: async (id: string) => {
    await deleteDoc(doc(firestore, QUIZZES_COL, id));
    // Optionally delete associated attempts
  },

  // --- Attempts ---
  saveAttempt: async (attempt: QuizAttempt) => {
    await addDoc(collection(firestore, ATTEMPTS_COL), attempt);
  },

  getAttempts: async (): Promise<QuizAttempt[]> => {
    const q = query(collection(firestore, ATTEMPTS_COL), orderBy("timestamp", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as QuizAttempt));
  },

  getAttemptsForQuiz: async (quizId: string): Promise<QuizAttempt[]> => {
    const q = query(
      collection(firestore, ATTEMPTS_COL), 
      where("quizId", "==", quizId),
      orderBy("timestamp", "desc")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as QuizAttempt));
  },

  getAttemptsForStudent: async (studentName: string): Promise<QuizAttempt[]> => {
    const q = query(
      collection(firestore, ATTEMPTS_COL),
      where("studentName", "==", studentName),
      orderBy("timestamp", "desc")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as QuizAttempt));
  },

  getAttemptForStudentInQuiz: async (quizId: string, studentName: string): Promise<QuizAttempt | null> => {
    const q = query(
      collection(firestore, ATTEMPTS_COL),
      where("quizId", "==", quizId),
      where("studentName", "==", studentName)
    );
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as QuizAttempt;
  }
};
