
"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getQuizzesAction, getAttemptsAction, deleteQuizAction, checkDatabaseHealth } from '@/lib/actions';
import { Quiz, QuizAttempt } from '@/lib/types';
import { Button } from "@/components/ui/button";
import { Plus, Upload, Trash2, ExternalLink, Users, BarChart2, BookOpen, Clock, Loader2, Database, AlertCircle, CheckCircle, WifiOff } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function AdminDashboard() {
  const router = useRouter();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [results, setResults] = useState<QuizAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [dbStatus, setDbStatus] = useState<{success: boolean, message: string} | null>(null);
  const [isBrowserBlocked, setIsBrowserBlocked] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const isAuthenticated = sessionStorage.getItem('isAdminAuthenticated');
    if (isAuthenticated !== 'true') {
      router.push('/admin/login');
    } else {
      loadData();
    }
  }, [router]);

  const checkBrowserBlocking = async () => {
    try {
      await fetch('https://firestore.googleapis.com/google.firestore.v1.Firestore/Listen/channel', { mode: 'no-cors' });
    } catch (e) {
      setIsBrowserBlocked(true);
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      await checkBrowserBlocking();
      const status = await checkDatabaseHealth();
      setDbStatus(status);
      
      const [qs, rs] = await Promise.all([getQuizzesAction(), getAttemptsAction()]);
      setQuizzes(qs);
      setResults(rs);
    } catch (err) {
      console.error(err);
      toast({ title: "Sync Error", description: "The server is having trouble reaching the database.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this quiz?')) {
      try {
        await deleteQuizAction(id);
        setQuizzes(quizzes.filter(q => q.id !== id));
        toast({ title: "Quiz Deleted" });
      } catch (err) {
        toast({ title: "Delete Failed", variant: "destructive" });
      }
    }
  };

  const copyLink = (id: string) => {
    const url = `${window.location.origin}/quiz/${id}`;
    navigator.clipboard.writeText(url).then(() => {
      toast({ title: "Link Copied", description: "Share this link with your students!" });
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
        <p className="text-muted-foreground font-medium italic">Verifying credentials and loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-8 space-y-8 bg-background min-h-screen">
      <div className="flex justify-between items-start mb-10">
        <div>
          <h1 className="text-4xl font-headline font-bold text-primary">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-2">Manage your cloud-synced quizzes and student results.</p>
          
          <div className="flex gap-4 mt-4">
            {dbStatus?.success ? (
              <Badge variant="outline" className="text-green-600 bg-green-50 border-green-200 py-1.5 px-3">
                <CheckCircle className="w-3.5 h-3.5 mr-2" /> Cloud DB Live
              </Badge>
            ) : (
              <Badge variant="destructive" className="py-1.5 px-3">
                <AlertCircle className="w-3.5 h-3.5 mr-2" /> DB Setup Required
              </Badge>
            )}
            {isBrowserBlocked && (
              <Badge variant="outline" className="text-orange-600 bg-orange-50 border-orange-200 py-1.5 px-3">
                <WifiOff className="w-3.5 h-3.5 mr-2" /> Browser Blocker Detected
              </Badge>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href="/admin/upload">
              <Upload className="mr-2 h-4 w-4" /> Upload JSON
            </Link>
          </Button>
          <Button asChild>
            <Link href="/admin/create">
              <Plus className="mr-2 h-4 w-4" /> Create New Quiz
            </Link>
          </Button>
        </div>
      </div>

      {!dbStatus?.success && (
        <Alert variant="destructive" className="bg-red-50 border-red-200 mb-8">
          <Database className="h-4 w-4" />
          <AlertTitle>Cloud Connection Failed</AlertTitle>
          <AlertDescription className="space-y-2">
            <p>Your app is not reaching Firestore. Error: <strong>{dbStatus?.message}</strong></p>
            <ul className="list-disc pl-5 text-sm space-y-1">
              <li>Ensure you clicked <strong>"Create Database"</strong> in the Firebase Console.</li>
              <li>Ensure rules are set to <strong>"Test Mode"</strong>.</li>
              <li>Verify your <strong>.env</strong> file has no extra spaces or quotes around keys.</li>
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {isBrowserBlocked && (
        <Alert className="bg-orange-50 border-orange-200 text-orange-800">
          <WifiOff className="h-4 w-4 text-orange-600" />
          <AlertTitle>Network Warning</AlertTitle>
          <AlertDescription>
            An AdBlocker or Firewall is blocking Google services in your browser. We are using <strong>Server Actions</strong> to bypass this, but the initial page load may still be affected.
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="quizzes" className="w-full">
        <TabsList className="bg-white border p-1 rounded-full mb-8">
          <TabsTrigger value="quizzes" className="rounded-full px-8 py-2 data-[state=active]:bg-primary data-[state=active]:text-white">
            <BookOpen className="mr-2 h-4 w-4" /> My Quizzes ({quizzes.length})
          </TabsTrigger>
          <TabsTrigger value="results" className="rounded-full px-8 py-2 data-[state=active]:bg-primary data-[state=active]:text-white">
            <BarChart2 className="mr-2 h-4 w-4" /> Student Submissions ({results.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="quizzes">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quizzes.length === 0 ? (
              <div className="col-span-full py-20 text-center bg-white border border-dashed rounded-2xl">
                <div className="p-4 bg-muted rounded-full w-fit mx-auto mb-4">
                  <BookOpen className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-headline font-semibold">No quizzes found</h3>
                <p className="text-muted-foreground mb-6">Create a quiz to start sharing it with your students.</p>
                <Button asChild variant="outline" className="rounded-full">
                  <Link href="/admin/create">Create My First Quiz</Link>
                </Button>
              </div>
            ) : (
              quizzes.map(quiz => (
                <Card key={quiz.id} className="group hover:shadow-lg transition-all duration-300">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <Badge variant="secondary">{quiz.questions.length} Qs</Badge>
                      <span className="text-xs text-muted-foreground">{new Date(quiz.createdAt).toLocaleDateString()}</span>
                    </div>
                    <CardTitle className="text-xl font-headline mt-4">{quiz.title}</CardTitle>
                    <CardDescription className="line-clamp-2">{quiz.description || 'No description provided.'}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Users className="w-4 h-4 mr-2" />
                      {results.filter(r => r.quizId === quiz.id).length} Submissions
                    </div>
                    <div className="flex gap-2 pt-4 border-t">
                      <Button variant="outline" size="sm" className="flex-1 rounded-full" onClick={() => copyLink(quiz.id)}>
                        <ExternalLink className="w-4 h-4 mr-2" /> Share
                      </Button>
                      <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/5 rounded-full" onClick={() => handleDelete(quiz.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="results">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b bg-muted/30 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      <th className="px-6 py-4">Student Name</th>
                      <th className="px-6 py-4">Quiz Title</th>
                      <th className="px-6 py-4 text-center">Score</th>
                      <th className="px-6 py-4">Submission Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {results.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">No submissions yet.</td>
                      </tr>
                    ) : (
                      results.map(result => {
                        const quiz = quizzes.find(q => q.id === result.quizId);
                        const percent = Math.round((result.score / result.totalQuestions) * 100);
                        return (
                          <tr key={result.id} className="hover:bg-muted/10 transition-colors">
                            <td className="px-6 py-4 font-bold text-primary">{result.studentName}</td>
                            <td className="px-6 py-4 text-sm font-medium">{quiz?.title || 'Deleted Quiz'}</td>
                            <td className="px-6 py-4 text-center">
                              <Badge className={percent >= 80 ? 'bg-green-100 text-green-700' : percent >= 50 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}>
                                {result.score} / {result.totalQuestions} ({percent}%)
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
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
