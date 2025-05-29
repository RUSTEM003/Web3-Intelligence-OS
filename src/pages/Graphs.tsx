import React, { useState } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Network, Plus, Filter, Download, Share2 } from 'lucide-react';

const mockGraphs = [
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

const Graphs = () => {
  const [selectedGraph, setSelectedGraph] = useState<any>(null);
  const [filter, setFilter] = useState({ type: '', search: '' });

  const filteredGraphs = mockGraphs.filter(graph => {
    return (
      (filter.type === '' || graph.type === filter.type) &&
      (filter.search === '' || 
       graph.name.toLowerCase().includes(filter.search.toLowerCase()) ||
       graph.description.toLowerCase().includes(filter.search.toLowerCase()))
    );
  });

  const renderGraph = (graph: any) => {
    if (!graph) return null;

    switch (graph.type) {
      case 'network':
        return (
          <div className="h-96 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <Network className="h-16 w-16 text-indigo-500 mx-auto mb-4" />
              <p className="text-gray-700 dark:text-gray-300">Network Graph Visualization</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{graph.nodes.length} nodes, {graph.edges.length} connections</p>
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
                  {graph.data.map((entry: any, index: number) => (
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
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Graphs</h1>
        <button className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
          <Plus className="h-5 w-5 mr-2" />
          Create Graph
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Search graphs..."
                value={filter.search}
                onChange={(e) => setFilter({ ...filter, search: e.target.value })}
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Filter className="h-5 w-5 text-gray-400" />
              </div>
            </div>
          </div>
          <div className="w-full md:w-64">
            <select
              className="block w-full py-2 px-3 border border-gray-300 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              value={filter.type}
              onChange={(e) => setFilter({ ...filter, type: e.target.value })}
            >
              <option value="">All Graph Types</option>
              <option value="network">Network</option>
              <option value="heatmap">Heatmap</option>
              <option value="timeline">Timeline</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredGraphs.map((graph) => (
            <div 
              key={graph.id} 
              className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setSelectedGraph(graph)}
            >
              <div className="flex items-center mb-2">
                <Network className="h-6 w-6 text-indigo-500 mr-2" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">{graph.name}</h3>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{graph.description}</p>
              <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
                <span>Type: {graph.type}</span>
                <span>Updated: {new Date(graph.updated_at).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedGraph && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{selectedGraph.name}</h2>
            <div className="flex space-x-2">
              <button className="flex items-center px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600">
                <Download className="h-4 w-4 mr-1" />
                Export
              </button>
              <button className="flex items-center px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600">
                <Share2 className="h-4 w-4 mr-1" />
                Share
              </button>
            </div>
          </div>
          
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{selectedGraph.description}</p>
          
          {renderGraph(selectedGraph)}
          
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-md font-medium mb-2 text-gray-900 dark:text-white">Graph Information</h3>
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Created</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {new Date(selectedGraph.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Last Updated</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {new Date(selectedGraph.updated_at).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Type</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedGraph.type}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">ID</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedGraph.id}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-md font-medium mb-2 text-gray-900 dark:text-white">Data Summary</h3>
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                {selectedGraph.type === 'network' && (
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Nodes</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{selectedGraph.nodes.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Connections</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{selectedGraph.edges.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Density</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {(selectedGraph.edges.length / (selectedGraph.nodes.length * (selectedGraph.nodes.length - 1) / 2)).toFixed(2)}
                      </span>
                    </div>
                  </div>
                )}
                {(selectedGraph.type === 'heatmap' || selectedGraph.type === 'timeline') && (
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Data Points</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{selectedGraph.data.length}</span>
                    </div>
                    {selectedGraph.type === 'timeline' && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500 dark:text-gray-400">Time Range</span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {selectedGraph.data[0].date} to {selectedGraph.data[selectedGraph.data.length - 1].date}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500 dark:text-gray-400">Anomalies</span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {selectedGraph.data.filter((d: any) => d.anomaly).length}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Graphs;
