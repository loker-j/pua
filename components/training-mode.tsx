"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, CheckCircle, ChevronRight, Dumbbell, RefreshCw, Lightbulb } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { TrainingProgress, TrainingScenario } from "@/types/pua";
import { UserPreferences } from "@/types/user";
import { trainingScenarios } from "@/data/training-scenarios";

interface TrainingModeProps {
  userPreferences: UserPreferences;
}

export function TrainingMode({ userPreferences }: TrainingModeProps) {
  const [isClient, setIsClient] = useState(false);
  const [progress, setProgress] = useLocalStorage<TrainingProgress>("trainingProgress", {
    completedScenarios: [],
    totalScore: 0,
    lastTrainingDate: 0,
    weakAreas: []
  });
  
  const [currentScenario, setCurrentScenario] = useState<TrainingScenario | null>(null);
  const [userResponse, setUserResponse] = useState("");
  const [feedback, setFeedback] = useState<{
    score: number;
    strengths: string[];
    improvements: string[];
    suggestions: string;
  } | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const startTraining = (difficulty: "easy" | "medium" | "hard") => {
    if (!isClient) return;
    
    const availableScenarios = trainingScenarios.filter(
      scenario => 
        scenario.difficulty === difficulty && 
        !progress.completedScenarios.includes(scenario.id)
    );
    
    const scenariosToChooseFrom = availableScenarios.length > 0 
      ? availableScenarios 
      : trainingScenarios.filter(scenario => scenario.difficulty === difficulty);
    
    const randomScenario = scenariosToChooseFrom[
      Math.floor(Math.random() * scenariosToChooseFrom.length)
    ];
    
    setCurrentScenario(randomScenario);
    setUserResponse("");
    setFeedback(null);
    setIsCompleted(false);
  };

  const analyzeResponse = () => {
    if (!currentScenario || !userResponse.trim() || !isClient) return;
    
    const response = userResponse.toLowerCase();
    const points = currentScenario.idealResponsePoints;
    
    let score = 0;
    const strengths: string[] = [];
    const improvements: string[] = [];
    
    if (response.includes("界限") || response.includes("boundary") || 
        response.includes("limit") || response.includes("不舒服")) {
      score += 2;
      strengths.push(userPreferences.language === "zh" 
        ? "你很好地设立了清晰的界限"
        : "You established clear boundaries");
    } else {
      improvements.push(userPreferences.language === "zh"
        ? "考虑明确表达你的界限"
        : "Consider clearly stating your boundaries");
    }
    
    if (response.includes("我感觉") || response.includes("我是") || 
        response.includes("我需要") || response.includes("我会")) {
      score += 2;
      strengths.push(userPreferences.language === "zh"
        ? "你有效地使用了\"我\"的陈述"
        : "You used 'I' statements effectively");
    } else {
      improvements.push(userPreferences.language === "zh"
        ? "尝试使用更多\"我\"的陈述来表达你的观点"
        : "Try using more 'I' statements to express your perspective");
    }
    
    if (response.includes("操控") || response.includes("不公平") ||
        response.includes("不能接受") || response.includes("不恰当")) {
      score += 2;
      strengths.push(userPreferences.language === "zh"
        ? "你直接指出了操控行为"
        : "You directly addressed the manipulative behavior");
    }
    
    if (response.includes("闭嘴") || response.includes("恨你") ||
        response.includes("蠢") || response.includes("白痴")) {
      score -= 2;
      improvements.push(userPreferences.language === "zh"
        ? "避免使用可能激化情况的攻击性语言"
        : "Avoid aggressive language that can escalate the situation");
    }
    
    if (response.includes("事实") || response.includes("实际上") ||
        response.includes("现实") || response.includes("真相")) {
      score += 1;
      strengths.push(userPreferences.language === "zh"
        ? "你在回应中包含了事实陈述"
        : "You included factual statements in your response");
    }
    
    const finalScore = Math.min(Math.max(score, 1), 10);
    
    let suggestions = "";
    if (finalScore <= 3) {
      suggestions = userPreferences.language === "zh"
        ? "你的回应可以通过设立更清晰的界限和更直接地指出操控行为来改进。尝试使用\"我\"的陈述，关注具体行为而不是人。"
        : "Your response could benefit from clearer boundaries and more direct addressing of the manipulative behavior. Try using 'I' statements and focus on the specific behavior rather than the person.";
    } else if (finalScore <= 6) {
      suggestions = userPreferences.language === "zh"
        ? "你的回应有一些很好的元素，但还可以更有效。考虑在保持冷静语气的同时更直接地指出操控。"
        : "Your response has some strong elements, but could be more effective. Consider being more direct about the manipulation while maintaining a calm tone.";
    } else {
      suggestions = userPreferences.language === "zh"
        ? "你的回应很好地应对了操控。继续在类似情况下使用清晰的界限和\"我\"的陈述。"
        : "Your response is effective at addressing the manipulation. Keep using clear boundaries and 'I' statements in similar situations.";
    }
    
    if (strengths.length === 0) {
      strengths.push(userPreferences.language === "zh"
        ? "你尝试了应对这个情况"
        : "You attempted to address the situation");
    }
    
    setFeedback({
      score: finalScore,
      strengths,
      improvements,
      suggestions
    });
    
    if (!progress.completedScenarios.includes(currentScenario.id)) {
      const newProgress = {
        ...progress,
        completedScenarios: [...progress.completedScenarios, currentScenario.id],
        totalScore: progress.totalScore + finalScore,
        lastTrainingDate: Date.now()
      };
      setProgress(newProgress);
    }
    
    setIsCompleted(true);
  };

  const resetTraining = () => {
    setCurrentScenario(null);
    setUserResponse("");
    setFeedback(null);
    setIsCompleted(false);
  };

  const completionPercentage = 
    Math.round((progress.completedScenarios.length / trainingScenarios.length) * 100);

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

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {!isClient ? (
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
      ) : !currentScenario ? (
        <>
          <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-bold">
                {userPreferences.language === "zh" ? "训练模式" : "Training Mode"}
              </h2>
              <p className="text-muted-foreground mt-1">
                {userPreferences.language === "zh"
                  ? "在安全的场景中练习应对操控性语言"
                  : "Practice responding to manipulative language in safe scenarios"}
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
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>
                      {userPreferences.language === "zh" ? "完成度" : "Completion"}
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
                    <p className="text-2xl font-bold">{progress.completedScenarios.length}</p>
                  </div>
                  <div className="bg-muted/40 p-3 rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      {userPreferences.language === "zh" ? "平均分数" : "Average Score"}
                    </p>
                    <p className="text-2xl font-bold">
                      {progress.completedScenarios.length > 0
                        ? Math.round(progress.totalScore / progress.completedScenarios.length)
                        : 0}
                      <span className="text-sm text-muted-foreground">/10</span>
                    </p>
                  </div>
                </div>
                
                {progress.lastTrainingDate > 0 && (
                  <div className="text-sm text-muted-foreground">
                    {userPreferences.language === "zh" ? "上次训练：" : "Last training: "}
                    {new Date(progress.lastTrainingDate).toLocaleDateString()}
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Difficulty Selection */}
            <Card>
              <CardHeader>
                <CardTitle>
                  {userPreferences.language === "zh" ? "开始训练" : "Start Training"}
                </CardTitle>
                <CardDescription>
                  {userPreferences.language === "zh"
                    ? "选择难度等级开始"
                    : "Choose a difficulty level to begin"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-3">
                  <Button 
                    onClick={() => startTraining("easy")}
                    className="justify-start h-auto py-3"
                    variant="outline"
                  >
                    <div className="flex items-center">
                      <div className="bg-green-100 dark:bg-green-900 p-2 rounded-full mr-3">
                        <Dumbbell className="h-5 w-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div className="text-left">
                        <h3 className="font-medium">
                          {userPreferences.language === "zh" ? "初级难度" : "Beginner Level"}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {userPreferences.language === "zh"
                            ? "基础场景，操控性明显"
                            : "Basic scenarios with clear manipulation"}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="ml-auto h-5 w-5 text-muted-foreground" />
                  </Button>
                  
                  <Button 
                    onClick={() => startTraining("medium")}
                    className="justify-start h-auto py-3"
                    variant="outline"
                  >
                    <div className="flex items-center">
                      <div className="bg-amber-100 dark:bg-amber-900 p-2 rounded-full mr-3">
                        <Dumbbell className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                      </div>
                      <div className="text-left">
                        <h3 className="font-medium">
                          {userPreferences.language === "zh" ? "中级难度" : "Intermediate Level"}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {userPreferences.language === "zh"
                            ? "更微妙的操控形式"
                            : "More subtle forms of manipulation"}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="ml-auto h-5 w-5 text-muted-foreground" />
                  </Button>
                  
                  <Button 
                    onClick={() => startTraining("hard")}
                    className="justify-start h-auto py-3"
                    variant="outline"
                  >
                    <div className="flex items-center">
                      <div className="bg-red-100 dark:bg-red-900 p-2 rounded-full mr-3">
                        <Dumbbell className="h-5 w-5 text-red-600 dark:text-red-400" />
                      </div>
                      <div className="text-left">
                        <h3 className="font-medium">
                          {userPreferences.language === "zh" ? "高级难度" : "Advanced Level"}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {userPreferences.language === "zh"
                            ? "复杂、微妙的场景，需要谨慎应对"
                            : "Complex, subtle scenarios that are challenging to navigate"}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="ml-auto h-5 w-5 text-muted-foreground" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      ) : (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">
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
              
              <div className="space-y-2">
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
              
              {feedback && (
                <div className="space-y-4 mt-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">
                      {userPreferences.language === "zh" ? "反馈" : "Feedback"}
                    </h3>
                    <Badge variant={feedback.score >= 7 ? "default" : feedback.score >= 4 ? "outline" : "destructive"}>
                      {userPreferences.language === "zh" ? "分数：" : "Score: "}{feedback.score}/10
                    </Badge>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="bg-green-50 dark:bg-green-950 p-3 rounded-lg">
                      <div className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-green-800 dark:text-green-300">
                            {userPreferences.language === "zh" ? "优点" : "Strengths"}
                          </h4>
                          <ul className="mt-1 list-disc list-inside text-sm space-y-1 text-muted-foreground">
                            {feedback.strengths.map((strength, i) => (
                              <li key={i}>{strength}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                    
                    {feedback.improvements.length > 0 && (
                      <div className="bg-amber-50 dark:bg-amber-950 p-3 rounded-lg">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                          <div>
                            <h4 className="font-medium text-amber-800 dark:text-amber-300">
                              {userPreferences.language === "zh" ? "改进空间" : "Areas for Improvement"}
                            </h4>
                            <ul className="mt-1 list-disc list-inside text-sm space-y-1 text-muted-foreground">
                              {feedback.improvements.map((improvement, i) => (
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
                            {feedback.suggestions}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter>
              {!isCompleted ? (
                <Button 
                  onClick={analyzeResponse} 
                  className="w-full"
                  disabled={!userResponse.trim()}
                >
                  {userPreferences.language === "zh" ? "提交回应" : "Submit Response"}
                </Button>
              ) : (
                <Button 
                  onClick={() => startTraining(currentScenario.difficulty)}
                  className="w-full"
                >
                  {userPreferences.language === "zh" ? "尝试另一个场景" : "Try Another Scenario"}
                </Button>
              )}
            </CardFooter>
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
                  {currentScenario.tips.map((tip, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Lightbulb className="h-5 w-5 text-amber-500 mt-0.5 shrink-0" />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}