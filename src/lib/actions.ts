
'use server';
/**
 * @fileOverview Server Actions for Database Operations
 * Returns plain objects to ensure compatibility with Next.js client-server boundary.
 */

import { db } from './db';
import { Quiz, QuizAttempt } from './types';

export async function checkDatabaseHealth() {
  try {
    const quizzes = await db.getQuizzes();
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
    const data = await db.getQuizzes();
    return JSON.parse(JSON.stringify(data));
  } catch (e) {
    return [];
  }
}

export async function getQuizAction(id: string) {
  try {
    const data = await db.getQuiz(id);
    return data ? JSON.parse(JSON.stringify(data)) : null;
  } catch (e) {
    return null;
  }
}

export async function saveQuizAction(quiz: Quiz) {
  try {
    await db.saveQuiz(quiz);
    return { success: true };
  } catch (e: any) {
    console.error("Save Quiz Action Error:", e);
    throw new Error(e.message || "Failed to save quiz to cloud.");
  }
}

export async function deleteQuizAction(id: string) {
  try {
    await db.deleteQuiz(id);
    return { success: true };
  } catch (e: any) {
    throw new Error(e.message || "Failed to delete quiz.");
  }
}

export async function saveAttemptAction(attempt: QuizAttempt) {
  try {
    await db.saveAttempt(attempt);
    return { success: true };
  } catch (e: any) {
    throw new Error(e.message || "Failed to save attempt.");
  }
}

export async function getAttemptsAction() {
  try {
    const data = await db.getAttempts();
    return JSON.parse(JSON.stringify(data));
  } catch (e) {
    return [];
  }
}

export async function getAttemptsForStudentAction(name: string) {
  try {
    const data = await db.getAttemptsForStudent(name);
    return JSON.parse(JSON.stringify(data));
  } catch (e) {
    return [];
  }
}

export async function checkExistingAttemptAction(quizId: string, studentName: string) {
  try {
    const data = await db.getAttemptForStudentInQuiz(quizId, studentName);
    return data ? JSON.parse(JSON.stringify(data)) : null;
  } catch (e) {
    return null;
  }
}
