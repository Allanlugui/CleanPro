'use client';

import React, { useState } from 'react';
import {
  X,
  QrCode,
  Copy,
  Check,
  CreditCard,
  Receipt,
  ShieldCheck,
  CheckCircle2,
  Download,
  AlertCircle
} from 'lucide-react';
import { ServiceOrder } from '@/lib/types';
import { CleanProAPI } from '@/lib/supabaseClient';

interface PaymentModalProps {
  isOpen: boolean;
  order: ServiceOrder;
  onClose: () => void;
  onOrderUpdated: (order: ServiceOrder) => void;
}

export function PaymentModal({
  isOpen,
  order,
  onClose,
  onOrderUpdated
}: PaymentModalProps) {
  const [copied, setCopied] = useState(false);
  const [processing, setProcessing] = useState(false);

  if (!isOpen) return null;

  const pixKey = order.payment_details.pix_key || 'pix@cleanpro-dispatch.com';
  const total = order.pricing_breakdown.total_amount;
  const isPaid = order.payment_status === 'paid';

  const handleCopyPix = () => {
    navigator.clipboard.writeText(pixKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSimulatePayment = async () => {
    setProcessing(true);
    try {
      const updated = await CleanProAPI.markAsPaid(order.id, 'pix');
      if (updated) {
        onOrderUpdated(updated);
      }
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div
      id="payment-modal-backdrop"
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        id="payment-modal-card"
        className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Payment &amp; Invoicing</h3>
              <p className="text-xs text-slate-500 font-medium">Order #{order.order_number}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Header */}
        {isPaid ? (
          <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-900 text-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-sm text-emerald-900">Payment Settled</h4>
            <p className="text-xs text-emerald-700">
              Amount of <strong>${total.toFixed(2)}</strong> received via{' '}
              {order.payment_details.method.toUpperCase()}
            </p>
            <p className="text-[10px] text-slate-400 font-mono">
              Txn: {order.payment_details.transaction_id || 'TXN-9982103'}
            </p>
          </div>
        ) : (
          <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200 text-amber-900 flex items-center gap-3 text-xs font-medium">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <p className="font-bold text-amber-900">Pending Settlement: ${total.toFixed(2)}</p>
              <p className="text-amber-700 text-[11px]">
                Scan the PIX QR code or copy the payment key below.
              </p>
            </div>
          </div>
        )}

        {/* PIX QR Code Container */}
        {!isPaid && (
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center space-y-3">
            <div className="bg-white p-4 rounded-xl border border-slate-200 inline-block shadow-2xs">
              {/* Simulated QR Code display */}
              <div className="w-40 h-40 bg-slate-900 text-white rounded-lg flex flex-col items-center justify-center p-2 relative overflow-hidden">
                <QrCode className="w-32 h-32 text-sky-400" />
                <span className="absolute bottom-1 bg-black/80 px-2 py-0.5 rounded text-[9px] text-slate-300">
                  Scan with Banking App
                </span>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Copyable PIX Key
              </label>
              <div className="flex items-center gap-1.5 max-w-xs mx-auto">
                <input
                  type="text"
                  readOnly
                  value={pixKey}
                  className="w-full text-xs font-mono bg-white border border-slate-200 px-2.5 py-1.5 rounded-lg text-slate-700 select-all"
                />
                <button
                  type="button"
                  onClick={handleCopyPix}
                  className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-lg flex items-center gap-1 shrink-0 transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>
            </div>

            {/* Instant simulator button for demo experience */}
            <button
              id="simulate-instant-pix-btn"
              type="button"
              disabled={processing}
              onClick={handleSimulatePayment}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{processing ? 'Confirming...' : 'Simulate Instant Payment Confirmation'}</span>
            </button>
          </div>
        )}

        {/* Pricing Math Breakdown in modal */}
        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1.5 text-xs text-slate-600">
          <div className="flex justify-between">
            <span>Base Service Fee</span>
            <span>${order.pricing_breakdown.base_price.toFixed(2)}</span>
          </div>
          {order.pricing_breakdown.addons_total > 0 && (
            <div className="flex justify-between text-sky-700">
              <span>Add-Ons Total</span>
              <span>+${order.pricing_breakdown.addons_total.toFixed(2)}</span>
            </div>
          )}
          {order.pricing_breakdown.discount_amount > 0 && (
            <div className="flex justify-between text-emerald-700">
              <span>Discount ({order.pricing_breakdown.discount_percentage}%)</span>
              <span>-${order.pricing_breakdown.discount_amount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-slate-900 pt-1.5 border-t border-slate-200">
            <span>Total Billed</span>
            <span>${order.pricing_breakdown.total_amount.toFixed(2)}</span>
          </div>
        </div>

        {/* Download invoice button */}
        <button
          type="button"
          onClick={() => alert(`Official digital invoice for ${order.order_number} downloaded.`)}
          className="w-full py-2.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Download Digital PDF Receipt</span>
        </button>
      </div>
    </div>
  );
}
