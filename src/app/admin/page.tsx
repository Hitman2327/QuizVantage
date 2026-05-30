"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { db } from '@/lib/db';
import { Quiz, QuizAttempt } from '@/lib/types';
import { Button } from "@/components/ui/button";
import { Plus, Trash2, ExternalLink, Users, BarChart2, BookOpen, Clock, Quote } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

export default function AdminDashboard() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [results, setResults] = useState<QuizAttempt[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    setQuizzes(db.getQuizzes());
    setResults(db.getAttempts());
  }, []);

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this quiz and all its results?')) {
      db.deleteQuiz(id);
      setQuizzes(db.getQuizzes());
      toast({ title: "Quiz Deleted", description: "The quiz has been removed from your database." });
    }
  };

  const copyLink = async (id: string) => {
    const url = `${window.location.origin}/quiz/${id}`;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(url);
        toast({ 
          title: "Link Copied", 
          description: "Share this link with your students!" 
        });
      } else {
        throw new Error("Clipboard API not available");
      }
    } catch (error) {
      console.error("Clipboard copy failed:", error);
      toast({ 
        title: "Copy Failed", 
        description: `Browser policy blocked automatic copying. Link: ${url}`,
        variant: "destructive" 
      });
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-8 space-y-8 bg-background min-h-screen">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-4xl font-headline font-bold text-primary">Dashboard</h1>
          <p className="text-muted-foreground">Manage your quizzes and monitor student progress.</p>
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
            <BookOpen className="mr-2 h-4 w-4" /> My Quizzes
          </TabsTrigger>
          <TabsTrigger value="results" className="rounded-full px-8 py-2 data-[state=active]:bg-primary data-[state=active]:text-white">
            <BarChart2 className="mr-2 h-4 w-4" /> Student Results
          </TabsTrigger>
        </TabsList>

        <TabsContent value="quizzes" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quizzes.length === 0 ? (
              <div className="col-span-full py-20 text-center bg-white border rounded-xl border-dashed">
                <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4 opacity-20" />
                <h3 className="text-xl font-headline font-medium">No quizzes yet</h3>
                <p className="text-muted-foreground mb-6">Create your first quiz using our AI generator.</p>
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
                        <Badge variant="secondary" className="bg-secondary text-primary border-none">
                          {quiz.questions.length} Questions
                        </Badge>
                        <div className="flex gap-2">
                           {quiz.timerMinutes && (
                             <Badge variant="outline" className="flex items-center gap-1">
                               <Clock className="w-3 h-3" /> {quiz.timerMinutes}m
                             </Badge>
                           )}
                        </div>
                      </div>
                      <CardTitle className="text-xl font-headline mt-3">{quiz.title}</CardTitle>
                      {quiz.description && <CardDescription className="line-clamp-2">{quiz.description}</CardDescription>}
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Users className="w-4 h-4 mr-2" />
                        {quizResults.length} Submissions
                      </div>
                      <div className="flex flex-wrap gap-2 pt-2 border-t border-border mt-4">
                        <Button variant="ghost" size="sm" className="flex-1 hover:bg-secondary" onClick={() => copyLink(quiz.id)}>
                          <ExternalLink className="w-4 h-4 mr-2 text-primary" /> Publish
                        </Button>
                        <Button variant="ghost" size="sm" className="flex-1 hover:bg-red-50 hover:text-red-600" onClick={() => handleDelete(quiz.id)}>
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
            <div className="p-6 border-b border-border bg-muted/30">
              <h3 className="text-lg font-headline font-semibold flex items-center">
                <BarChart2 className="mr-2 h-5 w-5 text-primary" /> Recent Submissions
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-muted/10 text-xs font-semibold uppercase tracking-wider text-muted-foreground border-b border-border">
                    <th className="px-6 py-4">Student Name</th>
                    <th className="px-6 py-4">Quiz Title</th>
                    <th className="px-6 py-4">Score</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {results.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-20 text-center text-muted-foreground italic">
                        No submissions recorded yet.
                      </td>
                    </tr>
                  ) : (
                    results.sort((a, b) => b.timestamp - a.timestamp).map(result => {
                      const quiz = quizzes.find(q => q.id === result.quizId);
                      const percentage = Math.round((result.score / result.totalQuestions) * 100);
                      let scoreColor = "text-red-600";
                      if (percentage >= 80) scoreColor = "text-green-600";
                      else if (percentage >= 50) scoreColor = "text-yellow-600";

                      return (
                        <tr key={result.id} className="hover:bg-muted/5 transition-colors">
                          <td className="px-6 py-4 font-medium">{result.studentName}</td>
                          <td className="px-6 py-4 text-sm text-muted-foreground">{quiz?.title || 'Unknown Quiz'}</td>
                          <td className="px-6 py-4 font-bold">
                            <span className={scoreColor}>{result.score} / {result.totalQuestions}</span>
                          </td>
                          <td className="px-6 py-4">
                            <Badge className={percentage >= 50 ? 'bg-green-100 text-green-700 hover:bg-green-100 border-none' : 'bg-red-100 text-red-700 hover:bg-red-100 border-none'}>
                              {percentage}% Correct
                            </Badge>
                          </td>
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