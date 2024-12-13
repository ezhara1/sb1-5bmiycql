import React from 'react';
import { useOptionsSelection } from '../hooks/useOptionsSelection';
import { format, subDays } from 'date-fns';

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

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Step 1: Expiration Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Step 1: Select Expiration Date
        </label>
        <select
          value={selectedExpiration || ''}
          onChange={(e) => selectExpiration(e.target.value || null)}
          className="mt-1 block w-full rounded-md border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
        >
          <option value="">Choose an expiration date</option>
          {console.log('Rendering expiration options:', expirations)}
          {expirations && expirations.length > 0 ? (
            expirations.map((exp) => (
              <option key={exp} value={exp}>
                {exp}
              </option>
            ))
          ) : (
            <option value="" disabled>No expiration dates available</option>
          )}
        </select>
      </div>

      {/* Step 2: Strike Selection (only shown after expiration is selected) */}
      {selectedExpiration && (
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Step 2: Select Strike Price
          </label>
          <select
            value={selectedStrike || ''}
            onChange={(e) => selectStrike(e.target.value ? Number(e.target.value) : null)}
            className="mt-1 block w-full rounded-md border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
          >
            <option value="">Choose a strike price</option>
            {strikes.map((strike) => (
              <option key={strike} value={strike}>
                ${strike.toFixed(2)}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Step 3: Option Type Selection (only shown after strike is selected) */}
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

      {/* Step 4: Date Range Selection (only shown after option type is selected) */}
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
                  const newEndDate = endDate || format(new Date('2024-12-12T23:22:42-08:00'), 'yyyy-MM-dd');
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
                  const newStartDate = startDate || format(subDays(new Date('2024-12-12T23:22:42-08:00'), 30), 'yyyy-MM-dd');
                  selectDates(newStartDate, e.target.value);
                }}
                className="mt-1 block w-full rounded-md border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
              />
            </div>
          </div>
        </div>
      )}

      {/* Option Price Display (only shown after all selections are made) */}
      {optionPrice ? (
        <div className="mt-4 p-4 bg-white shadow rounded-lg overflow-hidden">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Option Price Details</h3>
          
          {/* Current Price Summary */}
          <div className="mb-6 grid grid-cols-3 gap-4 bg-gray-50 p-4 rounded-md">
            <div>
              <p className="text-sm font-medium text-gray-500">Current Price</p>
              <p className="mt-1 text-lg font-semibold text-gray-900">
                ${optionPrice.current.lastPrice.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Volume</p>
              <p className="mt-1 text-lg font-semibold text-gray-900">
                {optionPrice.current.volume.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Open Interest</p>
              <p className="mt-1 text-lg font-semibold text-gray-900">
                {optionPrice.current.openInterest.toLocaleString()}
              </p>
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
                        {new Date(day.date.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3')).toLocaleDateString()}
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

          {/* Option Details */}
          <div className="mt-6 grid grid-cols-3 gap-4 bg-gray-50 p-4 rounded-md">
            <div>
              <p className="text-sm font-medium text-gray-500">Option Type</p>
              <p className="mt-1 text-sm text-gray-900">{selectedType?.toUpperCase()}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Strike Price</p>
              <p className="mt-1 text-sm text-gray-900">${selectedStrike?.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Expiration</p>
              <p className="mt-1 text-sm text-gray-900">{selectedExpiration}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-4 p-4 bg-gray-100 rounded-md">
          <p className="text-sm text-gray-500">
            Select all options above to view price details
          </p>
        </div>
      )}
    </div>
  );
};
