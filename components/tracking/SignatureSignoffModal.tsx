'use client';

import React, { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import {
  X,
  CheckCircle2,
  RotateCcw,
  PenTool,
  ShieldCheck,
  Lock,
  Download
} from 'lucide-react';
import { ServiceOrder, SignatureRecord } from '@/lib/types';
import { CleanProAPI } from '@/lib/supabaseClient';

interface SignatureSignoffModalProps {
  isOpen: boolean;
  order: ServiceOrder;
  onClose: () => void;
  onOrderUpdated: (order: ServiceOrder) => void;
}

export function SignatureSignoffModal({
  isOpen,
  order,
  onClose,
  onOrderUpdated
}: SignatureSignoffModalProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [signerName, setSignerName] = useState(order.client_name || '');
  const [submitting, setSubmitting] = useState(false);

  // Initialize canvas
  useEffect(() => {
    if (!isOpen) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }, [isOpen]);

  if (!isOpen) return null;

  // Drawing event handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
    setIsDrawing(true);
    setHasDrawn(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  const handleSaveSignature = async () => {
    const canvas = canvasRef.current;
    if (!canvas || !hasDrawn) {
      alert('Please draw your signature in the designated box.');
      return;
    }

    if (!signerName.trim()) {
      alert('Please confirm your full name.');
      return;
    }

    setSubmitting(true);
    try {
      const signatureDataUrl = canvas.toDataURL('image/png');
      const signatureRecord: SignatureRecord = {
        signature_image: signatureDataUrl,
        signer_name: signerName.trim(),
        signed_at: new Date().toISOString(),
        ip_fingerprint: '192.168.1.1 (Authenticated Session)'
      };

      const updated = await CleanProAPI.submitSignature(order.id, signatureRecord);
      if (updated) {
        onOrderUpdated(updated);
        onClose();
      }
    } catch (err) {
      alert('Error recording signature: ' + String(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      id="signature-modal-backdrop"
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        id="signature-modal-card"
        className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <PenTool className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Client Quality Sign-Off</h3>
              <p className="text-xs text-slate-500 font-medium">Order #{order.order_number}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        {order.client_signature ? (
          /* Existing Signature View */
          <div className="space-y-4 text-center">
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200/80 text-emerald-800 text-xs flex items-center justify-center gap-2 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Inspection Approved &amp; Digitally Signed</span>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col items-center">
              <div className="relative h-24 w-64">
                <Image
                  src={order.client_signature.signature_image}
                  alt="Client Signature"
                  fill
                  className="object-contain"
                  unoptimized
                  referrerPolicy="no-referrer"
                />
              </div>
              <p className="text-xs font-bold text-slate-800 mt-2">
                Signed by: {order.client_signature.signer_name}
              </p>
              <p className="text-[10px] text-slate-400">
                Timestamp: {new Date(order.client_signature.signed_at).toLocaleString()}
              </p>
            </div>

            <button
              onClick={onClose}
              className="w-full py-2.5 bg-slate-900 text-white font-semibold text-xs rounded-xl"
            >
              Close Sign-Off
            </button>
          </div>
        ) : (
          /* Interactive Drawing Pad */
          <div className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Full Name of Approver
              </label>
              <input
                type="text"
                value={signerName}
                onChange={(e) => setSignerName(e.target.value)}
                placeholder="e.g. Sarah Jenkins"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900"
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700">Draw Signature Below</span>
                <button
                  type="button"
                  onClick={handleClear}
                  className="text-[11px] font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" /> Clear
                </button>
              </div>

              {/* Canvas Pad */}
              <div className="border-2 border-dashed border-sky-300 rounded-2xl bg-sky-50/20 overflow-hidden relative touch-none">
                <canvas
                  ref={canvasRef}
                  width={380}
                  height={150}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                  className="w-full h-[140px] cursor-crosshair block"
                />
                {!hasDrawn && (
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center text-slate-400 text-xs italic">
                    Sign with your finger or mouse here
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-200/80 text-[11px] text-slate-500">
              <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>
                By signing, I confirm that the checklist items and inspection results were performed to satisfaction.
              </span>
            </div>

            <button
              id="confirm-signature-btn"
              type="button"
              disabled={submitting || !hasDrawn}
              onClick={handleSaveSignature}
              className="w-full py-3 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-bold text-xs shadow-md shadow-sky-600/20 flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{submitting ? 'Submitting...' : 'Submit Certified Sign-Off'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
