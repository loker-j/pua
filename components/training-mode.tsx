"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, CheckCircle, ChevronRight, Dumbbell, RefreshCw, Lightbulb, BookOpen, PenTool, Trophy, Target } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { TrainingProgress, MultipleChoiceScenario, FillInBlankScenario, TrainingMode as TrainingModeType } from "@/types/pua";
import { UserPreferences } from "@/types/user";
import { multipleChoiceScenarios, fillInBlankScenarios } from "@/data/training-scenarios";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

export function TrainingMode({ userPreferences }: TrainingModeProps) {
  const [isClient, setIsClient] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  
  const [progress, setProgress, isProgressInitialized] = useLocalStorage<TrainingProgress>("trainingProgress", {
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
  
  const [currentMode, setCurrentMode] = useState<TrainingModeType>("multiple-choice");
  const [currentMCScenario, setCurrentMCScenario] = useState<MultipleChoiceScenario | null>(null);
  const [currentFIBScenario, setCurrentFIBScenario] = useState<FillInBlankScenario | null>(null);
  const [userResponse, setUserResponse] = useState("");
  const [mcFeedback, setMCFeedback] = useState<MultipleChoiceFeedback | null>(null);
  const [fibFeedback, setFIBFeedback] = useState<FillInBlankFeedback | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);

  useEffect(() => {
    setIsClient(true);
    setIsMounted(true);
  }, []);

  const startMultipleChoiceTraining = (difficulty: "easy" | "medium" | "hard") => {
    if (!isClient || !isMounted) return;
    
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
    setUserResponse("");
    setMCFeedback(null);
    setFIBFeedback(null);
    setIsCompleted(false);
  };

  const startFillInBlankTraining = (difficulty: "easy" | "medium" | "hard") => {
    if (!isClient || !isMounted) return;
    
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
    setUserResponse("");
    setMCFeedback(null);
    setFIBFeedback(null);
    setIsCompleted(false);
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

  const handleFillInBlankSubmit = async () => {
    if (!currentFIBScenario || !userResponse.trim() || isEvaluating) return;
    
    setIsEvaluating(true);
    
    try {
      const response = await fetch("/api/training/evaluate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userAnswer: userResponse,
          standardAnswer: currentFIBScenario.standardAnswer,
          idealResponsePoints: currentFIBScenario.idealResponsePoints,
          puaText: currentFIBScenario.puaText,
          category: currentFIBScenario.category,
          language: userPreferences.language
        }),
      });
      
      if (!response.ok) {
        throw new Error("Evaluation failed");
      }
      
      const evaluation = await response.json();
      setFIBFeedback(evaluation);
      setIsCompleted(true);
      
      // 更新进度
      if (!progress?.completedScenarios?.includes(currentFIBScenario.id)) {
        const newTrend = [...(progress?.fillInBlankStats?.improvementTrend || []), evaluation.score].slice(-10);
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
            improvementTrend: newTrend
          }
        };
        setProgress(newProgress);
      }
    } catch (error) {
      console.error("Evaluation error:", error);
      // 使用备用评估
      const fallbackFeedback: FillInBlankFeedback = {
        score: 5,
        strengths: [userPreferences.language === "zh" ? "你尝试了应对这个情况" : "You attempted to address the situation"],
        improvements: [userPreferences.language === "zh" ? "可以更明确地设立界限" : "Could establish clearer boundaries"],
        suggestions: userPreferences.language === "zh" ? "继续练习，注意使用'我'的陈述。" : "Keep practicing and focus on using 'I' statements.",
        comparison: userPreferences.language === "zh" ? "评估暂时不可用，请稍后再试。" : "Evaluation temporarily unavailable, please try again later."
      };
      setFIBFeedback(fallbackFeedback);
      setIsCompleted(true);
    } finally {
      setIsEvaluating(false);
    }
  };

  const resetTraining = () => {
    setCurrentMCScenario(null);
    setCurrentFIBScenario(null);
    setUserResponse("");
    setMCFeedback(null);
    setFIBFeedback(null);
    setIsCompleted(false);
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

  const completionPercentage = isMounted && (multipleChoiceScenarios.length + fillInBlankScenarios.length) > 0
    ? Math.round(((progress?.completedScenarios?.length || 0) / (multipleChoiceScenarios.length + fillInBlankScenarios.length)) * 100)
    : 0;

  // 简化加载条件：只检查是否挂载，不等待progress初始化
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
              <h2 className="text-2xl font-bold">
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
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-amber-500" />
                  {userPreferences.language === "zh" ? "你的进度" : "Your Progress"}
                </CardTitle>
                <CardDescription>
                  {userPreferences.language === "zh"
                    ? "追踪你的训练完成情况和结果"
                    : "Track your training completion and results"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>
                      {userPreferences.language === "zh" ? "总完成度" : "Overall Completion"}
                    </span>
                    <span className="font-medium">{completionPercentage}%</span>
                  </div>
                  <Progress value={completionPercentage} className="h-2" />
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
                      {progress?.multipleChoiceStats?.totalAttempts > 0
                        ? Math.round((progress?.multipleChoiceStats?.correctAnswers / progress?.multipleChoiceStats?.totalAttempts) * 100)
                        : 0}%
                    </p>
                  </div>
                  <div className="bg-green-50 dark:bg-green-950 p-3 rounded-lg">
                    <p className="text-sm text-green-600 dark:text-green-400">
                      {userPreferences.language === "zh" ? "填空题平均分" : "Fill-in-Blank Average"}
                    </p>
                    <p className="text-lg font-bold text-green-700 dark:text-green-300">
                      {progress?.fillInBlankStats?.totalAttempts > 0
                        ? Math.round(progress?.fillInBlankStats?.averageScore)
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
              </CardContent>
            </Card>
            
            {/* Training Mode Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-blue-500" />
                  {userPreferences.language === "zh" ? "选择训练模式" : "Choose Training Mode"}
                </CardTitle>
                <CardDescription>
                  {userPreferences.language === "zh"
                    ? "选择训练类型和难度等级"
                    : "Select training type and difficulty level"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={currentMode} onValueChange={(value) => setCurrentMode(value as TrainingModeType)}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="multiple-choice" className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4" />
                      {userPreferences.language === "zh" ? "选择题" : "Multiple Choice"}
                    </TabsTrigger>
                    <TabsTrigger value="fill-in-blank" className="flex items-center gap-2">
                      <PenTool className="h-4 w-4" />
                      {userPreferences.language === "zh" ? "填空题" : "Fill-in-Blank"}
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="multiple-choice" className="space-y-3 mt-4">
                    <p className="text-sm text-muted-foreground">
                      {userPreferences.language === "zh" 
                        ? "从预设选项中选择最佳回应，本地评分，即时反馈"
                        : "Choose the best response from preset options, local scoring, instant feedback"}
                    </p>
                    <div className="grid grid-cols-1 gap-2">
                      {["easy", "medium", "hard"].map((difficulty) => (
                        <Button 
                          key={difficulty}
                          onClick={() => startMultipleChoiceTraining(difficulty as "easy" | "medium" | "hard")}
                          className="justify-start h-auto py-2"
                          variant="outline"
                          size="sm"
                        >
                          <div className="flex items-center">
                            <div className={`p-1.5 rounded-full mr-2 ${
                              difficulty === "easy" ? "bg-green-100 dark:bg-green-900" :
                              difficulty === "medium" ? "bg-amber-100 dark:bg-amber-900" :
                              "bg-red-100 dark:bg-red-900"
                            }`}>
                              <Dumbbell className={`h-3 w-3 ${
                                difficulty === "easy" ? "text-green-600 dark:text-green-400" :
                                difficulty === "medium" ? "text-amber-600 dark:text-amber-400" :
                                "text-red-600 dark:text-red-400"
                              }`} />
                            </div>
                            <span className="text-sm">{getDifficultyLabel(difficulty)}</span>
                          </div>
                          <ChevronRight className="ml-auto h-4 w-4 text-muted-foreground" />
                        </Button>
                      ))}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="fill-in-blank" className="space-y-3 mt-4">
                    <p className="text-sm text-muted-foreground">
                      {userPreferences.language === "zh" 
                        ? "自由回答，AI智能评分，对比标准答案"
                        : "Free response, AI intelligent scoring, compare with standard answers"}
                    </p>
                    <div className="grid grid-cols-1 gap-2">
                      {["easy", "medium", "hard"].map((difficulty) => (
                        <Button 
                          key={difficulty}
                          onClick={() => startFillInBlankTraining(difficulty as "easy" | "medium" | "hard")}
                          className="justify-start h-auto py-2"
                          variant="outline"
                          size="sm"
                        >
                          <div className="flex items-center">
                            <div className={`p-1.5 rounded-full mr-2 ${
                              difficulty === "easy" ? "bg-green-100 dark:bg-green-900" :
                              difficulty === "medium" ? "bg-amber-100 dark:bg-amber-900" :
                              "bg-red-100 dark:bg-red-900"
                            }`}>
                              <Dumbbell className={`h-3 w-3 ${
                                difficulty === "easy" ? "text-green-600 dark:text-green-400" :
                                difficulty === "medium" ? "text-amber-600 dark:text-amber-400" :
                                "text-red-600 dark:text-red-400"
                              }`} />
                            </div>
                            <span className="text-sm">{getDifficultyLabel(difficulty)}</span>
                          </div>
                          <ChevronRight className="ml-auto h-4 w-4 text-muted-foreground" />
                        </Button>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </>
      ) : (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              {currentMCScenario ? <BookOpen className="h-6 w-6 text-blue-500" /> : <PenTool className="h-6 w-6 text-green-500" />}
              {userPreferences.language === "zh" ? "训练场景" : "Training Scenario"}
            </h2>
            <Button variant="outline" size="sm" onClick={resetTraining}>
              <RefreshCw className="h-4 w-4 mr-2" /> 
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
                    {currentMCScenario && (
                      <Badge variant="outline" className="ml-2">
                        {userPreferences.language === "zh" ? "选择题" : "Multiple Choice"}
                      </Badge>
                    )}
                    {currentFIBScenario && (
                      <Badge variant="outline" className="ml-2">
                        {userPreferences.language === "zh" ? "填空题" : "Fill-in-Blank"}
                      </Badge>
                    )}
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
                        onClick={() => handleMultipleChoiceAnswer(option.id)}
                        variant={mcFeedback?.selectedOptionId === option.id ? "default" : "outline"}
                        className="w-full text-left justify-start h-auto py-3 px-4"
                        disabled={isCompleted}
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
              
              {currentFIBScenario && (
                <div className="space-y-3">
                  <h3 className="font-medium">
                    {userPreferences.language === "zh" ? "你的回应：" : "Your Response:"}
                  </h3>
                  <Textarea
                    placeholder={userPreferences.language === "zh"
                      ? "输入你会如何回应这个陈述..."
                      : "Type how you would respond to this statement..."}
                    className="min-h-[120px]"
                    value={userResponse}
                    onChange={(e) => setUserResponse(e.target.value)}
                    disabled={isCompleted}
                  />
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
                    <div className="flex items-start gap-2">
                      {mcFeedback.isCorrect ? (
                        <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                      )}
                      <div>
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
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg">
                    <div className="flex items-start gap-2">
                      <Lightbulb className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-blue-800 dark:text-blue-300">
                          {userPreferences.language === "zh" ? "场景解释" : "Scenario Explanation"}
                        </h4>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {currentMCScenario?.explanation}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {fibFeedback && (
                <div className="space-y-4 mt-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">
                      {userPreferences.language === "zh" ? "AI评估反馈" : "AI Evaluation Feedback"}
                    </h3>
                    <Badge variant={fibFeedback.score >= 7 ? "default" : fibFeedback.score >= 4 ? "outline" : "destructive"}>
                      {userPreferences.language === "zh" ? "分数：" : "Score: "}{fibFeedback.score}/10
                    </Badge>
                  </div>
                  
                  <div className="space-y-4">
                    {fibFeedback.strengths.length > 0 && (
                      <div className="bg-green-50 dark:bg-green-950 p-3 rounded-lg">
                        <div className="flex items-start gap-2">
                          <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
                          <div>
                            <h4 className="font-medium text-green-800 dark:text-green-300">
                              {userPreferences.language === "zh" ? "优点" : "Strengths"}
                            </h4>
                            <ul className="mt-1 list-disc list-inside text-sm space-y-1 text-muted-foreground">
                              {fibFeedback.strengths.map((strength, i) => (
                                <li key={i}>{strength}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {fibFeedback.improvements.length > 0 && (
                      <div className="bg-amber-50 dark:bg-amber-950 p-3 rounded-lg">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                          <div>
                            <h4 className="font-medium text-amber-800 dark:text-amber-300">
                              {userPreferences.language === "zh" ? "改进空间" : "Areas for Improvement"}
                            </h4>
                            <ul className="mt-1 list-disc list-inside text-sm space-y-1 text-muted-foreground">
                              {fibFeedback.improvements.map((improvement, i) => (
                                <li key={i}>{improvement}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg">
                      <div className="flex items-start gap-2">
                        <Lightbulb className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-blue-800 dark:text-blue-300">
                            {userPreferences.language === "zh" ? "建议" : "Suggestions"}
                          </h4>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {fibFeedback.suggestions}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-purple-50 dark:bg-purple-950 p-3 rounded-lg">
                      <div className="flex items-start gap-2">
                        <Target className="h-5 w-5 text-purple-600 dark:text-purple-400 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-purple-800 dark:text-purple-300">
                            {userPreferences.language === "zh" ? "与标准答案对比" : "Comparison with Standard Answer"}
                          </h4>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {fibFeedback.comparison}
                          </p>
                          <div className="mt-2 p-2 bg-background/50 rounded border">
                            <p className="text-sm font-medium">
                              {userPreferences.language === "zh" ? "标准答案：" : "Standard Answer:"}
                            </p>
                            <p className="text-sm text-muted-foreground mt-1">
                              {currentFIBScenario?.standardAnswer}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter>
              {!isCompleted ? (
                currentMCScenario ? (
                  <p className="text-sm text-muted-foreground w-full text-center">
                    {userPreferences.language === "zh" ? "选择一个选项查看反馈" : "Select an option to see feedback"}
                  </p>
                ) : (
                  <Button 
                    onClick={handleFillInBlankSubmit} 
                    className="w-full"
                    disabled={!userResponse.trim() || isEvaluating}
                  >
                    {isEvaluating 
                      ? (userPreferences.language === "zh" ? "AI评估中..." : "AI Evaluating...")
                      : (userPreferences.language === "zh" ? "提交回应" : "Submit Response")
                    }
                  </Button>
                )
              ) : (
                <Button 
                  onClick={() => currentMCScenario 
                    ? startMultipleChoiceTraining(currentMCScenario.difficulty)
                    : startFillInBlankTraining(currentFIBScenario!.difficulty)
                  }
                  className="w-full"
                >
                  {userPreferences.language === "zh" ? "尝试另一个场景" : "Try Another Scenario"}
                </Button>
              )}
            </CardFooter>
          </Card>
          
          {!isCompleted && currentScenario && (
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
                      <Lightbulb className="h-5 w-5 text-amber-500 mt-0.5 shrink-0" />
                      <span>{tip}</span>
                    </li>
                  )) || []}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}