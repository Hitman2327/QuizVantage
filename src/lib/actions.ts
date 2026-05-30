
'use server';
/**
 * @fileOverview Server Actions for Database Operations
 * Returns plain objects to ensure compatibility with Next.js client-server boundary.
 * Includes timeout protection for cloud operations.
 */

import { db } from './db';
import { Quiz, QuizAttempt } from './types';

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
    const quizzes = await withTimeout(db.getQuizzes(), "Database health check timed out.");
    return { success: true, message: 'Cloud Database Connected' };
  } catch (err: any) {
    console.error("Health Check Error:", err);
    return { 
      success: false, 
      message: err.message || 'Could not connect to Firestore. Check Firebase Console Setup.' 
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

export async function saveQuizAction(quiz: Quiz) {
  try {
    console.log("Saving quiz via server action...");
    await withTimeout(db.saveQuiz(quiz), "Save operation timed out. Check your Firestore setup.");
    return { success: true };
  } catch (e: any) {
    console.error("Save Quiz Action Error:", e);
    throw new Error(e.message || "Failed to save quiz to cloud.");
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
