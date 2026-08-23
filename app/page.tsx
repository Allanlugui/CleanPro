'use client';

import React, { useEffect, useState } from 'react';
import {
  Sparkles,
  ShieldCheck,
  Clock,
  Camera,
  CalendarCheck2,
  Phone,
  CheckCircle2,
  ChevronRight,
  Headphones,
  Award,
  ArrowRight,
  Layers,
  HeartHandshake,
  Instagram,
  MessageCircle,
  Tag,
  Gift
} from 'lucide-react';
import {
  CleaningService,
  ServiceCategory,
  ServiceOrder,
  UserProfile,
  SupportTicket
} from '@/lib/types';
import { CleanProAPI, getSupabase } from '@/lib/supabaseClient';
import { PwaInstallBanner } from '@/components/pwa/PwaInstallBanner';
import { OfflineIndicator } from '@/components/pwa/OfflineIndicator';
import { ClientHeader } from '@/components/navigation/ClientHeader';
import { ClientBottomNav } from '@/components/navigation/ClientBottomNav';
import { ServiceCatalog } from '@/components/booking/ServiceCatalog';
import { BookingWizard } from '@/components/booking/BookingWizard';
import { OrderTrackingView } from '@/components/tracking/OrderTrackingView';
import { AuthModal } from '@/components/auth/AuthModal';
import { QuickOnboardingModal } from '@/components/onboarding/QuickOnboardingModal';
import { UserProfileDrawer } from '@/components/auth/UserProfileDrawer';
import { SupportChatDrawer } from '@/components/support/SupportChatDrawer';

