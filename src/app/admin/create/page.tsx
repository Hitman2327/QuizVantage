
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createQuizFromDocument } from '@/ai/flows/create-quiz-from-document';
import { db } from '@/lib/db';
import { Quiz, Question } from '@/lib/types';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Sparkles, Wand2, ArrowLeft, CheckCircle2, Clock, Quote, FileSpreadsheet, FileText, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Papa from 'papaparse';

export default function CreateQuiz() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [welcomeQuote, setWelcomeQuote] = useState('');
  const [timerMinutes, setTimerMinutes] = useState<string>('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [extractedQuestions, setExtractedQuestions] = useState<Question[]>([]);
  const router = useRouter();
  const { toast } = useToast();

  const handleExtract = async () => {
    if (!content.trim()) return;
    setLoading(true);
    try {
      const result = await createQuizFromDocument({ documentContent: content });
      const formattedQuestions: Question[] = result.map((q, i) => ({
        ...q,
        id: `q-${Date.now()}-${i}`,
      }));
      setExtractedQuestions(formattedQuestions);
      toast({ title: "Questions Extracted", description: `Found ${formattedQuestions.length} questions in your text!` });
    } catch (error) {
      toast({ title: "Extraction Failed", description: "There was an error parsing your document.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const questions: Question[] = results.data.map((row: any, i) => {
          // Expecting headers: Question, Option1, Option2, Option3, Option4, CorrectAnswer, Explanation
          const options = [row.Option1, row.Option2, row.Option3, row.Option4].filter(Boolean);
          return {
            id: `q-csv-${Date.now()}-${i}`,
            questionText: row.Question || row.question || '',
            options,
            correctAnswer: row.CorrectAnswer || row.correctAnswer || '',
            explanation: row.Explanation || row.explanation || '',
          };
        }).filter(q => q.questionText && q.options.length > 0);

        setExtractedQuestions(questions);
        toast({ title: "CSV Imported", description: `Successfully loaded ${questions.length} questions.` });
      },
      error: (error) => {
        toast({ title: "Import Failed", description: error.message, variant: "destructive" });
      }
    });
  };

  const handleSave = async () => {
    if (!title || extractedQuestions.length === 0) return;
    setLoading(true);
    try {
      const newQuiz: Quiz = {
        id: `quiz-${Date.now()}`,
        title,
        description,
        welcomeQuote,
        timerMinutes: timerMinutes ? parseInt(timerMinutes) : null,
        questions: extractedQuestions,
        createdAt: Date.now(),
      };

      await db.saveQuiz(newQuiz);
      toast({ title: "Quiz Published!", description: "Your quiz is ready to be shared globally." });
      router.push('/admin');
    } catch (err) {
      toast({ title: "Save Failed", description: "Could not sync to cloud database.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8 space-y-8 min-h-screen bg-background pb-20">
      <div className="flex items-center mb-6">
        <Button variant="ghost" onClick={() => router.back()} className="mr-4 rounded-full">
          <ArrowLeft className="w-5 h-5 mr-1" /> Back
        </Button>
        <h1 className="text-3xl font-headline font-bold text-primary">Create New Quiz</h1>
      </div>

      <div className="grid grid-cols-1 gap-8">
        <Card className="border-border shadow-sm">
          <CardHeader>
            <CardTitle className="font-headline">1. Quiz Details</CardTitle>
            <CardDescription>Basic information for your students.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Quiz Title</Label>
              <Input
                id="title"
                placeholder="e.g., Biology Midterm: Cellular Structure"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="timer" className="flex items-center">
                  <Clock className="w-4 h-4 mr-2 text-primary" /> Timer (Minutes)
                </Label>
                <Input
                  id="timer"
                  type="number"
                  placeholder="e.g., 75 (Leave empty for no limit)"
                  value={timerMinutes}
                  onChange={(e) => setTimerMinutes(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quote" className="flex items-center">
                  <Quote className="w-4 h-4 mr-2 text-primary" /> Welcome Quote
                </Label>
                <Input
                  id="quote"
                  placeholder="e.g., Success is not final, failure is not fatal."
                  value={welcomeQuote}
                  onChange={(e) => setWelcomeQuote(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="font-headline">2. Import Content</CardTitle>
                <CardDescription>Use AI or manual file upload to add questions.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <Tabs defaultValue="ai" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-8">
                <TabsTrigger value="ai" className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4" /> AI Document Extraction
                </TabsTrigger>
                <TabsTrigger value="csv" className="flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4" /> CSV Upload
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="ai" className="space-y-4">
                <Textarea
                  className="min-h-[200px] font-mono text-sm"
                  placeholder="Paste text from PDF, DOCX or website. AI will detect questions, options, and answers..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />
                <Button
                  onClick={handleExtract}
                  disabled={loading || !content.trim()}
                  className="w-full bg-accent hover:bg-accent/90 rounded-full h-12"
                >
                  {loading ? <Loader2 className="animate-spin" /> : <><Wand2 className="mr-2" /> Generate with AI</>}
                </Button>
              </TabsContent>

              <TabsContent value="csv" className="space-y-6">
                <div className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl p-12 bg-muted/30">
                  <Upload className="w-12 h-12 text-muted-foreground mb-4" />
                  <p className="text-sm text-center mb-6 max-w-xs text-muted-foreground">
                    Upload a CSV file with columns: <strong>Question, Option1, Option2, Option3, Option4, CorrectAnswer</strong>
                  </p>
                  <Input 
                    type="file" 
                    accept=".csv" 
                    onChange={handleCSVUpload}
                    className="hidden" 
                    id="csv-upload"
                  />
                  <Button asChild variant="outline" className="rounded-full">
                    <label htmlFor="csv-upload" className="cursor-pointer">Choose CSV File</label>
                  </Button>
                </div>
              </TabsContent>
            </Tabs>

            {extractedQuestions.length > 0 && (
              <div className="mt-8 space-y-4 animate-slide-up">
                <div className="flex items-center text-green-600 font-semibold mb-2">
                  <CheckCircle2 className="w-5 h-5 mr-2" />
                  Preview: {extractedQuestions.length} Questions Loaded
                </div>
                <div className="max-h-[300px] overflow-y-auto space-y-3 p-4 bg-muted/50 rounded-lg border border-border">
                  {extractedQuestions.map((q, idx) => (
                    <div key={q.id} className="text-sm border-b border-border/50 pb-2 last:border-0">
                      <span className="font-bold mr-2 text-primary">{idx + 1}.</span> {q.questionText}
                    </div>
                  ))}
                </div>
                <Button 
                  onClick={handleSave} 
                  disabled={loading}
                  className="w-full bg-primary hover:bg-primary/90 text-white rounded-full h-12 mt-4 shadow-lg"
                >
                  {loading ? <Loader2 className="animate-spin" /> : 'Confirm & Sync to Cloud'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
