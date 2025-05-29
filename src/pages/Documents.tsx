import React, { useState } from 'react';
import { FileText, Search, Plus, Download, FileIcon, Filter, Tag, Calendar, Trash2 } from 'lucide-react';

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

const allTags = Array.from(new Set(mockDocuments.flatMap(doc => doc.tags)));
const formats = ['markdown', 'pdf'];

const Documents = () => {
  const [selectedDocument, setSelectedDocument] = useState<any>(null);
  const [filter, setFilter] = useState({ search: '', format: '', tag: '' });
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const filteredDocuments = mockDocuments.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(filter.search.toLowerCase()) ||
                         doc.content.toLowerCase().includes(filter.search.toLowerCase());
    const matchesFormat = filter.format === '' || doc.format === filter.format;
    const matchesTag = filter.tag === '' || doc.tags.includes(filter.tag);
    
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
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Documents</h1>
        <div className="flex space-x-2">
          <button
            className={`px-3 py-1 rounded-md ${viewMode === 'grid' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200' : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'}`}
            onClick={() => setViewMode('grid')}
          >
            Grid
          </button>
          <button
            className={`px-3 py-1 rounded-md ${viewMode === 'list' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200' : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'}`}
            onClick={() => setViewMode('list')}
          >
            List
          </button>
          <button className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 ml-2">
            <Plus className="h-5 w-5 mr-2" />
            New Document
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="col-span-1 md:col-span-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Search documents..."
                value={filter.search}
                onChange={(e) => setFilter({ ...filter, search: e.target.value })}
              />
            </div>
          </div>
          <div>
            <select
              className="block w-full py-2 px-3 border border-gray-300 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              value={filter.format}
              onChange={(e) => setFilter({ ...filter, format: e.target.value })}
            >
              <option value="">All Formats</option>
              {formats.map(format => (
                <option key={format} value={format}>{format.charAt(0).toUpperCase() + format.slice(1)}</option>
              ))}
            </select>
          </div>
          <div>
            <select
              className="block w-full py-2 px-3 border border-gray-300 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              value={filter.tag}
              onChange={(e) => setFilter({ ...filter, tag: e.target.value })}
            >
              <option value="">All Tags</option>
              {allTags.map(tag => (
                <option key={tag} value={tag}>{tag}</option>
              ))}
            </select>
          </div>
        </div>

        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDocuments.map((doc) => (
              <div 
                key={doc.id} 
                className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setSelectedDocument(doc)}
              >
                <div className="flex items-center mb-2">
                  {getFormatIcon(doc.format)}
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white ml-2">{doc.title}</h3>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-2">{doc.content}</p>
                <div className="flex flex-wrap gap-1 mb-2">
                  {doc.tags.map((tag, index) => (
                    <span 
                      key={index} 
                      className="px-2 py-1 text-xs rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
                  <span>Format: {doc.format}</span>
                  <span>Updated: {formatDate(doc.updated_at)}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Document</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Format</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Tags</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Updated</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                {filteredDocuments.map((doc) => (
                  <tr 
                    key={doc.id} 
                    className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                    onClick={() => setSelectedDocument(doc)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
                          {getFormatIcon(doc.format)}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{doc.title}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">By: {doc.author}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
                        {doc.format}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-wrap gap-1">
                        {doc.tags.slice(0, 2).map((tag, index) => (
                          <span 
                            key={index} 
                            className="px-2 py-1 text-xs rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200"
                          >
                            {tag}
                          </span>
                        ))}
                        {doc.tags.length > 2 && (
                          <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                            +{doc.tags.length - 2}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(doc.updated_at)}
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
        )}
      </div>

      {selectedDocument && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{selectedDocument.title}</h2>
            <div className="flex space-x-2">
              <button className="flex items-center px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600">
                <Download className="h-4 w-4 mr-1" />
                Download
              </button>
              <button className="flex items-center px-3 py-1 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
                <FileText className="h-4 w-4 mr-1" />
                {selectedDocument.format === 'markdown' ? 'Generate PDF' : 'View Markdown'}
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="col-span-1 md:col-span-2">
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">
                  {selectedDocument.content}
                </p>
              </div>
            </div>
            
            <div>
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h3 className="text-md font-medium mb-2 text-gray-900 dark:text-white">Document Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Created</p>
                      <p className="text-sm text-gray-700 dark:text-gray-300">{formatDate(selectedDocument.created_at)}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Updated</p>
                      <p className="text-sm text-gray-700 dark:text-gray-300">{formatDate(selectedDocument.updated_at)}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <FileText className="h-5 w-5 text-gray-400 mr-2" />
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Format</p>
                      <p className="text-sm text-gray-700 dark:text-gray-300">{selectedDocument.format}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Tag className="h-5 w-5 text-gray-400 mr-2" />
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Tags</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {selectedDocument.tags.map((tag: string, index: number) => (
                          <span 
                            key={index} 
                            className="px-2 py-1 text-xs rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Documents;
