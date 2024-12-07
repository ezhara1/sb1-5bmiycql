import React from 'react';
import { LineChartComponent } from './charts/LineChartComponent';
import { ScatterChartComponent } from './charts/ScatterChartComponent';
import { CandlestickChartComponent } from './charts/CandlestickChartComponent';
import { ChartType, ChartData } from '../types/market';

interface StockChartProps {
  data: ChartData[];
  type: ChartType;
}

export const StockChart: React.FC<StockChartProps> = ({ data, type }) => {
  const chartComponents = {
    line: LineChartComponent,
    scatter: ScatterChartComponent,
    candlestick: CandlestickChartComponent
  };

  const ChartComponent = chartComponents[type];

  if (!ChartComponent) {
    console.error(`Unsupported chart type: ${type}`);
    return null;
  }

  return <ChartComponent data={data} />;
};