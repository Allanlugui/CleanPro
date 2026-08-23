'use client';

import React, { useState } from 'react';
import {
  X,
  Send,
  Headphones,
  ShieldCheck,
  Sparkles,
  MessageSquare,
  AlertCircle,
  Clock,
  CheckCheck
} from 'lucide-react';
import { SupportTicket, UserProfile, SupportMessage } from '@/lib/types';
import { CleanProAPI } from '@/lib/supabaseClient';

interface SupportChatDrawerProps {
  isOpen: boolean;
  user: UserProfile | null;
  tickets: SupportTicket[];
  onClose: () => void;
  onTicketUpdated: (ticket: SupportTicket) => void;
}

export function SupportChatDrawer({
  isOpen,
  user,
  tickets,
  onClose,
  onTicketUpdated
}: SupportChatDrawerProps) {
  const [selectedTicketId, setSelectedTicketId] = useState<string>(tickets[0]?.id || '');
  const [messageInput, setMessageInput] = useState('');
  const [sending, setSending] = useState(false);
  const [showNewTicketModal, setShowNewTicketModal] = useState(false);
  const [newSubject, setNewSubject] = useState('');
  const [newDept, setNewDept] = useState<'sac' | 'ombudsman' | 'billing'>('sac');

  if (!isOpen) return null;

  const currentTicket = tickets.find((t) => t.id === selectedTicketId) || tickets[0];

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !currentTicket) return;

    setSending(true);
    const content = messageInput.trim();
    setMessageInput('');

    try {
      const updated = await CleanProAPI.sendSupportMessage(currentTicket.id, {
        sender_type: 'client',
        sender_name: user?.full_name || 'Client',
        content
      });

      if (updated) {
        onTicketUpdated(updated);

        // Simulate intelligent automated dispatcher reply after 1.2 seconds
        setTimeout(async () => {
          const automatedReply = await CleanProAPI.sendSupportMessage(currentTicket.id, {
            sender_type: 'agent',
            sender_name: 'Dispatcher Ryan (CleanPro SAC)',
            content: `Thank you for your message! Our dispatcher team has logged this request regarding "${content.slice(0, 30)}..." and updated the field tablet notes for your team.`
          });
          if (automatedReply) {
            onTicketUpdated(automatedReply);
          }
        }, 1200);
      }
    } finally {
      setSending(false);
    }
  };

  const handleCreateNewTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubject.trim()) return;

    const newTicket = await CleanProAPI.createSupportTicket({
      client_id: user?.id || 'usr_client',
      client_name: user?.full_name || 'Valued Client',
      subject: newSubject,
      department: newDept,
      status: 'open',
      priority: newDept === 'ombudsman' ? 'high' : 'normal',
      messages: [
        {
          id: `msg_${Date.now()}`,
          sender_type: 'client',
          sender_name: user?.full_name || 'Client',
          content: newSubject,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]
    });

    onTicketUpdated(newTicket);
    setSelectedTicketId(newTicket.id);
    setShowNewTicketModal(false);
    setNewSubject('');
  };

  return (
    <div
      id="support-drawer-backdrop"
      className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex justify-end animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="support-drawer-content"
        className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="p-4 bg-sky-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-500/30 border border-sky-400/30 flex items-center justify-center text-sky-200">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-bold text-sm">Customer Support &amp; Ombudsman</h3>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <p className="text-[11px] text-sky-200">Live Dispatch &amp; Quality Guarantee</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-sky-200 hover:text-white rounded-full hover:bg-sky-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Ticket Selector Pill Tabs */}
        <div className="p-3 bg-slate-100 border-b border-slate-200 flex items-center justify-between gap-2 overflow-x-auto">
          <div className="flex items-center gap-1.5 min-w-0">
            {tickets.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setSelectedTicketId(t.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedTicketId === t.id
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:bg-slate-200'
                }`}
              >
                {t.department === 'ombudsman' ? '⚖️ Ombudsman' : '🎧 SAC'}: {t.subject.slice(0, 16)}...
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setShowNewTicketModal(true)}
            className="px-2.5 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold shrink-0 shadow-xs"
          >
            + New Ticket
          </button>
        </div>

        {/* Messages List Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50">
          {currentTicket ? (
            <>
              {/* Ticket Meta banner */}
              <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-slate-800">{currentTicket.subject}</span>
                  <span className="px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 font-bold uppercase text-[10px]">
                    {currentTicket.status}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400">
                  Created {new Date(currentTicket.created_at).toLocaleDateString()} • Department:{' '}
                  {currentTicket.department.toUpperCase()}
                </p>
              </div>

              {/* Chat messages */}
              {currentTicket.messages.map((msg: SupportMessage) => {
                const isClient = msg.sender_type === 'client';
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isClient ? 'items-end' : 'items-start'}`}
                  >
                    <div className="flex items-center gap-1.5 mb-1 text-[10px] text-slate-400">
                      <span className="font-semibold text-slate-600">{msg.sender_name}</span>
                      <span>• {msg.timestamp}</span>
                    </div>
                    <div
                      className={`p-3.5 rounded-2xl max-w-[85%] text-xs leading-relaxed ${
                        isClient
                          ? 'bg-sky-600 text-white rounded-tr-xs shadow-sm shadow-sky-600/10'
                          : 'bg-white text-slate-800 border border-slate-200 rounded-tl-xs shadow-2xs'
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                );
              })}
            </>
          ) : (
            <div className="text-center py-10 text-slate-400 text-xs">
              No active support tickets. Click &ldquo;+ New Ticket&rdquo; to contact dispatch.
            </div>
          )}
        </div>

        {/* Quick Canned Inquiries */}
        <div className="p-2.5 bg-white border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          {[
            '🚪 Gate / Access Code Update',
            '🐾 Dog in Bedroom Reminder',
            '⏱️ Team Arrival Status',
            '✨ Request Re-Touch Check'
          ].map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => setMessageInput(prompt)}
              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] rounded-lg whitespace-nowrap transition-colors"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
          <input
            type="text"
            placeholder="Type your message to dispatch..."
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-sky-500/20"
          />
          <button
            type="submit"
            disabled={sending || !messageInput.trim()}
            className="p-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl disabled:opacity-50 transition-colors shadow-xs"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

        {/* New Ticket Modal */}
        {showNewTicketModal && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-3xl p-5 max-w-sm w-full shadow-2xl space-y-3">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <h4 className="font-bold text-sm text-slate-900">Open New Support Ticket</h4>
                <button onClick={() => setShowNewTicketModal(false)} className="text-slate-400">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateNewTicket} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Department
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { id: 'sac', label: 'SAC Care' },
                      { id: 'ombudsman', label: 'Ombudsman' },
                      { id: 'billing', label: 'Billing' }
                    ].map((d) => (
                      <button
                        key={d.id}
                        type="button"
                        onClick={() => setNewDept(d.id as 'sac' | 'ombudsman' | 'billing')}
                        className={`p-2 rounded-xl text-xs font-semibold text-center border ${
                          newDept === d.id
                            ? 'bg-sky-50 border-sky-600 text-sky-900'
                            : 'border-slate-200 text-slate-600'
                        }`}
                      >
                        {d.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Subject &amp; Inquiry
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Describe your inquiry, order question or special request..."
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl"
                >
                  Create &amp; Connect
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
