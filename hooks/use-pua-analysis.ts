"use client";

import { useState } from "react";
import { 
  PUAAnalysis, 
  PUACategory, 
  PUAResponse, 
  ResponseStyle 
} from "@/types/pua";
import { analyzePUAText as aiAnalyze } from "@/lib/deepseek";

export function usePUAAnalysis() {
  const [analysis, setAnalysis] = useState<PUAAnalysis | null>(null);
  const [responses, setResponses] = useState<PUAResponse[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyzePUAText = async (text: string) => {
    if (!text.trim()) return;
    
    setIsAnalyzing(true);
    
    try {
      const aiResult = await aiAnalyze(text);
      
      const result: PUAAnalysis = {
        originalText: text,
        category: aiResult.category as PUACategory,
        severity: aiResult.severity,
        puaTechniques: aiResult.puaTechniques,
        analysis: aiResult.analysis,
        keywords: aiResult.puaTechniques, // 使用PUA技巧作为关键词
        explanation: aiResult.analysis
      };
      
      setAnalysis(result);
      
      // 根据PUA严重程度调整回应说明
      const getSeverityDescription = (severity: number) => {
        if (severity <= 3) return "轻度PUA - 温和但明确地设立界限";
        if (severity <= 7) return "中度PUA - 坚定地拒绝操控";
        return "重度PUA - 强硬反击，保护心理健康";
      };
      
      // 转换AI的回应为前端需要的格式
      const generatedResponses: PUAResponse[] = [
        {
          text: aiResult.responses.mild,
          style: "mild",
          explanation: "温和但坚定地表达自己的立场",
          scenario: aiResult.severity <= 3 ? "适合轻度PUA，保持关系和谐的同时设立界限" : "当你想保持关系友好，同时需要表达自己感受的时候"
        },
        {
          text: aiResult.responses.firm,
          style: "firm",
          explanation: "明确且直接地设立界限",
          scenario: aiResult.severity <= 7 ? "适合中度PUA，坚定地拒绝操控" : "当你需要明确表达界限，但仍愿意保持建设性对话时"
        },
        {
          text: aiResult.responses.analytical,
          style: "analytical",
          explanation: "理性分析并强硬反击",
          scenario: aiResult.severity >= 8 ? "适合重度PUA，强硬反击保护心理健康" : "适合在需要理性讨论问题时使用"
        }
      ];
      
      setResponses(generatedResponses);
    } catch (error) {
      console.error('回应生成失败:', error);
      setResponses([]);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return {
    analysis,
    responses,
    isAnalyzing,
    analyzePUAText
  };
}