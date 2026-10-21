'use client';

import React from 'react';
import { useTheme } from '@/context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div
      role="group"
      aria-label="Theme selector"
      className="inline-flex items-center border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs font-mono select-none"
    >
      <button
        type="button"
        onClick={() => setTheme('light')}
        aria-pressed={theme === 'light'}
        title="Switch to light mode (Chrome Yellow)"
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 uppercase tracking-wider font-semibold transition-colors ${
          theme === 'light'
            ? 'bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 border-r border-zinc-950 dark:border-white'
            : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white border-r border-zinc-300 dark:border-zinc-700'
        }`}
      >
        <Sun className="w-3.5 h-3.5 text-amber-500 shrink-0" />
        <span className="hidden sm:inline">Light</span>
      </button>

      <button
        type="button"
        onClick={() => setTheme('dark')}
        aria-pressed={theme === 'dark'}
        title="Switch to dark mode (Monochromatic Zinc)"
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 uppercase tracking-wider font-semibold transition-colors ${
          theme === 'dark'
            ? 'bg-zinc-950 text-white dark:bg-white dark:text-zinc-950'
            : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white'
        }`}
      >
        <Moon className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400 shrink-0" />
        <span className="hidden sm:inline">Dark</span>
      </button>
    </div>
  );
}
