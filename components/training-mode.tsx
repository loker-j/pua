"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Brain, ArrowLeft } from "lucide-react";
import { UserPreferences } from "@/types/user";
import { TrainingProgress, MultipleChoiceScenario, FillInBlankScenario, TrainingMode as TrainingModeType } from "@/types/pua";
import { multipleChoiceScenarios, fillInBlankScenarios } from "@/data/training-scenarios";
import { useLocalStorage } from "@/hooks/use-local-storage";

interface TrainingModeProps {
  userPreferences: UserPreferences;
}

interface MultipleChoiceFeedback {
  selectedOptionId: string;
  score: number;
  explanation: string;
  isCorrect: boolean;
}

interface FillInBlankFeedback {
  score: number;
  strengths: string[];
  improvements: string[];
  suggestions: string;
  comparison: string;
}

export default function TrainingMode({ userPreferences }: TrainingModeProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [currentMode, setCurrentMode] = useState<TrainingModeType>("multiple-choice");
  const [currentMCScenario, setCurrentMCScenario] = useState<MultipleChoiceScenario | null>(null);
  const [currentFIBScenario, setCurrentFIBScenario] = useState<FillInBlankScenario | null>(null);
  const [mcFeedback, setMCFeedback] = useState<MultipleChoiceFeedback | null>(null);
  const [fibFeedback, setFibFeedback] = useState<FillInBlankFeedback | null>(null);
  const [userResponse, setUserResponse] = useState("");
  const [isCompleted, setIsCompleted] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  
  // 添加本地存储功能
  const [progress, setProgress] = useLocalStorage<TrainingProgress>("trainingProgress", {
    completedScenarios: [],
    totalScore: 0,
    lastTrainingDate: 0,
    weakAreas: [],
    multipleChoiceStats: {
      totalAttempts: 0,
      correctAnswers: 0,
      averageScore: 0
    },
    fillInBlankStats: {
      totalAttempts: 0,
      averageScore: 0,
      improvementTrend: []
    }
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const startMultipleChoiceTraining = (difficulty: "easy" | "medium" | "hard") => {
    if (!isMounted) return;
    
    // 优先选择未完成的场景
    const availableScenarios = multipleChoiceScenarios.filter(
      scenario => 
        scenario.difficulty === difficulty && 
        !(progress?.completedScenarios?.includes(scenario.id))
    );
    
    const scenariosToChooseFrom = availableScenarios.length > 0 
      ? availableScenarios 
      : multipleChoiceScenarios.filter(scenario => scenario.difficulty === difficulty);
    
    const randomScenario = scenariosToChooseFrom[
      Math.floor(Math.random() * scenariosToChooseFrom.length)
    ];
    
    setCurrentMCScenario(randomScenario);
    setCurrentFIBScenario(null);
    setMCFeedback(null);
    setIsCompleted(false);
  };

  const startFillInBlankTraining = (difficulty: "easy" | "medium" | "hard") => {
    if (!isMounted) return;
    
    const availableScenarios = fillInBlankScenarios.filter(
      scenario => 
        scenario.difficulty === difficulty && 
        !(progress?.completedScenarios?.includes(scenario.id))
    );
    
    const scenariosToChooseFrom = availableScenarios.length > 0 
      ? availableScenarios 
      : fillInBlankScenarios.filter(scenario => scenario.difficulty === difficulty);
    
    const randomScenario = scenariosToChooseFrom[
      Math.floor(Math.random() * scenariosToChooseFrom.length)
    ];
    
    setCurrentFIBScenario(randomScenario);
    setCurrentMCScenario(null);
    setMCFeedback(null);
    setFibFeedback(null);
    setUserResponse("");
    setIsCompleted(false);
    setIsEvaluating(false);
  };

  const handleMultipleChoiceAnswer = (optionId: string) => {
    if (!currentMCScenario || isCompleted) return;
    
    const selectedOption = currentMCScenario.options.find(opt => opt.id === optionId);
    if (!selectedOption) return;
    
    const feedback: MultipleChoiceFeedback = {
      selectedOptionId: optionId,
      score: selectedOption.score,
      explanation: selectedOption.explanation,
      isCorrect: selectedOption.isCorrect
    };
    
    setMCFeedback(feedback);
    setIsCompleted(true);
    
    // 更新进度
    if (!progress?.completedScenarios?.includes(currentMCScenario.id)) {
      const newProgress = {
        ...progress,
        completedScenarios: [...(progress?.completedScenarios || []), currentMCScenario.id],
        totalScore: (progress?.totalScore || 0) + selectedOption.score,
        lastTrainingDate: Date.now(),
        multipleChoiceStats: {
          totalAttempts: (progress?.multipleChoiceStats?.totalAttempts || 0) + 1,
          correctAnswers: (progress?.multipleChoiceStats?.correctAnswers || 0) + (selectedOption.isCorrect ? 1 : 0),
          averageScore: (((progress?.multipleChoiceStats?.averageScore || 0) * (progress?.multipleChoiceStats?.totalAttempts || 0)) + selectedOption.score) / ((progress?.multipleChoiceStats?.totalAttempts || 0) + 1)
        },
        fillInBlankStats: progress?.fillInBlankStats || {
          totalAttempts: 0,
          averageScore: 0,
          improvementTrend: []
        }
      };
      setProgress(newProgress);
    }
  };

  const handleFillInBlankAnswer = async (response: string) => {
    if (!currentFIBScenario || isCompleted || !response.trim() || isEvaluating) return;
    
    setIsEvaluating(true);
    
    try {
      // 调用AI评估API
      const evaluationResponse = await fetch('/api/training/evaluate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userAnswer: response,
          standardAnswer: currentFIBScenario.standardAnswer,
          idealResponsePoints: currentFIBScenario.idealResponsePoints,
          puaText: currentFIBScenario.puaText,
          category: currentFIBScenario.category,
          language: userPreferences.language
        }),
      });

      if (!evaluationResponse.ok) {
        throw new Error('评估请求失败');
      }

      const evaluation = await evaluationResponse.json();
      
      const feedback: FillInBlankFeedback = {
        score: evaluation.score,
        strengths: evaluation.strengths,
        improvements: evaluation.improvements,
        suggestions: evaluation.suggestions,
        comparison: evaluation.comparison
      };
      
      setFibFeedback(feedback);
      setIsCompleted(true);
      
      // 更新进度
      if (!progress?.completedScenarios?.includes(currentFIBScenario.id)) {
        const newProgress = {
          ...progress,
          completedScenarios: [...(progress?.completedScenarios || []), currentFIBScenario.id],
          totalScore: (progress?.totalScore || 0) + evaluation.score,
          lastTrainingDate: Date.now(),
          multipleChoiceStats: progress?.multipleChoiceStats || {
            totalAttempts: 0,
            correctAnswers: 0,
            averageScore: 0
          },
          fillInBlankStats: {
            totalAttempts: (progress?.fillInBlankStats?.totalAttempts || 0) + 1,
            averageScore: (((progress?.fillInBlankStats?.averageScore || 0) * (progress?.fillInBlankStats?.totalAttempts || 0)) + evaluation.score) / ((progress?.fillInBlankStats?.totalAttempts || 0) + 1),
            improvementTrend: [...(progress?.fillInBlankStats?.improvementTrend || []), evaluation.score].slice(-10)
          }
        };
        setProgress(newProgress);
      }
    } catch (error) {
      console.error('AI评估失败:', error);
      
      // 如果AI评估失败，使用备用的简化评分逻辑
      const responseLength = response.length;
      const idealPoints = currentFIBScenario.idealResponsePoints;
      let score = 5; // 基础分数
      
      if (responseLength >= 50) score += 2;
      if (responseLength >= 100) score += 1;
      
      const keywordMatches = idealPoints.filter(point => 
        response.toLowerCase().includes(point.toLowerCase().substring(0, 5))
      ).length;
      
      score += Math.min(keywordMatches, 2);
      score = Math.min(score, 10);
      
      const fallbackFeedback: FillInBlankFeedback = {
        score,
        strengths: score >= 7 ? ["表达清晰", "设立了界限"] : ["有回应意识"],
        improvements: score < 7 ? ["可以更直接地拒绝操控", "可以更坚定地表达界限"] : [],
        suggestions: "网络连接问题，无法进行AI评分。参考标准答案，学习更有效的表达方式",
        comparison: `由于网络问题使用简化评分：${score >= 7 ? "回应较好地体现了关键要点" : "还需要更明确地表达界限"}`
      };
      
      setFibFeedback(fallbackFeedback);
      setIsCompleted(true);
    } finally {
      setIsEvaluating(false);
    }
  };

  const resetTraining = () => {
    setCurrentMCScenario(null);
    setCurrentFIBScenario(null);
    setMCFeedback(null);
    setFibFeedback(null);
    setUserResponse("");
    setIsCompleted(false);
    setIsEvaluating(false);
  };

  const getDifficultyLabel = (difficulty: string) => {
    if (userPreferences.language === "zh") {
      switch (difficulty) {
        case "easy": return "初级";
        case "medium": return "中级";
        case "hard": return "高级";
        default: return difficulty;
      }
    }
    return difficulty === "easy" ? "Beginner" : 
           difficulty === "medium" ? "Intermediate" : "Advanced";
  };

  // 计算完成百分比
  const completionPercentage = isMounted && (multipleChoiceScenarios.length + fillInBlankScenarios.length) > 0
    ? Math.round(((progress?.completedScenarios?.length || 0) / (multipleChoiceScenarios.length + fillInBlankScenarios.length)) * 100)
    : 0;

  if (!isMounted) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h3 className="text-lg font-medium mb-2">
            {userPreferences.language === "zh" ? "加载中..." : "Loading..."}
          </h3>
          <p className="text-muted-foreground">
            {userPreferences.language === "zh" ? "正在初始化训练模式" : "Initializing training mode"}
          </p>
        </div>
      </div>
    );
  }

  const currentScenario = currentMCScenario || currentFIBScenario;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {!currentScenario ? (
        <>
          <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Brain className="h-6 w-6" />
                {userPreferences.language === "zh" ? "训练模式" : "Training Mode"}
              </h2>
              <p className="text-muted-foreground mt-1">
                {userPreferences.language === "zh"
                  ? "选择训练类型，在安全的场景中练习应对操控性语言"
                  : "Choose training type and practice responding to manipulative language in safe scenarios"}
              </p>
            </div>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2">
            {/* Progress Card */}
            <Card>
              <CardHeader>
                <CardTitle>
                  {userPreferences.language === "zh" ? "你的进度" : "Your Progress"}
                </CardTitle>
                <CardDescription>
                  {userPreferences.language === "zh"
                    ? "追踪你的训练完成情况和结果"
                    : "Track your training completion and results"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* 简单的进度条 */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>
                      {userPreferences.language === "zh" ? "总完成度" : "Overall Completion"}
                    </span>
                    <span className="font-medium">{completionPercentage}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${completionPercentage}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-muted/40 p-3 rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      {userPreferences.language === "zh" ? "已完成场景" : "Scenarios Completed"}
                    </p>
                    <p className="text-2xl font-bold">{progress?.completedScenarios?.length || 0}</p>
                  </div>
                  <div className="bg-muted/40 p-3 rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      {userPreferences.language === "zh" ? "平均分数" : "Average Score"}
                    </p>
                    <p className="text-2xl font-bold">
                      {(progress?.completedScenarios?.length || 0) > 0
                        ? Math.round((progress?.totalScore || 0) / (progress?.completedScenarios?.length || 1))
                        : 0}
                      <span className="text-sm text-muted-foreground">/10</span>
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg">
                    <p className="text-sm text-blue-600 dark:text-blue-400">
                      {userPreferences.language === "zh" ? "选择题正确率" : "Multiple Choice Accuracy"}
                    </p>
                    <p className="text-lg font-bold text-blue-700 dark:text-blue-300">
                      {(progress?.multipleChoiceStats?.totalAttempts || 0) > 0
                        ? Math.round(((progress?.multipleChoiceStats?.correctAnswers || 0) / (progress?.multipleChoiceStats?.totalAttempts || 0)) * 100)
                        : 0}%
                    </p>
                  </div>
                  <div className="bg-green-50 dark:bg-green-950 p-3 rounded-lg">
                    <p className="text-sm text-green-600 dark:text-green-400">
                      {userPreferences.language === "zh" ? "填空题平均分" : "Fill-in-Blank Average"}
                    </p>
                    <p className="text-lg font-bold text-green-700 dark:text-green-300">
                      {(progress?.fillInBlankStats?.totalAttempts || 0) > 0
                        ? Math.round(progress?.fillInBlankStats?.averageScore || 0)
                        : 0}/10
                    </p>
                  </div>
                </div>
                
                {(progress?.lastTrainingDate || 0) > 0 && (
                  <div className="text-sm text-muted-foreground">
                    {userPreferences.language === "zh" ? "上次训练：" : "Last training: "}
                    {new Date(progress?.lastTrainingDate || 0).toLocaleDateString()}
                  </div>
                )}

                <p className="text-sm text-muted-foreground">
                  {userPreferences.language === "zh" 
                    ? `可用场景：${multipleChoiceScenarios.length + fillInBlankScenarios.length}个`
                    : `Available scenarios: ${multipleChoiceScenarios.length + fillInBlankScenarios.length}`}
                </p>
              </CardContent>
            </Card>
            
            {/* Training Mode Selection */}
            <Card>
              <CardHeader>
                <CardTitle>
                  {userPreferences.language === "zh" ? "选择训练模式" : "Choose Training Mode"}
                </CardTitle>
                <CardDescription>
                  {userPreferences.language === "zh"
                    ? "选择训练类型和难度等级"
                    : "Select training type and difficulty level"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <h3 className="font-medium">
                    {userPreferences.language === "zh" ? "选择题模式" : "Multiple Choice Mode"}
                  </h3>
                    <p className="text-sm text-muted-foreground">
                      {userPreferences.language === "zh" 
                      ? "从预设选项中选择最佳回应"
                      : "Choose the best response from preset options"}
                    </p>
                    <div className="grid grid-cols-1 gap-2">
                      {["easy", "medium", "hard"].map((difficulty) => (
                        <Button 
                          key={difficulty}
                          className="justify-start h-auto py-2"
                          variant="outline"
                          size="sm"
                        onClick={() => startMultipleChoiceTraining(difficulty as "easy" | "medium" | "hard")}
                        >
                          <div className="flex items-center">
                          <Badge variant="outline" className="mr-2">
                            {getDifficultyLabel(difficulty)}
                          </Badge>
                          <span className="text-sm">
                            {userPreferences.language === "zh" ? "开始训练" : "Start Training"}
                          </span>
                          </div>
                        </Button>
                      ))}
                    </div>
                </div>
                  
                <div className="space-y-3">
                  <h3 className="font-medium">
                    {userPreferences.language === "zh" ? "填空题模式" : "Fill-in-Blank Mode"}
                  </h3>
                    <p className="text-sm text-muted-foreground">
                      {userPreferences.language === "zh" 
                      ? "自由回答，AI智能评分"
                      : "Free response, AI intelligent scoring"}
                    </p>
                    <div className="grid grid-cols-1 gap-2">
                      {["easy", "medium", "hard"].map((difficulty) => (
                        <Button 
                          key={difficulty}
                          className="justify-start h-auto py-2"
                          variant="outline"
                          size="sm"
                        onClick={() => startFillInBlankTraining(difficulty as "easy" | "medium" | "hard")}
                        >
                          <div className="flex items-center">
                          <Badge variant="outline" className="mr-2">
                            {getDifficultyLabel(difficulty)}
                          </Badge>
                          <span className="text-sm">
                            {userPreferences.language === "zh" ? "开始训练" : "Start Training"}
                          </span>
                          </div>
                        </Button>
                      ))}
                    </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      ) : (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Brain className="h-6 w-6" />
              {userPreferences.language === "zh" ? "训练场景" : "Training Scenario"}
            </h2>
            <Button variant="outline" size="sm" onClick={resetTraining}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              {userPreferences.language === "zh" ? "退出场景" : "Exit Scenario"}
            </Button>
          </div>
          
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{currentScenario.situation}</CardTitle>
                  <CardDescription className="mt-1">
                    {currentScenario.category} · {getDifficultyLabel(currentScenario.difficulty)}
                      <Badge variant="outline" className="ml-2">
                      {currentMCScenario 
                        ? (userPreferences.language === "zh" ? "选择题" : "Multiple Choice")
                        : (userPreferences.language === "zh" ? "填空题" : "Fill-in-Blank")
                      }
                      </Badge>
                  </CardDescription>
                </div>
                <Badge variant="outline">
                  {getDifficultyLabel(currentScenario.difficulty)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted p-4 rounded-lg">
                <p className="font-medium mb-1">
                  {userPreferences.language === "zh" ? "有人对你说：" : "Someone says to you:"}
                </p>
                <p className="text-lg italic">"{currentScenario.puaText}"</p>
              </div>
              
              {currentMCScenario && (
                <div className="space-y-3">
                  <h3 className="font-medium">
                    {currentMCScenario.question}
                  </h3>
                  <div className="space-y-2">
                    {currentMCScenario.options.map((option) => (
                      <Button
                        key={option.id}
                        variant={mcFeedback?.selectedOptionId === option.id ? "default" : "outline"}
                        className="w-full text-left justify-start h-auto py-3 px-4"
                        disabled={isCompleted}
                        onClick={() => handleMultipleChoiceAnswer(option.id)}
                      >
                        <div className="text-left">
                          <p>{option.text}</p>
                          {mcFeedback?.selectedOptionId === option.id && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {option.explanation}
                            </p>
                          )}
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>
              )}
              
              {mcFeedback && (
                <div className="space-y-4 mt-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">
                      {userPreferences.language === "zh" ? "反馈" : "Feedback"}
                    </h3>
                    <Badge variant={mcFeedback.isCorrect ? "default" : mcFeedback.score >= 6 ? "outline" : "destructive"}>
                      {userPreferences.language === "zh" ? "分数：" : "Score: "}{mcFeedback.score}/10
                    </Badge>
                  </div>
                  
                  <div className={`p-3 rounded-lg ${
                    mcFeedback.isCorrect 
                      ? "bg-green-50 dark:bg-green-950" 
                      : "bg-amber-50 dark:bg-amber-950"
                  }`}>
                        <h4 className={`font-medium ${
                          mcFeedback.isCorrect 
                            ? "text-green-800 dark:text-green-300" 
                            : "text-amber-800 dark:text-amber-300"
                        }`}>
                          {mcFeedback.isCorrect 
                            ? (userPreferences.language === "zh" ? "正确答案！" : "Correct Answer!")
                            : (userPreferences.language === "zh" ? "可以改进" : "Room for Improvement")
                          }
                        </h4>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {mcFeedback.explanation}
                        </p>
                  </div>
                  
                  <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg">
                        <h4 className="font-medium text-blue-800 dark:text-blue-300">
                          {userPreferences.language === "zh" ? "场景解释" : "Scenario Explanation"}
                        </h4>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {currentMCScenario?.explanation}
                        </p>
                  </div>
                </div>
              )}
              
              {currentFIBScenario && (
                <div className="space-y-3">
                    <h3 className="font-medium">
                    {userPreferences.language === "zh" ? "你的回应：" : "Your Response:"}
                    </h3>
                  <Textarea
                    placeholder={userPreferences.language === "zh" 
                      ? "在这里输入你的回应..." 
                      : "Type your response here..."}
                    className="min-h-[100px]"
                    disabled={isCompleted}
                    value={userResponse}
                    onChange={(e) => setUserResponse(e.target.value)}
                  />
                  <Button 
                    className="w-full"
                    disabled={isCompleted || isEvaluating}
                    onClick={() => handleFillInBlankAnswer(userResponse)}
                  >
                    {isEvaluating 
                      ? (userPreferences.language === "zh" ? "AI评估中..." : "AI Evaluating...")
                      : (userPreferences.language === "zh" ? "提交回应" : "Submit Response")
                    }
                  </Button>
                </div>
              )}
              
              {fibFeedback && (
                <div className="space-y-4 mt-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">
                      {userPreferences.language === "zh" ? "反馈" : "Feedback"}
                    </h3>
                    <Badge variant={fibFeedback.score >= 7 ? "default" : fibFeedback.score >= 5 ? "outline" : "destructive"}>
                      {userPreferences.language === "zh" ? "分数：" : "Score: "}{fibFeedback.score}/10
                    </Badge>
                  </div>
                  
                  <div className="grid gap-3">
                    {fibFeedback.strengths.length > 0 && (
                      <div className="bg-green-50 dark:bg-green-950 p-3 rounded-lg">
                        <h4 className="font-medium text-green-800 dark:text-green-300 mb-2">
                          {userPreferences.language === "zh" ? "优点" : "Strengths"}
                        </h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          {fibFeedback.strengths.map((strength, index) => (
                            <li key={index}>• {strength}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {fibFeedback.improvements.length > 0 && (
                      <div className="bg-amber-50 dark:bg-amber-950 p-3 rounded-lg">
                        <h4 className="font-medium text-amber-800 dark:text-amber-300 mb-2">
                          {userPreferences.language === "zh" ? "改进建议" : "Improvements"}
                        </h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          {fibFeedback.improvements.map((improvement, index) => (
                            <li key={index}>• {improvement}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg">
                      <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">
                        {userPreferences.language === "zh" ? "标准答案" : "Standard Answer"}
                      </h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        {currentFIBScenario?.standardAnswer}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {currentFIBScenario?.answerExplanation}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          
          {!isCompleted && (
            <Card>
              <CardHeader>
                <CardTitle>
                  {userPreferences.language === "zh" ? "有效回应的提示" : "Tips for Effective Responses"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {(currentScenario as any)?.tips?.map((tip: string, index: number) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-amber-500 mt-1">💡</span>
                      <span>{tip}</span>
                    </li>
                  )) || []}
                </ul>
              </CardContent>
            </Card>
          )}

          {isCompleted && (
            <div className="flex justify-center">
              <Button 
                onClick={() => currentMCScenario 
                  ? startMultipleChoiceTraining(currentMCScenario.difficulty)
                  : startFillInBlankTraining(currentFIBScenario!.difficulty)
                }
                className="w-full max-w-md"
              >
                {userPreferences.language === "zh" ? "尝试另一个场景" : "Try Another Scenario"}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// 保持命名导出的兼容性
export { TrainingMode };