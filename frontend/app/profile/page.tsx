'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { DashboardStats } from '@/types';
import {
  User as UserIcon,
  Shield,
  Key,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  MapPin,
  Phone,
  Building,
  FileText,
  Star,
  ThumbsUp,
  Bookmark,
  Award,
  ArrowLeft,
  Lock,
} from 'lucide-react';

export default function ProfilePage() {
  const { user, refreshUser, logout, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();

  // Active Tab
  const [activeTab, setActiveTab] = useState<'info' | 'security' | 'danger'>('info');

  // Profile Form State
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  // Password Change State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Feedback State
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Delete Confirmation Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  // Live password validation
  const hasLength = newPassword.length >= 8 && newPassword.length <= 16;
  const hasUpper = /[A-Z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(newPassword);
  const isPasswordValid = hasLength && hasUpper && hasNumber && hasSpecial;
  const passwordsMatch = newPassword === confirmPassword && newPassword.length > 0;

  // Initialize form when user data is available
  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.push('/login');
      return;
    }

    if (user) {
      setName(user.name || '');
      setAddress(user.address || '');
      setCity(user.city || '');
      setPhone(user.phone || '');
      setBio(user.bio || '');
      setAvatarUrl(user.avatarUrl || '');

      // Load user stats
      api.users.getDashboardStats()
        .then((res) => setStats(res))
        .catch(() => {});
    }
  }, [user, isAuthLoading, router]);

  // Handle Profile Update
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(null);
    setErrorMessage(null);

    try {
      await api.users.updateProfile({
        name,
        address,
        city,
        phone,
        bio,
        avatarUrl,
      });
      await refreshUser();
      setSaveSuccess('Profile details saved successfully.');
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle Password Change
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPasswordValid) {
      setErrorMessage('New password does not meet the complexity requirements.');
      return;
    }
    if (!passwordsMatch) {
      setErrorMessage('New passwords do not match.');
      return;
    }

    setIsSaving(true);
    setSaveSuccess(null);
    setErrorMessage(null);

    try {
      await api.users.changePassword({
        currentPassword,
        newPassword,
      });
      setSaveSuccess('Password changed successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to change password. Ensure your current password is correct.');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle Account Deletion
  const handleDeleteAccount = async () => {
    if (deleteConfirmationText.trim().toUpperCase() !== 'DELETE') {
      setErrorMessage('Please type DELETE to confirm account removal.');
      return;
    }

    setIsDeleting(true);
    try {
      await api.users.deleteAccount();
      await logout();
      router.push('/');
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to delete account.');
      setIsDeleting(false);
    }
  };

  if (isAuthLoading || !user) {
    return (
      <div className="flex-1 flex items-center justify-center p-12">
        <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
      </div>
    );
  }

  return (
    <div className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Back to Dashboard / Owner Portal Link */}
      <div>
        <Link
          href={user.role === 'OWNER' ? '/owner' : '/dashboard'}
          className="inline-flex items-center gap-1.5 text-xs font-mono uppercase font-bold text-muted hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{user.role === 'OWNER' ? 'Back to Owner Portal' : 'Back to Dashboard'}</span>
        </Link>
      </div>

      {/* Header Banner */}
      <div className="p-6 bg-surface border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-foreground text-background flex items-center justify-center font-mono font-extrabold text-2xl border border-foreground shrink-0">
            {user.name ? user.name[0].toUpperCase() : 'U'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight font-mono">
                {user.name}
              </h1>
              <span className="px-2 py-0.5 text-[10px] font-mono uppercase font-bold bg-muted-fill text-muted border border-border">
                {user.role}
              </span>
            </div>
            <p className="text-xs font-mono text-muted mt-0.5">{user.email}</p>
            {user.city && (
              <span className="inline-flex items-center gap-1 text-[11px] font-mono text-muted mt-1">
                <MapPin className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                <span>{user.city}</span>
              </span>
            )}
          </div>
        </div>

        {/* Quick KPI stats */}
        {stats && (
          <div className="flex items-center gap-4 border-t sm:border-t-0 sm:border-l border-border pt-3 sm:pt-0 sm:pl-6">
            <div className="text-center">
              <span className="block text-lg font-mono font-bold text-foreground">
                {stats.totalRatings}
              </span>
              <span className="text-[10px] font-mono uppercase text-muted">Reviews</span>
            </div>
            <div className="text-center">
              <span className="block text-lg font-mono font-bold text-foreground">
                {stats.totalHelpfulVotes}
              </span>
              <span className="text-[10px] font-mono uppercase text-muted">Helpful</span>
            </div>
            <div className="text-center">
              <span className="block text-lg font-mono font-bold text-foreground">
                {stats.bookmarkedCount}
              </span>
              <span className="text-[10px] font-mono uppercase text-muted">Saved</span>
            </div>
          </div>
        )}
      </div>

      {/* Alerts */}
      {saveSuccess && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-xs font-mono flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>{saveSuccess}</span>
        </div>
      )}
      {errorMessage && (
        <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-800 text-red-900 dark:text-red-200 text-xs font-mono flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Tabs Layout */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Navigation Sidebar */}
        <nav className="flex flex-row md:flex-col gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <button
            type="button"
            onClick={() => { setActiveTab('info'); setErrorMessage(null); setSaveSuccess(null); }}
            className={`flex-1 sm:flex-initial md:w-full shrink-0 whitespace-nowrap flex items-center justify-center md:justify-start gap-2 px-3.5 py-2.5 text-xs font-mono uppercase font-bold text-left transition-colors border ${
              activeTab === 'info'
                ? 'bg-foreground text-background border-foreground'
                : 'bg-surface text-foreground border-border hover:bg-muted-fill'
            }`}
          >
            <UserIcon className={`w-3.5 h-3.5 ${activeTab === 'info' ? 'text-amber-400 dark:text-amber-600' : 'text-muted'}`} />
            <span>Profile Details</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('security'); setErrorMessage(null); setSaveSuccess(null); }}
            className={`flex-1 sm:flex-initial md:w-full shrink-0 whitespace-nowrap flex items-center justify-center md:justify-start gap-2 px-3.5 py-2.5 text-xs font-mono uppercase font-bold text-left transition-colors border ${
              activeTab === 'security'
                ? 'bg-foreground text-background border-foreground'
                : 'bg-surface text-foreground border-border hover:bg-muted-fill'
            }`}
          >
            <Key className={`w-3.5 h-3.5 ${activeTab === 'security' ? 'text-amber-400 dark:text-amber-600' : 'text-muted'}`} />
            <span>Password</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('danger'); setErrorMessage(null); setSaveSuccess(null); }}
            className={`flex-1 sm:flex-initial md:w-full shrink-0 whitespace-nowrap flex items-center justify-center md:justify-start gap-2 px-3.5 py-2.5 text-xs font-mono uppercase font-bold text-left transition-colors border ${
              activeTab === 'danger'
                ? 'bg-red-600 text-white border-red-600'
                : 'bg-surface text-red-600 dark:text-red-400 border-border hover:bg-red-50 dark:hover:bg-red-950/20'
            }`}
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Danger Zone</span>
          </button>
        </nav>

        {/* Tab Content Panel */}
        <div className="md:col-span-3">
          {/* TAB 1: Profile Details */}
          {activeTab === 'info' && (
            <div className="bg-surface border border-border p-6 space-y-5">
              <div className="pb-3 border-b border-border">
                <h2 className="text-sm font-bold uppercase tracking-wider text-foreground font-mono">
                  Personal &amp; Contact Information
                </h2>
                <p className="text-xs text-muted mt-0.5">
                  Update your public name, primary address, and reviewer bio displayed across the platform.
                </p>
              </div>

              <form onSubmit={handleProfileSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div>
                    <label className="block text-xs font-mono uppercase font-bold text-foreground mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Jane Doe"
                      className="w-full h-9 px-3 bg-muted-fill border border-border text-xs text-foreground placeholder-muted focus:outline-none focus:border-accent font-mono"
                    />
                  </div>

                  {/* Registered Email (Read-Only) */}
                  <div>
                    <label className="block text-xs font-mono uppercase font-bold text-foreground mb-1">
                      Registered Email <span className="text-[10px] text-muted lowercase">(read-only)</span>
                    </label>
                    <input
                      type="email"
                      disabled
                      value={user.email}
                      className="w-full h-9 px-3 bg-surface border border-border text-xs text-muted font-mono opacity-80 cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* City */}
                  <div>
                    <label className="block text-xs font-mono uppercase font-bold text-foreground mb-1">
                      City / Region
                    </label>
                    <div className="relative">
                      <Building className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="New York, NY"
                        className="w-full h-9 pl-8 pr-3 bg-muted-fill border border-border text-xs text-foreground placeholder-muted focus:outline-none focus:border-accent font-mono"
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-xs font-mono uppercase font-bold text-foreground mb-1">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+1 (555) 000-0000"
                        className="w-full h-9 pl-8 pr-3 bg-muted-fill border border-border text-xs text-foreground placeholder-muted focus:outline-none focus:border-accent font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Street Address */}
                <div>
                  <label className="block text-xs font-mono uppercase font-bold text-foreground mb-1">
                    Street Address
                  </label>
                  <div className="relative">
                    <MapPin className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-muted pointer-events-none" />
                    <textarea
                      rows={2}
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="123 Broadway, Suite 400"
                      className="w-full p-2.5 pl-8 bg-muted-fill border border-border text-xs text-foreground placeholder-muted focus:outline-none focus:border-accent font-mono resize-none"
                    />
                  </div>
                </div>

                {/* Reviewer Bio */}
                <div>
                  <label className="block text-xs font-mono uppercase font-bold text-foreground mb-1">
                    Reviewer Bio
                  </label>
                  <textarea
                    rows={3}
                    maxLength={300}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell local shops and fellow shoppers about your rating background and interests..."
                    className="w-full p-2.5 bg-muted-fill border border-border text-xs text-foreground placeholder-muted focus:outline-none focus:border-accent font-mono resize-none"
                  />
                  <span className="text-[10px] font-mono text-muted block text-right mt-0.5">
                    {bio.length} / 300 characters
                  </span>
                </div>

                {/* Submit Action */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="h-9 px-5 bg-foreground text-background text-xs font-mono uppercase font-bold flex items-center gap-1.5 border border-foreground hover:bg-accent-hover transition-colors disabled:opacity-50"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Saving Changes...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 dark:text-amber-600" />
                        <span>Save Profile</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 2: Change Password */}
          {activeTab === 'security' && (
            <div className="bg-surface border border-border p-6 space-y-5">
              <div className="pb-3 border-b border-border">
                <h2 className="text-sm font-bold uppercase tracking-wider text-foreground font-mono">
                  Account Password &amp; Authentication
                </h2>
                <p className="text-xs text-muted mt-0.5">
                  Update your account password regularly to keep your evaluations and merchant actions secure.
                </p>
              </div>

              <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-md">
                {/* Current Password */}
                <div>
                  <label className="block text-xs font-mono uppercase font-bold text-foreground mb-1">
                    Current Password
                  </label>
                  <div className="relative">
                    <Lock className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
                    <input
                      type="password"
                      required
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full h-9 pl-8 pr-3 bg-muted-fill border border-border text-xs text-foreground placeholder-muted focus:outline-none focus:border-accent font-mono tracking-wider"
                    />
                  </div>
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-xs font-mono uppercase font-bold text-foreground mb-1">
                    New Password
                  </label>
                  <div className="relative">
                    <Key className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full h-9 pl-8 pr-3 bg-muted-fill border border-border text-xs text-foreground placeholder-muted focus:outline-none focus:border-accent font-mono tracking-wider"
                    />
                  </div>

                  {/* Requirements checklist */}
                  {newPassword && (
                    <div className="mt-2 space-y-1 text-[11px] font-mono">
                      <div className={`flex items-center gap-1.5 ${hasLength ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted'}`}>
                        <span>{hasLength ? '✓' : '•'} 8 to 16 characters</span>
                      </div>
                      <div className={`flex items-center gap-1.5 ${hasUpper ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted'}`}>
                        <span>{hasUpper ? '✓' : '•'} At least 1 uppercase letter</span>
                      </div>
                      <div className={`flex items-center gap-1.5 ${hasNumber ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted'}`}>
                        <span>{hasNumber ? '✓' : '•'} At least 1 number</span>
                      </div>
                      <div className={`flex items-center gap-1.5 ${hasSpecial ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted'}`}>
                        <span>{hasSpecial ? '✓' : '•'} At least 1 special character (!@#$%^&*)</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Confirm New Password */}
                <div>
                  <label className="block text-xs font-mono uppercase font-bold text-foreground mb-1">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <Key className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full h-9 pl-8 pr-3 bg-muted-fill border border-border text-xs text-foreground placeholder-muted focus:outline-none focus:border-accent font-mono tracking-wider"
                    />
                  </div>
                  {confirmPassword && !passwordsMatch && (
                    <span className="text-[10px] font-mono text-red-500 mt-1 block">
                      Passwords do not match.
                    </span>
                  )}
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSaving || !isPasswordValid || !passwordsMatch}
                    className="h-9 px-5 bg-foreground text-background text-xs font-mono uppercase font-bold flex items-center gap-1.5 border border-foreground hover:bg-accent-hover transition-colors disabled:opacity-50"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Updating Password...</span>
                      </>
                    ) : (
                      <>
                        <Key className="w-3.5 h-3.5 text-amber-400 dark:text-amber-600" />
                        <span>Update Password</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 3: Danger Zone */}
          {activeTab === 'danger' && (
            <div className="bg-surface border border-red-300 dark:border-red-900/50 p-6 space-y-5">
              <div className="pb-3 border-b border-border">
                <h2 className="text-sm font-bold uppercase tracking-wider text-red-600 dark:text-red-400 font-mono">
                  Permanent Account Removal
                </h2>
                <p className="text-xs text-muted mt-0.5">
                  Permanently delete your user profile, ratings history, helpful vote counts, and saved bookmarks. This action cannot be undone.
                </p>
              </div>

              <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 text-xs text-red-900 dark:text-red-200 font-mono space-y-2">
                <p className="font-bold">Before you proceed:</p>
                <ul className="list-disc list-inside space-y-1 text-[11px] text-red-800 dark:text-red-300">
                  <li>All store reviews and ratings you have posted will be permanently removed.</li>
                  <li>Your reviewer reputation rank ({stats?.reviewerRank || 'Level 1'}) will be lost.</li>
                  <li>Store average scores will be recalculated to exclude your ratings.</li>
                </ul>
              </div>

              <div>
                <button
                  type="button"
                  onClick={() => setIsDeleteModalOpen(true)}
                  className="h-9 px-4 bg-red-600 text-white text-xs font-mono uppercase font-bold flex items-center gap-1.5 border border-red-600 hover:bg-red-700 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete My Account</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-none z-50 flex items-center justify-center p-4">
          <div className="bg-surface border border-red-500 max-w-md w-full p-6 space-y-4">
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <h3 className="text-sm font-bold uppercase tracking-wider font-mono">
                Confirm Account Deletion
              </h3>
            </div>

            <p className="text-xs text-foreground font-mono leading-relaxed">
              To verify deletion, type <strong className="text-red-600">DELETE</strong> into the field below:
            </p>

            <input
              type="text"
              value={deleteConfirmationText}
              onChange={(e) => setDeleteConfirmationText(e.target.value)}
              placeholder="DELETE"
              className="w-full h-9 px-3 bg-muted-fill border border-border text-xs font-mono text-foreground focus:outline-none focus:border-red-500"
            />

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
              <button
                type="button"
                onClick={() => { setIsDeleteModalOpen(false); setDeleteConfirmationText(''); }}
                className="px-3 py-1.5 text-xs font-mono uppercase font-bold text-muted hover:text-foreground border border-border"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={deleteConfirmationText.trim().toUpperCase() !== 'DELETE' || isDeleting}
                className="px-4 py-1.5 bg-red-600 text-white text-xs font-mono uppercase font-bold border border-red-600 hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-1.5"
              >
                {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                <span>Confirm Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
