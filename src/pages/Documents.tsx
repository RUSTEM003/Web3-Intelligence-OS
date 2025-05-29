import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Search, 
  Plus, 
  Download, 
  FileIcon, 
  Filter, 
  Tag, 
  Calendar, 
  Trash2, 
  RefreshCw, 
  ExternalLink, 
  Edit, 
  MoreHorizontal, 
  ChevronDown, 
  ChevronUp, 
  Clock, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Eye, 
  Share2,
  AlertTriangle,
  Loader2
} from 'lucide-react';
import Button from '../components/Button';
import SearchInput from '../components/SearchInput';
import DataCard from '../components/DataCard';
import { documentsApi } from '../services/api';

const mockDocuments = [
  {
    id: '1',
    title: 'Transaction Analysis Report',
    content: 'This report analyzes suspicious transaction patterns across multiple blockchains...',
    format: 'markdown',
    tags: ['Analysis', 'Transactions', 'Report'],
    created_at: '2023-05-10T08:30:00Z',
    updated_at: '2023-05-15T14:20:00Z',
    author: 'AI Analyst',
    pdf_url: '/api/documents/1/download-pdf'
  },
  {
    id: '2',
    title: 'Legal Framework for Blockchain Investigations',
    content: 'This document outlines the legal considerations when conducting blockchain investigations...',
    format: 'pdf',
    tags: ['Legal', 'Framework', 'Compliance'],
    created_at: '2023-05-08T10:15:00Z',
    updated_at: '2023-05-12T16:30:00Z',
    author: 'Legal Team',
    pdf_url: '/api/documents/2/download-pdf'
  },
  {
    id: '3',
    title: 'Node Deployment Guide',
    content: 'Step-by-step instructions for deploying and configuring different types of nodes...',
    format: 'markdown',
    tags: ['Technical', 'Deployment', 'Guide'],
    created_at: '2023-05-05T09:45:00Z',
    updated_at: '2023-05-11T11:20:00Z',
    author: 'DevOps Team',
    pdf_url: '/api/documents/3/download-pdf'
  },
  {
    id: '4',
    title: 'Wallet Risk Assessment Methodology',
    content: 'This document describes the methodology used for assessing risk scores of cryptocurrency wallets...',
    format: 'markdown',
    tags: ['Risk', 'Methodology', 'Wallets'],
    created_at: '2023-05-02T14:30:00Z',
    updated_at: '2023-05-09T10:45:00Z',
    author: 'Risk Analysis Team',
    pdf_url: '/api/documents/4/download-pdf'
  },
  {
    id: '5',
    title: 'Quarterly Threat Intelligence Report',
    content: 'Summary of emerging threats, attack vectors, and defensive strategies in the cryptocurrency space...',
    format: 'pdf',
    tags: ['Threat Intelligence', 'Quarterly', 'Report'],
    created_at: '2023-04-01T08:00:00Z',
    updated_at: '2023-04-15T16:20:00Z',
    author: 'Threat Intelligence Team',
    pdf_url: '/api/documents/5/download-pdf'
  }
];

