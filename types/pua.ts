export type PUACategory = "Guilt-tripping" | "Love bombing" | "Gaslighting" | "Isolation tactics" | "Negging" | "workplace" | "relationship" | "family" | "general";

export type ResponseStyle = "mild" | "firm" | "analytical";

export type TrainingMode = "multiple-choice" | "fill-in-blank";

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

// 选择题选项
export interface MultipleChoiceOption {
  id: string;
  text: string;
  score: number; // 1-10分
  explanation: string; // 选择这个选项的解释
  isCorrect: boolean; // 是否是最佳答案
}

// 选择题训练场景
export interface MultipleChoiceScenario {
  id: string;
  situation: string;
  puaText: string;
  category: PUACategory;
  difficulty: "easy" | "medium" | "hard";
  question: string; // 问题描述
  options: MultipleChoiceOption[];
  tips: string[];
  explanation: string; // 场景解释
}

// 填空题训练场景
export interface FillInBlankScenario {
  id: string;
  situation: string;
  puaText: string;
  category: PUACategory;
  difficulty: "easy" | "medium" | "hard";
  tips: string[];
  idealResponsePoints: string[];
  standardAnswer: string; // 预设的标准答案
  answerExplanation: string; // 标准答案的解释
}

// 统一的训练场景类型
export type TrainingScenario = MultipleChoiceScenario | FillInBlankScenario;

export interface TrainingProgress {
  completedScenarios: string[];
  totalScore: number;
  lastTrainingDate: number;
  weakAreas: PUACategory[];
  multipleChoiceStats: {
    totalAttempts: number;
    correctAnswers: number;
    averageScore: number;
  };
  fillInBlankStats: {
    totalAttempts: number;
    averageScore: number;
    improvementTrend: number[]; // 最近10次的分数趋势
  };
}