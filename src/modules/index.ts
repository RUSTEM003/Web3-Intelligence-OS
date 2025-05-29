import { Module } from '../core/ModuleRegistry';
import Dashboard from '../pages/Dashboard';
import Nodes from '../pages/Nodes';
import Wallets from '../pages/Wallets';
import Graphs from '../pages/Graphs';
import Documents from '../pages/Documents';
import Settings from '../pages/Settings';
import MapViewer from '../pages/MapViewer';

export const DashboardModule: Module = {
  id: 'dashboard',
  name: 'Dashboard',
  description: 'Main dashboard with overview of system status and metrics',
  version: '0.1.0',
  dependencies: [],
  component: Dashboard,
  isEnabled: true,
};

export const NodesModule: Module = {
  id: 'nodes',
  name: 'Node Management',
  description: 'Management and monitoring of system nodes',
  version: '0.1.0',
  dependencies: ['dashboard'],
  component: Nodes,
  isEnabled: true,
};

export const WalletsModule: Module = {
  id: 'wallets',
  name: 'Wallet Analysis',
  description: 'Analysis and tracking of cryptocurrency wallets',
  version: '0.1.0',
  dependencies: ['dashboard'],
  component: Wallets,
  isEnabled: true,
};

export const GraphsModule: Module = {
  id: 'graphs',
  name: 'Graph Visualization',
  description: 'Visualization of transaction graphs and relationships',
  version: '0.1.0',
  dependencies: ['dashboard', 'wallets'],
  component: Graphs,
  isEnabled: true,
};

export const DocumentsModule: Module = {
  id: 'documents',
  name: 'Document Generation',
  description: 'Generation and management of reports and documents',
  version: '0.1.0',
  dependencies: ['dashboard'],
  component: Documents,
  isEnabled: true,
};

export const MapViewerModule: Module = {
  id: 'map',
  name: 'SimNode Map Viewer',
  description: 'Geographic visualization of node distribution',
  version: '0.1.0',
  dependencies: ['dashboard', 'nodes'],
  component: MapViewer,
  isEnabled: true,
};

export const SettingsModule: Module = {
  id: 'settings',
  name: 'Settings',
  description: 'System configuration and user preferences',
  version: '0.1.0',
  dependencies: [],
  component: Settings,
  isEnabled: true,
};

export const AllModules: Module[] = [
  DashboardModule,
  NodesModule,
  WalletsModule,
  GraphsModule,
  DocumentsModule,
  MapViewerModule,
  SettingsModule,
];

export const registerAllModules = (registerModule: (module: Module) => void) => {
  AllModules.forEach(module => {
    registerModule(module);
  });
};
