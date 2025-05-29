import React, { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, Database, Server, Shield, Cpu, Globe, Zap, Activity, Eye, EyeOff, Code, Lock } from 'lucide-react';

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
  const [showDetails, setShowDetails] = useState(true);
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
        return <Server className="h-6 w-6 text-accent-blue" />;
      case 'edge':
        return <Globe className="h-6 w-6 text-accent-green" />;
      case 'quantum':
        return <Cpu className="h-6 w-6 text-accent-purple" />;
      case 'civic':
        return <Database className="h-6 w-6 text-accent-orange" />;
      default:
        return <Server className="h-6 w-6 text-text-tertiary" />;
    }
  };

  const getModuleIcon = (category: Module['category']) => {
    switch (category) {
      case 'ai':
        return <Cpu className="h-6 w-6 text-accent-purple" />;
      case 'blockchain':
        return <Database className="h-6 w-6 text-accent-blue" />;
      case 'security':
        return <Shield className="h-6 w-6 text-accent-red" />;
      case 'data':
        return <Server className="h-6 w-6 text-accent-green" />;
      case 'interface':
        return <Globe className="h-6 w-6 text-accent-orange" />;
      default:
        return <Cpu className="h-6 w-6 text-text-tertiary" />;
    }
  };

  const getStatusColor = (status: Node['status'] | Module['status']) => {
    switch (status) {
      case 'active':
        return 'bg-accent-green';
      case 'inactive':
        return 'bg-accent-red';
      case 'syncing':
        return 'bg-accent-yellow';
      default:
        return 'bg-text-tertiary';
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
                  ? 'bg-accent-blue h-1 z-10' 
                  : 'bg-accent-blue-light opacity-40' 
                : 'bg-border-light opacity-20'
            }`}
            style={{
              left: `${(mockNodes.findIndex(n => n.id === node.id) * 20) + 10}%`,
              top: '50%',
              width: `${Math.abs(mockNodes.findIndex(n => n.id === node.id) - mockNodes.findIndex(n => n.id === targetId)) * 20}%`,
              transform: mockNodes.findIndex(n => n.id === node.id) < mockNodes.findIndex(n => n.id === targetId) 
                ? 'translateY(-50%)' 
                : 'translateY(-50%) translateX(-100%)',
              opacity: isSelected || !selectedItem ? (isActive ? 0.8 : 0.2) : 0.1,
            }}
          >
            {isActive && (
              <div 
                className={`absolute h-1.5 w-1.5 rounded-full bg-accent-blue ${
                  isAnimating ? 'animate-pulse' : ''
                }`}
                style={{
                  left: `${((time % 100) / 100) * 100}%`,
                  top: '-50%',
                  display: isSelected || !selectedItem ? 'block' : 'none',
                  filter: 'drop-shadow(0 0 2px rgba(58, 113, 199, 0.8))',
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
                  ? 'bg-accent-blue h-1 z-10' 
                  : 'bg-accent-blue-light opacity-40' 
                : 'bg-border-light opacity-20'
            }`}
            style={{
              left: `${(mockModules.findIndex(m => m.id === depId) * 20) + 10}%`,
              top: '50%',
              width: `${Math.abs(mockModules.findIndex(m => m.id === depId) - mockModules.findIndex(m => m.id === module.id)) * 20}%`,
              transform: mockModules.findIndex(m => m.id === depId) < mockModules.findIndex(m => m.id === module.id) 
                ? 'translateY(-50%)' 
                : 'translateY(-50%) translateX(-100%)',
              opacity: isSelected || !selectedItem ? (isActive ? 0.8 : 0.2) : 0.1,
            }}
          >
            {isActive && (
              <div 
                className={`absolute h-1.5 w-1.5 rounded-full bg-accent-blue ${
                  isAnimating ? 'animate-pulse' : ''
                }`}
                style={{
                  left: `${((time % 100) / 100) * 100}%`,
                  top: '-50%',
                  display: isSelected || !selectedItem ? 'block' : 'none',
                  filter: 'drop-shadow(0 0 2px rgba(58, 113, 199, 0.8))',
                }}
              />
            )}
          </div>
        );
      });
    }).flat();
  };

  return (
    <div className="bg-background-secondary rounded-lg shadow-xl overflow-hidden border border-border-light">
      <div className="border-b border-border-light">
        <div className="flex justify-between items-center">
          <nav className="flex" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('nodes')}
              className={`px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === 'nodes'
                  ? 'text-accent-blue border-b-2 border-accent-blue'
                  : 'text-text-secondary hover:text-text-primary'
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
              className={`px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === 'modules'
                  ? 'text-accent-blue border-b-2 border-accent-blue'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
              aria-current={activeTab === 'modules' ? 'page' : undefined}
            >
              <div className="flex items-center space-x-2">
                <Cpu className="h-4 w-4" />
                <span>Modules</span>
              </div>
            </button>
          </nav>
          
          <div className="flex items-center gap-2 px-4">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="p-1.5 rounded-md text-text-secondary hover:text-text-primary hover:bg-background-tertiary transition-colors"
              title={showDetails ? "Hide details" : "Show details"}
            >
              {showDetails ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
            <button
              onClick={() => setIsAnimating(!isAnimating)}
              className="p-1.5 rounded-md text-text-secondary hover:text-text-primary hover:bg-background-tertiary transition-colors"
              title={isAnimating ? "Pause animation" : "Resume animation"}
            >
              <Activity className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-lg font-medium text-text-primary">
              {activeTab === 'nodes' ? 'Global Node Distribution' : 'Module Dependencies'}
            </h3>
            <p className="text-xs text-text-tertiary mt-1">
              {activeTab === 'nodes' 
                ? 'Real-time visualization of node connections and status across regions'
                : 'Dependency graph of system modules and their interactions'
              }
            </p>
          </div>
        </div>

        <div className="relative h-72 mb-6 border border-border-light rounded-lg overflow-hidden bg-background-primary glass-dark">
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
                  <div className={`p-3 rounded-full glass shadow-lg border ${
                    node.status === 'active' ? 'border-accent-green' : 
                    node.status === 'syncing' ? 'border-accent-yellow' : 'border-accent-red'
                  }`}>
                    {getNodeIcon(node.type)}
                  </div>
                  {showDetails && (
                    <div className="mt-2 text-center">
                      <div className="text-xs font-medium text-text-primary">{node.name}</div>
                      <div className="text-xs text-text-tertiary">{node.region}</div>
                      <div className="flex items-center mt-1 justify-center">
                        <div className={`h-1.5 w-1.5 rounded-full mr-1 ${getStatusColor(node.status)}`}></div>
                        <span className="text-xs capitalize text-text-secondary">{node.status}</span>
                      </div>
                      {node.status === 'active' && (
                        <div className="mt-1.5 w-full bg-background-tertiary rounded-full h-1">
                          <div 
                            className={`h-1 rounded-full ${
                              node.load > 80 ? 'bg-accent-red' : 
                              node.load > 60 ? 'bg-accent-yellow' : 
                              'bg-accent-green'
                            }`}
                            style={{ width: `${node.load}%` }}
                          ></div>
                        </div>
                      )}
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
                  <div className={`p-3 rounded-full glass shadow-lg border ${
                    module.status === 'active' ? 'border-accent-green' : 'border-accent-red'
                  }`}>
                    {getModuleIcon(module.category)}
                  </div>
                  {showDetails && (
                    <div className="mt-2 text-center">
                      <div className="text-xs font-medium text-text-primary">{module.name}</div>
                      <div className="text-xs text-text-tertiary capitalize">{module.category}</div>
                      <div className="flex items-center mt-1 justify-center">
                        <div className={`h-1.5 w-1.5 rounded-full mr-1 ${getStatusColor(module.status)}`}></div>
                        <span className="text-xs capitalize text-text-secondary">{module.status}</span>
                      </div>
                    </div>
                  )}
                </div>
              ))
            }
          </div>
        </div>

        {/* Legend */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs mb-4">
          {activeTab === 'nodes' ? (
            <>
              <div className="flex items-center">
                <div className="p-1 rounded-full bg-background-tertiary mr-2">
                  <Server className="h-3 w-3 text-accent-blue" />
                </div>
                <span className="text-text-secondary">Core Node</span>
              </div>
              <div className="flex items-center">
                <div className="p-1 rounded-full bg-background-tertiary mr-2">
                  <Globe className="h-3 w-3 text-accent-green" />
                </div>
                <span className="text-text-secondary">Edge Node</span>
              </div>
              <div className="flex items-center">
                <div className="p-1 rounded-full bg-background-tertiary mr-2">
                  <Cpu className="h-3 w-3 text-accent-purple" />
                </div>
                <span className="text-text-secondary">Quantum Node</span>
              </div>
              <div className="flex items-center">
                <div className="p-1 rounded-full bg-background-tertiary mr-2">
                  <Database className="h-3 w-3 text-accent-orange" />
                </div>
                <span className="text-text-secondary">Civic Node</span>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center">
                <div className="p-1 rounded-full bg-background-tertiary mr-2">
                  <Cpu className="h-3 w-3 text-accent-purple" />
                </div>
                <span className="text-text-secondary">AI</span>
              </div>
              <div className="flex items-center">
                <div className="p-1 rounded-full bg-background-tertiary mr-2">
                  <Database className="h-3 w-3 text-accent-blue" />
                </div>
                <span className="text-text-secondary">Blockchain</span>
              </div>
              <div className="flex items-center">
                <div className="p-1 rounded-full bg-background-tertiary mr-2">
                  <Shield className="h-3 w-3 text-accent-red" />
                </div>
                <span className="text-text-secondary">Security</span>
              </div>
              <div className="flex items-center">
                <div className="p-1 rounded-full bg-background-tertiary mr-2">
                  <Server className="h-3 w-3 text-accent-green" />
                </div>
                <span className="text-text-secondary">Data</span>
              </div>
            </>
          )}
        </div>

        <div className="glass p-4 rounded-lg border border-border-light">
          <div className="flex items-start">
            <div className="flex-shrink-0 p-2 rounded-md bg-background-tertiary mr-3">
              <Zap className="h-5 w-5 text-accent-yellow" />
            </div>
            <div>
              <h4 className="text-sm font-medium text-text-primary">System Status</h4>
              <p className="text-xs text-text-secondary mt-1">
                {activeTab === 'nodes' 
                  ? `${mockNodes.filter(n => n.status === 'active').length} of ${mockNodes.length} nodes active. Global system load: ${Math.round(mockNodes.reduce((acc, node) => acc + node.load, 0) / mockNodes.length)}%`
                  : `${mockModules.filter(m => m.status === 'active').length} of ${mockModules.length} modules active. All critical systems operational.`
                }
              </p>
              <div className="flex gap-3 mt-3">
                <button className="text-xs text-accent-blue hover:text-accent-blue-light flex items-center transition-colors">
                  <Code className="h-3 w-3 mr-1" />
                  View logs
                </button>
                <button className="text-xs text-accent-blue hover:text-accent-blue-light flex items-center transition-colors">
                  <Lock className="h-3 w-3 mr-1" />
                  Security report
                </button>
                <button className="text-xs text-accent-blue hover:text-accent-blue-light flex items-center transition-colors">
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                  Detailed status
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlatformVisualization;
