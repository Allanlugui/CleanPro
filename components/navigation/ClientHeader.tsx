'use client';

import React from 'react';
import {
  Sparkles,
  Calendar,
  Headphones,
  User,
  ShieldCheck,
  Bell,
  Database,
  Smartphone,
  ChevronRight
} from 'lucide-react';
import { UserProfile, ServiceOrder } from '@/lib/types';
import { isSupabaseConfigured } from '@/lib/supabaseClient';

interface ClientHeaderProps {
  activeTab: 'catalog' | 'orders' | 'support';
  setActiveTab: (tab: 'catalog' | 'orders' | 'support') => void;
  currentUser: UserProfile | null;
  activeOrder: ServiceOrder | null;
  onOpenAuth: () => void;
  onOpenProfile: () => void;
  onOpenSupport: () => void;
  onOpenBooking: () => void;
}

export function ClientHeader({
  activeTab,
  setActiveTab,
  currentUser,
  activeOrder,
  onOpenAuth,
  onOpenProfile,
  onOpenSupport,
  onOpenBooking
}: ClientHeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-2xs">
      {/* Top micro bar for Active order status if any */}
      {activeOrder && activeOrder.status !== 'completed' && (
        <div
          onClick={() => setActiveTab('orders')}
          className="bg-linear-to-r from-sky-600 to-indigo-700 text-white px-4 py-1.5 text-xs font-semibold flex items-center justify-between cursor-pointer hover:opacity-95 transition-opacity"
        >
          <div className="flex items-center gap-2 max-w-xl truncate">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="truncate">
              Live Order #{activeOrder.order_number}:{' '}
              {activeOrder.status === 'en_route'
                ? `Team en route (~${activeOrder.assigned_team?.eta_minutes || 12} mins away)`
                : activeOrder.status === 'in_progress'
                ? 'Cleaning actively in progress'
                : 'Confirmed & scheduled'}
            </span>
          </div>
          <span className="text-[11px] underline flex items-center gap-0.5 shrink-0 font-bold">
            Track Live <ChevronRight className="w-3 h-3" />
          </span>
        </div>
      )}

      {/* Main Bar */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Logo & Brand */}
        <div
          onClick={() => setActiveTab('catalog')}
          className="flex items-center gap-2.5 cursor-pointer select-none group"
        >
          <div className="w-10 h-10 rounded-2xl bg-sky-600 group-hover:bg-sky-700 text-white flex items-center justify-center shadow-md shadow-sky-600/20 transition-colors">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-base font-extrabold text-slate-900 tracking-tight">
                CleanPro
              </span>
              <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.2 rounded-md bg-sky-100 text-sky-800 tracking-wider">
                Client PWA
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
              Professional Cleaning Ecosystem
            </p>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-100 p-1 rounded-2xl">
          <button
            id="nav-btn-services"
            type="button"
            onClick={() => setActiveTab('catalog')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'catalog'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Services Catalog
          </button>
          <button
            id="nav-btn-orders"
            type="button"
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'orders'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>My Orders &amp; Photos</span>
            {activeOrder && (
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            )}
          </button>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {/* Supabase status badge */}
          <div
            suppressHydrationWarning
            title={
              isSupabaseConfigured
                ? 'Connected to Live Supabase'
                : 'Operating in Local Cache & Mock Sync'
            }
            className="hidden lg:flex items-center gap-1.5 text-[11px] text-slate-500 bg-slate-100 px-2.5 py-1 rounded-xl"
          >
            <Database className={`w-3 h-3 ${isSupabaseConfigured ? 'text-emerald-600' : 'text-sky-600'}`} />
            <span suppressHydrationWarning>{isSupabaseConfigured ? 'Supabase Live' : 'PWA Offline Sync'}</span>
          </div>

          {/* SAC Support Trigger */}
          <button
            id="btn-header-support"
            type="button"
            onClick={onOpenSupport}
            aria-label="Open support chat"
            className="p-2 text-slate-600 hover:text-sky-600 hover:bg-slate-100 rounded-xl transition-colors relative"
          >
            <Headphones className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-emerald-500 rounded-full" />
          </button>

          {/* User Profile / Login */}
          {currentUser ? (
            <button
              id="btn-header-profile"
              type="button"
              onClick={onOpenProfile}
              className="flex items-center gap-2 pl-2 pr-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-2xl transition-colors"
            >
              <div className="w-7 h-7 rounded-full bg-sky-600 text-white font-bold text-xs flex items-center justify-center shadow-2xs">
                {currentUser.full_name.charAt(0)}
              </div>
              <span className="text-xs font-bold text-slate-800 max-w-[90px] truncate hidden sm:inline">
                {currentUser.full_name.split(' ')[0]}
              </span>
            </button>
          ) : (
            <button
              id="btn-header-login"
              type="button"
              onClick={onOpenAuth}
              className="px-3.5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition-colors"
            >
              <User className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
