import React, { useState } from 'react';
import { 
  Bot, 
  User, 
  Copy, 
  Check, 
  Sparkles, 
  AlertCircle, 
  Layers, 
  FileText 
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { ChatMessage as ChatMessageType } from '@/lib/types';
import { Badge } from '../ui/Badge';

interface ChatMessageProps {
  message: ChatMessageType;
  onViewSources?: () => void;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message, onViewSources }) => {
  const [copied, setCopied] = useState(false);
  const isUser = message.sender === 'user';

  const handleCopy = () => {
    navigator.clipboard.writeText(message.rawContent || message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`w-full py-4 flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
      <div className={`max-w-3xl w-full flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Avatar */}
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md ${
          isUser
            ? 'bg-gradient-to-tr from-cyan-600 to-indigo-600 text-white'
            : 'bg-slate-900 border border-slate-700 text-cyan-400'
        }`}>
          {isUser ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5 text-cyan-400" />}
        </div>

        {/* Message Content Area */}
        <div className={`flex-1 min-w-0 ${isUser ? 'text-right' : 'text-left'}`}>
          {/* Header Info Line */}
          <div className={`flex items-center gap-2 mb-1.5 ${isUser ? 'justify-end' : 'justify-start'}`}>
            <span className="text-xs font-bold text-slate-300">
              {isUser ? 'You' : 'IntelliRAG AI'}
            </span>
            <span className="text-[10px] text-slate-500 font-medium">
              {message.timestamp}
            </span>

            {!isUser && message.sources && message.sources.length > 0 && (
              <Badge variant="info" size="sm" className="ml-1 cursor-pointer" onClick={onViewSources}>
                <Layers className="w-3 h-3" />
                <span>{message.sources.length} sources matched</span>
              </Badge>
            )}
          </div>

          {/* Message Bubble Card */}
          <div className={`p-4 rounded-2xl relative shadow-md transition-all ${
            isUser
              ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white rounded-tr-none'
              : message.isError
              ? 'bg-rose-950/40 border border-rose-800/80 text-rose-200 rounded-tl-none'
              : 'bg-slate-900/90 border border-slate-800 text-slate-100 rounded-tl-none'
          }`}>
            {isUser ? (
              <p className="text-sm leading-relaxed whitespace-pre-wrap font-sans">
                {message.content}
              </p>
            ) : (
              <div className="prose prose-invert max-w-none text-sm leading-relaxed 
                prose-headings:text-slate-100 prose-headings:font-bold prose-h2:text-base prose-h2:mt-3 prose-h2:mb-2 prose-h2:border-b prose-h2:border-slate-800 prose-h2:pb-1
                prose-p:text-slate-200 prose-p:my-2
                prose-strong:text-cyan-300 prose-strong:font-bold
                prose-ul:my-2 prose-ul:list-disc prose-ul:pl-5
                prose-ol:my-2 prose-ol:list-decimal prose-ol:pl-5
                prose-li:my-0.5 prose-li:text-slate-200
                prose-code:bg-slate-950 prose-code:text-cyan-300 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none
                prose-pre:bg-slate-950 prose-pre:p-3 prose-pre:rounded-xl prose-pre:border prose-pre:border-slate-800
              ">
                <ReactMarkdown>{message.rawContent || message.content}</ReactMarkdown>
              </div>
            )}

            {/* AI Response Footer bar */}
            {!isUser && !message.isError && (
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="text-[11px] text-slate-400">
                    Grounded with FAISS + Reranker
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {message.sources && message.sources.length > 0 && (
                    <button
                      onClick={onViewSources}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-semibold border border-slate-700 transition-colors flex items-center gap-1"
                    >
                      <Layers className="w-3.5 h-3.5" />
                      View Sources ({message.sources.length})
                    </button>
                  )}

                  <button
                    onClick={handleCopy}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                    title="Copy Answer"
                  >
                    {copied ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
