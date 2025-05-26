import { cn } from "@/lib/utils";

interface SeverityMeterProps {
  severity: number; // 1-10
  language?: "zh" | "en";
}

export function SeverityMeter({ severity, language = "en" }: SeverityMeterProps) {
  const normalizedSeverity = Math.max(1, Math.min(10, severity));
  const segments = 10;
  const activeSegments = normalizedSeverity;
  
  const getColor = (index: number) => {
    if (index >= activeSegments) return "bg-muted";
    
    if (normalizedSeverity <= 3) return "bg-green-500";
    if (normalizedSeverity <= 6) return "bg-amber-500";
    return "bg-red-500";
  };

  const getSeverityLabel = () => {
    if (language === "zh") {
      if (normalizedSeverity <= 3) return "低";
      if (normalizedSeverity <= 6) return "中等";
      if (normalizedSeverity <= 8) return "高";
      return "严重";
    }
    
    if (normalizedSeverity <= 3) return "Low";
    if (normalizedSeverity <= 6) return "Moderate";
    if (normalizedSeverity <= 8) return "High";
    return "Severe";
  };
  
  const getSeverityTextColor = () => {
    if (normalizedSeverity <= 3) return "text-green-600 dark:text-green-400";
    if (normalizedSeverity <= 6) return "text-amber-600 dark:text-amber-400";
    return "text-red-600 dark:text-red-400";
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex gap-1">
          {Array.from({ length: segments }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "h-2 w-4 rounded-sm transition-colors",
                getColor(i)
              )}
            />
          ))}
        </div>
        <span className={cn("font-medium text-sm ml-2", getSeverityTextColor())}>
          {getSeverityLabel()} ({normalizedSeverity}/10)
        </span>
      </div>
    </div>
  );
}