export default function ClientPwaHome() {
  const [activeTab, setActiveTab] = useState<'catalog' | 'orders' | 'support'>('catalog');
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [services, setServices] = useState<CleaningService[]>([]);
  const [orders, setOrders] = useState<ServiceOrder[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);

  // Modals & Onboarding
  const [bookingService, setBookingService] = useState<CleaningService | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showQuickOnboarding, setShowQuickOnboarding] = useState(false);
  const [onboardingSource, setOnboardingSource] = useState('instagram');
  const [showProfileDrawer, setShowProfileDrawer] = useState(false);
  const [showSupportDrawer, setShowSupportDrawer] = useState(false);
  const [loading, setLoading] = useState(true);

  // Initial load & URL params check
  useEffect(() => {
    async function loadData() {
      try {
        const [cats, srvs, user] = await Promise.all([
          CleanProAPI.getCategories(),
          CleanProAPI.getServices(),
          CleanProAPI.getCurrentUser()
        ]);
        setCategories(cats);
        setServices(srvs);
        setCurrentUser(user);

        const [ords, tkts] = await Promise.all([
          CleanProAPI.getOrders(user?.id),
          CleanProAPI.getSupportTickets(user?.id)
        ]);
        setOrders(ords);
        setTickets(tkts);

        // Check URL params for campaign tracking or PWA shortcuts
        if (typeof window !== 'undefined') {
          const params = new URLSearchParams(window.location.search);
          const source = params.get('source') || params.get('utm_source') || params.get('ref');
          const onboardingReq = params.get('onboarding') === 'true' || Boolean(source);

          if (source) {
            setOnboardingSource(source);
          }

          if (onboardingReq && !user) {
            setShowQuickOnboarding(true);
          } else if (params.get('tab') === 'orders') {
            setActiveTab('orders');
          } else if (params.get('action') === 'book' && srvs[0]) {
            setBookingService(srvs[0]);
          }
        }
      } catch (err) {
        console.error('Data initialization error:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  // Real-Time orders listener on global page level
  useEffect(() => {
    const unsubscribe = CleanProAPI.subscribeToOrders((event, order) => {
      setOrders((prev) => {
        if (event === 'DELETE') {
          return prev.filter((o) => o.id !== order.id);
        }
        const idx = prev.findIndex((o) => o.id === order.id);
        if (idx !== -1) {
          const next = [...prev];
          next[idx] = order;
          return next;
        }
        return [order, ...prev];
      });
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Update an order in state
  const handleOrderUpdated = (updatedOrder: ServiceOrder) => {
    setOrders((prev) => {
      const idx = prev.findIndex((o) => o.id === updatedOrder.id);
      if (idx !== -1) {
        const next = [...prev];
        next[idx] = updatedOrder;
        return next;
      }
      return [updatedOrder, ...prev];
    });
  };

  const handleOrderCreated = (newOrder: ServiceOrder) => {
    setOrders((prev) => [newOrder, ...prev]);
    setBookingService(null);
    setActiveTab('orders');
  };

  const handleTicketUpdated = (updatedTicket: SupportTicket) => {
    setTickets((prev) => {
      const idx = prev.findIndex((t) => t.id === updatedTicket.id);
      if (idx !== -1) {
        const next = [...prev];
        next[idx] = updatedTicket;
        return next;
      }
      return [updatedTicket, ...prev];
    });
  };

  const activeLiveOrder =
    orders.find((o) => o.status !== 'completed' && o.status !== 'cancelled') || null;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 pb-20 md:pb-8">
      {/* PWA Components */}
      <PwaInstallBanner />
      <OfflineIndicator />

      {/* Main Header */}
      <ClientHeader
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        activeOrder={activeLiveOrder}
        onOpenAuth={() => setShowAuthModal(true)}
        onOpenProfile={() => setShowProfileDrawer(true)}
        onOpenSupport={() => setShowSupportDrawer(true)}
        onOpenBooking={() => services[0] && setBookingService(services[0])}
      />

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 flex-1 w-full space-y-8">
        {loading ? (
          <div className="py-24 text-center space-y-3">
            <div className="w-10 h-10 border-3 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-semibold text-slate-500">Connecting to CleanPro Supabase Backend...</p>
          </div>
        ) : (
          <>
            {/* Social Referral Promo Ribbon */}
            {!currentUser && (
              <div
                id="social-onboarding-banner"
                className="bg-linear-to-r from-rose-500 via-purple-600 to-indigo-600 rounded-2xl p-3 sm:p-4 text-white shadow-md flex flex-wrap items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0">
                    <Gift className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full text-white">
                        Special Welcome Promo
                      </span>
                      <span className="hidden sm:inline text-xs text-rose-100">
                        Instagram &amp; WhatsApp Direct Onboarding
                      </span>
                    </div>
                    <p className="text-sm font-black mt-0.5">
                      Get 20% OFF your first clean with 60-second instant onboarding!
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    id="btn-open-quick-onboarding-insta"
                    type="button"
                    onClick={() => {
                      setOnboardingSource('instagram');
                      setShowQuickOnboarding(true);
                    }}
                    className="px-3 py-2 bg-white hover:bg-slate-50 text-slate-900 rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 active:scale-95"
                  >
                    <Instagram className="w-3.5 h-3.5 text-rose-600" />
                    <span>Instagram Fast Pass</span>
                  </button>
                  <button
                    id="btn-open-quick-onboarding-wa"
                    type="button"
                    onClick={() => {
                      setOnboardingSource('whatsapp');
                      setShowQuickOnboarding(true);
                    }}
                    className="px-3 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 active:scale-95"
                  >
                    <MessageCircle className="w-3.5 h-3.5 fill-white" />
                    <span>WhatsApp VIP</span>
                  </button>
                </div>
              </div>
            )}

            {/* VIEW 1: Service Catalog & Booking */}
            {activeTab === 'catalog' && (
              <div className="space-y-8">
                {/* Hero Feature Strip */}
                <section
                  id="client-hero-banner"
                  className="relative rounded-3xl bg-linear-to-br from-sky-900 via-sky-800 to-indigo-950 text-white p-6 sm:p-8 overflow-hidden shadow-xl"
                >
                  <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 rounded-full bg-sky-500/20 blur-3xl pointer-events-none" />
                  <div className="relative z-10 max-w-2xl space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-sky-200 text-xs font-semibold">
                      <Sparkles className="w-3.5 h-3.5 text-sky-300" />
                      <span>Certified Eco-Cleaners &amp; Live Real-Time Tracking</span>
                    </div>

                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight">
                      Spotless Homes &amp; Workspaces, Verified with Live Photo Audits.
                    </h1>

                    <p className="text-xs sm:text-sm text-sky-100/90 leading-relaxed max-w-xl">
                      Book certified residential, deep clean, or move-out turnover specialists.
                      Follow your team live from dispatch to inspection sign-off.
                    </p>

                    <div className="flex flex-wrap items-center gap-3 pt-2">
                      <button
                        id="hero-book-now-btn"
                        type="button"
                        onClick={() => services[0] && setBookingService(services[0])}
                        className="px-5 py-3 bg-white hover:bg-sky-50 text-sky-900 rounded-2xl text-xs font-extrabold shadow-lg transition-all flex items-center gap-2 active:scale-95"
                      >
                        <span>Schedule a Cleaning</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>

                      {activeLiveOrder ? (
                        <button
                          id="hero-track-order-btn"
                          type="button"
                          onClick={() => setActiveTab('orders')}
                          className="px-4 py-3 bg-sky-700/60 hover:bg-sky-700 border border-sky-400/30 text-white rounded-2xl text-xs font-bold transition-colors flex items-center gap-2"
                        >
                          <Clock className="w-4 h-4 text-emerald-400" />
                          <span>Track Active #{activeLiveOrder.order_number}</span>
                        </button>
                      ) : (
                        <button
                          id="hero-support-btn"
                          type="button"
                          onClick={() => setShowSupportDrawer(true)}
                          className="px-4 py-3 bg-white/10 hover:bg-white/20 border border-white/15 text-white rounded-2xl text-xs font-semibold transition-colors flex items-center gap-2"
                        >
                          <Headphones className="w-4 h-4 text-sky-300" />
                          <span>Contact SAC / Dispatch</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Highlights Grid */}
                  <div className="mt-6 pt-6 border-t border-white/15 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                    <div className="flex items-center gap-2 text-sky-200">
                      <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span className="font-semibold text-slate-100">100% Guarantee</span>
                    </div>
                    <div className="flex items-center gap-2 text-sky-200">
                      <Camera className="w-4 h-4 text-sky-300 shrink-0" />
                      <span className="font-semibold text-slate-100">Before &amp; After Photos</span>
                    </div>
                    <div className="flex items-center gap-2 text-sky-200">
                      <Clock className="w-4 h-4 text-amber-300 shrink-0" />
                      <span className="font-semibold text-slate-100">Real-Time Dispatch ETA</span>
                    </div>
                    <div className="flex items-center gap-2 text-sky-200">
                      <HeartHandshake className="w-4 h-4 text-rose-300 shrink-0" />
                      <span className="font-semibold text-slate-100">Vetted &amp; Insured Crew</span>
                    </div>
                  </div>
                </section>

                {/* Services Catalog Grid */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-bold text-slate-900">Available Cleaning Services</h2>
                      <p className="text-xs text-slate-500">
                        Choose your service type, customize room counts, and add specialized treatments.
                      </p>
                    </div>
                  </div>

                  <ServiceCatalog
                    categories={categories}
                    services={services}
                    onSelectServiceForBooking={(service) => setBookingService(service)}
                  />
                </div>
              </div>
            )}

            {/* VIEW 2: Dedicated Client Orders Tracking View */}
            {activeTab === 'orders' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">Live Order Tracking &amp; History</h2>
                    <p className="text-xs text-slate-500">
                      Monitor dispatch status, view live checklist tasks, verify inspection photos, and complete sign-offs.
                    </p>
                  </div>
                </div>

                <OrderTrackingView
                  orders={orders}
                  onOrderUpdated={handleOrderUpdated}
                  onOpenSupport={() => setShowSupportDrawer(true)}
                  onBookNew={() => {
                    setActiveTab('catalog');
                    if (services[0]) setBookingService(services[0]);
                  }}
                />
              </div>
            )}

            {/* VIEW 3: Support Tab (when opened on mobile) */}
            {activeTab === 'support' && (
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4 max-w-xl mx-auto">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center">
                    <Headphones className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900">Customer Support &amp; Ombudsman</h2>
                    <p className="text-xs text-slate-500">Live chat with dispatchers and quality guarantee team</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowSupportDrawer(true)}
                  className="w-full py-3 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-bold text-xs shadow-md flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Launch Live Support Chat</span>
                </button>
              </div>
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="max-w-6xl mx-auto px-4 sm:px-6 pt-12 pb-6 w-full text-center text-xs text-slate-400 border-t border-slate-200 mt-12 space-y-2">
        <div className="flex items-center justify-center gap-4 text-slate-500">
          <button onClick={() => setShowAuthModal(true)} className="hover:text-slate-800">
            Client Auth
          </button>
          <span>•</span>
          <button
            onClick={() => {
              setOnboardingSource('social');
              setShowQuickOnboarding(true);
            }}
            className="hover:text-slate-800 font-medium text-sky-600"
          >
            Quick Onboarding
          </button>
          <span>•</span>
          <button onClick={() => setShowSupportDrawer(true)} className="hover:text-slate-800">
            SAC Ombudsman
          </button>
          <span>•</span>
          <button onClick={() => setShowProfileDrawer(true)} className="hover:text-slate-800">
            LGPD Privacy
          </button>
        </div>
        <p>© 2026 CleanPro Cleaning Ecosystem • Client PWA Progressive Web Application</p>
      </footer>

      {/* Mobile Floating Bottom Bar */}
      <ClientBottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        activeOrder={activeLiveOrder}
        onOpenAuth={() => setShowAuthModal(true)}
        onOpenProfile={() => setShowProfileDrawer(true)}
        onOpenBooking={() => services[0] && setBookingService(services[0])}
      />

      {/* Modals & Drawers */}
      {bookingService && (
        <BookingWizard
          service={bookingService}
          currentUser={currentUser}
          onClose={() => setBookingService(null)}
          onOrderCreated={handleOrderCreated}
          onRequireLogin={() => {
            setShowAuthModal(true);
          }}
        />
      )}

      {/* Quick Instagram/WhatsApp Onboarding Modal */}
      <QuickOnboardingModal
        isOpen={showQuickOnboarding}
        initialSource={onboardingSource}
        onClose={() => setShowQuickOnboarding(false)}
        onSuccess={(user) => {
          setCurrentUser(user);
          CleanProAPI.getOrders(user.id).then(setOrders);
          CleanProAPI.getSupportTickets(user.id).then(setTickets);
        }}
      />

      {/* Standard Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={(user) => {
          setCurrentUser(user);
          CleanProAPI.getOrders(user.id).then(setOrders);
          CleanProAPI.getSupportTickets(user.id).then(setTickets);
        }}
      />

      <UserProfileDrawer
        isOpen={showProfileDrawer}
        user={currentUser}
        onClose={() => setShowProfileDrawer(false)}
        onUpdateUser={(u) => setCurrentUser(u)}
        onLogout={async () => {
          await CleanProAPI.logout();
          setCurrentUser(null);
        }}
      />

      <SupportChatDrawer
        isOpen={showSupportDrawer}
        user={currentUser}
        tickets={tickets}
        onClose={() => setShowSupportDrawer(false)}
        onTicketUpdated={handleTicketUpdated}
      />
    </div>
  );
}
