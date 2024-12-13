import { useState } from 'react';
import { useQuery } from 'react-query';
import { getExpirations, getStrikes, getOptionPrice } from '../services/api';

export interface OptionsSelectionState {
  selectedExpiration: string | null;
  selectedStrike: number | null;
  selectedType: 'call' | 'put' | null;
  startDate: string | null;
  endDate: string | null;
  expirations: string[];
  strikes: number[];
  optionPrice: {
    lastPrice: number;
    volume: number;
    openInterest: number;
  } | null;
}

export const useOptionsSelection = (symbol: string) => {
  console.log('useOptionsSelection called with symbol:', symbol);
  
  const [state, setState] = useState<OptionsSelectionState>({
    selectedExpiration: null,
    selectedStrike: null,
    selectedType: null,
    startDate: null,
    endDate: null,
    expirations: [],
    strikes: [],
    optionPrice: null,
  });

  // Query for expirations
  const { isLoading: isLoadingExpirations } = useQuery(
    ['expirations', symbol],
    () => getExpirations(symbol),
    {
      enabled: Boolean(symbol),
      onSuccess: (data) => {
        console.log('Expirations fetched successfully:', data);
        setState(prev => {
          console.log('Updating state with expirations:', data);
          return {
            ...prev,
            expirations: data,
            // Reset other selections when expirations change
            selectedExpiration: null,
            selectedStrike: null,
            selectedType: null,
            strikes: [],
            optionPrice: null
          };
        });
      },
      onError: (error) => {
        console.error('Error fetching expirations:', error);
      }
    }
  );

  // Query for strikes only when expiration is selected
  const { isLoading: isLoadingStrikes } = useQuery(
    ['strikes', symbol, state.selectedExpiration],
    () => getStrikes(symbol, state.selectedExpiration!),
    {
      enabled: Boolean(symbol && state.selectedExpiration),
      onSuccess: (data) => {
        console.log('Strikes fetched successfully:', data);
        setState(prev => ({
          ...prev,
          strikes: data,
          // Reset strike and type when strikes change
          selectedStrike: null,
          selectedType: null,
          optionPrice: null
        }));
      },
      onError: (error) => {
        console.error('Error fetching strikes:', error);
      }
    }
  );

  // Query for option price only when all parameters are selected
  const { isLoading: isLoadingPrice } = useQuery(
    ['optionPrice', symbol, state.selectedExpiration, state.selectedStrike, state.selectedType, state.startDate, state.endDate],
    async () => {
      console.log('Fetching option price with params:', {
        symbol,
        expiration: state.selectedExpiration,
        strike: state.selectedStrike,
        type: state.selectedType,
        startDate: state.startDate,
        endDate: state.endDate
      });
      
      const result = await getOptionPrice(
        symbol,
        state.selectedExpiration!,
        state.selectedStrike!,
        state.selectedType!,
        state.startDate || undefined,
        state.endDate || undefined
      );
      
      console.log('Option price result:', result);
      return result;
    },
    {
      enabled: Boolean(
        symbol &&
        state.selectedExpiration &&
        state.selectedStrike &&
        state.selectedType &&
        state.startDate &&
        state.endDate
      ),
      onSuccess: (data) => {
        console.log('Setting option price in state:', data);
        setState(prev => ({ ...prev, optionPrice: data }));
      },
      onError: (error) => {
        console.error('Error fetching option price:', error);
        setState(prev => ({ ...prev, optionPrice: null }));
      }
    }
  );

  const selectExpiration = (expiration: string | null) => {
    console.log('Selecting expiration:', expiration);
    setState(prev => ({
      ...prev,
      selectedExpiration: expiration,
      selectedStrike: null,
      selectedType: null,
      strikes: [],
      optionPrice: null
    }));
  };

  const selectStrike = (strike: number | null) => {
    console.log('Selecting strike:', strike);
    setState(prev => ({
      ...prev,
      selectedStrike: strike,
      selectedType: null,
      optionPrice: null
    }));
  };

  const selectType = (type: 'call' | 'put' | null) => {
    console.log('Selecting type:', type);
    setState(prev => ({
      ...prev,
      selectedType: type,
      optionPrice: null
    }));
  };

  const selectDates = (startDate: string | null, endDate: string | null) => {
    console.log('Selecting dates:', { startDate, endDate });
    setState(prev => ({
      ...prev,
      startDate,
      endDate,
      optionPrice: null
    }));
  };

  console.log('Current options selection state:', state);

  return {
    ...state,
    isLoading: isLoadingExpirations || isLoadingStrikes || isLoadingPrice,
    selectExpiration,
    selectStrike,
    selectType,
    selectDates,
    startDate: state.startDate,
    endDate: state.endDate
  };
};
