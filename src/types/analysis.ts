export interface Issue {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'accessibility' | 'performance' | 'usability' | 'design';
  location?: {
    element?: string;
    selector?: string;
    coordinates?: { x: number; y: number; width: number; height: number };
    page?: string;
  };
  impact: string;
  recommendation: string;
  codeExample?: string;
}

export interface AnalysisDetails {
  accessibility: {
    score: number;
    issues: Issue[];
  };
  performance: {
    score: number;
    issues: Issue[];
  };
  usability: {
    score: number;
    issues: Issue[];
  };
  design: {
    score: number;
    issues: Issue[];
  };
}

export interface WebsiteAnalysis {
  url: string;
  score: number;
  strengths: string[];
  improvements: string[];
  recommendations: string[];
  details: AnalysisDetails;
  timestamp: string;
  screenshots?: {
    desktop?: string;
    mobile?: string;
  };
  metadata?: {
    pageTitle?: string;
    loadTime?: number;
    pageSize?: number;
    technologies?: string[];
  };
  fallbackReason?: string;
}

export interface AnalysisRequest {
  url: string;
} 