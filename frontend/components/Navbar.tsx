'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Store, User as UserIcon, LogOut, LogIn, UserPlus, Shield, LayoutDashboard, Compass } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-white/85 dark:bg-zinc-900/85 border-b border-zinc-200 dark:border-zinc-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-orange-500 to-rose-500 flex items-center justify-center text-white shadow-md shadow-orange-500/20 group-hover:scale-105 transition-transform">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-700 dark:from-white dark:via-zinc-200 dark:to-zinc-400">
                StoreRank
              </span>
              <span className="hidden sm:inline-block ml-1.5 text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                Platform
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="flex items-center gap-2 sm:gap-4">
            <Link
              href="/stores"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                pathname.startsWith('/stores')
                  ? 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 font-semibold'
                  : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
              }`}
            >
              <Compass className="w-4 h-4 text-amber-500" />
              <span>Explore Stores</span>
            </Link>

            {user?.role === 'USER' && (
              <Link
                href="/dashboard"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                  pathname === '/dashboard'
                    ? 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30'
                    : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span className="hidden sm:inline">My Ratings</span>
                <span className="sm:hidden">Dashboard</span>
              </Link>
            )}

            {user?.role === 'OWNER' && (
              <Link
                href="/owner"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                  pathname === '/owner'
                    ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/30'
                    : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
                }`}
              >
                <Shield className="w-4 h-4 text-indigo-500" />
                <span>Owner Portal</span>
              </Link>
            )}

            {/* Auth Actions */}
            {user ? (
              <div className="flex items-center gap-2 sm:gap-3 pl-2 sm:pl-4 border-l border-zinc-200 dark:border-zinc-800">
                <Link
                  href="/profile"
                  className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl transition-all ${
                    pathname === '/profile'
                      ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 ring-1 ring-amber-300 dark:ring-amber-800'
                      : 'hover:bg-zinc-100 dark:hover:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300'
                  }`}
                  title="View your profile"
                >
                  <div className="w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0 font-bold text-xs">
                    {user.name ? user.name[0].toUpperCase() : <UserIcon className="w-3.5 h-3.5" />}
                  </div>
                  <div className="hidden sm:flex flex-col text-left">
                    <span className="text-xs font-semibold text-zinc-900 dark:text-white truncate max-w-[130px]">
                      {user.name}
                    </span>
                    <span className="text-[10px] text-zinc-500 dark:text-zinc-400 flex items-center gap-1 leading-none">
                      <span
                        className={`inline-block w-1.5 h-1.5 rounded-full ${
                          user.role === 'OWNER' ? 'bg-indigo-500' : 'bg-emerald-500'
                        }`}
                      />
                      {user.role}
                    </span>
                  </div>
                </Link>

                <button
                  onClick={logout}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition-colors border border-rose-200 dark:border-rose-900/40"
                  title="Logout"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 pl-2 sm:pl-4 border-l border-zinc-200 dark:border-zinc-800">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Log in</span>
                </Link>
                <Link
                  href="/register"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-white bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 rounded-lg shadow-sm shadow-orange-500/20 transition-all transform active:scale-95"
                >
                  <UserPlus className="w-4 h-4" />
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
