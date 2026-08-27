import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import {
  Headphones,
  Plus,
  MessageSquare,
  Clock,
  CheckCircle2,
  AlertCircle,
  Send,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { SupportTicket } from '../../types';

export const CustomerSupportPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [isNewOpen, setIsNewOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState<'license_issue' | 'payment_issue' | 'reseller_inquiry' | 'general'>('license_issue');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [message, setMessage] = useState('');
  const [replyText, setReplyText] = useState('');

  const tickets = user ? db.getUserTickets(user.id) : [];

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !subject.trim() || !message.trim()) return;

    db.createTicket({
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      userRole: user.role,
      subject,
      category,
      priority,
      message,
    });

    setIsNewOpen(false);
    setSubject('');
    setMessage('');
    showToast('success', 'Ticket Submitted', 'Our support team will respond shortly.');
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !replyText.trim() || !user) return;

    const updated = db.replyTicket(selectedTicket.id, user.id, user.name, user.role, replyText.trim());
    if (updated) {
      setSelectedTicket(updated);
      setReplyText('');
      showToast('success', 'Reply Sent', 'Your message has been added to the ticket.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white light:text-slate-900 flex items-center gap-2">
            <Headphones className="w-6 h-6 text-purple-400" />
            Customer Support Desk
          </h1>
          <p className="text-xs text-slate-400">
            Open a support ticket for license activation help, billing queries, or technical assistance.
          </p>
        </div>
        <Button
          size="sm"
          onClick={() => setIsNewOpen(true)}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Open New Ticket
        </Button>
      </div>

      {/* Tickets List */}
      <div className="rounded-2xl bg-slate-900/60 light:bg-white border border-slate-800 light:border-slate-200 overflow-hidden">
        {tickets.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <MessageSquare className="w-10 h-10 text-slate-600 mx-auto" />
            <h4 className="text-sm font-bold text-white light:text-slate-900">No support tickets</h4>
            <p className="text-xs text-slate-400">Need help with a key or payment? Create a ticket above.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/60 light:bg-slate-100/80 border-b border-slate-800 light:border-slate-200 text-slate-400">
                <tr>
                  <th className="p-4">Ticket #</th>
                  <th className="p-4">Subject</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Priority</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Last Update</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 light:divide-slate-200 text-slate-300 light:text-slate-700">
                {tickets.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-800/30 light:hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-mono font-bold text-white light:text-slate-900">
                      {t.ticketNumber}
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
                    <td className="p-4 text-slate-400">
                      {new Date(t.updatedAt).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => setSelectedTicket(t)}
                        className="px-3 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-semibold"
                      >
                        View & Reply
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* New Ticket Modal */}
      {isNewOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsNewOpen(false)}
          title="Create New Support Request"
          maxWidth="max-w-xl"
        >
          <form onSubmit={handleCreateTicket} className="space-y-4 text-xs text-slate-300 light:text-slate-700">
            <div>
              <label className="block font-semibold mb-1 text-white light:text-slate-900">
                Subject
              </label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Question about my Claude subscription key"
                className="w-full px-3 py-2 rounded-xl bg-slate-950 light:bg-slate-50 border border-slate-800 light:border-slate-300 text-sm text-white light:text-slate-900 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold mb-1 text-white light:text-slate-900">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 light:bg-slate-50 border border-slate-800 light:border-slate-300 text-xs text-white light:text-slate-900 focus:outline-none focus:border-purple-500"
                >
                  <option value="license_issue">License / Key Issue</option>
                  <option value="payment_issue">Payment & Wallet</option>
                  <option value="reseller_inquiry">Reseller Program</option>
                  <option value="general">General Support</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-white light:text-slate-900">
                  Priority Level
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 light:bg-slate-50 border border-slate-800 light:border-slate-300 text-xs text-white light:text-slate-900 focus:outline-none focus:border-purple-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-semibold mb-1 text-white light:text-slate-900">
                Detailed Message
              </label>
              <textarea
                rows={4}
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Please describe your issue or question in detail..."
                className="w-full p-3 rounded-xl bg-slate-950 light:bg-slate-50 border border-slate-800 light:border-slate-300 text-xs text-white light:text-slate-900 focus:outline-none focus:border-purple-500"
              />
            </div>

            <Button type="submit" size="md" className="w-full font-bold">
              Submit Ticket
            </Button>
          </form>
        </Modal>
      )}

      {/* Ticket Details & Chat Modal */}
      {selectedTicket && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedTicket(null)}
          title={`Ticket ${selectedTicket.ticketNumber}: ${selectedTicket.subject}`}
          maxWidth="max-w-2xl"
        >
          <div className="space-y-4 text-xs">
            {/* Header info */}
            <div className="flex justify-between items-center p-3 rounded-xl bg-slate-950 light:bg-slate-100">
              <span className="text-slate-400">Status:</span>
              <Badge variant="purple">{selectedTicket.status.toUpperCase()}</Badge>
            </div>

            {/* Messages Thread */}
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
            <form onSubmit={handleSendReply} className="flex gap-2 pt-2">
              <input
                type="text"
                required
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Type your reply to support..."
                className="flex-1 px-3 py-2 rounded-xl bg-slate-950 light:bg-slate-50 border border-slate-800 light:border-slate-300 text-xs text-white light:text-slate-900 focus:outline-none focus:border-purple-500"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-semibold flex items-center gap-1"
              >
                <Send className="w-3.5 h-3.5" /> Reply
              </button>
            </form>
          </div>
        </Modal>
      )}
    </div>
  );
};
