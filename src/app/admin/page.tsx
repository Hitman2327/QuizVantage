
"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getQuizzesAction, getAttemptsAction, deleteQuizAction } from '@/lib/actions';
import { Quiz, QuizAttempt } from '@/lib/types';
import { Button } from "@/components/ui/button";
import { Plus, Trash2, ExternalLink, Users, BarChart2, BookOpen, Clock, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

export default function AdminDashboard() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [results, setResults] = useState<QuizAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadData = async () => {
    try {
      const [qs, rs] = await Promise.all([getQuizzesAction(), getAttemptsAction()]);
      setQuizzes(qs);
      setResults(rs);
    } catch (err) {
      toast({ title: "Load Error", description: "Could not fetch data via Server Actions.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this quiz?')) {
      try {
        await deleteQuizAction(id);
        setQuizzes(quizzes.filter(q => q.id !== id));
        toast({ title: "Quiz Deleted", description: "Successfully removed from cloud." });
      } catch (err) {
        toast({ title: "Delete Failed", variant: "destructive" });
      }
    }
  };

  const copyLink = (id: string) => {
    const url = `${window.location.origin}/quiz/${id}`;
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(url)
        .then(() => toast({ title: "Link Copied", description: "Ready to share!" }))
        .catch(() => {
          window.prompt("Copy this link:", url);
        });
    } else {
      window.prompt("Copy this link:", url);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
        <p className="text-muted-foreground">Communicating with Server...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-8 space-y-8 bg-background min-h-screen">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-4xl font-headline font-bold text-primary">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage global quizzes and track real-time student submissions.</p>
        </div>
        <Button asChild className="bg-primary hover:bg-primary/90 text-white rounded-full px-6">
          <Link href="/admin/create">
            <Plus className="mr-2 h-4 w-4" /> Create New Quiz
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="quizzes" className="w-full">
        <TabsList className="bg-white border p-1 rounded-full mb-8">
          <TabsTrigger value="quizzes" className="rounded-full px-8 py-2 data-[state=active]:bg-primary data-[state=active]:text-white">
            <BookOpen className="mr-2 h-4 w-4" /> Quizzes
          </TabsTrigger>
          <TabsTrigger value="results" className="rounded-full px-8 py-2 data-[state=active]:bg-primary data-[state=active]:text-white">
            <BarChart2 className="mr-2 h-4 w-4" /> Real-time Results
          </TabsTrigger>
        </TabsList>

        <TabsContent value="quizzes" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quizzes.length === 0 ? (
              <div className="col-span-full py-20 text-center bg-white border rounded-xl border-dashed">
                <h3 className="text-xl font-headline font-medium">No cloud quizzes yet</h3>
                <p className="text-muted-foreground mb-6">Create your first globally accessible quiz.</p>
                <Button asChild variant="outline" className="rounded-full border-primary text-primary">
                  <Link href="/admin/create">Start Creating</Link>
                </Button>
              </div>
            ) : (
              quizzes.map(quiz => {
                const quizResults = results.filter(r => r.quizId === quiz.id);
                return (
                  <Card key={quiz.id} className="border-border hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <Badge variant="secondary" className="bg-secondary text-primary">
                          {quiz.questions.length} Qs
                        </Badge>
                        {quiz.timerMinutes && (
                          <Badge variant="outline" className="flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {quiz.timerMinutes}m
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-xl font-headline mt-3">{quiz.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Users className="w-4 h-4 mr-2" />
                        {quizResults.length} Submissions
                      </div>
                      <div className="flex flex-wrap gap-2 pt-2 border-t border-border mt-4">
                        <Button variant="ghost" size="sm" className="flex-1" onClick={() => copyLink(quiz.id)}>
                          <ExternalLink className="w-4 h-4 mr-2 text-primary" /> Share
                        </Button>
                        <Button variant="ghost" size="sm" className="flex-1 text-destructive hover:text-destructive" onClick={() => handleDelete(quiz.id)}>
                          <Trash2 className="w-4 h-4 mr-2" /> Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </TabsContent>

        <TabsContent value="results" className="mt-0">
          <div className="bg-white rounded-xl border border-border overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-muted/10 text-xs font-semibold uppercase tracking-wider text-muted-foreground border-b border-border">
                    <th className="px-6 py-4">Student</th>
                    <th className="px-6 py-4">Quiz</th>
                    <th className="px-6 py-4">Score</th>
                    <th className="px-6 py-4">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {results.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-20 text-center text-muted-foreground">No submissions found.</td>
                    </tr>
                  ) : (
                    results.map(result => {
                      const quiz = quizzes.find(q => q.id === result.quizId);
                      return (
                        <tr key={result.id} className="hover:bg-muted/5">
                          <td className="px-6 py-4 font-medium">{result.studentName}</td>
                          <td className="px-6 py-4 text-sm">{quiz?.title || 'Deleted Quiz'}</td>
                          <td className="px-6 py-4 font-bold text-primary">{result.score} / {result.totalQuestions}</td>
                          <td className="px-6 py-4 text-xs text-muted-foreground">
                            {new Date(result.timestamp).toLocaleString()}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
