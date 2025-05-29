import React, { ReactNode } from 'react';
import { ArrowUpRight, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface DataCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    timeframe: string;
  };
  icon?: ReactNode;
  footer?: string;
  onClick?: () => void;
  loading?: boolean;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

const DataCard: React.FC<DataCardProps> = ({
  title,
  value,
  change,
  icon,
  footer,
  onClick,
  loading = false,
  variant = 'default',
  size = 'md',
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return 'border-accent-blue bg-gradient-to-br from-background-secondary to-background-primary';
      case 'success':
        return 'border-accent-green bg-gradient-to-br from-background-secondary to-background-primary';
      case 'warning':
        return 'border-accent-yellow bg-gradient-to-br from-background-secondary to-background-primary';
      case 'danger':
        return 'border-accent-red bg-gradient-to-br from-background-secondary to-background-primary';
      default:
        return 'border-border-light bg-background-secondary';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'p-3';
      case 'lg':
        return 'p-6';
      default:
        return 'p-4';
    }
  };

  const getChangeIcon = () => {
    if (!change) return null;
    
    if (change.value > 0) {
      return <TrendingUp className="h-3 w-3 text-accent-green" />;
    } else if (change.value < 0) {
      return <TrendingDown className="h-3 w-3 text-accent-red" />;
    } else {
      return <Minus className="h-3 w-3 text-text-tertiary" />;
    }
  };

  const getChangeColor = () => {
    if (!change) return '';
    
    if (change.value > 0) {
      return 'text-accent-green';
    } else if (change.value < 0) {
      return 'text-accent-red';
    } else {
      return 'text-text-tertiary';
    }
  };

  return (
    <div 
      className={`rounded-lg border ${getVariantClasses()} ${getSizeClasses()} transition-all duration-300 ${
        onClick ? 'cursor-pointer hover:shadow-lg hover:translate-y-[-2px]' : ''
      }`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex flex-col">
          <div className="text-xs font-medium text-text-tertiary uppercase tracking-wider mb-1">
            {title}
          </div>
          
          {loading ? (
            <div className="h-8 w-24 bg-background-tertiary animate-pulse rounded"></div>
          ) : (
            <div className="text-2xl font-semibold text-text-primary">
              {value}
            </div>
          )}
          
          {change && (
            <div className="flex items-center mt-1">
              {getChangeIcon()}
              <span className={`text-xs ml-1 ${getChangeColor()}`}>
                {change.value > 0 ? '+' : ''}{change.value}% {change.timeframe}
              </span>
            </div>
          )}
        </div>
        
        {icon && (
          <div className="p-2 rounded-md bg-background-tertiary">
            {icon}
          </div>
        )}
      </div>
      
      {footer && (
        <div className="mt-4 pt-3 border-t border-border-light">
          <button className="text-xs text-accent-blue hover:text-accent-blue-light flex items-center transition-colors">
            {footer}
            <ArrowUpRight className="h-3 w-3 ml-1" />
          </button>
        </div>
      )}
    </div>
  );
};

export default DataCard;
