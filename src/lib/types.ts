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
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  studentName: string;
  score: number;
  totalQuestions: number;
  timestamp: number;
  answers: Record<string, string>; // questionId -> selectedOption
}
