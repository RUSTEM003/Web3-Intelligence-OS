import { useState, useEffect } from 'react';
import { CloudIcon, CloudOffIcon } from 'lucide-react';

interface SyncStatusProps {
  isOnline: boolean;
  lastSync: string;
  pendingOperations: number;
}

const SyncStatus = ({ isOnline, lastSync, pendingOperations }: SyncStatusProps) => {
  const [timeAgo, setTimeAgo] = useState('');

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
        } else {
          setTimeAgo(`${diffHours} hours ago`);
        }
      }
    };

    calculateTimeAgo();
    const interval = setInterval(calculateTimeAgo, 60000);
    
    return () => clearInterval(interval);
  }, [lastSync]);

  return (
    <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-2 px-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {isOnline ? (
            <CloudIcon className="h-5 w-5 text-green-500" />
          ) : (
            <CloudOffIcon className="h-5 w-5 text-red-500" />
          )}
          <span className="text-sm text-gray-600 dark:text-gray-300">
            {isOnline ? 'Online' : 'Offline'} • Last sync: {timeAgo}
          </span>
        </div>
        
        {pendingOperations > 0 && (
          <div className="flex items-center">
            <span className="text-sm text-amber-600 dark:text-amber-400">
              {pendingOperations} pending operation{pendingOperations !== 1 ? 's' : ''}
            </span>
            <button className="ml-2 text-xs bg-indigo-600 hover:bg-indigo-700 text-white py-1 px-2 rounded">
              Sync Now
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SyncStatus;
