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

// 使用动态导入，添加错误处理
const TrainingMode = dynamic(() => import("@/components/training-mode"), {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
        <h3 className="text-lg font-medium mb-2">加载训练模式中...</h3>
        <p className="text-muted-foreground">请稍候</p>
        </div>
      </div>
    ),
});

export function Home() {
  const [isMounted, setIsMounted] = useState(false);
  const [activeTab, setActiveTab] = useState("analyzer");
  const [userPreferences, setUserPreferences] = useLocalStorage<UserPreferences>(
    "userPreferences",
    defaultUserPreferences
  );

  // 简化挂载逻辑
  useEffect(() => {
    setIsMounted(true);
  }, []);

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
    setActiveTab(value);
  };

  // 简化渲染逻辑：直接渲染，不需要复杂的加载检查
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid grid-cols-4 mb-8">
            <TabsTrigger value="analyzer">
              {getTabLabel("analyzer")}
            </TabsTrigger>
            <TabsTrigger value="library">
              {getTabLabel("library")}
            </TabsTrigger>
            <TabsTrigger value="training">
              {getTabLabel("training")}
            </TabsTrigger>
            <TabsTrigger value="settings">
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
            {isMounted && (
              <TrainingMode userPreferences={userPreferences || defaultUserPreferences} />
            )}
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