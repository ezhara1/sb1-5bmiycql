import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { useOptionsData } from '../hooks/useOptionsData';

interface OptionsChartProps {
  symbol: string;
}

export const OptionsChart: React.FC<OptionsChartProps> = ({ symbol }) => {
  const [optionType, setOptionType] = useState<'call' | 'put'>('call');
  const [selectedExpiry, setSelectedExpiry] = useState<string>();

  const { optionsData, isLoading, error } = useOptionsData(
    symbol,
    optionType,
    selectedExpiry
  );

  if (!symbol) return null;
  if (error) return <div className="text-red-600">Error loading options data</div>;
  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading options data...</p>
      </div>
    );
  }

  const chartData = optionsData?.options.map(opt => ({
    strike: opt.strike,
    price: opt.lastPrice,
    volume: opt.volume,
    openInterest: opt.openInterest
  }));

  return (
    <div className="mt-8">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold">Options Chain</h3>
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Type:</label>
            <select
              value={optionType}
              onChange={(e) => setOptionType(e.target.value as 'call' | 'put')}
              className="px-3 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="call">Call</option>
              <option value="put">Put</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Expiry:</label>
            <select
              value={selectedExpiry}
              onChange={(e) => setSelectedExpiry(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {optionsData?.expirations.map(exp => (
                <option key={exp} value={exp}>{exp}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="strike"
              label={{ value: 'Strike Price ($)', position: 'bottom' }}
            />
            <YAxis 
              yAxisId="left"
              label={{ value: 'Option Price ($)', angle: -90, position: 'left' }}
            />
            <YAxis 
              yAxisId="right"
              orientation="right"
              label={{ value: 'Volume / Open Interest', angle: 90, position: 'right' }}
            />
            <Tooltip 
              formatter={(value: number, name: string) => [
                `$${value.toFixed(2)}`,
                name.split(/(?=[A-Z])/).join(' ')
              ]}
            />
            <Legend />
            <Bar yAxisId="left" dataKey="price" fill="#2563eb" name="Option Price" />
            <Bar yAxisId="right" dataKey="volume" fill="#16a34a" name="Volume" />
            <Bar yAxisId="right" dataKey="openInterest" fill="#dc2626" name="Open Interest" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
