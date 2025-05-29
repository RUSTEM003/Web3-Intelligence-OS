import axios from 'axios';
import {
  ApiResponse,
  ApiErrorResponse,
  Node,
  Wallet,
  Transaction,
  Graph,
  GraphNode,
  GraphEdge,
  Document,
  SyncOperation,
  SyncStatus,
  HealthStatus
} from '../types/api';

let API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://app-xgxfvqwi.fly.dev';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const setApiBaseUrl = (url: string) => {
  API_BASE_URL = url;
  api.defaults.baseURL = url;
};

const handleError = <T>(error: any): ApiResponse<T> => {
  console.error('API Error:', error);
  return {
    data: (Array.isArray(error.response?.data) ? [] : null) as T,
    status: error.response?.status || 500,
    message: error.response?.data?.detail || error.message || 'Unknown error occurred',
  };
};

export const nodesApi = {
  getAll: async (): Promise<ApiResponse<any[]>> => {
    try {
      const response = await api.get('/api/nodes/');
      return { data: response.data, status: response.status };
    } catch (error) {
      return handleError<any[]>(error);
    }
  },
  
  getById: async (id: string): Promise<ApiResponse<any>> => {
    try {
      const response = await api.get(`/api/nodes/${id}/`);
      return { data: response.data, status: response.status };
    } catch (error) {
      return handleError<any>(error);
    }
  },
  
  create: async (nodeData: any): Promise<ApiResponse<any>> => {
    try {
      const response = await api.post('/api/nodes/', nodeData);
      return { data: response.data, status: response.status };
    } catch (error) {
      return handleError<any>(error);
    }
  },
  
  update: async (id: string, nodeData: any): Promise<ApiResponse<any>> => {
    try {
      const response = await api.put(`/api/nodes/${id}/`, nodeData);
      return { data: response.data, status: response.status };
    } catch (error) {
      return handleError<any>(error);
    }
  },
  
  delete: async (id: string): Promise<ApiResponse<any>> => {
    try {
      const response = await api.delete(`/api/nodes/${id}/`);
      return { data: response.data, status: response.status };
    } catch (error) {
      return handleError<any>(error);
    }
  },
  
  connectNodes: async (nodeId: string, targetNodeId: string): Promise<ApiResponse<any>> => {
    try {
      const response = await api.post(`/api/nodes/${nodeId}/connect/`, { target_node_id: targetNodeId });
      return { data: response.data, status: response.status };
    } catch (error) {
      return handleError<any>(error);
    }
  },
  
  updateMetrics: async (nodeId: string, metrics: any): Promise<ApiResponse<any>> => {
    try {
      const response = await api.post(`/api/nodes/${nodeId}/metrics/`, metrics);
      return { data: response.data, status: response.status };
    } catch (error) {
      return handleError<any>(error);
    }
  }
};

export const walletsApi = {
  getAll: async (filters?: any): Promise<ApiResponse<any[]>> => {
    try {
      const response = await api.get('/api/wallets/', { params: filters });
      return { data: response.data, status: response.status };
    } catch (error) {
      return handleError<any[]>(error);
    }
  },
  
  getById: async (id: string): Promise<ApiResponse<any>> => {
    try {
      const response = await api.get(`/api/wallets/${id}/`);
      return { data: response.data, status: response.status };
    } catch (error) {
      return handleError<any>(error);
    }
  },
  
  getByAddress: async (blockchain: string, address: string): Promise<ApiResponse<any>> => {
    try {
      const response = await api.get(`/api/wallets/address/${blockchain}/${address}/`);
      return { data: response.data, status: response.status };
    } catch (error) {
      return handleError<any>(error);
    }
  },
  
  create: async (walletData: any): Promise<ApiResponse<any>> => {
    try {
      const response = await api.post('/api/wallets/', walletData);
      return { data: response.data, status: response.status };
    } catch (error) {
      return handleError<any>(error);
    }
  },
  
  update: async (id: string, walletData: any): Promise<ApiResponse<any>> => {
    try {
      const response = await api.put(`/api/wallets/${id}/`, walletData);
      return { data: response.data, status: response.status };
    } catch (error) {
      return handleError<any>(error);
    }
  },
  
  delete: async (id: string): Promise<ApiResponse<any>> => {
    try {
      const response = await api.delete(`/api/wallets/${id}/`);
      return { data: response.data, status: response.status };
    } catch (error) {
      return handleError<any>(error);
    }
  },
  
  addTransaction: async (walletId: string, transaction: any): Promise<ApiResponse<any>> => {
    try {
      const response = await api.post(`/api/wallets/${walletId}/transactions/`, transaction);
      return { data: response.data, status: response.status };
    } catch (error) {
      return handleError<any>(error);
    }
  },
  
  updateRiskScore: async (walletId: string, riskScore: number): Promise<ApiResponse<any>> => {
    try {
      const response = await api.post(`/api/wallets/${walletId}/risk-score/`, { risk_score: riskScore });
      return { data: response.data, status: response.status };
    } catch (error) {
      return handleError<any>(error);
    }
  }
};

