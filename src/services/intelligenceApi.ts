import axios from 'axios';
import { ApiResponse } from '../types/api';

const API_BASE_URL = 'https://app-xgxfvqwi.fly.dev';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface SIGINTData {
  id: string;
  type: string;
  frequency: string;
  location: {
    lat: number;
    lng: number;
  };
  status: string;
  encryption: string;
  intercept_time: string;
  metadata: {
    operator: string;
    signal_strength: number;
    bandwidth: string;
  };
}

export interface TECHINTData {
  id: string;
  type: string;
  frequency?: string;
  frequency_range?: string;
  target_network?: string;
  location: {
    lat: number;
    lng: number;
  };
  status: string;
  detection_range?: string;
  protocol?: string;
  range?: string;
  last_update: string;
  metadata: {
    [key: string]: any;
  };
}

export interface QDSP9Status {
  protocol: string;
  status: string;
  encryption_level: string;
  key_rotation: string;
  last_update: string;
  protected_channels: number;
  quantum_entropy: number;
  detection_avoidance: string;
}

export const getSIGINTData = async (): Promise<SIGINTData[]> => {
  try {
    const response = await axiosInstance.get('/api/intelligence/sigint');
    return response.data;
  } catch (error: any) {
    console.error('Error fetching SIGINT data:', error);
    throw new Error(error.response?.data?.detail || 'Failed to fetch SIGINT data');
  }
};

export const getSIGINTById = async (id: string): Promise<SIGINTData> => {
  try {
    const response = await axiosInstance.get(`/api/intelligence/sigint/${id}`);
    return response.data;
  } catch (error: any) {
    console.error(`Error fetching SIGINT data ${id}:`, error);
    throw new Error(error.response?.data?.detail || 'Failed to fetch SIGINT data');
  }
};

export const getTECHINTData = async (): Promise<TECHINTData[]> => {
  try {
    const response = await axiosInstance.get('/api/intelligence/techint');
    return response.data;
  } catch (error: any) {
    console.error('Error fetching TECHINT data:', error);
    throw new Error(error.response?.data?.detail || 'Failed to fetch TECHINT data');
  }
};

export const getTECHINTById = async (id: string): Promise<TECHINTData> => {
  try {
    const response = await axiosInstance.get(`/api/intelligence/techint/${id}`);
    return response.data;
  } catch (error: any) {
    console.error(`Error fetching TECHINT data ${id}:`, error);
    throw new Error(error.response?.data?.detail || 'Failed to fetch TECHINT data');
  }
};

export const getQDSP9Status = async (): Promise<QDSP9Status> => {
  try {
    const response = await axiosInstance.get('/api/intelligence/qdsp9/status');
    return response.data;
  } catch (error: any) {
    console.error('Error fetching QDSP-9 status:', error);
    throw new Error(error.response?.data?.detail || 'Failed to fetch QDSP-9 status');
  }
};

export default {
  getSIGINTData,
  getSIGINTById,
  getTECHINTData,
  getTECHINTById,
  getQDSP9Status
};
