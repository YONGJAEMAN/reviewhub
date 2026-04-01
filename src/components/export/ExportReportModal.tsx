'use client';

import { useState } from 'react';
import { X, Download, FileText, FileSpreadsheet } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useBusinessContext } from '@/components/BusinessContext';

interface Props {
  onClose: () => void;
}

export default function ExportReportModal({ onClose }: Props) {
  const t = useTranslations('export');
  const { activeBusiness } = useBusinessContext();
  const bid = activeBusiness?.businessId;
  const [format, setFormat] = useState<'pdf' | 'csv'>('pdf');
  const [days, setDays] = useState('30');
  const [generating, setGenerating] = useState(false);

  const handleDownload = async () => {
    if (!bid) return;
    setGenerating(true);
    try {
      const res = await fetch(`/api/export?format=${format}&days=${days}&businessId=${bid}`);
      if (!res.ok) throw new Error('Export failed');

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `reviewhub-report-${days}d.${format}`;
      a.click();
      URL.revokeObjectURL(url);
      onClose();
    } catch {
      console.error('Export failed');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-surface rounded-xl shadow-xl border border-border w-full max-w-md mx-4 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-text-primary">{t('title')}</h2>
          <button onClick={onClose} className="text-text-secondary hover:text-text-primary">
            <X size={20} />
          </button>
        </div>

        {/* Format Selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-text-secondary mb-2">{t('format')}</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setFormat('pdf')}
              className={`flex items-center justify-center gap-2 py-3 rounded-lg border text-sm font-medium transition-colors ${
                format === 'pdf'
                  ? 'border-navy bg-navy/5 text-navy'
                  : 'border-border text-text-secondary hover:bg-background'
              }`}
            >
              <FileText size={18} />
              PDF
            </button>
            <button
              onClick={() => setFormat('csv')}
              className={`flex items-center justify-center gap-2 py-3 rounded-lg border text-sm font-medium transition-colors ${
                format === 'csv'
                  ? 'border-navy bg-navy/5 text-navy'
                  : 'border-border text-text-secondary hover:bg-background'
              }`}
            >
              <FileSpreadsheet size={18} />
              CSV
            </button>
          </div>
        </div>

        {/* Period Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-text-secondary mb-2">{t('period')}</label>
          <select
            value={days}
            onChange={(e) => setDays(e.target.value)}
            className="w-full px-3 py-2.5 bg-background text-text-primary border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-blue"
          >
            <option value="7">7 days</option>
            <option value="30">30 days</option>
            <option value="90">90 days</option>
            <option value="365">1 year</option>
          </select>
        </div>

        <button
          onClick={handleDownload}
          disabled={generating}
          className="w-full flex items-center justify-center gap-2 bg-navy text-white rounded-lg px-4 py-3 text-sm font-medium hover:bg-navy-dark transition-colors disabled:opacity-50"
        >
          {generating ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              {t('generating')}
            </>
          ) : (
            <>
              <Download size={16} />
              {t('download')}
            </>
          )}
        </button>
      </div>
    </div>
  );
}
