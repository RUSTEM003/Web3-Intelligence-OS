import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { 
  Activity, 
  Cpu, 
  Database, 
  Globe, 
  Shield, 
  Users, 
  ArrowUpRight, 
  Clock, 
  AlertTriangle, 
  Zap,
  BarChart2,
  RefreshCw
} from 'lucide-react';
import DataCard from '../components/DataCard';
import Button from '../components/Button';
import SearchInput from '../components/SearchInput';
import BlockchainTransactionList, { Transaction } from '../components/BlockchainTransactionList';

const performanceData = [
  { name: 'Core', nodes: 12, transactions: 240, uptime: 99 },
  { name: 'Edge', nodes: 24, transactions: 180, uptime: 98 },
  { name: 'Civic', nodes: 18, transactions: 120, uptime: 97 },
  { name: 'Privacy', nodes: 8, transactions: 60, uptime: 99 },
  { name: 'Quantum', nodes: 4, transactions: 30, uptime: 95 },
];

const statCards = [
  { 
    title: 'ACTIVE NODES', 
    value: '66', 
    icon: <Globe className="h-5 w-5 text-accent-blue" />,
    change: { value: 4.2, timeframe: 'vs last week' },
    footer: 'View all nodes',
    variant: 'primary'
  },
  { 
    title: 'TRANSACTIONS', 
    value: '630', 
    icon: <Activity className="h-5 w-5 text-accent-green" />,
    change: { value: 12.8, timeframe: 'vs last week' },
    footer: 'View transactions',
    variant: 'success'
  },
  { 
    title: 'CPU USAGE', 
    value: '42%', 
    icon: <Cpu className="h-5 w-5 text-accent-purple" />,
    change: { value: -3.6, timeframe: 'vs last week' },
    footer: 'View system metrics',
    variant: 'default'
  },
  { 
    title: 'STORAGE', 
    value: '1.2 TB', 
    icon: <Database className="h-5 w-5 text-accent-yellow" />,
    change: { value: 8.1, timeframe: 'vs last week' },
    footer: 'View storage details',
    variant: 'warning'
  },
  { 
    title: 'ACTIVE USERS', 
    value: '128', 
    icon: <Users className="h-5 w-5 text-accent-blue" />,
    change: { value: 24.3, timeframe: 'vs last week' },
    footer: 'View user analytics',
    variant: 'primary'
  },
  { 
    title: 'SECURITY SCORE', 
    value: '94%', 
    icon: <Shield className="h-5 w-5 text-accent-green" />,
    change: { value: 2.0, timeframe: 'vs last week' },
    footer: 'View security report',
    variant: 'success'
  },
];

const recentTransactions: Transaction[] = [
  {
    id: '1',
    hash: '0x7cb04b1ae4f4348678c57798a7f61b0d1b1f5291d8ad0b67c5a1f4052ac5e723',
    from: '0x3a8d87a4774b6592e5855abad018f4ce01dcb289',
    to: '0x8c7de95c1cb6a0c3c0a7507a325d4878b9c4b5c2',
    amount: '0.42',
    token: 'ETH',
    timestamp: '10 minutes ago',
    status: 'confirmed' as 'confirmed' | 'pending' | 'failed',
    blockNumber: 18245632,
    fee: '0.0042 ETH',
    description: 'Transfer to Edge Node deployment'
  },
  {
    id: '2',
    hash: '0x9ef2c4a2d1d51f696d7f4e427e37d33e7f6cc78f7b7d24a95b7b39f8c2269d3a',
    from: '0x8c7de95c1cb6a0c3c0a7507a325d4878b9c4b5c2',
    to: '0x1f28cdb787a489acb1c34b3f7ad64d869d4477b8',
    amount: '1.8',
    token: 'ETH',
    timestamp: '32 minutes ago',
    status: 'confirmed' as 'confirmed' | 'pending' | 'failed',
    blockNumber: 18245621,
    fee: '0.0038 ETH',
    description: 'Node registration fee'
  },
  {
    id: '3',
    hash: '0x3d7c4b1ae4f4348678c57798a7f61b0d1b1f5291d8ad0b67c5a1f4052ac5e723',
    from: '0x1f28cdb787a489acb1c34b3f7ad64d869d4477b8',
    to: '0x3a8d87a4774b6592e5855abad018f4ce01dcb289',
    amount: '0.15',
    token: 'ETH',
    timestamp: '1 hour ago',
    status: 'pending' as 'confirmed' | 'pending' | 'failed',
    blockNumber: undefined,
    fee: '0.0024 ETH',
    description: 'Quantum node activation'
  },
];

