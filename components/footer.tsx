"use client";

import { useLocalStorage } from "@/hooks/use-local-storage";
import { UserPreferences, defaultUserPreferences } from "@/types/user";

export function Footer() {
  const [userPreferences] = useLocalStorage<UserPreferences>(
    "userPreferences",
    defaultUserPreferences
  );

  return (
    <footer className="border-t py-6 md:py-0">
      <div className="container flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row">
        <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
          {userPreferences.language === "zh" 
            ? `反PUA大师 © ${new Date().getFullYear()} - 帮助建立更健康的沟通方式`
            : `PUA Shield © ${new Date().getFullYear()} - Helping build healthier communication`}
        </p>
        <p className="text-center text-sm text-muted-foreground md:text-left">
          {userPreferences.language === "zh"
            ? "仅供教育目的。如遇严重情况请寻求专业帮助。"
            : "For educational purposes only. Seek professional help for serious situations."}
        </p>
      </div>
    </footer>
  );
}