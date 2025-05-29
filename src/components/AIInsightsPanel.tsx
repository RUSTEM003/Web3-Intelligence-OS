import React, { useState } from 'react';
import { Brain, AlertTriangle, TrendingUp, TrendingDown, ArrowUpRight, Clock, Filter, RefreshCw, ChevronDown, ChevronUp, Zap, Shield, Activity } from 'lucide-react';
import Button from './Button';

interface Insight {
  id: string;
  title: string;
  description: string;
  category: 'security' | 'performance' | 'anomaly' | 'opportunity' | 'risk';
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;
  confidence: number;
  source: string;
  relatedEntities?: {
    type: string;
    id: string;
    name: string;
  }[];
  recommendations?: string[];
  metrics?: {
    name: string;
    value: string | number;
    change?: number;
  }[];
}

interface AIInsightsPanelProps {
  title?: string;
  insights?: Insight[];
  loading?: boolean;
  onRefresh?: () => void;
  onInsightAction?: (insightId: string, action: string) => void;
  className?: string;
}

const mockInsights: Insight[] = [
  {
    id: 'ins-001',
    title: 'Unusual transaction pattern detected',
    description: 'A series of high-value transactions with irregular timing patterns has been detected from wallet 0x8c7de95c1cb6a0c3c0a7507a325d4878b9c4b5c2. This pattern matches known wash trading behaviors.',
    category: 'anomaly',
    severity: 'high',
    timestamp: '12 minutes ago',
    confidence: 87,
    source: 'Transaction Analysis Engine',
    relatedEntities: [
      { type: 'wallet', id: '0x8c7de95c1cb6a0c3c0a7507a325d4878b9c4b5c2', name: 'Suspicious Wallet' },
      { type: 'transaction', id: '0x9ef2c4a2d1d51f696d7f4e427e37d33e7f6cc78f7b7d24a95b7b39f8c2269d3a', name: 'Latest Transaction' }
    ],
    recommendations: [
      'Monitor this wallet for further suspicious activity',
      'Flag related transactions for compliance review',
      'Consider adding wallet to watchlist'
    ],
    metrics: [
      { name: 'Transaction Volume', value: '24.5 ETH', change: 312 },
      { name: 'Transaction Frequency', value: '8 per hour', change: 267 },
      { name: 'Risk Score', value: 78, change: 45 }
    ]
  },
  {
    id: 'ins-002',
    title: 'Node 9 performance degradation',
    description: 'Privacy node in Mexico is showing signs of performance degradation. CPU usage has increased by 45% while transaction throughput has decreased by 23% over the past 6 hours.',
    category: 'performance',
    severity: 'medium',
    timestamp: '28 minutes ago',
    confidence: 92,
    source: 'Node Performance Monitor',
    relatedEntities: [
      { type: 'node', id: 'node9', name: 'Privacy Node (Mexico)' }
    ],
    recommendations: [
      'Restart node services',
      'Check for resource contention',
      'Verify network connectivity'
    ],
    metrics: [
      { name: 'CPU Usage', value: '87%', change: 45 },
      { name: 'Transaction Throughput', value: '42 tx/s', change: -23 },
      { name: 'Memory Usage', value: '76%', change: 32 }
    ]
  },
  {
    id: 'ins-003',
    title: 'Security vulnerability in smart contract',
    description: 'Static analysis has identified a potential reentrancy vulnerability in the smart contract deployed at 0x3a8d87a4774b6592e5855abad018f4ce01dcb289.',
    category: 'security',
    severity: 'critical',
    timestamp: '1 hour ago',
    confidence: 95,
    source: 'Smart Contract Analyzer',
    relatedEntities: [
      { type: 'contract', id: '0x3a8d87a4774b6592e5855abad018f4ce01dcb289', name: 'Vulnerable Contract' }
    ],
    recommendations: [
      'Immediately pause contract operations if possible',
      'Deploy patched version with reentrancy guard',
      'Audit all related contracts'
    ],
    metrics: [
      { name: 'Funds at Risk', value: '142.8 ETH', change: 0 },
      { name: 'Vulnerability Score', value: 92, change: 0 },
      { name: 'Active Users', value: 128, change: 0 }
    ]
  },
  {
    id: 'ins-004',
    title: 'Potential arbitrage opportunity',
    description: 'Price discrepancy detected between DEX platforms for the ETH/USDC pair. Current spread is 0.8% which exceeds the transaction cost threshold.',
    category: 'opportunity',
    severity: 'low',
    timestamp: '5 minutes ago',
    confidence: 83,
    source: 'Market Analysis Engine',
    relatedEntities: [
      { type: 'market', id: 'eth-usdc', name: 'ETH/USDC Pair' },
      { type: 'exchange', id: 'dex-1', name: 'Uniswap V3' },
      { type: 'exchange', id: 'dex-2', name: 'SushiSwap' }
    ],
    recommendations: [
      'Execute arbitrage transaction',
      'Monitor for widening spread',
      'Analyze historical patterns for this pair'
    ],
    metrics: [
      { name: 'Price Difference', value: '0.8%', change: 0.3 },
      { name: 'Estimated Profit', value: '$420', change: 0 },
      { name: 'Transaction Cost', value: '$65', change: 0 }
    ]
  },
  {
    id: 'ins-005',
    title: 'Regulatory risk increase for token',
    description: 'Recent regulatory announcements suggest increased scrutiny for privacy-focused tokens. SOL token has been mentioned in 3 separate regulatory documents in the past week.',
    category: 'risk',
    severity: 'medium',
    timestamp: '3 hours ago',
    confidence: 78,
    source: 'Regulatory Intelligence',
    relatedEntities: [
      { type: 'token', id: 'sol', name: 'Solana' },
      { type: 'regulation', id: 'reg-42', name: 'EU Digital Assets Framework' }
    ],
    recommendations: [
      'Review compliance procedures',
      'Monitor regulatory developments',
      'Prepare contingency plans'
    ],
    metrics: [
      { name: 'Regulatory Mentions', value: 8, change: 300 },
      { name: 'Risk Score', value: 68, change: 24 },
      { name: 'Market Sentiment', value: 'Negative', change: 0 }
    ]
  }
];

