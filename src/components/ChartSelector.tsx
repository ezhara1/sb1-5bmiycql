import React from 'react';
import { LineChart, ScatterChart, CandlestickChart } from 'lucide-react';
import { ChartType } from '../types/market';

interface ChartSelectorProps {
  activeChart: ChartType;
  onChartChange: (type: ChartType) => void;
}

export const ChartSelector: React.FC<ChartSelectorProps> = ({ activeChart, onChartChange }) => {
  return (
    <div className="flex gap-4 mb-4">
      <button
        onClick={() => onChartChange('line')}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
          activeChart === 'line'
            ? 'bg-blue-600 text-white'
            : 'bg-gray-100 hover:bg-gray-200'
        }`}
      >
        <LineChart size={20} />
        Line
      </button>
      <button
        onClick={() => onChartChange('scatter')}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
          activeChart === 'scatter'
            ? 'bg-blue-600 text-white'
            : 'bg-gray-100 hover:bg-gray-200'
        }`}
      >
        <ScatterChart size={20} />
        Scatter
      </button>
      <button
        onClick={() => onChartChange('candlestick')}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
          activeChart === 'candlestick'
            ? 'bg-blue-600 text-white'
            : 'bg-gray-100 hover:bg-gray-200'
        }`}
      >
        <CandlestickChart size={20} />
        Candlestick
      </button>
    </div>
  );
};