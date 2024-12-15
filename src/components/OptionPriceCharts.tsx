import React, { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { ChevronDown } from 'lucide-react';
import { format } from 'date-fns';

interface OptionPriceHistory {
  lastPrice: number;
  volume: number;
  openInterest: number;
  date: string;
  open: number;
  high: number;
  low: number;
}

interface OptionPrice {
  current: {
    lastPrice: number;
    volume: number;
    openInterest: number;
  };
  history: OptionPriceHistory[];
}

interface OptionPriceChartsProps {
  data: OptionPrice;
}

export const OptionPriceCharts: React.FC<OptionPriceChartsProps> = ({ data }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const chartData = data.history.map((item) => ({
    date: format(new Date(item.date.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3')), 'MM/dd/yyyy'),
    lastPrice: item.lastPrice,
  }));

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between text-lg font-semibold mb-4 hover:text-indigo-600 transition-colors"
      >
        <span>Option Price History</span>
        <ChevronDown 
          className={`transform transition-transform duration-200 ${
            isExpanded ? 'rotate-180' : ''
          }`}
          size={20}
        />
      </button>
      
      {isExpanded && (
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="lastPrice"
                stroke="#4f46e5"
                strokeWidth={2}
                dot={{ fill: '#4f46e5' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};
