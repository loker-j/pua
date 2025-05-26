"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PUAAnalyzer } from "@/components/pua-analyzer";
import { PhraseLibrary } from "@/components/phrase-library";
import { TrainingMode } from "@/components/training-mode";
import { UserSettings } from "@/components/user-settings";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { UserPreferences, defaultUserPreferences } from "@/types/user";

export function Home() {
  const [userPreferences, setUserPreferences] = useLocalStorage<UserPreferences>(
    "userPreferences",
    defaultUserPreferences
  );

  const getTabLabel = (key: string) => {
    if (userPreferences.language === "zh") {
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

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-6">
        <Tabs defaultValue="analyzer" className="w-full">
          <TabsList className="grid grid-cols-4 mb-8">
            <TabsTrigger value="analyzer">{getTabLabel("analyzer")}</TabsTrigger>
            <TabsTrigger value="library">{getTabLabel("library")}</TabsTrigger>
            <TabsTrigger value="training">{getTabLabel("training")}</TabsTrigger>
            <TabsTrigger value="settings">{getTabLabel("settings")}</TabsTrigger>
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