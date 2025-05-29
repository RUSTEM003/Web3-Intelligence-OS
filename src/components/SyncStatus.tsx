import { useState, useEffect } from 'react';
import { CloudIcon, CloudOffIcon, RefreshCwIcon, AlertCircleIcon, CheckCircleIcon } from 'lucide-react';

interface SyncStatusProps {
  isOnline: boolean;
  lastSync: string;
  pendingOperations: number;
}

const SyncStatus = ({ isOnline, lastSync, pendingOperations }: SyncStatusProps) => {
  const [timeAgo, setTimeAgo] = useState('');
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    const calculateTimeAgo = () => {
      const now = new Date();
      const syncTime = new Date(lastSync);
      const diffMs = now.getTime() - syncTime.getTime();
      const diffMins = Math.round(diffMs / 60000);
      
      if (diffMins < 1) {
        setTimeAgo('just now');
      } else if (diffMins === 1) {
        setTimeAgo('1 minute ago');
      } else if (diffMins < 60) {
        setTimeAgo(`${diffMins} minutes ago`);
      } else {
        const diffHours = Math.floor(diffMins / 60);
        if (diffHours === 1) {
          setTimeAgo('1 hour ago');
        } else if (diffHours < 24) {
          setTimeAgo(`${diffHours} hours ago`);
        } else {
          const diffDays = Math.floor(diffHours / 24);
          if (diffDays === 1) {
            setTimeAgo('1 day ago');
          } else {
            setTimeAgo(`${diffDays} days ago`);
          }
        }
      }
    };

    calculateTimeAgo();
    const interval = setInterval(calculateTimeAgo, 60000);
    
    return () => clearInterval(interval);
  }, [lastSync]);

  const handleSync = () => {
    setSyncing(true);
    setTimeout(() => {
      setSyncing(false);
    }, 2000);
  };

  return (
    <div className="py-2 px-4 sm:px-6 lg:px-8">
      <div className="max-w-screen-2xl mx-auto flex items-center justify-between h-10">
        {/* Left section: Connection status */}
        <div className="flex items-center gap-3">
          <div className="flex items-center">
            {isOnline ? (
              <CheckCircleIcon className="h-4 w-4 text-accent-green" />
            ) : (
              <AlertCircleIcon className="h-4 w-4 text-accent-red" />
            )}
            <span className="ml-1.5 text-xs font-medium text-text-secondary">
              {isOnline ? 'Connected' : 'Disconnected'}
            </span>
          </div>
          
          <div className="hidden sm:flex items-center">
            <span className="text-text-tertiary">•</span>
            <div className="ml-3 flex items-center">
              {isOnline ? (
                <CloudIcon className="h-4 w-4 text-text-tertiary" />
              ) : (
                <CloudOffIcon className="h-4 w-4 text-text-tertiary" />
              )}
              <span className="ml-1.5 text-xs text-text-tertiary">
                Last sync: <span className="text-text-secondary">{timeAgo}</span>
              </span>
            </div>
          </div>
        </div>
        
        {/* Right section: Pending operations and sync button */}
        <div className="flex items-center gap-4">
          {pendingOperations > 0 && (
            <div className="hidden sm:flex items-center">
              <span className="text-xs text-accent-blue">
                {pendingOperations} pending operation{pendingOperations !== 1 ? 's' : ''}
              </span>
            </div>
          )}
          
          <button 
            className={`flex items-center justify-center h-7 px-3 rounded text-xs font-medium transition-colors ${
              syncing 
                ? 'bg-background-tertiary text-text-secondary cursor-not-allowed' 
                : 'bg-background-tertiary hover:bg-background-elevated text-text-secondary hover:text-text-primary'
            }`}
            onClick={handleSync}
            disabled={syncing}
          >
            <RefreshCwIcon className={`h-3 w-3 mr-1.5 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Syncing...' : 'Sync Now'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SyncStatus;
