import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '../../context/NavigationContext';
import { db } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Bell, CheckCheck, Trash2, ArrowRight } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export const CustomerNotificationsPage: React.FC = () => {
  const { user } = useAuth();
  const { navigate } = useNavigation();
  const { showToast } = useToast();

  const notifications = user ? db.getNotifications(user.id) : [];

  const handleMarkAllRead = () => {
    if (user) {
      db.markAllNotificationsRead(user.id);
      showToast('success', 'Updated', 'All notifications marked as read.');
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white light:text-slate-900 flex items-center gap-2">
            <Bell className="w-6 h-6 text-purple-400" />
            Notifications Center
          </h1>
          <p className="text-xs text-slate-400">
            Real-time updates regarding your license delivery, deposit confirmations, and ticket replies.
          </p>
        </div>

        {notifications.length > 0 && (
          <Button
            size="sm"
            variant="outline"
            onClick={handleMarkAllRead}
            leftIcon={<CheckCheck className="w-3.5 h-3.5" />}
          >
            Mark All Read
          </Button>
        )}
      </div>

      <div className="space-y-3">
        {notifications.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-slate-900/60 light:bg-white border border-slate-800 light:border-slate-200">
            <p className="text-xs text-slate-500">No notifications in your inbox.</p>
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => {
                db.markNotificationRead(n.id);
                if (n.link) navigate(n.link);
              }}
              className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                n.isRead
                  ? 'bg-slate-900/40 light:bg-white border-slate-800 light:border-slate-200 text-slate-400'
                  : 'bg-purple-950/20 light:bg-purple-50/70 border-purple-500/40 text-slate-200 shadow-md'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    {!n.isRead && <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />}
                    <h4 className="text-sm font-bold text-white light:text-slate-900">{n.title}</h4>
                  </div>
                  <p className="text-xs text-slate-300 light:text-slate-700 mt-1 leading-relaxed">
                    {n.message}
                  </p>
                  <span className="text-[10px] text-slate-500 mt-2 block font-mono">
                    {new Date(n.createdAt).toLocaleDateString()} at{' '}
                    {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                {n.link && (
                  <ArrowRight className="w-4 h-4 text-purple-400 shrink-0 self-center" />
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
