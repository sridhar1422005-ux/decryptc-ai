export enum AppState {
  IDLE = 'IDLE',
  SCANNING = 'SCANNING',
  REPORT_READY = 'REPORT_READY',
  ERROR = 'ERROR'
}

export enum Verdict {
  ORIGINAL = "LIKELY ORIGINAL / AUTHENTIC",
  PIRATED = "LIKELY PIRATED / UNAUTHORIZED COPY",
  INCONCLUSIVE = "INCONCLUSIVE – MORE DATA NEEDED"
}

export interface EngineScore {
  name: string;
  score: number; // 0-100
}

export interface ForensicReport {
  case_id: string;
  verdict: Verdict;
  confidence_score: number;
  summary: string;
  key_evidence: string[];
  risk_level: "LOW" | "MEDIUM" | "HIGH";
  suspicious_urls: string[];
  probable_original_sources: string[];
  data_gaps: string[];
  recommended_actions: string[];
  engine_scores?: EngineScore[]; // Added for visualization
}

export interface ScanStep {
  id: string;
  label: string;
  status: 'pending' | 'active' | 'complete';
}
