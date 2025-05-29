export interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
}

export type ApiErrorResponse = ApiResponse<null>;

export interface ApiNode {
  id: string;
  name: string;
  status: string;
  ip_address: string;
  location: string;
  last_sync: string;
  performance_metrics: {
    cpu_usage: number;
    memory_usage: number;
    disk_usage: number;
    network_traffic: number;
  };
}

export interface Node {
  id: string;
  name: string;
  type: 'core' | 'edge' | 'quantum' | 'civic';
  status: 'active' | 'inactive' | 'syncing' | 'error';
  location: {
    lat: number;
    lng: number;
  };
  country: string;
  ip: string;
  metrics: {
    cpu: number;
    memory: number;
    network: number;
  };
  services: string[];
  lastSynced: string;
  securityLevel: string;
  uptime: string;
  region: string;
}

export interface Transaction {
  id: string;
  from_address: string;
  to_address: string;
  amount: number;
  currency: string;
  timestamp: string;
  status: string;
  blockchain: string;
}

export interface Wallet {
  id: string;
  address: string;
  blockchain: string;
  balance: number;
  risk_score: number;
  transactions: Transaction[];
  tags: string[];
  last_activity: string;
}

export interface GraphNode {
  id: string;
  label: string;
  type: string;
  properties: Record<string, any>;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  label: string;
  properties: Record<string, any>;
}

export interface Graph {
  id: string;
  name: string;
  description: string;
  nodes: GraphNode[];
  edges: GraphEdge[];
  created_at: string;
  updated_at: string;
  tags: string[];
}

export interface Document {
  id: string;
  title: string;
  content: string;
  format: string;
  created_at: string;
  updated_at: string;
  tags: string[];
  related_entities: string[];
}

export interface SyncOperation {
  id: string;
  operation_type: string;
  status: string;
  entity_type: string;
  entity_id: string;
  timestamp: string;
  data: Record<string, any>;
}

export interface SyncStatus {
  last_sync: string;
  pending_operations: number;
  sync_in_progress: boolean;
}

export interface HealthStatus {
  status: string;
  version: string;
  uptime: number;
}
