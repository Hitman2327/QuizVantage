
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

console.log("Initializing Firebase with project:", firebaseConfig.projectId);

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const firestore = getFirestore(app);

const QUIZZES_COL = 'quizzes';
const ATTEMPTS_COL = 'attempts';

export const db = {
  // --- Quizzes ---
  getQuizzes: async (): Promise<Quiz[]> => {
    try {
      const q = query(collection(firestore, QUIZZES_COL), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Quiz));
    } catch (error) {
      console.error("Firestore getQuizzes error:", error);
      throw error;
    }
  },

  getQuiz: async (id: string): Promise<Quiz | null> => {
    try {
      const docRef = doc(firestore, QUIZZES_COL, id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Quiz;
      }
      return null;
    } catch (error) {
      console.error("Firestore getQuiz error:", error);
      throw error;
    }
  },

  saveQuiz: async (quiz: Quiz) => {
    try {
      console.log("Attempting to save quiz to cloud...", quiz.id);
      const { id, ...data } = quiz;
      await setDoc(doc(firestore, QUIZZES_COL, id), data);
      console.log("Quiz saved successfully.");
    } catch (error) {
      console.error("Firestore saveQuiz error:", error);
      throw error;
    }
  },

  deleteQuiz: async (id: string) => {
    try {
      await deleteDoc(doc(firestore, QUIZZES_COL, id));
    } catch (error) {
      console.error("Firestore deleteQuiz error:", error);
      throw error;
    }
  },

  // --- Attempts ---
  saveAttempt: async (attempt: QuizAttempt) => {
    try {
      console.log("Saving attempt to cloud...");
      await addDoc(collection(firestore, ATTEMPTS_COL), attempt);
      console.log("Attempt saved successfully.");
    } catch (error) {
      console.error("Firestore saveAttempt error:", error);
      throw error;
    }
  },

  getAttempts: async (): Promise<QuizAttempt[]> => {
    try {
      const q = query(collection(firestore, ATTEMPTS_COL), orderBy("timestamp", "desc"));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as QuizAttempt));
    } catch (error) {
      console.error("Firestore getAttempts error:", error);
      throw error;
    }
  },

  getAttemptsForQuiz: async (quizId: string): Promise<QuizAttempt[]> => {
    try {
      const q = query(
        collection(firestore, ATTEMPTS_COL), 
        where("quizId", "==", quizId),
        orderBy("timestamp", "desc")
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as QuizAttempt));
    } catch (error) {
      console.error("Firestore getAttemptsForQuiz error:", error);
      throw error;
    }
  },

  getAttemptsForStudent: async (studentName: string): Promise<QuizAttempt[]> => {
    try {
      const q = query(
        collection(firestore, ATTEMPTS_COL),
        where("studentName", "==", studentName),
        orderBy("timestamp", "desc")
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as QuizAttempt));
    } catch (error) {
      console.error("Firestore getAttemptsForStudent error:", error);
      throw error;
    }
  },

  getAttemptForStudentInQuiz: async (quizId: string, studentName: string): Promise<QuizAttempt | null> => {
    try {
      const q = query(
        collection(firestore, ATTEMPTS_COL),
        where("quizId", "==", quizId),
        where("studentName", "==", studentName)
      );
      const snapshot = await getDocs(q);
      if (snapshot.empty) return null;
      return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as QuizAttempt;
    } catch (error) {
      console.error("Firestore getAttemptForStudentInQuiz error:", error);
      throw error;
    }
  }
};
