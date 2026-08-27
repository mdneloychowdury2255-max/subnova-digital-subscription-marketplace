import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '../../context/NavigationContext';
import { db } from '../../services/api';
import {
  Users,
  Search,
  Plus,
  Mail,
  ShoppingBag,
  ExternalLink,
  Clock,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';

export const ResellerCustomersPage: React.FC = () => {
  const { user } = useAuth();
  const { navigate } = useNavigation();
  const [search, setSearch] = useState('');

  const clients = user ? db.getResellerClients(user.id) : [];

  const filteredClients = clients.filter((c) => {
    if (search.trim()) {
      const q = search.toLowerCase();
      return c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white light:text-slate-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-purple-400" />
            Managed Client Directory
          </h1>
          <p className="text-xs text-slate-400">
            Maintain your list of end-users, their assigned subscription keys, and renewal schedules.
          </p>
        </div>

        <Button
          size="sm"
          onClick={() => navigate('/reseller/place-order')}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Add / Order for Client
        </Button>
      </div>

      {/* Search */}
      <div className="relative w-full sm:w-80">
        <Search className="w-4 h-4 text-purple-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search clients by name or email..."
          className="w-full pl-10 pr-3 py-2 rounded-xl bg-slate-900 light:bg-white border border-slate-800 light:border-slate-300 text-xs text-white light:text-slate-900 focus:outline-none focus:border-purple-500"
        />
      </div>

      {/* Client Cards / Table */}
      <div className="rounded-2xl bg-slate-900/60 light:bg-white border border-slate-800 light:border-slate-200 overflow-hidden">
        {filteredClients.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Users className="w-10 h-10 text-slate-600 mx-auto" />
            <h4 className="text-sm font-bold text-white light:text-slate-900">No managed clients found</h4>
            <p className="text-xs text-slate-400">Place an order for a client to add them to your directory.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/60 light:bg-slate-100/80 border-b border-slate-800 light:border-slate-200 text-slate-400">
                <tr>
                  <th className="p-4">Client Name</th>
                  <th className="p-4">Delivery Email</th>
                  <th className="p-4">Active Subscriptions</th>
                  <th className="p-4">Total Wholesale Volume</th>
                  <th className="p-4">Latest Order</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 light:divide-slate-200 text-slate-300 light:text-slate-700">
                {filteredClients.map((client, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/30 light:hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-bold text-white light:text-slate-900">
                      {client.name}
                    </td>
                    <td className="p-4 font-mono text-slate-400">
                      {client.email}
                    </td>
                    <td className="p-4">
                      <Badge variant="purple">{client.orderCount} Active Keys</Badge>
                    </td>
                    <td className="p-4 font-mono font-bold text-white light:text-slate-900">
                      ${client.totalSpent.toFixed(2)}
                    </td>
                    <td className="p-4 text-slate-400">
                      {new Date(client.lastOrder).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigate(`/reseller/place-order`)}
                      >
                        New Order
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
