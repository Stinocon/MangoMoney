import { useState, useCallback } from 'react';

interface LoadingState {
  [key: string]: boolean;
}

export const useLoadingStates = () => {
  const [loadingStates, setLoadingStates] = useState<LoadingState>({});

  const setLoading = useCallback((key: string, loading: boolean) => {
    setLoadingStates(prev => ({ ...prev, [key]: loading }));
  }, []);

  const isLoading = useCallback((key: string) => {
    return loadingStates[key] || false;
  }, [loadingStates]);

  const withLoading = useCallback(<T extends any[]>(
    key: string,
    asyncFn: (...args: T) => Promise<any>
  ) => {
    return async (...args: T) => {
      setLoading(key, true);
      try {
        return await asyncFn(...args);
      } finally {
        setLoading(key, false);
      }
    };
  }, [setLoading]);

  return { isLoading, setLoading, withLoading, loadingStates };
};
