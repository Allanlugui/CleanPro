'use client';

import React, { useSyncExternalStore } from 'react';
import { WifiOff, CloudCheck } from 'lucide-react';

function subscribeOnline(callback: () => void) {
  window.addEventListener('online', callback);
  window.addEventListener('offline', callback);
  return () => {
    window.removeEventListener('online', callback);
    window.removeEventListener('offline', callback);
  };
}

function getOnlineSnapshot() {
  return navigator.onLine;
}

function getServerSnapshot() {
  return true;
}

export function OfflineIndicator() {
  const isOnline = useSyncExternalStore(subscribeOnline, getOnlineSnapshot, getServerSnapshot);

  if (isOnline) return null;

  return (
    <aside
      id="pwa-network-indicator"
      aria-label="Network connectivity status"
      className="fixed bottom-20 left-4 right-4 md:left-auto md:right-6 md:max-w-sm z-40"
    >
      <div className="bg-amber-900/90 text-amber-100 px-4 py-2.5 rounded-xl backdrop-blur-md shadow-lg border border-amber-700/50 flex items-center gap-3 text-xs font-medium">
        <WifiOff className="w-4 h-4 text-amber-300 shrink-0 animate-pulse" />
        <span>Offline Mode Active • Changes saved locally &amp; will sync when reconnected</span>
      </div>
    </aside>
  );
}

