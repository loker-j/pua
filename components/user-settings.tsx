"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { PUACategory, ResponseStyle } from "@/types/pua";
import { UserPreferences, defaultUserPreferences } from "@/types/user";
import { Info, RotateCcw, Save, Globe2 } from "lucide-react";
import { useTheme } from "next-themes";
import { toast } from "sonner";

interface UserSettingsProps {
  userPreferences: UserPreferences;
  setUserPreferences: (prefs: UserPreferences) => void;
}

export function UserSettings({ userPreferences, setUserPreferences }: UserSettingsProps) {
  const [localPrefs, setLocalPrefs] = useState<UserPreferences>({ ...userPreferences });
  const { setTheme } = useTheme();

  const handleResponseStyleChange = (value: string) => {
    setLocalPrefs({
      ...localPrefs,
      responseStyle: value as ResponseStyle
    });
  };

  const handleCategoryToggle = (category: PUACategory) => {
    const currentCategories = [...localPrefs.preferredCategories];
    
    if (currentCategories.includes(category)) {
      // Don't allow removing the last category
      if (currentCategories.length > 1) {
        setLocalPrefs({
          ...localPrefs,
          preferredCategories: currentCategories.filter(c => c !== category)
        });
      }
    } else {
      setLocalPrefs({
        ...localPrefs,
        preferredCategories: [...currentCategories, category]
      });
    }
  };

  const handleThemeChange = (value: string) => {
    setLocalPrefs({
      ...localPrefs,
      theme: value as "light" | "dark" | "system"
    });
  };

  const handleLanguageChange = (value: string) => {
    setLocalPrefs({
      ...localPrefs,
      language: value as "zh" | "en"
    });
  };

  const handleHistoryLengthChange = (value: number[]) => {
    setLocalPrefs({
      ...localPrefs,
      historyLength: value[0]
    });
  };

  const getCategoryLabel = (category: PUACategory) => {
    const labels = {
      workplace: localPrefs.language === "zh" ? "职场" : "Workplace",
      relationship: localPrefs.language === "zh" ? "感情" : "Relationship",
      family: localPrefs.language === "zh" ? "家庭" : "Family",
      general: localPrefs.language === "zh" ? "通用" : "General",
      "Guilt-tripping": localPrefs.language === "zh" ? "内疚操控" : "Guilt-tripping",
      "Love bombing": localPrefs.language === "zh" ? "爱情轰炸" : "Love bombing",
      "Gaslighting": localPrefs.language === "zh" ? "煤气灯效应" : "Gaslighting",
      "Isolation tactics": localPrefs.language === "zh" ? "孤立策略" : "Isolation tactics",
      "Negging": localPrefs.language === "zh" ? "负面评价" : "Negging"
    };
    return labels[category] || category;
  };

  const getResponseStyleLabel = (style: ResponseStyle) => {
    const labels = {
      mild: localPrefs.language === "zh" ? "温和方式" : "Gentle Approach",
      firm: localPrefs.language === "zh" ? "坚定立场" : "Assertive Stance",
      analytical: localPrefs.language === "zh" ? "理性分析" : "Logical Analysis"
    };
    return labels[style] || style;
  };

  const getResponseStyleDescription = (style: ResponseStyle) => {
    if (localPrefs.language === "zh") {
      switch (style) {
        case "mild":
          return "在设定界限的同时保持非对抗性的回应方式，维护关系";
        case "firm":
          return "清晰、直接的回应，建立强有力的界限";
        case "analytical":
          return "基于事实的回应，专注于逻辑推理而非情感";
        default:
          return "";
      }
    }
    
    switch (style) {
      case "mild":
        return "Non-confrontational responses that maintain relationships while setting boundaries";
      case "firm":
        return "Clear, direct responses that establish strong boundaries";
      case "analytical":
        return "Fact-based responses that focus on logical reasoning rather than emotions";
      default:
        return "";
    }
  };

  const saveChanges = () => {
    setUserPreferences(localPrefs);
    setTheme(localPrefs.theme);
    toast.success(
      localPrefs.language === "zh" ? "设置保存成功" : "Settings saved successfully",
      {
        description: localPrefs.language === "zh" ? "您的偏好设置已更新" : "Your preferences have been updated",
        position: "bottom-right",
      }
    );
  };

  const resetToDefaults = () => {
    setLocalPrefs({ ...defaultUserPreferences });
    toast.info(
      localPrefs.language === "zh" ? "设置已重置为默认值" : "Settings reset to defaults",
      {
        description: localPrefs.language === "zh" ? "点击保存以应用这些更改" : "Click Save to apply these changes",
        position: "bottom-right",
      }
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold">
            {localPrefs.language === "zh" ? "用户设置" : "User Settings"}
          </h2>
          <p className="text-muted-foreground mt-1">
            {localPrefs.language === "zh" ? "自定义您的 PUA Shield 使用体验" : "Customize your experience with PUA Shield"}
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Language Settings */}
        <Card>
          <CardHeader>
            <CardTitle>{localPrefs.language === "zh" ? "语言设置" : "Language Settings"}</CardTitle>
            <CardDescription>
              {localPrefs.language === "zh" ? "选择您偏好的语言" : "Choose your preferred language"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Globe2 className="h-4 w-4 text-muted-foreground" />
                <Label>{localPrefs.language === "zh" ? "语言" : "Language"}</Label>
              </div>
              <Select 
                value={localPrefs.language} 
                onValueChange={handleLanguageChange}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="zh">中文</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Response Style Preferences */}
        <Card>
          <CardHeader>
            <CardTitle>{localPrefs.language === "zh" ? "回应风格" : "Response Style"}</CardTitle>
            <CardDescription>
              {localPrefs.language === "zh" ? "选择您偏好的回应建议风格" : "Choose your preferred style for response suggestions"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <RadioGroup 
              value={localPrefs.responseStyle} 
              onValueChange={handleResponseStyleChange}
              className="space-y-4"
            >
              {(["mild", "firm", "analytical"] as ResponseStyle[]).map((style) => (
                <div key={style} className="flex items-start space-x-3">
                  <RadioGroupItem value={style} id={`style-${style}`} className="mt-1" />
                  <div className="space-y-1 w-full">
                    <div className="flex items-center">
                      <Label htmlFor={`style-${style}`} className="font-medium cursor-pointer">
                        {getResponseStyleLabel(style)}
                      </Label>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {getResponseStyleDescription(style)}
                    </p>
                  </div>
                </div>
              ))}
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Categories */}
        <Card>
          <CardHeader>
            <CardTitle>{localPrefs.language === "zh" ? "类别偏好" : "Category Preferences"}</CardTitle>
            <CardDescription>
              {localPrefs.language === "zh" ? "选择您想要关注的操控性语言类型" : "Select the types of manipulative language you want to focus on"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(["workplace", "relationship", "family", "general"] as PUACategory[]).map((category) => (
                <div key={category} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`category-${category}`} 
                    checked={localPrefs.preferredCategories.includes(category)}
                    onCheckedChange={() => handleCategoryToggle(category)}
                    disabled={localPrefs.preferredCategories.length === 1 && localPrefs.preferredCategories.includes(category)}
                  />
                  <Label 
                    htmlFor={`category-${category}`}
                    className="cursor-pointer"
                  >
                    {getCategoryLabel(category)}
                  </Label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Theme Settings */}
        <Card>
          <CardHeader>
            <CardTitle>{localPrefs.language === "zh" ? "外观" : "Appearance"}</CardTitle>
            <CardDescription>
              {localPrefs.language === "zh" ? "自定义应用的外观" : "Customize the look and feel of the application"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>{localPrefs.language === "zh" ? "主题" : "Theme"}</Label>
              <Select 
                value={localPrefs.theme} 
                onValueChange={handleThemeChange}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">{localPrefs.language === "zh" ? "浅色" : "Light"}</SelectItem>
                  <SelectItem value="dark">{localPrefs.language === "zh" ? "深色" : "Dark"}</SelectItem>
                  <SelectItem value="system">{localPrefs.language === "zh" ? "跟随系统" : "System"}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* History Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle>{localPrefs.language === "zh" ? "历史记录设置" : "History Settings"}</CardTitle>
                <CardDescription>
                  {localPrefs.language === "zh" ? "管理您的分析历史记录" : "Manage your analysis history"}
                </CardDescription>
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-5 w-5 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="w-[200px] text-sm">
                      {localPrefs.language === "zh" 
                        ? "此设置控制历史记录中存储的分析数量。所有历史记录都存储在您的设备上。"
                        : "This setting controls how many analyses are stored in your history. All history is stored locally on your device."}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>{localPrefs.language === "zh" ? "历史记录长度" : "History Length"}</Label>
                  <span className="text-sm text-muted-foreground">
                    {localPrefs.historyLength} {localPrefs.language === "zh" ? "条" : "entries"}
                  </span>
                </div>
                <Slider 
                  min={10}
                  max={100}
                  step={10}
                  value={[localPrefs.historyLength]}
                  onValueChange={handleHistoryLengthChange}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-end">
        <Button
          variant="outline"
          onClick={resetToDefaults}
          className="space-x-2"
        >
          <RotateCcw className="h-4 w-4" />
          <span>{localPrefs.language === "zh" ? "重置为默认值" : "Reset to Defaults"}</span>
        </Button>
        <Button
          onClick={saveChanges}
          className="space-x-2"
        >
          <Save className="h-4 w-4" />
          <span>{localPrefs.language === "zh" ? "保存更改" : "Save Changes"}</span>
        </Button>
      </div>
    </div>
  );
}