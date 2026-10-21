'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import ThemeToggle from '@/components/ThemeToggle';
import {
  Store,
  User as UserIcon,
  LogOut,
  LogIn,
  UserPlus,
  Shield,
  LayoutDashboard,
  Compass,
  Search,
} from 'lucide-react';

export default function Navbar() {
  const { user, logout, isLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const [navSearch, setNavSearch] = useState('');

  const handleNavSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (navSearch.trim()) {
      router.push(`/stores?search=${encodeURIComponent(navSearch.trim())}`);
    } else {
      router.push('/stores');
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-surface border-b border-border transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Left: Brand & Search Bar */}
          <div className="flex items-center gap-3 sm:gap-6">
            <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
              <div className="w-8 h-8 bg-foreground text-background flex items-center justify-center border border-foreground">
                <Store className="w-4 h-4" />
              </div>
              <div className="flex items-center">
                <span className="text-lg font-bold tracking-tight text-foreground">
                  StoreRank
                </span>
                <span className="hidden sm:inline-block ml-2 text-[10px] font-mono uppercase font-bold px-1.5 py-0.5 border border-accent text-accent">
                  PRO
                </span>
              </div>
            </Link>

            {/* Quick Search Form (Stitch feature) */}
            <form onSubmit={handleNavSearch} className="hidden md:flex items-center relative w-48 lg:w-72">
              <Search className="w-3.5 h-3.5 text-muted absolute left-2.5 pointer-events-none" />
              <input
                type="text"
                value={navSearch}
                onChange={(e) => setNavSearch(e.target.value)}
                placeholder="Search stores, brands, tech..."
                className="w-full pl-8 pr-3 py-1.5 text-xs font-mono bg-surface border border-border text-foreground placeholder-muted focus:outline-none focus:border-accent transition-colors"
              />
            </form>
          </div>

          {/* Right: Navigation Links & Actions */}
          <nav className="flex items-center gap-1 sm:gap-2">
            <Link
              href="/stores"
              className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider transition-colors flex items-center gap-1.5 border ${
                pathname.startsWith('/stores')
                  ? 'border-zinc-950 dark:border-white bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 font-bold'
                  : 'border-transparent text-zinc-700 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white hover:border-zinc-300 dark:hover:border-zinc-800'
              }`}
            >
              <Compass
                className={`w-3.5 h-3.5 transition-colors ${
                  pathname.startsWith('/stores')
                    ? 'text-amber-400 dark:text-amber-600'
                    : 'text-amber-600 dark:text-amber-400'
                }`}
              />
              <span>Explore</span>
            </Link>

            {user?.role === 'USER' && (
              <Link
                href="/dashboard"
                className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider transition-colors flex items-center gap-1.5 border ${
                  pathname === '/dashboard'
                    ? 'border-zinc-950 dark:border-white bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 font-bold'
                    : 'border-transparent text-zinc-700 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white hover:border-zinc-300 dark:hover:border-zinc-800'
                }`}
              >
                <LayoutDashboard
                  className={`w-3.5 h-3.5 transition-colors ${
                    pathname === '/dashboard'
                      ? 'text-amber-400 dark:text-amber-600'
                      : 'text-zinc-500 dark:text-zinc-400'
                  }`}
                />
                <span className="hidden sm:inline">My Ratings</span>
                <span className="sm:hidden">Ratings</span>
              </Link>
            )}

            {user?.role === 'OWNER' && (
              <Link
                href="/owner"
                className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider transition-colors flex items-center gap-1.5 border ${
                  pathname === '/owner'
                    ? 'border-zinc-950 dark:border-white bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 font-bold'
                    : 'border-transparent text-zinc-700 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white hover:border-zinc-300 dark:border-zinc-800'
                }`}
              >
                <Shield
                  className={`w-3.5 h-3.5 transition-colors ${
                    pathname === '/owner'
                      ? 'text-amber-400 dark:text-amber-600'
                      : 'text-amber-600 dark:text-amber-400'
                  }`}
                />
                <span>Owner Portal</span>
              </Link>
            )}

            {/* Theme Toggle (Light / Dark) */}
            <div className="flex items-center pl-1.5 sm:pl-2 ml-1 border-l border-zinc-300 dark:border-zinc-800">
              <ThemeToggle />
            </div>

            {/* Auth Actions */}
            {isLoading ? (
              <div className="flex items-center gap-2 pl-2 sm:pl-3 ml-1 sm:ml-2 border-l border-zinc-300 dark:border-zinc-800">
                <div className="w-20 h-7 bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
              </div>
            ) : user ? (
              <div className="flex items-center gap-2 pl-2 sm:pl-3 ml-1 sm:ml-2 border-l border-zinc-300 dark:border-zinc-800">
                <Link
                  href="/profile"
                  className={`flex items-center gap-2 px-2.5 py-1 text-xs border transition-colors ${
                    pathname === '/profile'
                      ? 'border-zinc-950 dark:border-white bg-zinc-200 dark:bg-zinc-900 text-zinc-950 dark:text-white font-bold'
                      : 'border-zinc-300 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                  }`}
                  title="View your profile"
                >
                  <div className="relative">
                    <div className="w-5 h-5 bg-zinc-200 dark:bg-zinc-800 text-zinc-950 dark:text-white flex items-center justify-center shrink-0 font-mono font-bold text-[11px]">
                      {user.name ? user.name[0].toUpperCase() : <UserIcon className="w-3 h-3" />}
                    </div>
                    <span className="absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5 bg-emerald-500" />
                  </div>
                  <div className="hidden sm:flex flex-col text-left">
                    <span className="text-xs font-semibold text-zinc-950 dark:text-white truncate max-w-[120px]">
                      {user.name}
                    </span>
                    <span className="text-[9px] font-mono text-zinc-500 uppercase">
                      {user.role === 'OWNER' ? 'Store Owner' : 'Verified Reviewer'}
                    </span>
                  </div>
                </Link>

                <button
                  onClick={logout}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-mono uppercase text-zinc-600 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white border border-zinc-300 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-3 h-3 text-zinc-500" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 pl-2 sm:pl-3 ml-1 sm:ml-2 border-l border-zinc-300 dark:border-zinc-800">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono uppercase tracking-wider text-zinc-700 dark:text-zinc-300 border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  <LogIn className="w-3.5 h-3.5 text-zinc-600 dark:text-zinc-400" />
                  <span>Log in</span>
                </Link>
                <Link
                  href="/register"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-mono uppercase font-bold tracking-wider text-white bg-zinc-950 hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200 border border-zinc-950 dark:border-white transition-colors"
                >
                  <UserPlus className="w-3.5 h-3.5 text-amber-400 dark:text-amber-600" />
                  <span>Register</span>
                </Link>
              </div>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
