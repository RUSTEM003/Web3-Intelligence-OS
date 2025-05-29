import React, { useState } from 'react';
import { ExternalLink, ChevronDown, ChevronUp, Clock, ArrowRight, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface Transaction {
  id: string;
  hash: string;
  from: string;
  to: string;
  amount: string;
  token: string;
  timestamp: string;
  status: 'confirmed' | 'pending' | 'failed';
  blockNumber?: number;
  fee?: string;
  description?: string;
}

interface BlockchainTransactionListProps {
  transactions: Transaction[];
  title?: string;
  maxHeight?: string;
  onViewTransaction?: (hash: string) => void;
  loading?: boolean;
}

const BlockchainTransactionList: React.FC<BlockchainTransactionListProps> = ({
  transactions,
  title = 'Recent Transactions',
  maxHeight = '400px',
  onViewTransaction,
  loading = false,
}) => {
  const [expandedTransaction, setExpandedTransaction] = useState<string | null>(null);

  const toggleTransaction = (hash: string) => {
    if (expandedTransaction === hash) {
      setExpandedTransaction(null);
    } else {
      setExpandedTransaction(hash);
    }
  };

  const truncateAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  const getStatusIcon = (status: Transaction['status']) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="h-4 w-4 text-accent-green" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-accent-yellow" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-accent-red" />;
      default:
        return <AlertCircle className="h-4 w-4 text-text-tertiary" />;
    }
  };

  const getStatusText = (status: Transaction['status']) => {
    switch (status) {
      case 'confirmed':
        return 'Confirmed';
      case 'pending':
        return 'Pending';
      case 'failed':
        return 'Failed';
      default:
        return 'Unknown';
    }
  };

  const getStatusClass = (status: Transaction['status']) => {
    switch (status) {
      case 'confirmed':
        return 'text-accent-green';
      case 'pending':
        return 'text-accent-yellow';
      case 'failed':
        return 'text-accent-red';
      default:
        return 'text-text-tertiary';
    }
  };

  if (loading) {
    return (
      <div className="bg-background-secondary rounded-lg border border-border-light overflow-hidden">
        <div className="p-4 border-b border-border-light">
          <div className="h-5 w-32 bg-background-tertiary animate-pulse rounded"></div>
        </div>
        <div className="p-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="mb-4 last:mb-0">
              <div className="flex justify-between items-center mb-2">
                <div className="h-4 w-48 bg-background-tertiary animate-pulse rounded"></div>
                <div className="h-4 w-24 bg-background-tertiary animate-pulse rounded"></div>
              </div>
              <div className="h-10 bg-background-tertiary animate-pulse rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background-secondary rounded-lg border border-border-light overflow-hidden">
      <div className="p-4 border-b border-border-light">
        <h3 className="text-sm font-medium text-text-primary">{title}</h3>
      </div>
      
      <div className="overflow-y-auto" style={{ maxHeight }}>
        {transactions.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-sm text-text-tertiary">No transactions found</p>
          </div>
        ) : (
          <ul className="divide-y divide-border-light">
            {transactions.map((tx) => (
              <li key={tx.hash} className="transition-colors hover:bg-background-tertiary">
                <div className="p-3 sm:p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-start space-x-3">
                      <div className="mt-0.5">{getStatusIcon(tx.status)}</div>
                      <div>
                        <div className="flex items-center">
                          <span className="text-xs font-medium text-text-primary">
                            {tx.amount} {tx.token}
                          </span>
                          <span className={`text-xs ml-2 ${getStatusClass(tx.status)}`}>
                            {getStatusText(tx.status)}
                          </span>
                        </div>
                        
                        <div className="flex items-center mt-1 text-xs text-text-tertiary">
                          <span className="inline-block w-10">From:</span>
                          <span className="text-text-secondary">{truncateAddress(tx.from)}</span>
                        </div>
                        
                        <div className="flex items-center mt-1 text-xs text-text-tertiary">
                          <span className="inline-block w-10">To:</span>
                          <span className="text-text-secondary">{truncateAddress(tx.to)}</span>
                        </div>
                        
                        <div className="mt-1 text-xs text-text-tertiary">
                          <Clock className="h-3 w-3 inline mr-1" />
                          {tx.timestamp}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {onViewTransaction && (
                        <button
                          onClick={() => onViewTransaction(tx.hash)}
                          className="p-1 text-text-tertiary hover:text-accent-blue transition-colors"
                          aria-label="View transaction details"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </button>
                      )}
                      
                      <button
                        onClick={() => toggleTransaction(tx.hash)}
                        className="p-1 text-text-tertiary hover:text-text-primary transition-colors"
                        aria-label={expandedTransaction === tx.hash ? 'Collapse' : 'Expand'}
                      >
                        {expandedTransaction === tx.hash ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                  
                  {expandedTransaction === tx.hash && (
                    <div className="mt-3 pt-3 border-t border-border-light text-xs">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <span className="text-text-tertiary">Transaction Hash:</span>
                          <div className="text-text-secondary mt-1 break-all">{tx.hash}</div>
                        </div>
                        
                        {tx.blockNumber && (
                          <div>
                            <span className="text-text-tertiary">Block:</span>
                            <div className="text-text-secondary mt-1">{tx.blockNumber}</div>
                          </div>
                        )}
                        
                        {tx.fee && (
                          <div>
                            <span className="text-text-tertiary">Fee:</span>
                            <div className="text-text-secondary mt-1">{tx.fee}</div>
                          </div>
                        )}
                      </div>
                      
                      {tx.description && (
                        <div className="mt-2">
                          <span className="text-text-tertiary">Description:</span>
                          <div className="text-text-secondary mt-1">{tx.description}</div>
                        </div>
                      )}
                      
                      <div className="mt-3 flex justify-end">
                        <button
                          onClick={() => onViewTransaction && onViewTransaction(tx.hash)}
                          className="flex items-center text-accent-blue hover:text-accent-blue-light transition-colors"
                        >
                          View full details
                          <ArrowRight className="h-3 w-3 ml-1" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default BlockchainTransactionList;
