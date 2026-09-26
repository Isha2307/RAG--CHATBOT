import React, { useState, useRef } from 'react';
import { Upload, X, FileText, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import { LoadingSpinner } from '../ui/LoadingSpinner';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (file: File) => Promise<void>;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  onUpload
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'processing' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      if (!selected.name.endsWith('.pdf')) {
        setErrorMessage('Only PDF files are supported by the RAG engine.');
        return;
      }
      setFile(selected);
      setErrorMessage(null);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const selected = e.dataTransfer.files[0];
      if (!selected.name.endsWith('.pdf')) {
        setErrorMessage('Only PDF files are supported by the RAG engine.');
        return;
      }
      setFile(selected);
      setErrorMessage(null);
    }
  };

  const handleStartUpload = async () => {
    if (!file) return;
    try {
      setStatus('uploading');
      setTimeout(() => setStatus('processing'), 800);

      await onUpload(file);
      setStatus('success');
      setTimeout(() => {
        onClose();
        setStatus('idle');
        setFile(null);
      }, 1200);
    } catch (err: any) {
      setStatus('error');
      setErrorMessage(err.message || 'Processing failed. Please check the PDF file.');
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Upload className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-100">Upload PDF Document</h3>
              <p className="text-xs text-slate-400">FAISS Indexing & Text Splitting</p>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={status === 'uploading' || status === 'processing'}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 flex flex-col gap-4">
          {/* Dropzone */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 ${
              file
                ? 'border-cyan-500/60 bg-cyan-500/5'
                : 'border-slate-800 hover:border-slate-700 bg-slate-950/40 hover:bg-slate-950/80'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept=".pdf"
              className="hidden"
            />

            <div className="w-12 h-12 rounded-full bg-slate-800/80 border border-slate-700 flex items-center justify-center">
              <FileText className="w-6 h-6 text-cyan-400" />
            </div>

            {file ? (
              <div>
                <p className="text-xs font-bold text-slate-200 truncate max-w-[240px]">{file.name}</p>
                <p className="text-[11px] text-slate-400">{(file.size / (1024 * 1024)).toFixed(2)} MB PDF</p>
              </div>
            ) : (
              <div>
                <p className="text-xs font-bold text-slate-200">Click or Drag & Drop PDF here</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Only .pdf format supported</p>
              </div>
            )}
          </div>

          {/* Status Message / Error Banner */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Flow Progress indicator */}
          {status !== 'idle' && (
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                {status === 'uploading' && <LoadingSpinner size="sm" />}
                {status === 'processing' && <LoadingSpinner size="sm" />}
                {status === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                {status === 'error' && <AlertCircle className="w-4 h-4 text-rose-400" />}

                <span className="font-medium text-slate-200 capitalize">
                  {status === 'uploading' && 'Uploading document...'}
                  {status === 'processing' && 'Processing & Indexing chunks in FAISS...'}
                  {status === 'success' && 'Document ready for Q&A!'}
                  {status === 'error' && 'Processing failed'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/50 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            disabled={status === 'uploading' || status === 'processing'}
            className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>

          <button
            onClick={handleStartUpload}
            disabled={!file || status === 'uploading' || status === 'processing'}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md ${
              file && status !== 'uploading' && status !== 'processing'
                ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white shadow-cyan-500/20'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            {status === 'uploading' || status === 'processing' ? 'Indexing...' : 'Upload & Process'}
          </button>
        </div>
      </div>
    </div>
  );
};
