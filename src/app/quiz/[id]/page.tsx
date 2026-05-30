
"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getQuizAction, saveAttemptAction, checkExistingAttemptAction } from '@/lib/actions';
import { Quiz, QuizAttempt } from '@/lib/types';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Clock, Quote, ChevronRight, ChevronLeft, Send, AlertTriangle, User, Loader2, BookOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export default function StudentQuiz() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const { toast } = useToast();

  const [mounted, setMounted] = useState(false);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<'gate' | 'test' | 'result'>('gate');
  const [studentName, setStudentName] = useState('');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [existingAttempt, setExistingAttempt] = useState<QuizAttempt | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !id) return;
    async function loadQuiz() {
      try {
        const loadedQuiz = await getQuizAction(id);
        if (loadedQuiz) {
          setQuiz(loadedQuiz);
        } else {
          toast({ title: "Not Found", description: "Assessment no longer available.", variant: "destructive" });
        }
      } catch (err) {
        toast({ title: "Server Error", description: "Could not fetch quiz data from server.", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    }
    loadQuiz();
  }, [id, mounted, toast]);

  const handleStart = async () => {
    if (!studentName.trim()) {
      toast({ title: "Name required" });
      return;
    }

    setLoading(true);
    try {
      const attempt = await checkExistingAttemptAction(id, studentName);
      if (attempt) {
        setExistingAttempt(attempt);
        setStep('result');
        toast({ title: "Results Loaded", description: "Showing your previous submission." });
      } else {
        setStep('test');
        if (quiz?.timerMinutes) setTimeLeft(quiz.timerMinutes * 60);
      }
    } catch (err) {
      toast({ title: "Error", description: "Could not verify existing attempts on server." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (step !== 'test' || timeLeft === null) return;
    if (timeLeft <= 0) {
      handleSubmit();
      return;
    }
    const timer = setInterval(() => setTimeLeft(p => p !== null ? p - 1 : null), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, step]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const currentQuestion = quiz?.questions[currentQuestionIndex];
  const progress = quiz ? Math.round(((currentQuestionIndex + 1) / quiz.questions.length) * 100) : 0;

  const handleSubmit = async () => {
    if (!quiz || !studentName) return;

    const score = quiz.questions.reduce((acc, q) => answers[q.id] === q.correctAnswer ? acc + 1 : acc, 0);
    const attempt: QuizAttempt = {
      id: `att-${Date.now()}`,
      quizId: quiz.id,
      studentName,
      score,
      totalQuestions: quiz.questions.length,
      timestamp: Date.now(),
      answers,
    };

    try {
      await saveAttemptAction(attempt);
      setExistingAttempt(attempt);
      setStep('result');
      toast({ title: "Submitted successfully!" });
    } catch (err) {
      toast({ title: "Submission Error", description: "Could not save attempt to server.", variant: "destructive" });
    }
  };

  if (!mounted || loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-background">
        <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
        <p className="text-muted-foreground">Synchronizing with Server...</p>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
        <AlertTriangle className="w-16 h-16 text-destructive mb-4" />
        <h1 className="text-2xl font-bold">Quiz Not Found</h1>
        <Button onClick={() => router.push('/')} className="mt-4 rounded-full">Home</Button>
      </div>
    );
  }

  if (step === 'gate') {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-lg shadow-xl">
          <CardHeader className="text-center pt-10">
            {quiz.welcomeQuote && <p className="italic text-muted-foreground mb-4">"{quiz.welcomeQuote}"</p>}
            <CardTitle className="text-3xl font-headline text-primary">{quiz.title}</CardTitle>
            <CardDescription>{quiz.description || 'Welcome to the assessment portal.'}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4 py-4 border-y">
              <div className="text-center">
                <div className="text-2xl font-bold">{quiz.questions.length}</div>
                <div className="text-xs uppercase text-muted-foreground">Questions</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{quiz.timerMinutes ? `${quiz.timerMinutes}m` : '∞'}</div>
                <div className="text-xs uppercase text-muted-foreground">Time Limit</div>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Your Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  className="pl-10" 
                  value={studentName} 
                  onChange={e => setStudentName(e.target.value)} 
                  placeholder="John Doe"
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="p-8">
            <Button onClick={handleStart} className="w-full rounded-full h-12 text-lg">Start Assessment</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (step === 'test' && currentQuestion) {
    return (
      <div className="flex flex-col items-center min-h-screen p-4 md:p-8">
        <div className="w-full max-w-4xl space-y-6">
          <div className="flex justify-between items-center bg-white p-4 rounded-xl border shadow-sm">
            <div className="flex items-center gap-4">
              <span className="text-sm font-bold">Q {currentQuestionIndex + 1} / {quiz.questions.length}</span>
              <Progress value={progress} className="h-2 w-32" />
            </div>
            {timeLeft !== null && (
              <div className={cn("px-4 py-2 rounded-full font-mono font-bold", timeLeft < 60 ? "bg-red-100 text-red-600 animate-pulse" : "bg-secondary")}>
                <Clock className="w-4 h-4 inline mr-2" /> {formatTime(timeLeft)}
              </div>
            )}
          </div>

          <Card className="border-border shadow-lg">
            <CardHeader className="p-8"><h2 className="text-2xl font-semibold">{currentQuestion.questionText}</h2></CardHeader>
            <CardContent className="p-8 pt-0 space-y-3">
              {currentQuestion.options.map((option, idx) => {
                const isSelected = answers[currentQuestion.id] === option;
                return (
                  <button
                    key={idx}
                    onClick={() => setAnswers({ ...answers, [currentQuestion.id]: option })}
                    className={cn("w-full flex items-center p-5 rounded-xl border-2 text-left transition-all", isSelected ? "bg-secondary border-primary" : "bg-white hover:border-primary/50")}
                  >
                    <span className={cn("w-10 h-10 rounded-lg flex items-center justify-center mr-4 shrink-0 font-bold", isSelected ? "bg-primary text-white" : "bg-muted")}>
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span className="text-lg">{option}</span>
                  </button>
                );
              })}
            </CardContent>
            <CardFooter className="flex justify-between p-8 bg-muted/10 border-t">
              <Button variant="outline" disabled={currentQuestionIndex === 0} onClick={() => setCurrentQuestionIndex(p => p - 1)} className="rounded-full">Previous</Button>
              {currentQuestionIndex === quiz.questions.length - 1 ? (
                <Button onClick={handleSubmit} className="bg-accent rounded-full px-8">Submit Final Answers</Button>
              ) : (
                <Button onClick={() => setCurrentQuestionIndex(p => p + 1)} disabled={!answers[currentQuestion.id]} className="rounded-full px-8">Next</Button>
              )}
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  }

  if (step === 'result' && existingAttempt) {
    const percentage = Math.round((existingAttempt.score / existingAttempt.totalQuestions) * 100);
    return (
      <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-8">
        <Card className="shadow-xl">
          <CardHeader className="text-center py-10">
            <CardTitle className="text-3xl font-bold">Assessment Report</CardTitle>
            <div className="flex justify-center items-center space-x-12 mt-8">
               <div className="text-center">
                  <span className="block text-4xl font-bold">{existingAttempt.score} / {existingAttempt.totalQuestions}</span>
                  <span className="text-xs uppercase font-bold text-muted-foreground">Score</span>
               </div>
               <div className="text-center">
                  <span className="block text-4xl font-bold text-primary">{percentage}%</span>
                  <span className="text-xs uppercase font-bold text-muted-foreground">Accuracy</span>
               </div>
            </div>
          </CardHeader>
        </Card>

        <div className="space-y-6">
          <h3 className="text-xl font-bold flex items-center px-2">
            <BookOpen className="w-5 h-5 mr-2" /> Question Review
          </h3>
          {quiz.questions.map((q, idx) => {
            const studentAnswer = existingAttempt.answers[q.id];
            const isCorrect = studentAnswer === q.correctAnswer;
            return (
              <Card key={q.id} className={cn("border-l-8", isCorrect ? "border-l-green-500" : "border-l-red-500")}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-bold text-muted-foreground">Q {idx + 1}</span>
                    <Badge variant={isCorrect ? "default" : "destructive"}>{isCorrect ? "Correct" : "Incorrect"}</Badge>
                  </div>
                  <CardTitle className="text-lg mt-2">{q.questionText}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className={cn("p-3 rounded-lg border", isCorrect ? "bg-green-50" : "bg-red-50")}>
                    <span className="text-xs font-bold block opacity-70">Your Answer: {studentAnswer || "None"}</span>
                  </div>
                  {!isCorrect && <div className="p-3 rounded-lg border bg-green-50">Correct: {q.correctAnswer}</div>}
                  {q.explanation && <div className="text-sm italic text-muted-foreground pt-2">Exp: {q.explanation}</div>}
                </CardContent>
              </Card>
            );
          })}
        </div>
        <div className="flex justify-center pb-20">
          <Button variant="outline" onClick={() => router.push('/student')} className="rounded-full">My Student Portal</Button>
        </div>
      </div>
    );
  }

  return null;
}