export const graphsApi = {
  getAll: async (name?: string): Promise<ApiResponse<any[]>> => {
    try {
      const response = await api.get('/api/graphs/', { params: { name } });
      return { data: response.data, status: response.status };
    } catch (error) {
      return handleError<any[]>(error);
    }
  },
  
  getById: async (id: string): Promise<ApiResponse<any>> => {
    try {
      const response = await api.get(`/api/graphs/${id}/`);
      return { data: response.data, status: response.status };
    } catch (error) {
      return handleError<any>(error);
    }
  },
  
  create: async (graphData: any): Promise<ApiResponse<any>> => {
    try {
      const response = await api.post('/api/graphs/', graphData);
      return { data: response.data, status: response.status };
    } catch (error) {
      return handleError<any>(error);
    }
  },
  
  update: async (id: string, graphData: any): Promise<ApiResponse<any>> => {
    try {
      const response = await api.put(`/api/graphs/${id}/`, graphData);
      return { data: response.data, status: response.status };
    } catch (error) {
      return handleError<any>(error);
    }
  },
  
  delete: async (id: string): Promise<ApiResponse<any>> => {
    try {
      const response = await api.delete(`/api/graphs/${id}/`);
      return { data: response.data, status: response.status };
    } catch (error) {
      return handleError<any>(error);
    }
  },
  
  addNode: async (graphId: string, node: any): Promise<ApiResponse<any>> => {
    try {
      const response = await api.post(`/api/graphs/${graphId}/nodes/`, node);
      return { data: response.data, status: response.status };
    } catch (error) {
      return handleError<any>(error);
    }
  },
  
  addEdge: async (graphId: string, edge: any): Promise<ApiResponse<any>> => {
    try {
      const response = await api.post(`/api/graphs/${graphId}/edges/`, edge);
      return { data: response.data, status: response.status };
    } catch (error) {
      return handleError<any>(error);
    }
  }
};

export const documentsApi = {
  getAll: async (filters?: any): Promise<ApiResponse<any[]>> => {
    try {
      const response = await api.get('/api/documents/', { params: filters });
      return { data: response.data, status: response.status };
    } catch (error) {
      return handleError<any[]>(error);
    }
  },
  
  getById: async (id: string): Promise<ApiResponse<any>> => {
    try {
      const response = await api.get(`/api/documents/${id}/`);
      return { data: response.data, status: response.status };
    } catch (error) {
      return handleError<any>(error);
    }
  },
  
  create: async (documentData: any): Promise<ApiResponse<any>> => {
    try {
      const response = await api.post('/api/documents/', documentData);
      return { data: response.data, status: response.status };
    } catch (error) {
      return handleError<any>(error);
    }
  },
  
  update: async (id: string, documentData: any): Promise<ApiResponse<any>> => {
    try {
      const response = await api.put(`/api/documents/${id}/`, documentData);
      return { data: response.data, status: response.status };
    } catch (error) {
      return handleError<any>(error);
    }
  },
  
  delete: async (id: string): Promise<ApiResponse<any>> => {
    try {
      const response = await api.delete(`/api/documents/${id}/`);
      return { data: response.data, status: response.status };
    } catch (error) {
      return handleError<any>(error);
    }
  },
  
  generatePdf: async (id: string): Promise<ApiResponse<any>> => {
    try {
      const response = await api.post(`/api/documents/${id}/generate-pdf/`);
      return { data: response.data, status: response.status };
    } catch (error) {
      return handleError<any>(error);
    }
  },
  
  generateMarkdown: async (id: string): Promise<ApiResponse<any>> => {
    try {
      const response = await api.post(`/api/documents/${id}/generate-markdown/`);
      return { data: response.data, status: response.status };
    } catch (error) {
      return handleError<any>(error);
    }
  },
  
  downloadPdf: async (id: string): Promise<string> => {
    return `${API_BASE_URL}/api/documents/${id}/download-pdf/`;
  }
};

export const syncApi = {
  getStatus: async (): Promise<ApiResponse<any>> => {
    try {
      const response = await api.get('/api/sync/status/');
      return { data: response.data, status: response.status };
    } catch (error) {
      return handleError<any>(error);
    }
  },
  
  updateStatus: async (statusData: any): Promise<ApiResponse<any>> => {
    try {
      const response = await api.post('/api/sync/status/', statusData);
      return { data: response.data, status: response.status };
    } catch (error) {
      return handleError<any>(error);
    }
  },
  
  getOperations: async (filters?: any): Promise<ApiResponse<any[]>> => {
    try {
      const response = await api.get('/api/sync/operations/', { params: filters });
      return { data: response.data, status: response.status };
    } catch (error) {
      return handleError<any[]>(error);
    }
  },
  
  createOperation: async (operationData: any): Promise<ApiResponse<any>> => {
    try {
      const response = await api.post('/api/sync/operations/', operationData);
      return { data: response.data, status: response.status };
    } catch (error) {
      return handleError<any>(error);
    }
  },
  
  updateOperation: async (id: string, updateData: any): Promise<ApiResponse<any>> => {
    try {
      const response = await api.put(`/api/sync/operations/${id}/`, updateData);
      return { data: response.data, status: response.status };
    } catch (error) {
      return handleError<any>(error);
    }
  },
  
  addToOfflineQueue: async (operations: any[]): Promise<ApiResponse<any>> => {
    try {
      const response = await api.post('/api/sync/offline-queue/', operations);
      return { data: response.data, status: response.status };
    } catch (error) {
      return handleError<any>(error);
    }
  },
  
  processOfflineQueue: async (): Promise<ApiResponse<any>> => {
    try {
      const response = await api.post('/api/sync/process-offline-queue/');
      return { data: response.data, status: response.status };
    } catch (error) {
      return handleError<any>(error);
    }
  }
};

export const healthApi = {
  check: async (): Promise<ApiResponse<any>> => {
    try {
      const response = await api.get('/healthz/');
      return { data: response.data, status: response.status };
    } catch (error) {
      return handleError<any>(error);
    }
  }
};

export default {
  setApiBaseUrl,
  nodes: nodesApi,
  wallets: walletsApi,
  graphs: graphsApi,
  documents: documentsApi,
  sync: syncApi,
  health: healthApi
};
