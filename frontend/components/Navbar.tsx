'use client';

import React, { useState, useEffect } from 'react';
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
  Menu,
  X,
  PlusCircle,
  Bookmark,
} from 'lucide-react';

export default function Navbar() {
  const { user, logout, isLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const [navSearch, setNavSearch] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close mobile menus whenever route changes
  useEffect(() => {
    setMobileMenuOpen(false);
    setMobileSearchOpen(false);
  }, [pathname]);

  const handleNavSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (navSearch.trim()) {
      router.push(`/stores?search=${encodeURIComponent(navSearch.trim())}`);
      setMobileSearchOpen(false);
    } else {
      router.push('/stores');
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-surface border-b border-border transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2 sm:gap-4">
          {/* Left: Brand & Desktop Search Bar */}
          <div className="flex items-center gap-3 sm:gap-6 min-w-0">
            <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
              <div className="w-8 h-8 bg-amber-50/80 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-[4px] flex items-center justify-center">
                <Store className="w-4 h-4 text-amber-500" />
              </div>
              <span className="text-base sm:text-lg font-bold tracking-tight text-foreground truncate">
                StoreRank
              </span>
            </Link>

            {/* Desktop Quick Search Form */}
            <form onSubmit={handleNavSearch} className="hidden md:flex items-center relative w-48 lg:w-72">
              <Search className="w-3.5 h-3.5 text-muted absolute left-2.5 pointer-events-none" />
              <input
                type="text"
                value={navSearch}
                onChange={(e) => setNavSearch(e.target.value)}
                placeholder="Search stores, brands..."
                className="w-full pl-8 pr-3 py-1.5 text-xs font-mono bg-surface border border-border text-foreground placeholder-muted focus:outline-none focus:border-accent transition-colors"
              />
            </form>
          </div>

          {/* Desktop Navigation Links & Actions (hidden on mobile) */}
          <nav className="hidden md:flex items-center gap-1 sm:gap-2">
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

            {mounted && user?.role === 'USER' && (
              <Link
                href="/dashboard"
                className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider transition-colors flex items-center gap-1.5 border ${
                  pathname === '/dashboard'
                    ? 'border-zinc-950 dark:border-white bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 font-bold'
                    : 'border-transparent text-zinc-700 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white hover:border-zinc-300 dark:border-zinc-800'
                }`}
              >
                <LayoutDashboard
                  className={`w-3.5 h-3.5 transition-colors ${
                    pathname === '/dashboard'
                      ? 'text-amber-400 dark:text-amber-600'
                      : 'text-zinc-500 dark:text-zinc-400'
                  }`}
                />
                <span>My Ratings</span>
              </Link>
            )}

            {mounted && user?.role === 'OWNER' && (
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

            {/* Theme Toggle */}
            <div className="flex items-center pl-1.5 sm:pl-2 ml-1 border-l border-zinc-300 dark:border-zinc-800">
              <ThemeToggle />
            </div>

            {/* Auth Actions (Desktop) */}
            {!mounted || isLoading ? (
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
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-semibold text-zinc-950 dark:text-white truncate max-w-[110px]">
                      {user.name}
                    </span>
                    <span className="text-[9px] font-mono text-zinc-500 uppercase">
                      {user.role === 'OWNER' ? 'Owner' : 'Shopper'}
                    </span>
                  </div>
                </Link>

                <button
                  onClick={logout}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-mono uppercase text-zinc-600 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white border border-zinc-300 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-3 h-3 text-zinc-500" />
                  <span>Logout</span>
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

          {/* MOBILE RIGHT CONTROLS (< md) */}
          <div className="flex md:hidden items-center gap-1">
            {/* Mobile Search Toggle */}
            <button
              type="button"
              onClick={() => {
                setMobileSearchOpen(!mobileSearchOpen);
                if (mobileMenuOpen) setMobileMenuOpen(false);
              }}
              aria-label="Toggle mobile search"
              className={`p-2 text-muted hover:text-foreground border transition-colors ${
                mobileSearchOpen ? 'border-foreground text-foreground bg-muted-fill' : 'border-transparent'
              }`}
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Mobile Theme Toggle */}
            <ThemeToggle />

            {/* Mobile Hamburger Menu Button */}
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(!mobileMenuOpen);
                if (mobileSearchOpen) setMobileSearchOpen(false);
              }}
              aria-label="Toggle mobile menu"
              className={`p-2 border transition-colors ${
                mobileMenuOpen
                  ? 'border-foreground bg-foreground text-background'
                  : 'border-border text-foreground hover:bg-muted-fill'
              }`}
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE QUICK SEARCH ROW (Dropdown on mobile) */}
      {mobileSearchOpen && (
        <div className="md:hidden border-t border-border bg-surface p-3 transition-all animate-in slide-in-from-top-2">
          <form onSubmit={handleNavSearch} className="relative flex items-center">
            <Search className="w-4 h-4 text-muted absolute left-3 pointer-events-none" />
            <input
              type="text"
              autoFocus
              value={navSearch}
              onChange={(e) => setNavSearch(e.target.value)}
              placeholder="Search stores, brands, tech..."
              className="w-full pl-9 pr-20 py-2 text-sm font-mono bg-background border border-border text-foreground placeholder-muted focus:outline-none focus:border-accent"
            />
            <button
              type="submit"
              className="absolute right-1 px-3 py-1 bg-foreground text-background text-xs font-mono uppercase font-bold"
            >
              Go
            </button>
          </form>
        </div>
      )}

      {/* MOBILE NAVIGATION DRAWER (< md) */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-surface px-4 py-4 space-y-4 shadow-xl animate-in slide-in-from-top-2">
          {/* User Profile Summary (if logged in) */}
          {user && (
            <div className="flex items-center justify-between p-3 bg-muted-fill border border-border">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 bg-surface border border-border text-foreground flex items-center justify-center font-mono font-bold text-sm shrink-0">
                  {user.name ? user.name[0].toUpperCase() : <UserIcon className="w-4 h-4" />}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-foreground truncate">{user.name}</div>
                  <div className="text-[10px] font-mono text-muted uppercase">
                    {user.role === 'OWNER' ? 'Store Owner' : 'Verified Reviewer'}
                  </div>
                </div>
              </div>
              <Link
                href="/profile"
                className="text-[11px] font-mono uppercase font-bold text-foreground underline"
              >
                Profile →
              </Link>
            </div>
          )}

          {/* Navigation Links */}
          <div className="grid grid-cols-1 gap-1.5 font-mono text-xs uppercase font-bold">
            <Link
              href="/stores"
              className={`p-3 flex items-center justify-between border transition-colors ${
                pathname.startsWith('/stores')
                  ? 'bg-foreground text-background border-foreground'
                  : 'bg-background border-border text-foreground hover:bg-muted-fill'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Compass className="w-4 h-4 text-accent" />
                <span>Explore Stores</span>
              </div>
              <span className="text-[10px] text-muted">All</span>
            </Link>

            {user?.role === 'USER' && (
              <Link
                href="/dashboard"
                className={`p-3 flex items-center justify-between border transition-colors ${
                  pathname === '/dashboard'
                    ? 'bg-foreground text-background border-foreground'
                    : 'bg-background border-border text-foreground hover:bg-muted-fill'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <LayoutDashboard className="w-4 h-4 text-accent" />
                  <span>My Ratings &amp; Reviews</span>
                </div>
                <span className="text-[10px] text-muted">Dashboard</span>
              </Link>
            )}

            {user?.role === 'OWNER' && (
              <>
                <Link
                  href="/owner"
                  className={`p-3 flex items-center justify-between border transition-colors ${
                    pathname === '/owner'
                      ? 'bg-foreground text-background border-foreground'
                      : 'bg-background border-border text-foreground hover:bg-muted-fill'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Shield className="w-4 h-4 text-accent" />
                    <span>Owner Portal</span>
                  </div>
                  <span className="text-[10px] text-muted">Manage</span>
                </Link>

                <Link
                  href="/owner/onboarding"
                  className="p-3 flex items-center justify-between border border-dashed border-border bg-muted-fill text-foreground hover:border-foreground transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <PlusCircle className="w-4 h-4 text-accent" />
                    <span>+ Add New Store</span>
                  </div>
                  <span className="text-[10px] font-mono text-muted">Create</span>
                </Link>
              </>
            )}

            {user && (
              <Link
                href="/profile"
                className={`p-3 flex items-center justify-between border transition-colors ${
                  pathname === '/profile'
                    ? 'bg-foreground text-background border-foreground'
                    : 'bg-background border-border text-foreground hover:bg-muted-fill'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <UserIcon className="w-4 h-4 text-accent" />
                  <span>Account &amp; Security</span>
                </div>
                <span className="text-[10px] text-muted">Settings</span>
              </Link>
            )}
          </div>

          {/* Auth Button Row on Mobile */}
          <div className="pt-2 border-t border-border">
            {user ? (
              <button
                type="button"
                onClick={logout}
                className="w-full h-11 border border-border bg-muted-fill text-foreground text-xs font-mono uppercase font-bold flex items-center justify-center gap-2 hover:bg-red-500/10 hover:border-red-500 hover:text-red-500 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out of StoreRank</span>
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/login"
                  className="h-11 border border-border bg-surface text-foreground text-xs font-mono uppercase font-bold flex items-center justify-center gap-2 hover:bg-muted-fill transition-colors"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Log In</span>
                </Link>
                <Link
                  href="/register"
                  className="h-11 border border-foreground bg-foreground text-background text-xs font-mono uppercase font-bold flex items-center justify-center gap-2 hover:bg-accent-hover transition-colors"
                >
                  <UserPlus className="w-4 h-4 text-amber-400" />
                  <span>Sign Up</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
