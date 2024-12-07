import { useQuery } from 'react-query';
import { getStockQuote, getStockCandles } from '../services/api';

export const useStockData = (symbol: string) => {
  const quoteQuery = useQuery(
    ['quote', symbol],
    () => getStockQuote(symbol),
    {
      enabled: Boolean(symbol),
      retry: 1,
      staleTime: 30000,
      onError: (error) => {
        console.error('Quote Error:', error);
      }
    }
  );

  const candleQuery = useQuery(
    ['candles', symbol],
    () => {
      const now = Math.floor(Date.now() / 1000);
      const oneMonthAgo = now - 30 * 24 * 60 * 60;
      return getStockCandles(symbol, 'D', oneMonthAgo, now);
    },
    {
      enabled: Boolean(symbol),
      retry: 1,
      staleTime: 30000,
      onError: (error) => {
        console.error('Candle Error:', error);
      }
    }
  );

  return {
    quoteData: quoteQuery.data,
    candleData: candleQuery.data,
    isLoading: quoteQuery.isLoading || candleQuery.isLoading,
    error: quoteQuery.error || candleQuery.error
  };
};