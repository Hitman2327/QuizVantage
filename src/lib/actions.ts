
'use server';
/**
 * @fileOverview Server Actions for Database Operations
 * Bypasses client-side network blocks by performing Firestore operations on the server.
 */

import { db } from './db';
import { Quiz, QuizAttempt } from './types';

export async function checkDatabaseHealth() {
  try {
    const firestore = (db as any).getDb ? (db as any).getDb() : null;
    if (!firestore) return { success: false, message: 'Database initialization failed.' };
    
    // Attempt a lightweight read to verify connection
    await db.getQuizzes();
    return { success: true, message: 'Cloud Database Connected' };
  } catch (err: any) {
    return { success: false, message: err.message || 'Could not connect to Cloud Database.' };
  }
}

export async function getQuizzesAction() {
  return await db.getQuizzes();
}

export async function getQuizAction(id: string) {
  return await db.getQuiz(id);
}

export async function saveQuizAction(quiz: Quiz) {
  return await db.saveQuiz(quiz);
}

export async function deleteQuizAction(id: string) {
  return await db.deleteQuiz(id);
}

export async function saveAttemptAction(attempt: QuizAttempt) {
  return await db.saveAttempt(attempt);
}

export async function getAttemptsAction() {
  return await db.getAttempts();
}

export async function getAttemptsForStudentAction(name: string) {
  return await db.getAttemptsForStudent(name);
}

export async function checkExistingAttemptAction(quizId: string, studentName: string) {
  return await db.getAttemptForStudentInQuiz(quizId, studentName);
}
