
"use client"

import * as React from "react"
import { Moon, Sun, Monitor } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme()
  const [currentTheme, setCurrentTheme] = React.useState('system');

  React.useEffect(() => {
    // On mount, set the theme to system to get the initial resolved theme.
    setTheme('system');
  }, [setTheme]);


  React.useEffect(() => {
    if(theme) {
      setCurrentTheme(theme)
    }
  }, [theme]);
  

  const toggleTheme = () => {
    if (theme === "light") {
      setTheme("dark")
    } else if (theme === "dark") {
      setTheme("system")
    } else {
      setTheme("light")
    }
  }

  const themeIcon = React.useMemo(() => {
    if (currentTheme === "light") return <Sun className="h-[1.2rem] w-[1.2rem]" />;
    if (currentTheme === "dark") return <Moon className="h-[1.2rem] w-[1.2rem]" />;
    return <Monitor className="h-[1.2rem] w-[1.2rem]" />;
  }, [currentTheme]);

  const themeLabel = React.useMemo(() => {
    if (currentTheme === "light") return "Light";
    if (currentTheme === "dark") return "Dark";
    return "System";
  }, [currentTheme]);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" onClick={toggleTheme}>
            {themeIcon}
            <span className="sr-only">Toggle theme</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Switch to {theme === 'light' ? 'Dark' : theme === 'dark' ? 'System' : 'Light'} ({themeLabel})</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
