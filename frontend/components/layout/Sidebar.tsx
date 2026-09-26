import React from 'react';
import { 
  Bot, 
  Plus, 
  MessageSquare, 
  FileText, 
  Settings, 
  Server, 
  ChevronLeft, 
  X,
  Sparkles,
  Trash2,
  FileCheck
} from 'lucide-react';
import { HealthStatus } from '@/lib/types';
import { Badge } from '../ui/Badge';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: 'chat' | 'documents';
  setActiveTab: (tab: 'chat' | 'documents') => void;
  onNewChat: () => void;
  onClearHistory: () => void;
  health: HealthStatus | null;
  historyQueries: string[];
  onSelectHistoryQuery: (query: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  activeTab,
  setActiveTab,
  onNewChat,
  onClearHistory,
  health,
  historyQueries,
  onSelectHistoryQuery
}) => {
  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside className={`
        fixed top-0 bottom-0 left-0 z-50 w-72 bg-slate-900 border-r border-slate-800 
        flex flex-col transition-transform duration-300 ease-in-out
        lg:static lg:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Logo & Header */}
        <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 via-teal-500 to-indigo-500 p-0.5 shadow-lg shadow-cyan-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Bot className="w-5 h-5 text-cyan-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                  INTELLIRAG
                </span>
                <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  PRO
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">Document AI Assistant</p>
            </div>
          </div>
          
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Button: New Chat */}
        <div className="p-4 pb-2">
          <button
            onClick={() => {
              onNewChat();
              setActiveTab('chat');
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-semibold text-sm shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/30 transition-all flex items-center justify-center gap-2 group"
          >
            <Plus className="w-4 h-4 transition-transform group-hover:rotate-90" />
            <span>New Conversation</span>
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="px-4 py-2 flex flex-col gap-1">
          <button
            onClick={() => setActiveTab('chat')}
            className={`w-full px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-3 transition-colors ${
              activeTab === 'chat'
                ? 'bg-slate-800/90 text-cyan-400 font-semibold border-l-2 border-cyan-400'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Chat Assistant</span>
          </button>

          <button
            onClick={() => setActiveTab('documents')}
            className={`w-full px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-3 transition-colors ${
              activeTab === 'documents'
                ? 'bg-slate-800/90 text-cyan-400 font-semibold border-l-2 border-cyan-400'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <FileText className="w-4 h-4" />
            <div className="flex-1 flex items-center justify-between">
              <span>Document Manager</span>
              {health?.chunk_count ? (
                <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full border border-slate-700">
                  {health.chunk_count} chunks
                </span>
              ) : null}
            </div>
          </button>
        </div>

        {/* History List Section */}
        <div className="flex-1 overflow-y-auto px-4 py-3 border-t border-slate-800/60 flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider px-2">
            <span>Recent Queries</span>
            {historyQueries.length > 0 && (
              <button 
                onClick={onClearHistory}
                title="Clear conversation memory"
                className="text-slate-500 hover:text-rose-400 transition-colors p-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {historyQueries.length === 0 ? (
            <div className="py-6 px-3 text-center border border-dashed border-slate-800 rounded-xl">
              <Sparkles className="w-5 h-5 text-slate-600 mx-auto mb-1.5" />
              <p className="text-xs text-slate-500">No active history yet</p>
              <p className="text-[11px] text-slate-600 mt-0.5">Ask questions to build conversation context</p>
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              {historyQueries.map((query, index) => (
                <button
                  key={index}
                  onClick={() => {
                    onSelectHistoryQuery(query);
                    setActiveTab('chat');
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg text-xs text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors truncate flex items-center gap-2 group"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 flex-shrink-0" />
                  <span className="truncate">{query}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* System & Active Document Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/50 flex flex-col gap-3">
          {/* Active Document Card */}
          <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center flex-shrink-0">
              <FileCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">Active Document</p>
              <p className="text-xs font-semibold text-slate-200 truncate">
                {health?.active_document || 'sample.pdf'}
              </p>
            </div>
          </div>

          {/* Backend Status Indicator */}
          <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
            <div className="flex items-center gap-2">
              <Server className="w-3.5 h-3.5 text-slate-500" />
              <span>Backend API</span>
            </div>
            <Badge 
              variant={health?.status === 'online' ? 'success' : health?.status === 'indexing_required' ? 'warning' : 'danger'}
              size="sm"
            >
              <span className={`w-1.5 h-1.5 rounded-full ${
                health?.status === 'online' ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'
              }`} />
              <span className="capitalize">{health?.status || 'checking...'}</span>
            </Badge>
          </div>
        </div>
      </aside>
    </>
  );
};
