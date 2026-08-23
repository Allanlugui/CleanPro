'use client';

import React, { useState } from 'react';
import {
  X,
  Star,
  Sparkles,
  CheckCircle2,
  ThumbsUp,
  MessageSquareHeart
} from 'lucide-react';
import { OrderRating, ServiceOrder } from '@/lib/types';
import { CleanProAPI } from '@/lib/supabaseClient';

interface RatingModalProps {
  isOpen: boolean;
  order: ServiceOrder;
  onClose: () => void;
  onOrderUpdated: (order: ServiceOrder) => void;
}

export function RatingModal({
  isOpen,
  order,
  onClose,
  onOrderUpdated
}: RatingModalProps) {
  const [rating, setRating] = useState<number>(order.rating?.rating || 5);
  const [punctuality, setPunctuality] = useState<number>(order.rating?.punctuality_score || 5);
  const [cleanliness, setCleanliness] = useState<number>(order.rating?.cleanliness_score || 5);
  const [professionalism, setProfessionalism] = useState<number>(
    order.rating?.professionalism_score || 5
  );
  const [comment, setComment] = useState(order.rating?.comment || '');
  const [selectedTags, setSelectedTags] = useState<string[]>(
    order.rating?.tags || ['Spotless Detailing', 'Very Punctual']
  );
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const AVAILABLE_TAGS = [
    'Spotless Detailing',
    'Very Punctual',
    'Respectful with Pets',
    'Great Communication',
    'Eco Detergents Smelled Great',
    'Exceeded Expectations',
    'Careful with Fragile Items'
  ];

  const handleToggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const ratingPayload: OrderRating = {
        rating,
        punctuality_score: punctuality,
        cleanliness_score: cleanliness,
        professionalism_score: professionalism,
        comment,
        tags: selectedTags,
        submitted_at: new Date().toISOString()
      };

      const updated = await CleanProAPI.submitRating(order.id, ratingPayload);
      if (updated) {
        onOrderUpdated(updated);
        onClose();
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      id="rating-modal-backdrop"
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        id="rating-modal-card"
        className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Star className="w-5 h-5 fill-amber-500 text-amber-500" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Rate Your Clean</h3>
              <p className="text-xs text-slate-500 font-medium">
                Team {order.assigned_team?.lead_cleaner || 'CleanPro Crew'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Main Star Selection */}
          <div className="text-center space-y-2 py-2 bg-amber-50/40 rounded-2xl border border-amber-100">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Overall Satisfaction
            </span>
            <div className="flex items-center justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="p-1 transition-transform hover:scale-125 active:scale-95"
                >
                  <Star
                    className={`w-7 h-7 ${
                      star <= rating
                        ? 'fill-amber-400 text-amber-400 drop-shadow-xs'
                        : 'text-slate-200'
                    }`}
                  />
                </button>
              ))}
            </div>
            <p className="text-xs font-semibold text-amber-800">
              {rating === 5 && '🌟 Exceptional! 5.0'}
              {rating === 4 && '👍 Great Job! 4.0'}
              {rating === 3 && '👌 Good 3.0'}
              {rating === 2 && '😕 Fair 2.0'}
              {rating === 1 && '⚠️ Needs Attention 1.0'}
            </p>
          </div>

          {/* Quick Praise Tags */}
          <div className="space-y-2">
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
              What stood out most?
            </label>
            <div className="flex flex-wrap gap-1.5">
              {AVAILABLE_TAGS.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleToggleTag(tag)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                      isSelected
                        ? 'bg-sky-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Written Feedback */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
              Feedback &amp; Crew Recognition
            </label>
            <textarea
              rows={3}
              placeholder="Tell us what you loved or how we can make your next clean even better..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-md shadow-sky-600/20 flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{submitting ? 'Submitting...' : 'Submit Certified Review'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
