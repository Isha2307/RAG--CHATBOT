import React from 'react';
import { 
  Sparkles, 
  BookOpen, 
  HelpCircle, 
  FileText, 
  ArrowRight,
  Database,
  Cpu,
  Layers
} from 'lucide-react';

interface EmptyStateProps {
  onSelectPrompt: (prompt: string) => void;
  activeDocument: string;
  onOpenUpload: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  onSelectPrompt,
  activeDocument,
  onOpenUpload
}) => {
  const exampleQuestions = [
    {
      title: 'Summarize Document',
      prompt: 'Summarize this document and highlight its main key concepts.',
      icon: BookOpen,
    },
    {
      title: 'Key Architecture & Concepts',
      prompt: 'What are the key concepts and architectural components described here?',
      icon: Layers,
    },
    {
      title: 'Explain Simply',
      prompt: 'Explain this topic in simple terms with bullet points.',
      icon: HelpCircle,
    },
    {
      title: 'DBMS & Concurrency Control',
      prompt: 'What does the document say about DBMS, transactions, and concurrency control?',
      icon: Cpu,
    }
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 lg:py-12 flex flex-col items-center text-center">
      {/* Glow Badge & Icon */}
      <div className="relative mb-6">
        <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-cyan-500 via-teal-500 to-indigo-500 opacity-40 blur-lg animate-pulse" />
        <div className="relative w-16 h-16 rounded-2xl bg-slate-900 border border-slate-700/80 flex items-center justify-center shadow-xl">
          <Sparkles className="w-8 h-8 text-cyan-400" />
        </div>
      </div>

      {/* Main Title & Subtitle */}
      <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight mb-3">
        Chat with your documents
      </h2>
      <p className="text-sm sm:text-base text-slate-400 max-w-xl mb-8 leading-relaxed">
        Upload a document and ask questions. IntelliRAG retrieves relevant information using FAISS vector search, Cross-Encoder reranking, and grounded answer synthesis.
      </p>

      {/* Active Document Card */}
      <div className="w-full max-w-md p-4 mb-8 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center flex-shrink-0">
            <FileText className="w-5 h-5 text-cyan-400" />
          </div>
          <div className="text-left">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Current Context File</span>
            <h4 className="text-sm font-bold text-slate-200 truncate">{activeDocument}</h4>
          </div>
        </div>

        <button
          onClick={onOpenUpload}
          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 text-xs font-semibold border border-slate-700 transition-colors"
        >
          Change PDF
        </button>
      </div>

      {/* Example Prompt Grid */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {exampleQuestions.map((q, idx) => {
          const Icon = q.icon;
          return (
            <button
              key={idx}
              onClick={() => onSelectPrompt(q.prompt)}
              className="p-4 rounded-xl bg-slate-900/60 hover:bg-slate-800/90 border border-slate-800 hover:border-cyan-500/40 text-left transition-all group flex flex-col justify-between gap-3 shadow-sm hover:shadow-cyan-500/5"
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-slate-800 group-hover:bg-cyan-500/10 text-slate-400 group-hover:text-cyan-400 transition-colors">
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-slate-200 group-hover:text-cyan-300 transition-colors">
                    {q.title}
                  </span>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all" />
              </div>
              <p className="text-xs text-slate-400 group-hover:text-slate-300 transition-colors leading-normal">
                "{q.prompt}"
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
};
