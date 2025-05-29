import React, { useState } from 'react';
import { TrendingUp, TrendingDown, RefreshCw, ArrowUpRight, Clock } from 'lucide-react';
import DataCard from './DataCard';

interface CryptocurrencyPrice {
  id: string;
  name: string;
  symbol: string;
  price: number;
  change24h: number;
  volume24h: number;
  marketCap: number;
  lastUpdated: string;
  sparkline?: number[];
}

interface CryptocurrencyPriceTrackerProps {
  title?: string;
  cryptos?: CryptocurrencyPrice[];
  loading?: boolean;
  onRefresh?: () => void;
  onViewDetails?: (id: string) => void;
  className?: string;
}

const mockCryptoData: CryptocurrencyPrice[] = [
  {
    id: 'bitcoin',
    name: 'Bitcoin',
    symbol: 'BTC',
    price: 68423.12,
    change24h: 2.34,
    volume24h: 28765432198,
    marketCap: 1298765432198,
    lastUpdated: '2 min ago',
    sparkline: [65432, 66789, 67123, 66543, 67890, 68123, 68423]
  },
  {
    id: 'ethereum',
    name: 'Ethereum',
    symbol: 'ETH',
    price: 3521.87,
    change24h: -1.23,
    volume24h: 15432876543,
    marketCap: 423456789012,
    lastUpdated: '3 min ago',
    sparkline: [3600, 3580, 3540, 3510, 3490, 3505, 3522]
  },
  {
    id: 'solana',
    name: 'Solana',
    symbol: 'SOL',
    price: 142.56,
    change24h: 5.67,
    volume24h: 5678901234,
    marketCap: 56789012345,
    lastUpdated: '1 min ago',
    sparkline: [135, 138, 140, 139, 141, 143, 142.5]
  },
  {
    id: 'cardano',
    name: 'Cardano',
    symbol: 'ADA',
    price: 0.56,
    change24h: 0.89,
    volume24h: 1234567890,
    marketCap: 19876543210,
    lastUpdated: '5 min ago',
    sparkline: [0.54, 0.55, 0.56, 0.55, 0.56, 0.57, 0.56]
  },
  {
    id: 'polkadot',
    name: 'Polkadot',
    symbol: 'DOT',
    price: 7.89,
    change24h: -2.45,
    volume24h: 987654321,
    marketCap: 9876543210,
    lastUpdated: '4 min ago',
    sparkline: [8.1, 8.0, 7.9, 7.85, 7.8, 7.85, 7.89]
  }
];

