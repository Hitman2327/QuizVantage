"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { db } from '@/lib/db';
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
  const [isTimeUp, setIsTimeUp] = useState(false);
  const [existingAttempt, setExistingAttempt] = useState<QuizAttempt | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !id) return;

    const loadData = () => {
      // Direct lookup from the db utility
      const loadedQuiz = db.getQuiz(id);
      
      if (loadedQuiz) {
        setQuiz(loadedQuiz);
        setLoading(false);
      } else {
        // Retry once after a brief moment in case of storage lag
        setTimeout(() => {
          const retryQuiz = db.getQuiz(id);
          if (retryQuiz) {
            setQuiz(retryQuiz);
          } else {
            toast({ 
              title: "Quiz Not Found", 
              description: "We couldn't locate this assessment. Please verify the URL.",
              variant: "destructive" 
            });
          }
          setLoading(false);
        }, 500);
      }
    };

    loadData();
  }, [id, mounted, toast]);

  const handleStart = () => {
    if (!studentName.trim()) {
      toast({ title: "Name required", description: "Please enter your full name to begin." });
      return;
    }

    const attempt = db.getAttemptForStudent(id, studentName);
    if (attempt) {
      setExistingAttempt(attempt);
      setStep('result');
      toast({ title: "Attempt Found", description: "Loading your previous results." });
      return;
    }

    setStep('test');
    if (quiz?.timerMinutes) {
      setTimeLeft(quiz.timerMinutes * 60);
    }
  };

  useEffect(() => {
    if (step !== 'test' || timeLeft === null) return;

    if (timeLeft <= 0) {
      setIsTimeUp(true);
      handleSubmit();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => (prev !== null ? prev - 1 : null));
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, step]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const currentQuestion = quiz?.questions[currentQuestionIndex];
  const progress = quiz ? Math.round(((currentQuestionIndex + 1) / quiz.questions.length) * 100) : 0;

  const handleSelectOption = (option: string) => {
    if (!currentQuestion) return;
    setAnswers({ ...answers, [currentQuestion.id]: option });
  };

  const handleSubmit = () => {
    if (!quiz || !studentName) return;

    const score = quiz.questions.reduce((acc, q) => {
      return answers[q.id] === q.correctAnswer ? acc + 1 : acc;
    }, 0);

    const attempt: QuizAttempt = {
      id: `att-${Date.now()}`,
      quizId: quiz.id,
      studentName,
      score,
      totalQuestions: quiz.questions.length,
      timestamp: Date.now(),
      answers,
    };

    db.saveAttempt(attempt);
    setExistingAttempt(attempt);
    setStep('result');
    toast({ title: "Quiz Submitted", description: `You scored ${score} out of ${quiz.questions.length}` });
  };

  if (!mounted || loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-background">
        <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
        <p className="text-muted-foreground animate-pulse">Initializing assessment environment...</p>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center bg-background">
        <div className="bg-white p-12 rounded-2xl shadow-lg border border-border max-w-md animate-slide-up">
          <AlertTriangle className="w-16 h-16 text-destructive mx-auto mb-6" />
          <h1 className="text-3xl font-headline font-bold mb-4">Quiz Not Found</h1>
          <p className="text-muted-foreground mb-8">
            The assessment you are looking for doesn't exist in this environment or has been removed.
          </p>
          <Button onClick={() => router.push('/')} className="rounded-full px-8 w-full bg-primary hover:bg-primary/90">
            Return to Homepage
          </Button>
        </div>
      </div>
    );
  }

  if (step === 'gate') {
    return (
      <div className="flex items-center justify-center min-h-screen p-4 bg-background">
        <Card className="w-full max-w-lg border-border shadow-xl overflow-hidden animate-slide-up">
          <div className="bg-primary h-2 w-full"></div>
          <CardHeader className="text-center pt-10 pb-6">
            {quiz.welcomeQuote && (
              <div className="mb-6 flex flex-col items-center">
                <Quote className="w-10 h-10 text-primary/20 mb-2" />
                <p className="italic text-muted-foreground font-body text-lg px-4">&ldquo;{quiz.welcomeQuote}&rdquo;</p>
              </div>
            )}
            <CardTitle className="text-3xl font-headline text-primary mb-2">{quiz.title}</CardTitle>
            <CardDescription className="text-base">{quiz.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pb-10 px-8">
            <div className="space-y-4">
               <div className="flex justify-center space-x-6 py-4 border-y border-border/50">
                  <div className="text-center">
                    <span className="block text-2xl font-bold text-primary">{quiz.questions.length}</span>
                    <span className="text-xs uppercase text-muted-foreground font-semibold">Questions</span>
                  </div>
                  <div className="w-px h-10 bg-border"></div>
                  <div className="text-center">
                    <span className="block text-2xl font-bold text-primary">
                      {quiz.timerMinutes ? `${quiz.timerMinutes}m` : '∞'}
                    </span>
                    <span className="text-xs uppercase text-muted-foreground font-semibold">Time Limit</span>
                  </div>
               </div>

               <div className="space-y-2 mt-4">
                 <Label htmlFor="studentName" className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Enter Your Full Name</Label>
                 <div className="relative">
                   <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                   <Input
                    id="studentName"
                    className="pl-10 h-12 text-lg border-border focus:ring-primary"
                    placeholder="e.g., Jane Doe"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleStart()}
                  />
                 </div>
                 <p className="text-xs text-muted-foreground text-center italic mt-2">Required for identification</p>
               </div>
            </div>
          </CardContent>
          <CardFooter className="bg-muted/30 p-8">
            <Button onClick={handleStart} className="w-full h-12 bg-primary hover:bg-primary/90 text-white rounded-full text-lg font-semibold shadow-md">
              Start Quiz <ChevronRight className="ml-2 w-5 h-5" />
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (step === 'test' && currentQuestion) {
    const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1;
    const isUrgent = timeLeft !== null && timeLeft < 60;

    return (
      <div className="flex flex-col items-center min-h-screen p-4 md:p-8 bg-background">
        <div className="w-full max-w-4xl space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 rounded-xl border border-border shadow-sm sticky top-4 z-10">
            <div className="flex items-center space-x-4 w-full md:w-auto">
              <span className="text-sm font-bold text-primary whitespace-nowrap">Question {currentQuestionIndex + 1} of {quiz.questions.length}</span>
              <Progress value={progress} className="h-2 w-full md:w-48 bg-muted" />
            </div>

            {timeLeft !== null && (
              <div className={cn(
                "flex items-center space-x-2 px-4 py-2 rounded-full font-mono font-bold transition-colors",
                isUrgent ? "bg-red-50 text-red-600 border border-red-200 animate-pulse" : "bg-secondary text-primary border border-primary/20"
              )}>
                <Clock className="w-4 h-4" />
                <span>{formatTime(timeLeft)}</span>
              </div>
            )}
          </div>

          <Card className="border-border shadow-lg overflow-hidden animate-fade-in-right">
            <CardHeader className="p-8">
              <h2 className="text-2xl font-headline font-semibold leading-snug">{currentQuestion.questionText}</h2>
            </CardHeader>
            <CardContent className="space-y-4 p-8 pt-0">
              <div className="grid grid-cols-1 gap-3">
                {currentQuestion.options.map((option, idx) => {
                  const isSelected = answers[currentQuestion.id] === option;
                  const label = String.fromCharCode(65 + idx);
                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectOption(option)}
                      className={cn(
                        "flex items-center p-5 rounded-xl border-2 text-left transition-all duration-200 group relative",
                        isSelected
                          ? "bg-secondary border-primary shadow-sm"
                          : "bg-white border-border hover:border-primary/50 hover:bg-muted/30"
                      )}
                    >
                      <span className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center text-lg font-bold mr-4 shrink-0 transition-colors",
                        isSelected ? "bg-primary text-white" : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
                      )}>
                        {label}
                      </span>
                      <span className="text-lg font-body flex-grow">{option}</span>
                      {isSelected && <div className="absolute right-4"><CheckCircle2 className="w-6 h-6 text-primary" /></div>}
                    </button>
                  );
                })}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between items-center bg-muted/20 p-8 border-t border-border/50">
              <Button
                variant="outline"
                disabled={currentQuestionIndex === 0}
                onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
                className="rounded-full px-6"
              >
                <ChevronLeft className="w-4 h-4 mr-2" /> Previous
              </Button>

              <div className="flex gap-2">
                {isLastQuestion ? (
                  <Button onClick={handleSubmit} className="bg-accent hover:bg-accent/90 text-white rounded-full px-8 h-11 font-bold shadow-md">
                    Finish & Submit <Send className="ml-2 w-4 h-4" />
                  </Button>
                ) : (
                  <Button
                    onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                    disabled={!answers[currentQuestion.id]}
                    className="bg-primary hover:bg-primary/90 text-white rounded-full px-8 h-11 font-bold"
                  >
                    Next Question <ChevronRight className="ml-2 w-4 h-4" />
                  </Button>
                )}
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  }

  if (step === 'result' && existingAttempt) {
    const percentage = Math.round((existingAttempt.score / existingAttempt.totalQuestions) * 100);
    const passed = percentage >= 50;

    return (
      <div className="flex flex-col items-center min-h-screen p-4 md:p-8 bg-background">
        <div className="w-full max-w-4xl space-y-8 animate-slide-up">
          <Card className="border-border shadow-xl overflow-hidden">
            <div className={cn("h-4 w-full", passed ? "bg-green-500" : "bg-red-500")}></div>
            <CardHeader className="text-center py-10">
              <div className="flex justify-center mb-4">
                 <div className={cn(
                   "w-24 h-24 rounded-full flex items-center justify-center border-8",
                   passed ? "border-green-100 bg-green-50 text-green-600" : "border-red-100 bg-red-50 text-red-600"
                 )}>
                   {passed ? <CheckCircle2 className="w-12 h-12" /> : <AlertTriangle className="w-12 h-12" />}
                 </div>
              </div>
              <CardTitle className="text-3xl font-headline font-bold text-primary">Assessment Results</CardTitle>
              <CardDescription className="text-lg">Review your performance, {existingAttempt.studentName}.</CardDescription>

              <div className="flex justify-center items-center space-x-12 mt-8">
                 <div className="text-center">
                    <span className="block text-4xl font-bold text-primary">{existingAttempt.score} / {existingAttempt.totalQuestions}</span>
                    <span className="text-xs uppercase font-bold text-muted-foreground tracking-widest">Score</span>
                 </div>
                 <div className="w-px h-16 bg-border"></div>
                 <div className="text-center">
                    <span className={cn("block text-4xl font-bold", passed ? "text-green-600" : "text-red-600")}>{percentage}%</span>
                    <span className="text-xs uppercase font-bold text-muted-foreground tracking-widest">Accuracy</span>
                 </div>
              </div>
            </CardHeader>
          </Card>

          <div className="space-y-6">
            <h3 className="text-xl font-headline font-bold text-primary flex items-center px-2">
              <BookOpen className="w-5 h-5 mr-2" /> Answer Review
            </h3>

            {quiz.questions.map((q, idx) => {
              const studentAnswer = existingAttempt.answers[q.id];
              const isCorrect = studentAnswer === q.correctAnswer;
              return (
                <Card key={q.id} className={cn("border-l-8 transition-all hover:shadow-md", isCorrect ? "border-l-green-500" : "border-l-red-500")}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <span className="text-sm font-bold text-muted-foreground">Question {idx + 1}</span>
                      {isCorrect ? (
                        <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none">Correct</Badge>
                      ) : (
                        <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-none">Incorrect</Badge>
                      )}
                    </div>
                    <CardTitle className="text-lg font-headline font-semibold mt-2">{q.questionText}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className={cn(
                        "p-3 rounded-lg border flex items-center text-sm",
                        isCorrect ? "bg-green-50 border-green-200 text-green-800" : "bg-red-50 border-red-200 text-red-800"
                      )}>
                        <div className="mr-3">
                           {isCorrect ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                        </div>
                        <div>
                          <span className="font-bold block text-xs uppercase opacity-70">Your Answer</span>
                          <span className="font-medium text-base">{studentAnswer || "No Answer"}</span>
                        </div>
                      </div>

                      {!isCorrect && (
                        <div className="p-3 rounded-lg border border-green-200 bg-green-50/30 flex items-center text-sm">
                           <div className="mr-3 text-green-600">
                             <CheckCircle2 className="w-5 h-5" />
                           </div>
                           <div>
                             <span className="font-bold block text-xs uppercase text-green-700 opacity-70">Correct Answer</span>
                             <span className="font-medium text-base text-green-800">{q.correctAnswer}</span>
                           </div>
                        </div>
                      )}
                    </div>

                    {q.explanation && (
                      <div className="bg-muted/30 p-4 rounded-lg border border-border/50 text-sm italic text-muted-foreground">
                        <span className="font-bold text-xs uppercase not-italic block mb-1">Explanation:</span>
                        {q.explanation}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="flex justify-center pb-20">
             <Button variant="outline" onClick={() => router.push('/')} className="rounded-full px-8">
               Return to Homepage
             </Button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}