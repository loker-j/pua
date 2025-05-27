"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PUAAnalyzer } from "@/components/pua-analyzer";
import { PhraseLibrary } from "@/components/phrase-library";
import { UserSettings } from "@/components/user-settings";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { UserPreferences, defaultUserPreferences } from "@/types/user";

// 修复动态导入语法，正确处理命名导出
const TrainingMode = dynamic(
  () => import("@/components/training-mode").then((mod) => mod.TrainingMode),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h3 className="text-lg font-medium mb-2">加载中...</h3>
          <p className="text-muted-foreground">正在初始化训练模式</p>
        </div>
      </div>
    ),
  }
);

export function Home() {
  const [isMounted, setIsMounted] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const [activeTab, setActiveTab] = useState("analyzer");
  const [userPreferences, setUserPreferences, isPreferencesInitialized] = useLocalStorage<UserPreferences>(
    "userPreferences",
    defaultUserPreferences
  );

  // 第一个useEffect：处理组件挂载
  useEffect(() => {
    console.log("Home component mounting...");
    setIsMounted(true);
    
    // 强制触发hydration完成
    const timer = setTimeout(() => {
      console.log("Forcing hydration complete");
      setIsHydrated(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  // 第二个useEffect：处理超时机制
  useEffect(() => {
    if (!isMounted) return;
    
    console.log("Setting up timeout mechanism");
    const timeout = setTimeout(() => {
      console.log("Timeout reached, forcing initialization");
      setIsHydrated(true);
    }, 2000); // 减少到2秒
    
    return () => clearTimeout(timeout);
  }, [isMounted]);

  // 第三个useEffect：监控状态变化
  useEffect(() => {
    console.log("State update:", {
      isMounted,
      isHydrated,
      isPreferencesInitialized,
      userPreferences: userPreferences?.language
    });
  }, [isMounted, isHydrated, isPreferencesInitialized, userPreferences]);

  const getTabLabel = (key: string) => {
    if (userPreferences?.language === "zh") {
      switch (key) {
        case "analyzer": return "分析器";
        case "library": return "短语库";
        case "training": return "训练模式";
        case "settings": return "设置";
        default: return key;
      }
    }
    return key.charAt(0).toUpperCase() + key.slice(1);
  };

  const handleTabChange = (value: string) => {
    console.log("Tab change requested:", value);
    setActiveTab(value);
  };

  // 简化加载条件：只要有一个条件满足就显示内容
  const shouldShowContent = isMounted && (isHydrated || isPreferencesInitialized);
  
  if (!shouldShowContent) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-6">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <h3 className="text-lg font-medium mb-2">加载中...</h3>
              <p className="text-muted-foreground">
                正在初始化应用 (挂载: {isMounted ? "✓" : "✗"}, 水合: {isHydrated ? "✓" : "✗"}, 偏好: {isPreferencesInitialized ? "✓" : "✗"})
              </p>
              <div className="mt-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid grid-cols-4 mb-8">
            <TabsTrigger value="analyzer" onClick={() => console.log("Analyzer tab clicked")}>
              {getTabLabel("analyzer")}
            </TabsTrigger>
            <TabsTrigger value="library" onClick={() => console.log("Library tab clicked")}>
              {getTabLabel("library")}
            </TabsTrigger>
            <TabsTrigger value="training" onClick={() => console.log("Training tab clicked")}>
              {getTabLabel("training")}
            </TabsTrigger>
            <TabsTrigger value="settings" onClick={() => console.log("Settings tab clicked")}>
              {getTabLabel("settings")}
            </TabsTrigger>
          </TabsList>
          <TabsContent value="analyzer" className="mt-6">
            <PUAAnalyzer userPreferences={userPreferences || defaultUserPreferences} />
          </TabsContent>
          <TabsContent value="library" className="mt-6">
            <PhraseLibrary userPreferences={userPreferences || defaultUserPreferences} />
          </TabsContent>
          <TabsContent value="training" className="mt-6">
            <TrainingMode userPreferences={userPreferences || defaultUserPreferences} />
          </TabsContent>
          <TabsContent value="settings" className="mt-6">
            <UserSettings 
              userPreferences={userPreferences || defaultUserPreferences} 
              setUserPreferences={setUserPreferences} 
            />
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
}