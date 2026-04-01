'use client';

import { useState, useEffect } from 'react';
import { Users, Clock, MessageSquare, Key } from 'lucide-react';

type Tab = 'users' | 'waitlist' | 'feedback' | 'codes';

const tabs: { key: Tab; label: string; icon: typeof Users }[] = [
  { key: 'users', label: 'Users', icon: Users },
  { key: 'waitlist', label: 'Waitlist', icon: Clock },
  { key: 'feedback', label: 'Feedback', icon: MessageSquare },
  { key: 'codes', label: 'Invite Codes', icon: Key },
];

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<Tab>('users');
  const [data, setData] = useState<Record<string, unknown[]>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const url = activeTab === 'codes' ? '/api/admin/invite-codes' : `/api/admin/${activeTab}`;
    fetch(url)
      .then((res) => res.json())
      .then((json) => setData((prev) => ({ ...prev, [activeTab]: json.data ?? [] })))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [activeTab]);

  const currentData = (data[activeTab] ?? []) as Record<string, unknown>[];

  const generateCode = async () => {
    const res = await fetch('/api/admin/invite-codes', { method: 'POST' });
    const json = await res.json();
    if (json.data) {
      setData((prev) => ({
        ...prev,
        codes: [json.data, ...(prev.codes ?? [])],
      }));
    }
  };

  const updateWaitlist = async (id: string, status: string) => {
    await fetch(`/api/admin/waitlist/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    setData((prev) => ({
      ...prev,
      waitlist: ((prev.waitlist ?? []) as Record<string, unknown>[]).map((w) =>
        w.id === id ? { ...w, status } : w
      ),
    }));
  };

  const updateFeedback = async (id: string, status: string) => {
    await fetch(`/api/admin/feedback/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    setData((prev) => ({
      ...prev,
      feedback: ((prev.feedback ?? []) as Record<string, unknown>[]).map((f) =>
        f.id === id ? { ...f, status } : f
      ),
    }));
  };

  return (
    <div>
      <h1 className="text-[28px] font-bold text-text-primary mb-6">Admin Dashboard</h1>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-background rounded-lg p-1 border border-border w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.key ? 'bg-surface text-navy shadow-sm' : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-32">
          <div className="w-6 h-6 border-2 border-accent-blue border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="bg-surface rounded-xl shadow-sm border border-border overflow-hidden">
          {/* Users */}
          {activeTab === 'users' && (
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-background">
                  <th className="text-left text-xs font-semibold text-text-secondary p-4 uppercase">Name</th>
                  <th className="text-left text-xs font-semibold text-text-secondary p-4 uppercase">Email</th>
                  <th className="text-left text-xs font-semibold text-text-secondary p-4 uppercase">Businesses</th>
                  <th className="text-left text-xs font-semibold text-text-secondary p-4 uppercase">Created</th>
                </tr>
              </thead>
              <tbody>
                {currentData.map((u) => (
                  <tr key={u.id as string} className="border-b border-border last:border-0">
                    <td className="p-4 text-sm text-text-primary font-medium">{(u.name as string) || '—'}</td>
                    <td className="p-4 text-sm text-text-secondary">{u.email as string}</td>
                    <td className="p-4 text-sm text-text-secondary">{(u._count as Record<string, number>)?.businesses ?? 0}</td>
                    <td className="p-4 text-sm text-text-secondary">{new Date(u.createdAt as string).toLocaleDateString()}</td>
                  </tr>
                ))}
                {currentData.length === 0 && (
                  <tr><td colSpan={4} className="p-8 text-center text-sm text-text-secondary">No users found</td></tr>
                )}
              </tbody>
            </table>
          )}

          {/* Waitlist */}
          {activeTab === 'waitlist' && (
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-background">
                  <th className="text-left text-xs font-semibold text-text-secondary p-4 uppercase">Email</th>
                  <th className="text-left text-xs font-semibold text-text-secondary p-4 uppercase">Name</th>
                  <th className="text-left text-xs font-semibold text-text-secondary p-4 uppercase">Company</th>
                  <th className="text-left text-xs font-semibold text-text-secondary p-4 uppercase">Status</th>
                  <th className="text-left text-xs font-semibold text-text-secondary p-4 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentData.map((w) => (
                  <tr key={w.id as string} className="border-b border-border last:border-0">
                    <td className="p-4 text-sm text-text-primary">{w.email as string}</td>
                    <td className="p-4 text-sm text-text-secondary">{(w.name as string) || '—'}</td>
                    <td className="p-4 text-sm text-text-secondary">{(w.company as string) || '—'}</td>
                    <td className="p-4">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        w.status === 'APPROVED' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'
                      }`}>{w.status as string}</span>
                    </td>
                    <td className="p-4">
                      {w.status === 'PENDING' && (
                        <button
                          onClick={() => updateWaitlist(w.id as string, 'APPROVED')}
                          className="text-xs font-medium text-accent-blue hover:underline"
                        >
                          Approve & Send Code
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {currentData.length === 0 && (
                  <tr><td colSpan={5} className="p-8 text-center text-sm text-text-secondary">No entries</td></tr>
                )}
              </tbody>
            </table>
          )}

          {/* Feedback */}
          {activeTab === 'feedback' && (
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-background">
                  <th className="text-left text-xs font-semibold text-text-secondary p-4 uppercase">Category</th>
                  <th className="text-left text-xs font-semibold text-text-secondary p-4 uppercase">Content</th>
                  <th className="text-left text-xs font-semibold text-text-secondary p-4 uppercase">Status</th>
                  <th className="text-left text-xs font-semibold text-text-secondary p-4 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentData.map((f) => (
                  <tr key={f.id as string} className="border-b border-border last:border-0">
                    <td className="p-4 text-sm text-text-primary font-medium capitalize">{f.category as string}</td>
                    <td className="p-4 text-sm text-text-secondary max-w-md truncate">{f.content as string}</td>
                    <td className="p-4">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        f.status === 'RESOLVED' ? 'bg-success/10 text-success' : f.status === 'REVIEWED' ? 'bg-accent-blue/10 text-accent-blue' : 'bg-warning/10 text-warning'
                      }`}>{f.status as string}</span>
                    </td>
                    <td className="p-4 space-x-2">
                      {f.status === 'NEW' && (
                        <button onClick={() => updateFeedback(f.id as string, 'REVIEWED')} className="text-xs text-accent-blue hover:underline">Mark Reviewed</button>
                      )}
                      {(f.status === 'NEW' || f.status === 'REVIEWED') && (
                        <button onClick={() => updateFeedback(f.id as string, 'RESOLVED')} className="text-xs text-success hover:underline">Resolve</button>
                      )}
                    </td>
                  </tr>
                ))}
                {currentData.length === 0 && (
                  <tr><td colSpan={4} className="p-8 text-center text-sm text-text-secondary">No feedback</td></tr>
                )}
              </tbody>
            </table>
          )}

          {/* Invite Codes */}
          {activeTab === 'codes' && (
            <div>
              <div className="p-4 border-b border-border">
                <button
                  onClick={generateCode}
                  className="bg-navy text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-navy-dark transition-colors"
                >
                  Generate New Code
                </button>
              </div>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-background">
                    <th className="text-left text-xs font-semibold text-text-secondary p-4 uppercase">Code</th>
                    <th className="text-left text-xs font-semibold text-text-secondary p-4 uppercase">Used</th>
                    <th className="text-left text-xs font-semibold text-text-secondary p-4 uppercase">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {currentData.map((c) => (
                    <tr key={c.id as string} className="border-b border-border last:border-0">
                      <td className="p-4 text-sm font-mono font-bold text-navy">{c.code as string}</td>
                      <td className="p-4 text-sm text-text-secondary">{c.useCount as number}/{c.maxUses as number}</td>
                      <td className="p-4 text-sm text-text-secondary">{new Date(c.createdAt as string).toLocaleDateString()}</td>
                    </tr>
                  ))}
                  {currentData.length === 0 && (
                    <tr><td colSpan={3} className="p-8 text-center text-sm text-text-secondary">No codes generated</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
