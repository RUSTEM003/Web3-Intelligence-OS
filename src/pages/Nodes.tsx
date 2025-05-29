import React, { useState, useEffect } from 'react';
import { 
  Globe, 
  Server, 
  Activity, 
  Plus, 
  Search, 
  Filter, 
  RefreshCw, 
  Download, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  ChevronDown, 
  ChevronUp,
  Cpu,
  Database,
  Wifi,
  Shield,
  Clock,
  MapPin,
  ArrowUpRight,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { nodesApi } from '../services/api';
import { Node as ApiNode } from '../types/api';
import Button from '../components/Button';
import SearchInput from '../components/SearchInput';
import NodeStatusCard from '../components/NodeStatusCard';

interface NodeMetrics {
  cpu: number;
  memory: number;
  network: number;
}

interface NodeLocation {
  lat: number;
  lng: number;
}

interface Node {
  id: string;
  name: string;
  type: 'core' | 'edge' | 'quantum' | 'civic';
  status: 'active' | 'inactive' | 'syncing' | 'error';
  location: NodeLocation;
  country: string;
  ip: string;
  metrics: NodeMetrics;
  services: string[];
  lastSynced?: string;
  securityLevel?: 'high' | 'medium' | 'low';
  uptime?: string;
  region?: string;
}

const mockNodes: Node[] = [
  {
    id: 'node-001',
    name: 'Core Intelligence Node 1',
    type: 'core',
    status: 'active',
    location: { lat: 37.7749, lng: -122.4194 },
    country: 'US',
    ip: '192.168.1.1',
    metrics: { cpu: 0.2, memory: 0.3, network: 0.1 },
    services: ['AI Reason Kernel', 'Graph Sync Manager', 'Quantum Integrity Checker'],
    lastSynced: '2 minutes ago',
    securityLevel: 'high',
    uptime: '99.8%',
    region: 'North America'
  },
  {
    id: 'node-002',
    name: 'Investigative Edge Node 1',
    type: 'edge',
    status: 'active',
    location: { lat: 51.5074, lng: -0.1278 },
    country: 'GB',
    ip: '192.168.1.2',
    metrics: { cpu: 0.4, memory: 0.5, network: 0.3 },
    services: ['Forensic AI Toolkit', 'Local Threat Map Scanner', 'Blockchain Monitor Relay'],
    lastSynced: '5 minutes ago',
    securityLevel: 'medium',
    uptime: '98.2%',
    region: 'Europe'
  },
  {
    id: 'node-003',
    name: 'Civic Gateway Node 1',
    type: 'civic',
    status: 'inactive',
    location: { lat: 48.8566, lng: 2.3522 },
    country: 'FR',
    ip: '192.168.1.3',
    metrics: { cpu: 0.0, memory: 0.0, network: 0.0 },
    services: ['DAO Law Router', 'ID Sync + AML Interface', 'Civic Complaint Responder'],
    lastSynced: '3 days ago',
    securityLevel: 'low',
    uptime: '0%',
    region: 'Europe'
  },
  {
    id: 'node-004',
    name: 'ZeroTrust Privacy Node 1',
    type: 'quantum',
    status: 'error',
    location: { lat: 52.5200, lng: 13.4050 },
    country: 'DE',
    ip: '192.168.1.4',
    metrics: { cpu: 0.3, memory: 0.2, network: 0.4 },
    services: ['zkVPN Gateway', 'Metadata Nullifier', 'Pseudonym Generator'],
    lastSynced: '15 minutes ago',
    securityLevel: 'high',
    uptime: '97.5%',
    region: 'Europe'
  },
  {
    id: 'node-005',
    name: 'Quantum Sync Node 1',
    type: 'quantum',
    status: 'syncing',
    location: { lat: 35.6762, lng: 139.6503 },
    country: 'JP',
    ip: '192.168.1.5',
    metrics: { cpu: 0.1, memory: 0.1, network: 0.2 },
    services: ['PQC Comms (SIKE/Dilithium)', 'Secure Channel Builder', 'Geo-Frequency Encoder'],
    lastSynced: '1 hour ago',
    securityLevel: 'medium',
    uptime: '86.3%',
    region: 'Asia Pacific'
  },
  {
    id: 'node-006',
    name: 'Core Intelligence Node 2',
    type: 'core',
    status: 'active',
    location: { lat: 40.7128, lng: -74.0060 },
    country: 'US',
    ip: '192.168.1.6',
    metrics: { cpu: 0.25, memory: 0.35, network: 0.15 },
    services: ['AI Reason Kernel', 'Graph Sync Manager', 'Quantum Integrity Checker'],
    lastSynced: '3 minutes ago',
    securityLevel: 'high',
    uptime: '99.9%',
    region: 'North America'
  }
];

const Nodes: React.FC = () => {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [filterType, setFilterType] = useState<string>('All');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [filterCountry, setFilterCountry] = useState<string>('All');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNodes = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await nodesApi.getAll();
        if (response.status === 200) {
          const transformedData: Node[] = response.data.map((apiNode: any) => {
            const locationParts = apiNode.location?.split(',') || [];
            const lat = parseFloat(locationParts[0] || '0');
            const lng = parseFloat(locationParts[1] || '0');
            const country = locationParts[2]?.trim() || 'Unknown';
            const region = locationParts[0]?.trim() || 'Unknown';
            
            return {
              id: apiNode.id,
              name: apiNode.name || `Node ${apiNode.id.substring(0, 8)}`,
              type: (apiNode.status?.includes('core') ? 'core' : 
                    apiNode.status?.includes('edge') ? 'edge' : 
                    apiNode.status?.includes('civic') ? 'civic' : 'quantum') as 'core' | 'edge' | 'quantum' | 'civic',
              status: (apiNode.status === 'active' ? 'active' : 
                     apiNode.status === 'inactive' ? 'inactive' : 
                     apiNode.status === 'syncing' ? 'syncing' : 'error') as 'active' | 'inactive' | 'syncing' | 'error',
              location: { 
                lat, 
                lng 
              },
              country,
              ip: apiNode.ip_address || '0.0.0.0',
              metrics: {
                cpu: apiNode.performance_metrics?.cpu_usage || 0,
                memory: apiNode.performance_metrics?.memory_usage || 0,
                network: apiNode.performance_metrics?.network_traffic || 0
              },
              services: ['AI Reason Kernel', 'Graph Sync Manager', 'Quantum Integrity Checker'],
              lastSynced: apiNode.last_sync || 'Never',
              securityLevel: 'medium',
              uptime: '99%',
              region
            };
          });
          setNodes(transformedData);
        } else {
          setError('Failed to fetch nodes data');
        }
      } catch (err) {
        console.error('Error fetching nodes:', err);
        setError('Error fetching nodes data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchNodes();
  }, []);

  const filteredNodes = nodes.filter(node => {
    const matchesSearch = node.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          node.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch && 
           (filterType === 'All' || node.type === filterType) &&
           (filterStatus === 'All' || node.status === filterStatus) &&
           (filterCountry === 'All' || node.country === filterCountry);
  });

  const handleNodeClick = (node: Node) => {
    setSelectedNode(node);
  };

  const getNodeTypeColor = (type: Node['type']) => {
    switch (type) {
      case 'core':
        return 'text-accent-blue';
      case 'edge':
        return 'text-accent-green';
      case 'civic':
        return 'text-accent-yellow';
      case 'quantum':
        return 'text-accent-purple';
      default:
        return 'text-text-tertiary';
    }
  };

  const getNodeTypeIcon = (type: Node['type']) => {
    switch (type) {
      case 'core':
        return <Server className="h-5 w-5" />;
      case 'edge':
        return <Wifi className="h-5 w-5" />;
      case 'civic':
        return <Database className="h-5 w-5" />;
      case 'quantum':
        return <Cpu className="h-5 w-5" />;
      default:
        return <Server className="h-5 w-5" />;
    }
  };

  const getStatusColor = (status: Node['status']) => {
    switch (status) {
      case 'active':
        return 'accent-green';
      case 'inactive':
        return 'accent-red';
      case 'syncing':
        return 'accent-yellow';
      case 'error':
        return 'accent-red';
      default:
        return 'text-tertiary';
    }
  };

  const getStatusText = (status: Node['status']) => {
    switch (status) {
      case 'active':
        return 'Active';
      case 'inactive':
        return 'Inactive';
      case 'syncing':
        return 'Syncing';
      case 'error':
        return 'Error';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className="p-6 bg-background-primary text-text-primary">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-semibold mb-2">Network Nodes</h1>
          <p className="text-text-tertiary text-sm">
            Manage and monitor all nodes in the Web3 Intelligence network
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button
            variant="primary"
            size="md"
            leftIcon={<Plus className="h-4 w-4" />}
          >
            Add Node
          </Button>
          
          <Button
            variant="secondary"
            size="md"
            leftIcon={<RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />}
            onClick={() => {
              const fetchNodes = async () => {
                setIsLoading(true);
                setError(null);
                try {
                  const response = await nodesApi.getAll();
                  if (response.status === 200) {
                    const transformedData: Node[] = response.data.map((apiNode: any) => {
                      const locationParts = apiNode.location?.split(',') || [];
                      const lat = parseFloat(locationParts[0] || '0');
                      const lng = parseFloat(locationParts[1] || '0');
                      const country = locationParts[2]?.trim() || 'Unknown';
                      const region = locationParts[0]?.trim() || 'Unknown';
                      
                      return {
                        id: apiNode.id,
                        name: apiNode.name || `Node ${apiNode.id.substring(0, 8)}`,
                        type: (apiNode.status?.includes('core') ? 'core' : 
                              apiNode.status?.includes('edge') ? 'edge' : 
                              apiNode.status?.includes('civic') ? 'civic' : 'quantum') as 'core' | 'edge' | 'quantum' | 'civic',
                        status: (apiNode.status === 'active' ? 'active' : 
                               apiNode.status === 'inactive' ? 'inactive' : 
                               apiNode.status === 'syncing' ? 'syncing' : 'error') as 'active' | 'inactive' | 'syncing' | 'error',
                        location: { 
                          lat, 
                          lng 
                        },
                        country,
                        ip: apiNode.ip_address || '0.0.0.0',
                        metrics: {
                          cpu: apiNode.performance_metrics?.cpu_usage || 0,
                          memory: apiNode.performance_metrics?.memory_usage || 0,
                          network: apiNode.performance_metrics?.network_traffic || 0
                        },
                        services: ['AI Reason Kernel', 'Graph Sync Manager', 'Quantum Integrity Checker'],
                        lastSynced: apiNode.last_sync || 'Never',
                        securityLevel: 'medium',
                        uptime: '99%',
                        region
                      };
                    });
                    setNodes(transformedData);
                  } else {
                    setError('Failed to fetch nodes data');
                  }
                } catch (err) {
                  console.error('Error fetching nodes:', err);
                  setError('Error fetching nodes data. Please try again later.');
                } finally {
                  setIsLoading(false);
                }
              };
              fetchNodes();
            }}
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : 'Refresh'}
          </Button>
          
          <Button
            variant="tertiary"
            size="md"
            leftIcon={<Download className="h-4 w-4" />}
          >
            Export
          </Button>
        </div>
      </div>

      <div className="mb-6 bg-background-secondary p-4 rounded-lg border border-border-light">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between mb-4">
          <div className="w-full md:w-1/3">
            <SearchInput 
              placeholder="Search nodes..." 
              onSearch={setSearchQuery}
              variant="default"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant={viewMode === 'table' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setViewMode('table')}
            >
              Table
            </Button>
            <Button
              variant={viewMode === 'grid' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              Grid
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-text-tertiary mb-2">Type</label>
            <select
              className="w-full p-2 bg-background-tertiary border border-border-light rounded-md text-text-secondary text-sm focus:outline-none focus:ring-1 focus:ring-accent-blue"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="All">All Types</option>
              <option value="core">Core</option>
              <option value="edge">Edge</option>
              <option value="civic">Civic</option>
              <option value="quantum">Quantum</option>
            </select>
          </div>
          
          <div>
            <label className="block text-xs font-medium text-text-tertiary mb-2">Status</label>
            <select
              className="w-full p-2 bg-background-tertiary border border-border-light rounded-md text-text-secondary text-sm focus:outline-none focus:ring-1 focus:ring-accent-blue"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="All">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="syncing">Syncing</option>
              <option value="error">Error</option>
            </select>
          </div>
          
          <div>
            <label className="block text-xs font-medium text-text-tertiary mb-2">Country</label>
            <select
              className="w-full p-2 bg-background-tertiary border border-border-light rounded-md text-text-secondary text-sm focus:outline-none focus:ring-1 focus:ring-accent-blue"
              value={filterCountry}
              onChange={(e) => setFilterCountry(e.target.value)}
            >
              <option value="All">All Countries</option>
              <option value="US">United States</option>
              <option value="GB">United Kingdom</option>
              <option value="FR">France</option>
              <option value="DE">Germany</option>
              <option value="JP">Japan</option>
            </select>
          </div>
          
          <div>
            <label className="block text-xs font-medium text-text-tertiary mb-2">Actions</label>
            <Button
              variant="secondary"
              size="md"
              fullWidth
              leftIcon={<Filter className="h-4 w-4" />}
            >
              More Filters
            </Button>
          </div>
        </div>
      </div>

      {viewMode === 'table' ? (
        <div className="bg-background-secondary rounded-lg border border-border-light overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border-light">
              <thead>
                <tr className="bg-background-tertiary">
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider">
                    Node
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider">
                    Type
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider">
                    Region
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider">
                    Metrics
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-light">
                {filteredNodes.map((node) => (
                  <tr 
                    key={node.id} 
                    onClick={() => handleNodeClick(node)} 
                    className="cursor-pointer hover:bg-background-tertiary transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center bg-background-tertiary rounded-md">
                          {getNodeTypeIcon(node.type)}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-text-primary">{node.name}</div>
                          <div className="text-xs text-text-tertiary">{node.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`${getNodeTypeColor(node.type)} text-sm`}>
                        {node.type.charAt(0).toUpperCase() + node.type.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-medium rounded-full bg-${getStatusColor(node.status)}-translucent text-${getStatusColor(node.status)}`}>
                        {getStatusText(node.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                      <div className="flex items-center">
                        <MapPin className="h-3 w-3 mr-1 text-text-tertiary" />
                        {node.region || node.country}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-4">
                        <div>
                          <div className="text-xs text-text-tertiary mb-1">CPU</div>
                          <div className="w-16 bg-background-tertiary rounded-full h-1">
                            <div 
                              className={`h-1 rounded-full ${node.metrics.cpu > 0.8 ? 'bg-accent-red' : node.metrics.cpu > 0.6 ? 'bg-accent-yellow' : 'bg-accent-green'}`} 
                              style={{ width: `${node.metrics.cpu * 100}%` }}
                            ></div>
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-text-tertiary mb-1">MEM</div>
                          <div className="w-16 bg-background-tertiary rounded-full h-1">
                            <div 
                              className={`h-1 rounded-full ${node.metrics.memory > 0.8 ? 'bg-accent-red' : node.metrics.memory > 0.6 ? 'bg-accent-yellow' : 'bg-accent-green'}`} 
                              style={{ width: `${node.metrics.memory * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <div className="flex items-center justify-end space-x-2">
                        <button className="p-1 text-text-tertiary hover:text-accent-blue transition-colors">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button className="p-1 text-text-tertiary hover:text-accent-red transition-colors">
                          <Trash2 className="h-4 w-4" />
                        </button>
                        <button className="p-1 text-text-tertiary hover:text-text-primary transition-colors">
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNodes.map((node) => (
            <NodeStatusCard
              key={node.id}
              id={node.id}
              name={node.name}
              type={node.type}
              status={node.status}
              region={node.region || node.country}
              uptime={node.uptime || '0%'}
              load={node.metrics.cpu * 100}
              memory={node.metrics.memory * 100}
              storage={node.metrics.network * 100}
              lastSynced={node.lastSynced || 'Unknown'}
              securityLevel={node.securityLevel || 'medium'}
              onClick={() => handleNodeClick(node)}
            />
          ))}
        </div>
      )}

      {selectedNode && (
        <div className="mt-6 bg-background-secondary rounded-lg border border-border-light overflow-hidden">
          <div className="px-6 py-4 border-b border-border-light flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium text-text-primary">
                Node Details
              </h3>
              <p className="text-sm text-text-tertiary">
                Detailed information about {selectedNode.name}
              </p>
            </div>
            <Button
              variant="tertiary"
              size="sm"
              onClick={() => setSelectedNode(null)}
            >
              Close
            </Button>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-medium text-text-tertiary mb-3">Basic Information</h4>
                  <div className="bg-background-tertiary rounded-lg p-4 space-y-4">
                    <div className="flex justify-between">
                      <span className="text-sm text-text-tertiary">ID</span>
                      <span className="text-sm text-text-secondary font-mono">{selectedNode.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-text-tertiary">Type</span>
                      <span className={`text-sm ${getNodeTypeColor(selectedNode.type)}`}>
                        {selectedNode.type.charAt(0).toUpperCase() + selectedNode.type.slice(1)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-text-tertiary">Status</span>
                      <span className={`text-sm text-${getStatusColor(selectedNode.status)}`}>
                        {getStatusText(selectedNode.status)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-text-tertiary">IP Address</span>
                      <span className="text-sm text-text-secondary font-mono">{selectedNode.ip}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-text-tertiary mb-3">Location</h4>
                  <div className="bg-background-tertiary rounded-lg p-4 space-y-4">
                    <div className="flex justify-between">
                      <span className="text-sm text-text-tertiary">Region</span>
                      <span className="text-sm text-text-secondary">{selectedNode.region || 'Unknown'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-text-tertiary">Country</span>
                      <span className="text-sm text-text-secondary">{selectedNode.country}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-text-tertiary">Coordinates</span>
                      <span className="text-sm text-text-secondary font-mono">
                        {selectedNode.location.lat.toFixed(4)}, {selectedNode.location.lng.toFixed(4)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-medium text-text-tertiary mb-3">Performance Metrics</h4>
                  <div className="bg-background-tertiary rounded-lg p-4 space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-text-tertiary">CPU Load</span>
                        <span className="text-text-secondary">{(selectedNode.metrics.cpu * 100).toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-background-primary rounded-full h-1.5">
                        <div 
                          className={`h-1.5 rounded-full ${selectedNode.metrics.cpu > 0.8 ? 'bg-accent-red' : selectedNode.metrics.cpu > 0.6 ? 'bg-accent-yellow' : 'bg-accent-green'}`} 
                          style={{ width: `${selectedNode.metrics.cpu * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-text-tertiary">Memory Usage</span>
                        <span className="text-text-secondary">{(selectedNode.metrics.memory * 100).toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-background-primary rounded-full h-1.5">
                        <div 
                          className={`h-1.5 rounded-full ${selectedNode.metrics.memory > 0.8 ? 'bg-accent-red' : selectedNode.metrics.memory > 0.6 ? 'bg-accent-yellow' : 'bg-accent-green'}`} 
                          style={{ width: `${selectedNode.metrics.memory * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-text-tertiary">Network Usage</span>
                        <span className="text-text-secondary">{(selectedNode.metrics.network * 100).toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-background-primary rounded-full h-1.5">
                        <div 
                          className={`h-1.5 rounded-full ${selectedNode.metrics.network > 0.8 ? 'bg-accent-red' : selectedNode.metrics.network > 0.6 ? 'bg-accent-yellow' : 'bg-accent-blue'}`} 
                          style={{ width: `${selectedNode.metrics.network * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="flex justify-between pt-2 border-t border-border-light">
                      <span className="text-sm text-text-tertiary">Last Updated</span>
                      <span className="text-sm text-text-secondary">{selectedNode.lastSynced || 'Unknown'}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-text-tertiary mb-3">Services</h4>
                  <div className="bg-background-tertiary rounded-lg p-4">
                    <ul className="divide-y divide-border-light">
                      {selectedNode.services.map((service, index) => (
                        <li key={index} className="py-2 first:pt-0 last:pb-0 flex items-center">
                          <Activity className="h-4 w-4 text-accent-blue mr-2" />
                          <span className="text-sm text-text-secondary">{service}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Nodes;
