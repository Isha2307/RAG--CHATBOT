import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'INTELLIRAG - AI-Powered Document Assistant',
  description: 'Enterprise RAG application for intelligent document retrieval, vector search, cross-encoder reranking, and grounded Q&A.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-slate-950 text-slate-100 min-h-screen antialiased`}>
        {children}
      </body>
    </html>
  );
}
