'use client';

import { useState, useEffect } from 'react';
import { QrCode, Plus, Trash2, Printer, Copy, Check } from 'lucide-react';
import { useBusinessContext } from '@/components/BusinessContext';

interface QrCodeItem {
  id: string;
  code: string;
  platform: string;
  reviewUrl: string;
  scanCount: number;
  createdAt: string;
}

const PLATFORM_LABELS: Record<string, string> = {
  GOOGLE: 'Google',
  YELP: 'Yelp',
  FACEBOOK: 'Facebook',
};

export default function QrManagementPage() {
  const { activeBusiness } = useBusinessContext();
  const bid = activeBusiness?.businessId;
  const [qrCodes, setQrCodes] = useState<QrCodeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [platform, setPlatform] = useState('GOOGLE');
  const [reviewUrl, setReviewUrl] = useState('');
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    if (!bid) return;
    fetch(`/api/qr?businessId=${bid}`)
      .then((r) => r.json())
      .then((j) => setQrCodes(j.data ?? []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [bid]);

  const handleCreate = async () => {
    if (!bid || !reviewUrl) return;
    const res = await fetch('/api/qr', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ businessId: bid, platform, reviewUrl }),
    });
    const json = await res.json();
    if (json.data) {
      setQrCodes((prev) => [json.data, ...prev]);
      setShowForm(false);
      setReviewUrl('');
    }
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/qr/${id}`, { method: 'DELETE' });
    setQrCodes((prev) => prev.filter((q) => q.id !== id));
  };

  const copyLink = (code: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/r/${code}`);
    setCopied(code);
    setTimeout(() => setCopied(null), 2000);
  };

  const printCard = (qr: QrCodeItem) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>QR Review Card</title>
        <style>
          @page { size: A6 landscape; margin: 0; }
          body { margin: 0; display: flex; align-items: center; justify-content: center; height: 100vh; font-family: -apple-system, system-ui, sans-serif; }
          .card { text-align: center; padding: 24px; }
          .card h2 { margin: 0 0 4px; font-size: 18px; color: #1a2332; }
          .card p { margin: 0 0 16px; font-size: 12px; color: #6b7280; }
          .card img { width: 180px; height: 180px; }
          .card .scan { margin-top: 12px; font-size: 14px; font-weight: 600; color: #1a2332; }
          .card .url { font-size: 10px; color: #9ca3af; margin-top: 4px; }
        </style>
      </head>
      <body>
        <div class="card">
          <h2>${activeBusiness?.businessName ?? 'Our Business'}</h2>
          <p>We value your feedback!</p>
          <img src="/api/qr/${qr.id}" alt="QR Code" />
          <p class="scan">Scan to leave a review</p>
          <p class="url">${window.location.origin}/r/${qr.code}</p>
        </div>
        <script>window.onload = () => { window.print(); window.close(); }</script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-accent-blue border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-[3px] h-8 bg-accent-blue rounded-full" />
            <h1 className="text-[28px] font-bold text-text-primary">QR Review Cards</h1>
          </div>
          <p className="text-sm text-text-secondary mt-1 ml-[15px]">
            Generate QR codes to collect reviews from customers.
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-navy text-white text-sm rounded-lg hover:bg-navy/90"
        >
          <Plus size={16} /> Create QR Code
        </button>
      </div>

      {showForm && (
        <div className="bg-surface rounded-xl shadow-sm border border-border p-6 mb-6">
          <h3 className="text-lg font-semibold text-text-primary mb-4">New QR Code</h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Platform</label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background focus:ring-2 focus:ring-accent-blue/20 focus:border-accent-blue outline-none"
              >
                <option value="GOOGLE">Google</option>
                <option value="YELP">Yelp</option>
                <option value="FACEBOOK">Facebook</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Review Page URL</label>
              <input
                type="url"
                value={reviewUrl}
                onChange={(e) => setReviewUrl(e.target.value)}
                placeholder="https://g.page/r/..."
                className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background focus:ring-2 focus:ring-accent-blue/20 focus:border-accent-blue outline-none"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleCreate}
              disabled={!reviewUrl}
              className="px-4 py-2 bg-navy text-white text-sm rounded-lg hover:bg-navy/90 disabled:opacity-50"
            >
              Create
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="px-4 py-2 text-sm text-text-secondary hover:text-text-primary"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {qrCodes.length === 0 ? (
        <div className="bg-surface rounded-xl shadow-sm border border-border p-12 text-center">
          <QrCode size={48} className="text-text-secondary mx-auto mb-4" />
          <p className="text-text-secondary">No QR codes yet. Create one to start collecting reviews.</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-6">
          {qrCodes.map((qr) => (
            <div key={qr.id} className="bg-surface rounded-xl shadow-sm border border-border p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold px-2 py-1 bg-accent-blue/10 text-accent-blue rounded">
                  {PLATFORM_LABELS[qr.platform] ?? qr.platform}
                </span>
                <span className="text-xs text-text-secondary">{qr.scanCount} scans</span>
              </div>

              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/api/qr/${qr.id}`}
                alt="QR Code"
                className="w-40 h-40 mx-auto mb-4"
              />

              <p className="text-xs text-text-secondary text-center truncate mb-4">
                {qr.reviewUrl}
              </p>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => copyLink(qr.code)}
                  className="flex-1 flex items-center justify-center gap-1 py-2 text-sm text-text-secondary hover:text-text-primary border border-border rounded-lg"
                >
                  {copied === qr.code ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                  {copied === qr.code ? 'Copied' : 'Copy Link'}
                </button>
                <button
                  onClick={() => printCard(qr)}
                  className="flex-1 flex items-center justify-center gap-1 py-2 text-sm text-text-secondary hover:text-text-primary border border-border rounded-lg"
                >
                  <Printer size={14} /> Print
                </button>
                <button
                  onClick={() => handleDelete(qr.id)}
                  className="p-2 text-text-secondary hover:text-danger border border-border rounded-lg"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
