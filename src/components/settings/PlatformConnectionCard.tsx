import type { PlatformConnection } from '@/types';
import { platformConfig } from '@/lib/platformConfig';

export default function PlatformConnectionCard({ connection }: { connection: PlatformConnection }) {
  const icon = platformConfig[connection.platform];

  return (
    <div className="bg-surface rounded-xl shadow-sm border border-border p-6 flex flex-col items-center text-center">
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg mb-3"
        style={{ backgroundColor: icon.color }}
      >
        {icon.letter}
      </div>

      {connection.connected ? (
        <span className="rounded-full px-3 py-1 text-[10px] font-semibold uppercase bg-success text-white mb-3">
          Connected
        </span>
      ) : (
        <span className="rounded-full px-3 py-1 text-[10px] font-semibold uppercase bg-danger text-white mb-3">
          Disconnected
        </span>
      )}

      <h3 className="text-sm font-semibold text-text-primary mb-1">{connection.name}</h3>
      <p className="text-xs text-text-secondary mb-1">{connection.detail}</p>
      {connection.platform === 'yelp' && (
        <p className="text-[10px] text-text-secondary/60 mb-3">Free tier: 3 most recent reviews</p>
      )}
      {connection.platform !== 'yelp' && <div className="mb-3" />}

      {connection.connected ? (
        <button className="w-full border border-border rounded-lg px-4 py-2.5 text-sm font-medium text-text-primary hover:bg-background transition-colors">
          Manage
        </button>
      ) : (
        <button className="w-full bg-navy text-white rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-navy-dark transition-colors">
          Connect
        </button>
      )}
    </div>
  );
}
