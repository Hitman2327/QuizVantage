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
import { Loader2, Sparkles, Wand2, ArrowLeft, CheckCircle2, Clock, Quote } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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

  const handleSave = () => {
    if (!title || extractedQuestions.length === 0) return;

    const newQuiz: Quiz = {
      id: `quiz-${Date.now()}`,
      title,
      description,
      welcomeQuote,
      timerMinutes: timerMinutes ? parseInt(timerMinutes) : null,
      questions: extractedQuestions,
      createdAt: Date.now(),
    };

    db.saveQuiz(newQuiz);
    toast({ title: "Quiz Published!", description: "Your quiz is ready to be shared." });
    router.push('/admin');
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
                className="rounded-md border-border focus:ring-primary"
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
            <div className="space-y-2">
              <Label htmlFor="desc">Instructions (Optional)</Label>
              <Textarea
                id="desc"
                placeholder="Briefly explain what students should expect..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="font-headline">2. AI Content Extraction</CardTitle>
                <CardDescription>Paste text from your PDF or DOCX file.</CardDescription>
              </div>
              <Sparkles className="text-accent h-6 w-6 animate-pulse" />
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <Textarea
              className="min-h-[250px] font-mono text-sm border-border focus:ring-accent"
              placeholder="Paste your questions and content here. Don't worry about perfect formatting, our AI will handle it..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
            <Button
              onClick={handleExtract}
              disabled={loading || !content.trim()}
              className="w-full bg-accent hover:bg-accent/90 rounded-full h-12"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Extracting Content...
                </>
              ) : (
                <>
                  <Wand2 className="mr-2 h-5 w-5" /> Generate Quiz with AI
                </>
              )}
            </Button>

            {extractedQuestions.length > 0 && (
              <div className="mt-8 space-y-4 animate-slide-up">
                <div className="flex items-center text-green-600 font-semibold mb-2">
                  <CheckCircle2 className="w-5 h-5 mr-2" />
                  Preview: {extractedQuestions.length} Questions Found
                </div>
                <div className="max-h-[300px] overflow-y-auto space-y-3 p-4 bg-muted/50 rounded-lg border border-border">
                  {extractedQuestions.map((q, idx) => (
                    <div key={q.id} className="text-sm border-b border-border/50 pb-2 last:border-0">
                      <span className="font-bold mr-2 text-primary">{idx + 1}.</span> {q.questionText}
                    </div>
                  ))}
                </div>
                <Button onClick={handleSave} className="w-full bg-primary hover:bg-primary/90 text-white rounded-full h-12 mt-4 shadow-lg">
                  Confirm & Publish Quiz
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
