import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { PUAResponse } from "@/types/pua";
import { CheckCircle2, Copy } from "lucide-react";
import { useState } from "react";

interface ResponseCardProps {
  response: PUAResponse;
  isSelected: boolean;
  onSelect: () => void;
  language?: "zh" | "en";
}

export function ResponseCard({ response, isSelected, onSelect, language = "en" }: ResponseCardProps) {
  const [copied, setCopied] = useState(false);

  const getStyleLabel = (style: string) => {
    if (language === "zh") {
      switch (style) {
        case "mild": return "温和方式";
        case "firm": return "坚定立场";
        case "analytical": return "理性分析";
        default: return style;
      }
    }
    
    switch (style) {
      case "mild": return "Gentle Approach";
      case "firm": return "Assertive Stance";
      case "analytical": return "Logical Analysis";
      default: return style;
    }
  };

  const getStyleColor = (style: string) => {
    switch (style) {
      case "mild": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "firm": return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300";
      case "analytical": return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300";
      default: return "";
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(response.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className={`transition-all ${isSelected ? 'ring-2 ring-primary ring-offset-2' : ''}`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <Badge className={`${getStyleColor(response.style)}`}>
            {getStyleLabel(response.style)}
          </Badge>
          {isSelected && (
            <Badge variant="outline" className="bg-primary/10">
              {language === "zh" ? "已选择" : "Selected"}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="min-h-[100px]">
          <p className="text-md">{response.text}</p>
          <p className="text-sm text-muted-foreground mt-4">{response.explanation}</p>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between gap-2 pt-1">
        <Button variant="outline" size="sm" onClick={copyToClipboard}>
          {copied ? <CheckCircle2 className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
          {copied 
            ? (language === "zh" ? "已复制" : "Copied")
            : (language === "zh" ? "复制" : "Copy")}
        </Button>
        <Button size="sm" onClick={onSelect} variant={isSelected ? "default" : "secondary"}>
          {isSelected 
            ? (language === "zh" ? "已选择" : "Selected")
            : (language === "zh" ? "选择" : "Select")}
        </Button>
      </CardFooter>
    </Card>
  );
}