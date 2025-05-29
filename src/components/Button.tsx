import React, { ButtonHTMLAttributes, ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'tertiary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  loading?: boolean;
  fullWidth?: boolean;
  glass?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  leftIcon,
  rightIcon,
  loading = false,
  fullWidth = false,
  glass = false,
  disabled,
  className = '',
  ...props
}) => {
  const getVariantClasses = () => {
    const isDisabled = disabled || loading;
    
    switch (variant) {
      case 'primary':
        return isDisabled
          ? 'bg-background-elevated text-text-tertiary'
          : glass
            ? 'glass border border-accent-blue text-accent-blue hover:bg-accent-blue hover:bg-opacity-10'
            : 'bg-accent-blue text-white hover:bg-accent-blue-light';
      case 'secondary':
        return isDisabled
          ? 'bg-background-elevated text-text-tertiary'
          : glass
            ? 'glass border border-border-light text-text-secondary hover:border-text-secondary hover:text-text-primary'
            : 'bg-background-tertiary text-text-secondary hover:bg-background-elevated hover:text-text-primary';
      case 'tertiary':
        return isDisabled
          ? 'text-text-tertiary'
          : 'text-text-secondary hover:text-text-primary';
      case 'danger':
        return isDisabled
          ? 'bg-background-elevated text-text-tertiary'
          : glass
            ? 'glass border border-accent-red text-accent-red hover:bg-accent-red hover:bg-opacity-10'
            : 'bg-accent-red text-white hover:bg-accent-red-light';
      case 'ghost':
        return isDisabled
          ? 'text-text-tertiary'
          : 'text-text-secondary hover:bg-background-tertiary hover:text-text-primary';
      default:
        return '';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'text-xs px-2.5 py-1.5 rounded';
      case 'lg':
        return 'text-base px-6 py-3 rounded-md';
      default:
        return 'text-sm px-4 py-2 rounded';
    }
  };

  return (
    <button
      className={`
        inline-flex items-center justify-center font-medium transition-colors duration-200
        ${getVariantClasses()}
        ${getSizeClasses()}
        ${fullWidth ? 'w-full' : ''}
        ${variant !== 'tertiary' && variant !== 'ghost' ? 'shadow-sm' : ''}
        ${disabled || loading ? 'cursor-not-allowed opacity-70' : ''}
        ${className}
      `}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      )}
      
      {!loading && leftIcon && (
        <span className={`${children ? 'mr-2' : ''}`}>
          {leftIcon}
        </span>
      )}
      
      {children}
      
      {!loading && rightIcon && (
        <span className={`${children ? 'ml-2' : ''}`}>
          {rightIcon}
        </span>
      )}
    </button>
  );
};

export default Button;
