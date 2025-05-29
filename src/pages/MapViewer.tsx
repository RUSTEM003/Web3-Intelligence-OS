import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { 
  Globe, 
  ZoomIn, 
  ZoomOut, 
  Layers, 
  Info, 
  AlertTriangle, 
  RefreshCw, 
  Map as MapIcon, 
  Maximize, 
  Minimize, 
  RotateCw, 
  Filter, 
  ChevronDown,
  Loader
} from 'lucide-react';
import Button from '../components/Button';
import SearchInput from '../components/SearchInput';
import DataCard from '../components/DataCard';

import DeckGL from '@deck.gl/react';
import { ScatterplotLayer } from '@deck.gl/layers';
import { MapView } from '@deck.gl/core';
import Map from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';

import { nodesApi } from '../services/api';
import { Node } from '../types/api';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || "pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw";

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
  const [viewState, setViewState] = useState({
    longitude: 0,
    latitude: 20,
    zoom: 1.5,
    pitch: 0,
    bearing: 0,
    minZoom: 1,
    maxZoom: 15
  });
  const deckRef = useRef(null);
  
  const [nodes, setNodes] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchNodesData = async () => {
      try {
        setLoading(true);
        const response = await nodesApi.getAll();
        
        if (response.status === 200) {
          const transformedNodes = response.data.map((node: any) => {
            let lat = 0, lng = 0, country = 'Unknown';
            
            if (node.location) {
              const parts = node.location.split(',');
              if (parts.length >= 2) {
                lat = parseFloat(parts[0]) || Math.random() * 180 - 90;
                lng = parseFloat(parts[1]) || Math.random() * 360 - 180;
                if (parts.length > 2) {
                  country = parts[2].trim();
                }
              }
            } else {
              lat = Math.random() * 180 - 90;
              lng = Math.random() * 360 - 180;
            }
            
            let type = 'Core';
            if (node.name) {
              if (node.name.toLowerCase().includes('edge')) type = 'Edge';
              else if (node.name.toLowerCase().includes('civic')) type = 'Civic';
              else if (node.name.toLowerCase().includes('privacy')) type = 'Privacy';
              else if (node.name.toLowerCase().includes('quantum')) type = 'Quantum';
            }
            
            let status = 'active';
            if (node.status) {
              if (node.status.toLowerCase().includes('error') || 
                  node.status.toLowerCase().includes('fail')) {
                status = 'error';
              } else if (node.status.toLowerCase().includes('warn')) {
                status = 'warning';
              }
            }
            
            return {
              id: node.id,
              type,
              lat,
              lng,
              status,
              load: node.performance_metrics?.cpu_usage || Math.floor(Math.random() * 100),
              country
            };
          });
          
          setNodes(transformedNodes);
        } else {
          console.error('API returned error status:', response.status);
          setError(`API returned status ${response.status}`);
          setNodes(mockNodeLocations);
        }
      } catch (error) {
        console.error('Error fetching nodes:', error);
        setError('Failed to fetch nodes data');
        setNodes(mockNodeLocations);
      } finally {
        setLoading(false);
      }
    };
    
    fetchNodesData();
  }, []);

  const nodeTypes = Array.from(new Set(nodes.map(node => node.type)));
  const nodeStatuses = ['active', 'warning', 'error'];
  const countries = Array.from(new Set(nodes.map(node => node.country)));

  const filteredNodes = nodes.filter(node => {
    const matchesType = filter.type === '' || node.type === filter.type;
    const matchesStatus = filter.status === '' || node.status === filter.status;
    const matchesCountry = filter.country === '' || node.country === filter.country;
    
    return matchesType && matchesStatus && matchesCountry;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-accent-green';
      case 'warning': return 'bg-accent-yellow';
      case 'error': return 'bg-accent-red';
      default: return 'bg-text-tertiary';
    }
  };

  const getNodeTypeIcon = (type: string) => {
    switch (type) {
      case 'Core': return <Globe className="h-5 w-5 text-accent-blue" />;
      case 'Edge': return <Layers className="h-5 w-5 text-accent-purple" />;
      case 'Civic': return <Info className="h-5 w-5 text-accent-green" />;
      case 'Privacy': return <AlertTriangle className="h-5 w-5 text-accent-yellow" />;
      case 'Quantum': return <ZoomIn className="h-5 w-5 text-accent-red" />;
      default: return <Globe className="h-5 w-5 text-text-tertiary" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">SimNode Map Viewer</h1>
          <p className="text-sm text-text-tertiary mt-1">Interactive visualization of global node distribution and performance</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />}
            onClick={() => {
              setLoading(true);
              setError(null);
              nodesApi.getAll().then(response => {
                if (response.status === 200) {
                  const transformedNodes = response.data.map((node: any) => {
                    let lat = 0, lng = 0, country = 'Unknown';
                    
                    if (node.location) {
                      const parts = node.location.split(',');
                      if (parts.length >= 2) {
                        lat = parseFloat(parts[0]) || Math.random() * 180 - 90;
                        lng = parseFloat(parts[1]) || Math.random() * 360 - 180;
                        if (parts.length > 2) {
                          country = parts[2].trim();
                        }
                      }
                    } else {
                      lat = Math.random() * 180 - 90;
                      lng = Math.random() * 360 - 180;
                    }
                    
                    let type = 'Core';
                    if (node.name) {
                      if (node.name.toLowerCase().includes('edge')) type = 'Edge';
                      else if (node.name.toLowerCase().includes('civic')) type = 'Civic';
                      else if (node.name.toLowerCase().includes('privacy')) type = 'Privacy';
                      else if (node.name.toLowerCase().includes('quantum')) type = 'Quantum';
                    }
                    
                    let status = 'active';
                    if (node.status) {
                      if (node.status.toLowerCase().includes('error') || 
                          node.status.toLowerCase().includes('fail')) {
                        status = 'error';
                      } else if (node.status.toLowerCase().includes('warn')) {
                        status = 'warning';
                      }
                    }
                    
                    return {
                      id: node.id,
                      type,
                      lat,
                      lng,
                      status,
                      load: node.performance_metrics?.cpu_usage || Math.floor(Math.random() * 100),
                      country
                    };
                  });
                  
                  setNodes(transformedNodes);
                } else {
                  setError(`API returned status ${response.status}`);
                  setNodes(mockNodeLocations);
                }
              }).catch(error => {
                console.error('Error refreshing nodes:', error);
                setError('Failed to refresh nodes data');
                setNodes(mockNodeLocations);
              }).finally(() => {
                setLoading(false);
              });
            }}
          >
            Refresh
          </Button>
          <Button
            variant="primary"
            leftIcon={<MapIcon className="h-4 w-4" />}
          >
            Export Map
          </Button>
        </div>
      </div>
      
      <div className="bg-background-secondary border border-border-light rounded-lg p-5">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <SearchInput 
              placeholder="Search nodes by ID, type, or location..." 
              variant="default"
            />
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="w-full md:w-40">
              <select
                id="nodeType"
                className="block w-full py-2 px-3 border border-border-light bg-background-tertiary text-text-secondary rounded-md focus:outline-none focus:ring-1 focus:ring-accent-blue focus:border-accent-blue text-sm"
                value={filter.type}
                onChange={(e) => setFilter({ ...filter, type: e.target.value })}
              >
                <option value="">All Types</option>
                {nodeTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            
            <div className="w-full md:w-40">
              <select
                id="nodeStatus"
                className="block w-full py-2 px-3 border border-border-light bg-background-tertiary text-text-secondary rounded-md focus:outline-none focus:ring-1 focus:ring-accent-blue focus:border-accent-blue text-sm"
                value={filter.status}
                onChange={(e) => setFilter({ ...filter, status: e.target.value })}
              >
                <option value="">All Statuses</option>
                {nodeStatuses.map(status => (
                  <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>
                ))}
              </select>
            </div>
            
            <div className="w-full md:w-40">
              <select
                id="country"
                className="block w-full py-2 px-3 border border-border-light bg-background-tertiary text-text-secondary rounded-md focus:outline-none focus:ring-1 focus:ring-accent-blue focus:border-accent-blue text-sm"
                value={filter.country}
                onChange={(e) => setFilter({ ...filter, country: e.target.value })}
              >
                <option value="">All Countries</option>
                {countries.map(country => (
                  <option key={country} value={country}>{country}</option>
                ))}
              </select>
            </div>
            
            <div className="w-full md:w-40">
              <select
                id="view"
                className="block w-full py-2 px-3 border border-border-light bg-background-tertiary text-text-secondary rounded-md focus:outline-none focus:ring-1 focus:ring-accent-blue focus:border-accent-blue text-sm"
                value={view}
                onChange={(e) => setView(e.target.value)}
              >
                <option value="global">Global</option>
                <option value="regional">Regional</option>
                <option value="local">Local</option>
              </select>
            </div>
          </div>
        </div>
        
        <div className="relative h-[500px] bg-background-primary border border-border-light rounded-lg overflow-hidden">
          <DeckGL
            ref={deckRef}
            viewState={viewState}
            onViewStateChange={(evt) => setViewState(evt.viewState as any)}
            controller={true}
            views={new MapView({ id: 'map' })}
            layers={[
              new ScatterplotLayer({
                id: 'nodes-layer',
                data: filteredNodes,
                pickable: true,
                opacity: 0.8,
                stroked: true,
                filled: true,
                radiusScale: 6,
                radiusMinPixels: 5,
                radiusMaxPixels: 15,
                lineWidthMinPixels: 1,
                getPosition: (d: any) => [d.lng, d.lat],
                getRadius: (d: any) => Math.sqrt(d.load || 10) * 0.5,
                getFillColor: (d: any) => {
                  switch (d.status) {
                    case 'active': return [46, 204, 113, 255]; // green
                    case 'warning': return [241, 196, 15, 255]; // yellow
                    case 'error': return [231, 76, 60, 255]; // red
                    default: return [149, 165, 166, 255]; // gray
                  }
                },
                getLineColor: [255, 255, 255, 100],
                onClick: (info: any) => setSelectedNode(info.object),
                updateTriggers: {
                  getFillColor: [filter],
                  getRadius: [filter]
                }
              })
            ]}
          >
            <Map 
              mapStyle="mapbox://styles/mapbox/dark-v10"
              mapboxAccessToken={MAPBOX_TOKEN}
            />
          </DeckGL>
          <div className="absolute bottom-4 left-4 bg-background-secondary bg-opacity-80 border border-border-light rounded-md p-2 text-xs text-text-tertiary">
            Displaying {filteredNodes.length} nodes across {countries.length} countries
          </div>
          
          {/* Map controls */}
          <div className="absolute top-4 right-4 flex flex-col space-y-2">
            <button 
              className="p-2 bg-background-secondary border border-border-light rounded-md shadow-lg hover:bg-background-elevated transition-colors"
              onClick={() => setViewState(prev => ({ ...prev, zoom: Math.min(prev.zoom + 1, prev.maxZoom) }))}
            >
              <ZoomIn className="h-4 w-4 text-text-secondary" />
            </button>
            <button 
              className="p-2 bg-background-secondary border border-border-light rounded-md shadow-lg hover:bg-background-elevated transition-colors"
              onClick={() => setViewState(prev => ({ ...prev, zoom: Math.max(prev.zoom - 1, prev.minZoom) }))}
            >
              <ZoomOut className="h-4 w-4 text-text-secondary" />
            </button>
            <button 
              className="p-2 bg-background-secondary border border-border-light rounded-md shadow-lg hover:bg-background-elevated transition-colors"
              onClick={() => setViewState(prev => ({ ...prev, pitch: prev.pitch === 0 ? 45 : 0 }))}
            >
              <Layers className="h-4 w-4 text-text-secondary" />
            </button>
            <button 
              className="p-2 bg-background-secondary border border-border-light rounded-md shadow-lg hover:bg-background-elevated transition-colors"
              onClick={() => {
                if (deckRef.current) {
                  setViewState({
                    longitude: 0,
                    latitude: 20,
                    zoom: 1.5,
                    pitch: 0,
                    bearing: 0,
                    minZoom: 1,
                    maxZoom: 15
                  });
                }
              }}
            >
              <Maximize className="h-4 w-4 text-text-secondary" />
            </button>
            <button 
              className="p-2 bg-background-secondary border border-border-light rounded-md shadow-lg hover:bg-background-elevated transition-colors"
              onClick={() => setViewState(prev => ({ ...prev, bearing: (prev.bearing + 15) % 360 }))}
            >
              <RotateCw className="h-4 w-4 text-text-secondary" />
            </button>
          </div>
          
          {/* Map legend */}
          <div className="absolute bottom-4 left-4 bg-background-secondary border border-border-light rounded-md p-3 shadow-lg">
            <div className="text-xs font-medium text-text-tertiary mb-2">Node Types</div>
            <div className="space-y-2">
              {nodeTypes.map(type => (
                <div key={type} className="flex items-center">
                  {getNodeTypeIcon(type)}
                  <span className="ml-2 text-xs text-text-secondary">{type}</span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Node markers would be rendered on the map */}
          {/* This is just a placeholder visualization */}
          <div className="absolute inset-0 p-8">
            {filteredNodes.map((node) => (
              <div
                key={node.id}
                className="absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2 hover:z-10 transition-all hover:scale-125"
                style={{ 
                  left: `${(node.lng + 180) / 360 * 100}%`, 
                  top: `${(90 - node.lat) / 180 * 100}%` 
                }}
                onClick={() => setSelectedNode(node)}
              >
                <div className={`h-4 w-4 rounded-full ${getStatusColor(node.status)} ring-2 ring-background-primary shadow-lg`}></div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <div className="col-span-1 md:col-span-2">
          <DataCard
            title="NODE DISTRIBUTION"
            value={`${filteredNodes.length} Nodes`}
            variant="primary"
            size="lg"
          >
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {nodeTypes.map(type => {
                const count = nodes.filter(node => node.type === type).length;
                return (
                  <div key={type} className="bg-background-tertiary border border-border-light p-4 rounded-lg">
                    <div className="flex items-center">
                      {getNodeTypeIcon(type)}
                      <h3 className="ml-2 text-sm font-medium text-text-primary">{type}</h3>
                    </div>
                    <p className="mt-2 text-2xl font-semibold text-text-primary">{count}</p>
                    <div className="mt-2 h-2 bg-background-primary rounded-full overflow-hidden">
                      <div 
                        className="h-2 bg-accent-blue rounded-full" 
                        style={{ width: `${(count / nodes.length) * 100}%` }}
                      ></div>
                    </div>
                    <p className="mt-1 text-xs text-text-tertiary">
                      {((count / nodes.length) * 100).toFixed(1)}% of total
                    </p>
                  </div>
                );
              })}
            </div>
          </DataCard>
        </div>
        
        <div>
          <DataCard
            title="NODE STATUS"
            value="System Health"
            variant="default"
            size="lg"
          >
            <div className="mt-4 space-y-4">
              {nodeStatuses.map(status => {
                const count = nodes.filter(node => node.status === status).length;
                const statusColor = status === 'active' ? 'text-accent-green' : 
                                    status === 'warning' ? 'text-accent-yellow' : 'text-accent-red';
                return (
                  <div key={status} className="flex items-center justify-between bg-background-tertiary border border-border-light p-3 rounded-lg">
                    <div className="flex items-center">
                      <div className={`h-3 w-3 rounded-full ${getStatusColor(status)}`}></div>
                      <span className={`ml-2 text-sm font-medium ${statusColor}`}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </span>
                    </div>
                    <span className="text-sm text-text-secondary">
                      {count} nodes
                    </span>
                  </div>
                );
              })}
              
              <div className="bg-background-tertiary border border-border-light p-4 rounded-lg">
                <h3 className="text-sm font-medium mb-2 text-text-primary">Global Load</h3>
                <div className="flex items-center">
                  <div className="flex-1">
                    <div className="h-2 bg-background-primary rounded-full overflow-hidden">
                      <div 
                        className="h-2 bg-accent-green rounded-full" 
                        style={{ width: '68%' }}
                      ></div>
                    </div>
                  </div>
                  <span className="ml-2 text-sm font-medium text-text-primary">68%</span>
                </div>
                <p className="mt-1 text-xs text-text-tertiary">Average across all nodes</p>
              </div>
              
              <div className="bg-background-tertiary border border-border-light p-4 rounded-lg">
                <h3 className="text-sm font-medium mb-2 text-text-primary">Root Node Sync</h3>
                <div className="flex items-center">
                  <div className="flex-1">
                    <div className="h-2 bg-background-primary rounded-full overflow-hidden">
                      <div 
                        className="h-2 bg-accent-blue rounded-full" 
                        style={{ width: '94%' }}
                      ></div>
                    </div>
                  </div>
                  <span className="ml-2 text-sm font-medium text-text-primary">94%</span>
                </div>
                <p className="mt-1 text-xs text-text-tertiary">Last sync: 3 minutes ago</p>
              </div>
            </div>
          </DataCard>
        </div>
      </div>
      
      {selectedNode && (
        <div className="bg-background-secondary border border-border-light rounded-lg mt-6">
          <div className="border-b border-border-light p-5">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-md bg-background-elevated flex items-center justify-center mr-3">
                  {getNodeTypeIcon(selectedNode.type)}
                </div>
                <h2 className="text-lg font-semibold text-text-primary">
                  Node #{selectedNode.id} <span className="text-text-tertiary">({selectedNode.type})</span>
                </h2>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedNode(null)}
              >
                Close
              </Button>
            </div>
          </div>
          
          <div className="p-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <DataCard
                title="NODE INFORMATION"
                value={selectedNode.country}
                variant="default"
                size="lg"
              >
                <div className="mt-4 space-y-4">
                  <div className="bg-background-tertiary rounded-lg p-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-text-tertiary uppercase">Type</p>
                        <p className="text-sm font-medium text-text-secondary mt-1">
                          {selectedNode.type}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-text-tertiary uppercase">Status</p>
                        <p className="text-sm font-medium text-text-secondary mt-1 flex items-center">
                          <span className={`inline-block h-2 w-2 rounded-full ${getStatusColor(selectedNode.status)} mr-2`}></span>
                          {selectedNode.status.charAt(0).toUpperCase() + selectedNode.status.slice(1)}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-background-tertiary rounded-lg p-4">
                    <p className="text-xs text-text-tertiary uppercase mb-2">Location</p>
                    <div className="flex items-center">
                      <Globe className="h-4 w-4 text-text-tertiary mr-2" />
                      <span className="text-sm font-medium text-text-secondary">
                        {selectedNode.country}
                      </span>
                    </div>
                    <p className="text-xs text-text-tertiary mt-2">
                      Coordinates: {selectedNode.lat.toFixed(4)}, {selectedNode.lng.toFixed(4)}
                    </p>
                  </div>
                  
                  <div className="bg-background-tertiary rounded-lg p-4">
                    <p className="text-xs text-text-tertiary uppercase mb-2">Network</p>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-text-tertiary">IP Address</p>
                        <p className="text-sm font-medium text-text-secondary mt-1">
                          192.168.1.{selectedNode.id}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-text-tertiary">Port</p>
                        <p className="text-sm font-medium text-text-secondary mt-1">
                          {8000 + selectedNode.id}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </DataCard>
              
              <DataCard
                title="PERFORMANCE METRICS"
                value={`${selectedNode.load}% Load`}
                variant={selectedNode.load > 80 ? 'danger' : selectedNode.load > 60 ? 'warning' : 'success'}
                size="lg"
              >
                <div className="mt-4 space-y-4">
                  <div className="bg-background-tertiary rounded-lg p-4">
                    <div className="flex justify-between mb-1">
                      <span className="text-xs text-text-tertiary uppercase">CPU Load</span>
                      <span className="text-sm font-medium text-text-secondary">{selectedNode.load}%</span>
                    </div>
                    <div className="h-2 bg-background-primary rounded-full overflow-hidden">
                      <div 
                        className={`h-2 rounded-full ${
                          selectedNode.load > 80 ? 'bg-accent-red' : 
                          selectedNode.load > 60 ? 'bg-accent-yellow' : 'bg-accent-green'
                        }`}
                        style={{ width: `${selectedNode.load}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-text-tertiary mt-1">
                      {selectedNode.load > 80 ? 'Critical: Node overloaded' : 
                       selectedNode.load > 60 ? 'Warning: High load detected' : 'Normal operation'}
                    </p>
                  </div>
                  
                  <div className="bg-background-tertiary rounded-lg p-4">
                    <div className="flex justify-between mb-1">
                      <span className="text-xs text-text-tertiary uppercase">Uptime</span>
                      <span className="text-sm font-medium text-text-secondary">99.7%</span>
                    </div>
                    <div className="h-2 bg-background-primary rounded-full overflow-hidden">
                      <div className="h-2 bg-accent-green rounded-full" style={{ width: '99.7%' }}></div>
                    </div>
                    <p className="text-xs text-text-tertiary mt-1">
                      Last restart: 14 days ago
                    </p>
                  </div>
                  
                  <div className="bg-background-tertiary rounded-lg p-4">
                    <div className="flex justify-between mb-1">
                      <span className="text-xs text-text-tertiary uppercase">Root Node Sync</span>
                      <span className="text-sm font-medium text-text-secondary">94%</span>
                    </div>
                    <div className="h-2 bg-background-primary rounded-full overflow-hidden">
                      <div className="h-2 bg-accent-blue rounded-full" style={{ width: '94%' }}></div>
                    </div>
                    <p className="text-xs text-text-tertiary mt-1">
                      Last sync: 3 minutes ago
                    </p>
                  </div>
                </div>
              </DataCard>
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
              <Button
                variant="secondary"
                leftIcon={<Info className="h-4 w-4" />}
              >
                View Details
              </Button>
              <Button
                variant="primary"
                leftIcon={<Globe className="h-4 w-4" />}
              >
                Connect
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapViewer;
