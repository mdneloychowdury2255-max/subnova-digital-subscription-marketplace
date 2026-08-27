import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { SupportTicket } from '../../types';
import {
  MessageSquare,
  Send,
  Headphones,
  ShieldCheck,
  Sparkles,
  Clock,
  CheckCheck,
  HelpCircle,
  Zap,
  RefreshCw,
  PhoneCall,
  User,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

export const ResellerAdminChatSection: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [messageText, setMessageText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [activeTicket, setActiveTicket] = useState<SupportTicket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const loadTicket = () => {
    if (!user) return;
    const ticket = db.getOrCreateResellerChat(user.id, user.name, user.email, user.phone);
    setActiveTicket(ticket);
  };

  useEffect(() => {
    loadTicket();
    const interval = setInterval(() => {
      loadTicket();
    }, 4000);
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeTicket?.messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !messageText.trim()) return;

    setIsSending(true);
    try {
      const updated = db.sendResellerChatMessage(
        user.id,
        user.name,
        user.email,
        user.phone,
        messageText.trim()
      );
      setActiveTicket(updated);
      setMessageText('');
      showToast('success', 'মেসেজ পাঠানো হয়েছে! 📨', 'আপনার বার্তা সরাসরি অ্যাডমিন হেল্পডেস্কে পৌঁছেছে।');
    } catch (err: any) {
      showToast('error', 'ত্রুটি', 'মেসেজ পাঠানো যায়নি।');
    } finally {
      setIsSending(false);
    }
  };

  const handleQuickPreset = (preset: string) => {
    if (!user) return;
    setIsSending(true);
    try {
      const updated = db.sendResellerChatMessage(
        user.id,
        user.name,
        user.email,
        user.phone,
        preset
      );
      setActiveTicket(updated);
      showToast('success', 'মেসেজ পাঠানো হয়েছে!', 'অ্যাডমিন শীঘ্রই উত্তর দেবেন।');
    } finally {
      setIsSending(false);
    }
  };

  const quickPresets = [
    '👋 আসসালামু আলাইকুম, আমার রিসেলার অ্যাকাউন্ট অ্যাক্টিভেশন সংক্রান্ত সহায়তা প্রয়োজন।',
    '📦 স্টক ও নতুন ডিজিটাল সাবস্ক্রিপশন ডেলিভারি আপডেট জানতে চাই।',
    '💳 বিকাশ/নগদে ব্যালেন্স অ্যাড ও ট্রানজেকশন ভেরিফিকেশন চেক করুন।',
    '⭐ বাল্ক অর্ডারের জন্য বিশেষ ডিসকাউন্ট বা অফার পাওয়া যাবে কি?',
  ];

  return (
    <div className="rounded-3xl bg-slate-900/80 light:bg-white border border-purple-500/30 shadow-2xl overflow-hidden flex flex-col h-[580px]">
      {/* Chat Header */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-purple-950/80 via-slate-900 to-indigo-950/80 border-b border-purple-500/20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-lg">
              <Headphones className="w-5 h-5" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-slate-950" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-white light:text-slate-900 text-sm">
                অ্যাডমিন সরাসরি চ্যাট ও মেসেঞ্জার
              </h3>
              <Badge variant="purple">Admin Support Desk</Badge>
            </div>
            <p className="text-[11px] text-slate-300 light:text-slate-600 flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              মেসেজ দিলে অ্যাডমিনের কাছে সরাসরি যাবে এবং এখান থেকেই কথা বলতে পারবেন
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadTicket}
            title="রিফ্রেশ মেসেজ"
            className="p-2 rounded-xl bg-slate-800/80 light:bg-slate-100 hover:bg-purple-600/30 text-slate-300 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Quick Prompts Bar */}
      <div className="px-4 py-2.5 bg-slate-950/60 light:bg-slate-50 border-b border-slate-800 light:border-slate-200 flex items-center gap-2 overflow-x-auto no-scrollbar">
        <span className="text-[10px] font-bold uppercase text-purple-400 shrink-0 flex items-center gap-1">
          <Zap className="w-3 h-3" /> কুইক মেসেজ:
        </span>
        {quickPresets.map((preset, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleQuickPreset(preset)}
            className="px-2.5 py-1 rounded-lg bg-slate-900 light:bg-white border border-slate-800 light:border-slate-300 text-[11px] text-slate-300 light:text-slate-700 hover:border-purple-500 hover:text-white whitespace-nowrap transition-colors"
          >
            {preset.slice(0, 32)}...
          </button>
        ))}
      </div>

      {/* Message Feed */}
      <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4 bg-slate-950/40 light:bg-slate-50/50">
        {(!activeTicket || activeTicket.messages.length === 0) ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-white light:text-slate-900 text-sm">
                অ্যাডমিনের সাথে সরাসরি বার্তালাপ শুরু করুন
              </h4>
              <p className="text-xs text-slate-400 max-w-sm mt-1">
                আপনার অ্যাকাউন্ট অ্যাক্টিভেশন, অর্ডার ডেলিভারি, অথবা যেকোনো প্রশ্ন লিখে নিচে সেন্ড করুন।
              </p>
            </div>
          </div>
        ) : (
          activeTicket.messages.map((m) => {
            const isAdmin = m.senderRole === 'admin';
            return (
              <div
                key={m.id}
                className={`flex gap-3 ${isAdmin ? 'justify-start' : 'justify-end'}`}
              >
                {isAdmin && (
                  <div className="w-8 h-8 rounded-xl bg-purple-600 flex items-center justify-center text-white shrink-0 mt-1 shadow">
                    <Headphones className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[82%] sm:max-w-[70%] p-3.5 rounded-2xl space-y-1 ${
                    isAdmin
                      ? 'bg-gradient-to-br from-purple-950/70 to-slate-900 border border-purple-500/30 text-purple-100 rounded-tl-sm shadow-md'
                      : 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-tr-sm shadow-md'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3 text-[10px] opacity-80 border-b border-white/10 pb-1 mb-1">
                    <span className="font-bold flex items-center gap-1">
                      {isAdmin ? '🛡️ Sourov Admin Team' : `👤 ${m.senderName}`}
                    </span>
                    <span>
                      {new Date(m.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  <p className="text-xs leading-relaxed whitespace-pre-wrap font-normal">
                    {m.message}
                  </p>
                </div>

                {!isAdmin && (
                  <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-purple-400 shrink-0 mt-1">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Composer Form */}
      <form
        onSubmit={handleSendMessage}
        className="p-3 sm:p-4 bg-slate-900 light:bg-white border-t border-slate-800 light:border-slate-200 flex items-center gap-2"
      >
        <input
          type="text"
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          placeholder="অ্যাডমিনের উদ্দেশ্যে মেসেজ লিখুন..."
          className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950 light:bg-slate-100 border border-slate-800 light:border-slate-300 text-xs text-white light:text-slate-900 focus:outline-none focus:border-purple-500"
        />
        <Button
          type="submit"
          disabled={isSending || !messageText.trim()}
          className="bg-purple-600 hover:bg-purple-500 text-white px-5 py-2.5 font-bold shrink-0"
          rightIcon={<Send className="w-3.5 h-3.5" />}
        >
          {isSending ? 'পাঠানো হচ্ছে...' : 'মেসেজ দিন'}
        </Button>
      </form>
    </div>
  );
};
