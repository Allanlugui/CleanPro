'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Calendar,
  Clock,
  MapPin,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Truck,
  Phone,
  Camera,
  PenTool,
  CreditCard,
  Star,
  ChevronRight,
  RefreshCw,
  Check,
  User,
  Headphones,
  Activity,
  Radio
} from 'lucide-react';
import { ServiceOrder, ServiceStatus } from '@/lib/types';
import { CleanProAPI } from '@/lib/supabaseClient';
import { ChecklistViewer } from './ChecklistViewer';
import { InspectionPhotosGallery } from './InspectionPhotosGallery';
import { SignatureSignoffModal } from './SignatureSignoffModal';
import { PaymentModal } from './PaymentModal';
import { RatingModal } from './RatingModal';

interface OrderTrackingViewProps {
  orders: ServiceOrder[];
  onOrderUpdated: (order: ServiceOrder) => void;
  onOpenSupport: () => void;
  onBookNew: () => void;
}

export function OrderTrackingView({
  orders,
  onOrderUpdated,
  onOpenSupport,
  onBookNew
}: OrderTrackingViewProps) {
  const [filterTab, setFilterTab] = useState<'active' | 'past'>('active');
  const [selectedOrderId, setSelectedOrderId] = useState<string>(
    orders.find((o) => o.status !== 'completed' && o.status !== 'cancelled')?.id ||
      orders[0]?.id ||
      ''
  );

  // Modals state
  const [activeModal, setActiveModal] = useState<
    'checklist' | 'photos' | 'signature' | 'payment' | 'rating' | null
  >(null);

  // Real-time Postgres Changes Subscription
  useEffect(() => {
    const unsubscribe = CleanProAPI.subscribeToOrders((event, order) => {
      if (event === 'UPDATE' || event === 'INSERT') {
        onOrderUpdated(order);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [onOrderUpdated]);

  const activeOrders = orders.filter((o) => o.status !== 'completed' && o.status !== 'cancelled');
  const pastOrders = orders.filter((o) => o.status === 'completed' || o.status === 'cancelled');

  const currentList = filterTab === 'active' ? activeOrders : pastOrders;
  const currentOrder = orders.find((o) => o.id === selectedOrderId) || currentList[0] || orders[0];

  // Pipeline Status Steps
  const STATUS_STEPS: { id: ServiceStatus; label: string; description: string; icon: string }[] = [
    {
      id: 'confirmed',
      label: 'Scheduled',
      description: 'Order confirmed & scheduled in dispatch calendar',
      icon: 'Calendar'
    },
    {
      id: 'en_route',
      label: 'Team En Route',
      description: 'Cleaners on the way with specialized equipment',
      icon: 'Truck'
    },
    {
      id: 'in_progress',
      label: 'Cleaning in Progress',
      description: 'Room-by-room detailing & hygiene sanitization',
      icon: 'Sparkles'
    },
    {
      id: 'inspecting',
      label: 'Quality Inspection',
      description: 'Before/after photo audit & supervisor sign-off',
      icon: 'Camera'
    },
    {
      id: 'completed',
      label: 'Completed & Certified',
      description: 'Final client sign-off & warranty active',
      icon: 'CheckCircle2'
    }
  ];

  const getStatusStepIndex = (status: ServiceStatus): number => {
    switch (status) {
      case 'pending':
      case 'confirmed':
      case 'team_assigned':
        return 0;
      case 'en_route':
        return 1;
      case 'in_progress':
        return 2;
      case 'inspecting':
        return 3;
      case 'completed':
        return 4;
      default:
        return 0;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex bg-slate-100 p-1 rounded-2xl">
            <button
              id="tab-orders-active"
              type="button"
              onClick={() => {
                setFilterTab('active');
                if (activeOrders[0]) setSelectedOrderId(activeOrders[0].id);
              }}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 ${
                filterTab === 'active'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <span>Active Orders</span>
              {activeOrders.length > 0 && (
                <span className="w-5 h-5 rounded-full bg-sky-600 text-white text-[10px] flex items-center justify-center font-black">
                  {activeOrders.length}
                </span>
              )}
            </button>

            <button
              id="tab-orders-past"
              type="button"
              onClick={() => {
                setFilterTab('past');
                if (pastOrders[0]) setSelectedOrderId(pastOrders[0].id);
              }}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 ${
                filterTab === 'past'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <span>Past History</span>
              <span className="text-[10px] text-slate-400 font-semibold">({pastOrders.length})</span>
            </button>
          </div>

          {/* Real-Time Pulse Indicator */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-semibold">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>Live Dispatch Sync</span>
          </div>
        </div>

        <button
          id="btn-track-new-booking"
          type="button"
          onClick={onBookNew}
          className="px-3.5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1 transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>New Booking</span>
        </button>
      </div>

      {currentList.length === 0 ? (
        /* Empty State */
        <div className="bg-white rounded-3xl p-10 text-center border border-slate-200 shadow-sm space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center mx-auto">
            <Calendar className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {filterTab === 'active' ? 'No Active Orders Currently' : 'No Past Orders Found'}
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              {filterTab === 'active'
                ? 'Browse our cleaning catalog to schedule your first home or commercial deep cleaning.'
                : 'Your completed cleaning history, inspection photos, and invoices will appear here.'}
            </p>
          </div>
          <button
            onClick={onBookNew}
            className="px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold shadow-xs"
          >
            Explore Cleaning Services
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Order Selector Cards (on mobile or multi-order views) */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Select Order to Track
            </h4>
            {currentList.map((order) => {
              const isSelected = order.id === currentOrder?.id;
              const isCompleted = order.status === 'completed';

              return (
                <div
                  key={order.id}
                  id={`order-select-card-${order.order_number}`}
                  onClick={() => setSelectedOrderId(order.id)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-sky-50/70 border-sky-600 shadow-xs'
                      : 'bg-white border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-mono font-bold text-sky-800 bg-sky-100/80 px-2 py-0.5 rounded-md">
                      #{order.order_number}
                    </span>
                    <span
                      className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                        isCompleted
                          ? 'bg-emerald-100 text-emerald-800'
                          : order.status === 'in_progress'
                          ? 'bg-amber-100 text-amber-900 animate-pulse'
                          : 'bg-sky-100 text-sky-800'
                      }`}
                    >
                      {order.status.replace('_', ' ')}
                    </span>
                  </div>

                  <h5 className="font-bold text-xs text-slate-900 mb-1">{order.service_name}</h5>

                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      {order.scheduled_date}
                    </span>
                    <span className="font-bold text-slate-800">
                      ${order.pricing_breakdown.total_amount.toFixed(2)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right 2 Columns: Rich Live Tracking & Inspection Dashboard */}
          {currentOrder && (
            <div className="lg:col-span-2 space-y-5">
              {/* Main Live Status Card */}
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                {/* Header Banner */}
                <div className="p-5 bg-linear-to-r from-sky-900 via-sky-800 to-slate-900 text-white flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono bg-white/20 px-2.5 py-0.5 rounded-md text-sky-200">
                        {currentOrder.order_number}
                      </span>
                      <span className="text-xs font-semibold text-sky-200">
                        {currentOrder.category_name}
                      </span>
                    </div>
                    <h3 className="text-lg font-extrabold mt-1">{currentOrder.service_name}</h3>
                    <p className="text-xs text-sky-200 flex items-center gap-1.5 mt-0.5">
                      <Clock className="w-3.5 h-3.5" />
                      Scheduled: {currentOrder.scheduled_date} • {currentOrder.time_slot}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-sky-200 bg-white/10 px-3 py-1.5 rounded-xl border border-white/10 flex items-center gap-1.5">
                      <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                      <span>Live WebSocket Connected</span>
                    </span>
                  </div>
                </div>

                {/* Stepper Pipeline */}
                <div className="p-5 border-b border-slate-100 bg-slate-50/50">
                  <div className="relative">
                    {/* Connecting line */}
                    <div className="absolute top-4 left-6 right-6 h-0.5 bg-slate-200 -z-0" />
                    <div
                      className="absolute top-4 left-6 h-0.5 bg-sky-600 transition-all duration-500 -z-0"
                      style={{
                        width: `${(getStatusStepIndex(currentOrder.status) / 4) * 88}%`
                      }}
                    />

                    <div className="grid grid-cols-5 gap-1 relative z-10">
                      {STATUS_STEPS.map((step, idx) => {
                        const currentStepIdx = getStatusStepIndex(currentOrder.status);
                        const isDone = idx < currentStepIdx;
                        const isCurrent = idx === currentStepIdx;

                        return (
                          <div key={step.id} className="flex flex-col items-center text-center">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all shadow-xs ${
                                isDone
                                  ? 'bg-emerald-600 text-white'
                                  : isCurrent
                                  ? 'bg-sky-600 text-white ring-4 ring-sky-100'
                                  : 'bg-white border-2 border-slate-300 text-slate-400'
                              }`}
                            >
                              {isDone ? <Check className="w-4 h-4 stroke-[3]" /> : idx + 1}
                            </div>
                            <span
                              className={`text-[10px] font-bold mt-1.5 leading-tight ${
                                isCurrent
                                  ? 'text-sky-900 font-extrabold'
                                  : isDone
                                  ? 'text-emerald-800'
                                  : 'text-slate-400'
                              }`}
                            >
                              {step.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Assigned Field Crew Card */}
                {currentOrder.assigned_team && (
                  <div className="p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4 bg-sky-50/40">
                    <div className="flex items-center gap-3">
                      <div className="relative w-12 h-12 rounded-2xl overflow-hidden bg-slate-200 border-2 border-white shadow-xs shrink-0">
                        <Image
                          src={currentOrder.assigned_team.lead_photo}
                          alt={currentOrder.assigned_team.lead_cleaner}
                          fill
                          className="object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-slate-900">
                            {currentOrder.assigned_team.lead_cleaner} &amp; Team
                          </h4>
                          <span className="text-[10px] font-extrabold bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded-md flex items-center gap-0.5">
                            ★ {currentOrder.assigned_team.rating}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500">
                          {currentOrder.assigned_team.name} • {currentOrder.assigned_team.specialty}
                        </p>
                        {currentOrder.status === 'en_route' && (
                          <p className="text-xs font-bold text-sky-700 mt-0.5 animate-pulse">
                            🚚 Estimated Arrival: ~{currentOrder.assigned_team.eta_minutes || 12} mins
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <a
                        href={`tel:${currentOrder.assigned_team.lead_phone}`}
                        className="px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
                      >
                        <Phone className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Call Team</span>
                      </a>
                      <button
                        type="button"
                        onClick={onOpenSupport}
                        className="px-3 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
                      >
                        <Headphones className="w-3.5 h-3.5" />
                        <span>SAC / Dispatch</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Service Address & Notes */}
                <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs border-b border-slate-100">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-sky-600" /> Cleaning Location
                    </span>
                    <p className="font-semibold text-slate-900">
                      {currentOrder.address.street}, {currentOrder.address.number}{' '}
                      {currentOrder.address.complement && `(${currentOrder.address.complement})`}
                    </p>
                    <p className="text-slate-500">
                      {currentOrder.address.neighborhood}, {currentOrder.address.city} -{' '}
                      {currentOrder.address.zip_code}
                    </p>
                    {currentOrder.address.access_notes && (
                      <p className="text-[11px] text-amber-800 bg-amber-50 p-2 rounded-xl border border-amber-200/60 mt-1">
                        <strong>Access Notes:</strong> {currentOrder.address.access_notes}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Property &amp; Add-ons
                    </span>
                    <p className="font-semibold text-slate-900">
                      {currentOrder.property_details.bedrooms} Beds,{' '}
                      {currentOrder.property_details.bathrooms} Baths •{' '}
                      {currentOrder.property_details.property_type.toUpperCase()}
                    </p>
                    {currentOrder.selected_addons.length > 0 ? (
                      <ul className="text-slate-600 space-y-0.5 mt-1">
                        {currentOrder.selected_addons.map((a, idx) => (
                          <li key={idx} className="flex items-center gap-1 text-[11px]">
                            <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
                            <span>
                              {a.name} ({a.quantity}x)
                            </span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-slate-400 text-[11px]">No extra add-ons selected</p>
                    )}
                  </div>
                </div>

                {/* Action Hub Buttons Bar */}
                <div className="p-4 bg-slate-50 grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    id="btn-open-checklist"
                    type="button"
                    onClick={() => setActiveModal('checklist')}
                    className="p-3 bg-white hover:bg-sky-50 border border-slate-200 hover:border-sky-300 rounded-2xl text-left transition-all shadow-2xs group"
                  >
                    <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center mb-1 group-hover:scale-105 transition-transform">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <span className="block text-xs font-bold text-slate-900">Checklist</span>
                    <span className="text-[10px] text-slate-500">Live room tasks</span>
                  </button>

                  <button
                    id="btn-open-photos"
                    type="button"
                    onClick={() => setActiveModal('photos')}
                    className="p-3 bg-white hover:bg-sky-50 border border-slate-200 hover:border-sky-300 rounded-2xl text-left transition-all shadow-2xs group"
                  >
                    <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-1 group-hover:scale-105 transition-transform">
                      <Camera className="w-4 h-4" />
                    </div>
                    <span className="block text-xs font-bold text-slate-900">Photos ({currentOrder.inspection_photos.length})</span>
                    <span className="text-[10px] text-slate-500">Before &amp; After</span>
                  </button>

                  <button
                    id="btn-open-signature"
                    type="button"
                    onClick={() => setActiveModal('signature')}
                    className="p-3 bg-white hover:bg-sky-50 border border-slate-200 hover:border-sky-300 rounded-2xl text-left transition-all shadow-2xs group"
                  >
                    <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center mb-1 group-hover:scale-105 transition-transform">
                      <PenTool className="w-4 h-4" />
                    </div>
                    <span className="block text-xs font-bold text-slate-900">Sign-Off</span>
                    <span className="text-[10px] text-slate-500">
                      {currentOrder.client_signature ? 'Signed & Approved' : 'Digital verification'}
                    </span>
                  </button>

                  <button
                    id="btn-open-payment"
                    type="button"
                    onClick={() => setActiveModal('payment')}
                    className="p-3 bg-white hover:bg-sky-50 border border-slate-200 hover:border-sky-300 rounded-2xl text-left transition-all shadow-2xs group"
                  >
                    <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mb-1 group-hover:scale-105 transition-transform">
                      <CreditCard className="w-4 h-4" />
                    </div>
                    <span className="block text-xs font-bold text-slate-900">Payment</span>
                    <span className="text-[10px] text-slate-500 capitalize">
                      {currentOrder.payment_status} • PIX/Card
                    </span>
                  </button>
                </div>
              </div>

              {/* Review & Rating Card if completed */}
              {currentOrder.status === 'completed' && (
                <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                      <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">
                        {currentOrder.rating ? 'Your Rating Submitted' : 'How was your cleaning?'}
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        {currentOrder.rating
                          ? `You rated this service ${currentOrder.rating.rating}.0 Stars`
                          : 'Leave a certified review to reward your crew.'}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveModal('rating')}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
                  >
                    {currentOrder.rating ? 'Edit Review' : 'Rate Service'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Modal Dialogs */}
      {activeModal === 'checklist' && currentOrder && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setActiveModal(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-lg w-full max-h-[85vh] overflow-y-auto p-5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-sm text-slate-900">Live Room Inspection Checklist</h3>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>
            <ChecklistViewer order={currentOrder} onOrderUpdated={onOrderUpdated} />
          </div>
        </div>
      )}

      {activeModal === 'photos' && currentOrder && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setActiveModal(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-sm text-slate-900">Before &amp; After Photo Gallery</h3>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>
            <InspectionPhotosGallery
              photos={currentOrder.inspection_photos}
              orderNumber={currentOrder.order_number}
            />
          </div>
        </div>
      )}

      {activeModal === 'signature' && currentOrder && (
        <SignatureSignoffModal
          isOpen={true}
          order={currentOrder}
          onClose={() => setActiveModal(null)}
          onOrderUpdated={onOrderUpdated}
        />
      )}

      {activeModal === 'payment' && currentOrder && (
        <PaymentModal
          isOpen={true}
          order={currentOrder}
          onClose={() => setActiveModal(null)}
          onOrderUpdated={onOrderUpdated}
        />
      )}

      {activeModal === 'rating' && currentOrder && (
        <RatingModal
          isOpen={true}
          order={currentOrder}
          onClose={() => setActiveModal(null)}
          onOrderUpdated={onOrderUpdated}
        />
      )}
    </div>
  );
}
