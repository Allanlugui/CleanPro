'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  Sparkles,
  Clock,
  CheckCircle,
  ArrowRight,
  ShieldCheck,
  Building2,
  Home,
  KeyRound,
  Info,
  X,
  Plus
} from 'lucide-react';
import { CleaningService, ServiceCategory } from '@/lib/types';

interface ServiceCatalogProps {
  categories: ServiceCategory[];
  services: CleaningService[];
  onSelectServiceForBooking: (service: CleaningService) => void;
}

export function ServiceCatalog({
  categories,
  services,
  onSelectServiceForBooking
}: ServiceCatalogProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [inspectService, setInspectService] = useState<CleaningService | null>(null);

  const filteredServices =
    selectedCategory === 'all'
      ? services
      : services.filter((s) => s.category_id === selectedCategory);

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Sparkles':
        return <Sparkles className="w-4 h-4" />;
      case 'Building2':
        return <Building2 className="w-4 h-4" />;
      case 'KeyRound':
        return <KeyRound className="w-4 h-4" />;
      case 'Home':
      default:
        return <Home className="w-4 h-4" />;
    }
  };

  return (
    <section className="space-y-6">
      {/* Category Pills Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          id="cat-filter-all"
          type="button"
          onClick={() => setSelectedCategory('all')}
          className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 shadow-xs ${
            selectedCategory === 'all'
              ? 'bg-sky-600 text-white shadow-sky-600/20'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          All Services
        </button>

        {categories.map((cat) => (
          <button
            key={cat.id}
            id={`cat-filter-${cat.slug}`}
            type="button"
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 shadow-xs ${
              selectedCategory === cat.id
                ? 'bg-sky-600 text-white shadow-sky-600/20'
                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            {getCategoryIcon(cat.icon)}
            {cat.name}
          </button>
        ))}
      </div>

      {/* Service Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredServices.map((service) => (
          <article
            key={service.id}
            id={`service-card-${service.slug}`}
            className="bg-white rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col justify-between group"
          >
            <div>
              {/* Image & Badges */}
              <div className="relative h-48 w-full bg-slate-100 overflow-hidden">
                <Image
                  src={service.image_url}
                  alt={service.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-linear-to-t from-slate-900/80 via-slate-900/20 to-transparent" />

                {/* Popular Badge */}
                {service.popular_badge && (
                  <div className="absolute top-3 left-3 bg-sky-500/90 backdrop-blur-xs text-white text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    {service.popular_badge}
                  </div>
                )}

                <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between text-white">
                  <div>
                    <span className="text-[11px] font-medium text-sky-200 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Est. {service.estimated_hours}
                    </span>
                    <h3 className="text-lg font-bold leading-tight mt-0.5 drop-shadow-xs">
                      {service.name}
                    </h3>
                  </div>
                  <div className="text-right shrink-0 bg-slate-900/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10">
                    <p className="text-[10px] text-slate-300 font-medium">Starting from</p>
                    <p className="text-base font-extrabold text-white">
                      ${service.base_price.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Body Description & Highlights */}
              <div className="p-5 space-y-4">
                <p className="text-xs text-slate-600 leading-relaxed">
                  {service.short_desc}
                </p>

                {/* Features List */}
                <div className="space-y-2">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    What&apos;s Included:
                  </p>
                  <ul className="space-y-1.5">
                    {service.features.slice(0, 3).map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Actions Bar */}
            <div className="p-4 bg-slate-50/80 border-t border-slate-100 flex items-center gap-2">
              <button
                id={`btn-details-${service.slug}`}
                type="button"
                onClick={() => setInspectService(service)}
                className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-white text-xs font-semibold transition-colors flex items-center gap-1.5"
              >
                <Info className="w-3.5 h-3.5 text-slate-500" />
                <span>Details & Checklist</span>
              </button>

              <button
                id={`btn-book-${service.slug}`}
                type="button"
                onClick={() => onSelectServiceForBooking(service)}
                className="flex-1 py-2.5 px-4 bg-sky-600 hover:bg-sky-700 active:scale-[0.99] text-white rounded-xl text-xs font-bold transition-all shadow-sm shadow-sky-600/20 flex items-center justify-center gap-1.5"
              >
                <span>Book Service</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </article>
        ))}
      </div>

      {/* Service Details & Checklist Modal */}
      {inspectService && (
        <div
          id="service-inspect-modal-backdrop"
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setInspectService(null)}
        >
          <div
            id="service-inspect-modal-card"
            className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">{inspectService.name}</h3>
                  <p className="text-xs text-slate-500 font-medium">Est. {inspectService.estimated_hours} • From ${inspectService.base_price.toFixed(2)}</p>
                </div>
              </div>
              <button
                id="inspect-modal-close-btn"
                onClick={() => setInspectService(null)}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-5 overflow-y-auto space-y-5 flex-1">
              <p className="text-xs text-slate-600 leading-relaxed">
                {inspectService.description}
              </p>

              {/* Room Included Tasks Checklist */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-sky-600" /> Standard Room Checklists
                </h4>
                <div className="space-y-3">
                  {inspectService.included_tasks.map((roomGroup, idx) => (
                    <div key={idx} className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
                      <p className="text-xs font-bold text-slate-800 mb-2">{roomGroup.room}</p>
                      <ul className="space-y-1.5">
                        {roomGroup.tasks.map((task, tIdx) => (
                          <li key={tIdx} className="text-xs text-slate-600 flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-sky-500 mt-1.5 shrink-0" />
                            <span>{task}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>

              {/* Addons preview */}
              {inspectService.available_addons.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                    <Plus className="w-4 h-4 text-emerald-600" /> Optional Add-on Treatments
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {inspectService.available_addons.map((add) => (
                      <div key={add.id} className="p-2.5 rounded-xl border border-slate-200 bg-white text-xs">
                        <div className="flex items-center justify-between font-semibold text-slate-800">
                          <span>{add.name}</span>
                          <span className="text-sky-700">+${add.price}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">{add.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Bottom CTA */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setInspectService(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200"
              >
                Close
              </button>
              <button
                id="inspect-modal-proceed-btn"
                type="button"
                onClick={() => {
                  const s = inspectService;
                  setInspectService(null);
                  onSelectServiceForBooking(s);
                }}
                className="px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-1.5"
              >
                <span>Book This Service</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
