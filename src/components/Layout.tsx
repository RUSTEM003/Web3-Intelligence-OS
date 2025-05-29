import { Outlet } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import SyncStatus from './SyncStatus';

interface LayoutProps {
  isOnline: boolean;
  syncStatus: {
    lastSync: string;
    pendingOperations: number;
  };
}

const Layout = ({ isOnline, syncStatus }: LayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="flex h-screen bg-primary text-primary">
      {/* Sidebar with glass effect when open on mobile */}
      <div className={`fixed inset-0 bg-background-primary bg-opacity-80 backdrop-blur-sm z-30 transition-opacity duration-300 lg:hidden ${sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} 
           onClick={() => setSidebarOpen(false)}>
      </div>
      
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      
      <div className="flex flex-col flex-1 w-full overflow-hidden">
        {/* Navbar with glass effect when scrolled */}
        <div className={`sticky top-0 z-20 transition-all duration-300 ${scrolled ? 'glass shadow-md' : ''}`}>
          <Navbar 
            onMenuButtonClick={() => setSidebarOpen(true)} 
            isOnline={isOnline} 
            scrolled={scrolled}
          />
        </div>
        
        {/* Main content area with premium spacing */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-primary px-4 py-6 md:px-6 lg:px-8 xl:px-12">
          <div className="max-w-screen-2xl mx-auto">
            <Outlet />
          </div>
        </main>
        
        {/* Status bar with glass effect */}
        <div className="glass border-t border-border-light">
          <SyncStatus 
            isOnline={isOnline} 
            lastSync={syncStatus.lastSync} 
            pendingOperations={syncStatus.pendingOperations} 
          />
        </div>
      </div>
    </div>
  );
};

export default Layout;
