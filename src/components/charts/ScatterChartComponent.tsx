import React from 'react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { ChartData } from '../../types/market';

interface ScatterChartComponentProps {
  data: ChartData[];
}

export const ScatterChartComponent: React.FC<ScatterChartComponentProps> = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height={400}>
      <ScatterChart>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="x"
          type="number"
          name="index"
          tick={{ fontSize: 12 }}
          label={{ value: 'Trading Day', position: 'bottom' }}
          interval="preserveStartEnd"
        />
        <YAxis
          dataKey="y"
          type="number"
          name="price"
          tick={{ fontSize: 12 }}
          label={{ value: 'Price ($)', angle: -90, position: 'left' }}
          domain={['auto', 'auto']}
        />
        <Tooltip
          contentStyle={{ backgroundColor: 'white', border: '1px solid #ccc' }}
        />
        <Scatter
          name="Stock Price"
          data={data}
          fill="#2563eb"
          line={{ stroke: '#2563eb', strokeWidth: 1 }}
        />
      </ScatterChart>
    </ResponsiveContainer>
  );
};