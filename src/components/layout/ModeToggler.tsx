// ...existing code...
import React, { useState } from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";

export function ModeToggle() {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        aria-label="Toggle theme menu"
        onClick={() => setOpen((v) => !v)}
        className="relative inline-flex items-center justify-center h-8 w-8 rounded-full border bg-transparent p-0"
      >
        <Sun
          className={`h-4 w-4 transition-opacity ${theme === "dark" ? "opacity-0" : "opacity-100"}`}
        />
        <Moon
          className={`absolute h-4 w-4 transition-opacity ${theme === "dark" ? "opacity-100" : "opacity-0"}`}
        />
        <span className="sr-only">Toggle theme</span>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-36 rounded-md border bg-white dark:bg-gray-800 shadow-md z-50">
          <button
            type="button"
            onClick={() => {
              setTheme("light");
              setOpen(false);
            }}
            className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            Light
          </button>
          <button
            type="button"
            onClick={() => {
              setTheme("dark");
              setOpen(false);
            }}
            className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            Dark
          </button>
          <button
            type="button"
            onClick={() => {
              setTheme("system");
              setOpen(false);
            }}
            className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            System
          </button>
        </div>
      )}
    </div>
  );
}