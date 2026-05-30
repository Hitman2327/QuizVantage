import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { BookOpen, ShieldCheck, GraduationCap } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 space-y-12">
      <div className="text-center space-y-4 max-w-2xl">
        <h1 className="text-5xl font-headline font-bold text-primary tracking-tight">QuizVantage</h1>
        <p className="text-xl text-muted-foreground font-body leading-relaxed">
          The all-in-one platform for educators to create AI-powered quizzes and track student performance with ease.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
        <div className="bg-white p-8 rounded-lg shadow-sm border border-border space-y-6 flex flex-col">
          <div className="flex items-center space-x-3 text-primary">
            <ShieldCheck className="w-8 h-8" />
            <h2 className="text-2xl font-headline font-semibold">Educator Portal</h2>
          </div>
          <p className="text-muted-foreground flex-grow">
            Access your private dashboard to build quizzes using AI, set timers, and monitor student results securely.
          </p>
          <Button asChild size="lg" className="w-full bg-primary hover:bg-primary/90">
            <Link href="/admin">Go to Admin Dashboard</Link>
          </Button>
        </div>

        <div className="bg-white p-8 rounded-lg shadow-sm border border-border space-y-6 flex flex-col">
          <div className="flex items-center space-x-3 text-accent">
            <GraduationCap className="w-8 h-8" />
            <h2 className="text-2xl font-headline font-semibold">Student Access</h2>
          </div>
          <p className="text-muted-foreground flex-grow">
            Enter your name to start an assigned quiz, receive instant feedback, and view your personalized progress.
          </p>
          <div className="italic text-sm text-muted-foreground bg-muted p-3 rounded-md">
            Note: You'll typically access quizzes via a unique link provided by your teacher.
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-8 pt-8">
        <div className="flex flex-col items-center">
          <span className="text-primary font-bold text-2xl">AI</span>
          <span className="text-xs uppercase tracking-widest text-muted-foreground">Generation</span>
        </div>
        <div className="h-10 w-px bg-border"></div>
        <div className="flex flex-col items-center">
          <span className="text-primary font-bold text-2xl">Real-time</span>
          <span className="text-xs uppercase tracking-widest text-muted-foreground">Tracking</span>
        </div>
        <div className="h-10 w-px bg-border"></div>
        <div className="flex flex-col items-center">
          <span className="text-primary font-bold text-2xl">Instant</span>
          <span className="text-xs uppercase tracking-widest text-muted-foreground">Feedback</span>
        </div>
      </div>
    </div>
  );
}
