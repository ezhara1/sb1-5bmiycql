import React, { useState } from 'react';
import { useOptionsSelection } from '../hooks/useOptionsSelection';
import { format, subDays } from 'date-fns';
import { OptionPriceCharts } from './OptionPriceCharts';
import { ChevronDown } from 'lucide-react';

interface OptionsSelectorProps {
  symbol: string;
}

export const OptionsSelector: React.FC<OptionsSelectorProps> = ({ symbol }) => {
  console.log('OptionsSelector rendering with symbol:', symbol);
  
  const {
    selectedExpiration,
    selectedStrike,
    selectedType,
    expirations,
    strikes,
    optionPrice,
    isLoading,
    selectExpiration,
    selectStrike,
    selectType,
    selectDates,
    startDate,
    endDate
  } = useOptionsSelection(symbol);

  console.log('Current state:', {
    selectedExpiration,
    selectedStrike,
    selectedType,
    expirations,
    strikes,
    optionPrice,
    isLoading,
    startDate,
    endDate
  });

  const [isPriceExpanded, setIsPriceExpanded] = useState(false);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Step 1: Expiration Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Step 1: Select Expiration Date
        </label>
        <div className="flex flex-wrap gap-2">
          {expirations && expirations.length > 0 ? (
            expirations.map((exp) => (
              <button
                key={exp}
                onClick={() => selectExpiration(exp)}
                className={`px-3 py-2 text-sm rounded-md transition-colors ${
                  selectedExpiration === exp
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {format(new Date(exp), 'MMM d, yyyy')}
              </button>
            ))
          ) : (
            <div className="text-sm text-gray-500">No expiration dates available</div>
          )}
        </div>
      </div>

      {/* Step 2: Strike Selection */}
      {selectedExpiration && (
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Step 2: Select Strike Price
          </label>
          <div className="flex flex-wrap gap-2">
            {strikes.map((strike) => (
              <button
                key={strike}
                onClick={() => selectStrike(strike)}
                className={`px-3 py-2 text-sm rounded-md transition-colors ${
                  selectedStrike === strike
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                ${strike.toFixed(2)}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 3: Option Type Selection */}
      {selectedStrike && (
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Step 3: Select Option Type
          </label>
          <div className="mt-2 space-x-4">
            <button
              onClick={() => selectType('call')}
              className={`px-4 py-2 rounded-md ${
                selectedType === 'call'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              Call
            </button>
            <button
              onClick={() => selectType('put')}
              className={`px-4 py-2 rounded-md ${
                selectedType === 'put'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              Put
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Date Range Selection */}
      {selectedType && (
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Step 4: Select Date Range
          </label>
          <div className="mt-2 grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600">Start Date</label>
              <input
                type="date"
                value={startDate || ''}
                onChange={(e) => {
                  const newEndDate = endDate || format(new Date(), 'yyyy-MM-dd');
                  selectDates(e.target.value, newEndDate);
                }}
                className="mt-1 block w-full rounded-md border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600">End Date</label>
              <input
                type="date"
                value={endDate || ''}
                onChange={(e) => {
                  const newStartDate = startDate || format(subDays(new Date(), 30), 'yyyy-MM-dd');
                  selectDates(newStartDate, e.target.value);
                }}
                className="mt-1 block w-full rounded-md border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
              />
            </div>
          </div>
        </div>
      )}

      {/* Option Price Display */}
      {optionPrice && (
        <div className="mt-4 p-4 bg-white shadow rounded-lg overflow-hidden">
          <button
            onClick={() => setIsPriceExpanded(!isPriceExpanded)}
            className="w-full flex items-center justify-between text-lg font-medium text-gray-900 mb-4 hover:text-indigo-600 transition-colors"
          >
            <span>Option Price Details</span>
            <ChevronDown 
              className={`transform transition-transform duration-200 ${
                isPriceExpanded ? 'rotate-180' : ''
              }`}
              size={20}
            />
          </button>
          
          {isPriceExpanded && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-600">Last Price</p>
                  <p className="text-lg font-semibold">${optionPrice.current.lastPrice.toFixed(2)}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-600">Volume</p>
                  <p className="text-lg font-semibold">{optionPrice.current.volume.toLocaleString()}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-600">Open Interest</p>
                  <p className="text-lg font-semibold">{optionPrice.current.openInterest.toLocaleString()}</p>
                </div>
              </div>

              {/* Historical Data Table */}
              <div className="mt-6">
                <h4 className="text-md font-medium text-gray-900 mb-3">Price History</h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Open
                        </th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          High
                        </th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Low
                        </th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Close
                        </th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Volume
                        </th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Open Int.
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {optionPrice.history.map((day, index) => (
                        <tr key={day.date} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                            {format(new Date(day.date.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3')), 'MM/dd/yyyy')}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                            ${day.open.toFixed(2)}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                            ${day.high.toFixed(2)}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                            ${day.low.toFixed(2)}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                            ${day.lastPrice.toFixed(2)}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                            {day.volume.toLocaleString()}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                            {day.openInterest.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {optionPrice.history.length > 0 && (
                <p className="text-sm text-gray-500 mt-4">
                  Historical data available from{' '}
                  {format(new Date(optionPrice.history[0].date.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3')), 'MMM d, yyyy')}{' '}
                  to{' '}
                  {format(new Date(optionPrice.history[optionPrice.history.length - 1].date.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3')), 'MMM d, yyyy')}
                </p>
              )}
            </>
          )}
        </div>
      )}

      {/* Option Price Charts */}
      {optionPrice && (
        <div className="mt-8">
          <OptionPriceCharts data={optionPrice} />
        </div>
      )}
    </div>
  );
};
