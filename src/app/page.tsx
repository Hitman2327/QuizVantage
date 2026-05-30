
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { BookOpen, ShieldCheck, GraduationCap, Globe, Users, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 space-y-16 pb-20">
      <div className="text-center space-y-6 max-w-3xl pt-20">
        <div className="inline-flex items-center rounded-full border px-6 py-2 border-primary/30 text-primary font-bold bg-primary/5 mb-4 text-xs">
          <Globe className="w-4 h-4 mr-2" /> Global Cloud Learning Platform
        </div>
        <h1 className="text-6xl font-headline font-bold text-primary tracking-tight leading-tight">
          QuizVantage <span className="text-accent">Cloud</span>
        </h1>
        <p className="text-xl text-muted-foreground font-body leading-relaxed max-w-2xl mx-auto">
          The all-in-one platform for educators to create AI-powered quizzes, share them globally, and track student performance in real-time.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-5xl">
        <div className="group bg-white p-10 rounded-2xl shadow-sm border border-border space-y-6 flex flex-col hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center space-x-3 text-primary">
            <div className="p-3 bg-primary/10 rounded-xl group-hover:bg-primary group-hover:text-white transition-colors">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h2 className="text-3xl font-headline font-semibold">Educator Dashboard</h2>
          </div>
          <p className="text-muted-foreground text-lg leading-relaxed flex-grow">
            Build AI-driven quizzes from PDF, DOCX or CSV. Set timers, publish links, and monitor results globally.
          </p>
          <Button asChild size="lg" className="w-full bg-primary hover:bg-primary/90 rounded-full h-14 text-lg">
            <Link href="/admin">Go to Admin Center</Link>
          </Button>
        </div>

        <div className="group bg-white p-10 rounded-2xl shadow-sm border border-border space-y-6 flex flex-col hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center space-x-3 text-accent">
            <div className="p-3 bg-accent/10 rounded-xl group-hover:bg-accent group-hover:text-white transition-colors">
              <GraduationCap className="w-8 h-8" />
            </div>
            <h2 className="text-3xl font-headline font-semibold">Student Portal</h2>
          </div>
          <p className="text-muted-foreground text-lg leading-relaxed flex-grow">
            Access your assigned quizzes, track your performance history, and review detailed explanations of your results.
          </p>
          <Button asChild variant="outline" size="lg" className="w-full border-accent text-accent hover:bg-accent hover:text-white rounded-full h-14 text-lg">
            <Link href="/student">Access Student Records</Link>
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap justify-center items-center gap-12 pt-8 text-center">
        <div className="flex flex-col items-center">
          <Zap className="w-8 h-8 text-primary mb-2" />
          <span className="text-primary font-bold text-2xl">AI Scale</span>
          <span className="text-xs uppercase tracking-widest text-muted-foreground font-bold">Unlimited MCQs</span>
        </div>
        <div className="h-12 w-px bg-border hidden md:block"></div>
        <div className="flex flex-col items-center">
          <Globe className="w-8 h-8 text-accent mb-2" />
          <span className="text-primary font-bold text-2xl">Global Cloud</span>
          <span className="text-xs uppercase tracking-widest text-muted-foreground font-bold">Internet Sharing</span>
        </div>
        <div className="h-12 w-px bg-border hidden md:block"></div>
        <div className="flex flex-col items-center">
          <Users className="w-8 h-8 text-green-500 mb-2" />
          <span className="text-primary font-bold text-2xl">Real-time</span>
          <span className="text-xs uppercase tracking-widest text-muted-foreground font-bold">Live Tracking</span>
        </div>
      </div>
    </div>
  );
}
