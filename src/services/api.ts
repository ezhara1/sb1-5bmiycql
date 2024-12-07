import axios from 'axios';
import { StockQuoteResponse, StockCandleResponse } from '../types/market';

const FINNHUB_API_KEY = 'sandbox_c7qj8k2ad3ieqg5ig5t0';

const finnhubClient = axios.create({
  baseURL: 'https://finnhub.io/api/v1',
  params: {
    token: FINNHUB_API_KEY
  }
});

export const getStockQuote = async (symbol: string): Promise<StockQuoteResponse> => {
  if (!symbol) {
    throw new Error('Symbol is required');
  }

  try {
    const response = await finnhubClient.get('/quote', {
      params: { symbol: symbol.toUpperCase() }
    });

    const data = response.data;
    return {
      c: Number(data.c?.toFixed(2)) || 0,
      h: Number(data.h?.toFixed(2)) || 0,
      l: Number(data.l?.toFixed(2)) || 0,
      o: Number(data.o?.toFixed(2)) || 0,
      pc: Number(data.pc?.toFixed(2)) || 0,
      t: data.t || Math.floor(Date.now() / 1000)
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(`Failed to fetch stock quote: ${error.message}`);
    }
    throw new Error('Failed to fetch stock quote');
  }
};

export const getStockCandles = async (
  symbol: string,
  resolution = 'D',
  from: number,
  to: number
): Promise<StockCandleResponse> => {
  if (!symbol || !from || !to) {
    throw new Error('Symbol, from, and to dates are required');
  }

  try {
    const response = await finnhubClient.get('/stock/candle', {
      params: {
        symbol: symbol.toUpperCase(),
        resolution,
        from,
        to
      }
    });

    const data = response.data;
    if (data.s !== 'ok' || !Array.isArray(data.t)) {
      throw new Error('Invalid data received from API');
    }

    return {
      t: data.t.map(Number),
      c: data.c.map((price: number) => Number(price.toFixed(2))),
      h: data.h.map((price: number) => Number(price.toFixed(2))),
      l: data.l.map((price: number) => Number(price.toFixed(2))),
      o: data.o.map((price: number) => Number(price.toFixed(2))),
      v: data.v.map(Number),
      s: data.s
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(`Failed to fetch stock candles: ${error.message}`);
    }
    throw new Error('Failed to fetch stock candles');
  }
};