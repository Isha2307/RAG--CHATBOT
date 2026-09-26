import React, { useState } from 'react';
import { 
  FileText, 
  Layers, 
  Sparkles, 
  ChevronRight, 
  ChevronDown, 
  Percent, 
  Info,
  X,
  BookOpen
} from 'lucide-react';
import { DocumentSource } from '@/lib/types';
import { Badge } from '../ui/Badge';

interface SourcesPanelProps {
  sources: DocumentSource[];
  activeDocument: string;
  isOpen: boolean;
  onClose: () => void;
  rewrittenQuery?: string;
}

export const SourcesPanel: React.FC<SourcesPanelProps> = ({
  sources,
  activeDocument,
  isOpen,
  onClose,
  rewrittenQuery
}) => {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  if (!isOpen) return null;

  return (
    <aside className="w-80 bg-slate-900 border-l border-slate-800 flex flex-col h-[calc(100vh-4rem)] sticky top-16 z-20 shadow-2xl transition-all duration-300">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-100 uppercase tracking-wider">
              RETRIEVED SOURCES
            </h3>
            <p className="text-xs text-slate-400">FAISS Similarity & Reranking</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Rewritten Query Info Box (if query was rewritten) */}
      {rewrittenQuery && (
        <div className="p-3 bg-indigo-950/30 border-b border-indigo-900/40">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-300 mb-1">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Semantic Expansion:</span>
          </div>
          <p className="text-xs text-indigo-200/80 italic bg-indigo-950/60 p-2 rounded-lg border border-indigo-900/50">
            "{rewrittenQuery}"
          </p>
        </div>
      )}

      {/* Active Document Info */}
      <div className="px-4 py-2.5 bg-slate-950/60 border-b border-slate-800/80 flex items-center justify-between text-xs">
        <span className="text-slate-400 font-medium">Indexed File:</span>
        <span className="font-semibold text-cyan-300 truncate max-w-[160px] flex items-center gap-1">
          <FileText className="w-3.5 h-3.5 text-cyan-400" />
          {activeDocument}
        </span>
      </div>

      {/* Content List */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
        {sources.length === 0 ? (
          <div className="py-12 text-center border border-dashed border-slate-800 rounded-xl px-4">
            <BookOpen className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-300">No Sources Available</p>
            <p className="text-xs text-slate-500 mt-1">
              Ask a question to view FAISS retrieved vector chunks & reranking confidence scores.
            </p>
          </div>
        ) : (
          sources.map((source, index) => {
            const isExpanded = expandedId === source.id;
            const getConfidenceColor = (score: number) => {
              if (score >= 80) return 'success';
              if (score >= 60) return 'info';
              return 'warning';
            };

            return (
              <div
                key={source.id || index}
                className="bg-slate-950/60 rounded-xl border border-slate-800 hover:border-slate-700 transition-all overflow-hidden shadow-sm"
              >
                {/* Source Card Header */}
                <div 
                  onClick={() => setExpandedId(isExpanded ? null : source.id)}
                  className="p-3 cursor-pointer flex items-center justify-between hover:bg-slate-850/50 transition-colors"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-5 h-5 rounded-md bg-slate-800 text-slate-300 font-bold text-xs flex items-center justify-center border border-slate-700">
                      {index + 1}
                    </span>
                    <div className="min-w-0">
                      <h4 className="text-xs font-semibold text-slate-200 truncate">
                        Chunk #{source.chunk_id || index + 1}
                      </h4>
                      <p className="text-[10px] text-slate-400 truncate">
                        {source.filename || activeDocument}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant={getConfidenceColor(source.confidence)} size="sm">
                      <span>{source.confidence}%</span>
                    </Badge>

                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                </div>

                {/* Preview / Snippet */}
                <div className="px-3 pb-3 pt-1 border-t border-slate-900">
                  <p className="text-xs text-slate-300 leading-relaxed font-mono bg-slate-900/90 p-2.5 rounded-lg border border-slate-800/80">
                    {isExpanded && source.full_content ? source.full_content : source.snippet}
                  </p>

                  <button
                    onClick={() => setExpandedId(isExpanded ? null : source.id)}
                    className="mt-2 text-[11px] font-semibold text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1"
                  >
                    {isExpanded ? 'Show preview' : 'View full chunk text'}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer Info */}
      <div className="p-3 bg-slate-950/80 border-t border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
        <Info className="w-4 h-4 text-slate-500 flex-shrink-0" />
        <span>Scores generated by HuggingFace embeddings & Cross-Encoder.</span>
      </div>
    </aside>
  );
};
