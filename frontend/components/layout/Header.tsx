import React from 'react';
import { 
  Menu, 
  Plus, 
  FileText, 
  Layers, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles,
  PanelRight,
  Database
} from 'lucide-react';
import { HealthStatus } from '@/lib/types';
import { Badge } from '../ui/Badge';

interface HeaderProps {
  onToggleSidebar: () => void;
  onNewChat: () => void;
  health: HealthStatus | null;
  toggleSourcesPanel: () => void;
  isSourcesOpen: boolean;
  hasSources: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleSidebar,
  onNewChat,
  health,
  toggleSourcesPanel,
  isSourcesOpen,
  hasSources
}) => {
  const isConnected = health?.status === 'online';

  return (
    <header className="h-16 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 px-4 lg:px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Left: Mobile Menu Toggle & Title Context */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden transition-colors"
          title="Open Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <h1 className="font-bold text-slate-100 text-base lg:text-lg tracking-tight">
              INTELLIRAG
            </h1>
            <span className="hidden sm:inline-block text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
              RAG Pipeline v2.0
            </span>
          </div>
          <p className="text-xs text-slate-400 hidden sm:block">
            AI-Powered Document Assistant & Vector Search Engine
          </p>
        </div>
      </div>

      {/* Center/Right Status & Action controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Active Document Indicator */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs">
          <FileText className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-slate-400">Doc:</span>
          <span className="font-semibold text-slate-200 max-w-[140px] truncate">
            {health?.active_document || 'sample.pdf'}
          </span>
        </div>

        {/* Backend Connection Status Badge */}
        <div className="flex items-center">
          {isConnected ? (
            <Badge variant="success" size="sm" className="hidden sm:flex">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>API Connected</span>
            </Badge>
          ) : (
            <Badge variant="danger" size="sm" className="hidden sm:flex">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Offline</span>
            </Badge>
          )}
        </div>

        {/* New Chat Button */}
        <button
          onClick={onNewChat}
          className="p-2 sm:px-3 sm:py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-medium border border-slate-700 transition-all flex items-center gap-1.5 shadow-sm"
          title="Start fresh conversation"
        >
          <Plus className="w-4 h-4 text-cyan-400" />
          <span className="hidden sm:inline">New Chat</span>
        </button>

        {/* Sources Panel Toggle Button */}
        <button
          onClick={toggleSourcesPanel}
          className={`p-2 rounded-lg border text-xs font-medium transition-all flex items-center gap-1.5 ${
            isSourcesOpen 
              ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-400' 
              : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700'
          }`}
          title="Toggle Source Document Cards"
        >
          <Layers className="w-4 h-4" />
          <span className="hidden md:inline">Sources</span>
          {hasSources && (
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          )}
        </button>
      </div>
    </header>
  );
};
