import { Quiz, QuizAttempt } from './types';

const QUIZZES_KEY = 'quizvantage_quizzes';
const ATTEMPTS_KEY = 'quizvantage_attempts';

export const db = {
  getQuizzes: (): Quiz[] => {
    if (typeof window === 'undefined') return [];
    try {
      const data = localStorage.getItem(QUIZZES_KEY);
      if (!data) return [];
      const quizzes = JSON.parse(data);
      return Array.isArray(quizzes) ? quizzes : [];
    } catch (error) {
      console.error("[DB] Failed to parse quizzes from localStorage", error);
      return [];
    }
  },

  getQuiz: (id: string): Quiz | undefined => {
    if (!id) return undefined;
    const quizzes = db.getQuizzes();
    // Use a case-insensitive and trimmed comparison for maximum reliability
    const found = quizzes.find(q => q.id.trim() === id.trim());
    return found;
  },

  saveQuiz: (quiz: Quiz) => {
    if (typeof window === 'undefined') return;
    try {
      const quizzes = db.getQuizzes();
      const index = quizzes.findIndex(q => q.id === quiz.id);
      if (index >= 0) {
        quizzes[index] = quiz;
      } else {
        quizzes.push(quiz);
      }
      localStorage.setItem(QUIZZES_KEY, JSON.stringify(quizzes));
    } catch (error) {
      console.error("[DB] Failed to save quiz to localStorage", error);
    }
  },

  deleteQuiz: (id: string) => {
    if (typeof window === 'undefined') return;
    try {
      const quizzes = db.getQuizzes().filter(q => q.id !== id);
      localStorage.setItem(QUIZZES_KEY, JSON.stringify(quizzes));
    } catch (error) {
      console.error("[DB] Failed to delete quiz from localStorage", error);
    }
  },

  saveAttempt: (attempt: QuizAttempt) => {
    if (typeof window === 'undefined') return;
    try {
      const attempts = db.getAttempts();
      attempts.push(attempt);
      localStorage.setItem(ATTEMPTS_KEY, JSON.stringify(attempts));
    } catch (error) {
      console.error("[DB] Failed to save attempt to localStorage", error);
    }
  },

  getAttempts: (): QuizAttempt[] => {
    if (typeof window === 'undefined') return [];
    try {
      const data = localStorage.getItem(ATTEMPTS_KEY);
      if (!data) return [];
      const attempts = JSON.parse(data);
      return Array.isArray(attempts) ? attempts : [];
    } catch (error) {
      console.error("[DB] Failed to parse attempts from localStorage", error);
      return [];
    }
  },

  getAttemptsForQuiz: (quizId: string): QuizAttempt[] => {
    return db.getAttempts().filter(a => a.quizId === quizId);
  },

  getAttemptForStudent: (quizId: string, studentName: string): QuizAttempt | undefined => {
    return db.getAttempts().find(a => 
      a.quizId === quizId && 
      a.studentName.toLowerCase().trim() === studentName.toLowerCase().trim()
    );
  }
};
