import axios from 'axios';
import { StockQuoteResponse, StockCandleResponse } from '../types/market';
import { format, subDays } from 'date-fns';

// Single API instance for all requests
const api = axios.create({
  baseURL: 'http://localhost:3001',
  timeout: 10000,
});

// Log all requests in development
api.interceptors.request.use(request => {
  console.log('API Request:', {
    url: request.url,
    method: request.method,
    params: request.params,
    data: request.data
  });
  return request;
});

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

interface OptionPrice {
  lastPrice: number;
  volume: number;
  openInterest: number;
}

interface OptionPriceHistory {
  lastPrice: number;
  volume: number;
  openInterest: number;
  date: string;
  open: number;
  high: number;
  low: number;
}

export const getStockQuote = async (symbol: string): Promise<StockQuoteResponse> => {
  if (!symbol) {
    throw new Error('Symbol is required');
  }

  try {
    const response = await api.get(`/api/yahoo/v7/finance/chart/${symbol.toUpperCase()}`, {
      params: {
        range: '1d',
        interval: '1d',
        includePrePost: false
      }
    });

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
    const response = await api.get(`/api/yahoo/v7/finance/chart/${symbol.toUpperCase()}`, {
      params: {
        period1: from,
        period2: to,
        interval: '1d',
        includePrePost: false
      }
    });

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

// Get available expiration dates for a stock symbol
export const getExpirations = async (symbol: string): Promise<string[]> => {
  if (!symbol) {
    throw new Error('Symbol is required');
  }

  try {
    console.log('Fetching expirations for symbol:', symbol);
    const response = await api.get(`/api/thetadata/list/expirations`, {
      params: {
        root: symbol.toUpperCase(),
      }
    });
    console.log('Raw API Response for expirations:', JSON.stringify(response.data));
    
    // The API returns an array of dates directly
    const expirationDates = Array.isArray(response.data) ? response.data : [];
    console.log('Expiration dates from API:', expirationDates);

    // Ensure we have data
    if (expirationDates.length === 0) {
      console.log('No expiration dates returned from API');
      return [];
    }

    // The dates are already in YYYY-MM-DD format, so we can return them directly
    const formattedDates = expirationDates.sort();
    console.log('Final formatted dates:', formattedDates);
    return formattedDates;
  } catch (error) {
    console.error('Error fetching expirations:', error);
    if (axios.isAxiosError(error)) {
      console.error('Axios error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        config: error.config
      });
    }
    throw error;
  }
};

// Get available strikes for a stock symbol and expiration date
export const getStrikes = async (symbol: string, expiration: string): Promise<number[]> => {
  if (!symbol) {
    throw new Error('Symbol is required');
  }
  if (!expiration) {
    throw new Error('Expiration date is required');
  }

  try {
    console.log('Fetching strikes for symbol:', symbol, 'expiration:', expiration);
    
    // Convert YYYY-MM-DD to YYYYMMDD format
    const formattedExpiration = expiration.replace(/-/g, '');
    
    const response = await api.get(`/api/thetadata/list/strikes`, {
      params: {
        root: symbol.toUpperCase(),
        exp: formattedExpiration
      }
    });
    console.log('Raw API Response for strikes:', JSON.stringify(response.data));

    // The API returns an array of strike prices directly
    const strikes = Array.isArray(response.data) ? response.data : [];
    console.log('Strikes from API:', strikes);

    // Ensure we have data
    if (strikes.length === 0) {
      console.log('No strikes returned from API');
      return [];
    }

    // The strikes are already in the correct format, just sort them
    const formattedStrikes = strikes.sort((a, b) => a - b);
    console.log('Final formatted strikes:', formattedStrikes);
    return formattedStrikes;
  } catch (error) {
    console.error('Error fetching strikes:', error);
    if (axios.isAxiosError(error)) {
      console.error('Axios error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        config: error.config
      });
    }
    throw error;
  }
};

