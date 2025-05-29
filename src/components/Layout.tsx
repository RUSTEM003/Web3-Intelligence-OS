import { Outlet } from 'react-router-dom';
import { useState } from 'react';
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

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      
      <div className="flex flex-col flex-1 overflow-hidden">
        <Navbar onMenuButtonClick={() => setSidebarOpen(true)} isOnline={isOnline} />
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 dark:bg-gray-900 p-6">
          <Outlet />
        </main>
        
        <SyncStatus isOnline={isOnline} lastSync={syncStatus.lastSync} pendingOperations={syncStatus.pendingOperations} />
      </div>
    </div>
  );
};

export default Layout;
