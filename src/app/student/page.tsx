
"use client";

import { useState, useEffect } from 'react';
import { getAttemptsForStudentAction, getQuizAction } from '@/lib/actions';
import { QuizAttempt, Quiz } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, History, Trophy, Clock, Search, BookOpen, Loader2, ChevronRight } from "lucide-react";
import Link from 'next/link';
import { cn } from "@/lib/utils";

export default function StudentPortal() {
  const [studentName, setStudentName] = useState('');
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [quizzes, setQuizzes] = useState<Record<string, Quiz>>({});
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('quizvantage_student_name');
    if (saved) {
      setStudentName(saved);
      handleSearch(saved);
    }
  }, []);

  const handleSearch = async (nameOverride?: string) => {
    const name = nameOverride || studentName;
    if (!name.trim()) return;

    setLoading(true);
    setHasSearched(true);
    localStorage.setItem('quizvantage_student_name', name);

    try {
      const results = await getAttemptsForStudentAction(name);
      setAttempts(results);
      
      const quizMap: Record<string, Quiz> = {};
      for (const attempt of results) {
        if (!quizMap[attempt.quizId]) {
          const q = await getQuizAction(attempt.quizId);
          if (q) quizMap[attempt.quizId] = q;
        }
      }
      setQuizzes(quizMap);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const totalScore = attempts.reduce((acc, a) => acc + a.score, 0);
  const totalQuestions = attempts.reduce((acc, a) => acc + a.totalQuestions, 0);
  const avgAccuracy = attempts.length > 0 ? Math.round((totalScore / totalQuestions) * 100) : 0;

  return (
    <div className="max-w-6xl mx-auto p-8 space-y-12 bg-background min-h-screen">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-headline font-bold text-primary flex items-center justify-center">
          <GraduationCap className="mr-3 w-10 h-10" /> Student Portal
        </h1>
        <p className="text-muted-foreground text-lg">Track your learning progress across all shared assessments.</p>
      </div>

      <Card className="max-w-md mx-auto shadow-md">
        <CardHeader>
          <CardTitle>Identify Yourself</CardTitle>
          <CardDescription>Enter your full name to pull your records from the server.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input 
              placeholder="e.g., Jane Doe" 
              value={studentName} 
              onChange={e => setStudentName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
            />
            <Button onClick={() => handleSearch()} disabled={loading}>
              {loading ? <Loader2 className="animate-spin" /> : <Search className="w-4 h-4" />}
            </Button>
          </div>
        </CardContent>
      </Card>

      {hasSearched && (
        <div className="space-y-8 animate-slide-up">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-primary text-white border-none shadow-lg">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase font-bold opacity-70 tracking-widest">Assessments</p>
                    <p className="text-4xl font-bold">{attempts.length}</p>
                  </div>
                  <BookOpen className="w-10 h-10 opacity-30" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-accent text-white border-none shadow-lg">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase font-bold opacity-70 tracking-widest">Avg. Accuracy</p>
                    <p className="text-4xl font-bold">{avgAccuracy}%</p>
                  </div>
                  <Trophy className="w-10 h-10 opacity-30" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-border shadow-lg">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase font-bold text-muted-foreground tracking-widest">Last Activity</p>
                    <p className="text-2xl font-bold text-primary">
                      {attempts.length > 0 ? new Date(attempts[0].timestamp).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                  <Clock className="w-10 h-10 text-muted/50" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-headline font-bold text-primary flex items-center">
              <History className="mr-2 w-6 h-6" /> Assessment History
            </h2>
            
            {loading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
              </div>
            ) : attempts.length === 0 ? (
              <div className="py-20 text-center bg-white border rounded-xl border-dashed">
                <p className="text-muted-foreground">No records found for "{studentName}".</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {attempts.map(attempt => {
                  const quiz = quizzes[attempt.quizId];
                  const percentage = Math.round((attempt.score / attempt.totalQuestions) * 100);
                  return (
                    <Card key={attempt.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6 flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="space-y-1">
                          <h4 className="font-bold text-lg">{quiz?.title || 'Unknown Quiz'}</h4>
                          <p className="text-xs text-muted-foreground">{new Date(attempt.timestamp).toLocaleString()}</p>
                        </div>
                        <div className="flex items-center gap-8">
                          <div className="text-center">
                            <span className="block text-xl font-bold">{attempt.score} / {attempt.totalQuestions}</span>
                            <span className="text-[10px] uppercase font-bold text-muted-foreground">Score</span>
                          </div>
                          <Badge className={cn("px-4 py-1", percentage >= 80 ? "bg-green-100 text-green-700" : percentage >= 50 ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700")}>
                            {percentage}%
                          </Badge>
                          <Button asChild variant="ghost" size="sm" className="rounded-full">
                            <Link href={`/quiz/${attempt.quizId}`}>
                              Review <ChevronRight className="ml-1 w-4 h-4" />
                            </Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
