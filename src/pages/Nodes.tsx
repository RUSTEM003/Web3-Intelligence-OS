import React, { useState } from 'react';
import { Globe, Server, Activity, Plus } from 'lucide-react';

const mockNodes = [
  {
    id: '1',
    name: 'Core Intelligence Node 1',
    type: 'Core',
    status: 'Active',
    location: { lat: 37.7749, lng: -122.4194 },
    country: 'US',
    ip: '192.168.1.1',
    metrics: { cpu: 0.2, memory: 0.3, network: 0.1 },
    services: ['AI Reason Kernel', 'Graph Sync Manager', 'Quantum Integrity Checker']
  },
  {
    id: '2',
    name: 'Investigative Edge Node 1',
    type: 'Edge',
    status: 'Active',
    location: { lat: 51.5074, lng: -0.1278 },
    country: 'GB',
    ip: '192.168.1.2',
    metrics: { cpu: 0.4, memory: 0.5, network: 0.3 },
    services: ['Forensic AI Toolkit', 'Local Threat Map Scanner', 'Blockchain Monitor Relay']
  },
  {
    id: '3',
    name: 'Civic Gateway Node 1',
    type: 'Civic',
    status: 'Inactive',
    location: { lat: 48.8566, lng: 2.3522 },
    country: 'FR',
    ip: '192.168.1.3',
    metrics: { cpu: 0.0, memory: 0.0, network: 0.0 },
    services: ['DAO Law Router', 'ID Sync + AML Interface', 'Civic Complaint Responder']
  },
  {
    id: '4',
    name: 'ZeroTrust Privacy Node 1',
    type: 'Privacy',
    status: 'Active',
    location: { lat: 52.5200, lng: 13.4050 },
    country: 'DE',
    ip: '192.168.1.4',
    metrics: { cpu: 0.3, memory: 0.2, network: 0.4 },
    services: ['zkVPN Gateway', 'Metadata Nullifier', 'Pseudonym Generator']
  },
  {
    id: '5',
    name: 'Quantum Sync Node 1',
    type: 'Quantum',
    status: 'Active',
    location: { lat: 35.6762, lng: 139.6503 },
    country: 'JP',
    ip: '192.168.1.5',
    metrics: { cpu: 0.1, memory: 0.1, network: 0.2 },
    services: ['PQC Comms (SIKE/Dilithium)', 'Secure Channel Builder', 'Geo-Frequency Encoder']
  }
];

const Nodes = () => {
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [filter, setFilter] = useState({ type: '', status: '', country: '' });

  const filteredNodes = mockNodes.filter(node => {
    return (
      (filter.type === '' || node.type === filter.type) &&
      (filter.status === '' || node.status === filter.status) &&
      (filter.country === '' || node.country === filter.country)
    );
  });

  const nodeTypes = ['Core', 'Edge', 'Civic', 'Privacy', 'Quantum'];
  const statusTypes = ['Active', 'Inactive'];
  const countries = ['US', 'GB', 'FR', 'DE', 'JP'];

  const getNodeTypeColor = (type: string) => {
    switch (type) {
      case 'Core': return 'bg-blue-500';
      case 'Edge': return 'bg-green-500';
      case 'Civic': return 'bg-yellow-500';
      case 'Privacy': return 'bg-purple-500';
      case 'Quantum': return 'bg-pink-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Nodes</h1>
        <button className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
          <Plus className="h-5 w-5 mr-2" />
          Add Node
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Node Type</label>
            <select
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              value={filter.type}
              onChange={(e) => setFilter({ ...filter, type: e.target.value })}
            >
              <option value="">All Types</option>
              {nodeTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
            <select
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              value={filter.status}
              onChange={(e) => setFilter({ ...filter, status: e.target.value })}
            >
              <option value="">All Statuses</option>
              {statusTypes.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Country</label>
            <select
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              value={filter.country}
              onChange={(e) => setFilter({ ...filter, country: e.target.value })}
            >
              <option value="">All Countries</option>
              {countries.map(country => (
                <option key={country} value={country}>{country}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Node</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Type</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Country</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">IP Address</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
              {filteredNodes.map((node) => (
                <tr 
                  key={node.id} 
                  className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                  onClick={() => setSelectedNode(node)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className={`flex-shrink-0 h-10 w-10 rounded-full ${getNodeTypeColor(node.type)} flex items-center justify-center text-white`}>
                        <Server className="h-5 w-5" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{node.name}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">ID: {node.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getNodeTypeColor(node.type)} text-white`}>
                      {node.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${node.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {node.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {node.country}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {node.ip}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 mr-3">
                      Edit
                    </button>
                    <button className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedNode && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Node Details: {selectedNode.name}</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-md font-medium mb-2 text-gray-900 dark:text-white">Performance Metrics</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">CPU Usage</span>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{selectedNode.metrics.cpu * 100}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                    <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${selectedNode.metrics.cpu * 100}%` }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Memory Usage</span>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{selectedNode.metrics.memory * 100}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                    <div className="bg-green-600 h-2.5 rounded-full" style={{ width: `${selectedNode.metrics.memory * 100}%` }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Network Load</span>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{selectedNode.metrics.network * 100}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                    <div className="bg-purple-600 h-2.5 rounded-full" style={{ width: `${selectedNode.metrics.network * 100}%` }}></div>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-md font-medium mb-2 text-gray-900 dark:text-white">Services</h3>
              <ul className="space-y-2">
                {selectedNode.services.map((service: string, index: number) => (
                  <li key={index} className="flex items-center">
                    <Activity className="h-5 w-5 text-indigo-500 mr-2" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{service}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className="mt-4">
            <h3 className="text-md font-medium mb-2 text-gray-900 dark:text-white">Location</h3>
            <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <Globe className="h-8 w-8 text-indigo-500 mx-auto mb-2" />
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Lat: {selectedNode.location.lat}, Lng: {selectedNode.location.lng}
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Country: {selectedNode.country}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Nodes;
