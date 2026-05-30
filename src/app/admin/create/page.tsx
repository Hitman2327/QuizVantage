
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createQuizFromDocument } from '@/ai/flows/create-quiz-from-document';
import { saveQuizAction } from '@/lib/actions';
import { Quiz, Question } from '@/lib/types';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Sparkles, Wand2, ArrowLeft, CheckCircle2, Clock, Quote, FileSpreadsheet, Upload, AlertCircle, WifiOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Papa from 'papaparse';

export default function CreateQuiz() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [welcomeQuote, setWelcomeQuote] = useState('');
  const [timerMinutes, setTimerMinutes] = useState<number | null>(null);
  const [content, setContent] = useState('');
  
  const [extracting, setExtracting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [extractedQuestions, setExtractedQuestions] = useState<Question[]>([]);
  
  const router = useRouter();
  const { toast } = useToast();

  const handleExtract = async () => {
    if (!content.trim()) return;
    setExtracting(true);
    try {
      const result = await createQuizFromDocument({ documentContent: content });
      const formattedQuestions: Question[] = result.map((q, i) => ({
        ...q,
        id: `q-${Date.now()}-${i}`,
      }));
      setExtractedQuestions(formattedQuestions);
      toast({ title: "Extraction Complete", description: `Found ${formattedQuestions.length} questions!` });
    } catch (error) {
      toast({ title: "Extraction Failed", description: "The AI could not process this text. Try a shorter snippet.", variant: "destructive" });
    } finally {
      setExtracting(false);
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
    setSaving(true);

    try {
      const newQuiz: Omit<Quiz, 'id' | 'createdAt'> = {
        title,
        description,
        welcomeQuote,
        timerMinutes: timerMinutes,
        questions: extractedQuestions,
      };

      console.log("Triggering server save action...");
      await saveQuizAction(newQuiz);
      toast({ title: "Quiz Published!", description: "Your quiz is ready to be shared globally." });
      router.push('/admin');
    } catch (err: any) {
      console.error("Save Error:", err);
      toast({ 
        title: "Publish Failed", 
        description: "The cloud server is taking too long to respond. Please check your internet or try again.", 
        variant: "destructive" 
      });
    } finally {
      setSaving(false);
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
            <CardDescription>Enter basic information for this assessment.</CardDescription>
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
            <div className="space-y-2">
              <Label htmlFor="description">Quiz Description</Label>
              <Textarea
                id="description"
                placeholder="A brief overview of the quiz content."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
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
                  placeholder="Leave blank for unlimited time"
                  value={timerMinutes === null ? '' : timerMinutes}
                  onChange={(e) => setTimerMinutes(e.target.value === '' ? null : parseInt(e.target.value, 10))}
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
            <CardTitle className="font-headline">2. Import Content</CardTitle>
            <CardDescription>AI can handle large text snippets, or upload a CSV for bulk imports.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Tabs defaultValue="ai" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-8">
                <TabsTrigger value="ai" className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4" /> AI Extraction
                </TabsTrigger>
                <TabsTrigger value="csv" className="flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4" /> CSV Upload
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="ai" className="space-y-4">
                <Textarea
                  className="min-h-[250px] font-mono text-sm leading-relaxed"
                  placeholder="Paste text from PDF, DOCX or website. AI will detect any number of questions, options, and answers..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />
                <Button
                  onClick={handleExtract}
                  disabled={extracting || !content.trim()}
                  className="w-full bg-accent hover:bg-accent/90 rounded-full h-12"
                >
                  {extracting ? <><Loader2 className="animate-spin mr-2" /> AI is Reading...</> : <><Wand2 className="mr-2" /> Generate with AI</>}
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
              <div className="mt-8 space-y-4 animate-slide-up border-t pt-8">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center text-green-600 font-semibold">
                    <CheckCircle2 className="w-5 h-5 mr-2" />
                    Preview: {extractedQuestions.length} Questions Ready
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setExtractedQuestions([])} className="text-xs text-muted-foreground">Clear All</Button>
                </div>
                <div className="max-h-[400px] overflow-y-auto space-y-3 p-4 bg-muted/50 rounded-lg border border-border">
                  {extractedQuestions.map((q, idx) => (
                    <div key={q.id} className="text-sm border-b border-border/50 pb-3 last:border-0 last:pb-0">
                      <p className="font-bold mb-1"><span className="text-primary">{idx + 1}.</span> {q.questionText}</p>
                      <div className="grid grid-cols-2 gap-2 pl-5 opacity-70 italic text-[12px]">
                        {q.options.map((opt, i) => (
                          <div key={i}>• {opt}</div>
                        ))}
                      </div>
                      <p className="text-[11px] mt-2 font-bold text-green-600 pl-5">Answer: {q.correctAnswer}</p>
                    </div>
                  ))}
                </div>
                
                {saving && (
                  <Alert className="bg-yellow-50 border-yellow-200">
                    <WifiOff className="h-4 w-4 text-yellow-600" />
                    <AlertTitle className="text-yellow-800">Publishing to Cloud...</AlertTitle>
                    <AlertDescription className="text-yellow-700">
                      If this takes more than 10 seconds, check if your browser is blocking "firestore.googleapis.com" or disable AdBlockers.
                    </AlertDescription>
                  </Alert>
                )}

                <Button 
                  onClick={handleSave} 
                  disabled={saving || extracting || !title}
                  className="w-full bg-primary hover:bg-primary/90 text-white rounded-full h-14 mt-4 shadow-lg text-lg font-bold"
                >
                  {saving ? <><Loader2 className="animate-spin mr-2" /> Syncing with Server...</> : 'Confirm & Publish Globally'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
