import React from 'react';
import { Server, Activity, Clock, Shield, Zap, Database } from 'lucide-react';

interface NodeStatusCardProps {
  id: string;
  name: string;
  type: 'core' | 'edge' | 'quantum' | 'civic';
  status: 'active' | 'inactive' | 'syncing' | 'error';
  region: string;
  uptime: string;
  load: number;
  memory: number;
  storage: number;
  lastSynced: string;
  securityLevel: 'high' | 'medium' | 'low';
  onClick?: () => void;
}

const NodeStatusCard: React.FC<NodeStatusCardProps> = ({
  id,
  name,
  type,
  status,
  region,
  uptime,
  load,
  memory,
  storage,
  lastSynced,
  securityLevel,
  onClick,
}) => {
  const getNodeIcon = () => {
    switch (type) {
      case 'core':
        return <Server className="h-5 w-5 text-accent-blue" />;
      case 'edge':
        return <Zap className="h-5 w-5 text-accent-green" />;
      case 'quantum':
        return <Activity className="h-5 w-5 text-accent-purple" />;
      case 'civic':
        return <Database className="h-5 w-5 text-accent-orange" />;
      default:
        return <Server className="h-5 w-5 text-accent-blue" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'active':
        return 'bg-accent-green';
      case 'inactive':
        return 'bg-accent-red';
      case 'syncing':
        return 'bg-accent-yellow';
      case 'error':
        return 'bg-accent-red';
      default:
        return 'bg-text-tertiary';
    }
  };

  const getStatusText = () => {
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

  const getSecurityLevelColor = () => {
    switch (securityLevel) {
      case 'high':
        return 'text-accent-green';
      case 'medium':
        return 'text-accent-yellow';
      case 'low':
        return 'text-accent-red';
      default:
        return 'text-text-tertiary';
    }
  };

  const getLoadColor = () => {
    if (load > 80) return 'bg-accent-red';
    if (load > 60) return 'bg-accent-yellow';
    return 'bg-accent-green';
  };

  const getMemoryColor = () => {
    if (memory > 80) return 'bg-accent-red';
    if (memory > 60) return 'bg-accent-yellow';
    return 'bg-accent-green';
  };

  const getStorageColor = () => {
    if (storage > 80) return 'bg-accent-red';
    if (storage > 60) return 'bg-accent-yellow';
    return 'bg-accent-green';
  };

  return (
    <div 
      className={`bg-background-secondary border border-border-light rounded-lg overflow-hidden transition-all duration-300 ${
        onClick ? 'cursor-pointer hover:shadow-lg hover:translate-y-[-2px]' : ''
      }`}
      onClick={onClick}
    >
      <div className="p-4 border-b border-border-light">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <div className="p-2 rounded-md bg-background-tertiary mr-3">
              {getNodeIcon()}
            </div>
            <div>
              <h3 className="text-sm font-medium text-text-primary">{name}</h3>
              <div className="flex items-center mt-1">
                <div className={`h-2 w-2 rounded-full ${getStatusColor()} mr-1.5`}></div>
                <span className="text-xs text-text-secondary">{getStatusText()}</span>
                <span className="mx-1.5 text-text-tertiary">•</span>
                <span className="text-xs text-text-tertiary">{region}</span>
              </div>
            </div>
          </div>
          <div className="text-xs text-text-tertiary bg-background-tertiary px-2 py-1 rounded">
            ID: {id.substring(0, 8)}
          </div>
        </div>
      </div>
      
      <div className="p-4">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <div className="text-xs text-text-tertiary mb-1">Uptime</div>
            <div className="flex items-center">
              <Clock className="h-3.5 w-3.5 text-text-secondary mr-1.5" />
              <span className="text-sm text-text-secondary">{uptime}</span>
            </div>
          </div>
          
          <div>
            <div className="text-xs text-text-tertiary mb-1">Security</div>
            <div className="flex items-center">
              <Shield className="h-3.5 w-3.5 text-text-secondary mr-1.5" />
              <span className={`text-sm ${getSecurityLevelColor()}`}>{securityLevel}</span>
            </div>
          </div>
        </div>
        
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-text-tertiary">CPU Load</span>
              <span className="text-text-secondary">{load}%</span>
            </div>
            <div className="w-full bg-background-tertiary rounded-full h-1.5">
              <div className={`h-1.5 rounded-full ${getLoadColor()}`} style={{ width: `${load}%` }}></div>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-text-tertiary">Memory</span>
              <span className="text-text-secondary">{memory}%</span>
            </div>
            <div className="w-full bg-background-tertiary rounded-full h-1.5">
              <div className={`h-1.5 rounded-full ${getMemoryColor()}`} style={{ width: `${memory}%` }}></div>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-text-tertiary">Storage</span>
              <span className="text-text-secondary">{storage}%</span>
            </div>
            <div className="w-full bg-background-tertiary rounded-full h-1.5">
              <div className={`h-1.5 rounded-full ${getStorageColor()}`} style={{ width: `${storage}%` }}></div>
            </div>
          </div>
        </div>
        
        <div className="mt-4 pt-3 border-t border-border-light">
          <div className="flex items-center text-xs text-text-tertiary">
            <Clock className="h-3.5 w-3.5 mr-1.5" />
            Last synced: <span className="text-text-secondary ml-1">{lastSynced}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NodeStatusCard;
