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
  const [activeTab, setActiveTab] = useState("analyzer");
  const [userPreferences, setUserPreferences, isPreferencesInitialized] = useLocalStorage<UserPreferences>(
    "userPreferences",
    defaultUserPreferences
  );

  useEffect(() => {
    setIsMounted(true);
    console.log("Home component mounted");
    
    // 添加超时机制，防止无限加载
    const timeout = setTimeout(() => {
      if (!isPreferencesInitialized) {
        console.warn("Preferences initialization timeout, forcing initialization");
        setIsMounted(true);
      }
    }, 3000); // 3秒超时
    
    return () => clearTimeout(timeout);
  }, [isPreferencesInitialized]);

  useEffect(() => {
    console.log("Preferences initialized:", isPreferencesInitialized);
    console.log("User preferences:", userPreferences);
  }, [isPreferencesInitialized, userPreferences]);

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

  // 改进加载条件：如果3秒后仍未初始化，强制显示内容
  const shouldShowLoading = !isMounted || (!isPreferencesInitialized && isMounted);
  
  if (shouldShowLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-6">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <h3 className="text-lg font-medium mb-2">加载中...</h3>
              <p className="text-muted-foreground">
                正在初始化应用 (挂载: {isMounted ? "✓" : "✗"}, 偏好: {isPreferencesInitialized ? "✓" : "✗"})
              </p>
              {isMounted && !isPreferencesInitialized && (
                <p className="text-xs text-muted-foreground mt-2">
                  如果长时间加载，请刷新页面
                </p>
              )}
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
            <PUAAnalyzer userPreferences={userPreferences} />
          </TabsContent>
          <TabsContent value="library" className="mt-6">
            <PhraseLibrary userPreferences={userPreferences} />
          </TabsContent>
          <TabsContent value="training" className="mt-6">
            <TrainingMode userPreferences={userPreferences} />
          </TabsContent>
          <TabsContent value="settings" className="mt-6">
            <UserSettings 
              userPreferences={userPreferences} 
              setUserPreferences={setUserPreferences} 
            />
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
}