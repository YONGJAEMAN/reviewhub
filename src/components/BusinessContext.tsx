'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface BusinessInfo {
  businessId: string;
  businessName: string;
  role: string;
  plan: string;
}

interface BusinessContextType {
  businesses: BusinessInfo[];
  activeBusiness: BusinessInfo | null;
  switchBusiness: (businessId: string) => void;
  refreshBusinesses: () => Promise<void>;
  loading: boolean;
}

const BusinessContext = createContext<BusinessContextType>({
  businesses: [],
  activeBusiness: null,
  switchBusiness: () => {},
  refreshBusinesses: async () => {},
  loading: true,
});

export function useBusinessContext() {
  return useContext(BusinessContext);
}

const STORAGE_KEY = 'reviewhub_active_business';

export default function BusinessProvider({ children }: { children: React.ReactNode }) {
  const [businesses, setBusinesses] = useState<BusinessInfo[]>([]);
  const [activeBusinessId, setActiveBusinessId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchBusinesses = useCallback(async () => {
    try {
      const res = await fetch('/api/businesses');
      const json = await res.json();
      if (json.data) {
        setBusinesses(json.data);
        const stored = localStorage.getItem(STORAGE_KEY);
        const valid = json.data.find((b: BusinessInfo) => b.businessId === stored);
        if (valid) {
          setActiveBusinessId(stored);
        } else if (json.data.length > 0) {
          setActiveBusinessId(json.data[0].businessId);
          localStorage.setItem(STORAGE_KEY, json.data[0].businessId);
        }
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBusinesses();
  }, [fetchBusinesses]);

  const switchBusiness = (businessId: string) => {
    setActiveBusinessId(businessId);
    localStorage.setItem(STORAGE_KEY, businessId);
  };

  const activeBusiness = businesses.find((b) => b.businessId === activeBusinessId) ?? null;

  return (
    <BusinessContext.Provider
      value={{
        businesses,
        activeBusiness,
        switchBusiness,
        refreshBusinesses: fetchBusinesses,
        loading,
      }}
    >
      {children}
    </BusinessContext.Provider>
  );
}