const recentActivities = [
  {
    id: 1,
    title: 'Node 42 connected to network',
    time: '12 minutes ago',
    icon: <Globe className="h-5 w-5 text-accent-blue" />,
    description: 'Edge node in US region successfully connected'
  },
  {
    id: 2,
    title: 'Security scan completed',
    time: '28 minutes ago',
    icon: <Shield className="h-5 w-5 text-accent-green" />,
    description: 'All nodes passed security verification'
  },
  {
    id: 3,
    title: 'Node 17 synchronization',
    time: '42 minutes ago',
    icon: <RefreshCw className="h-5 w-5 text-accent-yellow" />,
    description: 'Quantum node completed blockchain sync'
  },
  {
    id: 4,
    title: 'System update available',
    time: '1 hour ago',
    icon: <AlertTriangle className="h-5 w-5 text-accent-orange" />,
    description: 'New security patches ready for deployment'
  },
];

const systemMetrics = [
  { name: 'CPU Usage', value: 42, color: 'bg-accent-blue' },
  { name: 'Memory Usage', value: 68, color: 'bg-accent-green' },
  { name: 'Network Load', value: 23, color: 'bg-accent-purple' },
  { name: 'Storage', value: 54, color: 'bg-accent-yellow' },
];

const Dashboard = () => {
  const [timeRange, setTimeRange] = useState('24h');
  
  const getMetricColor = (value: number) => {
    if (value > 80) return 'bg-accent-red';
    if (value > 60) return 'bg-accent-yellow';
    return 'bg-accent-green';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Platform Dashboard</h1>
          <p className="text-sm text-text-tertiary mt-1">Real-time analytics and system overview</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center space-x-1 bg-background-tertiary rounded-md p-1">
            {['1h', '24h', '7d', '30d', 'All'].map((range) => (
              <button
                key={range}
                className={`px-3 py-1 text-xs font-medium rounded ${
                  timeRange === range 
                    ? 'bg-background-elevated text-text-primary' 
                    : 'text-text-secondary hover:text-text-primary'
                }`}
                onClick={() => setTimeRange(range)}
              >
                {range}
              </button>
            ))}
          </div>
          
          <Button 
            size="sm"
            variant="secondary"
            leftIcon={<RefreshCw className="h-3.5 w-3.5" />}
          >
            Refresh
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((card, index) => (
          <DataCard
            key={index}
            title={card.title}
            value={card.value}
            icon={card.icon}
            change={card.change}
            footer={card.footer}
            variant={card.variant as any}
            onClick={() => console.log(`Clicked on ${card.title}`)}
          />
        ))}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-background-secondary rounded-lg border border-border-light shadow-lg overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-border-light">
              <div className="flex items-center">
                <div className="p-2 rounded-md bg-background-tertiary mr-3">
                  <BarChart2 className="h-5 w-5 text-accent-blue" />
                </div>
                <div>
                  <h2 className="text-base font-medium text-text-primary">Node Performance</h2>
                  <p className="text-xs text-text-tertiary mt-0.5">Performance metrics across node types</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button 
                  size="sm" 
                  variant="ghost"
                  rightIcon={<ArrowUpRight className="h-3.5 w-3.5" />}
                >
                  Details
                </Button>
              </div>
            </div>
            
            <div className="p-4">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={performanceData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fill: 'var(--text-secondary)' }}
                      axisLine={{ stroke: 'var(--border-light)' }}
                    />
                    <YAxis 
                      tick={{ fill: 'var(--text-secondary)' }}
                      axisLine={{ stroke: 'var(--border-light)' }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'var(--background-secondary)',
                        borderColor: 'var(--border-light)',
                        color: 'var(--text-primary)'
                      }}
                    />
                    <Legend 
                      wrapperStyle={{ color: 'var(--text-secondary)' }}
                    />
                    <Bar dataKey="nodes" fill="var(--accent-blue)" name="Nodes" />
                    <Bar dataKey="transactions" fill="var(--accent-green)" name="Transactions" />
                    <Bar dataKey="uptime" fill="var(--accent-purple)" name="Uptime %" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
        
        <div className="lg:col-span-1">
          <BlockchainTransactionList 
            transactions={recentTransactions}
            title="Recent Transactions"
            onViewTransaction={(hash) => console.log(`View transaction: ${hash}`)}
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-background-secondary rounded-lg border border-border-light shadow-lg overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-border-light">
            <div className="flex items-center">
              <div className="p-2 rounded-md bg-background-tertiary mr-3">
                <Activity className="h-5 w-5 text-accent-green" />
              </div>
              <h2 className="text-base font-medium text-text-primary">Recent Activity</h2>
            </div>
            
            <Button 
              size="sm" 
              variant="ghost"
              rightIcon={<ArrowUpRight className="h-3.5 w-3.5" />}
            >
              View all
            </Button>
          </div>
          
          <div className="divide-y divide-border-light">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="p-4 hover:bg-background-tertiary transition-colors">
                <div className="flex items-start">
                  <div className="p-2 rounded-md bg-background-tertiary mr-3 flex-shrink-0">
                    {activity.icon}
                  </div>
                  <div>
                    <div className="flex items-center">
                      <h3 className="text-sm font-medium text-text-primary">{activity.title}</h3>
                      <div className="flex items-center ml-2 text-xs text-text-tertiary">
                        <Clock className="h-3 w-3 mr-1" />
                        {activity.time}
                      </div>
                    </div>
                    <p className="text-xs text-text-secondary mt-1">{activity.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-background-secondary rounded-lg border border-border-light shadow-lg overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-border-light">
            <div className="flex items-center">
              <div className="p-2 rounded-md bg-background-tertiary mr-3">
                <Zap className="h-5 w-5 text-accent-yellow" />
              </div>
              <h2 className="text-base font-medium text-text-primary">System Health</h2>
            </div>
            
            <Button 
              size="sm" 
              variant="ghost"
              rightIcon={<ArrowUpRight className="h-3.5 w-3.5" />}
            >
              Details
            </Button>
          </div>
          
          <div className="p-4 space-y-5">
            {systemMetrics.map((metric) => (
              <div key={metric.name}>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-text-secondary">{metric.name}</span>
                  <span className={`text-sm font-medium ${
                    metric.value > 80 ? 'text-accent-red' : 
                    metric.value > 60 ? 'text-accent-yellow' : 
                    'text-accent-green'
                  }`}>{metric.value}%</span>
                </div>
                <div className="w-full bg-background-tertiary rounded-full h-1.5">
                  <div 
                    className={`h-1.5 rounded-full ${getMetricColor(metric.value)}`} 
                    style={{ width: `${metric.value}%` }}
                  ></div>
                </div>
              </div>
            ))}
            
            <div className="mt-6 pt-4 border-t border-border-light">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`h-2 w-2 rounded-full bg-accent-green mr-2`}></div>
                  <span className="text-xs text-text-secondary">All systems operational</span>
                </div>
                <span className="text-xs text-text-tertiary">Last checked: 2 minutes ago</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
