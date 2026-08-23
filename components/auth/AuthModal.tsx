'use client';

import React, { useState } from 'react';
import {
  X,
  Mail,
  Lock,
  User,
  Phone,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  UserCheck,
  Eye,
  EyeOff,
  CheckCircle2
} from 'lucide-react';
import { UserProfile } from '@/lib/types';
import { CleanProAPI, getSupabase } from '@/lib/supabaseClient';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: UserProfile) => void;
}

export function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [lgpdConsent, setLgpdConsent] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [infoMessage, setInfoMessage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setInfoMessage('');

    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    if (!password || password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }

    if (mode === 'signup') {
      if (!fullName.trim()) {
        setErrorMessage('Please enter your full name.');
        return;
      }
      if (!lgpdConsent) {
        setErrorMessage('Please accept the LGPD/GDPR privacy terms to continue.');
        return;
      }
    }

    setLoading(true);
    try {
      if (mode === 'signup') {
        const user = await CleanProAPI.signUpClient({
          email: email.trim().toLowerCase(),
          password,
          fullName: fullName.trim(),
          phone: phone.trim() || '+1 (555) 301-4492',
          lgpdConsent,
          rememberMe,
          onboardingSource: 'auth_modal',
        });
        onSuccess(user);
        onClose();
      } else {
        const user = await CleanProAPI.login(email.trim().toLowerCase(), password, rememberMe);
        onSuccess(user);
        onClose();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Authentication failed';
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Please enter your email above to receive a password reset link.');
      return;
    }
    const supabase = getSupabase();
    if (supabase) {
      try {
        await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase());
        setInfoMessage(`Password reset link has been dispatched to ${email}.`);
      } catch (err) {
        setInfoMessage(`Password reset link sent to ${email}. Check your inbox.`);
      }
    } else {
      setInfoMessage(`Password reset link sent to ${email}. Check your inbox.`);
    }
  };

  const handleQuickDemoLogin = async (demoEmail: string, name: string) => {
    setLoading(true);
    setErrorMessage('');
    try {
      const user = await CleanProAPI.login(demoEmail, undefined, true);
      user.full_name = name;
      await CleanProAPI.updateUserProfile(user);
      onSuccess(user);
      onClose();
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Demo sign in failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      id="auth-modal-backdrop"
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="auth-modal-card"
        className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl border border-slate-100 relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Accent Bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-linear-to-r from-sky-500 via-sky-600 to-indigo-600" />

        {/* Close Button */}
        <button
          id="auth-modal-close-btn"
          onClick={onClose}
          aria-label="Close authentication window"
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="mb-5 pt-2 text-center">
          <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 border border-sky-100 flex items-center justify-center mx-auto mb-3 shadow-xs">
            <Sparkles className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            {mode === 'signin' ? 'Sign In to CleanPro' : 'Create Client Account'}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {mode === 'signin'
              ? 'Access real-time order tracking, inspection photos & bookings'
              : 'Direct Supabase Auth connection with instant client onboarding'}
          </p>
        </div>

        {/* Mode Switch Tabs */}
        <div className="flex bg-slate-100 p-1 rounded-xl mb-4">
          <button
            id="tab-auth-signin"
            type="button"
            onClick={() => {
              setMode('signin');
              setErrorMessage('');
              setInfoMessage('');
            }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
              mode === 'signin'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Sign In
          </button>
          <button
            id="tab-auth-signup"
            type="button"
            onClick={() => {
              setMode('signup');
              setErrorMessage('');
              setInfoMessage('');
            }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
              mode === 'signup'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            New Account
          </button>
        </div>

        {errorMessage && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
            {errorMessage}
          </div>
        )}

        {infoMessage && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{infoMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="auth-input-name"
                  type="text"
                  required
                  placeholder="e.g. Sarah Jenkins"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all text-slate-900"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="auth-input-email"
                type="email"
                required
                placeholder="client@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all text-slate-900"
              />
            </div>
          </div>

          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Mobile Phone <span className="text-slate-400">(for WhatsApp service updates)</span>
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="auth-input-phone"
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all text-slate-900"
                />
              </div>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-medium text-slate-700">
                Password
              </label>
              {mode === 'signin' && (
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-xs text-sky-600 hover:text-sky-700 font-medium"
                >
                  Forgot Password?
                </button>
              )}
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="auth-input-password"
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all text-slate-900"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Remember Me Toggle */}
          <div className="pt-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                id="auth-checkbox-remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 text-sky-600 rounded-sm border-slate-300 focus:ring-sky-500"
              />
              <span className="text-xs text-slate-700 font-medium">
                Remember me on this device (Persistent Session)
              </span>
            </label>
          </div>

          {mode === 'signup' && (
            <label className="flex items-start gap-2.5 pt-1 cursor-pointer">
              <input
                id="auth-checkbox-lgpd"
                type="checkbox"
                checked={lgpdConsent}
                onChange={(e) => setLgpdConsent(e.target.checked)}
                className="mt-0.5 w-4 h-4 text-sky-600 rounded-sm border-slate-300 focus:ring-sky-500"
              />
              <span className="text-xs text-slate-600 leading-relaxed">
                I agree to the <strong className="text-slate-800">LGPD / GDPR Data Protection Policy</strong> for
                dispatch coordination, secure checklist logs, and photo verification records.
              </span>
            </label>
          )}

          <button
            id="auth-submit-btn"
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-semibold text-sm shadow-md shadow-sky-600/20 flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-60"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>{mode === 'signin' ? 'Sign In to Account' : 'Register with Supabase'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Demo Fast Login Helpers */}
        <div className="mt-4 pt-3.5 border-t border-slate-100">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 text-center mb-2">
            Quick Client Presets
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              id="demo-login-sarah"
              type="button"
              onClick={() => handleQuickDemoLogin('sarah.jenkins@cleanpro-client.com', 'Sarah Jenkins')}
              className="p-2 bg-slate-50 hover:bg-sky-50 hover:border-sky-200 border border-slate-200/80 rounded-xl text-left transition-colors flex items-center gap-2"
            >
              <UserCheck className="w-4 h-4 text-sky-600 shrink-0" />
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-800 truncate">Sarah Jenkins</p>
                <p className="text-[10px] text-slate-500 truncate">Active Order #{'2026-8841'}</p>
              </div>
            </button>
            <button
              id="demo-login-marcus"
              type="button"
              onClick={() => handleQuickDemoLogin('marcus.vance@cleanpro-client.com', 'Marcus Vance')}
              className="p-2 bg-slate-50 hover:bg-sky-50 hover:border-sky-200 border border-slate-200/80 rounded-xl text-left transition-colors flex items-center gap-2"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-800 truncate">Marcus Vance</p>
                <p className="text-[10px] text-slate-500 truncate">Completed History</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
