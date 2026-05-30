import { Quiz, QuizAttempt } from './types';

const QUIZZES_KEY = 'quizvantage_quizzes';
const ATTEMPTS_KEY = 'quizvantage_attempts';

export const db = {
  getQuizzes: (): Quiz[] => {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(QUIZZES_KEY);
    return data ? JSON.parse(data) : [];
  },

  getQuiz: (id: string): Quiz | undefined => {
    return db.getQuizzes().find(q => q.id === id);
  },

  saveQuiz: (quiz: Quiz) => {
    const quizzes = db.getQuizzes();
    const index = quizzes.findIndex(q => q.id === quiz.id);
    if (index >= 0) {
      quizzes[index] = quiz;
    } else {
      quizzes.push(quiz);
    }
    localStorage.setItem(QUIZZES_KEY, JSON.stringify(quizzes));
  },

  deleteQuiz: (id: string) => {
    const quizzes = db.getQuizzes().filter(q => q.id !== id);
    localStorage.setItem(QUIZZES_KEY, JSON.stringify(quizzes));
  },

  saveAttempt: (attempt: QuizAttempt) => {
    const attempts = db.getAttempts();
    attempts.push(attempt);
    localStorage.setItem(ATTEMPTS_KEY, JSON.stringify(attempts));
  },

  getAttempts: (): QuizAttempt[] => {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(ATTEMPTS_KEY);
    return data ? JSON.parse(data) : [];
  },

  getAttemptsForQuiz: (quizId: string): QuizAttempt[] => {
    return db.getAttempts().filter(a => a.quizId === quizId);
  },

  getAttemptForStudent: (quizId: string, studentName: string): QuizAttempt | undefined => {
    return db.getAttempts().find(a => a.quizId === quizId && a.studentName.toLowerCase() === studentName.toLowerCase());
  }
};
