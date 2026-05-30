
import type { Metadata } from 'next';
import { ClerkProvider, UserButton } from '@clerk/nextjs';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: 'QuizVantage - Empowering Educators',
  description: 'AI-powered quiz generation and student performance tracking.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link href="https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
        </head>
        <body className="font-body bg-background text-foreground antialiased min-h-screen" suppressHydrationWarning>
          <header className="flex justify-between items-center p-4 border-b">
            <div>
            </div>
            <div>
              <UserButton afterSignOutUrl="/" />
            </div>
          </header>
          {children}
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  );
}