const CryptocurrencyPriceTracker: React.FC<CryptocurrencyPriceTrackerProps> = ({
  title = 'Cryptocurrency Market',
  cryptos = mockCryptoData,
  loading = false,
  onRefresh,
  onViewDetails,
  className = '',
}) => {
  const [timeRange, setTimeRange] = useState('24h');
  const [sortBy, setSortBy] = useState('marketCap');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDirection('desc');
    }
  };

  const formatNumber = (num: number, digits = 2) => {
    if (num >= 1000000000) {
      return `$${(num / 1000000000).toFixed(digits)}B`;
    } else if (num >= 1000000) {
      return `$${(num / 1000000).toFixed(digits)}M`;
    } else if (num >= 1000) {
      return `$${(num / 1000).toFixed(digits)}K`;
    } else {
      return `$${num.toFixed(digits)}`;
    }
  };

  const formatPrice = (price: number) => {
    if (price < 1) {
      return `$${price.toFixed(4)}`;
    } else if (price < 10) {
      return `$${price.toFixed(3)}`;
    } else if (price < 1000) {
      return `$${price.toFixed(2)}`;
    } else {
      return `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
  };

  const renderSparkline = (data?: number[]) => {
    if (!data || data.length < 2) return null;
    
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min;
    const width = 100;
    const height = 30;
    
    const points = data.map((value, index) => {
      const x = (index / (data.length - 1)) * width;
      const y = height - ((value - min) / range) * height;
      return `${x},${y}`;
    }).join(' ');
    
    const trend = data[data.length - 1] >= data[0] ? 'text-accent-green' : 'text-accent-red';
    
    return (
      <svg width={width} height={height} className="overflow-visible">
        <polyline
          points={points}
          fill="none"
          stroke={data[data.length - 1] >= data[0] ? 'var(--accent-green)' : 'var(--accent-red)'}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  };

  return (
    <div className={`bg-background-secondary border border-border-light rounded-lg shadow-lg overflow-hidden ${className}`}>
      <div className="flex items-center justify-between p-4 border-b border-border-light">
        <div className="flex items-center">
          <div className="p-2 rounded-md bg-background-tertiary mr-3">
            <TrendingUp className="h-5 w-5 text-accent-blue" />
          </div>
          <div>
            <h2 className="text-base font-medium text-text-primary">{title}</h2>
            <p className="text-xs text-text-tertiary mt-0.5">Real-time cryptocurrency market data</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center space-x-1 bg-background-tertiary rounded-md p-1">
            {['1h', '24h', '7d', '30d'].map((range) => (
              <button
                key={range}
                className={`px-3 py-1 text-xs font-medium rounded ${
                  timeRange === range 
                    ? 'bg-background-elevated text-text-primary' 
                    : 'text-text-secondary hover:text-text-primary'
                }`}
                onClick={() => setTimeRange(range)}
              >
                {range}
              </button>
            ))}
          </div>
          
          <button 
            className="p-2 rounded-md bg-background-tertiary text-text-secondary hover:text-text-primary transition-colors"
            onClick={onRefresh}
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-background-tertiary border-b border-border-light">
              <th className="px-4 py-3 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider">
                <button 
                  className="flex items-center"
                  onClick={() => handleSort('name')}
                >
                  Asset
                  {sortBy === 'name' && (
                    <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </button>
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-text-tertiary uppercase tracking-wider">
                <button 
                  className="flex items-center justify-end ml-auto"
                  onClick={() => handleSort('price')}
                >
                  Price
                  {sortBy === 'price' && (
                    <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </button>
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-text-tertiary uppercase tracking-wider">
                <button 
                  className="flex items-center justify-end ml-auto"
                  onClick={() => handleSort('change24h')}
                >
                  24h Change
                  {sortBy === 'change24h' && (
                    <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </button>
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-text-tertiary uppercase tracking-wider hidden md:table-cell">
                <button 
                  className="flex items-center justify-end ml-auto"
                  onClick={() => handleSort('marketCap')}
                >
                  Market Cap
                  {sortBy === 'marketCap' && (
                    <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </button>
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-text-tertiary uppercase tracking-wider hidden lg:table-cell">
                <button 
                  className="flex items-center justify-end ml-auto"
                  onClick={() => handleSort('volume24h')}
                >
                  Volume (24h)
                  {sortBy === 'volume24h' && (
                    <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </button>
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-text-tertiary uppercase tracking-wider hidden xl:table-cell">
                Last 24h
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-text-tertiary uppercase tracking-wider"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-light">
            {loading ? (
              Array(5).fill(0).map((_, index) => (
                <tr key={index} className="bg-background-secondary hover:bg-background-tertiary transition-colors">
                  <td className="px-4 py-4">
                    <div className="h-6 w-24 bg-background-tertiary animate-pulse rounded"></div>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className="h-6 w-20 bg-background-tertiary animate-pulse rounded ml-auto"></div>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className="h-6 w-16 bg-background-tertiary animate-pulse rounded ml-auto"></div>
                  </td>
                  <td className="px-4 py-4 text-right hidden md:table-cell">
                    <div className="h-6 w-24 bg-background-tertiary animate-pulse rounded ml-auto"></div>
                  </td>
                  <td className="px-4 py-4 text-right hidden lg:table-cell">
                    <div className="h-6 w-24 bg-background-tertiary animate-pulse rounded ml-auto"></div>
                  </td>
                  <td className="px-4 py-4 text-right hidden xl:table-cell">
                    <div className="h-6 w-24 bg-background-tertiary animate-pulse rounded ml-auto"></div>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className="h-6 w-8 bg-background-tertiary animate-pulse rounded ml-auto"></div>
                  </td>
                </tr>
              ))
            ) : (
              cryptos.map((crypto) => (
                <tr key={crypto.id} className="bg-background-secondary hover:bg-background-tertiary transition-colors">
                  <td className="px-4 py-4">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-background-tertiary flex items-center justify-center mr-3">
                        <span className="text-xs font-medium text-text-primary">{crypto.symbol.charAt(0)}</span>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-text-primary">{crypto.name}</div>
                        <div className="text-xs text-text-tertiary">{crypto.symbol}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className="text-sm font-medium text-text-primary">{formatPrice(crypto.price)}</div>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className={`flex items-center justify-end ${
                      crypto.change24h > 0 ? 'text-accent-green' : 
                      crypto.change24h < 0 ? 'text-accent-red' : 'text-text-tertiary'
                    }`}>
                      {crypto.change24h > 0 ? (
                        <TrendingUp className="h-3.5 w-3.5 mr-1" />
                      ) : crypto.change24h < 0 ? (
                        <TrendingDown className="h-3.5 w-3.5 mr-1" />
                      ) : null}
                      <span className="text-sm font-medium">
                        {crypto.change24h > 0 ? '+' : ''}{crypto.change24h.toFixed(2)}%
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-right hidden md:table-cell">
                    <div className="text-sm font-medium text-text-primary">{formatNumber(crypto.marketCap)}</div>
                  </td>
                  <td className="px-4 py-4 text-right hidden lg:table-cell">
                    <div className="text-sm font-medium text-text-primary">{formatNumber(crypto.volume24h)}</div>
                  </td>
                  <td className="px-4 py-4 text-right hidden xl:table-cell">
                    <div className="h-8">
                      {renderSparkline(crypto.sparkline)}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <button 
                      className="text-accent-blue hover:text-accent-blue-light"
                      onClick={() => onViewDetails && onViewDetails(crypto.id)}
                    >
                      <ArrowUpRight className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      <div className="p-3 border-t border-border-light bg-background-tertiary">
        <div className="flex items-center justify-between">
          <div className="flex items-center text-xs text-text-tertiary">
            <Clock className="h-3 w-3 mr-1" />
            <span>Last updated: 2 minutes ago</span>
          </div>
          <button 
            className="text-xs text-accent-blue hover:text-accent-blue-light flex items-center"
            onClick={() => onViewDetails && onViewDetails('all')}
          >
            View all markets
            <ArrowUpRight className="h-3 w-3 ml-1" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CryptocurrencyPriceTracker;
