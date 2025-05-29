import React, { useState } from 'react';
import { Wallet, AlertTriangle, Search, Plus, ArrowUpRight, ArrowDownLeft, Tag } from 'lucide-react';

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

  const filteredWallets = mockWallets.filter(wallet => {
    const matchesSearch = wallet.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         wallet.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesBlockchain = filterBlockchain === '' || wallet.blockchain === filterBlockchain;
    const matchesRiskScore = filterRiskScore === null || wallet.risk_score >= filterRiskScore;
    
    return matchesSearch && matchesBlockchain && matchesRiskScore;
  });

  const blockchains = ['Ethereum', 'Bitcoin', 'Tezos', 'Cosmos', 'Polygon'];
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="col-span-1 md:col-span-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Search by address or tag"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div>
            <select
              className="block w-full py-2 px-3 border border-gray-300 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              value={filterBlockchain}
              onChange={(e) => setFilterBlockchain(e.target.value)}
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
            >
              <option value="">All Risk Levels</option>
              {riskScores.map(score => (
                <option key={score.value} value={score.value}>{score.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
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
        </div>
      </div>

      {selectedWallet && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Wallet Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <h3 className="text-md font-medium mb-2 text-gray-900 dark:text-white">Information</h3>
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Address</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white break-all">{selectedWallet.address}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Blockchain</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedWallet.blockchain}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Balance</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedWallet.balance.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Risk Score</p>
                    <div className="flex items-center">
                      <div className={`h-2.5 w-2.5 rounded-full ${getRiskScoreColor(selectedWallet.risk_score)} mr-2`}></div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{(selectedWallet.risk_score * 100).toFixed(0)}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-md font-medium mb-2 text-gray-900 dark:text-white">Tags</h3>
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <div className="flex flex-wrap gap-2">
                  {selectedWallet.tags.map((tag: string, index: number) => (
                    <div 
                      key={index} 
                      className={`flex items-center px-3 py-1 rounded-full ${
                        tag === 'Suspicious' || tag === 'High Risk' 
                          ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' 
                          : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200'
                      }`}
                    >
                      <Tag className="h-4 w-4 mr-1" />
                      <span>{tag}</span>
                    </div>
                  ))}
                  <button className="flex items-center px-3 py-1 rounded-full border border-dashed border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
                    <Plus className="h-4 w-4 mr-1" />
                    <span>Add Tag</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-md font-medium mb-2 text-gray-900 dark:text-white">Transaction History</h3>
            {selectedWallet.transactions.length > 0 ? (
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <div className="space-y-3">
                  {selectedWallet.transactions.map((tx: any) => (
                    <div key={tx.id} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                      <div className="flex items-center">
                        {tx.type === 'incoming' ? (
                          <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mr-3">
                            <ArrowDownLeft className="h-4 w-4 text-green-600 dark:text-green-300" />
                          </div>
                        ) : (
                          <div className="h-8 w-8 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center mr-3">
                            <ArrowUpRight className="h-4 w-4 text-red-600 dark:text-red-300" />
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {tx.type === 'incoming' ? 'Received' : 'Sent'} {tx.amount.toFixed(2)}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {tx.type === 'incoming' ? 'From: ' + formatAddress(tx.from) : 'To: ' + formatAddress(tx.to)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(tx.timestamp).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                          {new Date(tx.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg text-center">
                <p className="text-gray-500 dark:text-gray-400">No transactions found</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Wallets;
