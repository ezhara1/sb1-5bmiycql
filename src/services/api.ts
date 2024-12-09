import axios from 'axios';
import { StockQuoteResponse, StockCandleResponse } from '../types/market';
import { format, subDays } from 'date-fns';

const CORS_PROXY = 'https://corsproxy.io/?';
const BASE_URL = 'https://query1.finance.yahoo.com/v7/finance';
const THETA_DATA_URL = 'http://127.0.0.1:25510/v2';

const createProxiedUrl = (url: string) => `${CORS_PROXY}${encodeURIComponent(url)}`;

// Helper function to format strike price (e.g., 170.00 -> 170000)
const formatStrikePrice = (strike: number) => Math.round(strike * 1000);

// Helper function to get today's date in YYYYMMDD format
const formatDate = (date: Date) => format(date, 'yyyyMMdd');

export interface OptionsChainResponse {
  root: string;
  exp: string;
  strike: number;
  right: string;
  date: string;
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  open_interest: number;
}

export interface OptionsResponse {
  strikes: number[];
  expirations: string[];
  options: OptionData[];
}

interface OptionData {
  strike: number;
  expiration: string;
  lastPrice: number;
  volume: number;
  openInterest: number;
}

export const getStockQuote = async (symbol: string): Promise<StockQuoteResponse> => {
  if (!symbol) {
    throw new Error('Symbol is required');
  }

  try {
    const url = `${BASE_URL}/chart/${symbol.toUpperCase()}?range=1d&interval=1d&includePrePost=false`;
    const response = await axios.get(createProxiedUrl(url));

    const quote = response.data.chart.result[0].meta;
    const indicators = response.data.chart.result[0].indicators.quote[0];
    
    return {
      c: Number(quote.regularMarketPrice?.toFixed(2)) || 0,
      h: Number(indicators.high[0]?.toFixed(2)) || 0,
      l: Number(indicators.low[0]?.toFixed(2)) || 0,
      o: Number(indicators.open[0]?.toFixed(2)) || 0,
      pc: Number(quote.previousClose?.toFixed(2)) || 0,
      t: Math.floor(Date.now() / 1000)
    };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to fetch stock quote: ${error.message}`);
    }
    throw new Error('Failed to fetch stock quote');
  }
};

export const getStockCandles = async (
  symbol: string,
  resolution = 'Daily',
  from: number,
  to: number
): Promise<StockCandleResponse> => {
  if (!symbol) {
    throw new Error('Symbol is required');
  }

  try {
    const url = `${BASE_URL}/chart/${symbol.toUpperCase()}?period1=${from}&period2=${to}&interval=1d&includePrePost=false`;
    const response = await axios.get(createProxiedUrl(url));

    const result = response.data.chart.result[0];
    const quotes = result.indicators.quote[0];
    
    return {
      c: quotes.close.map((price: number) => Number(price?.toFixed(2)) || 0),
      h: quotes.high.map((price: number) => Number(price?.toFixed(2)) || 0),
      l: quotes.low.map((price: number) => Number(price?.toFixed(2)) || 0),
      o: quotes.open.map((price: number) => Number(price?.toFixed(2)) || 0),
      t: result.timestamp,
      v: quotes.volume,
      s: 'ok'
    };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to fetch stock candles: ${error.message}`);
    }
    throw new Error('Failed to fetch stock candles');
  }
};

export const getOptionsData = async (
  symbol: string,
  type: 'call' | 'put',
  expiration?: string
): Promise<OptionsResponse> => {
  if (!symbol) {
    throw new Error('Symbol is required');
  }

  try {
    // First, get available expirations for the symbol
    const expUrl = `${THETA_DATA_URL}/hist/option/exp?root=${symbol.toUpperCase()}`;
    const expResponse = await axios.get(expUrl);
    
    if (!expResponse.data || !Array.isArray(expResponse.data)) {
      throw new Error('No options data available for this symbol');
    }

    // Format expiration dates
    const expirations = expResponse.data.map((exp: string) => 
      format(new Date(exp.slice(0, 4) + '-' + exp.slice(4, 6) + '-' + exp.slice(6)), 'yyyy-MM-dd')
    ).sort();

    // If no expiration specified, use the first available one
    const targetExpiration = expiration || expirations[0];
    const formattedExpiration = targetExpiration.replace(/-/g, '');

    // Get available strikes for this expiration
    const strikesUrl = `${THETA_DATA_URL}/hist/option/strike?root=${symbol.toUpperCase()}&exp=${formattedExpiration}`;
    const strikesResponse = await axios.get(strikesUrl);

    if (!strikesResponse.data || !Array.isArray(strikesResponse.data)) {
      throw new Error('No strike prices available for this expiration');
    }

    // Format strikes (convert from internal format e.g., 170000 -> 170.00)
    const strikes = strikesResponse.data.map((strike: number) => strike / 1000).sort((a, b) => a - b);

    // Get today's date and yesterday's date in YYYYMMDD format
    const today = new Date();
    const todayFormatted = formatDate(today);
    const yesterdayFormatted = formatDate(subDays(today, 1));

    // Fetch options data for each strike
    const optionsPromises = strikes.map(strike => {
      const optionUrl = `${THETA_DATA_URL}/hist/option/eod?root=${symbol.toUpperCase()}&exp=${formattedExpiration}&strike=${formatStrikePrice(strike)}&right=${type === 'call' ? 'C' : 'P'}&start_date=${yesterdayFormatted}&end_date=${todayFormatted}`;
      return axios.get(optionUrl);
    });

    const optionsResponses = await Promise.all(optionsPromises);
    
    // Transform the data into our format
    const options = optionsResponses.map((response, index) => {
      const data = response.data[0] as OptionsChainResponse;
      return {
        strike: strikes[index],
        expiration: targetExpiration,
        lastPrice: data?.close || 0,
        volume: data?.volume || 0,
        openInterest: data?.open_interest || 0
      };
    });

    return {
      strikes,
      expirations,
      options
    };
  } catch (error) {
    console.error('Options API Error:', error);
    if (error instanceof Error) {
      throw new Error(`Failed to fetch options data: ${error.message}`);
    }
    throw new Error('Failed to fetch options data');
  }
};