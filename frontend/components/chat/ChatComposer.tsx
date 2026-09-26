import React, { useState, useRef, KeyboardEvent } from 'react';
import { Send, Upload, Sparkles, AlertCircle } from 'lucide-react';
import { LoadingSpinner } from '../ui/LoadingSpinner';

interface ChatComposerProps {
  onSendMessage: (query: string) => void;
  isLoading: boolean;
  onOpenUpload: () => void;
  disabled?: boolean;
}

export const ChatComposer: React.FC<ChatComposerProps> = ({
  onSendMessage,
  isLoading,
  onOpenUpload,
  disabled = false
}) => {
  const [query, setQuery] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    const trimmed = query.trim();
    if (!trimmed || isLoading || disabled) return;
    onSendMessage(trimmed);
    setQuery('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setQuery(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-3">
      <div className="relative rounded-2xl bg-slate-900 border border-slate-700/80 focus-within:border-cyan-500/70 focus-within:ring-2 focus-within:ring-cyan-500/20 shadow-xl transition-all p-2 flex flex-col">
        {/* Textarea Input */}
        <textarea
          ref={textareaRef}
          value={query}
          onChange={handleTextareaChange}
          onKeyDown={handleKeyDown}
          placeholder="Ask a question about your uploaded document... (Enter to send, Shift+Enter for new line)"
          disabled={isLoading || disabled}
          rows={1}
          className="w-full px-3 py-2 bg-transparent text-slate-100 placeholder-slate-500 text-sm focus:outline-none resize-none min-h-[44px] max-h-[180px] leading-relaxed"
        />

        {/* Action Row */}
        <div className="flex items-center justify-between pt-2 px-2 border-t border-slate-800/80">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onOpenUpload}
              className="p-2 rounded-xl text-slate-400 hover:text-cyan-400 hover:bg-slate-800 transition-colors flex items-center gap-1.5 text-xs font-medium"
              title="Upload new PDF document"
            >
              <Upload className="w-4 h-4 text-cyan-400" />
              <span className="hidden sm:inline">Upload PDF</span>
            </button>

            <span className="text-[11px] text-slate-500 hidden sm:inline-block">
              Shift + Enter for multiline
            </span>
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={!query.trim() || isLoading || disabled}
            className={`py-2 px-4 rounded-xl font-semibold text-xs flex items-center gap-2 transition-all shadow-md ${
              query.trim() && !isLoading && !disabled
                ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white shadow-cyan-500/20'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-800'
            }`}
          >
            {isLoading ? (
              <>
                <LoadingSpinner size="sm" />
                <span>Thinking...</span>
              </>
            ) : (
              <>
                <span>Send</span>
                <Send className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
