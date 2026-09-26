import React, { useRef, useEffect } from 'react';
import { ChatMessage as ChatMessageType } from '@/lib/types';
import { ChatMessage } from './ChatMessage';
import { EmptyState } from './EmptyState';
import { ChatComposer } from './ChatComposer';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { Bot, Sparkles } from 'lucide-react';

interface ChatContainerProps {
  messages: ChatMessageType[];
  isLoading: boolean;
  onSendMessage: (query: string) => void;
  activeDocument: string;
  onOpenUpload: () => void;
  onViewSources: (sources?: any[]) => void;
}

export const ChatContainer: React.FC<ChatContainerProps> = ({
  messages,
  isLoading,
  onSendMessage,
  activeDocument,
  onOpenUpload,
  onViewSources
}) => {
  const scrollEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    scrollEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-4rem)] bg-slate-950 overflow-hidden">
      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto px-4 py-6 flex flex-col items-center">
        {messages.length === 0 ? (
          <EmptyState
            onSelectPrompt={onSendMessage}
            activeDocument={activeDocument}
            onOpenUpload={onOpenUpload}
          />
        ) : (
          <div className="w-full max-w-3xl flex flex-col gap-2">
            {messages.map((msg) => (
              <ChatMessage
                key={msg.id}
                message={msg}
                onViewSources={() => onViewSources(msg.sources)}
              />
            ))}

            {/* AI Typing Indicator */}
            {isLoading && (
              <div className="w-full py-4 flex items-start gap-3 max-w-3xl">
                <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center flex-shrink-0 shadow-md">
                  <Bot className="w-5 h-5 text-cyan-400 animate-bounce" />
                </div>

                <div className="p-4 rounded-2xl rounded-tl-none bg-slate-900/90 border border-slate-800 text-slate-300 text-sm flex items-center gap-3">
                  <LoadingSpinner size="sm" />
                  <span className="font-medium">
                    Retrieving vector chunks & generating answer...
                  </span>
                </div>
              </div>
            )}

            <div ref={scrollEndRef} />
          </div>
        )}
      </div>

      {/* Composer Input Bar */}
      <div className="border-t border-slate-800/80 bg-slate-950/90 backdrop-blur-md">
        <ChatComposer
          onSendMessage={onSendMessage}
          isLoading={isLoading}
          onOpenUpload={onOpenUpload}
        />
      </div>
    </div>
  );
};
