import { Link, useLocation } from 'react-router-dom';
import { 
  HomeIcon, 
  NetworkIcon, 
  WalletIcon, 
  BarChartIcon, 
  FileTextIcon, 
  SettingsIcon, 
  XIcon,
  GithubIcon,
  TerminalIcon,
  FileIcon,
  CloudIcon
} from 'lucide-react';

interface SidebarProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const Sidebar = ({ open, setOpen }: SidebarProps) => {
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: HomeIcon },
    { name: 'Nodes', href: '/nodes', icon: NetworkIcon },
    { name: 'Wallets', href: '/wallets', icon: WalletIcon },
    { name: 'Graphs', href: '/graphs', icon: BarChartIcon },
    { name: 'Documents', href: '/documents', icon: FileTextIcon },
    { name: 'Settings', href: '/settings', icon: SettingsIcon },
  ];

  const quickActions = [
    { name: 'GitHub Login', icon: GithubIcon },
    { name: 'CLI Mode', icon: TerminalIcon },
    { name: 'Generate PDF', icon: FileIcon },
    { name: 'Deploy', icon: CloudIcon },
  ];

  return (
    <>
      <div
        className={`fixed inset-0 bg-gray-600 bg-opacity-75 z-20 transition-opacity ${
          open ? 'opacity-100 ease-out duration-300' : 'opacity-0 ease-in duration-200 pointer-events-none'
        }`}
        onClick={() => setOpen(false)}
      ></div>

      <div
        className={`fixed inset-y-0 left-0 flex flex-col max-w-xs w-full bg-white dark:bg-gray-800 shadow-xl z-30 transform transition ${
          open ? 'translate-x-0 ease-out duration-300' : '-translate-x-full ease-in duration-200'
        } md:translate-x-0 md:static md:z-0`}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 dark:border-gray-700">
          <span className="text-xl font-bold text-gray-900 dark:text-white">Web3 OS</span>
          <button
            type="button"
            className="md:hidden rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
            onClick={() => setOpen(false)}
          >
            <span className="sr-only">Close sidebar</span>
            <XIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto pt-5 pb-4">
          <nav className="mt-5 px-2 space-y-1">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`group flex items-center px-2 py-2 text-base font-medium rounded-md ${
                    isActive
                      ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-200'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white'
                  }`}
                >
                  <item.icon
                    className={`mr-4 h-6 w-6 ${
                      isActive ? 'text-indigo-600 dark:text-indigo-200' : 'text-gray-400 group-hover:text-gray-500 dark:text-gray-400 dark:group-hover:text-gray-300'
                    }`}
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          <div className="mt-10">
            <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">
              Quick Actions
            </h3>
            <div className="mt-2 px-2 space-y-1">
              {quickActions.map((action) => (
                <button
                  key={action.name}
                  className="group flex items-center px-2 py-2 text-base font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white w-full text-left"
                >
                  <action.icon className="mr-4 h-6 w-6 text-gray-400 group-hover:text-gray-500 dark:text-gray-400 dark:group-hover:text-gray-300" />
                  {action.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="px-3 py-4 border-t border-gray-200 dark:border-gray-700">
          <button className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            Launch All
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
