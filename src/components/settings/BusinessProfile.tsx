'use client';

import { useState, useEffect } from 'react';

export default function BusinessProfile() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/settings/profile')
      .then((res) => res.json())
      .then((json) => {
        setName(json.data.name);
        setEmail(json.data.email);
        setDescription(json.data.description);
      })
      .catch(console.error);
  }, []);

  const handleSave = () => {
    setSaving(true);
    fetch('/api/settings/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, description }),
    })
      .catch(console.error)
      .finally(() => setSaving(false));
  };

  return (
    <div className="bg-surface rounded-xl shadow-sm border border-border p-6">
      <h2 className="text-xl font-semibold text-text-primary mb-6">Business Profile</h2>

      <div className="grid grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-[12px] font-medium uppercase tracking-[0.05em] text-text-secondary mb-2">
            Business Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-surface text-text-primary border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent-blue"
          />
        </div>
        <div>
          <label className="block text-[12px] font-medium uppercase tracking-[0.05em] text-text-secondary mb-2">
            Contact Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-surface text-text-primary border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent-blue"
          />
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-[12px] font-medium uppercase tracking-[0.05em] text-text-secondary mb-2">
          Business Description
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full bg-surface text-text-primary border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent-blue resize-none"
        />
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-navy text-white rounded-lg px-6 py-2.5 text-sm font-medium hover:bg-navy-dark transition-colors disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Profile Changes'}
        </button>
      </div>
    </div>
  );
}
