import React, { useEffect, useState } from 'react';
import { ScanStep } from '../types';
import { ShieldCheck, Search, Database, Globe, Cpu } from 'lucide-react';

interface ScanVisualizationProps {
  onComplete: () => void;
}

const STEPS: ScanStep[] = [
  { id: 'upload', label: 'Initializing Secure Analysis Environment', status: 'pending' },
  { id: 'hash', label: 'Generating Content Fingerprints / Embeddings', status: 'pending' },
  { id: 'tineye', label: 'Querying Global Index & Reverse Search', status: 'pending' },
  { id: 'yandex', label: 'Cross-referencing Visual/Text Databases', status: 'pending' },
  { id: 'meta', label: 'Analyzing Pattern & Metadata Anomalies', status: 'pending' },
  { id: 'gemini', label: 'Synthesizing Forensic Report (Gemini AI)', status: 'pending' },
];

export const ScanVisualization: React.FC<ScanVisualizationProps> = ({ onComplete }) => {
  const [steps, setSteps] = useState<ScanStep[]>(STEPS);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    if (currentStepIndex >= steps.length) {
      setTimeout(onComplete, 800); // Small delay after finish
      return;
    }

    // Set current step to active
    setSteps(prev => prev.map((s, i) => 
      i === currentStepIndex ? { ...s, status: 'active' } : s
    ));

    // Simulate duration for each step (randomized slightly)
    const duration = 600 + Math.random() * 800;

    const timer = setTimeout(() => {
      setSteps(prev => prev.map((s, i) => 
        i === currentStepIndex ? { ...s, status: 'complete' } : s
      ));
      setCurrentStepIndex(prev => prev + 1);
    }, duration);

    return () => clearTimeout(timer);
  }, [currentStepIndex, onComplete]);

  const getIcon = (id: string) => {
    switch (id) {
      case 'upload': return <ShieldCheck className="w-5 h-5" />;
      case 'hash': return <Cpu className="w-5 h-5" />;
      case 'tineye':
      case 'yandex': return <Search className="w-5 h-5" />;
      case 'meta': return <Database className="w-5 h-5" />;
      case 'gemini': return <Globe className="w-5 h-5" />;
      default: return <ShieldCheck className="w-5 h-5" />;
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-8 bg-slate-900/50 border border-slate-700 rounded-xl backdrop-blur-sm relative overflow-hidden">
        {/* Animated Background Scan Line */}
        <div className="scan-line absolute inset-0 pointer-events-none z-0"></div>

        <h2 className="text-xl font-mono text-brand-yellow mb-6 relative z-10 flex items-center gap-2">
           <Cpu className="animate-pulse" /> SYSTEM DIAGNOSTICS RUNNING...
        </h2>

        <div className="space-y-4 relative z-10">
          {steps.map((step, idx) => (
            <div key={step.id} className="flex items-center gap-4">
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center border transition-all duration-300
                ${step.status === 'complete' ? 'bg-brand-yellow/20 border-brand-yellow text-brand-yellow' : 
                  step.status === 'active' ? 'bg-slate-800 border-white/50 text-white animate-pulse' : 
                  'bg-slate-800 border-slate-700 text-slate-600'}
              `}>
                {getIcon(step.id)}
              </div>
              <div className="flex-1">
                <div className="flex justify-between text-sm font-mono mb-1">
                  <span className={step.status === 'pending' ? 'text-slate-500' : 'text-slate-200'}>
                    {step.label}
                  </span>
                  <span className={`
                    uppercase text-xs tracking-wider
                    ${step.status === 'complete' ? 'text-brand-yellow' : 
                      step.status === 'active' ? 'text-white' : 'text-slate-600'}
                  `}>
                    {step.status === 'active' ? 'PROCESSING' : step.status}
                  </span>
                </div>
                {/* Progress Bar for individual step */}
                <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                  <div className={`h-full bg-brand-yellow transition-all duration-1000 ease-out ${
                    step.status === 'complete' ? 'w-full' : 
                    step.status === 'active' ? 'w-1/2' : 'w-0'
                  }`} />
                </div>
              </div>
            </div>
          ))}
        </div>
    </div>
  );
};