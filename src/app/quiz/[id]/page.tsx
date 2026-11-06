"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getQuizAction, saveAttemptAction, checkExistingAttemptAction } from '@/lib/actions';
import { Quiz, QuizAttempt, Question } from '@/lib/types';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle2, XCircle, Clock, Quote, ChevronRight, ChevronLeft, Send, AlertTriangle, User, Loader2, BookOpen, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

/**
 * Normalizes a choice string by removing common MCQ prefixes (e.g., "A. ", "1) ")
 * and trimming whitespace to ensure robust comparisons.
 */
const normalizeAnswer = (text: string) => {
  if (!text) return "";
  return text
    .trim()
    .toLowerCase()
    .replace(/^[a-z0-9][\.\)\s-]+\s*/i, '') // Remove "A. ", "1) ", "b- " etc
    .trim();
};

const isAnswerCorrect = (selected: string, correct: string) => {
  if (!selected || !correct) return false;
  const s = selected.trim();
  const c = correct.trim();
  if (s === c) return true;
  return normalizeAnswer(s) === normalizeAnswer(c);
};

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
  const [dataError, setDataError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !id) return;
    async function loadQuiz() {
      try {
        const loadedQuiz = await getQuizAction(id);
        if (loadedQuiz) {
          const invalidQuestions = loadedQuiz.questions.filter(q => !Array.isArray(q.options) || q.options.length === 0);
          if (invalidQuestions.length > 0) {
            setDataError(`This quiz is unplayable due to ${invalidQuestions.length} malformed question(s).`);
          }
          setQuiz(loadedQuiz);
        } else {
          toast({ title: "Not Found", description: "Assessment no longer available.", variant: "destructive" });
        }
      } catch (err) {
        toast({ title: "Server Error", description: "Could not fetch quiz data.", variant: "destructive" });
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
        toast({ title: "Results Loaded" });
      } else {
        setStep('test'); 
        if (quiz?.timerMinutes) setTimeLeft(quiz.timerMinutes * 60);
      }
    } catch (err) {
      toast({ title: "Error", description: "Could not verify existing attempts." });
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

    const score = quiz.questions.reduce((acc, q) => 
      isAnswerCorrect(answers[q.id], q.correctAnswer) ? acc + 1 : acc, 0
    );

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
      toast({ title: "Submission Error", variant: "destructive" });
    }
  };

  if (!mounted || loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-background">
        <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
        <p className="text-muted-foreground font-medium">Syncing Assessment Data...</p>
      </div>
    );
  }

  if (dataError) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Alert variant="destructive" className="max-w-lg shadow-lg">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Quiz Data Corrupted</AlertTitle>
          <AlertDescription>
            {dataError}
            <div className="mt-4">
              <Button onClick={() => router.push('/admin')}><Edit className="w-4 h-4 mr-2"/> Fix in Admin</Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!quiz) return null;

  if (step === 'gate') {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-lg shadow-xl border-t-8 border-t-primary">
          <CardHeader className="text-center pt-10">
            {quiz.welcomeQuote && <p className="italic text-muted-foreground mb-4">"{quiz.welcomeQuote}"</p>}
            <CardTitle className="text-3xl font-headline text-primary">{quiz.title}</CardTitle>
            {quiz.description && <CardDescription className="mt-2">{quiz.description}</CardDescription>}
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4 py-4 border-y">
              <div className="text-center border-r">
                <div className="text-2xl font-bold">{quiz.questions.length}</div>
                <div className="text-xs uppercase text-muted-foreground font-bold">Questions</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{quiz.timerMinutes ? `${quiz.timerMinutes}m` : '∞'}</div>
                <div className="text-xs uppercase text-muted-foreground font-bold">Time Limit</div>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="font-bold">Enter Your Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  className="pl-10 h-12 text-lg" 
                  value={studentName} 
                  onChange={e => setStudentName(e.target.value)} 
                  placeholder="e.g. John Smith"
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="p-8">
            <Button onClick={handleStart} className="w-full rounded-full h-14 text-xl font-bold shadow-lg transition-transform hover:scale-[1.02]">
              Begin Quiz
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (step === 'test' && currentQuestion) {
    return (
      <div className="flex flex-col items-center min-h-screen p-4 md:p-8 bg-background">
        <div className="w-full max-w-4xl space-y-6">
          <div className="flex justify-between items-center bg-white p-4 rounded-2xl border shadow-sm">
            <div className="flex items-center gap-4">
              <span className="text-sm font-bold text-primary">Question {currentQuestionIndex + 1} of {quiz.questions.length}</span>
              <Progress value={progress} className="h-2 w-32" />
            </div>
            {timeLeft !== null && (
              <div className={cn("px-6 py-2 rounded-full font-mono font-bold flex items-center shadow-inner", timeLeft < 60 ? "bg-red-100 text-red-600 animate-pulse" : "bg-secondary text-primary")}>
                <Clock className="w-4 h-4 mr-2" /> {formatTime(timeLeft)}
              </div>
            )}
          </div>

          <Card className="border-none shadow-2xl rounded-3xl overflow-hidden">
            <CardHeader className="p-10 bg-primary/5">
              <h2 className="text-2xl font-headline font-bold leading-relaxed">{currentQuestion.questionText}</h2>
            </CardHeader>
            <CardContent className="p-10 space-y-4">
              {Array.isArray(currentQuestion.options) && currentQuestion.options.map((option, idx) => {
                const isSelected = answers[currentQuestion.id] === option;
                return (
                  <button
                    key={idx}
                    onClick={() => setAnswers({ ...answers, [currentQuestion.id]: option })}
                    className={cn(
                      "w-full flex items-center p-6 rounded-2xl border-2 text-left transition-all duration-200 group",
                      isSelected ? "bg-primary/10 border-primary shadow-md" : "bg-white border-border hover:border-primary/40 hover:bg-primary/5"
                    )}
                  >
                    <span className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center mr-5 shrink-0 font-bold text-lg transition-colors",
                      isSelected ? "bg-primary text-white" : "bg-muted text-muted-foreground group-hover:bg-primary/20 group-hover:text-primary"
                    )}>
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span className="text-lg font-medium">{option}</span>
                  </button>
                );
              })}
            </CardContent>
            <CardFooter className="flex justify-between p-10 bg-muted/20 border-t">
              <Button 
                variant="outline" 
                disabled={currentQuestionIndex === 0} 
                onClick={() => setCurrentQuestionIndex(p => p - 1)} 
                className="rounded-full px-8 h-12"
              >
                <ChevronLeft className="mr-2 h-4 w-4" /> Previous
              </Button>
              {currentQuestionIndex === quiz.questions.length - 1 ? (
                <Button onClick={handleSubmit} className="bg-accent hover:bg-accent/90 rounded-full px-10 h-12 text-lg font-bold shadow-lg">
                  Submit Results <Send className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button 
                  onClick={() => setCurrentQuestionIndex(p => p + 1)} 
                  disabled={!answers[currentQuestion.id]} 
                  className="rounded-full px-10 h-12 text-lg font-bold"
                >
                  Next <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
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
      <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-12 pb-24">
        <Card className="shadow-2xl border-none rounded-3xl overflow-hidden text-center py-12 bg-white">
          <CardHeader>
            <div className="mx-auto bg-primary/10 w-20 h-20 rounded-full flex items-center justify-center mb-4 text-primary">
              <Trophy className="w-10 h-10" />
            </div>
            <CardTitle className="text-4xl font-headline font-bold">Your Performance</CardTitle>
            <p className="text-muted-foreground text-lg">Detailed assessment breakdown for <strong>{existingAttempt.studentName}</strong></p>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center items-center gap-16 mt-6">
               <div className="text-center">
                  <span className="block text-5xl font-black text-primary">{existingAttempt.score} / {existingAttempt.totalQuestions}</span>
                  <span className="text-xs uppercase font-black text-muted-foreground tracking-widest">Raw Score</span>
               </div>
               <div className="h-16 w-px bg-border"></div>
               <div className="text-center">
                  <span className="block text-5xl font-black text-accent">{percentage}%</span>
                  <span className="text-xs uppercase font-black text-muted-foreground tracking-widest">Accuracy</span>
               </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-8">
          <h3 className="text-2xl font-headline font-bold text-primary flex items-center">
            <BookOpen className="w-7 h-7 mr-3" /> Question Review
          </h3>
          {quiz.questions.map((q, idx) => {
            const studentAnswer = existingAttempt.answers[q.id];
            const isCorrect = isAnswerCorrect(studentAnswer, q.correctAnswer);
            return (
              <Card key={q.id} className={cn("border-none shadow-lg rounded-2xl overflow-hidden transition-all hover:shadow-xl", isCorrect ? "ring-2 ring-green-500/20" : "ring-2 ring-red-500/20")}>
                <div className={cn("h-2 w-full", isCorrect ? "bg-green-500" : "bg-red-500")}></div>
                <CardHeader className="p-8 pb-4">
                  <div className="flex justify-between items-start">
                    <span className="text-sm font-black text-muted-foreground uppercase tracking-tighter">Q {idx + 1}</span>
                    <Badge variant={isCorrect ? "default" : "destructive"} className="rounded-full px-4 py-1">
                      {isCorrect ? "Correct" : "Incorrect"}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl font-bold mt-4 leading-relaxed">{q.questionText}</CardTitle>
                </CardHeader>
                <CardContent className="p-8 pt-2 space-y-3">
                  {Array.isArray(q.options) && q.options.map((option, optionIdx) => {
                    const isStudentChoice = studentAnswer === option;
                    // Check if THIS specific option matches the correct answer in the DB
                    const isOptionCorrect = isAnswerCorrect(option, q.correctAnswer);
                    
                    let bgClass = 'bg-white border-border';
                    let textClass = 'text-foreground';
                    let statusLabel = '';

                    if (isOptionCorrect) {
                      bgClass = 'bg-green-50 border-green-500/50';
                      textClass = 'text-green-800';
                      statusLabel = isStudentChoice ? 'Correct Choice' : 'Correct Answer';
                    } else if (isStudentChoice && !isOptionCorrect) {
                      bgClass = 'bg-red-50 border-red-500/50';
                      textClass = 'text-red-800';
                      statusLabel = 'Your Incorrect Answer';
                    }

                    return (
                      <div key={optionIdx} className={cn("p-4 rounded-xl border-2 flex items-center justify-between transition-colors", bgClass, textClass)}>
                        <div className="flex items-center font-medium">
                          <span className={cn(
                            "w-8 h-8 rounded-lg flex items-center justify-center mr-4 font-bold shrink-0",
                            isOptionCorrect ? 'bg-green-600 text-white' : isStudentChoice ? 'bg-red-600 text-white' : 'bg-muted text-muted-foreground'
                          )}>
                            {String.fromCharCode(65 + optionIdx)}
                          </span>
                          <span className="text-base">{option}</span>
                        </div>
                        {statusLabel && <Badge className={cn("ml-4 rounded-full", isOptionCorrect ? "bg-green-600" : "bg-red-600")}>{statusLabel}</Badge>}
                      </div>
                    );
                  })}
                  {q.explanation && (
                    <div className="mt-6 p-5 rounded-2xl bg-muted/40 border border-muted/60">
                      <p className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-2">Expert Explanation</p>
                      <p className="text-sm italic text-muted-foreground leading-relaxed">{q.explanation}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
        <div className="flex justify-center pt-8">
          <Button variant="outline" onClick={() => router.push('/student')} className="rounded-full px-10 h-12 font-bold shadow-sm">
            Return to Student Portal
          </Button>
        </div>
      </div>
    );
  }

  return null;
}

const Trophy = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>
);
