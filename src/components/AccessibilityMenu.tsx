import React, { useState } from 'react';
import { Accessibility, ChevronDown, ChevronUp, ZoomIn, ZoomOut, Type, MousePointer } from 'lucide-react';

interface AccessibilityMenuProps {
  onFontSizeChange: (size: 'small' | 'medium' | 'large' | 'x-large') => void;
  onContrastChange: (contrast: 'normal' | 'high') => void;
  onMotionChange: (reduceMotion: boolean) => void;
  currentFontSize: 'small' | 'medium' | 'large' | 'x-large';
  currentContrast: 'normal' | 'high';
  reduceMotion: boolean;
}

const AccessibilityMenu: React.FC<AccessibilityMenuProps> = ({
  onFontSizeChange,
  onContrastChange,
  onMotionChange,
  currentFontSize,
  currentContrast,
  reduceMotion
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative">
      <button
        onClick={toggleMenu}
        className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="Accessibility options"
      >
        <Accessibility className="h-5 w-5" />
        <span className="hidden md:inline">Accessibility</span>
        {isOpen ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
      </button>

      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-64 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 z-50 p-4"
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="accessibility-menu"
        >
          <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
            Accessibility Options
          </h3>

          {/* Font Size */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <div className="flex items-center">
                <Type className="h-4 w-4 mr-2" />
                Font Size
              </div>
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(['small', 'medium', 'large', 'x-large'] as const).map((size) => (
                <button
                  key={size}
                  onClick={() => onFontSizeChange(size)}
                  className={`px-2 py-1 text-xs rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                    currentFontSize === size
                      ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                  aria-pressed={currentFontSize === size}
                  aria-label={`Font size ${size}`}
                >
                  {size === 'small' && 'A'}
                  {size === 'medium' && 'A'}
                  {size === 'large' && 'A'}
                  {size === 'x-large' && 'A'}
                </button>
              ))}
            </div>
          </div>

          {/* Contrast */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <div className="flex items-center">
                <ZoomIn className="h-4 w-4 mr-2" />
                Contrast
              </div>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(['normal', 'high'] as const).map((contrast) => (
                <button
                  key={contrast}
                  onClick={() => onContrastChange(contrast)}
                  className={`px-2 py-1 text-xs rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                    currentContrast === contrast
                      ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                  aria-pressed={currentContrast === contrast}
                  aria-label={`${contrast} contrast`}
                >
                  {contrast.charAt(0).toUpperCase() + contrast.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Reduce Motion */}
          <div className="mb-2">
            <label className="flex items-center">
              <div className="flex items-center mr-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                <MousePointer className="h-4 w-4 mr-2" />
                Reduce Motion
              </div>
              <div className="relative inline-block w-10 mr-2 align-middle select-none">
                <input
                  type="checkbox"
                  id="reduce-motion"
                  checked={reduceMotion}
                  onChange={() => onMotionChange(!reduceMotion)}
                  className="sr-only"
                />
                <div
                  className={`block h-6 rounded-full w-10 ${
                    reduceMotion ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                ></div>
                <div
                  className={`dot absolute left-1 top-1 h-4 w-4 rounded-full transition-transform ${
                    reduceMotion ? 'transform translate-x-4 bg-white' : 'bg-white'
                  }`}
                ></div>
              </div>
            </label>
          </div>

          <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              These settings will be saved to your browser and applied across the platform.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccessibilityMenu;
