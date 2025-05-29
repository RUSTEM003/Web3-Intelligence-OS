import React, { useState } from 'react';
import { Play, Loader, Check, AlertTriangle } from 'lucide-react';

interface LaunchAllButtonProps {
  onLaunch: () => Promise<void>;
  disabled?: boolean;
}

const LaunchAllButton: React.FC<LaunchAllButtonProps> = ({ 
  onLaunch, 
  disabled = false 
}) => {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLaunch = async () => {
    if (disabled || status === 'loading') return;
    
    setStatus('loading');
    setErrorMessage(null);
    
    try {
      await onLaunch();
      setStatus('success');
      
      setTimeout(() => {
        setStatus('idle');
      }, 3000);
    } catch (error) {
      setStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'An unknown error occurred');
      
      setTimeout(() => {
        setStatus('idle');
        setErrorMessage(null);
      }, 5000);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <button
        onClick={handleLaunch}
        disabled={disabled || status === 'loading'}
        className={`
          flex items-center justify-center space-x-2 px-6 py-3 rounded-lg text-white font-medium 
          focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500
          transition-all duration-200 ease-in-out
          ${disabled 
            ? 'bg-gray-400 cursor-not-allowed opacity-70' 
            : status === 'loading'
              ? 'bg-indigo-600 cursor-wait'
              : status === 'success'
                ? 'bg-green-600 hover:bg-green-700'
                : status === 'error'
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-indigo-600 hover:bg-indigo-700 shadow-lg hover:shadow-xl'
          }
        `}
        aria-label="Launch all components"
        aria-disabled={disabled || status === 'loading'}
        aria-busy={status === 'loading'}
      >
        {status === 'loading' ? (
          <>
            <Loader className="h-5 w-5 animate-spin" />
            <span>Launching...</span>
          </>
        ) : status === 'success' ? (
          <>
            <Check className="h-5 w-5" />
            <span>Launched Successfully</span>
          </>
        ) : status === 'error' ? (
          <>
            <AlertTriangle className="h-5 w-5" />
            <span>Launch Failed</span>
          </>
        ) : (
          <>
            <Play className="h-5 w-5" />
            <span>Launch All</span>
          </>
        )}
      </button>
      
      {errorMessage && (
        <div className="mt-2 text-sm text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/20 p-2 rounded">
          {errorMessage}
        </div>
      )}
      
      <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
        <p>Launches all enabled modules and connects to available nodes</p>
        <ul className="mt-2 list-disc list-inside">
          <li>Initializes core services</li>
          <li>Connects to blockchain networks</li>
          <li>Starts data synchronization</li>
          <li>Activates AI analysis engines</li>
        </ul>
      </div>
    </div>
  );
};

export default LaunchAllButton;
