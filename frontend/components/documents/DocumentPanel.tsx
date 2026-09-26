import React from 'react';
import { 
  FileText, 
  Upload, 
  CheckCircle2, 
  HardDrive, 
  Sparkles,
  Layers,
  ArrowRight
} from 'lucide-react';
import { DocumentItem } from '@/lib/types';
import { Badge } from '../ui/Badge';

interface DocumentPanelProps {
  documents: DocumentItem[];
  activeDocument: string;
  onSelectDocument: (filename: string) => void;
  onOpenUpload: () => void;
  isLoading: boolean;
}

export const DocumentPanel: React.FC<DocumentPanelProps> = ({
  documents,
  activeDocument,
  onSelectDocument,
  onOpenUpload,
  isLoading
}) => {
  return (
    <div className="flex-1 p-6 max-w-5xl mx-auto w-full overflow-y-auto">
      {/* Header Banner */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40 border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl font-bold text-slate-100">Document Manager</h2>
            <Badge variant="purple" size="sm">FAISS Vector Storage</Badge>
          </div>
          <p className="text-xs text-slate-400 max-w-lg">
            Manage PDF documents for retrieval augmented generation. Select any indexed document to activate its vector embeddings.
          </p>
        </div>

        <button
          onClick={onOpenUpload}
          className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-semibold text-xs shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-2"
        >
          <Upload className="w-4 h-4" />
          <span>Upload New PDF</span>
        </button>
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {documents.map((doc, idx) => {
          const isActive = doc.filename === activeDocument;

          return (
            <div
              key={idx}
              className={`p-5 rounded-2xl border transition-all flex flex-col justify-between gap-4 shadow-sm ${
                isActive
                  ? 'bg-slate-900/90 border-cyan-500/50 shadow-cyan-500/10'
                  : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    isActive
                      ? 'bg-cyan-500/10 border border-cyan-500/30 text-cyan-400'
                      : 'bg-slate-800 border border-slate-700 text-slate-400'
                  }`}>
                    <FileText className="w-5 h-5" />
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-slate-200 truncate max-w-[220px]">
                      {doc.filename}
                    </h3>
                    <p className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                      <span>{doc.size_mb} MB</span>
                      <span>•</span>
                      <span>PDF Document</span>
                    </p>
                  </div>
                </div>

                <Badge variant={isActive ? 'success' : 'info'} size="sm">
                  {isActive ? (
                    <>
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Active Index</span>
                    </>
                  ) : (
                    <span>Available</span>
                  )}
                </Badge>
              </div>

              {/* Action */}
              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-[11px] text-slate-500 font-mono">
                  FAISS RecursiveSplitter
                </span>

                {isActive ? (
                  <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Currently In Use
                  </span>
                ) : (
                  <button
                    onClick={() => onSelectDocument(doc.filename)}
                    disabled={isLoading}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 text-xs font-semibold border border-slate-700 transition-colors flex items-center gap-1"
                  >
                    <span>Activate Document</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
