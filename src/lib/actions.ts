
'use server';
/**
 * @fileOverview Server Actions for Database Operations (RTDB)
 * Returns plain objects to ensure compatibility with Next.js client-server boundary.
 * Includes timeout protection for cloud operations.
 */

import { db } from './db';
import { Quiz, QuizAttempt, Question } from './types';

const TIMEOUT_MS = 15000; // 15 seconds

async function withTimeout<T>(promise: Promise<T>, message: string): Promise<T> {
  let timeoutId: NodeJS.Timeout;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error(message)), TIMEOUT_MS);
  });
  return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timeoutId));
}

export async function checkDatabaseHealth() {
  try {
    // Ping RTDB
    await withTimeout(db.getQuizzes(), "Realtime Database health check timed out.");
    return { success: true, message: 'Cloud RTDB Connected' };
  } catch (err: any) {
    console.error("Health Check Error:", err);
    return { 
      success: false, 
      message: err.message || 'Could not connect to Realtime Database. Check your rules and config.' 
    };
  }
}

export async function getQuizzesAction() {
  try {
    const data = await withTimeout(db.getQuizzes(), "Fetch quizzes timed out.");
    return JSON.parse(JSON.stringify(data));
  } catch (e) {
    console.error("getQuizzesAction error:", e);
    return [];
  }
}

export async function getQuizAction(id: string) {
  try {
    const data = await withTimeout(db.getQuiz(id), "Fetch quiz timed out.");
    return data ? JSON.parse(JSON.stringify(data)) : null;
  } catch (e) {
    console.error("getQuizAction error:", e);
    return null;
  }
}

export async function saveQuizAction(quiz: Omit<Quiz, 'id' | 'createdAt'>) {
  try {
    console.log("Saving quiz via RTDB server action...");
    
    const newQuiz: Quiz = {
      ...quiz,
      id: `quiz-${Date.now()}`,
      createdAt: Date.now(),
    };

    await withTimeout(db.saveQuiz(newQuiz), "Save operation timed out. Verify your RTDB setup.");
    return { success: true, quizId: newQuiz.id };
  } catch (e: any) {
    console.error("Save Quiz Action Error:", e);
    throw new Error(e.message || "Failed to save quiz to cloud.");
  }
}

export async function saveQuizFromJSONAction(title: string, description: string, jsonContent: string, timerMinutes: number | null) {
  try {
    console.log("Saving quiz from JSON upload...");
    const parsedQuestions = JSON.parse(jsonContent) as Omit<Question, 'id'>[];

    // Basic validation
    if (!Array.isArray(parsedQuestions) || parsedQuestions.length === 0) {
      throw new Error("Invalid JSON format or empty question array.");
    }

    const questions: Question[] = parsedQuestions.map((q, i) => ({
        ...q,
        id: `q-${Date.now()}-${i}`
    }));

    const newQuiz: Quiz = {
      id: `quiz-${Date.now()}`,
      title,
      description,
      questions,
      createdAt: Date.now(),
      timerMinutes: timerMinutes,
      welcomeQuote: "Good Luck",
    };

    await withTimeout(db.saveQuiz(newQuiz), "Save operation from JSON timed out.");
    return { success: true, quizId: newQuiz.id };
  } catch (e: any) {
    console.error("Save Quiz from JSON Action Error:", e);
    throw new Error(e.message || "Failed to save quiz from JSON.");
  }
}

export async function deleteQuizAction(id: string) {
  try {
    await withTimeout(db.deleteQuiz(id), "Delete operation timed out.");
    return { success: true };
  } catch (e: any) {
    throw new Error(e.message || "Failed to delete quiz.");
  }
}

export async function saveAttemptAction(attempt: QuizAttempt) {
  try {
    await withTimeout(db.saveAttempt(attempt), "Save attempt timed out.");
    return { success: true };
  } catch (e: any) {
    throw new Error(e.message || "Failed to save attempt.");
  }
}

export async function getAttemptsAction() {
  try {
    const data = await withTimeout(db.getAttempts(), "Fetch attempts timed out.");
    return JSON.parse(JSON.stringify(data));
  } catch (e) {
    return [];
  }
}

export async function getAttemptsForStudentAction(name: string) {
  try {
    const data = await withTimeout(db.getAttemptsForStudent(name), "Fetch student records timed out.");
    return JSON.parse(JSON.stringify(data));
  } catch (e) {
    return [];
  }
}

export async function checkExistingAttemptAction(quizId: string, studentName: string) {
  try {
    const data = await withTimeout(db.getAttemptForStudentInQuiz(quizId, studentName), "Check existing attempt timed out.");
    return data ? JSON.parse(JSON.stringify(data)) : null;
  } catch (e) {
    return null;
  }
}
