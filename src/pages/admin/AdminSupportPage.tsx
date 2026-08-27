import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import {
  Headphones,
  Search,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  Send,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { SupportTicket } from '../../types';

export const AdminSupportPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [search, setSearch] = useState('');
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [replyText, setReplyText] = useState('');

  const tickets = db.getTickets();

  const filteredTickets = tickets.filter((t) => {
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        t.ticketNumber.toLowerCase().includes(q) ||
        t.subject.toLowerCase().includes(q) ||
        t.userName.toLowerCase().includes(q) ||
        t.userEmail.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleAdminReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !replyText.trim() || !user) return;

    const updated = db.replyTicket(selectedTicket.id, user.id, user.name, 'admin', replyText.trim());
    if (updated) {
      setSelectedTicket(updated);
      setReplyText('');
      showToast('success', 'Reply Dispatched', 'Response sent to customer.');
    }
  };

  const handleResolveTicket = (ticketId: string) => {
    const updated = db.updateTicketStatus(ticketId, 'resolved');
    if (updated) {
      setSelectedTicket(updated);
      showToast('success', 'Ticket Resolved', `Ticket #${updated.ticketNumber} marked as resolved.`);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white light:text-slate-900 flex items-center gap-2">
          <Headphones className="w-6 h-6 text-purple-400" />
          Master Support Helpdesk Queue
        </h1>
        <p className="text-xs text-slate-400">
          Handle incoming customer license inquiries, billing disputes, and technical support requests.
        </p>
      </div>

      {/* Search */}
      <div className="relative w-full sm:w-80">
        <Search className="w-4 h-4 text-purple-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search tickets by user, subject, #..."
          className="w-full pl-10 pr-3 py-2 rounded-xl bg-slate-900 light:bg-white border border-slate-800 light:border-slate-300 text-xs text-white light:text-slate-900 focus:outline-none focus:border-purple-500"
        />
      </div>

      {/* Tickets Table */}
      <div className="rounded-2xl bg-slate-900/60 light:bg-white border border-slate-800 light:border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 light:bg-slate-100/80 border-b border-slate-800 light:border-slate-200 text-slate-400">
              <tr>
                <th className="p-4">Ticket #</th>
                <th className="p-4">User Details</th>
                <th className="p-4">Subject</th>
                <th className="p-4">Category</th>
                <th className="p-4">Priority</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 light:divide-slate-200 text-slate-300 light:text-slate-700">
              {filteredTickets.map((t) => (
                <tr key={t.id} className="hover:bg-slate-800/30 light:hover:bg-slate-50">
                  <td className="p-4 font-mono font-bold text-white light:text-slate-900">
                    {t.ticketNumber}
                  </td>
                  <td className="p-4">
                    <p className="font-bold text-white light:text-slate-900">{t.userName}</p>
                    <p className="text-[11px] text-slate-400">{t.userEmail}</p>
                  </td>
                  <td className="p-4 font-semibold text-white light:text-slate-900">
                    {t.subject}
                  </td>
                  <td className="p-4 capitalize">{t.category.replace('_', ' ')}</td>
                  <td className="p-4 uppercase font-bold text-[10px] text-purple-400">
                    {t.priority}
                  </td>
                  <td className="p-4">
                    <Badge
                      variant={
                        t.status === 'open'
                          ? 'warning'
                          : t.status === 'in_progress'
                          ? 'purple'
                          : 'success'
                      }
                    >
                      {t.status}
                    </Badge>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => setSelectedTicket(t)}
                      className="px-3 py-1 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-semibold"
                    >
                      Reply
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reply Modal */}
      {selectedTicket && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedTicket(null)}
          title={`Ticket ${selectedTicket.ticketNumber}: ${selectedTicket.subject}`}
          maxWidth="max-w-2xl"
        >
          <div className="space-y-4 text-xs">
            <div className="flex justify-between items-center p-3 rounded-xl bg-slate-950 light:bg-slate-100">
              <div>
                <span className="font-bold text-white light:text-slate-900">{selectedTicket.userName}</span>
                <span className="text-slate-400 text-[11px] ml-2">({selectedTicket.userEmail})</span>
              </div>
              <div className="flex gap-2">
                <Badge variant="purple">{selectedTicket.status.toUpperCase()}</Badge>
                {selectedTicket.status !== 'resolved' && (
                  <button
                    onClick={() => handleResolveTicket(selectedTicket.id)}
                    className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold text-[10px]"
                  >
                    Mark Resolved
                  </button>
                )}
              </div>
            </div>

            {/* Message Thread */}
            <div className="max-h-80 overflow-y-auto space-y-3 p-2">
              {selectedTicket.messages.map((m) => (
                <div
                  key={m.id}
                  className={`p-3.5 rounded-2xl ${
                    m.senderRole === 'admin'
                      ? 'bg-purple-950/40 border border-purple-500/30 text-purple-200 ml-4'
                      : 'bg-slate-900 border border-slate-800 text-slate-200 mr-4'
                  }`}
                >
                  <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                    <span className="font-bold text-white">{m.senderName} ({m.senderRole})</span>
                    <span>{new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <p className="whitespace-pre-line text-xs">{m.message}</p>
                </div>
              ))}
            </div>

            {/* Reply Input */}
            <form onSubmit={handleAdminReply} className="flex gap-2 pt-2">
              <input
                type="text"
                required
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Type official admin response..."
                className="flex-1 px-3 py-2 rounded-xl bg-slate-950 light:bg-slate-50 border border-slate-800 text-xs text-white light:text-slate-900 focus:outline-none focus:border-purple-500"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-semibold flex items-center gap-1"
              >
                <Send className="w-3.5 h-3.5" /> Send Reply
              </button>
            </form>
          </div>
        </Modal>
      )}
    </div>
  );
};
