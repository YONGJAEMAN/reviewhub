import { Clock, TrendingDown } from 'lucide-react';

export default function ResponseTimeCard() {
  return (
    <div className="bg-navy rounded-xl p-6 text-white flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <Clock size={20} className="text-white/70" />
        <span className="text-[10px] font-semibold uppercase tracking-wider text-white/60">
          Real-Time
        </span>
      </div>
      <p className="text-sm text-white/70 mb-1">Avg Response Time</p>
      <p className="text-5xl font-bold mb-3">1.4h</p>
      <div className="flex items-center gap-1.5 text-sm text-badge-green mb-4">
        <TrendingDown size={14} />
        12% faster than last month
      </div>
      <div className="bg-surface/10 rounded-lg p-3 mt-auto">
        <p className="text-xs text-white/80 leading-relaxed">
          Your team is most active between 10 AM and 2 PM. Responding within 2 hours increases
          customer retention by 24%.
        </p>
      </div>
    </div>
  );
}
