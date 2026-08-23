'use client';

import React from 'react';
import {
  CheckCircle2,
  Circle,
  Clock,
  Sparkles,
  Utensils,
  Bath,
  BedDouble,
  Sofa,
  Plus,
  ShieldCheck,
  Check
} from 'lucide-react';
import { RoomChecklistSection, ServiceOrder } from '@/lib/types';
import { CleanProAPI } from '@/lib/supabaseClient';

interface ChecklistViewerProps {
  order: ServiceOrder;
  onOrderUpdated: (order: ServiceOrder) => void;
}

export function ChecklistViewer({ order, onOrderUpdated }: ChecklistViewerProps) {
  const totalTasks = order.checklist.reduce((acc, sec) => acc + sec.items.length, 0);
  const completedTasks = order.checklist.reduce(
    (acc, sec) => acc + sec.items.filter((i) => i.completed).length,
    0
  );
  const percent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const getRoomIcon = (roomName: string) => {
    const lower = roomName.toLowerCase();
    if (lower.includes('kitchen')) return <Utensils className="w-4 h-4 text-amber-500" />;
    if (lower.includes('bath')) return <Bath className="w-4 h-4 text-sky-500" />;
    if (lower.includes('bed')) return <BedDouble className="w-4 h-4 text-indigo-500" />;
    if (lower.includes('living')) return <Sofa className="w-4 h-4 text-emerald-500" />;
    if (lower.includes('add-on') || lower.includes('custom')) return <Plus className="w-4 h-4 text-purple-500" />;
    return <Sparkles className="w-4 h-4 text-sky-600" />;
  };

  const handleToggle = async (itemId: string, currentStatus: boolean) => {
    const updated = await CleanProAPI.toggleChecklistItem(
      order.id,
      itemId,
      !currentStatus,
      order.assigned_team?.lead_cleaner || 'Field Staff'
    );
    if (updated) {
      onOrderUpdated(updated);
    }
  };

  return (
    <div className="space-y-4">
      {/* Progress Header */}
      <div className="bg-slate-900 text-white p-4 rounded-2xl shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-sky-400" />
            <div>
              <h4 className="text-sm font-bold">Standard Inspection Checklist</h4>
              <p className="text-[11px] text-slate-400">
                Verified live by {order.assigned_team?.lead_cleaner || 'Lead Cleaner'}
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-lg font-black text-sky-300">{percent}%</span>
            <p className="text-[10px] text-slate-400 font-medium">
              {completedTasks} / {totalTasks} Tasks
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
          <div
            className="bg-linear-to-r from-sky-400 to-emerald-400 h-2 rounded-full transition-all duration-500"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      {/* Room by Room Sections */}
      <div className="space-y-3">
        {order.checklist.map((section: RoomChecklistSection, sIdx: number) => {
          const secCompleted = section.items.filter((i) => i.completed).length;
          const isAllDone = secCompleted === section.items.length && section.items.length > 0;

          return (
            <div
              key={sIdx}
              className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden"
            >
              <div className="p-3.5 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center shadow-2xs">
                    {getRoomIcon(section.room_name)}
                  </div>
                  <span className="text-xs font-bold text-slate-900">{section.room_name}</span>
                </div>
                <span
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                    isAllDone
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {secCompleted}/{section.items.length} Done
                </span>
              </div>

              <div className="p-3 space-y-2">
                {section.items.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleToggle(item.id, item.completed)}
                    className={`p-2.5 rounded-xl border flex items-start justify-between gap-3 cursor-pointer transition-all ${
                      item.completed
                        ? 'bg-emerald-50/50 border-emerald-200/70 text-slate-800'
                        : 'bg-slate-50/40 border-slate-200/60 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="mt-0.5 shrink-0">
                        {item.completed ? (
                          <div className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                        ) : (
                          <Circle className="w-4 h-4 text-slate-300" />
                        )}
                      </div>
                      <div>
                        <p className={`text-xs ${item.completed ? 'font-medium text-slate-900' : ''}`}>
                          {item.label}
                        </p>
                        {item.completed && item.completed_at && (
                          <p className="text-[10px] text-emerald-700 mt-0.5 flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5" />
                            Completed at {item.completed_at} {item.completed_by ? `by ${item.completed_by}` : ''}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
