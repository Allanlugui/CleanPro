'use client';

import React, { useState } from 'react';
import {
  X,
  User,
  Mail,
  Phone,
  MapPin,
  ShieldCheck,
  LogOut,
  Save,
  CheckCircle2,
  Lock
} from 'lucide-react';
import { UserProfile, AddressDetails } from '@/lib/types';
import { CleanProAPI } from '@/lib/supabaseClient';

interface UserProfileDrawerProps {
  isOpen: boolean;
  user: UserProfile | null;
  onClose: () => void;
  onUpdateUser: (user: UserProfile) => void;
  onLogout: () => void;
}

export function UserProfileDrawer({
  isOpen,
  user,
  onClose,
  onUpdateUser,
  onLogout
}: UserProfileDrawerProps) {
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [street, setStreet] = useState(user?.default_address?.street || '');
  const [number, setNumber] = useState(user?.default_address?.number || '');
  const [neighborhood, setNeighborhood] = useState(user?.default_address?.neighborhood || '');
  const [city, setCity] = useState(user?.default_address?.city || '');
  const [zipCode, setZipCode] = useState(user?.default_address?.zip_code || '');
  const [accessNotes, setAccessNotes] = useState(user?.default_address?.access_notes || '');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  if (!isOpen || !user) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const updatedAddress: AddressDetails = {
      street,
      number,
      neighborhood,
      city,
      state: 'NY',
      zip_code: zipCode,
      access_notes: accessNotes
    };

    const updated = await CleanProAPI.updateUserProfile({
      full_name: fullName,
      phone,
      default_address: updatedAddress
    });

    if (updated) {
      onUpdateUser(updated);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    }
    setSaving(false);
  };

  return (
    <div
      id="profile-drawer-backdrop"
      className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex justify-end animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="profile-drawer-content"
        className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-sky-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
              {user.full_name.charAt(0)}
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">{user.full_name}</h3>
              <p className="text-xs text-slate-500">{user.email}</p>
            </div>
          </div>
          <button
            id="profile-drawer-close-btn"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-5 space-y-5">
          {savedSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Profile and default service address updated successfully!</span>
            </div>
          )}

          {/* Contact Details */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Personal Information
            </h4>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-sky-500/20"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Phone (SMS / WhatsApp)</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-sky-500/20"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Account Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  disabled
                  value={user.email}
                  className="w-full pl-9 pr-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-sm text-slate-500 cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* Default Address */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-sky-600" /> Default Cleaning Address
            </h4>
            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-2">
                <label className="block text-[11px] font-medium text-slate-600 mb-1">Street</label>
                <input
                  type="text"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">Apt / No</label>
                <input
                  type="text"
                  value={number}
                  onChange={(e) => setNumber(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">Neighborhood</label>
                <input
                  type="text"
                  value={neighborhood}
                  onChange={(e) => setNeighborhood(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">City</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">Access Notes & Gate Codes</label>
              <textarea
                rows={2}
                value={accessNotes}
                onChange={(e) => setAccessNotes(e.target.value)}
                placeholder="e.g. Doorman has key, dial #402 at entrance"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>
          </div>

          {/* Privacy & LGPD / GDPR Status */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
            <div className="flex items-center gap-2 text-slate-800 font-semibold text-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Data Protection & LGPD Compliance</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Your inspection photos, digital sign-offs, and service addresses are encrypted and accessible strictly by your assigned cleaning crew and quality dispatchers.
            </p>
            <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 font-medium">
              <Lock className="w-3 h-3" /> Consent recorded & active
            </div>
          </div>
        </form>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 space-y-2">
          <button
            id="profile-save-btn"
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="w-full py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-2 shadow-xs"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Profile Changes'}
          </button>

          <button
            id="profile-logout-btn"
            type="button"
            onClick={() => {
              onLogout();
              onClose();
            }}
            className="w-full py-2 text-xs font-medium text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-xl transition-colors flex items-center justify-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
