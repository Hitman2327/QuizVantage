
'use server';
/**
 * @fileOverview Server Actions for Database Operations
 * Bypasses client-side network blocks by performing Firestore operations on the server.
 */

import { db } from './db';
import { Quiz, QuizAttempt } from './types';

export async function checkDatabaseHealth() {
  try {
    // Attempt a lightweight read
    await db.getQuizzes();
    return { success: true, message: 'Cloud Database Connected' };
  } catch (err: any) {
    console.error("Health Check Error:", err);
    return { 
      success: false, 
      message: err.message || 'Could not connect to Cloud Database.' 
    };
  }
}

export async function getQuizzesAction() {
  try {
    return await db.getQuizzes();
  } catch (e) {
    return [];
  }
}

export async function getQuizAction(id: string) {
  try {
    return await db.getQuiz(id);
  } catch (e) {
    return null;
  }
}

export async function saveQuizAction(quiz: Quiz) {
  try {
    return await db.saveQuiz(quiz);
  } catch (e: any) {
    throw new Error(e.message || "Failed to save quiz");
  }
}

export async function deleteQuizAction(id: string) {
  try {
    return await db.deleteQuiz(id);
  } catch (e: any) {
    throw new Error(e.message || "Failed to delete quiz");
  }
}

export async function saveAttemptAction(attempt: QuizAttempt) {
  try {
    return await db.saveAttempt(attempt);
  } catch (e: any) {
    throw new Error(e.message || "Failed to save attempt");
  }
}

export async function getAttemptsAction() {
  try {
    return await db.getAttempts();
  } catch (e) {
    return [];
  }
}

export async function getAttemptsForStudentAction(name: string) {
  try {
    return await db.getAttemptsForStudent(name);
  } catch (e) {
    return [];
  }
}

export async function checkExistingAttemptAction(quizId: string, studentName: string) {
  try {
    return await db.getAttemptForStudentInQuiz(quizId, studentName);
  } catch (e) {
    return null;
  }
}
