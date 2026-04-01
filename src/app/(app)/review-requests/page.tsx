'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Send,
  Upload,
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  Truck,
} from 'lucide-react';
import { useBusinessContext } from '@/components/BusinessContext';

interface ReviewRequest {
  id: string;
  phone: string;
  customerName: string;
  platform: string;
  status: string;
  reviewCompleted: boolean;
  sentAt: string;
}

const statusConfig: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  SENT: { label: 'Sent', color: 'text-blue-600 bg-blue-50', icon: Send },
  DELIVERED: { label: 'Delivered', color: 'text-emerald-600 bg-emerald-50', icon: Truck },
  READ: { label: 'Read', color: 'text-purple-600 bg-purple-50', icon: Eye },
  FAILED: { label: 'Failed', color: 'text-red-600 bg-red-50', icon: XCircle },
};

export default function ReviewRequestsPage() {
  const { activeBusiness } = useBusinessContext();
  const bid = activeBusiness?.businessId;
  // ─── Individual Send ───
  const [phone, setPhone] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [platform, setPlatform] = useState('GOOGLE');
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<{ ok: boolean; message: string } | null>(null);

  // ─── Bulk Send ───
  const fileRef = useRef<HTMLInputElement>(null);
  const [bulkRows, setBulkRows] = useState<Array<{ phone: string; customerName: string }>>([]);
  const [bulkSending, setBulkSending] = useState(false);
  const [bulkProgress, setBulkProgress] = useState({ sent: 0, failed: 0, total: 0 });

  // ─── History ───
  const [history, setHistory] = useState<ReviewRequest[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchHistory();
  }, [page]);

  async function fetchHistory() {
    setHistoryLoading(true);
    try {
      const res = await fetch(`/api/whatsapp/history?page=${page}&limit=10&businessId=${bid}`);
      const json = await res.json();
      if (json.data) {
        setHistory(json.data.data);
        setTotalPages(json.data.totalPages);
      }
    } catch {
      console.error('Failed to load history');
    } finally {
      setHistoryLoading(false);
    }
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    setSendResult(null);

    try {
      const res = await fetch('/api/whatsapp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone,
          customerName,
          businessName: 'My Business',
          reviewLink: `https://g.page/review/${platform.toLowerCase()}`,
          platform,
        }),
      });
      const json = await res.json();
      if (res.ok) {
        setSendResult({ ok: true, message: 'Message sent successfully!' });
        setPhone('');
        setCustomerName('');
        fetchHistory();
      } else {
        setSendResult({ ok: false, message: json.error || 'Failed to send' });
      }
    } catch {
      setSendResult({ ok: false, message: 'Network error' });
    } finally {
      setSending(false);
    }
  }

  function handleCSVUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      const lines = text.split('\n').filter((l) => l.trim());
      // Skip header row
      const rows = lines.slice(1).map((line) => {
        const [phone, customerName] = line.split(',').map((s) => s.trim());
        return { phone, customerName };
      }).filter((r) => r.phone && r.customerName);
      setBulkRows(rows);
    };
    reader.readAsText(file);
  }

  async function handleBulkSend() {
    if (bulkRows.length === 0) return;
    setBulkSending(true);
    setBulkProgress({ sent: 0, failed: 0, total: bulkRows.length });

    for (let i = 0; i < bulkRows.length; i++) {
      const row = bulkRows[i];
      try {
        const res = await fetch('/api/whatsapp/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phone: row.phone,
            customerName: row.customerName,
            businessName: 'My Business',
            reviewLink: `https://g.page/review/google`,
            platform: 'GOOGLE',
          }),
        });
        if (res.ok) {
          setBulkProgress((p) => ({ ...p, sent: p.sent + 1 }));
        } else {
          setBulkProgress((p) => ({ ...p, failed: p.failed + 1 }));
        }
      } catch {
        setBulkProgress((p) => ({ ...p, failed: p.failed + 1 }));
      }
      // Rate limit: 1 request per second
      if (i < bulkRows.length - 1) {
        await new Promise((r) => setTimeout(r, 1000));
      }
    }

    setBulkSending(false);
    setBulkRows([]);
    if (fileRef.current) fileRef.current.value = '';
    fetchHistory();
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <div className="w-[3px] h-8 bg-accent-blue rounded-full" />
        <div>
          <h1 className="text-[28px] font-bold text-text-primary">Review Requests</h1>
          <p className="text-sm text-text-secondary mt-1">
            Send review requests via WhatsApp and track their status.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* ─── Individual Send ─── */}
        <div className="bg-surface border border-border rounded-xl p-6">
          <h2 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
            <Send size={18} className="text-accent-blue" />
            Send Individual Request
          </h2>
          <form onSubmit={handleSend} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                Customer Name
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="John Doe"
                required
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent-blue/20 focus:border-accent-blue"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1234567890"
                required
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent-blue/20 focus:border-accent-blue"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                Review Platform
              </label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent-blue/20 focus:border-accent-blue"
              >
                <option value="GOOGLE">Google</option>
                <option value="YELP">Yelp</option>
                <option value="FACEBOOK">Facebook</option>
              </select>
            </div>
            <button
              type="submit"
              disabled={sending}
              className="w-full flex items-center justify-center gap-2 bg-navy text-surface rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-navy-dark transition-colors disabled:opacity-50"
            >
              {sending ? (
                <div className="w-4 h-4 border-2 border-surface border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send size={16} />
              )}
              {sending ? 'Sending...' : 'Send Request'}
            </button>
            {sendResult && (
              <div
                className={`flex items-center gap-2 text-sm p-3 rounded-lg ${
                  sendResult.ok
                    ? 'text-emerald-700 bg-emerald-50'
                    : 'text-red-700 bg-red-50'
                }`}
              >
                {sendResult.ok ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                {sendResult.message}
              </div>
            )}
          </form>
        </div>

        {/* ─── Bulk Send ─── */}
        <div className="bg-surface border border-border rounded-xl p-6">
          <h2 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
            <Upload size={18} className="text-accent-blue" />
            Bulk Send (CSV)
          </h2>
          <p className="text-sm text-text-secondary mb-4">
            Upload a CSV file with columns: <code className="bg-background px-1 py-0.5 rounded text-xs">phone, customerName</code>
          </p>
          <input
            ref={fileRef}
            type="file"
            accept=".csv"
            onChange={handleCSVUpload}
            className="w-full text-sm text-text-secondary file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-navy file:text-surface hover:file:bg-navy-dark file:cursor-pointer mb-4"
          />
          {bulkRows.length > 0 && !bulkSending && (
            <div className="space-y-3">
              <p className="text-sm text-text-primary">
                <span className="font-semibold">{bulkRows.length}</span> contacts ready to send
              </p>
              <button
                onClick={handleBulkSend}
                className="w-full flex items-center justify-center gap-2 bg-navy text-surface rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-navy-dark transition-colors"
              >
                <Send size={16} />
                Send All
              </button>
            </div>
          )}
          {bulkSending && (
            <div className="space-y-3">
              <div className="w-full bg-background rounded-full h-2">
                <div
                  className="bg-accent-blue h-2 rounded-full transition-all"
                  style={{
                    width: `${((bulkProgress.sent + bulkProgress.failed) / bulkProgress.total) * 100}%`,
                  }}
                />
              </div>
              <p className="text-sm text-text-secondary">
                Sent: {bulkProgress.sent} / Failed: {bulkProgress.failed} / Total: {bulkProgress.total}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ─── History Table ─── */}
      <div className="bg-surface border border-border rounded-xl p-6">
        <h2 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
          <Clock size={18} className="text-accent-blue" />
          Send History
        </h2>
        {historyLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="w-6 h-6 border-2 border-accent-blue border-t-transparent rounded-full animate-spin" />
          </div>
        ) : history.length === 0 ? (
          <p className="text-sm text-text-secondary text-center py-8">
            No review requests sent yet.
          </p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-medium text-text-secondary">Customer</th>
                    <th className="text-left py-3 px-4 font-medium text-text-secondary">Phone</th>
                    <th className="text-left py-3 px-4 font-medium text-text-secondary">Platform</th>
                    <th className="text-left py-3 px-4 font-medium text-text-secondary">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-text-secondary">Sent At</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((req) => {
                    const cfg = statusConfig[req.status] || statusConfig.SENT;
                    const StatusIcon = cfg.icon;
                    return (
                      <tr key={req.id} className="border-b border-border/50 hover:bg-background/50">
                        <td className="py-3 px-4 text-text-primary font-medium">{req.customerName}</td>
                        <td className="py-3 px-4 text-text-secondary">{req.phone}</td>
                        <td className="py-3 px-4">
                          <span className="capitalize text-text-secondary">{req.platform.toLowerCase()}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.color}`}>
                            <StatusIcon size={12} />
                            {cfg.label}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-text-secondary">
                          {new Date(req.sentAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-4">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 text-sm border border-border rounded-lg disabled:opacity-40 hover:bg-background"
                >
                  Previous
                </button>
                <span className="text-sm text-text-secondary">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1.5 text-sm border border-border rounded-lg disabled:opacity-40 hover:bg-background"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
