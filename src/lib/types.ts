
export interface Question {
  id: string;
  questionText: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
}

export interface Quiz {
  id: string;
  title: string;
  description?: string;
  welcomeQuote?: string;
  timerMinutes: number | null;
  questions: Question[];
  createdAt: number;
  creatorId?: string; // For future multi-educator support
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  studentName: string;
  studentEmail?: string;
  score: number;
  totalQuestions: number;
  timestamp: number;
  answers: Record<string, string>; // questionId -> selectedOption
}

export interface StudentProfile {
  id: string; // Linked to student identification (e.g., email or browser-id)
  name: string;
  email?: string;
  lastAttemptAt: number;
}