const AIInsightsPanel: React.FC<AIInsightsPanelProps> = ({
  title = 'AI Insights',
  insights = mockInsights,
  loading = false,
  onRefresh,
  onInsightAction,
  className = '',
}) => {
  const [expandedInsight, setExpandedInsight] = useState<string | null>(null);
  const [filter, setFilter] = useState({ category: '', severity: '' });
  
  const toggleInsight = (id: string) => {
    setExpandedInsight(expandedInsight === id ? null : id);
  };
  
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'security': return <Shield className="h-5 w-5 text-accent-red" />;
      case 'performance': return <Activity className="h-5 w-5 text-accent-blue" />;
      case 'anomaly': return <AlertTriangle className="h-5 w-5 text-accent-yellow" />;
      case 'opportunity': return <TrendingUp className="h-5 w-5 text-accent-green" />;
      case 'risk': return <AlertTriangle className="h-5 w-5 text-accent-orange" />;
      default: return <Brain className="h-5 w-5 text-accent-purple" />;
    }
  };
  
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'bg-accent-blue';
      case 'medium': return 'bg-accent-yellow';
      case 'high': return 'bg-accent-orange';
      case 'critical': return 'bg-accent-red';
      default: return 'bg-accent-blue';
    }
  };
  
  const getChangeIcon = (change?: number) => {
    if (!change) return null;
    
    if (change > 0) {
      return <TrendingUp className="h-3 w-3 text-accent-green" />;
    } else if (change < 0) {
      return <TrendingDown className="h-3 w-3 text-accent-red" />;
    } else {
      return null;
    }
  };
  
  const getChangeColor = (change?: number) => {
    if (!change) return '';
    
    if (change > 0) {
      return 'text-accent-green';
    } else if (change < 0) {
      return 'text-accent-red';
    } else {
      return '';
    }
  };
  
  const categories = ['security', 'performance', 'anomaly', 'opportunity', 'risk'];
  const severities = ['low', 'medium', 'high', 'critical'];
  
  const filteredInsights = insights.filter(insight => {
    const matchesCategory = filter.category === '' || insight.category === filter.category;
    const matchesSeverity = filter.severity === '' || insight.severity === filter.severity;
    return matchesCategory && matchesSeverity;
  });

  return (
    <div className={`bg-background-secondary border border-border-light rounded-lg shadow-lg overflow-hidden ${className}`}>
      <div className="flex items-center justify-between p-4 border-b border-border-light">
        <div className="flex items-center">
          <div className="p-2 rounded-md bg-background-tertiary mr-3">
            <Brain className="h-5 w-5 text-accent-purple" />
          </div>
          <div>
            <h2 className="text-base font-medium text-text-primary">{title}</h2>
            <p className="text-xs text-text-tertiary mt-0.5">AI-powered insights and recommendations</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex items-center space-x-2">
            <select
              className="text-xs bg-background-tertiary border border-border-light rounded-md px-2 py-1 text-text-secondary"
              value={filter.category}
              onChange={(e) => setFilter({ ...filter, category: e.target.value })}
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
            
            <select
              className="text-xs bg-background-tertiary border border-border-light rounded-md px-2 py-1 text-text-secondary"
              value={filter.severity}
              onChange={(e) => setFilter({ ...filter, severity: e.target.value })}
            >
              <option value="">All Severities</option>
              {severities.map(severity => (
                <option key={severity} value={severity}>
                  {severity.charAt(0).toUpperCase() + severity.slice(1)}
                </option>
              ))}
            </select>
          </div>
          
          <Button 
            size="sm" 
            variant="ghost"
            leftIcon={<RefreshCw className="h-3.5 w-3.5" />}
            onClick={onRefresh}
          >
            Refresh
          </Button>
        </div>
      </div>
      
      {loading ? (
        <div className="p-8 flex items-center justify-center">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent-purple"></div>
            <p className="mt-4 text-text-secondary">Analyzing blockchain data...</p>
          </div>
        </div>
      ) : filteredInsights.length === 0 ? (
        <div className="p-8 text-center">
          <div className="inline-flex items-center justify-center p-4 rounded-full bg-background-tertiary mb-4">
            <Brain className="h-8 w-8 text-text-tertiary" />
          </div>
          <h3 className="text-lg font-medium text-text-primary mb-2">No insights found</h3>
          <p className="text-text-secondary">Try changing your filters or refreshing the data.</p>
        </div>
      ) : (
        <div className="divide-y divide-border-light">
          {filteredInsights.map((insight) => (
            <div key={insight.id} className="bg-background-secondary hover:bg-background-tertiary transition-colors">
              <div 
                className="p-4 cursor-pointer"
                onClick={() => toggleInsight(insight.id)}
              >
                <div className="flex items-start">
                  <div className="p-2 rounded-md bg-background-tertiary mr-3 flex-shrink-0">
                    {getCategoryIcon(insight.category)}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <h3 className="text-sm font-medium text-text-primary">{insight.title}</h3>
                        <div className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(insight.severity)} bg-opacity-20 text-text-primary`}>
                          {insight.severity.charAt(0).toUpperCase() + insight.severity.slice(1)}
                        </div>
                      </div>
                      
                      <div className="flex items-center text-text-tertiary">
                        <div className="flex items-center mr-3 text-xs">
                          <Clock className="h-3 w-3 mr-1" />
                          {insight.timestamp}
                        </div>
                        
                        {expandedInsight === insight.id ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </div>
                    </div>
                    
                    <p className="text-xs text-text-secondary mt-1 line-clamp-2">
                      {insight.description}
                    </p>
                    
                    <div className="flex items-center mt-2 text-xs text-text-tertiary">
                      <span className="mr-3">Source: {insight.source}</span>
                      <span>Confidence: {insight.confidence}%</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {expandedInsight === insight.id && (
                <div className="px-4 pb-4 pt-1 bg-background-tertiary bg-opacity-50">
                  <div className="ml-8">
                    {insight.relatedEntities && insight.relatedEntities.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-xs font-medium text-text-tertiary uppercase tracking-wider mb-2">Related Entities</h4>
                        <div className="space-y-2">
                          {insight.relatedEntities.map((entity, index) => (
                            <div key={index} className="flex items-center">
                              <div className="w-2 h-2 rounded-full bg-accent-blue mr-2"></div>
                              <span className="text-xs text-text-secondary">{entity.name}</span>
                              <span className="text-xs text-text-tertiary ml-2">({entity.type})</span>
                              <span className="text-xs text-text-tertiary ml-2 font-mono">{entity.id}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {insight.metrics && insight.metrics.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-xs font-medium text-text-tertiary uppercase tracking-wider mb-2">Key Metrics</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                          {insight.metrics.map((metric, index) => (
                            <div key={index} className="bg-background-secondary p-2 rounded-md border border-border-light">
                              <div className="text-xs text-text-tertiary">{metric.name}</div>
                              <div className="flex items-center justify-between mt-1">
                                <div className="text-sm font-medium text-text-primary">{metric.value}</div>
                                {metric.change !== undefined && (
                                  <div className={`flex items-center text-xs ${getChangeColor(metric.change)}`}>
                                    {getChangeIcon(metric.change)}
                                    <span className="ml-1">
                                      {metric.change > 0 ? '+' : ''}{metric.change}%
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {insight.recommendations && insight.recommendations.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-xs font-medium text-text-tertiary uppercase tracking-wider mb-2">Recommendations</h4>
                        <ul className="space-y-1 list-disc list-inside">
                          {insight.recommendations.map((recommendation, index) => (
                            <li key={index} className="text-xs text-text-secondary">
                              {recommendation}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    <div className="flex justify-end mt-4 space-x-2">
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => onInsightAction && onInsightAction(insight.id, 'dismiss')}
                      >
                        Dismiss
                      </Button>
                      <Button 
                        size="sm" 
                        variant="secondary"
                        onClick={() => onInsightAction && onInsightAction(insight.id, 'investigate')}
                      >
                        Investigate
                      </Button>
                      <Button 
                        size="sm" 
                        variant="primary"
                        onClick={() => onInsightAction && onInsightAction(insight.id, 'action')}
                      >
                        Take Action
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AIInsightsPanel;
