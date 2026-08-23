'use client';

import React from 'react';
import {
  Sparkles,
  CalendarCheck2,
  Headphones,
  User,
  PlusCircle
} from 'lucide-react';
import { UserProfile, ServiceOrder } from '@/lib/types';

interface ClientBottomNavProps {
  activeTab: 'catalog' | 'orders' | 'support';
  setActiveTab: (tab: 'catalog' | 'orders' | 'support') => void;
  currentUser: UserProfile | null;
  activeOrder: ServiceOrder | null;
  onOpenAuth: () => void;
  onOpenProfile: () => void;
  onOpenBooking: () => void;
}

export function ClientBottomNav({
  activeTab,
  setActiveTab,
  currentUser,
  activeOrder,
  onOpenAuth,
  onOpenProfile,
  onOpenBooking
}: ClientBottomNavProps) {
  return (
    <nav
      id="pwa-mobile-bottom-nav"
      aria-label="Mobile navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200 shadow-lg px-2 py-1.5 flex items-center justify-around safe-area-pb"
    >
      {/* 1. Services Catalog */}
      <button
        id="m-nav-catalog"
        type="button"
        onClick={() => setActiveTab('catalog')}
        className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-colors ${
          activeTab === 'catalog'
            ? 'text-sky-600 font-bold'
            : 'text-slate-500 hover:text-slate-800 font-medium'
        }`}
      >
        <Sparkles className="w-5 h-5" />
        <span className="text-[10px]">Services</span>
      </button>

      {/* 2. My Orders */}
      <button
        id="m-nav-orders"
        type="button"
        onClick={() => setActiveTab('orders')}
        className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-colors relative ${
          activeTab === 'orders'
            ? 'text-sky-600 font-bold'
            : 'text-slate-500 hover:text-slate-800 font-medium'
        }`}
      >
        <CalendarCheck2 className="w-5 h-5" />
        {activeOrder && (
          <span className="absolute top-1 right-3 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white animate-pulse" />
        )}
        <span className="text-[10px]">My Orders</span>
      </button>

      {/* 3. Central Quick Book Button */}
      <button
        id="m-nav-book-action"
        type="button"
        onClick={onOpenBooking}
        className="flex flex-col items-center -mt-5"
      >
        <div className="w-12 h-12 rounded-full bg-sky-600 text-white flex items-center justify-center shadow-lg shadow-sky-600/30 active:scale-95 transition-transform">
          <PlusCircle className="w-6 h-6" />
        </div>
        <span className="text-[10px] font-bold text-sky-700 mt-0.5">Book</span>
      </button>

      {/* 4. Support SAC */}
      <button
        id="m-nav-support"
        type="button"
        onClick={() => setActiveTab('support')}
        className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-colors ${
          activeTab === 'support'
            ? 'text-sky-600 font-bold'
            : 'text-slate-500 hover:text-slate-800 font-medium'
        }`}
      >
        <Headphones className="w-5 h-5" />
        <span className="text-[10px]">Support</span>
      </button>

      {/* 5. Profile */}
      <button
        id="m-nav-profile"
        type="button"
        onClick={currentUser ? onOpenProfile : onOpenAuth}
        className="flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl text-slate-500 hover:text-slate-800 font-medium transition-colors"
      >
        <User className="w-5 h-5" />
        <span className="text-[10px]">{currentUser ? 'Profile' : 'Sign In'}</span>
      </button>
    </nav>
  );
}
