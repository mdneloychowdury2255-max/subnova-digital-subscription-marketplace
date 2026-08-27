import React from 'react';
import { CheckCircle2, Clock, ShieldCheck, Box } from 'lucide-react';
import { OrderTimelineItem } from '../../types';

interface OrderTimelineProps {
  timeline: OrderTimelineItem[];
  orderStatus: string;
}

export const OrderTimeline: React.FC<OrderTimelineProps> = ({ timeline }) => {
  return (
    <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-800 light:before:bg-slate-200">
      {timeline.map((item, idx) => {
        const isLast = idx === timeline.length - 1;
        return (
          <div key={idx} className="relative group">
            {/* Dot/Icon */}
            <div
              className={`absolute -left-6 sm:-left-8 top-0.5 w-6 sm:w-8 h-6 sm:h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                item.completed
                  ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                  : 'bg-slate-900 light:bg-white border-slate-700 light:border-slate-300 text-slate-500'
              }`}
            >
              {item.completed ? (
                <CheckCircle2 className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
              ) : idx === 1 ? (
                <ShieldCheck className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
              ) : idx === 2 ? (
                <Box className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
              ) : (
                <Clock className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
              )}
            </div>

            {/* Content */}
            <div className={`p-4 rounded-xl border transition-all ${
              item.completed
                ? 'bg-slate-900/60 light:bg-white border-slate-800 light:border-slate-200'
                : 'bg-slate-900/20 light:bg-slate-50/50 border-slate-800/40 light:border-slate-200/60 opacity-60'
            }`}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h5 className="text-sm font-semibold text-white light:text-slate-900">
                  {item.title}
                </h5>
                <span className="text-xs font-mono text-purple-400 light:text-purple-600 bg-purple-500/10 px-2 py-0.5 rounded-md">
                  {item.timestamp !== 'Pending'
                    ? new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) +
                      ' • ' +
                      new Date(item.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })
                    : 'Awaiting completion'}
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-400 light:text-slate-600 leading-relaxed">
                {item.description}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
