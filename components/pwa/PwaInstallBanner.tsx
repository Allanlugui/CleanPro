'use client';

import React, { useEffect, useState, useSyncExternalStore } from 'react';
import { Download, Sparkles, X, Smartphone, Check } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

function subscribeNoop() {
  return () => {};
}

function getIsIosSnapshot() {
  return typeof window !== 'undefined' && /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase());
}

function getIsIosServer() {
  return false;
}

export function PwaInstallBanner() {
  const isIOS = useSyncExternalStore(subscribeNoop, getIsIosSnapshot, getIsIosServer);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showIosInstructions, setShowIosInstructions] = useState(false);

  useEffect(() => {
    // Register Service Worker
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          console.log('CleanPro ServiceWorker registered with scope:', reg.scope);
        })
        .catch((err) => {
          console.warn('ServiceWorker registration failed:', err);
        });
    }

    // Check if running in standalone mode (already installed)
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;

    if (isStandalone) {
      return;
    }

    // Listen for BeforeInstallPrompt event on Chromium browsers
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Show iOS banner after small delay if not dismissed
    let iosTimer: NodeJS.Timeout | undefined;
    const isIosDevice = /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase());
    if (isIosDevice && !isStandalone) {
      const dismissed = localStorage.getItem('cleanpro_pwa_ios_dismissed');
      if (!dismissed) {
        iosTimer = setTimeout(() => setShowBanner(true), 2000);
      }
    }

    return () => {
      if (iosTimer) clearTimeout(iosTimer);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIosInstructions(true);
      return;
    }

    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const choiceResult = await deferredPrompt.userChoice;
    if (choiceResult.outcome === 'accepted') {
      setIsInstalled(true);
      setShowBanner(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    if (isIOS) {
      localStorage.setItem('cleanpro_pwa_ios_dismissed', 'true');
    }
  };

  if (isInstalled || !showBanner) return null;

  return (
    <>
      <aside
        id="pwa-install-toast"
        aria-label="PWA install banner"
        className="fixed top-3 left-3 right-3 md:left-auto md:right-4 md:max-w-md z-50 bg-sky-900 text-white p-3.5 rounded-2xl shadow-xl border border-sky-700/60 backdrop-blur-md flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-300"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-500/20 border border-sky-400/30 flex items-center justify-center shrink-0 text-sky-300">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-sky-300">Client PWA</span>
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            </div>
            <p className="text-sm font-medium text-slate-100">
              Install CleanPro for instant live order tracking & offline access
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            id="pwa-install-action-btn"
            onClick={handleInstallClick}
            className="px-3.5 py-1.5 rounded-xl bg-white text-sky-900 hover:bg-sky-50 text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-sm active:scale-95"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Install</span>
          </button>
          <button
            id="pwa-dismiss-btn"
            onClick={handleDismiss}
            aria-label="Close install notification"
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-sky-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* iOS Manual Installation Guide Modal */}
      {showIosInstructions && (
        <div
          id="ios-pwa-modal-backdrop"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end md:items-center justify-center p-4"
          onClick={() => setShowIosInstructions(false)}
        >
          <div
            id="ios-pwa-modal-content"
            className="bg-white rounded-t-3xl md:rounded-2xl p-6 w-full max-w-sm text-slate-900 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-sky-600" />
                <h3 className="font-semibold text-base">Install CleanPro on iOS</h3>
              </div>
              <button
                id="ios-modal-close-btn"
                onClick={() => setShowIosInstructions(false)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3 text-sm text-slate-600">
              <div className="flex items-start gap-2.5">
                <span className="w-6 h-6 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-xs shrink-0">1</span>
                <p>Tap the <strong>Share</strong> icon in the Safari bottom toolbar.</p>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-6 h-6 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-xs shrink-0">2</span>
                <p>Scroll down and select <strong>&quot;Add to Home Screen&quot;</strong>.</p>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-6 h-6 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-xs shrink-0">3</span>
                <p>Tap <strong>&quot;Add&quot;</strong> in the top right corner.</p>
              </div>
            </div>
            <button
              id="ios-instructions-confirm-btn"
              onClick={() => setShowIosInstructions(false)}
              className="w-full py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-medium text-sm transition-colors flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" /> Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
}
