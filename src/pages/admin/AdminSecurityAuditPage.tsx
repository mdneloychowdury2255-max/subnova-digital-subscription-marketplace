import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  ShieldAlert,
  ShieldCheck,
  Activity,
  Database,
  Lock,
  RefreshCw,
  Download,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Eye,
  KeyRound,
  Server,
  Zap,
} from 'lucide-react';
import { db } from '../../services/api';
import { SuspiciousActivity, AuditLog, EmergencySecuritySettings, DatabaseBackupSnapshot } from '../../types';

export const AdminSecurityAuditPage: React.FC = () => {
  const { adminAccount } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'emergency' | 'suspicious' | 'audit' | 'backups'>('emergency');
  const [isLoading, setIsLoading] = useState(false);

  // Emergency Security State
  const [securitySettings, setSecuritySettings] = useState<EmergencySecuritySettings>(() => db.getEmergencySecurity());
  const [isSavingSecurity, setIsSavingSecurity] = useState(false);

  // Suspicious Activities State
  const [suspiciousList, setSuspiciousList] = useState<SuspiciousActivity[]>(() => db.getSuspiciousActivities());
  const [selectedSuspicious, setSelectedSuspicious] = useState<SuspiciousActivity | null>(null);
  const [resolveNotes, setResolveNotes] = useState('');

  // Audit Logs State
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => db.getAuditLogs());
  const [auditSearch, setAuditSearch] = useState('');
  const [auditActionFilter, setAuditActionFilter] = useState('all');

  // Backups State
  const [backups, setBackups] = useState<DatabaseBackupSnapshot[]>(() => db.getBackups());
  const [backupLabel, setBackupLabel] = useState('');
  const [isCreatingBackup, setIsCreatingBackup] = useState(false);
  const [restoreModalBackup, setRestoreModalBackup] = useState<DatabaseBackupSnapshot | null>(null);
  const [restorePasswordConfirm, setRestorePasswordConfirm] = useState('');
  const [isRestoring, setIsRestoring] = useState(false);

  const refreshData = () => {
    setIsLoading(true);
    try {
      setSecuritySettings(db.getEmergencySecurity());
      setSuspiciousList(db.getSuspiciousActivities());
      setAuditLogs(db.getAuditLogs());
      setBackups(db.getBackups());
      showToast('info', 'Refreshed', 'Security and audit telemetry synced from disk storage.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  // Save Emergency Controls
  const handleToggleEmergency = (key: keyof EmergencySecuritySettings, value: boolean) => {
    const updated = { ...securitySettings, [key]: value };
    setSecuritySettings(updated);
    setIsSavingSecurity(true);
    try {
      db.updateEmergencySecurity(updated);
      showToast('success', 'Security Policy Updated', `Modified ${String(key)} to ${value ? 'ACTIVE' : 'DISABLED'}`);
    } catch (err: any) {
      showToast('error', 'Update Failed', err.message);
    } finally {
      setIsSavingSecurity(false);
    }
  };

  // Resolve Suspicious Item
  const handleResolveSuspicious = (id: string) => {
    try {
      db.resolveSuspiciousActivity(id, resolveNotes || 'Verified and resolved by Administrator');
      setSuspiciousList(db.getSuspiciousActivities());
      setSelectedSuspicious(null);
      setResolveNotes('');
      showToast('success', 'Resolved', 'Suspicious activity marked as resolved.');
    } catch (err: any) {
      showToast('error', 'Error', err.message);
    }
  };

  // Create Snapshot
  const handleCreateBackup = () => {
    setIsCreatingBackup(true);
    try {
      const snap = db.createBackup(backupLabel || 'Manual Administrator Snapshot', false);
      setBackups(db.getBackups());
      setBackupLabel('');
      showToast('success', 'Backup Created', `Snapshot created with ${snap.summary.productsCount} products & ${snap.summary.usersCount} users.`);
    } catch (err: any) {
      showToast('error', 'Backup Failed', err.message);
    } finally {
      setIsCreatingBackup(false);
    }
  };

  // Restore Snapshot
  const handleConfirmRestore = async () => {
    if (!restoreModalBackup || !restorePasswordConfirm) return;
    setIsRestoring(true);
    try {
      const isCorrect = await db.verifyAdminPassword(restorePasswordConfirm);
      if (!isCorrect) {
        showToast('error', 'Verification Failed', 'Incorrect admin password. Database restore aborted.');
        return;
      }
      db.restoreBackup(restoreModalBackup.id);
      showToast('success', 'Database Restored', `Successfully rolled back to snapshot "${restoreModalBackup.label}".`);
      setRestoreModalBackup(null);
      setRestorePasswordConfirm('');
      refreshData();
    } catch (err: any) {
      showToast('error', 'Restore Failed', err.message);
    } finally {
      setIsRestoring(false);
    }
  };

  // Filter audit logs
  const filteredAuditLogs = auditLogs.filter((log) => {
    const matchesSearch =
      log.action.toLowerCase().includes(auditSearch.toLowerCase()) ||
      log.actor.toLowerCase().includes(auditSearch.toLowerCase()) ||
      (log.ipAddress && log.ipAddress.includes(auditSearch)) ||
      JSON.stringify(log.metadata || {}).toLowerCase().includes(auditSearch.toLowerCase());

    const matchesAction = auditActionFilter === 'all' || log.severity === auditActionFilter;
    return matchesSearch && matchesAction;
  });

  const pendingSuspiciousCount = suspiciousList.filter((s) => s.status === 'pending').length;

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-rose-950/30 to-slate-900 border border-rose-500/30 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
              <ShieldAlert className="w-6 h-6" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white light:text-slate-900">
              Security Operations & Audit Control
            </h1>
          </div>
          <p className="text-xs text-slate-400 max-w-2xl">
            Real-time attack mitigation, duplicate transaction prevention, immutable audit logs, rate limiters, and atomic disk database snapshot management.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={refreshData}
            disabled={isLoading}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Sync Telemetry</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('emergency')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'emergency'
              ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
              : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Zap className="w-4 h-4" />
          <span>Emergency Controls</span>
          {securitySettings.maintenanceMode && (
            <span className="px-1.5 py-0.2 bg-amber-400 text-slate-950 rounded text-[10px] font-black">ACTIVE</span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('suspicious')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'suspicious'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
              : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          <span>Suspicious Activities</span>
          {pendingSuspiciousCount > 0 && (
            <span className="px-1.5 py-0.2 bg-rose-500 text-white rounded text-[10px] font-bold">
              {pendingSuspiciousCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'audit'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
              : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Audit Logs ({auditLogs.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('backups')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'backups'
              ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/30'
              : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>Database Snapshots ({backups.length})</span>
        </button>
      </div>

      {/* TAB 1: EMERGENCY CONTROLS */}
      {activeTab === 'emergency' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Maintenance Mode Toggle */}
            <div className={`p-6 rounded-2xl border transition-all ${
              securitySettings.maintenanceMode
                ? 'bg-amber-950/30 border-amber-500/50 shadow-xl shadow-amber-500/10'
                : 'bg-slate-900/80 border-slate-800'
            }`}>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-amber-400 animate-pulse" />
                    <h3 className="text-base font-bold text-white">Store Maintenance Mode</h3>
                  </div>
                  <p className="text-xs text-slate-400 max-w-sm">
                    Temporarily lock customer checkout and public operations for scheduled updates or incident response.
                  </p>
                </div>
                <button
                  onClick={() => handleToggleEmergency('maintenanceMode', !securitySettings.maintenanceMode)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors ${
                    securitySettings.maintenanceMode
                      ? 'bg-amber-500 text-slate-950 hover:bg-amber-400'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                  }`}
                >
                  {securitySettings.maintenanceMode ? 'DISABLE LOCK' : 'ENABLE LOCK'}
                </button>
              </div>
            </div>

            {/* Disable New Deposits */}
            <div className={`p-6 rounded-2xl border transition-all ${
              securitySettings.disableDeposits
                ? 'bg-rose-950/30 border-rose-500/50 shadow-xl'
                : 'bg-slate-900/80 border-slate-800'
            }`}>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-white">Disable Wallet Deposits</h3>
                  <p className="text-xs text-slate-400 max-w-sm">
                    Block new deposit transaction submissions (bKash/Nagad/Rocket) if payment gateway verification is under review.
                  </p>
                </div>
                <button
                  onClick={() => handleToggleEmergency('disableDeposits', !securitySettings.disableDeposits)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors ${
                    securitySettings.disableDeposits
                      ? 'bg-rose-600 text-white hover:bg-rose-500'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                  }`}
                >
                  {securitySettings.disableDeposits ? 'BLOCKED (CLICK TO ENABLE)' : 'ALLOW DEPOSITS'}
                </button>
              </div>
            </div>

            {/* Disable New Orders */}
            <div className={`p-6 rounded-2xl border transition-all ${
              securitySettings.disableNewOrders
                ? 'bg-rose-950/30 border-rose-500/50'
                : 'bg-slate-900/80 border-slate-800'
            }`}>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-white">Disable New Orders</h3>
                  <p className="text-xs text-slate-400 max-w-sm">
                    Halt customer & reseller order placement while keeping catalog browsing active.
                  </p>
                </div>
                <button
                  onClick={() => handleToggleEmergency('disableNewOrders', !securitySettings.disableNewOrders)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors ${
                    securitySettings.disableNewOrders
                      ? 'bg-rose-600 text-white hover:bg-rose-500'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                  }`}
                >
                  {securitySettings.disableNewOrders ? 'ORDERS HALTED' : 'ALLOW ORDERS'}
                </button>
              </div>
            </div>

            {/* Strict Rate Limiting */}
            <div className={`p-6 rounded-2xl border transition-all ${
              securitySettings.enableStrictRateLimiting
                ? 'bg-purple-950/30 border-purple-500/50'
                : 'bg-slate-900/80 border-slate-800'
            }`}>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-white">Strict IP Rate Limiting</h3>
                  <p className="text-xs text-slate-400 max-w-sm">
                    Throttle API requests per IP address to safeguard against automated scrapers and brute-force tools.
                  </p>
                </div>
                <button
                  onClick={() => handleToggleEmergency('enableStrictRateLimiting', !securitySettings.enableStrictRateLimiting)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors ${
                    securitySettings.enableStrictRateLimiting
                      ? 'bg-purple-600 text-white hover:bg-purple-500'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                  }`}
                >
                  {securitySettings.enableStrictRateLimiting ? 'STRICT ACTIVE' : 'STANDARD'}
                </button>
              </div>
            </div>
          </div>

          {/* Security Parameter Limits */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Active Security Thresholds</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                <p className="text-slate-400 font-medium">Max Failed Login Attempts</p>
                <p className="text-xl font-bold font-mono text-white mt-1">
                  {securitySettings.maxFailedLoginAttempts} Attempts
                </p>
                <p className="text-[11px] text-rose-400 mt-1">Triggers 15-minute brute-force lockout</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                <p className="text-slate-400 font-medium">Session Inactivity Expiration</p>
                <p className="text-xl font-bold font-mono text-white mt-1">
                  {securitySettings.sessionExpirationMinutes} Minutes
                </p>
                <p className="text-[11px] text-purple-400 mt-1">Auto-invalidates idle admin tokens</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                <p className="text-slate-400 font-medium">Duplicate TrxID Protection</p>
                <p className="text-xl font-bold font-mono text-emerald-400 mt-1">Active (Zero-Collision)</p>
                <p className="text-[11px] text-slate-400 mt-1">Cross-checks deposits & reseller fees</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SUSPICIOUS ACTIVITIES */}
      {activeTab === 'suspicious' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Real-Time Threat Detection Log</h3>
            <span className="text-xs text-slate-400">Total detected: {suspiciousList.length}</span>
          </div>

          {suspiciousList.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-slate-900/60 border border-slate-800 text-slate-400">
              <ShieldCheck className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
              <p className="text-sm font-bold text-white">No Suspicious Activities Detected</p>
              <p className="text-xs mt-1">Your marketplace traffic and payment references are clean and validated.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {suspiciousList.map((item) => (
                <div
                  key={item.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    item.status === 'pending'
                      ? 'bg-rose-950/20 border-rose-500/40'
                      : 'bg-slate-900/60 border-slate-800 opacity-70'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          item.severity === 'critical'
                            ? 'bg-rose-600 text-white'
                            : item.severity === 'high'
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        }`}>
                          {item.severity}
                        </span>
                        <h4 className="text-sm font-bold text-white">{item.title}</h4>
                        <span className="text-[11px] text-slate-500 font-mono">
                          {new Date(item.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300">{item.description}</p>
                      {item.ipAddress && (
                        <p className="text-[11px] text-slate-400 font-mono">
                          IP: <span className="text-slate-200">{item.ipAddress}</span>
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {item.status === 'pending' ? (
                        <button
                          onClick={() => setSelectedSuspicious(item)}
                          className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-md transition-colors"
                        >
                          Resolve Issue
                        </button>
                      ) : (
                        <span className="flex items-center gap-1 text-xs text-emerald-400 font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Resolved
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: AUDIT LOGS */}
      {activeTab === 'audit' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-2xl bg-slate-900/80 border border-slate-800">
            <input
              type="text"
              placeholder="Search audit logs by action, actor, IP, or metadata..."
              value={auditSearch}
              onChange={(e) => setAuditSearch(e.target.value)}
              className="w-full sm:w-96 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
            />

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={auditActionFilter}
                onChange={(e) => setAuditActionFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-purple-500"
              >
                <option value="all">All Severities</option>
                <option value="critical">Critical</option>
                <option value="warning">Warning</option>
                <option value="info">Info</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/60">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="p-3">Timestamp</th>
                  <th className="p-3">Severity</th>
                  <th className="p-3">Action</th>
                  <th className="p-3">Actor / User</th>
                  <th className="p-3">IP Address</th>
                  <th className="p-3">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredAuditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="p-3 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        log.severity === 'critical'
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : log.severity === 'warning'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                      }`}>
                        {log.severity}
                      </span>
                    </td>
                    <td className="p-3 font-bold text-white">{log.action}</td>
                    <td className="p-3 text-slate-300 font-mono">{log.actor}</td>
                    <td className="p-3 text-slate-400 font-mono">{log.ipAddress || '127.0.0.1'}</td>
                    <td className="p-3 text-slate-400 max-w-xs truncate font-mono text-[11px]">
                      {log.metadata ? JSON.stringify(log.metadata) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: DATABASE SNAPSHOTS & BACKUPS */}
      {activeTab === 'backups' && (
        <div className="space-y-6">
          {/* Create Backup Box */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Database className="w-4 h-4 text-cyan-400" />
              <span>Create Immediate Database Snapshot</span>
            </h3>
            <p className="text-xs text-slate-400">
              Creates an atomic JSON snapshot in <code>data/database.json</code> with complete product catalogs, active user wallets, verified orders, and transaction ledgers.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={backupLabel}
                onChange={(e) => setBackupLabel(e.target.value)}
                placeholder="Snapshot Label (e.g., Pre-Weekend Flash Sale Backup)"
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
              <button
                onClick={handleCreateBackup}
                disabled={isCreatingBackup}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-cyan-600/20 transition-all flex items-center justify-center gap-2"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{isCreatingBackup ? 'Creating Snapshot...' : 'Save Disk Snapshot'}</span>
              </button>
            </div>
          </div>

          {/* Snapshots List */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Available Database Snapshots ({backups.length})
            </h4>

            {backups.map((snap) => (
              <div
                key={snap.id}
                className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">{snap.label}</span>
                    {snap.isAutomatic && (
                      <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-400 text-[10px] font-semibold border border-purple-500/30">
                        Automatic
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-[11px] text-slate-400 font-mono">
                    <span>{new Date(snap.createdAt).toLocaleString()}</span>
                    <span>• {snap.summary.productsCount} Products</span>
                    <span>• {snap.summary.ordersCount} Orders</span>
                    <span>• {snap.summary.usersCount} Users</span>
                    <span>• Size: {(snap.fileSizeBytes / 1024).toFixed(1)} KB</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setRestoreModalBackup(snap)}
                    className="px-3.5 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Restore Snapshot</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* RESOLVE SUSPICIOUS ACTIVITY MODAL */}
      {selectedSuspicious && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-400" />
              <span>Resolve Security Incident</span>
            </h3>
            <p className="text-xs text-slate-300">{selectedSuspicious.description}</p>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Resolution Notes / Action Taken
              </label>
              <textarea
                rows={3}
                value={resolveNotes}
                onChange={(e) => setResolveNotes(e.target.value)}
                placeholder="e.g. Verified customer transaction with bKash statement. Approved manually."
                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setSelectedSuspicious(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={() => handleResolveSuspicious(selectedSuspicious.id)}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold"
              >
                Mark as Resolved
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RESTORE DATABASE CONFIRMATION MODAL */}
      {restoreModalBackup && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-rose-500/40 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-400">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <div>
                <h3 className="text-base font-bold text-white">Confirm Database Rollback</h3>
                <p className="text-xs text-rose-400">This action will replace the active database.</p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono space-y-1">
              <p className="text-slate-400">Snapshot: <strong className="text-white">{restoreModalBackup.label}</strong></p>
              <p className="text-slate-400">Created: <span className="text-white">{new Date(restoreModalBackup.createdAt).toLocaleString()}</span></p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Enter Administrator Password to Authorize
              </label>
              <input
                type="password"
                required
                value={restorePasswordConfirm}
                onChange={(e) => setRestorePasswordConfirm(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-rose-500 font-mono"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  setRestoreModalBackup(null);
                  setRestorePasswordConfirm('');
                }}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmRestore}
                disabled={isRestoring || !restorePasswordConfirm}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold disabled:opacity-50 flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{isRestoring ? 'Restoring...' : 'Authorize Restore'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
