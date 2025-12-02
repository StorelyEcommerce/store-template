import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { adminApi, Store } from '../api/client';

interface StoreContextType {
  stores: Store[];
  selectedStore: Store | null;
  isLoading: boolean;
  error: string | null;
  selectStore: (storeId: string) => void;
  refreshStores: () => Promise<void>;
}

const StoreContext = createContext<StoreContextType | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [stores, setStores] = useState<Store[]>([]);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshStores = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await adminApi.getStores();
      setStores(data);
      
      // Auto-select first store if none selected
      if (!selectedStore && data.length > 0) {
        setSelectedStore(data[0]);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load stores');
      console.error('Failed to load stores:', err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedStore]);

  useEffect(() => {
    refreshStores();
  }, []);

  const selectStore = (storeId: string) => {
    const store = stores.find(s => s.id === storeId);
    if (store) {
      setSelectedStore(store);
    }
  };

  return (
    <StoreContext.Provider
      value={{
        stores,
        selectedStore,
        isLoading,
        error,
        selectStore,
        refreshStores,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}