// Get option price for specific parameters
export async function getOptionPrice(
  root: string, 
  exp: string, 
  strike: number, 
  right: string, 
  start_date?: string, 
  end_date?: string
): Promise<{ current: OptionPrice; history: OptionPriceHistory[] }> {
  try {
    // Format dates by removing dashes if they exist
    const formattedExp = exp.replace(/-/g, '');
    
    // Convert strike to integer format (e.g., 170.00 -> 170000)
    const formattedStrike = Math.round(strike * 1000);

    // Format right to be 'C' or 'P'
    const formattedRight = right === 'call' ? 'C' : 'P';
    
    console.log('Sending request with params:', {
      root: root.toUpperCase(),
      exp: formattedExp,
      strike: formattedStrike,
      right: formattedRight,
      start_date: start_date?.replace(/-/g, ''),
      end_date: end_date?.replace(/-/g, '')
    });

    const response = await api.get(`/api/thetadata/hist/option/eod`, {
      params: {
        root: root.toUpperCase(),
        exp: formattedExp,
        strike: formattedStrike,
        right: formattedRight,
        start_date: start_date?.replace(/-/g, ''),
        end_date: end_date?.replace(/-/g, '')
      }
    });

    console.log('Raw API response:', response.data);

    // The response format is:
    // response.response = [[open, high, low, close, volume, open_interest, date], ...]
    const priceData = response.data.response;
    
    if (!Array.isArray(priceData) || priceData.length === 0) {
      console.error('No price data available in response');
      throw new Error('No price data available');
    }

    // Get the most recent data point (last array in the response)
    const mostRecent = priceData[priceData.length - 1];
    
    // Format based on the response format array:
    // [open, high, low, close, volume, open_interest, date]
    const [open, high, low, close, volume, openInterest, date] = mostRecent;

    // Transform all historical data
    const history = priceData.map(([open, high, low, close, volume, openInterest, date]) => ({
      open: Number(open) || 0,
      high: Number(high) || 0,
      low: Number(low) || 0,
      lastPrice: Number(close) || 0,
      volume: Number(volume) || 0,
      openInterest: Number(openInterest) || 0,
      date: String(date)
    }));

    // Current price data
    const current: OptionPrice = {
      lastPrice: Number(close) || 0,
      volume: Number(volume) || 0,
      openInterest: Number(openInterest) || 0
    };

    return { current, history };
  } catch (error) {
    console.error('Error fetching option price:', error);
    throw error;
  }
};

export const getOptionsData = async (
  symbol: string,
  type: 'call' | 'put',
  expiration?: string,
  customStartDate?: string,
  customEndDate?: string
): Promise<OptionsResponse> => {
  if (!symbol) {
    throw new Error('Symbol is required');
  }

  try {
    console.log('Fetching options data for:', { symbol, type, expiration, customStartDate, customEndDate });
    
    // Get available expirations for the symbol
    const expirations = await getExpirations(symbol);

    // If no expiration specified, use the first available one
    const targetExpiration = expiration || expirations[0];

    // Get available strikes for this expiration
    const strikes = await getStrikes(symbol, targetExpiration);

    let formattedStartDate: string;
    let formattedEndDate: string;

    if (customStartDate && customEndDate) {
      // Use custom dates if provided
      formattedStartDate = format(new Date(customStartDate), 'yyyyMMdd');
      formattedEndDate = format(new Date(customEndDate), 'yyyyMMdd');
    } else {
      // Calculate default date range (1 year back from expiration)
      const expDate = new Date(targetExpiration);
      let startDate = new Date(expDate);
      startDate.setFullYear(startDate.getFullYear() - 1);
      
      // Ensure dates are within valid range
      const currentDate = new Date('2024-12-12T20:55:39-08:00'); // Using provided current time
      if (startDate > currentDate) {
        console.log('Start date is in the future, using current date');
        startDate = currentDate;
      }

      formattedStartDate = format(startDate, 'yyyyMMdd');
      formattedEndDate = format(expDate, 'yyyyMMdd');
    }

    console.log('Using date range:', { 
      formattedStartDate,
      formattedEndDate,
      customDates: !!customStartDate
    });

    // Fetch options data for each strike
    const optionsPromises = strikes.map(strike => {
      console.log('Making request with dates:', {
        formattedStartDate,
        formattedEndDate,
        strike,
        symbol: symbol.toUpperCase(),
        expiration: targetExpiration
      });
      
      return getOptionPrice(
        symbol.toUpperCase(), 
        targetExpiration.replace(/-/g, ''), 
        strike, 
        type.toLowerCase() === 'call' ? 'C' : 'P',
        formattedStartDate,
        formattedEndDate
      );
    });

    console.log('Fetching options data for each strike:', strikes);

    const optionsResponses = await Promise.all(optionsPromises);

    console.log('Received options data:', optionsResponses);

    return {
      strikes,
      expirations,
      options: optionsResponses.map(option => ({
        strike: option.current.lastPrice,
        expiration: targetExpiration,
        lastPrice: option.current.lastPrice,
        volume: option.current.volume,
        openInterest: option.current.openInterest
      }))
    };
  } catch (error) {
    console.error('Options API Error:', error);
    throw new Error(`Failed to fetch options data: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};