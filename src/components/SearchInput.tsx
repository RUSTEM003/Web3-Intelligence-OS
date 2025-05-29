import React, { useState } from 'react';
import { Search, X, ArrowRight, Clock } from 'lucide-react';

interface SearchInputProps {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  onSearch?: (query: string) => void;
  recentSearches?: string[];
  suggestions?: string[];
  variant?: 'default' | 'minimal' | 'expanded';
  className?: string;
}

const SearchInput: React.FC<SearchInputProps> = ({
  placeholder = 'Search...',
  value,
  onChange,
  onSearch,
  recentSearches = [],
  suggestions = [],
  variant = 'default',
  className = '',
}) => {
  const [query, setQuery] = useState(value || '');
  const [isFocused, setIsFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleSearch = () => {
    if (query.trim() && onSearch) {
      onSearch(query);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const handleClear = () => {
    setQuery('');
    setShowSuggestions(false);
  };

  const handleFocus = () => {
    setIsFocused(true);
    if (recentSearches.length > 0 || suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    setTimeout(() => setShowSuggestions(false), 200);
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'minimal':
        return 'bg-transparent border-b border-border-light rounded-none px-2 py-1';
      case 'expanded':
        return 'bg-background-secondary border border-border-light rounded-lg px-4 py-3 shadow-lg';
      default:
        return 'bg-background-tertiary border border-border-light rounded-md px-3 py-2';
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div className={`flex items-center ${getVariantClasses()} ${isFocused ? 'ring-1 ring-accent-blue' : ''}`}>
        <Search className={`h-4 w-4 ${isFocused ? 'text-accent-blue' : 'text-text-tertiary'}`} />
        
        <input
          type="text"
          value={query}
          onChange={(e) => {
            const newValue = e.target.value;
            setQuery(newValue);
            if (onChange) {
              onChange(newValue);
            }
          }}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="flex-1 bg-transparent border-none outline-none px-2 text-sm text-text-primary placeholder-text-tertiary"
        />
        
        {query && (
          <button
            onClick={handleClear}
            className="text-text-tertiary hover:text-text-secondary transition-colors"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        
        <button
          onClick={handleSearch}
          className={`ml-1 p-1 rounded-md transition-colors ${
            query.trim() 
              ? 'text-accent-blue hover:bg-background-elevated' 
              : 'text-text-tertiary cursor-not-allowed'
          }`}
          disabled={!query.trim()}
          aria-label="Search"
        >
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
      
      {showSuggestions && (recentSearches.length > 0 || suggestions.length > 0) && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-background-secondary border border-border-light rounded-md shadow-lg z-10 max-h-60 overflow-y-auto">
          {recentSearches.length > 0 && (
            <div className="p-2">
              <div className="text-xs font-medium text-text-tertiary px-2 py-1">Recent Searches</div>
              <ul>
                {recentSearches.map((search, index) => (
                  <li key={`recent-${index}`}>
                    <button
                      className="flex items-center w-full text-left px-2 py-1.5 text-sm text-text-secondary hover:bg-background-tertiary rounded"
                      onClick={() => {
                        setQuery(search);
                        handleSearch();
                      }}
                    >
                      <Clock className="h-3 w-3 mr-2 text-text-tertiary" />
                      {search}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {suggestions.length > 0 && (
            <div className="p-2 border-t border-border-light">
              <div className="text-xs font-medium text-text-tertiary px-2 py-1">Suggestions</div>
              <ul>
                {suggestions.map((suggestion, index) => (
                  <li key={`suggestion-${index}`}>
                    <button
                      className="flex items-center w-full text-left px-2 py-1.5 text-sm text-text-secondary hover:bg-background-tertiary rounded"
                      onClick={() => {
                        setQuery(suggestion);
                        handleSearch();
                      }}
                    >
                      <Search className="h-3 w-3 mr-2 text-text-tertiary" />
                      {suggestion}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchInput;
