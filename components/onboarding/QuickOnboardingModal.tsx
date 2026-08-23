'use client';

import React, { useState } from 'react';
import {
  X,
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  User,
  Mail,
  Phone,
  Lock,
  MapPin,
  ArrowRight,
  Eye,
  EyeOff,
  Instagram,
  MessageCircle,
  Tag,
  Key
} from 'lucide-react';
import { UserProfile, AddressDetails } from '@/lib/types';
import { CleanProAPI } from '@/lib/supabaseClient';

interface QuickOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: UserProfile) => void;
  initialSource?: string;
}

export function QuickOnboardingModal({
  isOpen,
  onClose,
  onSuccess,
  initialSource = 'social'
}: QuickOnboardingModalProps) {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Address
  const [street, setStreet] = useState('');
  const [number, setNumber] = useState('');
  const [complement, setComplement] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [city, setCity] = useState('New York');
  const [state, setState] = useState('NY');
  const [zipCode, setZipCode] = useState('10014');
  const [accessNotes, setAccessNotes] = useState('');

  // Preferences
  const [rememberMe, setRememberMe] = useState(true);
  const [lgpdConsent, setLgpdConsent] = useState(true);

  // State
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successCelebration, setSuccessCelebration] = useState(false);

  if (!isOpen) return null;

  const isInstagram = initialSource?.toLowerCase().includes('insta');
  const isWhatsApp = initialSource?.toLowerCase().includes('whatsapp');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!fullName.trim()) {
      setErrorMessage('Please provide your full name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    if (!phone.trim()) {
      setErrorMessage('Please enter your mobile phone for dispatch updates.');
      return;
    }
    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }
    if (!street.trim() || !number.trim()) {
      setErrorMessage('Please enter your street name and house/apartment number.');
      return;
    }
    if (!lgpdConsent) {
      setErrorMessage('Please accept the LGPD/GDPR terms to proceed.');
      return;
    }

    setLoading(true);
    try {
      const defaultAddress: AddressDetails = {
        street: street.trim(),
        number: number.trim(),
        complement: complement.trim() || undefined,
        neighborhood: neighborhood.trim() || 'Central',
        city: city.trim() || 'New York',
        state: state.trim() || 'NY',
        zip_code: zipCode.trim() || '10001',
        access_notes: accessNotes.trim() || undefined,
      };

      const user = await CleanProAPI.signUpClient({
        email: email.trim().toLowerCase(),
        password,
        fullName: fullName.trim(),
        phone: phone.trim(),
        defaultAddress,
        lgpdConsent,
        rememberMe,
        onboardingSource: initialSource || 'instagram_campaign',
      });

      setSuccessCelebration(true);
      setTimeout(() => {
        onSuccess(user);
        onClose();
      }, 1400);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      id="quick-onboarding-backdrop"
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="quick-onboarding-card"
        className="bg-white rounded-3xl w-full max-w-xl p-5 sm:p-7 shadow-2xl border border-slate-100 relative my-6 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Accent Gradient */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-linear-to-r from-sky-500 via-indigo-500 to-rose-500" />

        {/* Close Button */}
        <button
          id="quick-onboarding-close-btn"
          onClick={onClose}
          aria-label="Close welcome registration"
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {successCelebration ? (
          <div className="py-12 text-center space-y-4 animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900">Welcome to CleanPro, {fullName.split(' ')[0]}!</h3>
            <p className="text-sm text-slate-600 max-w-md mx-auto">
              Your client profile has been registered in Supabase. Your default address is saved and your <strong>20% Welcome Voucher</strong> is activated!
            </p>
            <div className="pt-2">
              <div className="w-6 h-6 border-2 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          </div>
        ) : (
          <>
            {/* Source Campaign Header */}
            <div className="mb-5 pt-1">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                {isInstagram && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold">
                    <Instagram className="w-3.5 h-3.5" />
                    <span>Instagram Exclusive Invite</span>
                  </span>
                )}
                {isWhatsApp && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>WhatsApp VIP Direct Link</span>
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-sky-50 border border-sky-200 text-sky-700 text-xs font-bold">
                  <Tag className="w-3.5 h-3.5" />
                  <span>20% OFF Welcome Promo Applied</span>
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Quick Client Onboarding
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Register your address once to unlock instant scheduling, real-time crew tracking, and certified photo inspections.
              </p>
            </div>

            {errorMessage && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                <span className="font-semibold">{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Personal Information Group */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                  <User className="w-3.5 h-3.5 text-sky-600" />
                  <span>1. Contact &amp; Security</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Full Name <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        id="onboarding-input-name"
                        type="text"
                        required
                        placeholder="e.g. Jessica Adams"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Mobile Phone (WhatsApp) <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        id="onboarding-input-phone"
                        type="tel"
                        required
                        placeholder="+1 (555) 301-4492"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Email Address <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        id="onboarding-input-email"
                        type="email"
                        required
                        placeholder="jessica@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Create Password <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        id="onboarding-input-password"
                        type={showPassword ? 'text' : 'password'}
                        required
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-9 pr-9 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                        aria-label="Toggle password visibility"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Default Address Group */}
              <div className="space-y-3 pt-1 border-t border-slate-100">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                  <MapPin className="w-3.5 h-3.5 text-indigo-600" />
                  <span>2. Default Cleaning Address</span>
                </div>

                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Street Address <span className="text-rose-500">*</span>
                    </label>
                    <input
                      id="onboarding-input-street"
                      type="text"
                      required
                      placeholder="e.g. 5th Avenue"
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-sky-500/20"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Number <span className="text-rose-500">*</span>
                    </label>
                    <input
                      id="onboarding-input-number"
                      type="text"
                      required
                      placeholder="120"
                      value={number}
                      onChange={(e) => setNumber(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-sky-500/20"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Apt / Suite</label>
                    <input
                      id="onboarding-input-complement"
                      type="text"
                      placeholder="Apt 5B"
                      value={complement}
                      onChange={(e) => setComplement(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-sky-500/20"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Neighborhood</label>
                    <input
                      id="onboarding-input-neighborhood"
                      type="text"
                      placeholder="SoHo"
                      value={neighborhood}
                      onChange={(e) => setNeighborhood(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-sky-500/20"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">ZIP Code</label>
                    <input
                      id="onboarding-input-zip"
                      type="text"
                      placeholder="10012"
                      value={zipCode}
                      onChange={(e) => setZipCode(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-sky-500/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Gate / Concierge / Access Instructions <span className="text-slate-400">(Optional)</span>
                  </label>
                  <div className="relative">
                    <Key className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      id="onboarding-input-access"
                      type="text"
                      placeholder="e.g. Ring Apt 5B or leave key with front desk concierge"
                      value={accessNotes}
                      onChange={(e) => setAccessNotes(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-sky-500/20"
                    />
                  </div>
                </div>
              </div>

              {/* Preferences & LGPD Consent */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    id="onboarding-checkbox-remember"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 text-sky-600 rounded-sm border-slate-300 focus:ring-sky-500"
                  />
                  <span className="text-xs text-slate-700 font-medium">
                    Remember me on this device (Persistent Session)
                  </span>
                </label>

                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    id="onboarding-checkbox-lgpd"
                    type="checkbox"
                    checked={lgpdConsent}
                    onChange={(e) => setLgpdConsent(e.target.checked)}
                    className="mt-0.5 w-4 h-4 text-sky-600 rounded-sm border-slate-300 focus:ring-sky-500"
                  />
                  <span className="text-xs text-slate-600 leading-relaxed">
                    I agree to the <strong className="text-slate-800">LGPD / GDPR Privacy Terms</strong> for service order dispatch, certified photo audits, and secure communication.
                  </span>
                </label>
              </div>

              {/* Submit CTA */}
              <button
                id="onboarding-submit-btn"
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 bg-linear-to-r from-sky-600 via-sky-700 to-indigo-700 hover:from-sky-700 hover:to-indigo-800 text-white rounded-2xl font-bold text-sm shadow-lg shadow-sky-600/25 flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-60"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Create Profile &amp; Activate 20% Voucher</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
