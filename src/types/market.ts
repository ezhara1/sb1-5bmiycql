export interface StockData {
  symbol: string;
  price: number;
  timestamp: number;
}

export interface ChartData {
  date: string;
  value: number;
}

export interface OptionData {
  strike: number;
  expiration: string;
  lastPrice: number;
  volume: number;
  openInterest: number;
}

export type ChartType = 'line' | 'scatter' | 'candlestick';

export interface StockQuoteResponse {
  c: number;    // Current price
  h: number;    // High price of the day
  l: number;    // Low price of the day
  o: number;    // Open price of the day
  pc: number;   // Previous close price
  t: number;    // Timestamp
}

export interface StockCandleResponse {
  c: number[];  // Close prices
  h: number[];  // High prices
  l: number[];  // Low prices
  o: number[];  // Open prices
  s: string;    // Status
  t: number[];  // Timestamps
  v: number[];  // Volumes
}