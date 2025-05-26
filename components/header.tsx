"use client";

import { ModeToggle } from "@/components/mode-toggle";
import { ShieldCheck } from "lucide-react";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { UserPreferences, defaultUserPreferences } from "@/types/user";

export function Header() {
  const [userPreferences] = useLocalStorage<UserPreferences>(
    "userPreferences",
    defaultUserPreferences
  );

  const getSlogan = () => {
    if (userPreferences.language === "zh") {
      return "⚡ 识破包装精美的语言陷阱";
    }
    return "⚡ Expose Beautifully Packaged Emotional Traps";
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-20 items-center justify-between">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">
              {userPreferences.language === "zh" ? "反PUA大师" : "PUA Shield"}
            </h1>
          </div>
          <p className="text-sm text-muted-foreground font-medium">
            {getSlogan()}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <ModeToggle />
        </div>
      </div>
    </header>
  );
}