const Documents = () => {
  const [selectedDocument, setSelectedDocument] = useState<any>(null);
  const [filter, setFilter] = useState({ search: '', format: '', tag: '' });
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const allTags = React.useMemo(() => 
    Array.from(new Set(documents.flatMap(doc => doc.tags || []))),
    [documents]
  );
const formats = ['markdown', 'pdf'];

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await documentsApi.getAll();
      
      if (response.status === 200) {
        setDocuments(response.data);
      } else {
        console.error('API returned error status:', response.status);
        setError(`Failed to fetch documents data. Status: ${response.status}`);
        setDocuments(mockDocuments);
      }
    } catch (err) {
      console.error('Error fetching documents:', err);
      setError('Error fetching documents data. Please try again later.');
      setDocuments(mockDocuments);
    } finally {
      setLoading(false);
    }
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(filter.search.toLowerCase()) ||
                         doc.content.toLowerCase().includes(filter.search.toLowerCase());
    const matchesFormat = filter.format === '' || doc.format === filter.format;
    const matchesTag = filter.tag === '' || (doc.tags && doc.tags.includes(filter.tag));
    
    return matchesSearch && matchesFormat && matchesTag;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'pdf':
        return <FileText className="h-5 w-5 text-red-500" />;
      case 'markdown':
        return <FileText className="h-5 w-5 text-blue-500" />;
      default:
        return <FileIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Document Intelligence</h1>
          <p className="text-sm text-text-tertiary mt-1">Manage and analyze blockchain-related documents and reports</p>
        </div>
        <div className="flex items-center space-x-3">
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
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />}
            onClick={fetchDocuments}
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Refresh'}
          </Button>
          <Button
            variant="primary"
            leftIcon={<Plus className="h-4 w-4" />}
          >
            New Document
          </Button>
        </div>
      </div>

      <div className="bg-background-secondary border border-border-light rounded-lg p-5">
        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-red-500 dark:text-red-400 mr-2" />
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          </div>
        )}
        
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <SearchInput 
              placeholder="Search documents by title, content or tags..." 
              value={filter.search}
              onChange={(value) => setFilter({ ...filter, search: value })}
              disabled={loading}
            />
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="w-full md:w-48">
              <select
                className="block w-full py-2 px-3 border border-border-light bg-background-tertiary text-text-secondary rounded-md focus:outline-none focus:ring-1 focus:ring-accent-blue focus:border-accent-blue text-sm"
                value={filter.format}
                onChange={(e) => setFilter({ ...filter, format: e.target.value })}
                disabled={loading}
              >
                <option value="">All Formats</option>
                {formats.map(format => (
                  <option key={format} value={format}>{format.charAt(0).toUpperCase() + format.slice(1)}</option>
                ))}
              </select>
            </div>
            
            <div className="w-full md:w-48">
              <select
                className="block w-full py-2 px-3 border border-border-light bg-background-tertiary text-text-secondary rounded-md focus:outline-none focus:ring-1 focus:ring-accent-blue focus:border-accent-blue text-sm"
                value={filter.tag}
                onChange={(e) => setFilter({ ...filter, tag: e.target.value })}
                disabled={loading}
              >
                <option value="">All Tags</option>
                {allTags.map((tag: string) => (
                  <option key={tag} value={tag}>{tag}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="h-12 w-12 text-accent-blue animate-spin mb-4" />
            <p className="text-text-secondary">Loading document data...</p>
          </div>
        ) : filteredDocuments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-text-tertiary">
            <FileText className="h-12 w-12 mb-4" />
            <p className="text-lg font-medium mb-2">No documents found</p>
            <p className="text-sm">
              {filter.search || filter.format || filter.tag ? 
                'Try adjusting your filters or create a new document.' : 
                'Create your first document to start organizing your blockchain research.'}
            </p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDocuments.map((doc) => (
              <div 
                key={doc.id} 
                className="bg-background-tertiary border border-border-light rounded-lg p-4 cursor-pointer hover:shadow-md transition-all hover:translate-y-[-2px]"
                onClick={() => setSelectedDocument(doc)}
              >
                <div className="flex items-center mb-3">
                  <div className="h-10 w-10 rounded-md bg-background-elevated flex items-center justify-center mr-3">
                    {getFormatIcon(doc.format)}
                  </div>
                  <div>
                    <h3 className="text-base font-medium text-text-primary">{doc.title}</h3>
                    <p className="text-xs text-text-tertiary">By: {doc.author}</p>
                  </div>
                </div>
                
                <p className="text-sm text-text-secondary mb-4 line-clamp-2">{doc.content}</p>
                
                <div className="flex flex-wrap gap-1 mb-3">
                  {doc.tags && doc.tags.map((tag: string, index: number) => (
                    <span 
                      key={index} 
                      className="px-2 py-1 text-xs rounded-full bg-background-primary border border-border-light text-text-secondary"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                
                <div className="flex justify-between items-center text-xs text-text-tertiary pt-2 border-t border-border-light">
                  <span className="flex items-center">
                    <FileText className="h-3 w-3 mr-1" />
                    {doc.format.toUpperCase()}
                  </span>
                  <span className="flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {formatDate(doc.updated_at)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="border border-border-light rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-border-light">
              <thead className="bg-background-tertiary">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider">Document</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider">Format</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider">Tags</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider">Updated</th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-background-secondary divide-y divide-border-light">
                {filteredDocuments.map((doc) => (
                  <tr 
                    key={doc.id} 
                    className="hover:bg-background-tertiary cursor-pointer"
                    onClick={() => setSelectedDocument(doc)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-md bg-background-elevated flex items-center justify-center">
                          {getFormatIcon(doc.format)}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-text-primary">{doc.title}</div>
                          <div className="text-xs text-text-tertiary">By: {doc.author}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs rounded-full bg-background-primary border border-border-light text-text-secondary">
                        {doc.format.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-wrap gap-1">
                        {doc.tags && doc.tags.slice(0, 2).map((tag: string, index: number) => (
                          <span 
                            key={index} 
                            className="px-2 py-1 text-xs rounded-full bg-background-primary border border-border-light text-text-secondary"
                          >
                            {tag}
                          </span>
                        ))}
                        {doc.tags.length > 2 && (
                          <span className="px-2 py-1 text-xs rounded-full bg-background-elevated text-text-tertiary">
                            +{doc.tags.length - 2}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-tertiary">
                      {formatDate(doc.updated_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button className="p-1 text-text-tertiary hover:text-accent-blue transition-colors">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="p-1 text-text-tertiary hover:text-accent-blue transition-colors">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button className="p-1 text-text-tertiary hover:text-accent-red transition-colors">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedDocument && (
        <div className="bg-background-secondary border border-border-light rounded-lg mt-6">
          <div className="border-b border-border-light p-5">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-md bg-background-elevated flex items-center justify-center mr-3">
                  {getFormatIcon(selectedDocument.format)}
                </div>
                <h2 className="text-lg font-semibold text-text-primary">{selectedDocument.title}</h2>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="secondary"
                  size="sm"
                  leftIcon={<Download className="h-4 w-4" />}
                >
                  Download
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  leftIcon={<Share2 className="h-4 w-4" />}
                >
                  Share
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={<FileText className="h-4 w-4" />}
                >
                  {selectedDocument.format === 'markdown' ? 'Generate PDF' : 'View Markdown'}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedDocument(null)}
                >
                  Close
                </Button>
              </div>
            </div>
            <p className="text-sm text-text-secondary mt-2">By: {selectedDocument.author}</p>
          </div>
          
          <div className="p-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <DataCard
                  title="DOCUMENT CONTENT"
                  value=""
                  variant="default"
                  size="lg"
                >
                  <div className="mt-4 bg-background-tertiary border border-border-light rounded-lg p-4">
                    <p className="text-sm text-text-secondary whitespace-pre-line">
                      {selectedDocument.content}
                    </p>
                  </div>
                </DataCard>
              </div>
              
              <div className="md:col-span-1">
                <DataCard
                  title="DOCUMENT INFORMATION"
                  value=""
                  variant="primary"
                  size="lg"
                >
                  <div className="mt-4 space-y-4">
                    <div className="bg-background-tertiary rounded-lg p-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-text-tertiary uppercase">Created</p>
                          <p className="text-sm font-medium text-text-secondary mt-1">
                            {formatDate(selectedDocument.created_at)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-text-tertiary uppercase">Updated</p>
                          <p className="text-sm font-medium text-text-secondary mt-1">
                            {formatDate(selectedDocument.updated_at)}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-background-tertiary rounded-lg p-4">
                      <p className="text-xs text-text-tertiary uppercase mb-2">Format</p>
                      <div className="flex items-center">
                        {getFormatIcon(selectedDocument.format)}
                        <span className="text-sm font-medium text-text-secondary ml-2">
                          {selectedDocument.format.toUpperCase()}
                        </span>
                      </div>
                    </div>
                    
                    <div className="bg-background-tertiary rounded-lg p-4">
                      <p className="text-xs text-text-tertiary uppercase mb-2">Tags</p>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {selectedDocument.tags && selectedDocument.tags.map((tag: string, index: number) => (
                          <span 
                            key={index} 
                            className="px-2 py-1 text-xs rounded-full bg-background-primary border border-border-light text-text-secondary"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div className="bg-background-tertiary rounded-lg p-4">
                      <p className="text-xs text-text-tertiary uppercase mb-2">Actions</p>
                      <div className="flex flex-col space-y-2">
                        <button className="flex items-center text-sm text-accent-blue hover:text-accent-blue-light transition-colors">
                          <Download className="h-4 w-4 mr-2" />
                          Download PDF
                        </button>
                        <button className="flex items-center text-sm text-accent-blue hover:text-accent-blue-light transition-colors">
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Document
                        </button>
                        <button className="flex items-center text-sm text-accent-red hover:text-accent-red-light transition-colors">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Document
                        </button>
                      </div>
                    </div>
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

export default Documents;
