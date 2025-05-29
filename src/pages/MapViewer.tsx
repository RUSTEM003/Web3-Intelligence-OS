import React, { useState } from 'react';
import { Globe, ZoomIn, ZoomOut, Layers, Info, AlertTriangle } from 'lucide-react';

const mockNodeLocations = [
  { id: 1, type: 'Core', lat: 40.7128, lng: -74.0060, status: 'active', load: 78, country: 'USA' },
  { id: 2, type: 'Edge', lat: 51.5074, lng: -0.1278, status: 'active', load: 65, country: 'UK' },
  { id: 3, type: 'Civic', lat: 48.8566, lng: 2.3522, status: 'active', load: 42, country: 'France' },
  { id: 4, type: 'Privacy', lat: 52.5200, lng: 13.4050, status: 'active', load: 31, country: 'Germany' },
  { id: 5, type: 'Quantum', lat: 35.6762, lng: 139.6503, status: 'active', load: 89, country: 'Japan' },
  { id: 6, type: 'Core', lat: 55.7558, lng: 37.6173, status: 'active', load: 72, country: 'Russia' },
  { id: 7, type: 'Edge', lat: 39.9042, lng: 116.4074, status: 'warning', load: 91, country: 'China' },
  { id: 8, type: 'Civic', lat: -33.8688, lng: 151.2093, status: 'active', load: 45, country: 'Australia' },
  { id: 9, type: 'Privacy', lat: 19.4326, lng: -99.1332, status: 'error', load: 0, country: 'Mexico' },
  { id: 10, type: 'Edge', lat: -23.5505, lng: -46.6333, status: 'active', load: 58, country: 'Brazil' },
  { id: 11, type: 'Core', lat: 28.6139, lng: 77.2090, status: 'warning', load: 87, country: 'India' },
  { id: 12, type: 'Quantum', lat: 1.3521, lng: 103.8198, status: 'active', load: 76, country: 'Singapore' },
];

