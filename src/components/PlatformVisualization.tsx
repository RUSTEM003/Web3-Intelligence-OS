import React, { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, Database, Server, Shield, Cpu, Globe, Zap } from 'lucide-react';

interface Node {
  id: string;
  name: string;
  type: 'core' | 'edge' | 'quantum' | 'civic';
  status: 'active' | 'inactive' | 'syncing';
  connections: string[];
  region: string;
  load: number;
}

interface Module {
  id: string;
  name: string;
  category: 'ai' | 'blockchain' | 'security' | 'data' | 'interface';
  status: 'active' | 'inactive';
  dependencies: string[];
}

const mockNodes: Node[] = [
  { id: 'node1', name: 'Core Node 1', type: 'core', status: 'active', connections: ['node2', 'node4'], region: 'EU', load: 78 },
  { id: 'node2', name: 'Edge Node 1', type: 'edge', status: 'active', connections: ['node1', 'node3'], region: 'US', load: 45 },
  { id: 'node3', name: 'Quantum Node 1', type: 'quantum', status: 'syncing', connections: ['node2', 'node5'], region: 'ASIA', load: 92 },
  { id: 'node4', name: 'Core Node 2', type: 'core', status: 'active', connections: ['node1', 'node5'], region: 'EU', load: 65 },
  { id: 'node5', name: 'Civic Node 1', type: 'civic', status: 'inactive', connections: ['node3', 'node4'], region: 'AFRICA', load: 12 },
];

const mockModules: Module[] = [
  { id: 'cortex', name: 'Cortex Engine', category: 'ai', status: 'active', dependencies: [] },
  { id: 'blockchain', name: 'Blockchain Analyzer', category: 'blockchain', status: 'active', dependencies: ['cortex'] },
  { id: 'security', name: 'Security Monitor', category: 'security', status: 'active', dependencies: ['cortex'] },
  { id: 'data', name: 'Data Processor', category: 'data', status: 'active', dependencies: ['blockchain'] },
  { id: 'interface', name: 'User Interface', category: 'interface', status: 'active', dependencies: ['data', 'security'] },
];

