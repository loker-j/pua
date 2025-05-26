export type PUACategory = "Guilt-tripping" | "Love bombing" | "Gaslighting" | "Isolation tactics" | "Negging" | "workplace" | "relationship" | "family" | "general";

export type ResponseStyle = "mild" | "firm" | "analytical";

export interface PUAAnalysis {
  originalText: string;
  category: PUACategory;
  severity: number; // 1-10
  puaTechniques: string[]; // 识别出的PUA技巧
  analysis: string; // AI分析说明
  keywords: string[];
  explanation: string;
}

export interface PUAResponse {
  text: string;
  style: ResponseStyle;
  explanation: string;
  scenario: string;
}

export interface PUARecord {
  id: string;
  originalText: string;
  category: PUACategory;
  severity: number;
  selectedResponse: string | null;
  timestamp: number;
  isFavorite: boolean;
}

export interface TrainingScenario {
  id: string;
  situation: string;
  puaText: string;
  category: PUACategory;
  difficulty: "easy" | "medium" | "hard";
  tips: string[];
  idealResponsePoints: string[];
}

export interface TrainingProgress {
  completedScenarios: string[];
  totalScore: number;
  lastTrainingDate: number;
  weakAreas: PUACategory[];
}