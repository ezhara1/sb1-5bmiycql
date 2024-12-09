import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getExpirationDates, getStrikes, getOptionQuote } from '../services/api';
import { format } from 'date-fns';

interface OptionsChainProps {
  symbol: string;
}

export const OptionsChain: React.FC<OptionsChainProps> = ({ symbol }) => {
  const [selectedExpiration, setSelectedExpiration] = useState<string>('');
  const [selectedStrike, setSelectedStrike] = useState<number | null>(null);
  const [optionType, setOptionType] = useState<'C' | 'P'>('C');

  // Fetch expiration dates
  const { data: expirations, isLoading: isLoadingExpirations } = useQuery({
    queryKey: ['expirations', symbol],
    queryFn: () => getExpirationDates(symbol),
    enabled: !!symbol,
  });

  // Fetch strikes when expiration is selected
  const { data: strikes, isLoading: isLoadingStrikes } = useQuery({
    queryKey: ['strikes', symbol, selectedExpiration],
    queryFn: () => getStrikes(symbol, selectedExpiration),
    enabled: !!symbol && !!selectedExpiration,
  });

  // Fetch option quote when strike is selected
  const { data: quote, isLoading: isLoadingQuote } = useQuery({
    queryKey: ['quote', symbol, selectedExpiration, selectedStrike, optionType],
    queryFn: () => {
      const today = format(new Date(), 'yyyyMMdd');
      return getOptionQuote(symbol, selectedExpiration, selectedStrike!, optionType, today);
    },
    enabled: !!symbol && !!selectedExpiration && !!selectedStrike,
  });

  // Set initial expiration when data loads
  useEffect(() => {
    if (expirations?.length && !selectedExpiration) {
      setSelectedExpiration(expirations[0]);
    }
  }, [expirations]);

  const formatDate = (dateStr: string) => {
    const year = dateStr.slice(0, 4);
    const month = dateStr.slice(4, 6);
    const day = dateStr.slice(6, 8);
    return `${year}-${month}-${day}`;
  };

  const formatStrike = (strike: number) => {
    return (strike / 1000).toFixed(2);
  };

  return (
    <div className="p-4">
      <div className="mb-4">
        <h2 className="text-xl font-bold mb-2">Options Chain for {symbol}</h2>
        
        {/* Option Type Selection */}
        <div className="mb-4">
          <label className="mr-4">
            <input
              type="radio"
              value="C"
              checked={optionType === 'C'}
              onChange={(e) => setOptionType(e.target.value as 'C' | 'P')}
              className="mr-2"
            />
            Calls
          </label>
          <label>
            <input
              type="radio"
              value="P"
              checked={optionType === 'P'}
              onChange={(e) => setOptionType(e.target.value as 'C' | 'P')}
              className="mr-2"
            />
            Puts
          </label>
        </div>

        {/* Expiration Selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Expiration Date:</label>
          <select
            value={selectedExpiration}
            onChange={(e) => {
              setSelectedExpiration(e.target.value);
              setSelectedStrike(null);
            }}
            className="w-48 p-2 border rounded"
            disabled={isLoadingExpirations}
          >
            {expirations?.map((exp) => (
              <option key={exp} value={exp}>
                {formatDate(exp)}
              </option>
            ))}
          </select>
        </div>

        {/* Strike Selection */}
        {selectedExpiration && (
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Strike Price:</label>
            <select
              value={selectedStrike || ''}
              onChange={(e) => setSelectedStrike(Number(e.target.value))}
              className="w-48 p-2 border rounded"
              disabled={isLoadingStrikes}
            >
              <option value="">Select Strike</option>
              {strikes?.map((strike) => (
                <option key={strike} value={strike}>
                  ${formatStrike(strike)}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Quote Display */}
      {quote && quote.length > 0 && (
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-bold mb-2">Option Quote</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p>Price: ${quote[0].price.toFixed(2)}</p>
              <p>Volume: {quote[0].volume}</p>
              <p>Open Interest: {quote[0].open_interest}</p>
            </div>
            <div>
              <p>Bid: ${quote[0].bid_price.toFixed(2)} x {quote[0].bid_size}</p>
              <p>Ask: ${quote[0].ask_price.toFixed(2)} x {quote[0].ask_size}</p>
              <p>Last Update: {quote[0].time}</p>
            </div>
          </div>
        </div>
      )}

      {/* Loading States */}
      {(isLoadingExpirations || isLoadingStrikes || isLoadingQuote) && (
        <div className="text-gray-500">Loading...</div>
      )}
    </div>
  );
};

export default OptionsChain;
