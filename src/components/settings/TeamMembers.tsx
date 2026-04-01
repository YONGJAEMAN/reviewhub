'use client';

import { useState, useEffect } from 'react';
import { Users, Plus, Trash2 } from 'lucide-react';
import { useBusinessContext } from '@/components/BusinessContext';

interface Member {
  userId: string;
  name: string | null;
  email: string;
  role: string;
  joinedAt: string;
}

const roleBadge: Record<string, string> = {
  OWNER: 'bg-navy/10 text-navy',
  ADMIN: 'bg-accent-blue/10 text-accent-blue',
  VIEWER: 'bg-steel/10 text-steel',
};

export default function TeamMembers() {
  const { activeBusiness } = useBusinessContext();
  const bid = activeBusiness?.businessId;
  const isOwner = activeBusiness?.role === 'OWNER';

  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('VIEWER');
  const [inviting, setInviting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!bid) return;
    fetch(`/api/businesses/${bid}/members`)
      .then((r) => r.json())
      .then((j) => { if (j.data) setMembers(j.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [bid]);

  const handleInvite = async () => {
    if (!inviteEmail.trim() || !bid) return;
    setInviting(true);
    setError('');
    try {
      const res = await fetch(`/api/businesses/${bid}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail.trim(), role: inviteRole }),
      });
      const json = await res.json();
      if (!res.ok) { setError(json.error); return; }
      setMembers((prev) => [...prev, { ...json.data, name: null, joinedAt: new Date().toISOString() }]);
      setInviteEmail('');
      setShowInvite(false);
    } catch {
      setError('Failed to invite');
    } finally {
      setInviting(false);
    }
  };

  const handleRemove = async (userId: string) => {
    if (!bid) return;
    await fetch(`/api/businesses/${bid}/members`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
    setMembers((prev) => prev.filter((m) => m.userId !== userId));
  };

  const handleRoleChange = async (userId: string, role: string) => {
    if (!bid) return;
    await fetch(`/api/businesses/${bid}/members`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, role }),
    });
    setMembers((prev) => prev.map((m) => m.userId === userId ? { ...m, role } : m));
  };

  if (loading) return null;

  return (
    <div className="bg-surface rounded-xl shadow-sm border border-border p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Users size={18} className="text-navy" />
          <h3 className="text-base font-semibold text-text-primary">Team Members</h3>
          <span className="text-xs text-text-secondary">({members.length})</span>
        </div>
        {isOwner && (
          <button
            onClick={() => setShowInvite(!showInvite)}
            className="flex items-center gap-1 text-sm text-accent-blue hover:underline"
          >
            <Plus size={14} />
            Invite
          </button>
        )}
      </div>

      {showInvite && (
        <div className="mb-4 p-3 bg-background rounded-lg space-y-2">
          {error && <p className="text-xs text-red-600">{error}</p>}
          <input
            type="email"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            placeholder="member@email.com"
            className="w-full px-3 py-2 border border-border rounded-lg bg-surface text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-blue"
          />
          <div className="flex gap-2">
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value)}
              className="flex-1 px-3 py-2 border border-border rounded-lg bg-surface text-sm text-text-primary"
            >
              <option value="VIEWER">Viewer</option>
              <option value="ADMIN">Admin</option>
            </select>
            <button
              onClick={handleInvite}
              disabled={inviting}
              className="px-4 py-2 bg-navy text-surface rounded-lg text-sm font-medium hover:bg-navy-dark disabled:opacity-50"
            >
              {inviting ? 'Adding...' : 'Add'}
            </button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {members.map((m) => (
          <div key={m.userId} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
            <div className="w-8 h-8 rounded-full bg-steel text-white flex items-center justify-center text-xs font-bold shrink-0">
              {(m.name || m.email)[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-text-primary truncate">{m.name || m.email}</p>
              <p className="text-xs text-text-secondary truncate">{m.email}</p>
            </div>
            {isOwner && m.role !== 'OWNER' ? (
              <select
                value={m.role}
                onChange={(e) => handleRoleChange(m.userId, e.target.value)}
                className="text-xs px-2 py-1 rounded border border-border bg-background text-text-primary"
              >
                <option value="ADMIN">Admin</option>
                <option value="VIEWER">Viewer</option>
              </select>
            ) : (
              <span className={`text-xs px-2 py-1 rounded font-medium ${roleBadge[m.role] ?? roleBadge.VIEWER}`}>
                {m.role}
              </span>
            )}
            {isOwner && m.role !== 'OWNER' && (
              <button
                onClick={() => handleRemove(m.userId)}
                className="p-1 text-text-secondary hover:text-red-600 transition-colors"
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
