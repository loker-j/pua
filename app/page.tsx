import { ThemeProvider } from "@/components/theme-provider";
import { Home } from "@/components/home";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <ThemeProvider attribute="class" defaultTheme="light">
        <Home />
      </ThemeProvider>
    </div>
  );
}