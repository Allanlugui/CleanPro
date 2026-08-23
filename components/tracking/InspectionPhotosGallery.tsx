'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  Camera,
  ShieldCheck,
  Maximize2,
  X,
  Clock,
  Sparkles,
  CheckCircle2,
  Layers
} from 'lucide-react';
import { InspectionPhoto } from '@/lib/types';

interface InspectionPhotosGalleryProps {
  photos: InspectionPhoto[];
  orderNumber: string;
}

export function InspectionPhotosGallery({ photos, orderNumber }: InspectionPhotosGalleryProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<InspectionPhoto | null>(null);
  const [activeTab, setActiveTab] = useState<Record<string, 'after' | 'before'>>({});

  const getActiveView = (photoId: string) => activeTab[photoId] || 'after';

  const toggleView = (photoId: string, view: 'before' | 'after') => {
    setActiveTab((prev) => ({ ...prev, [photoId]: view }));
  };

  if (!photos || photos.length === 0) {
    return (
      <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-6 text-center space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center mx-auto">
          <Camera className="w-6 h-6" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-slate-800">Photos in Progress</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            The assigned field team is currently documenting before &amp; after inspection shots for order {orderNumber}. They will appear here once uploaded.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header Info */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Certified Quality Inspection Proof
          </span>
        </div>
        <span className="text-[11px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3" />
          {photos.length} Areas Verified
        </span>
      </div>

      {/* Grid of Inspection Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {photos.map((photo) => {
          const currentView = getActiveView(photo.id);
          const currentImgUrl = currentView === 'after' ? photo.after_url : photo.before_url;
          const currentTimestamp =
            currentView === 'after' ? photo.after_timestamp : photo.before_timestamp;

          return (
            <div
              key={photo.id}
              className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden flex flex-col justify-between"
            >
              {/* Image Preview with Toggle Controls */}
              <div className="relative h-48 w-full bg-slate-900 group">
                <Image
                  src={currentImgUrl}
                  alt={`${photo.room} ${currentView}`}
                  fill
                  className="object-cover transition-opacity duration-300"
                  referrerPolicy="no-referrer"
                />

                {/* View Switcher Overlay */}
                <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md p-1 rounded-xl flex items-center gap-1 border border-white/15">
                  <button
                    type="button"
                    onClick={() => toggleView(photo.id, 'before')}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
                      currentView === 'before'
                        ? 'bg-amber-500 text-white shadow-xs'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    Before
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleView(photo.id, 'after')}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
                      currentView === 'after'
                        ? 'bg-emerald-500 text-white shadow-xs'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    After Clean ✨
                  </button>
                </div>

                {/* Fullscreen Magnify Trigger */}
                <button
                  type="button"
                  onClick={() => setSelectedPhoto(photo)}
                  className="absolute top-3 right-3 p-2 rounded-xl bg-black/60 hover:bg-black/80 backdrop-blur-md text-white border border-white/15 transition-colors"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>

                {/* Timestamp watermark */}
                <div className="absolute bottom-2 right-2 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] px-2 py-0.5 rounded-md font-mono flex items-center gap-1">
                  <Clock className="w-2.5 h-2.5 text-sky-400" />
                  {currentTimestamp}
                </div>
              </div>

              {/* Photo Description & Quality Notes */}
              <div className="p-3.5 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-sky-600">
                      {photo.room}
                    </span>
                    <h5 className="text-xs font-bold text-slate-900">{photo.title}</h5>
                  </div>
                  {photo.verified && (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60 shrink-0">
                      Inspector Approved
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded-xl border border-slate-100 italic">
                  &ldquo;{photo.inspector_notes}&rdquo;
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* High-Resolution Lightbox Modal */}
      {selectedPhoto && (
        <div
          id="photo-lightbox-backdrop"
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <div
            id="photo-lightbox-content"
            className="bg-slate-900 text-white rounded-3xl max-w-2xl w-full overflow-hidden border border-slate-800 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs text-sky-400 font-bold uppercase tracking-wider">
                  {selectedPhoto.room}
                </span>
                <h4 className="text-sm font-bold">{selectedPhoto.title}</h4>
              </div>
              <button
                onClick={() => setSelectedPhoto(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Side-by-Side Comparison */}
            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Before ({selectedPhoto.before_timestamp})
                </span>
                <div className="relative h-60 w-full rounded-xl overflow-hidden bg-slate-800 border border-slate-700">
                  <Image
                    src={selectedPhoto.before_url}
                    alt="Before"
                    fill
                    className="object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> After Clean ({selectedPhoto.after_timestamp})
                </span>
                <div className="relative h-60 w-full rounded-xl overflow-hidden bg-slate-800 border border-emerald-500/50">
                  <Image
                    src={selectedPhoto.after_url}
                    alt="After"
                    fill
                    className="object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-950/80 border-t border-slate-800 text-xs text-slate-300">
              <p>
                <strong>Inspector Quality Notes:</strong> {selectedPhoto.inspector_notes}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
