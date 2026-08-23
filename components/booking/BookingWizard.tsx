'use client';

import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  X,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  BedDouble,
  Bath,
  Utensils,
  Sofa,
  Dog,
  Calendar,
  Clock,
  MapPin,
  Check,
  Percent,
  CreditCard,
  QrCode,
  ShieldCheck,
  Flame,
  Refrigerator,
  AppWindow,
  Layers,
  Sun,
  Archive,
  Cpu,
  Paintbrush
} from 'lucide-react';
import {
  CleaningService,
  UserProfile,
  ServiceFrequency,
  PaymentMethod,
  AddOnSelection,
  PricingBreakdown,
  ServiceOrder
} from '@/lib/types';
import { CleanProAPI } from '@/lib/supabaseClient';

interface BookingWizardProps {
  service: CleaningService;
  currentUser: UserProfile | null;
  onClose: () => void;
  onOrderCreated: (order: ServiceOrder) => void;
  onRequireLogin: () => void;
}

function getTomorrowDateString(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
}

function generateTransactionId(): string {
  return `TXN-${Math.floor(100000 + Math.random() * 900000)}`;
}

export function BookingWizard({
  service,
  currentUser,
  onClose,
  onOrderCreated,
  onRequireLogin
}: BookingWizardProps) {
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [submitting, setSubmitting] = useState(false);

  // Step 1: Property Specs & Rooms
  const [propertyType, setPropertyType] = useState<'apartment' | 'house' | 'commercial' | 'studio'>('apartment');
  const [bedrooms, setBedrooms] = useState(2);
  const [bathrooms, setBathrooms] = useState(2);
  const [kitchens, setKitchens] = useState(1);
  const [livingRooms, setLivingRooms] = useState(1);
  const [sqFt, setSqFt] = useState(900);
  const [hasPets, setHasPets] = useState(false);
  const [petDetails, setPetDetails] = useState('');

  // Step 2: Add-ons
  const [selectedAddons, setSelectedAddons] = useState<Record<string, number>>({});

  // Step 3: Date, Time & Frequency
  const [scheduledDate, setScheduledDate] = useState('2026-08-25');
  const [timeSlot, setTimeSlot] = useState('08:00 - 12:00 (Morning Slot)');
  const [frequency, setFrequency] = useState<ServiceFrequency>('one_time');

  // Step 4: Address & Access
  const [street, setStreet] = useState(() => currentUser?.default_address?.street || '');
  const [number, setNumber] = useState(() => currentUser?.default_address?.number || '');
  const [complement, setComplement] = useState(() => currentUser?.default_address?.complement || '');
  const [neighborhood, setNeighborhood] = useState(() => currentUser?.default_address?.neighborhood || '');
  const [city, setCity] = useState(() => currentUser?.default_address?.city || 'New York');
  const [zipCode, setZipCode] = useState(() => currentUser?.default_address?.zip_code || '10014');
  const [accessNotes, setAccessNotes] = useState(() => currentUser?.default_address?.access_notes || '');

  // Step 5: Payment
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');

  // Addon Icon mapper
  const getAddonIcon = (iconName: string) => {
    switch (iconName) {
      case 'Flame':
        return <Flame className="w-4 h-4 text-amber-500" />;
      case 'Refrigerator':
        return <Refrigerator className="w-4 h-4 text-sky-500" />;
      case 'AppWindow':
        return <AppWindow className="w-4 h-4 text-blue-500" />;
      case 'Layers':
        return <Layers className="w-4 h-4 text-emerald-500" />;
      case 'Sun':
        return <Sun className="w-4 h-4 text-amber-400" />;
      case 'Archive':
        return <Archive className="w-4 h-4 text-purple-500" />;
      case 'Cpu':
        return <Cpu className="w-4 h-4 text-indigo-500" />;
      case 'Paintbrush':
        return <Paintbrush className="w-4 h-4 text-rose-500" />;
      case 'Dog':
        return <Dog className="w-4 h-4 text-orange-500" />;
      default:
        return <Sparkles className="w-4 h-4 text-sky-500" />;
    }
  };

  // Pricing math calculations
  const calculatePricing = (): PricingBreakdown => {
    const base = service.base_price;
    // Room extra fee: $20 for each bed above 1, $25 for each bath above 1
    const extraBedroomsFee = Math.max(0, bedrooms - 1) * 20;
    const extraBathroomsFee = Math.max(0, bathrooms - 1) * 25;
    const extraRoomsFee = extraBedroomsFee + extraBathroomsFee;

    // Sq Ft fee ($15 for every 300 sq ft above 600)
    const extraSqFt = Math.max(0, sqFt - 600);
    const sizeFee = Math.floor(extraSqFt / 300) * 15;

    // Addons total
    let addonsTotal = 0;
    Object.entries(selectedAddons).forEach(([addonId, qty]) => {
      const addon = service.available_addons.find((a) => a.id === addonId);
      if (addon && qty > 0) {
        addonsTotal += addon.price * qty;
      }
    });

    const subtotal = base + sizeFee + extraRoomsFee + addonsTotal;

    // Frequency discount
    let discountPct = 0;
    if (frequency === 'weekly') discountPct = 20;
    else if (frequency === 'bi_weekly') discountPct = 15;
    else if (frequency === 'monthly') discountPct = 10;

    const discountAmount = Number(((subtotal * discountPct) / 100).toFixed(2));
    const discountedSubtotal = subtotal - discountAmount;
    const taxesAndInsurance = Number((discountedSubtotal * 0.05).toFixed(2));
    const totalAmount = Number((discountedSubtotal + taxesAndInsurance).toFixed(2));

    return {
      base_price: base,
      property_size_fee: sizeFee,
      extra_rooms_fee: extraRoomsFee,
      addons_total: addonsTotal,
      subtotal,
      discount_percentage: discountPct,
      discount_amount: discountAmount,
      taxes_and_insurance: taxesAndInsurance,
      total_amount: totalAmount
    };
  };

  const pricing = calculatePricing();

  const handleToggleAddon = (addonId: string) => {
    setSelectedAddons((prev) => {
      const curr = prev[addonId] || 0;
      if (curr > 0) {
        const next = { ...prev };
        delete next[addonId];
        return next;
      }
      return { ...prev, [addonId]: 1 };
    });
  };

  const handleSubmitOrder = async () => {
    if (!currentUser) {
      onRequireLogin();
      return;
    }

    if (!street.trim() || !number.trim()) {
      alert('Please enter your service address before submitting.');
      setStep(4);
      return;
    }

    setSubmitting(true);
    try {
      const txnId = generateTransactionId();

      // Build selected addons array
      const addonList: AddOnSelection[] = [];
      Object.entries(selectedAddons).forEach(([addonId, qty]) => {
        const a = service.available_addons.find((item) => item.id === addonId);
        if (a && qty > 0) {
          addonList.push({
            addon_id: a.id,
            name: a.name,
            unit_price: a.price,
            quantity: qty,
            total_price: a.price * qty
          });
        }
      });

      // Build initial checklist template from service
      const checklist = service.included_tasks.map((group, gIdx) => ({
        room_name: group.room,
        icon: 'Sparkles',
        items: group.tasks.map((t, tIdx) => ({
          id: `chk_${gIdx}_${tIdx}`,
          label: t,
          completed: false
        }))
      }));

      // If addons exist, add custom checklist items
      if (addonList.length > 0) {
        checklist.push({
          room_name: 'Custom Add-On Treatments',
          icon: 'Plus',
          items: addonList.map((ad, idx) => ({
            id: `addon_chk_${idx}`,
            label: `${ad.name} (${ad.quantity}x)`,
            completed: false
          }))
        });
      }

      const order = await CleanProAPI.createOrder({
        client_id: currentUser.id,
        client_name: currentUser.full_name,
        client_email: currentUser.email,
        client_phone: currentUser.phone || '+1 (555) 301-4492',
        service_id: service.id,
        service_name: service.name,
        category_name: 'Residential & Turnover',
        status: 'confirmed',
        scheduled_date: scheduledDate,
        time_slot: timeSlot,
        address: {
          street,
          number,
          complement,
          neighborhood,
          city,
          state: 'NY',
          zip_code: zipCode,
          access_notes: accessNotes
        },
        property_details: {
          property_type: propertyType,
          bedrooms,
          bathrooms,
          kitchens,
          living_rooms: livingRooms,
          sq_ft: sqFt,
          has_pets: hasPets,
          pet_details: petDetails
        },
        selected_addons: addonList,
        frequency,
        pricing_breakdown: pricing,
        checklist,
        inspection_photos: [],
        payment_status: paymentMethod === 'pix' ? 'paid' : 'pending_verification',
        payment_details: {
          method: paymentMethod,
          pix_key: 'pix@cleanpro-dispatch.com',
          pix_qr_code: '00020126580014BR.GOV.BCB.PIX0136e1b6f001-44bb-4e6a-bc01-cleanpro520400005303986',
          paid_at: paymentMethod === 'pix' ? '2026-08-25T10:00:00.000Z' : undefined,
          card_last4: paymentMethod === 'credit_card' ? (cardNumber.slice(-4) || '8841') : undefined,
          transaction_id: txnId
        },
        notes_for_cleaners: accessNotes
      });

      // Confetti fire!
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch {
        // ignore
      }

      onOrderCreated(order);
    } catch (err) {
      alert('Failed to place booking: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      id="booking-wizard-backdrop"
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        id="booking-wizard-card"
        className="bg-white rounded-3xl w-full max-w-xl shadow-2xl border border-slate-100 flex flex-col max-h-[92vh] overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Wizard Navigation */}
        <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {step > 1 && (
              <button
                id="wizard-back-btn"
                onClick={() => setStep((s) => (s - 1) as 1 | 2 | 3 | 4 | 5)}
                className="p-1.5 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-200 transition-colors mr-1"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <div>
              <span className="text-[11px] font-bold text-sky-600 uppercase tracking-wider">
                Step {step} of 5
              </span>
              <h3 className="text-base font-bold text-slate-900 leading-tight">
                {step === 1 && 'Property Details & Rooms'}
                {step === 2 && 'Custom Add-On Treatments'}
                {step === 3 && 'Date & Frequency'}
                {step === 4 && 'Service Address & Access'}
                {step === 5 && 'Review & Payment'}
              </h3>
            </div>
          </div>
          <button
            id="wizard-close-btn"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progress Indicator */}
        <div className="w-full bg-slate-100 h-1">
          <div
            className="bg-sky-600 h-1 transition-all duration-300"
            style={{ width: `${(step / 5) * 100}%` }}
          />
        </div>

        {/* Wizard Step Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-5">
          {/* STEP 1: Rooms & Property Details */}
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Property Type
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(['apartment', 'house', 'studio', 'commercial'] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setPropertyType(t)}
                      className={`p-2.5 rounded-xl border text-center capitalize text-xs font-semibold transition-all ${
                        propertyType === t
                          ? 'border-sky-600 bg-sky-50 text-sky-900 shadow-xs'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Room Counters */}
              <div className="space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Room Count Configuration
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {/* Bedrooms */}
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <BedDouble className="w-4 h-4 text-sky-600" />
                      <div>
                        <p className="text-xs font-semibold text-slate-800">Bedrooms</p>
                        <p className="text-[10px] text-slate-500">+$20 / extra</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setBedrooms((b) => Math.max(1, b - 1))}
                        className="w-7 h-7 rounded-lg bg-white border border-slate-200 text-slate-700 flex items-center justify-center font-bold text-sm"
                      >
                        -
                      </button>
                      <span className="font-bold text-sm text-slate-800 w-4 text-center">{bedrooms}</span>
                      <button
                        type="button"
                        onClick={() => setBedrooms((b) => b + 1)}
                        className="w-7 h-7 rounded-lg bg-white border border-slate-200 text-slate-700 flex items-center justify-center font-bold text-sm"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Bathrooms */}
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bath className="w-4 h-4 text-sky-600" />
                      <div>
                        <p className="text-xs font-semibold text-slate-800">Bathrooms</p>
                        <p className="text-[10px] text-slate-500">+$25 / extra</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setBathrooms((b) => Math.max(1, b - 1))}
                        className="w-7 h-7 rounded-lg bg-white border border-slate-200 text-slate-700 flex items-center justify-center font-bold text-sm"
                      >
                        -
                      </button>
                      <span className="font-bold text-sm text-slate-800 w-4 text-center">{bathrooms}</span>
                      <button
                        type="button"
                        onClick={() => setBathrooms((b) => b + 1)}
                        className="w-7 h-7 rounded-lg bg-white border border-slate-200 text-slate-700 flex items-center justify-center font-bold text-sm"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Kitchens */}
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Utensils className="w-4 h-4 text-sky-600" />
                      <div>
                        <p className="text-xs font-semibold text-slate-800">Kitchens</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setKitchens((k) => Math.max(1, k - 1))}
                        className="w-7 h-7 rounded-lg bg-white border border-slate-200 text-slate-700 flex items-center justify-center font-bold text-sm"
                      >
                        -
                      </button>
                      <span className="font-bold text-sm text-slate-800 w-4 text-center">{kitchens}</span>
                      <button
                        type="button"
                        onClick={() => setKitchens((k) => k + 1)}
                        className="w-7 h-7 rounded-lg bg-white border border-slate-200 text-slate-700 flex items-center justify-center font-bold text-sm"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Living Rooms */}
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sofa className="w-4 h-4 text-sky-600" />
                      <div>
                        <p className="text-xs font-semibold text-slate-800">Living Areas</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setLivingRooms((l) => Math.max(1, l - 1))}
                        className="w-7 h-7 rounded-lg bg-white border border-slate-200 text-slate-700 flex items-center justify-center font-bold text-sm"
                      >
                        -
                      </button>
                      <span className="font-bold text-sm text-slate-800 w-4 text-center">{livingRooms}</span>
                      <button
                        type="button"
                        onClick={() => setLivingRooms((l) => l + 1)}
                        className="w-7 h-7 rounded-lg bg-white border border-slate-200 text-slate-700 flex items-center justify-center font-bold text-sm"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Approximate Sq Ft Slider */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800">Approximate Floor Area</span>
                  <span className="font-extrabold text-sky-700 bg-sky-100 px-2.5 py-0.5 rounded-full">
                    {sqFt} sq ft
                  </span>
                </div>
                <input
                  type="range"
                  min="400"
                  max="3500"
                  step="50"
                  value={sqFt}
                  onChange={(e) => setSqFt(Number(e.target.value))}
                  className="w-full accent-sky-600"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>Compact (400 sqft)</span>
                  <span>Average (1,200 sqft)</span>
                  <span>Large Villa (3,500 sqft)</span>
                </div>
              </div>

              {/* Pets info */}
              <div className="p-3.5 bg-amber-50/70 rounded-2xl border border-amber-200/70 space-y-2">
                <label className="flex items-center justify-between cursor-pointer">
                  <div className="flex items-center gap-2">
                    <Dog className="w-4 h-4 text-amber-700" />
                    <span className="text-xs font-semibold text-amber-900">
                      Are there pets on the premises?
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={hasPets}
                    onChange={(e) => setHasPets(e.target.checked)}
                    className="w-4 h-4 accent-amber-600"
                  />
                </label>
                {hasPets && (
                  <input
                    type="text"
                    placeholder="e.g. 1 friendly Golden Retriever (Bailey), kept in bedroom"
                    value={petDetails}
                    onChange={(e) => setPetDetails(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-amber-200 rounded-xl text-xs text-slate-800 placeholder-slate-400"
                  />
                )}
              </div>
            </div>
          )}

          {/* STEP 2: Custom Add-Ons */}
          {step === 2 && (
            <div className="space-y-3 animate-in fade-in">
              <p className="text-xs text-slate-600">
                Enhance your clean with specialized interior treatments. Selected items are automatically added to the cleaner inspection checklist.
              </p>

              <div className="space-y-2.5">
                {service.available_addons.map((addon) => {
                  const isSelected = Boolean(selectedAddons[addon.id]);
                  return (
                    <div
                      key={addon.id}
                      onClick={() => handleToggleAddon(addon.id)}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                        isSelected
                          ? 'border-sky-600 bg-sky-50/80 shadow-xs'
                          : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-2xs">
                          {getAddonIcon(addon.icon)}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900">{addon.name}</p>
                          <p className="text-[11px] text-slate-500">{addon.description}</p>
                          <span className="inline-block mt-1 text-[10px] font-semibold text-slate-400 uppercase">
                            {addon.unit}
                          </span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-extrabold text-sky-700">+${addon.price}</p>
                        <span
                          className={`inline-flex items-center justify-center w-5 h-5 rounded-full mt-1 ${
                            isSelected ? 'bg-sky-600 text-white' : 'border border-slate-300'
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 3: Date, Time & Frequency */}
          {step === 3 && (
            <div className="space-y-4 animate-in fade-in">
              {/* Frequency with Discounts */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Service Frequency &amp; Discounts
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'one_time', label: 'One-Time Clean', discount: null },
                    { id: 'weekly', label: 'Weekly Clean', discount: '20% OFF' },
                    { id: 'bi_weekly', label: 'Bi-Weekly Clean', discount: '15% OFF' },
                    { id: 'monthly', label: 'Monthly Clean', discount: '10% OFF' }
                  ].map((freq) => (
                    <button
                      key={freq.id}
                      type="button"
                      onClick={() => setFrequency(freq.id as ServiceFrequency)}
                      className={`p-3 rounded-2xl border text-left transition-all ${
                        frequency === freq.id
                          ? 'border-sky-600 bg-sky-50 text-sky-900 shadow-xs'
                          : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold">{freq.label}</span>
                        {freq.discount && (
                          <span className="text-[10px] font-extrabold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                            <Percent className="w-2.5 h-2.5" />
                            {freq.discount}
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1">
                        {freq.id === 'one_time' ? 'Standard single booking' : 'Recurring top cleaner priority'}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Date selection */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-sky-600" /> Preferred Date
                </label>
                <input
                  type="date"
                  value={scheduledDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:bg-white"
                />
              </div>

              {/* Time slot selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-sky-600" /> Arrival Time Window
                </label>
                <div className="space-y-2">
                  {[
                    '08:00 - 12:00 (Morning Slot)',
                    '13:00 - 17:00 (Afternoon Slot)',
                    '17:30 - 20:30 (Evening Express Slot)'
                  ].map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setTimeSlot(slot)}
                      className={`w-full p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-between transition-all ${
                        timeSlot === slot
                          ? 'border-sky-600 bg-sky-50 text-sky-900 shadow-2xs'
                          : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span>{slot}</span>
                      {timeSlot === slot && <Check className="w-4 h-4 text-sky-600" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Service Address & Access */}
          {step === 4 && (
            <div className="space-y-3.5 animate-in fade-in">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-sky-600" /> Address Details
                </span>
                {currentUser?.default_address && (
                  <button
                    type="button"
                    onClick={() => {
                      if (currentUser.default_address) {
                        setStreet(currentUser.default_address.street);
                        setNumber(currentUser.default_address.number);
                        setComplement(currentUser.default_address.complement || '');
                        setNeighborhood(currentUser.default_address.neighborhood);
                        setCity(currentUser.default_address.city);
                        setZipCode(currentUser.default_address.zip_code);
                        setAccessNotes(currentUser.default_address.access_notes || '');
                      }
                    }}
                    className="text-[11px] font-semibold text-sky-600 hover:underline"
                  >
                    Auto-Fill Saved Address
                  </button>
                )}
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">Street Address</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 742 Evergreen Terrace"
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">Number / Apt</label>
                  <input
                    type="text"
                    required
                    placeholder="Apt 4B"
                    value={number}
                    onChange={(e) => setNumber(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">Neighborhood</label>
                  <input
                    type="text"
                    placeholder="Greenwich Village"
                    value={neighborhood}
                    onChange={(e) => setNeighborhood(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">City</label>
                  <input
                    type="text"
                    placeholder="New York"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">Zip Code</label>
                  <input
                    type="text"
                    placeholder="10014"
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">
                  Access Instructions &amp; Security Notes for Cleaning Crew
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Doorman has keys, dial #402 on intercom, elevator is on the right"
                  value={accessNotes}
                  onChange={(e) => setAccessNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900"
                />
              </div>
            </div>
          )}

          {/* STEP 5: Review & Payment */}
          {step === 5 && (
            <div className="space-y-4 animate-in fade-in">
              {/* Order Summary Card */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2.5 text-xs">
                <div className="flex justify-between font-bold text-slate-900 text-sm pb-2 border-b border-slate-200">
                  <span>{service.name}</span>
                  <span>${pricing.base_price.toFixed(2)}</span>
                </div>

                <div className="space-y-1 text-slate-600">
                  <div className="flex justify-between">
                    <span>
                      {bedrooms} Beds, {bathrooms} Baths, {sqFt} sqft
                    </span>
                    <span>+${(pricing.extra_rooms_fee + pricing.property_size_fee).toFixed(2)}</span>
                  </div>
                  {pricing.addons_total > 0 && (
                    <div className="flex justify-between text-sky-700">
                      <span>Add-ons ({Object.keys(selectedAddons).length} selected)</span>
                      <span>+${pricing.addons_total.toFixed(2)}</span>
                    </div>
                  )}
                  {pricing.discount_amount > 0 && (
                    <div className="flex justify-between text-emerald-600 font-semibold">
                      <span>Frequency Discount ({pricing.discount_percentage}%)</span>
                      <span>-${pricing.discount_amount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-500 text-[11px]">
                    <span>Regulatory &amp; Disinfection Insurance (5%)</span>
                    <span>+${pricing.taxes_and_insurance.toFixed(2)}</span>
                  </div>
                </div>

                <div className="flex justify-between font-extrabold text-base text-slate-900 pt-2 border-t border-slate-200">
                  <span>Total Amount</span>
                  <span className="text-sky-700">${pricing.total_amount.toFixed(2)}</span>
                </div>
              </div>

              {/* Payment Method Selector */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Select Payment Method
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('pix')}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      paymentMethod === 'pix'
                        ? 'border-sky-600 bg-sky-50 text-sky-900 shadow-xs'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-bold text-xs">
                      <QrCode className="w-4 h-4 text-emerald-600" />
                      <span>Instant PIX / QR</span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1">Instant confirmation & receipt</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('credit_card')}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      paymentMethod === 'credit_card'
                        ? 'border-sky-600 bg-sky-50 text-sky-900 shadow-xs'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-bold text-xs">
                      <CreditCard className="w-4 h-4 text-sky-600" />
                      <span>Credit Card</span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1">Up to 3x installments</p>
                  </button>
                </div>

                {paymentMethod === 'credit_card' && (
                  <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2.5 text-xs animate-in fade-in">
                    <div>
                      <label className="block text-[11px] font-medium text-slate-600 mb-1">Card Number</label>
                      <input
                        type="text"
                        placeholder="•••• •••• •••• 4242"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-medium text-slate-600 mb-1">MM/YY</label>
                        <input
                          type="text"
                          placeholder="12/28"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-slate-600 mb-1">CVC</label>
                        <input
                          type="password"
                          maxLength={4}
                          placeholder="123"
                          value={cardCvc}
                          onChange={(e) => setCardCvc(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Compliance note */}
              <div className="flex items-center gap-2 text-[11px] text-slate-500 bg-sky-50/60 p-2.5 rounded-xl border border-sky-100">
                <ShieldCheck className="w-4 h-4 text-sky-600 shrink-0" />
                <span>100% Satisfaction Guarantee: Free re-touch inspection within 48h if not satisfied.</span>
              </div>
            </div>
          )}
        </div>

        {/* Wizard Footer Controls */}
        <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-bold text-slate-400">Estimated Total</span>
            <span className="text-lg font-black text-slate-900">${pricing.total_amount.toFixed(2)}</span>
          </div>

          <div className="flex items-center gap-2">
            {step < 5 ? (
              <button
                id={`wizard-next-step-${step}`}
                type="button"
                onClick={() => setStep((s) => (s + 1) as 1 | 2 | 3 | 4 | 5)}
                className="px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 active:scale-95"
              >
                <span>Continue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                id="wizard-submit-order-btn"
                type="button"
                disabled={submitting}
                onClick={handleSubmitOrder}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-600/20 flex items-center gap-1.5 active:scale-95 disabled:opacity-60"
              >
                {submitting ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Confirm &amp; Book Now</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
