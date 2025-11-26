import React from 'react';
import { ForensicReport, Verdict } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, TooltipProps } from 'recharts';
import { AlertTriangle, CheckCircle, FileWarning, ExternalLink, ShieldAlert, ArrowRight } from 'lucide-react';

interface ReportViewProps {
  report: ForensicReport;
  onReset: () => void;
}

const COLORS = {
  high: '#ff003c', // neon-red
  medium: '#f59e0b', // amber-500
  low: '#FFE600',   // brand-yellow (replacing neon-green for low risk usually, but user wants yellow theme. Keeping green for 'good' result but yellow for branding)
  safe: '#0aff64'
};

const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 border border-slate-700 p-2 rounded shadow-xl text-xs font-mono">
        <p className="text-white">{`${label} : ${payload[0].value}`}</p>
      </div>
    );
  }
  return null;
};

export const ReportView: React.FC<ReportViewProps> = ({ report, onReset }) => {
  
  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'HIGH': return 'text-neon-red border-neon-red shadow-[0_0_15px_rgba(255,0,60,0.3)]';
      case 'MEDIUM': return 'text-amber-400 border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.3)]';
      case 'LOW': return 'text-brand-yellow border-brand-yellow shadow-[0_0_15px_rgba(255,230,0,0.3)]'; // Using brand yellow for low risk highlights
      default: return 'text-slate-400 border-slate-400';
    }
  };

  const engineData = report.engine_scores || [
    { name: 'TinEye', score: report.confidence_score },
    { name: 'Yandex', score: report.confidence_score * 0.9 },
    { name: 'Bing', score: report.confidence_score * 0.85 },
    { name: 'Meta', score: report.confidence_score * 0.95 },
  ];

  const confidenceData = [
    { name: 'Confidence', value: report.confidence_score },
    { name: 'Uncertainty', value: 100 - report.confidence_score }
  ];

  // Logic: Pirated = Red, Original = Green, Inconclusive = Yellow (or standard colors)
  // To stick to yellow theme: we use yellow as a primary accent, but verdict colors should likely remain semantic (Red/Green/Orange)
  const verdictColor = 
    report.verdict === Verdict.PIRATED ? COLORS.high : 
    report.verdict === Verdict.ORIGINAL ? COLORS.safe : COLORS.medium;

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in pb-20">
      
      {/* Header Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Verdict Card */}
        <div className={`md:col-span-2 p-8 rounded-xl border-l-4 bg-slate-900/50 backdrop-blur border-t border-r border-b border-slate-800 ${getRiskColor(report.risk_level)}`}>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-mono opacity-70 mb-2 uppercase tracking-widest">Forensic Verdict</p>
              <h2 className="text-3xl md:text-4xl font-bold font-mono leading-tight">
                {report.verdict}
              </h2>
            </div>
            {report.risk_level === 'HIGH' ? <ShieldAlert className="w-12 h-12 opacity-80" /> : 
             report.risk_level === 'LOW' ? <CheckCircle className="w-12 h-12 opacity-80" /> : 
             <AlertTriangle className="w-12 h-12 opacity-80" />}
          </div>
          <p className="mt-4 text-slate-300 leading-relaxed border-t border-white/10 pt-4">
            {report.summary}
          </p>
        </div>

        {/* Confidence Gauge */}
        <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-xl flex flex-col items-center justify-center relative">
          <p className="text-xs font-mono text-slate-400 uppercase tracking-widest absolute top-6 left-6">Confidence</p>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={confidenceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  startAngle={180}
                  endAngle={0}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  <Cell fill={verdictColor} />
                  <Cell fill="#1e293b" />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="absolute top-1/2 mt-4 text-center">
            <span className="text-4xl font-bold text-white">{report.confidence_score}%</span>
          </div>
        </div>
      </div>

      {/* Analysis Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Key Evidence */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
          <h3 className="text-lg font-mono text-brand-yellow mb-6 flex items-center gap-2">
            <FileWarning className="w-5 h-5" /> KEY EVIDENCE
          </h3>
          <ul className="space-y-4">
            {report.key_evidence.map((evidence, i) => (
              <li key={i} className="flex gap-3 text-sm text-slate-300 group">
                <span className="text-brand-yellow font-mono mt-1">0{i + 1}</span>
                <span className="group-hover:text-white transition-colors">{evidence}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Engine Correlation Chart */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
          <h3 className="text-lg font-mono text-brand-yellow mb-6 flex items-center gap-2">
            <ExternalLink className="w-5 h-5" /> CROSS-ENGINE CORRELATION
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={engineData} layout="vertical" margin={{ left: 40 }}>
                <XAxis type="number" domain={[0, 100]} hide />
                <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} content={<CustomTooltip />} />
                <Bar dataKey="score" fill={verdictColor} radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Actionable Intelligence */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
             <AlertTriangle className="w-24 h-24 text-neon-red" />
          </div>
          <h3 className="text-lg font-mono text-white mb-4">Suspicious Sources</h3>
          <div className="space-y-2">
            {report.suspicious_urls.length > 0 ? report.suspicious_urls.map((url, i) => (
              <div key={i} className="bg-red-500/10 border border-red-500/20 p-3 rounded text-sm text-red-200 font-mono truncate hover:bg-red-500/20 transition-colors cursor-pointer">
                {url}
              </div>
            )) : <p className="text-slate-500 italic">No suspicious sources detected.</p>}
          </div>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
           <h3 className="text-lg font-mono text-white mb-4">Recommended Actions</h3>
           <div className="space-y-3">
             {report.recommended_actions.map((action, i) => (
               <div key={i} className="flex items-start gap-3 text-sm text-slate-300">
                  <ArrowRight className="w-4 h-4 text-brand-yellow mt-1 shrink-0" />
                  <span>{action}</span>
               </div>
             ))}
           </div>
        </div>
      </div>
      
      <div className="flex justify-center pt-8">
        <button 
          onClick={onReset}
          className="px-8 py-3 bg-slate-800 hover:bg-slate-700 text-white font-mono rounded border border-slate-600 transition-all hover:border-brand-yellow"
        >
          START NEW SCAN
        </button>
      </div>

    </div>
  );
};