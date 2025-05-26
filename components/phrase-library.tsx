"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bookmark, Search, BookmarkCheck } from "lucide-react";
import { puaDatabase } from "@/data/pua-database";
import { PUACategory } from "@/types/pua";
import { UserPreferences } from "@/types/user";
import { useLocalStorage } from "@/hooks/use-local-storage";

interface PhraseLibraryProps {
  userPreferences: UserPreferences;
}

export function PhraseLibrary({ userPreferences }: PhraseLibraryProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [favorites, setFavorites] = useLocalStorage<string[]>("favoritePatterns", []);
  const [activeCategory, setActiveCategory] = useState<PUACategory | "all" | "favorites">("all");

  const filteredPatterns = puaDatabase.filter(pattern => {
    const matchesSearch = searchTerm === "" || 
      pattern.pattern.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pattern.keywords.some(keyword => keyword.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = 
      activeCategory === "all" || 
      (activeCategory === "favorites" ? favorites.includes(pattern.id) : pattern.category === activeCategory);
    
    return matchesSearch && matchesCategory;
  });

  const toggleFavorite = (id: string) => {
    if (favorites.includes(id)) {
      setFavorites(favorites.filter(favId => favId !== id));
    } else {
      setFavorites([...favorites, id]);
    }
  };

  const getCategoryLabel = (category: PUACategory) => {
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

  const getTabLabel = (value: string) => {
    if (userPreferences.language === "zh") {
      switch (value) {
        case "all": return "全部";
        case "workplace": return "职场";
        case "relationship": return "感情";
        case "family": return "家庭";
        case "general": return "通用";
        case "favorites": return "收藏";
        default: return value;
      }
    }
    return value.charAt(0).toUpperCase() + value.slice(1);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
          <h2 className="text-2xl font-bold">
            {userPreferences.language === "zh" ? "PUA 短语库" : "PUA Phrase Library"}
          </h2>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder={userPreferences.language === "zh" 
                ? "搜索模式或关键词..."
                : "Search patterns or keywords..."}
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <Tabs 
          defaultValue="all" 
          value={activeCategory}
          onValueChange={(value) => setActiveCategory(value as PUACategory | "all" | "favorites")}
          className="w-full"
        >
          <TabsList className="grid grid-cols-3 md:grid-cols-6 mb-4">
            {["all", "workplace", "relationship", "family", "general", "favorites"].map((tab) => (
              <TabsTrigger key={tab} value={tab}>
                {getTabLabel(tab)}
              </TabsTrigger>
            ))}
          </TabsList>
          
          <div className="grid gap-4 md:grid-cols-2">
            {filteredPatterns.length > 0 ? (
              filteredPatterns.map(pattern => (
                <Card key={pattern.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <Badge variant="outline" className="capitalize">
                        {getCategoryLabel(pattern.category)}
                      </Badge>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => toggleFavorite(pattern.id)}
                        className="h-8 w-8"
                      >
                        {favorites.includes(pattern.id) ? (
                          <BookmarkCheck className="h-4 w-4 text-primary" />
                        ) : (
                          <Bookmark className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <CardTitle className="text-lg mt-2">{pattern.pattern}</CardTitle>
                    <CardDescription className="mt-1">
                      {pattern.explanation}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-sm mb-1">
                          {userPreferences.language === "zh" ? "回应选项：" : "Response Options:"}
                        </h4>
                        <div className="space-y-3">
                          <div className="p-2 rounded-md bg-blue-50 dark:bg-blue-950">
                            <span className="text-xs font-medium text-blue-800 dark:text-blue-300 block mb-1">
                              {userPreferences.language === "zh" ? "温和方式" : "Gentle Approach"}
                            </span>
                            <p className="text-sm">{pattern.responses.mild}</p>
                          </div>
                          
                          <div className="p-2 rounded-md bg-amber-50 dark:bg-amber-950">
                            <span className="text-xs font-medium text-amber-800 dark:text-amber-300 block mb-1">
                              {userPreferences.language === "zh" ? "坚定立场" : "Assertive Stance"}
                            </span>
                            <p className="text-sm">{pattern.responses.firm}</p>
                          </div>
                          
                          <div className="p-2 rounded-md bg-emerald-50 dark:bg-emerald-950">
                            <span className="text-xs font-medium text-emerald-800 dark:text-emerald-300 block mb-1">
                              {userPreferences.language === "zh" ? "理性分析" : "Logical Analysis"}
                            </span>
                            <p className="text-sm">{pattern.responses.analytical}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-sm mb-1">
                          {userPreferences.language === "zh" ? "关键词：" : "Keywords:"}
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {pattern.keywords.map((keyword, i) => (
                            <Badge key={i} variant="secondary" className="capitalize">
                              {keyword}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-2 p-8 text-center border rounded-lg bg-muted/10">
                <h3 className="font-medium mb-2">
                  {userPreferences.language === "zh" ? "未找到匹配的模式" : "No matching patterns found"}
                </h3>
                <p className="text-muted-foreground">
                  {userPreferences.language === "zh" 
                    ? "请尝试调整搜索条件或查看其他类别"
                    : "Try adjusting your search or view a different category"}
                </p>
              </div>
            )}
          </div>
        </Tabs>
      </div>
    </div>
  );
}