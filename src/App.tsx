import React, { useState } from 'react';
import { format } from 'date-fns';
import { ChartSelector } from './components/ChartSelector';
import { StockChart } from './components/StockChart';
import { OptionsChart } from './components/OptionsChart';
import { SearchForm } from './components/SearchForm';
import { useStockData } from './hooks/useStockData';
import { ChartType } from './types/market';
import { LineChart } from 'lucide-react';

function App() {
  const [symbol, setSymbol] = useState('');
  const [chartType, setChartType] = useState<ChartType>('line');
  const { quoteData, candleData, isLoading, error } = useStockData(symbol);

  const handleSearch = (newSymbol: string) => {
    setSymbol(newSymbol.toUpperCase());
  };

  const chartData = React.useMemo(() => {
    if (!candleData?.t) return [];
    return candleData.t.map((timestamp: number, index: number) => ({
      date: format(new Date(timestamp * 1000), 'MM/dd/yyyy'),
      value: candleData.c[index] || 0,
      x: index,
      y: candleData.c[index] || 0
    }));
  }, [candleData]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <LineChart size={32} className="text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">
            Financial Analysis Dashboard
          </h1>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <SearchForm onSubmit={handleSearch} />

          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
              {error instanceof Error ? error.message : 'An error occurred while fetching data'}
            </div>
          )}

          {symbol && isLoading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading data...</p>
            </div>
          )}

          {symbol && quoteData && (
            <div className="mb-6">
              <h2 className="text-2xl font-semibold mb-4">{symbol} Analysis</h2>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Current Price</p>
                  <p className="text-xl font-semibold">${quoteData.c}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Daily High</p>
                  <p className="text-xl font-semibold">${quoteData.h}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Daily Low</p>
                  <p className="text-xl font-semibold">${quoteData.l}</p>
                </div>
              </div>
            </div>
          )}

          {symbol && candleData && (
            <div>
              <ChartSelector activeChart={chartType} onChartChange={setChartType} />
              <StockChart data={chartData} type={chartType} />
              <OptionsChart symbol={symbol} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;