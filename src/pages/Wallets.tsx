import React, { useState, useEffect } from 'react';
import { 
  Wallet, 
  AlertTriangle, 
  Plus, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Tag, 
  RefreshCw, 
  Download, 
  Filter, 
  ExternalLink, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  ChevronDown, 
  ChevronUp, 
  Shield, 
  Eye,
  Loader2
} from 'lucide-react';
import Button from '../components/Button';
import SearchInput from '../components/SearchInput';
import DataCard from '../components/DataCard';
import { walletsApi } from '../services/api';

interface WalletTransaction {
  id: string;
  type: 'incoming' | 'outgoing';
  amount: number;
  timestamp: string;
  from?: string;
  to?: string;
}

const mockWallets = [
  {
    id: '1',
    address: '0x1234567890abcdef1234567890abcdef12345678',
    blockchain: 'Ethereum',
    balance: 2.45,
    risk_score: 0.1,
    tags: ['Exchange', 'Verified'],
    transactions: [
      { id: '1', type: 'incoming', amount: 1.2, timestamp: '2023-05-15T10:30:00Z', from: '0xabcdef1234567890abcdef1234567890abcdef12' },
      { id: '2', type: 'outgoing', amount: 0.5, timestamp: '2023-05-16T14:20:00Z', to: '0x7890abcdef1234567890abcdef1234567890abcd' }
    ]
  },
  {
    id: '2',
    address: '0x7890abcdef1234567890abcdef1234567890abcd',
    blockchain: 'Bitcoin',
    balance: 0.15,
    risk_score: 0.05,
    tags: ['Personal'],
    transactions: [
      { id: '3', type: 'incoming', amount: 0.1, timestamp: '2023-05-10T08:15:00Z', from: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa' }
    ]
  },
  {
    id: '3',
    address: 'tz1KqTpEZ7Yob7QbPE4Hy4Wo8fHG8LhKxZSx',
    blockchain: 'Tezos',
    balance: 150.75,
    risk_score: 0.02,
    tags: ['DeFi', 'Staking'],
    transactions: [
      { id: '4', type: 'outgoing', amount: 50, timestamp: '2023-05-12T16:45:00Z', to: 'tz1VSUr8wwNhLAzempoch5d6hLRiTh8Cjcjb' },
      { id: '5', type: 'incoming', amount: 5.5, timestamp: '2023-05-14T11:30:00Z', from: 'tz1aSkwEot3L2kmUvcoxzjMomb9mvBNuzFK6' }
    ]
  },
  {
    id: '4',
    address: 'cosmos1abcdef1234567890abcdef1234567890abcdef',
    blockchain: 'Cosmos',
    balance: 75.25,
    risk_score: 0.01,
    tags: ['Validator'],
    transactions: []
  },
  {
    id: '5',
    address: '0x9876543210abcdef1234567890abcdef12345678',
    blockchain: 'Polygon',
    balance: 1250.50,
    risk_score: 0.85,
    tags: ['Suspicious', 'High Risk'],
    transactions: [
      { id: '6', type: 'incoming', amount: 1000, timestamp: '2023-05-01T09:20:00Z', from: '0xdeadbeef1234567890abcdef1234567890abcdef' },
      { id: '7', type: 'outgoing', amount: 500, timestamp: '2023-05-02T10:15:00Z', to: '0xbadcafe1234567890abcdef1234567890abcdef' },
      { id: '8', type: 'outgoing', amount: 250, timestamp: '2023-05-03T14:30:00Z', to: '0xfeedface1234567890abcdef1234567890abcdef' }
    ]
  }
];

const Wallets = () => {
  const [selectedWallet, setSelectedWallet] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBlockchain, setFilterBlockchain] = useState('');
  const [filterRiskScore, setFilterRiskScore] = useState<number | null>(null);
  const [wallets, setWallets] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchWallets();
  }, []);

  const fetchWallets = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await walletsApi.getAll();
      
      if (response.status === 200) {
        setWallets(response.data);
      } else {
        console.error('API returned error status:', response.status);
        setError(`Failed to fetch wallets data. Status: ${response.status}`);
        setWallets(mockWallets);
      }
    } catch (err) {
      console.error('Error fetching wallets:', err);
      setError('Error fetching wallets data. Please try again later.');
      setWallets(mockWallets);
    } finally {
      setLoading(false);
    }
  };

  const filteredWallets = wallets.filter(wallet => {
    const matchesSearch = wallet.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (wallet.tags && wallet.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())));
    const matchesBlockchain = filterBlockchain === '' || wallet.blockchain === filterBlockchain;
    const matchesRiskScore = filterRiskScore === null || wallet.risk_score >= filterRiskScore;
    
    return matchesSearch && matchesBlockchain && matchesRiskScore;
  });

  const blockchains = Array.from(new Set(wallets.map(wallet => wallet.blockchain)));
  const riskScores = [
    { value: 0.8, label: 'High Risk (80%+)' },
    { value: 0.5, label: 'Medium Risk (50%+)' },
    { value: 0.2, label: 'Low Risk (20%+)' },
    { value: 0, label: 'All Risk Levels' }
  ];

  const getRiskScoreColor = (score: number) => {
    if (score >= 0.7) return 'bg-red-500';
    if (score >= 0.4) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const formatAddress = (address: string) => {
    if (address.length <= 16) return address;
    return `${address.substring(0, 8)}...${address.substring(address.length - 8)}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Wallets</h1>
        <button className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
          <Plus className="h-5 w-5 mr-2" />
          Add Wallet
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">Wallet Explorer</h2>
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />}
            onClick={fetchWallets}
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Refresh'}
          </Button>
        </div>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-red-500 dark:text-red-400 mr-2" />
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="col-span-1 md:col-span-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Filter className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Search by address or tag"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>
          <div>
            <select
              className="block w-full py-2 px-3 border border-gray-300 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              value={filterBlockchain}
              onChange={(e) => setFilterBlockchain(e.target.value)}
              disabled={loading}
            >
              <option value="">All Blockchains</option>
              {blockchains.map(blockchain => (
                <option key={blockchain} value={blockchain}>{blockchain}</option>
              ))}
            </select>
          </div>
          <div>
            <select
              className="block w-full py-2 px-3 border border-gray-300 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              value={filterRiskScore === null ? '' : filterRiskScore.toString()}
              onChange={(e) => setFilterRiskScore(e.target.value === '' ? null : parseFloat(e.target.value))}
              disabled={loading}
            >
              <option value="">All Risk Levels</option>
              {riskScores.map(score => (
                <option key={score.value} value={score.value}>{score.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="h-12 w-12 text-indigo-600 dark:text-indigo-400 animate-spin mb-4" />
              <p className="text-gray-700 dark:text-gray-300">Loading wallet data...</p>
            </div>
          ) : filteredWallets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-500 dark:text-gray-400">
              <Wallet className="h-12 w-12 mb-4" />
              <p className="text-lg font-medium mb-2">No wallets found</p>
              <p className="text-sm">
                {searchTerm || filterBlockchain || filterRiskScore !== null ? 
                  'Try adjusting your filters or add a new wallet.' : 
                  'Add your first wallet to start tracking blockchain assets.'}
              </p>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Wallet</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Blockchain</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Balance</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Risk Score</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Tags</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                {filteredWallets.map((wallet) => (
                  <tr 
                    key={wallet.id} 
                    className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                    onClick={() => setSelectedWallet(wallet)}
                  >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
                        <Wallet className="h-5 w-5 text-indigo-600 dark:text-indigo-300" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{formatAddress(wallet.address)}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">ID: {wallet.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {wallet.blockchain}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {wallet.balance.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className={`h-2.5 w-2.5 rounded-full ${getRiskScoreColor(wallet.risk_score)} mr-2`}></div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">{(wallet.risk_score * 100).toFixed(0)}%</span>
                      {wallet.risk_score >= 0.7 && (
                        <AlertTriangle className="h-4 w-4 text-red-500 ml-2" />
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-wrap gap-1">
                      {wallet.tags.map((tag, index) => (
                        <span 
                          key={index} 
                          className={`px-2 py-1 inline-flex text-xs leading-4 font-medium rounded-full ${
                            tag === 'Suspicious' || tag === 'High Risk' 
                              ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' 
                              : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200'
                          }`}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
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
          )}
        </div>
      </div>

      {selectedWallet && (
        <div className="mt-6 bg-background-secondary rounded-lg border border-border-light overflow-hidden">
          <div className="px-6 py-4 border-b border-border-light flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium text-text-primary">
                Wallet Details
              </h3>
              <p className="text-sm text-text-tertiary">
                Detailed information about wallet {formatAddress(selectedWallet.address)}
              </p>
            </div>
            <Button
              variant="tertiary"
              size="sm"
              onClick={() => setSelectedWallet(null)}
            >
              Close
            </Button>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-medium text-text-tertiary mb-3">Wallet Information</h4>
                  <div className="bg-background-tertiary rounded-lg p-4 space-y-4">
                    <div className="flex justify-between">
                      <span className="text-sm text-text-tertiary">Address</span>
                      <span className="text-sm text-text-secondary font-mono break-all">{selectedWallet.address}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-text-tertiary">Blockchain</span>
                      <span className="text-sm text-text-secondary">{selectedWallet.blockchain}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-text-tertiary">Balance</span>
                      <span className="text-sm text-text-secondary">{selectedWallet.balance.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-text-tertiary">Risk Score</span>
                      <div className="flex items-center">
                        <div className={`h-2.5 w-2.5 rounded-full ${
                          selectedWallet.risk_score >= 0.7 ? 'bg-accent-red' : 
                          selectedWallet.risk_score >= 0.4 ? 'bg-accent-yellow' : 
                          'bg-accent-green'
                        } mr-2`}></div>
                        <span className="text-sm text-text-secondary">{(selectedWallet.risk_score * 100).toFixed(0)}%</span>
                        {selectedWallet.risk_score >= 0.7 && (
                          <AlertTriangle className="h-4 w-4 text-accent-red ml-2" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-text-tertiary mb-3">Security Analysis</h4>
                  <div className="bg-background-tertiary rounded-lg p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Shield className="h-4 w-4 text-accent-blue mr-2" />
                        <span className="text-sm text-text-secondary">Security Score</span>
                      </div>
                      <span className={`text-sm ${selectedWallet.risk_score < 0.3 ? 'text-accent-green' : selectedWallet.risk_score < 0.7 ? 'text-accent-yellow' : 'text-accent-red'}`}>
                        {selectedWallet.risk_score < 0.3 ? 'High' : selectedWallet.risk_score < 0.7 ? 'Medium' : 'Low'}
                      </span>
                    </div>
                    
                    <div className="w-full bg-background-primary rounded-full h-1.5">
                      <div 
                        className={`h-1.5 rounded-full ${
                          selectedWallet.risk_score >= 0.7 ? 'bg-accent-red' : 
                          selectedWallet.risk_score >= 0.4 ? 'bg-accent-yellow' : 
                          'bg-accent-green'
                        }`} 
                        style={{ width: `${(1 - selectedWallet.risk_score) * 100}%` }}
                      ></div>
                    </div>
                    
                    <div className="text-xs text-text-tertiary">
                      {selectedWallet.risk_score >= 0.7 
                        ? 'High risk wallet. Suspicious activity detected.' 
                        : selectedWallet.risk_score >= 0.4 
                          ? 'Medium risk wallet. Some unusual patterns detected.' 
                          : 'Low risk wallet. No suspicious activity detected.'}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-medium text-text-tertiary mb-3">Tags</h4>
                  <div className="bg-background-tertiary rounded-lg p-4">
                    <div className="flex flex-wrap gap-2">
                      {selectedWallet.tags.map((tag: string, index: number) => (
                        <div 
                          key={index} 
                          className={`flex items-center px-3 py-1 rounded-full ${
                            tag === 'Suspicious' || tag === 'High Risk' 
                              ? 'bg-accent-red-translucent text-accent-red' 
                              : tag === 'Verified' || tag === 'Personal'
                                ? 'bg-accent-green-translucent text-accent-green'
                                : 'bg-accent-blue-translucent text-accent-blue'
                          }`}
                        >
                          <Tag className="h-4 w-4 mr-1" />
                          <span>{tag}</span>
                        </div>
                      ))}
                      <button className="flex items-center px-3 py-1 rounded-full border border-dashed border-border-light text-text-tertiary hover:text-text-secondary hover:border-text-tertiary transition-colors">
                        <Plus className="h-4 w-4 mr-1" />
                        <span>Add Tag</span>
                      </button>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-text-tertiary mb-3">Actions</h4>
                  <div className="bg-background-tertiary rounded-lg p-4 grid grid-cols-2 gap-3">
                    <Button
                      variant="primary"
                      size="sm"
                      leftIcon={<Eye className="h-4 w-4" />}
                      fullWidth
                    >
                      View on Explorer
                    </Button>
                    
                    <Button
                      variant="secondary"
                      size="sm"
                      leftIcon={<Edit className="h-4 w-4" />}
                      fullWidth
                    >
                      Edit Wallet
                    </Button>
                    
                    <Button
                      variant="secondary"
                      size="sm"
                      leftIcon={<Download className="h-4 w-4" />}
                      fullWidth
                    >
                      Export Data
                    </Button>
                    
                    <Button
                      variant="danger"
                      size="sm"
                      leftIcon={<Trash2 className="h-4 w-4" />}
                      fullWidth
                    >
                      Delete Wallet
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-text-tertiary mb-3">Transaction History</h4>
              {selectedWallet.transactions.length > 0 ? (
                <div className="bg-background-tertiary rounded-lg p-4">
                  <div className="space-y-3">
                    {selectedWallet.transactions.map((tx: WalletTransaction) => (
                      <div key={tx.id} className="flex items-center justify-between p-3 bg-background-secondary rounded-lg border border-border-light">
                        <div className="flex items-center">
                          {tx.type === 'incoming' ? (
                            <div className="h-8 w-8 rounded-full bg-accent-green-translucent flex items-center justify-center mr-3">
                              <ArrowDownLeft className="h-4 w-4 text-accent-green" />
                            </div>
                          ) : (
                            <div className="h-8 w-8 rounded-full bg-accent-red-translucent flex items-center justify-center mr-3">
                              <ArrowUpRight className="h-4 w-4 text-accent-red" />
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-medium text-text-primary">
                              {tx.type === 'incoming' ? 'Received' : 'Sent'} {tx.amount.toFixed(2)}
                            </p>
                            <p className="text-xs text-text-tertiary">
                              {tx.type === 'incoming' ? 'From: ' + formatAddress(tx.from || '') : 'To: ' + formatAddress(tx.to || '')}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-text-secondary">
                            {new Date(tx.timestamp).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-text-tertiary">
                            {new Date(tx.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-background-tertiary rounded-lg p-4 text-center">
                  <p className="text-text-tertiary">No transactions found</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Wallets;
