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
        title="Switch to light mode"
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 uppercase tracking-wider font-semibold transition-colors border-r ${
          theme === 'light'
            ? 'bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 border-zinc-950 dark:border-white font-bold'
            : 'text-zinc-600 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white border-zinc-300 dark:border-zinc-700'
        }`}
      >
        <Sun
          className={`w-3.5 h-3.5 shrink-0 transition-colors ${
            theme === 'light'
              ? 'text-amber-400 dark:text-amber-600 fill-amber-400/40'
              : 'text-amber-600 dark:text-amber-400'
          }`}
        />
        <span className="hidden sm:inline">Light</span>
      </button>

      <button
        type="button"
        onClick={() => setTheme('dark')}
        aria-pressed={theme === 'dark'}
        title="Switch to dark mode"
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 uppercase tracking-wider font-semibold transition-colors ${
          theme === 'dark'
            ? 'bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 font-bold'
            : 'text-zinc-600 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white'
        }`}
      >
        <Moon
          className={`w-3.5 h-3.5 shrink-0 transition-colors ${
            theme === 'dark'
              ? 'text-amber-400 dark:text-amber-600 fill-amber-400/40'
              : 'text-zinc-500 dark:text-zinc-400'
          }`}
        />
        <span className="hidden sm:inline">Dark</span>
      </button>
    </div>
  );
}
