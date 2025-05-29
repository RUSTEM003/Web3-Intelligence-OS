import React, { useState } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { 
  Network, 
  Plus, 
  Filter, 
  Download, 
  Share2, 
  RefreshCw, 
  ExternalLink, 
  BarChart2, 
  PieChart as PieChartIcon, 
  LineChart as LineChartIcon, 
  GitBranch, 
  Maximize2, 
  Info, 
  Settings, 
  Save
} from 'lucide-react';
import Button from '../components/Button';
import SearchInput from '../components/SearchInput';
import DataCard from '../components/DataCard';

const mockGraphs: GraphData[] = [
  {
    id: '1',
    name: 'Transaction Flow Analysis',
    description: 'Visualization of cryptocurrency transaction flows between wallets',
    type: 'network',
    created_at: '2023-05-10T08:30:00Z',
    updated_at: '2023-05-15T14:20:00Z',
    nodes: [
      { id: 'n1', label: 'Wallet A', type: 'source', value: 1200 },
      { id: 'n2', label: 'Wallet B', type: 'target', value: 800 },
      { id: 'n3', label: 'Exchange X', type: 'exchange', value: 1500 },
      { id: 'n4', label: 'Wallet C', type: 'target', value: 400 },
      { id: 'n5', label: 'Mixer Service', type: 'mixer', value: 300 }
    ],
    edges: [
      { id: 'e1', source: 'n1', target: 'n3', value: 500 },
      { id: 'e2', source: 'n3', target: 'n2', value: 300 },
      { id: 'e3', source: 'n1', target: 'n5', value: 200 },
      { id: 'e4', source: 'n5', target: 'n4', value: 150 },
      { id: 'e5', source: 'n3', target: 'n4', value: 100 }
    ]
  },
  {
    id: '2',
    name: 'Risk Assessment Matrix',
    description: 'Visualization of risk factors across different entities',
    type: 'heatmap',
    created_at: '2023-05-12T10:15:00Z',
    updated_at: '2023-05-14T16:30:00Z',
    data: [
      { name: 'Entity A', risk: 0.2, volume: 5000, category: 'Exchange' },
      { name: 'Entity B', risk: 0.8, volume: 3000, category: 'Mixer' },
      { name: 'Entity C', risk: 0.5, volume: 7000, category: 'DeFi' },
      { name: 'Entity D', risk: 0.3, volume: 2000, category: 'Wallet' },
      { name: 'Entity E', risk: 0.9, volume: 1000, category: 'Darknet' }
    ]
  },
  {
    id: '3',
    name: 'Temporal Activity Pattern',
    description: 'Time-based analysis of transaction activities',
    type: 'timeline',
    created_at: '2023-05-08T09:45:00Z',
    updated_at: '2023-05-13T11:20:00Z',
    data: [
      { date: '2023-05-01', transactions: 120, volume: 15000, anomaly: false },
      { date: '2023-05-02', transactions: 150, volume: 18000, anomaly: false },
      { date: '2023-05-03', transactions: 180, volume: 22000, anomaly: false },
      { date: '2023-05-04', transactions: 220, volume: 25000, anomaly: false },
      { date: '2023-05-05', transactions: 350, volume: 40000, anomaly: true },
      { date: '2023-05-06', transactions: 190, volume: 23000, anomaly: false },
      { date: '2023-05-07', transactions: 160, volume: 19000, anomaly: false }
    ]
  }
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

interface GraphData {
  id: string;
  name: string;
  description: string;
  type: 'network' | 'heatmap' | 'timeline';
  created_at: string;
  updated_at: string;
  nodes?: { id: string; label: string; type: string; value: number }[];
  edges?: { id: string; source: string; target: string; value: number }[];
  data?: Array<{
    date?: string;
    name?: string;
    risk?: number;
    volume?: number;
    category?: string;
    transactions?: number;
    anomaly?: boolean;
    [key: string]: any;
  }>;
}

const Graphs: React.FC = () => {
  const [selectedGraph, setSelectedGraph] = useState<GraphData | null>(null);
  const [filter, setFilter] = useState({ type: '', search: '' });
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const filteredGraphs = mockGraphs.filter(graph => {
    return (
      (filter.type === '' || graph.type === filter.type) &&
      (filter.search === '' || 
       graph.name.toLowerCase().includes(filter.search.toLowerCase()) ||
       graph.description.toLowerCase().includes(filter.search.toLowerCase()))
    );
  });

  const renderGraph = (graph: GraphData | null) => {
    if (!graph) return null;

    switch (graph.type) {
      case 'network':
        return (
          <div className="h-96 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <Network className="h-16 w-16 text-indigo-500 mx-auto mb-4" />
              <p className="text-gray-700 dark:text-gray-300">Network Graph Visualization</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{graph.nodes?.length || 0} nodes, {graph.edges?.length || 0} connections</p>
            </div>
          </div>
        );
      
      case 'heatmap':
        return (
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={graph.data}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="volume"
                  nameKey="name"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {graph.data?.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        );
      
      case 'timeline':
        return (
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={graph.data}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="transactions" stroke="#8884d8" activeDot={{ r: 8 }} name="Transactions" />
                <Line yAxisId="right" type="monotone" dataKey="volume" stroke="#82ca9d" name="Volume" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        );
      
      default:
        return (
          <div className="h-96 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
            <p className="text-gray-700 dark:text-gray-300">Unsupported graph type</p>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Graph Intelligence</h1>
          <p className="text-sm text-text-tertiary mt-1">Visualize and analyze blockchain relationships and patterns</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<RefreshCw className="h-4 w-4" />}
          >
            Refresh
          </Button>
          <Button
            variant="primary"
            leftIcon={<Plus className="h-4 w-4" />}
          >
            Create Graph
          </Button>
        </div>
      </div>

      <div className="bg-background-secondary border border-border-light rounded-lg p-5">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <SearchInput 
              placeholder="Search graphs by name, description or type..." 
              value={filter.search}
              onChange={(value) => setFilter({ ...filter, search: value })}
            />
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="w-full md:w-64">
              <select
                className="block w-full py-2 px-3 border border-border-light bg-background-tertiary text-text-secondary rounded-md focus:outline-none focus:ring-1 focus:ring-accent-blue focus:border-accent-blue text-sm"
                value={filter.type}
                onChange={(e) => setFilter({ ...filter, type: e.target.value })}
              >
                <option value="">All Graph Types</option>
                <option value="network">Network</option>
                <option value="heatmap">Heatmap</option>
                <option value="timeline">Timeline</option>
              </select>
            </div>
            
            <div className="flex bg-background-tertiary border border-border-light rounded-md">
              <button
                className={`p-2 ${viewMode === 'grid' ? 'bg-background-elevated text-text-primary' : 'text-text-tertiary'}`}
                onClick={() => setViewMode('grid')}
                aria-label="Grid view"
              >
                <div className="grid grid-cols-2 gap-1 h-4 w-4">
                  <div className="bg-current rounded-sm"></div>
                  <div className="bg-current rounded-sm"></div>
                  <div className="bg-current rounded-sm"></div>
                  <div className="bg-current rounded-sm"></div>
                </div>
              </button>
              <button
                className={`p-2 ${viewMode === 'list' ? 'bg-background-elevated text-text-primary' : 'text-text-tertiary'}`}
                onClick={() => setViewMode('list')}
                aria-label="List view"
              >
                <div className="flex flex-col justify-between h-4 w-4">
                  <div className="h-0.5 bg-current rounded-sm"></div>
                  <div className="h-0.5 bg-current rounded-sm"></div>
                  <div className="h-0.5 bg-current rounded-sm"></div>
                </div>
              </button>
            </div>
          </div>
        </div>

        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredGraphs.map((graph) => (
              <div 
                key={graph.id} 
                className="bg-background-tertiary border border-border-light rounded-lg p-4 cursor-pointer hover:shadow-md transition-all hover:translate-y-[-2px]"
                onClick={() => setSelectedGraph(graph as GraphData)}
              >
                <div className="flex items-center mb-3">
                  {graph.type === 'network' && <GitBranch className="h-5 w-5 text-accent-blue mr-2" />}
                  {graph.type === 'heatmap' && <PieChartIcon className="h-5 w-5 text-accent-green mr-2" />}
                  {graph.type === 'timeline' && <LineChartIcon className="h-5 w-5 text-accent-yellow mr-2" />}
                  <h3 className="text-base font-medium text-text-primary">{graph.name}</h3>
                </div>
                <p className="text-sm text-text-secondary mb-4 line-clamp-2">{graph.description}</p>
                <div className="flex justify-between items-center text-xs text-text-tertiary">
                  <span className="px-2 py-1 bg-background-primary rounded-full text-text-secondary">
                    {graph.type.charAt(0).toUpperCase() + graph.type.slice(1)}
                  </span>
                  <span>Updated {new Date(graph.updated_at).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="border border-border-light rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-border-light">
              <thead className="bg-background-tertiary">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider">Name</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider">Type</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider">Description</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider">Last Updated</th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-background-secondary divide-y divide-border-light">
                {filteredGraphs.map((graph) => (
                  <tr 
                    key={graph.id} 
                    className="hover:bg-background-tertiary cursor-pointer"
                    onClick={() => setSelectedGraph(graph as GraphData)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {graph.type === 'network' && <GitBranch className="h-4 w-4 text-accent-blue mr-2" />}
                        {graph.type === 'heatmap' && <PieChartIcon className="h-4 w-4 text-accent-green mr-2" />}
                        {graph.type === 'timeline' && <LineChartIcon className="h-4 w-4 text-accent-yellow mr-2" />}
                        <span className="text-sm font-medium text-text-primary">{graph.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs bg-background-primary rounded-full text-text-secondary">
                        {graph.type.charAt(0).toUpperCase() + graph.type.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-text-secondary truncate max-w-xs">{graph.description}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-tertiary">
                      {new Date(graph.updated_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button className="text-accent-blue hover:text-accent-blue-light">
                        <ExternalLink className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedGraph && (
        <div className="bg-background-secondary border border-border-light rounded-lg mt-6">
          <div className="border-b border-border-light p-5">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                {selectedGraph.type === 'network' && <GitBranch className="h-5 w-5 text-accent-blue mr-2" />}
                {selectedGraph.type === 'heatmap' && <PieChartIcon className="h-5 w-5 text-accent-green mr-2" />}
                {selectedGraph.type === 'timeline' && <LineChartIcon className="h-5 w-5 text-accent-yellow mr-2" />}
                <h2 className="text-lg font-semibold text-text-primary">{selectedGraph.name}</h2>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="secondary"
                  size="sm"
                  leftIcon={<Download className="h-4 w-4" />}
                >
                  Export
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  leftIcon={<Share2 className="h-4 w-4" />}
                >
                  Share
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  leftIcon={<Maximize2 className="h-4 w-4" />}
                >
                  Fullscreen
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedGraph(null)}
                >
                  Close
                </Button>
              </div>
            </div>
            <p className="text-sm text-text-secondary mt-2">{selectedGraph.description}</p>
          </div>
          
          <div className="p-5">
            <div className="bg-background-primary border border-border-light rounded-lg p-4 mb-6">
              {renderGraph(selectedGraph)}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-1">
                <DataCard
                  title="GRAPH INFORMATION"
                  value=""
                  variant="default"
                  size="lg"
                >
                  <div className="mt-4 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-text-tertiary uppercase">Created</p>
                        <p className="text-sm font-medium text-text-secondary mt-1">
                          {new Date(selectedGraph.created_at).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-text-tertiary uppercase">Last Updated</p>
                        <p className="text-sm font-medium text-text-secondary mt-1">
                          {new Date(selectedGraph.updated_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-text-tertiary uppercase">Type</p>
                        <p className="text-sm font-medium text-text-secondary mt-1">
                          {selectedGraph.type.charAt(0).toUpperCase() + selectedGraph.type.slice(1)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-text-tertiary uppercase">ID</p>
                        <p className="text-sm font-medium text-text-secondary mt-1 font-mono">
                          {selectedGraph.id}
                        </p>
                      </div>
                    </div>
                  </div>
                </DataCard>
              </div>
              
              <div className="md:col-span-2">
                <DataCard
                  title="DATA SUMMARY"
                  value=""
                  variant={selectedGraph.type === 'network' ? 'primary' : selectedGraph.type === 'heatmap' ? 'success' : 'warning'}
                  size="lg"
                >
                  <div className="mt-4">
                    {selectedGraph.type === 'network' && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-3 gap-4">
                          <div className="bg-background-tertiary rounded-lg p-4 text-center">
                            <p className="text-xs text-text-tertiary uppercase">Nodes</p>
                            <p className="text-2xl font-semibold text-text-primary mt-1">
                              {selectedGraph.nodes?.length || 0}
                            </p>
                          </div>
                          <div className="bg-background-tertiary rounded-lg p-4 text-center">
                            <p className="text-xs text-text-tertiary uppercase">Connections</p>
                            <p className="text-2xl font-semibold text-text-primary mt-1">
                              {selectedGraph.edges?.length || 0}
                            </p>
                          </div>
                          <div className="bg-background-tertiary rounded-lg p-4 text-center">
                            <p className="text-xs text-text-tertiary uppercase">Density</p>
                            <p className="text-2xl font-semibold text-text-primary mt-1">
                              {selectedGraph.edges && selectedGraph.nodes 
                                ? (selectedGraph.edges.length / (selectedGraph.nodes.length * (selectedGraph.nodes.length - 1) / 2)).toFixed(2)
                                : '0.00'}
                            </p>
                          </div>
                        </div>
                        
                        <div className="bg-background-tertiary rounded-lg p-4">
                          <h4 className="text-sm font-medium text-text-primary mb-3">Node Types</h4>
                          <div className="grid grid-cols-2 gap-4">
                            {selectedGraph.nodes && [...new Set(selectedGraph.nodes.map(node => node.type))].map((type, index) => (
                              <div key={index} className="flex items-center justify-between">
                                <span className="text-sm text-text-secondary capitalize">{type}</span>
                                <span className="text-sm font-medium text-text-primary">
                                  {selectedGraph.nodes?.filter(node => node.type === type).length || 0}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {(selectedGraph.type === 'heatmap' || selectedGraph.type === 'timeline') && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-background-tertiary rounded-lg p-4 text-center">
                            <p className="text-xs text-text-tertiary uppercase">Data Points</p>
                            <p className="text-2xl font-semibold text-text-primary mt-1">
                              {selectedGraph.data?.length || 0}
                            </p>
                          </div>
                          
                          {selectedGraph.type === 'timeline' && (
                            <div className="bg-background-tertiary rounded-lg p-4 text-center">
                              <p className="text-xs text-text-tertiary uppercase">Anomalies</p>
                              <p className="text-2xl font-semibold text-accent-yellow mt-1">
                                {selectedGraph.data?.filter((d: any) => d.anomaly)?.length || 0}
                              </p>
                            </div>
                          )}
                        </div>
                        
                        {selectedGraph.type === 'timeline' && selectedGraph.data && selectedGraph.data.length > 0 && (
                          <div className="bg-background-tertiary rounded-lg p-4">
                            <h4 className="text-sm font-medium text-text-primary mb-3">Time Range</h4>
                            <div className="flex items-center justify-between">
                              <div className="text-center">
                                <p className="text-xs text-text-tertiary uppercase">Start</p>
                                <p className="text-sm font-medium text-text-primary mt-1">
                                  {selectedGraph.data[0].date}
                                </p>
                              </div>
                              <div className="flex-1 px-4">
                                <div className="h-0.5 bg-background-elevated relative">
                                  <div className="absolute inset-y-0 left-0 bg-accent-blue" style={{ width: '100%' }}></div>
                                </div>
                              </div>
                              <div className="text-center">
                                <p className="text-xs text-text-tertiary uppercase">End</p>
                                <p className="text-sm font-medium text-text-primary mt-1">
                                  {selectedGraph.data[selectedGraph.data.length - 1].date}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {selectedGraph.type === 'heatmap' && selectedGraph.data && (
                          <div className="bg-background-tertiary rounded-lg p-4">
                            <h4 className="text-sm font-medium text-text-primary mb-3">Categories</h4>
                            <div className="grid grid-cols-2 gap-4">
                              {selectedGraph.data && [...new Set(selectedGraph.data.map(item => item.category))].map((category, index) => (
                                <div key={index} className="flex items-center justify-between">
                                  <span className="text-sm text-text-secondary">{category}</span>
                                  <span className="text-sm font-medium text-text-primary">
                                    {selectedGraph.data?.filter(item => item.category === category).length || 0}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </DataCard>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Graphs;
