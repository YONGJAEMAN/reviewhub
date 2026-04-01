'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Plus } from 'lucide-react';
import { useBusinessContext } from '@/components/BusinessContext';
import AddBusinessModal from './AddBusinessModal';

export default function BusinessSwitcher() {
  const { businesses, activeBusiness, switchBusiness } = useBusinessContext();
  const [open, setOpen] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  if (!activeBusiness) return null;

  return (
    <>
      <div ref={ref} className="relative px-3 mb-4">
        <button
          onClick={() => setOpen(!open)}
          className="w-full flex items-center justify-between px-3 py-2 rounded-lg border border-border bg-background hover:bg-surface text-sm transition-colors"
        >
          <span className="truncate font-medium text-text-primary">
            {activeBusiness.businessName}
          </span>
          <ChevronDown
            size={14}
            className={`text-text-secondary shrink-0 ml-2 transition-transform ${open ? 'rotate-180' : ''}`}
          />
        </button>

        {open && (
          <div className="absolute left-3 right-3 top-full mt-1 bg-surface rounded-lg border border-border shadow-lg z-50 overflow-hidden">
            {businesses.map((b) => (
              <button
                key={b.businessId}
                onClick={() => {
                  switchBusiness(b.businessId);
                  setOpen(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2.5 text-sm hover:bg-background transition-colors text-left"
              >
                <span className="flex-1 truncate text-text-primary">{b.businessName}</span>
                {b.businessId === activeBusiness.businessId && (
                  <Check size={14} className="text-accent-blue shrink-0" />
                )}
              </button>
            ))}
            <div className="border-t border-border">
              <button
                onClick={() => {
                  setOpen(false);
                  setShowAddModal(true);
                }}
                className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-accent-blue hover:bg-background transition-colors"
              >
                <Plus size={14} />
                Add New Business
              </button>
            </div>
          </div>
        )}
      </div>

      {showAddModal && (
        <AddBusinessModal onClose={() => setShowAddModal(false)} />
      )}
    </>
  );
}
