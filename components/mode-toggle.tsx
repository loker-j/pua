"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useEffect, useState } from "react";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { UserPreferences, defaultUserPreferences } from "@/types/user";

export function ModeToggle() {
  const { setTheme, theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [userPreferences] = useLocalStorage<UserPreferences>(
    "userPreferences",
    defaultUserPreferences
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">
            {userPreferences.language === "zh" ? "切换主题" : "Toggle theme"}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          {userPreferences.language === "zh" ? "浅色" : "Light"}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          {userPreferences.language === "zh" ? "深色" : "Dark"}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          {userPreferences.language === "zh" ? "跟随系统" : "System"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}