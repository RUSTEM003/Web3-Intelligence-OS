import { BellIcon, MoonIcon, SunIcon, MenuIcon, SearchIcon, GlobeIcon, ShieldIcon } from 'lucide-react';
import { useState } from 'react';

interface NavbarProps {
  onMenuButtonClick: () => void;
  isOnline: boolean;
  scrolled?: boolean;
}

const Navbar = ({ onMenuButtonClick, isOnline, scrolled = false }: NavbarProps) => {
  const [darkMode, setDarkMode] = useState(true); // Default to dark mode for Palantir-like aesthetic

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <header className={`transition-all duration-300 ${scrolled ? 'py-2' : 'py-4'}`}>
      <div className="px-4 sm:px-6 lg:px-8 max-w-screen-2xl mx-auto">
        <div className="flex items-center justify-between">
          {/* Left section: Logo and menu button */}
          <div className="flex items-center gap-4">
            <button
              type="button"
              className="lg:hidden flex items-center justify-center w-10 h-10 rounded-md text-text-secondary hover:text-text-primary hover:bg-background-tertiary"
              onClick={onMenuButtonClick}
              aria-label="Open sidebar"
            >
              <MenuIcon className="h-5 w-5" />
            </button>
            
            <div className="flex-shrink-0 flex items-center">
              <div className="flex items-center gap-2">
                <ShieldIcon className="h-6 w-6 text-accent-blue" />
                <span className="text-xl font-semibold tracking-tight">Web3 Intelligence OS</span>
              </div>
            </div>
          </div>
          
          {/* Center section: Main navigation (hidden on mobile) */}
          <nav className="hidden lg:flex items-center space-x-8">
            <a href="#" className="text-text-primary hover:text-accent-blue font-medium transition-colors">Platform</a>
            <a href="#" className="text-text-secondary hover:text-accent-blue font-medium transition-colors">Solutions</a>
            <a href="#" className="text-text-secondary hover:text-accent-blue font-medium transition-colors">Documentation</a>
            <a href="#" className="text-text-secondary hover:text-accent-blue font-medium transition-colors">Community</a>
          </nav>
          
          {/* Right section: Actions and user menu */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Online status indicator */}
            <div className="hidden sm:flex items-center">
              <div className={`h-2 w-2 rounded-full mr-2 ${isOnline ? 'bg-accent-green' : 'bg-accent-red'}`}></div>
              <span className="text-sm text-text-secondary">{isOnline ? 'Online' : 'Offline'}</span>
            </div>
            
            {/* Search button */}
            <button
              type="button"
              className="hidden sm:flex items-center justify-center w-10 h-10 rounded-md text-text-secondary hover:text-text-primary hover:bg-background-tertiary transition-colors"
              aria-label="Search"
            >
              <SearchIcon className="h-5 w-5" />
            </button>
            
            {/* Language selector */}
            <button
              type="button"
              className="hidden md:flex items-center justify-center w-10 h-10 rounded-md text-text-secondary hover:text-text-primary hover:bg-background-tertiary transition-colors"
              aria-label="Change language"
            >
              <GlobeIcon className="h-5 w-5" />
            </button>
            
            {/* Dark mode toggle */}
            <button
              type="button"
              className="flex items-center justify-center w-10 h-10 rounded-md text-text-secondary hover:text-text-primary hover:bg-background-tertiary transition-colors"
              onClick={toggleDarkMode}
              aria-label="Toggle dark mode"
            >
              {darkMode ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
            </button>
            
            {/* Notifications */}
            <button
              type="button"
              className="flex items-center justify-center w-10 h-10 rounded-md text-text-secondary hover:text-text-primary hover:bg-background-tertiary transition-colors"
              aria-label="View notifications"
            >
              <BellIcon className="h-5 w-5" />
            </button>
            
            {/* User menu */}
            <div className="relative">
              <button
                type="button"
                className="flex items-center justify-center rounded-full focus:outline-none"
                id="user-menu-button"
                aria-label="Open user menu"
              >
                <div className="h-10 w-10 rounded-full bg-accent-blue flex items-center justify-center text-white font-medium">
                  <span>AI</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
