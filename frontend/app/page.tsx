'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  ChatMessage as ChatMessageType, 
  HealthStatus, 
  DocumentItem, 
  DocumentSource 
} from '@/lib/types';
import { 
  checkHealth, 
  fetchDocuments, 
  sendChatMessage, 
  uploadDocument, 
  selectDocument, 
  clearChatHistory 
} from '@/lib/api';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { SourcesPanel } from '@/components/layout/SourcesPanel';
import { ChatContainer } from '@/components/chat/ChatContainer';
import { DocumentPanel } from '@/components/documents/DocumentPanel';
import { UploadModal } from '@/components/documents/UploadModal';
import { AlertCircle, WifiOff } from 'lucide-react';

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'documents'>('chat');
  const [sourcesOpen, setSourcesOpen] = useState(true);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);

  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [activeSources, setActiveSources] = useState<DocumentSource[]>([]);
  const [rewrittenQuery, setRewrittenQuery] = useState<string | undefined>(undefined);
  const [historyQueries, setHistoryQueries] = useState<string[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Poll health and document list
  const refreshStatus = useCallback(async () => {
    const healthData = await checkHealth();
    setHealth(healthData);

    if (healthData.status !== 'offline') {
      try {
        const docsData = await fetchDocuments();
        setDocuments(docsData.documents);
      } catch {
        // Ignore doc list error if offline
      }
    }
  }, []);

  useEffect(() => {
    refreshStatus();
    const interval = setInterval(refreshStatus, 10000);
    return () => clearInterval(interval);
  }, [refreshStatus]);

  // Handle New Conversation
  const handleNewChat = async () => {
    setMessages([]);
    setActiveSources([]);
    setRewrittenQuery(undefined);
    try {
      await clearChatHistory();
      setHistoryQueries([]);
    } catch {
      // Ignore
    }
  };

  // Handle Clear Memory
  const handleClearHistory = async () => {
    setHistoryQueries([]);
    try {
      await clearChatHistory();
    } catch {
      // Ignore
    }
  };

  // Handle sending chat message
  const handleSendMessage = async (queryText: string) => {
    if (!queryText.trim()) return;

    setErrorMessage(null);
    const userMsg: ChatMessageType = {
      id: Date.now().toString(),
      sender: 'user',
      content: queryText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setHistoryQueries((prev) => Array.from(new Set([queryText, ...prev])));
    setIsLoading(true);

    try {
      const response = await sendChatMessage(queryText);

      const aiMsg: ChatMessageType = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        content: response.answer,
        rawContent: response.raw_answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sources: response.sources,
        rewrittenQuery: response.rewritten_query,
        activeDocument: response.active_document
      };

      setMessages((prev) => [...prev, aiMsg]);
      if (response.sources && response.sources.length > 0) {
        setActiveSources(response.sources);
        setRewrittenQuery(response.rewritten_query);
      }
      refreshStatus();
    } catch (err: any) {
      const errorMsg: ChatMessageType = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        content: `**Error:** ${err.message || 'Failed to connect to IntelliRAG backend server.'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isError: true
      };
      setMessages((prev) => [...prev, errorMsg]);
      setErrorMessage(err.message || 'Unable to connect to backend API server.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle document upload
  const handleUploadFile = async (file: File) => {
    setErrorMessage(null);
    const result = await uploadDocument(file);
    await refreshStatus();
    handleNewChat();
  };

  // Handle document selection
  const handleSelectDocument = async (filename: string) => {
    setIsLoading(true);
    try {
      await selectDocument(filename);
      await refreshStatus();
      handleNewChat();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to activate document');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Left Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onNewChat={handleNewChat}
        onClearHistory={handleClearHistory}
        health={health}
        historyQueries={historyQueries}
        onSelectHistoryQuery={handleSendMessage}
      />

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Top Header */}
        <Header
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          onNewChat={handleNewChat}
          health={health}
          toggleSourcesPanel={() => setSourcesOpen(!sourcesOpen)}
          isSourcesOpen={sourcesOpen}
          hasSources={activeSources.length > 0}
        />

        {/* Offline Banner */}
        {health?.status === 'offline' && (
          <div className="bg-rose-950/80 border-b border-rose-900 px-4 py-2 text-xs text-rose-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <WifiOff className="w-4 h-4 text-rose-400" />
              <span>
                <strong>Backend Unavailable:</strong> Unable to connect to backend at <code className="bg-rose-900/50 px-1 rounded">http://127.0.0.1:8000</code>. Please make sure FastAPI server is running.
              </span>
            </div>
            <button 
              onClick={refreshStatus}
              className="underline text-rose-300 hover:text-white"
            >
              Retry
            </button>
          </div>
        )}

        {/* Content View */}
        <div className="flex-1 flex min-w-0 overflow-hidden relative">
          {activeTab === 'chat' ? (
            <ChatContainer
              messages={messages}
              isLoading={isLoading}
              onSendMessage={handleSendMessage}
              activeDocument={health?.active_document || 'sample.pdf'}
              onOpenUpload={() => setUploadModalOpen(true)}
              onViewSources={(sources) => {
                if (sources) setActiveSources(sources);
                setSourcesOpen(true);
              }}
            />
          ) : (
            <DocumentPanel
              documents={documents}
              activeDocument={health?.active_document || 'sample.pdf'}
              onSelectDocument={handleSelectDocument}
              onOpenUpload={() => setUploadModalOpen(true)}
              isLoading={isLoading}
            />
          )}

          {/* Right Sources Drawer */}
          {activeTab === 'chat' && (
            <SourcesPanel
              sources={activeSources}
              activeDocument={health?.active_document || 'sample.pdf'}
              isOpen={sourcesOpen}
              onClose={() => setSourcesOpen(false)}
              rewrittenQuery={rewrittenQuery}
            />
          )}
        </div>
      </div>

      {/* Upload PDF Modal */}
      <UploadModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onUpload={handleUploadFile}
      />
    </div>
  );
}