const PlatformVisualization: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'nodes' | 'modules'>('nodes');
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(true);
  const animationRef = useRef<number | null>(null);
  const [time, setTime] = useState(0);

  useEffect(() => {
    if (isAnimating) {
      animationRef.current = requestAnimationFrame(() => {
        setTime(prev => (prev + 1) % 100);
      });
    } else if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isAnimating, time]);

  const getNodeIcon = (type: Node['type']) => {
    switch (type) {
      case 'core':
        return <Server className="h-6 w-6 text-blue-500" />;
      case 'edge':
        return <Globe className="h-6 w-6 text-green-500" />;
      case 'quantum':
        return <Cpu className="h-6 w-6 text-purple-500" />;
      case 'civic':
        return <Database className="h-6 w-6 text-orange-500" />;
      default:
        return <Server className="h-6 w-6 text-gray-500" />;
    }
  };

  const getModuleIcon = (category: Module['category']) => {
    switch (category) {
      case 'ai':
        return <Cpu className="h-6 w-6 text-purple-500" />;
      case 'blockchain':
        return <Database className="h-6 w-6 text-blue-500" />;
      case 'security':
        return <Shield className="h-6 w-6 text-red-500" />;
      case 'data':
        return <Server className="h-6 w-6 text-green-500" />;
      case 'interface':
        return <Globe className="h-6 w-6 text-orange-500" />;
      default:
        return <Cpu className="h-6 w-6 text-gray-500" />;
    }
  };

  const getStatusColor = (status: Node['status'] | Module['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'inactive':
        return 'bg-red-500';
      case 'syncing':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  const renderNodeConnections = () => {
    return mockNodes.map(node => {
      return node.connections.map(targetId => {
        const target = mockNodes.find(n => n.id === targetId);
        if (!target) return null;

        const isActive = node.status === 'active' && target.status === 'active';
        const isSelected = selectedItem === node.id || selectedItem === targetId;

        return (
          <div 
            key={`${node.id}-${targetId}`}
            className={`absolute h-px transition-all duration-300 ${
              isActive 
                ? isSelected 
                  ? 'bg-indigo-500 h-1.5 z-10' 
                  : 'bg-indigo-300 dark:bg-indigo-700' 
                : 'bg-gray-300 dark:bg-gray-700'
            }`}
            style={{
              left: `${(mockNodes.findIndex(n => n.id === node.id) * 20) + 10}%`,
              top: '50%',
              width: `${Math.abs(mockNodes.findIndex(n => n.id === node.id) - mockNodes.findIndex(n => n.id === targetId)) * 20}%`,
              transform: mockNodes.findIndex(n => n.id === node.id) < mockNodes.findIndex(n => n.id === targetId) 
                ? 'translateY(-50%)' 
                : 'translateY(-50%) translateX(-100%)',
              opacity: isSelected || !selectedItem ? 1 : 0.3,
            }}
          >
            {isActive && (
              <div 
                className={`absolute h-2 w-2 rounded-full bg-indigo-500 ${
                  isAnimating ? 'animate-pulse' : ''
                }`}
                style={{
                  left: `${((time % 100) / 100) * 100}%`,
                  top: '-50%',
                  display: isSelected || !selectedItem ? 'block' : 'none',
                }}
              />
            )}
          </div>
        );
      });
    }).flat();
  };

  const renderModuleConnections = () => {
    return mockModules.map(module => {
      return module.dependencies.map(depId => {
        const dependency = mockModules.find(m => m.id === depId);
        if (!dependency) return null;

        const isActive = module.status === 'active' && dependency.status === 'active';
        const isSelected = selectedItem === module.id || selectedItem === depId;

        return (
          <div 
            key={`${module.id}-${depId}`}
            className={`absolute h-px transition-all duration-300 ${
              isActive 
                ? isSelected 
                  ? 'bg-indigo-500 h-1.5 z-10' 
                  : 'bg-indigo-300 dark:bg-indigo-700' 
                : 'bg-gray-300 dark:bg-gray-700'
            }`}
            style={{
              left: `${(mockModules.findIndex(m => m.id === depId) * 20) + 10}%`,
              top: '50%',
              width: `${Math.abs(mockModules.findIndex(m => m.id === depId) - mockModules.findIndex(m => m.id === module.id)) * 20}%`,
              transform: mockModules.findIndex(m => m.id === depId) < mockModules.findIndex(m => m.id === module.id) 
                ? 'translateY(-50%)' 
                : 'translateY(-50%) translateX(-100%)',
              opacity: isSelected || !selectedItem ? 1 : 0.3,
            }}
          >
            {isActive && (
              <div 
                className={`absolute h-2 w-2 rounded-full bg-indigo-500 ${
                  isAnimating ? 'animate-pulse' : ''
                }`}
                style={{
                  left: `${((time % 100) / 100) * 100}%`,
                  top: '-50%',
                  display: isSelected || !selectedItem ? 'block' : 'none',
                }}
              />
            )}
          </div>
        );
      });
    }).flat();
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('nodes')}
            className={`px-4 py-3 text-sm font-medium ${
              activeTab === 'nodes'
                ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-500'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
            aria-current={activeTab === 'nodes' ? 'page' : undefined}
          >
            <div className="flex items-center space-x-2">
              <Server className="h-4 w-4" />
              <span>Nodes</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('modules')}
            className={`px-4 py-3 text-sm font-medium ${
              activeTab === 'modules'
                ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-500'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
            aria-current={activeTab === 'modules' ? 'page' : undefined}
          >
            <div className="flex items-center space-x-2">
              <Cpu className="h-4 w-4" />
              <span>Modules</span>
            </div>
          </button>
        </nav>
      </div>

      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            {activeTab === 'nodes' ? 'Global Node Distribution' : 'Module Dependencies'}
          </h3>
          <button
            onClick={() => setIsAnimating(!isAnimating)}
            className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300"
          >
            {isAnimating ? 'Pause Animation' : 'Resume Animation'}
          </button>
        </div>

        <div className="relative h-64 mb-6 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
          {/* Connection lines */}
          {activeTab === 'nodes' ? renderNodeConnections() : renderModuleConnections()}

          {/* Nodes or Modules */}
          <div className="absolute inset-0 flex items-center justify-between px-4">
            {activeTab === 'nodes' 
              ? mockNodes.map((node, index) => (
                <div
                  key={node.id}
                  className={`relative flex flex-col items-center transition-all duration-300 ${
                    selectedItem === node.id ? 'scale-110 z-20' : selectedItem ? 'opacity-70' : ''
                  }`}
                  style={{ left: `${index * 20}%` }}
                  onMouseEnter={() => setSelectedItem(node.id)}
                  onMouseLeave={() => setSelectedItem(null)}
                >
                  <div className={`p-3 rounded-full bg-white dark:bg-gray-700 shadow-md border-2 ${
                    node.status === 'active' ? 'border-green-500' : 
                    node.status === 'syncing' ? 'border-yellow-500' : 'border-red-500'
                  }`}>
                    {getNodeIcon(node.type)}
                  </div>
                  <div className="mt-2 text-center">
                    <div className="text-xs font-medium text-gray-900 dark:text-white">{node.name}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{node.region}</div>
                    <div className="flex items-center mt-1">
                      <div className={`h-2 w-2 rounded-full mr-1 ${getStatusColor(node.status)}`}></div>
                      <span className="text-xs capitalize">{node.status}</span>
                    </div>
                  </div>
                  {node.status === 'active' && (
                    <div className="mt-1 w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1.5">
                      <div 
                        className="bg-blue-500 h-1.5 rounded-full" 
                        style={{ width: `${node.load}%` }}
                      ></div>
                    </div>
                  )}
                </div>
              ))
              : mockModules.map((module, index) => (
                <div
                  key={module.id}
                  className={`relative flex flex-col items-center transition-all duration-300 ${
                    selectedItem === module.id ? 'scale-110 z-20' : selectedItem ? 'opacity-70' : ''
                  }`}
                  style={{ left: `${index * 20}%` }}
                  onMouseEnter={() => setSelectedItem(module.id)}
                  onMouseLeave={() => setSelectedItem(null)}
                >
                  <div className={`p-3 rounded-full bg-white dark:bg-gray-700 shadow-md border-2 ${
                    module.status === 'active' ? 'border-green-500' : 'border-red-500'
                  }`}>
                    {getModuleIcon(module.category)}
                  </div>
                  <div className="mt-2 text-center">
                    <div className="text-xs font-medium text-gray-900 dark:text-white">{module.name}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">{module.category}</div>
                    <div className="flex items-center mt-1">
                      <div className={`h-2 w-2 rounded-full mr-1 ${getStatusColor(module.status)}`}></div>
                      <span className="text-xs capitalize">{module.status}</span>
                    </div>
                  </div>
                </div>
              ))
            }
          </div>
        </div>

        {/* Legend */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
          {activeTab === 'nodes' ? (
            <>
              <div className="flex items-center">
                <div className="p-1 rounded-full bg-blue-100 dark:bg-blue-900 mr-2">
                  <Server className="h-3 w-3 text-blue-500" />
                </div>
                <span>Core Node</span>
              </div>
              <div className="flex items-center">
                <div className="p-1 rounded-full bg-green-100 dark:bg-green-900 mr-2">
                  <Globe className="h-3 w-3 text-green-500" />
                </div>
                <span>Edge Node</span>
              </div>
              <div className="flex items-center">
                <div className="p-1 rounded-full bg-purple-100 dark:bg-purple-900 mr-2">
                  <Cpu className="h-3 w-3 text-purple-500" />
                </div>
                <span>Quantum Node</span>
              </div>
              <div className="flex items-center">
                <div className="p-1 rounded-full bg-orange-100 dark:bg-orange-900 mr-2">
                  <Database className="h-3 w-3 text-orange-500" />
                </div>
                <span>Civic Node</span>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center">
                <div className="p-1 rounded-full bg-purple-100 dark:bg-purple-900 mr-2">
                  <Cpu className="h-3 w-3 text-purple-500" />
                </div>
                <span>AI</span>
              </div>
              <div className="flex items-center">
                <div className="p-1 rounded-full bg-blue-100 dark:bg-blue-900 mr-2">
                  <Database className="h-3 w-3 text-blue-500" />
                </div>
                <span>Blockchain</span>
              </div>
              <div className="flex items-center">
                <div className="p-1 rounded-full bg-red-100 dark:bg-red-900 mr-2">
                  <Shield className="h-3 w-3 text-red-500" />
                </div>
                <span>Security</span>
              </div>
              <div className="flex items-center">
                <div className="p-1 rounded-full bg-green-100 dark:bg-green-900 mr-2">
                  <Server className="h-3 w-3 text-green-500" />
                </div>
                <span>Data</span>
              </div>
            </>
          )}
        </div>

        <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
          <div className="flex items-start">
            <Zap className="h-5 w-5 text-yellow-500 mr-2 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-white">System Status</h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {activeTab === 'nodes' 
                  ? `${mockNodes.filter(n => n.status === 'active').length} of ${mockNodes.length} nodes active. Global system load: ${Math.round(mockNodes.reduce((acc, node) => acc + node.load, 0) / mockNodes.length)}%`
                  : `${mockModules.filter(m => m.status === 'active').length} of ${mockModules.length} modules active. All critical systems operational.`
                }
              </p>
              <div className="mt-2">
                <a href="#" className="text-xs text-indigo-600 dark:text-indigo-400 flex items-center">
                  View detailed status
                  <ArrowUpRight className="h-3 w-3 ml-1" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlatformVisualization;
