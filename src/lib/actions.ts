
'use server';
/**
 * @fileOverview Server Actions for Database Operations
 * Bypasses client-side network blocks by performing Firestore operations on the server.
 */

import { db } from './db';
import { Quiz, QuizAttempt } from './types';

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
