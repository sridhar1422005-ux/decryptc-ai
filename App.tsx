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
        ${inputMode === mode ? 'bg-brand-yellow text-black font-bold shadow-[0_0_15px_rgba(255,230,0,0.4)]' : 'text-slate-500 hover:text-brand-yellow border border-transparent hover:border-brand-yellow/30'}
      `}
    >
      {icon} <span>{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen font-sans selection:bg-brand-yellow selection:text-black bg-black relative">
      
      {/* Version Indicator - Absolute Top Right */}
      <div className="absolute top-6 right-6 flex items-center gap-4 z-50">
        <span className="text-xs font-mono text-slate-500 hidden sm:inline-block">V3.1.0-OMNI</span>
        <div className="w-2 h-2 rounded-full bg-brand-yellow animate-pulse"></div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {appState === AppState.IDLE && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in-up">
            <div className="text-center mb-10 max-w-2xl">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
                Decryptc - AI Forensic Piracy Scanner
              </h1>
              <p className="text-slate-400 text-lg">
                Multi-modal analysis for Images, Videos, Documents, Text, and Web Links to detect unauthorized usage.
              </p>
            </div>

            {/* Input Toggle Tabs - Just two now */}
            <div className="flex w-full max-w-md bg-slate-900 p-1.5 rounded-lg border border-slate-800 mb-8 gap-1">
              {renderNavButton('file', <UploadCloud className="w-4 h-4" />, 'UPLOAD ASSET')}
              {renderNavButton('url', <LinkIcon className="w-4 h-4" />, 'ANALYZE URL')}
            </div>

            {/* Input Area */}
            <div className="w-full max-w-xl animate-fade-in">
              {inputMode === 'url' ? (
                <div className="w-full h-72 border border-dashed border-slate-700 rounded-2xl flex flex-col items-center justify-center bg-slate-900/30 p-8 hover:border-brand-yellow/50 transition-colors group">
                  <div className="w-full max-w-md space-y-6 text-center">
                    <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center mx-auto border border-slate-800 group-hover:border-brand-yellow/50 transition-colors">
                        <Globe className="w-8 h-8 text-slate-400 group-hover:text-brand-yellow transition-colors" />
                    </div>
                    <div className="relative">
                      <input 
                        type="text" 
                        value={urlInput}
                        onChange={(e) => setUrlInput(e.target.value)}
                        placeholder="Paste suspicious URL here..."
                        className="w-full bg-black border border-slate-700 rounded-lg px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:border-brand-yellow font-mono text-sm"
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
                    w-full h-72 border border-dashed rounded-2xl flex flex-col items-center justify-center
                    transition-all duration-300 cursor-pointer relative overflow-hidden group
                    ${file ? 'border-brand-yellow bg-brand-yellow/5' : 'border-slate-700 hover:border-brand-yellow/50 hover:bg-slate-900/50'}
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
                      <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-4 border border-brand-yellow">
                        {file.type.startsWith('image') ? <ImageIcon className="w-8 h-8 text-brand-yellow" /> :
                         file.type.startsWith('video') ? <PlayCircle className="w-8 h-8 text-brand-yellow" /> :
                         file.type.includes('pdf') ? <FileText className="w-8 h-8 text-brand-yellow" /> :
                         <File className="w-8 h-8 text-brand-yellow" />
                        }
                      </div>
                      <p className="text-brand-yellow font-mono text-sm truncate max-w-[200px] mx-auto">{file.name}</p>
                      <p className="text-slate-500 text-xs mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  ) : (
                    <div className="text-center z-10 pointer-events-none">
                      <div className="flex gap-4 justify-center mb-6">
                         <ImageIcon className="w-6 h-6 text-slate-600 group-hover:text-slate-400 transition-colors" />
                         <PlayCircle className="w-6 h-6 text-slate-600 group-hover:text-slate-400 transition-colors" />
                         <FileText className="w-6 h-6 text-slate-600 group-hover:text-slate-400 transition-colors" />
                         <FileCode className="w-6 h-6 text-slate-600 group-hover:text-slate-400 transition-colors" />
                      </div>
                      <p className="text-slate-300 font-medium mb-2 group-hover:text-white transition-colors">Drop Asset Here</p>
                      <p className="text-slate-500 text-xs max-w-xs mx-auto">
                        Support for Images, Videos, PDFs, Docs & Text
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Action Button */}
              <div className="mt-8 flex justify-center">
                 <button
                   onClick={startScan}
                   disabled={inputMode === 'url' ? !urlInput : !file}
                   className={`
                     px-10 py-4 bg-brand-yellow text-black font-bold font-mono rounded-lg
                     transition-all duration-300 transform hover:scale-105 hover:shadow-[0_0_20px_rgba(255,230,0,0.5)]
                     disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none
                     flex items-center gap-3
                   `}
                 >
                   <Shield className="w-5 h-5" />
                   INITIATE FORENSIC SCAN
                 </button>
              </div>
            </div>

            {error && (
              <div className="mt-6 p-4 bg-red-500/10 border border-red-500/30 text-red-200 rounded text-sm max-w-md text-center">
                {error}
              </div>
            )}
          </div>
        )}

        {appState === AppState.SCANNING && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in">
             <ScanVisualization onComplete={onScanComplete} />
          </div>
        )}

        {appState === AppState.REPORT_READY && report && (
          <ReportView report={report} onReset={resetApp} />
        )}
        
        {appState === AppState.ERROR && !error && (
          <div className="text-center pt-20">
             <h2 className="text-2xl text-red-500 mb-4">System Error</h2>
             <button onClick={resetApp} className="text-slate-400 underline">Return to Dashboard</button>
          </div>
        )}

      </main>
    </div>
  );
};

export default App;