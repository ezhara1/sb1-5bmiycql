import { useQuery } from 'react-query';
import { getOptionsData } from '../services/api';

export const useOptionsData = (
  symbol: string,
  type: 'call' | 'put',
  expiration?: string
) => {
  const { data, isLoading, error } = useQuery(
    ['options', symbol, type, expiration],
    () => getOptionsData(symbol, type, expiration),
    {
      enabled: Boolean(symbol),
      retry: 1,
      staleTime: 30000,
      onError: (error) => {
        console.error('Options Error:', error);
      }
    }
  );

  return {
    optionsData: data,
    isLoading,
    error
  };
};
