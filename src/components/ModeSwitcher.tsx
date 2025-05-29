import React, { useState } from 'react';
import { Terminal, Monitor, Check } from 'lucide-react';

interface ModeSwitcherProps {
  onModeChange: (mode: 'cli' | 'gui') => void;
  currentMode: 'cli' | 'gui';
}

const ModeSwitcher: React.FC<ModeSwitcherProps> = ({ onModeChange, currentMode }) => {
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleModeChange = (mode: 'cli' | 'gui') => {
    if (currentMode === mode) return;
    
    setIsTransitioning(true);
    
    setTimeout(() => {
      onModeChange(mode);
      setIsTransitioning(false);
    }, 800);
  };

  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
        Interface Mode
      </h3>
      
      <div className="flex flex-col space-y-4">
        <div className="relative">
          <div className={`absolute inset-0 bg-indigo-100 dark:bg-indigo-900/20 rounded-md transition-transform duration-300 ease-in-out ${
            currentMode === 'gui' ? 'translate-y-0' : 'translate-y-full'
          }`} style={{ height: '50%' }}></div>
          
          <div className="relative grid grid-cols-2 gap-2">
            <button
              onClick={() => handleModeChange('gui')}
              disabled={isTransitioning || currentMode === 'gui'}
              className={`flex items-center justify-center space-x-2 px-4 py-3 rounded-md transition-colors duration-200 ${
                currentMode === 'gui'
                  ? 'text-indigo-700 dark:text-indigo-300 font-medium'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <Monitor className="h-5 w-5" />
              <span>GUI Mode</span>
              {currentMode === 'gui' && <Check className="h-4 w-4 ml-1" />}
            </button>
            
            <button
              onClick={() => handleModeChange('cli')}
              disabled={isTransitioning || currentMode === 'cli'}
              className={`flex items-center justify-center space-x-2 px-4 py-3 rounded-md transition-colors duration-200 ${
                currentMode === 'cli'
                  ? 'text-indigo-700 dark:text-indigo-300 font-medium'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <Terminal className="h-5 w-5" />
              <span>CLI Mode</span>
              {currentMode === 'cli' && <Check className="h-4 w-4 ml-1" />}
            </button>
          </div>
        </div>
        
        <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-md">
          {currentMode === 'gui' ? (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white">GUI Mode Active</h4>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Full graphical interface with interactive visualizations, drag-and-drop functionality, and real-time updates.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white">CLI Mode Active</h4>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Command-line interface for advanced users, scripting capabilities, and automation workflows.
              </p>
              <div className="mt-2 p-2 bg-gray-800 dark:bg-gray-900 rounded text-xs font-mono text-green-400">
                <span className="text-white">$</span> web3-os --node-sync --region=global
              </div>
            </div>
          )}
        </div>
        
        {isTransitioning && (
          <div className="flex justify-center items-center py-2">
            <div className="animate-spin h-5 w-5 border-2 border-indigo-500 border-opacity-20 border-t-indigo-500 rounded-full"></div>
            <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
              Switching to {currentMode === 'gui' ? 'CLI' : 'GUI'} mode...
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModeSwitcher;
