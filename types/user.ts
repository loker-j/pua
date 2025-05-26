import { PUACategory, ResponseStyle } from "./pua";

export interface UserPreferences {
  responseStyle: ResponseStyle;
  preferredCategories: PUACategory[];
  theme: "light" | "dark" | "system";
  language: "zh" | "en";
  historyLength: number;
}

export const defaultUserPreferences: UserPreferences = {
  responseStyle: "firm",
  preferredCategories: ["workplace", "relationship", "family", "general"],
  theme: "system",
  language: "zh",
  historyLength: 50,
};