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
  CloudIcon,
  MapIcon,
  ShieldIcon,
  ChevronRightIcon
} from 'lucide-react';

interface SidebarProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const Sidebar = ({ open, setOpen }: SidebarProps) => {
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: HomeIcon, number: '01' },
    { name: 'Nodes', href: '/nodes', icon: NetworkIcon, number: '02' },
    { name: 'Wallets', href: '/wallets', icon: WalletIcon, number: '03' },
    { name: 'Graphs', href: '/graphs', icon: BarChartIcon, number: '04' },
    { name: 'Documents', href: '/documents', icon: FileTextIcon, number: '05' },
    { name: 'Map Viewer', href: '/map', icon: MapIcon, number: '06' },
    { name: 'Profile', href: '/profile', icon: FileIcon, number: '07' },
    { name: 'Settings', href: '/settings', icon: SettingsIcon, number: '08' },
  ];

  const quickActions = [
    { name: 'GitHub Login', icon: GithubIcon, description: 'Connect repository' },
    { name: 'CLI Mode', icon: TerminalIcon, description: 'Advanced commands' },
    { name: 'Generate PDF', icon: FileIcon, description: 'Export documentation' },
    { name: 'Deploy', icon: CloudIcon, description: 'Launch to production' },
  ];

  return (
    <>
      {/* Sidebar backdrop overlay for mobile */}
      <div
        className={`fixed inset-0 bg-background-primary bg-opacity-80 backdrop-blur-sm z-20 transition-opacity ${
          open ? 'opacity-100 ease-out duration-300' : 'opacity-0 ease-in duration-200 pointer-events-none'
        }`}
        onClick={() => setOpen(false)}
        aria-hidden="true"
      ></div>

      {/* Sidebar container */}
      <div
        className={`fixed inset-y-0 left-0 flex flex-col w-72 bg-background-secondary border-r border-border-light z-30 transform transition-transform ${
          open ? 'translate-x-0 ease-out duration-300' : '-translate-x-full ease-in duration-200'
        } lg:translate-x-0 lg:static lg:z-0`}
      >
        {/* Sidebar header */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-border-light">
          <div className="flex items-center gap-2">
            <ShieldIcon className="h-6 w-6 text-accent-blue" />
            <span className="text-lg font-semibold tracking-tight text-text-primary">Web3 Intelligence</span>
          </div>
          <button
            type="button"
            className="lg:hidden flex items-center justify-center w-8 h-8 rounded-md text-text-secondary hover:text-text-primary hover:bg-background-tertiary transition-colors"
            onClick={() => setOpen(false)}
            aria-label="Close sidebar"
          >
            <XIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Sidebar content */}
        <div className="flex-1 overflow-y-auto py-6">
          {/* Main navigation */}
          <nav className="px-3 space-y-1">
            <div className="mb-6">
              <h3 className="px-3 mb-3 text-xs font-medium text-text-tertiary uppercase tracking-wider">
                Platform
              </h3>
              <div className="space-y-1">
                {navigation.map((item) => {
                  const isActive = location.pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                        isActive
                          ? 'bg-background-tertiary text-text-primary'
                          : 'text-text-secondary hover:bg-background-tertiary hover:text-text-primary'
                      }`}
                    >
                      <div className="flex items-center">
                        <span className="text-xs text-text-tertiary mr-3 w-4 opacity-60">{item.number}</span>
                        <item.icon
                          className={`mr-3 h-5 w-5 ${
                            isActive ? 'text-accent-blue' : 'text-text-tertiary group-hover:text-text-secondary'
                          }`}
                        />
                        <span>{item.name}</span>
                      </div>
                      {isActive && <ChevronRightIcon className="h-4 w-4 text-accent-blue" />}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Quick actions section */}
            <div className="mt-8">
              <h3 className="px-3 mb-3 text-xs font-medium text-text-tertiary uppercase tracking-wider">
                Quick Actions
              </h3>
              <div className="space-y-1">
                {quickActions.map((action) => (
                  <button
                    key={action.name}
                    className="group flex items-center w-full px-3 py-2 text-sm font-medium rounded-md text-text-secondary hover:bg-background-tertiary hover:text-text-primary transition-colors text-left"
                  >
                    <action.icon className="mr-3 h-5 w-5 text-text-tertiary group-hover:text-text-secondary" />
                    <div className="flex flex-col">
                      <span>{action.name}</span>
                      <span className="text-xs text-text-tertiary group-hover:text-text-secondary">{action.description}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </nav>
        </div>

        {/* Sidebar footer */}
        <div className="p-4 border-t border-border-light">
          <button className="w-full flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium text-white bg-accent-blue hover:bg-accent-blue-light transition-colors">
            Launch All Modules
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