const MapViewer = () => {
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [filter, setFilter] = useState({ type: '', status: '', country: '' });
  const [view, setView] = useState('global');

  const nodeTypes = Array.from(new Set(mockNodeLocations.map(node => node.type)));
  const nodeStatuses = ['active', 'warning', 'error'];
  const countries = Array.from(new Set(mockNodeLocations.map(node => node.country)));

  const filteredNodes = mockNodeLocations.filter(node => {
    const matchesType = filter.type === '' || node.type === filter.type;
    const matchesStatus = filter.status === '' || node.status === filter.status;
    const matchesCountry = filter.country === '' || node.country === filter.country;
    
    return matchesType && matchesStatus && matchesCountry;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'warning': return 'bg-yellow-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getNodeTypeIcon = (type: string) => {
    switch (type) {
      case 'Core': return <Globe className="h-5 w-5 text-blue-500" />;
      case 'Edge': return <Layers className="h-5 w-5 text-purple-500" />;
      case 'Civic': return <Info className="h-5 w-5 text-green-500" />;
      case 'Privacy': return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'Quantum': return <ZoomIn className="h-5 w-5 text-red-500" />;
      default: return <Globe className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">SimNode Map Viewer</h1>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label htmlFor="nodeType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Node Type
            </label>
            <select
              id="nodeType"
              className="block w-full py-2 px-3 border border-gray-300 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
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
            <label htmlFor="nodeStatus" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Status
            </label>
            <select
              id="nodeStatus"
              className="block w-full py-2 px-3 border border-gray-300 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              value={filter.status}
              onChange={(e) => setFilter({ ...filter, status: e.target.value })}
            >
              <option value="">All Statuses</option>
              {nodeStatuses.map(status => (
                <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="country" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Country
            </label>
            <select
              id="country"
              className="block w-full py-2 px-3 border border-gray-300 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              value={filter.country}
              onChange={(e) => setFilter({ ...filter, country: e.target.value })}
            >
              <option value="">All Countries</option>
              {countries.map(country => (
                <option key={country} value={country}>{country}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="view" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              View
            </label>
            <select
              id="view"
              className="block w-full py-2 px-3 border border-gray-300 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              value={view}
              onChange={(e) => setView(e.target.value)}
            >
              <option value="global">Global</option>
              <option value="regional">Regional</option>
              <option value="local">Local</option>
            </select>
          </div>
        </div>
        
        <div className="relative h-96 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
          {/* This would be replaced with an actual map component like react-map-gl or deck.gl */}
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-gray-500 dark:text-gray-400">
              Interactive WebGL map would be rendered here using deck.gl or similar library
            </p>
          </div>
          
          {/* Map controls */}
          <div className="absolute top-4 right-4 flex flex-col space-y-2">
            <button className="p-2 bg-white dark:bg-gray-800 rounded-full shadow hover:bg-gray-100 dark:hover:bg-gray-700">
              <ZoomIn className="h-5 w-5 text-gray-700 dark:text-gray-300" />
            </button>
            <button className="p-2 bg-white dark:bg-gray-800 rounded-full shadow hover:bg-gray-100 dark:hover:bg-gray-700">
              <ZoomOut className="h-5 w-5 text-gray-700 dark:text-gray-300" />
            </button>
            <button className="p-2 bg-white dark:bg-gray-800 rounded-full shadow hover:bg-gray-100 dark:hover:bg-gray-700">
              <Layers className="h-5 w-5 text-gray-700 dark:text-gray-300" />
            </button>
          </div>
          
          {/* Node markers would be rendered on the map */}
          {/* This is just a placeholder visualization */}
          <div className="absolute inset-0 p-8">
            {filteredNodes.map((node, index) => (
              <div
                key={node.id}
                className="absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2 hover:z-10"
                style={{ 
                  left: `${(node.lng + 180) / 360 * 100}%`, 
                  top: `${(90 - node.lat) / 180 * 100}%` 
                }}
                onClick={() => setSelectedNode(node)}
              >
                <div className={`h-4 w-4 rounded-full ${getStatusColor(node.status)} ring-2 ring-white dark:ring-gray-800`}></div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="col-span-1 md:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Node Distribution</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {nodeTypes.map(type => {
              const count = mockNodeLocations.filter(node => node.type === type).length;
              return (
                <div key={type} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <div className="flex items-center">
                    {getNodeTypeIcon(type)}
                    <h3 className="ml-2 text-md font-medium text-gray-900 dark:text-white">{type} Nodes</h3>
                  </div>
                  <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">{count}</p>
                  <div className="mt-2 h-2 bg-gray-200 dark:bg-gray-600 rounded-full">
                    <div 
                      className="h-2 bg-indigo-600 rounded-full" 
                      style={{ width: `${(count / mockNodeLocations.length) * 100}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Node Status</h2>
          <div className="space-y-4">
            {nodeStatuses.map(status => {
              const count = mockNodeLocations.filter(node => node.status === status).length;
              return (
                <div key={status} className="flex items-center">
                  <div className={`h-4 w-4 rounded-full ${getStatusColor(status)}`}></div>
                  <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </span>
                  <span className="ml-auto text-sm text-gray-500 dark:text-gray-400">
                    {count} nodes
                  </span>
                </div>
              );
            })}
          </div>
          
          <div className="mt-6">
            <h3 className="text-md font-medium mb-2 text-gray-900 dark:text-white">Global Load</h3>
            <div className="flex items-center">
              <div className="flex-1">
                <div className="h-2 bg-gray-200 dark:bg-gray-600 rounded-full">
                  <div 
                    className="h-2 bg-green-500 rounded-full" 
                    style={{ width: '68%' }}
                  ></div>
                </div>
              </div>
              <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">68%</span>
            </div>
          </div>
          
          <div className="mt-6">
            <h3 className="text-md font-medium mb-2 text-gray-900 dark:text-white">Root Node Sync</h3>
            <div className="flex items-center">
              <div className="flex-1">
                <div className="h-2 bg-gray-200 dark:bg-gray-600 rounded-full">
                  <div 
                    className="h-2 bg-indigo-500 rounded-full" 
                    style={{ width: '94%' }}
                  ></div>
                </div>
              </div>
              <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">94%</span>
            </div>
          </div>
        </div>
      </div>
      
      {selectedNode && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Node #{selectedNode.id} ({selectedNode.type})
            </h2>
            <button 
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              onClick={() => setSelectedNode(null)}
            >
              Close
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h3 className="text-md font-medium mb-2 text-gray-900 dark:text-white">Node Information</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Type:</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{selectedNode.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Status:</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      <span className={`inline-block h-2 w-2 rounded-full ${getStatusColor(selectedNode.status)} mr-1`}></span>
                      {selectedNode.status.charAt(0).toUpperCase() + selectedNode.status.slice(1)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Location:</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{selectedNode.country}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Coordinates:</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {selectedNode.lat.toFixed(4)}, {selectedNode.lng.toFixed(4)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h3 className="text-md font-medium mb-2 text-gray-900 dark:text-white">Performance</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Load:</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{selectedNode.load}%</span>
                    </div>
                    <div className="h-2 bg-gray-200 dark:bg-gray-600 rounded-full">
                      <div 
                        className={`h-2 rounded-full ${
                          selectedNode.load > 80 ? 'bg-red-500' : 
                          selectedNode.load > 60 ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${selectedNode.load}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Uptime:</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">99.7%</span>
                    </div>
                    <div className="h-2 bg-gray-200 dark:bg-gray-600 rounded-full">
                      <div className="h-2 bg-green-500 rounded-full" style={{ width: '99.7%' }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Sync:</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">94%</span>
                    </div>
                    <div className="h-2 bg-gray-200 dark:bg-gray-600 rounded-full">
                      <div className="h-2 bg-indigo-500 rounded-full" style={{ width: '94%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-4 flex justify-end space-x-2">
            <button className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600">
              View Details
            </button>
            <button className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              Connect
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapViewer;
