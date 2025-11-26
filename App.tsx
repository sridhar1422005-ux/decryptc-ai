import React, { useState, useRef } from 'react';
import { AppState, ForensicReport } from './types';
import { analyzeAsset } from './services/geminiService';
import { ScanVisualization } from './components/ScanVisualization';
import { ReportView } from './components/ReportView';
import { 
  Upload, FileImage, Shield, Link as LinkIcon, FileText, Video, File, Globe, 
  FileCode, PlayCircle, Image as ImageIcon, FileType, UploadCloud
} from 'lucide-react';

type InputMode = 'file' | 'url';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [inputMode, setInputMode] = useState<InputMode>('file');
  
  // File State
  const [file, setFile] = useState<File | null>(null);
  
  // URL State
  const [urlInput, setUrlInput] = useState('');

  const [report, setReport] = useState<ForensicReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      // Validate file size (e.g. 50MB limit for demo)
      if (e.target.files[0].size > 50 * 1024 * 1024) {
        alert("File too large. Please upload a file smaller than 50MB.");
        return;
      }
      setFile(e.target.files[0]);
    }
  };

  const startScan = async () => {
    const asset = inputMode === 'url' ? urlInput : file;
    if (!asset) return;
    
    setAppState(AppState.SCANNING);
    setError(null);

    try {
      const data = await analyzeAsset(asset);
      setReport(data);
    } catch (err) {
      console.error(err);
      setError("Failed to generate report. Please try again.");
      setAppState(AppState.ERROR);
    }
  };

  const onScanComplete = () => {
    if (report) {
      setAppState(AppState.REPORT_READY);
    }
  };

  const resetApp = () => {
    setAppState(AppState.IDLE);
    setFile(null);
    setUrlInput('');
    setReport(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Combined accept attribute for all file types
  const getAcceptAttribute = () => {
    return 'image/*,video/*,application/pdf,.doc,.docx,.odt,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain,text/csv,text/markdown,.txt,.md,.json';
  };

  const renderNavButton = (mode: InputMode, icon: React.ReactNode, label: string) => (
    <button 
      onClick={() => { setInputMode(mode); setFile(null); setUrlInput(''); }}
      className={`
        flex-1 px-6 py-3 rounded-md font-mono text-sm transition-all flex items-center justify-center gap-2 whitespace-nowrap
        ${inputMode === mode ? 'bg-slate-800 text-white shadow-[0_0_10px_rgba(0,240,255,0.1)] border border-slate-700' : 'text-slate-500 hover:text-slate-300'}
      `}
    >
      {icon} <span>{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen font-sans selection:bg-neon-blue selection:text-slate-900">
      {/* Sticky Header */}
      <nav className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={resetApp}>
            <Shield className="w-6 h-6 text-neon-blue" />
            <span className="font-mono font-bold text-xl tracking-tighter text-white">
              DECRYPTC <span className="text-neon-blue">//</span> SENTINEL
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs font-mono text-slate-500 hidden sm:inline-block">V3.1.0-OMNI</span>
            <div className="w-2 h-2 rounded-full bg-neon-green animate-pulse"></div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {appState === AppState.IDLE && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in-up">
            <div className="text-center mb-10 max-w-2xl">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
                AI Forensic Piracy Scanner
              </h1>
              <p className="text-slate-400 text-lg">
                Multi-modal analysis for Images, Videos, Documents, Text, and Web Links to detect unauthorized usage.
              </p>
            </div>

            {/* Input Toggle Tabs - Just two now */}
            <div className="flex w-full max-w-md bg-slate-900 p-1.5 rounded-lg border border-slate-700 mb-8 gap-1">
              {renderNavButton('file', <UploadCloud className="w-4 h-4" />, 'UPLOAD ASSET')}
              {renderNavButton('url', <LinkIcon className="w-4 h-4" />, 'ANALYZE URL')}
            </div>

            {/* Input Area */}
            <div className="w-full max-w-xl animate-fade-in">
              {inputMode === 'url' ? (
                <div className="w-full h-72 border-2 border-dashed border-slate-700 rounded-2xl flex flex-col items-center justify-center bg-slate-900/50 p-8 hover:border-slate-600 transition-colors">
                  <div className="w-full max-w-md space-y-6 text-center">
                    <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto">
                        <Globe className="w-8 h-8 text-neon-blue" />
                    </div>
                    <div className="relative">
                      <input 
                        type="text" 
                        value={urlInput}
                        onChange={(e) => setUrlInput(e.target.value)}
                        placeholder="Paste suspicious URL here..."
                        className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-neon-blue font-mono text-sm"
                      />
                    </div>
                    <p className="text-slate-500 text-xs px-4">
                      Deep crawl for piracy signatures on streaming sites, marketplaces, cloud storage, or social media.
                    </p>
                  </div>
                </div>
              ) : (
                <div 
                  className={`
                    w-full h-72 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center
                    transition-all duration-300 cursor-pointer relative overflow-hidden group
                    ${file ? 'border-neon-blue bg-neon-blue/5' : 'border-slate-700 hover:border-slate-500 hover:bg-slate-900'}
                  `}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    className="hidden" 
                    accept={getAcceptAttribute()}
                  />
                  
                  {file ? (
                    <div className="text-center z-10 px-6">
                      <div className="w-16 h-16 bg-slate-800/80 rounded-full flex items-center justify-center mx-auto mb-4 border border-neon-blue/30">
                        {file.type.startsWith('image') ? <ImageIcon className="w-8 h-8 text-neon-blue" /> :
                         file.type.startsWith('video') ? <PlayCircle className="w-8 h-8 text-neon-blue" /> :
                         file.type.includes('pdf') ? <FileText className="w-8 h-8 text-neon-blue" /> :
                         <File className="w-8 h-8 text-neon-blue" />}
                      </div>
                      
                      <p className="text-white font-mono text-lg truncate max-w-xs mx-auto mb-1">{file.name}</p>
                      <p className="text-slate-500 text-xs font-mono uppercase tracking-wider">
                        {file.type || file.name.split('.').pop()?.toUpperCase() || 'UNKNOWN'} • {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                      <p className="text-neon-blue text-xs mt-4 font-mono animate-pulse">
                        READY FOR SCAN
                      </p>
                    </div>
                  ) : (
                    <div className="text-center px-6 z-10">
                      <div className="flex justify-center gap-3 mb-6 opacity-60 group-hover:opacity-100 transition-opacity">
                        <ImageIcon className="w-6 h-6 text-slate-400" />
                        <PlayCircle className="w-6 h-6 text-slate-400" />
                        <FileText className="w-6 h-6 text-slate-400" />
                        <FileType className="w-6 h-6 text-slate-400" />
                      </div>
                      <p className="text-white font-medium text-lg mb-2">Drop Asset Here</p>
                      <p className="text-slate-500 text-sm max-w-[200px] mx-auto leading-relaxed">
                        Support for Images, Videos, PDFs, Docs & Text
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Scan Button */}
            {(file || (inputMode === 'url' && urlInput)) && (
              <button 
                onClick={startScan}
                className="mt-8 px-10 py-4 bg-neon-blue hover:bg-cyan-400 text-slate-900 font-bold rounded-lg shadow-[0_0_20px_rgba(0,240,255,0.3)] transition-all transform hover:scale-105 flex items-center gap-2 tracking-wide"
              >
                <Shield className="w-5 h-5" />
                INITIATE FORENSIC SCAN
              </button>
            )}
          </div>
        )}

        {appState === AppState.SCANNING && (
          <div className="min-h-[60vh] flex flex-col items-center justify-center">
             <ScanVisualization onComplete={onScanComplete} />
          </div>
        )}

        {appState === AppState.REPORT_READY && report && (
          <ReportView report={report} onReset={resetApp} />
        )}

        {appState === AppState.ERROR && (
          <div className="text-center py-20">
             <div className="inline-block p-4 rounded-full bg-red-500/10 mb-4">
                <Shield className="w-12 h-12 text-red-500" />
             </div>
             <h2 className="text-2xl text-white font-bold mb-2">Analysis Failed</h2>
             <p className="text-slate-400 mb-6">{error || "An unknown error occurred."}</p>
             <button 
                onClick={resetApp}
                className="px-6 py-2 border border-slate-600 rounded text-slate-300 hover:text-white hover:border-white transition-colors"
             >
                Try Again
             </button>
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-600 text-sm font-mono">
          <p>© 2025 DECRYPTC INC. // SECURE TRANSMISSION ESTABLISHED</p>
        </div>
      </footer>
    </div>
  );
};

export default App;