"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, AlertTriangle, Info } from "lucide-react";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { usePUAAnalysis } from "@/hooks/use-pua-analysis";
import { PUARecord, PUAResponse } from "@/types/pua";
import { UserPreferences } from "@/types/user";
import { ResponseCard } from "@/components/response-card";
import { SeverityMeter } from "@/components/severity-meter";

interface PUAAnalyzerProps {
  userPreferences: UserPreferences;
}

export function PUAAnalyzer({ userPreferences }: PUAAnalyzerProps) {
  const [input, setInput] = useState("");
  const [records, setRecords] = useLocalStorage<PUARecord[]>("puaRecords", []);
  const { analysis, responses, isAnalyzing, isGeneratingResponses, analyzePUAText } = usePUAAnalysis();
  const [selectedResponse, setSelectedResponse] = useState<PUAResponse | null>(null);

  const handleAnalyze = () => {
    if (!input.trim()) return;
    analyzePUAText(input);
  };

  const handleSaveRecord = () => {
    if (!analysis) return;
    
    const newRecord: PUARecord = {
      id: Date.now().toString(),
      originalText: analysis.originalText,
      category: analysis.category,
      severity: analysis.severity,
      selectedResponse: selectedResponse?.text || null,
      timestamp: Date.now(),
      isFavorite: false,
    };
    
    const updatedRecords = [newRecord, ...records]
      .slice(0, userPreferences.historyLength);
    
    setRecords(updatedRecords);
    setInput("");
    setSelectedResponse(null);
  };

  const handleSelectResponse = (response: PUAResponse) => {
    setSelectedResponse(response);
  };

  const getCategoryLabel = (category: string) => {
    if (userPreferences.language === "zh") {
      switch (category) {
        case "workplace": return "职场";
        case "relationship": return "感情";
        case "family": return "家庭";
        case "general": return "通用";
        default: return category;
      }
    }
    return category.charAt(0).toUpperCase() + category.slice(1);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid gap-6 md:grid-cols-2">
        {/* Input Section */}
        <Card>
          <CardHeader>
            <CardTitle>
              {userPreferences.language === "zh" ? "PUA 分析器" : "PUA Analyzer"}
            </CardTitle>
            <CardDescription>
              {userPreferences.language === "zh" 
                ? "输入文本以分析操控性语言模式"
                : "Enter text to analyze for manipulative language patterns"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder={userPreferences.language === "zh"
                ? "输入您想要分析的消息或陈述..."
                : "Enter the message or statement you want to analyze..."}
              className="min-h-[200px] mb-4"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <Button 
              onClick={handleAnalyze} 
              className="w-full"
              disabled={isAnalyzing || !input.trim()}
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {userPreferences.language === "zh" ? "分析中..." : "Analyzing..."}
                </>
              ) : (
                userPreferences.language === "zh" ? "分析文本" : "Analyze Text"
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Analysis Results */}
        <Card>
          <CardHeader>
            <CardTitle>
              {userPreferences.language === "zh" ? "分析结果" : "Analysis Results"}
            </CardTitle>
            <CardDescription>
              {analysis 
                ? (userPreferences.language === "zh" 
                    ? "以下是我们在您提供的文本中发现的内容"
                    : "Here's what we found in the text you provided")
                : (userPreferences.language === "zh"
                    ? "您的分析结果将在此显示"
                    : "Your analysis results will appear here")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isAnalyzing ? (
              <div className="flex flex-col items-center justify-center min-h-[200px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
                <p className="text-muted-foreground">
                  {userPreferences.language === "zh" 
                    ? "正在分析文本模式..."
                    : "Analyzing text patterns..."}
                </p>
              </div>
            ) : analysis ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium">
                      {userPreferences.language === "zh" ? "类别：" : "Category:"}
                    </h3>
                    <Badge variant="outline" className="capitalize">
                      {getCategoryLabel(analysis.category)}
                    </Badge>
                  </div>
                  
                  <div className="space-y-1">
                    <h3 className="font-medium">
                      {userPreferences.language === "zh" ? "严重程度：" : "Severity:"}
                    </h3>
                    <SeverityMeter severity={analysis.severity} language={userPreferences.language} />
                  </div>

                  {/* PUA技巧识别 */}
                  {analysis.puaTechniques && analysis.puaTechniques.length > 0 && (
                    <div className="space-y-1 mt-4">
                      <h3 className="font-medium">
                        {userPreferences.language === "zh" ? "识别的PUA技巧：" : "Identified PUA Techniques:"}
                      </h3>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {analysis.puaTechniques.map((technique, i) => (
                          <Badge key={i} variant="destructive" className="text-xs">
                            {technique}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="space-y-1 mt-4">
                    <h3 className="font-medium">
                      {userPreferences.language === "zh" ? "检测到的关键模式：" : "Key patterns detected:"}
                    </h3>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {analysis.keywords.map((keyword, i) => (
                        <Badge key={i} variant="secondary" className="capitalize">
                          {userPreferences.language === "zh" 
                            ? keyword.replace("workplace", "职场")
                                   .replace("relationship", "感情")
                                   .replace("family", "家庭")
                                   .replace("general", "通用")
                                   .replace("pressure", "压力")
                                   .replace("comparison", "比较")
                                   .replace("manipulation", "操控")
                            : keyword}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* AI分析说明 */}
                  <div className="mt-4 p-3 bg-muted rounded-md">
                    <div className="flex items-start gap-2">
                      <Info className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <h4 className="font-medium text-sm mb-1">
                          {userPreferences.language === "zh" ? "AI分析：" : "AI Analysis:"}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {analysis.analysis || analysis.explanation}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center min-h-[200px] text-muted-foreground">
                <Info className="h-12 w-12 mb-2 text-muted" />
                <h3 className="text-lg font-medium mb-1">
                  {userPreferences.language === "zh" ? "暂无分析" : "No Analysis Yet"}
                </h3>
                <p className="text-sm">
                  {userPreferences.language === "zh"
                    ? "在分析器中输入消息以查看结果"
                    : "Enter a message in the analyzer to see results"}
                </p>
              </div>
            )}
          </CardContent>
          {analysis && (
            <CardFooter>
              <Button
                variant="outline"
                className="w-full"
                onClick={handleSaveRecord}
                disabled={!analysis}
              >
                {userPreferences.language === "zh"
                  ? "保存分析到历史记录"
                  : "Save Analysis to History"}
              </Button>
            </CardFooter>
          )}
        </Card>
      </div>

      {/* Response Options */}
      {(responses.length > 0 || isGeneratingResponses) && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold">
            {userPreferences.language === "zh" ? "建议回应" : "Suggested Responses"}
          </h2>
          <p className="text-muted-foreground">
            {userPreferences.language === "zh"
              ? "选择适合您情况的回应方式。每个选项提供不同的处理方法。"
              : "Select a response style that fits your situation. Each option offers a different approach."}
          </p>
          
          {isGeneratingResponses ? (
            <div className="flex flex-col items-center justify-center min-h-[200px]">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
              <p className="text-muted-foreground">
                {userPreferences.language === "zh" 
                  ? "正在生成回应建议..."
                  : "Generating response suggestions..."}
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-3">
              {responses.map((response, index) => (
                <ResponseCard 
                  key={index}
                  response={response}
                  isSelected={selectedResponse?.text === response.text}
                  onSelect={() => handleSelectResponse(response)}
                  language={userPreferences.language}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Warning for high severity */}
      {analysis && analysis.severity >= 8 && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-destructive mt-0.5 shrink-0" />
          <div>
            <h3 className="font-medium text-destructive">
              {userPreferences.language === "zh" ? "高严重度警告" : "High Severity Warning"}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              {userPreferences.language === "zh"
                ? "这种语言显示出严重的操控迹象。如果您经常遇到这种情况，请考虑寻求朋友、家人或专业人士的支持。"
                : "This language shows signs of serious manipulation. Consider seeking support from friends, family, or professionals if you're experiencing this regularly."}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}