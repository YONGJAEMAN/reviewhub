import { Star, TrendingUp, Smile, BarChart3 } from 'lucide-react';
import type { KpiData } from '@/types';

const iconMap: Record<string, React.ElementType> = {
  star: Star,
  'trending-up': TrendingUp,
  smile: Smile,
  'bar-chart': BarChart3,
};

const suffixMap: Record<string, string> = {
  'OVERALL RATING': ' /5',
};

export default function KpiCard({ data }: { data: KpiData }) {
  const Icon = iconMap[data.icon] || Star;
  const suffix = suffixMap[data.label] || '';

  return (
    <div className="bg-surface rounded-xl shadow-sm border border-border p-6 flex flex-col">
      <div className="flex items-start justify-between mb-5">
        <div className="w-10 h-10 rounded-lg bg-background flex items-center justify-center text-navy">
          <Icon size={20} />
        </div>
        <span className="text-[11px] font-semibold text-success bg-badge-green rounded-full px-2.5 py-1">
          {data.change}
        </span>
      </div>
      <p className="text-sm text-text-secondary mb-1">
        {data.label.charAt(0) + data.label.slice(1).toLowerCase()}
      </p>
      <p className="text-[32px] font-bold text-navy leading-tight">
        {data.value}
        {suffix && <span className="text-lg font-normal text-text-secondary">{suffix}</span>}
      </p>
    </div>
  );
}
