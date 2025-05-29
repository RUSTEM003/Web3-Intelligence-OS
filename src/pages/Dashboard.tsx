import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Activity, Cpu, Database, Globe, Shield, Users } from 'lucide-react';

const data = [
  { name: 'Core', nodes: 12, transactions: 240, uptime: 99 },
  { name: 'Edge', nodes: 24, transactions: 180, uptime: 98 },
  { name: 'Civic', nodes: 18, transactions: 120, uptime: 97 },
  { name: 'Privacy', nodes: 8, transactions: 60, uptime: 99 },
  { name: 'Quantum', nodes: 4, transactions: 30, uptime: 95 },
];

const statCards = [
  { title: 'Active Nodes', value: '66', icon: Globe, color: 'bg-blue-500' },
  { title: 'Transactions', value: '630', icon: Activity, color: 'bg-green-500' },
  { title: 'CPU Usage', value: '42%', icon: Cpu, color: 'bg-purple-500' },
  { title: 'Storage', value: '1.2 TB', icon: Database, color: 'bg-yellow-500' },
  { title: 'Users', value: '128', icon: Users, color: 'bg-pink-500' },
  { title: 'Security Score', value: '94%', icon: Shield, color: 'bg-red-500' },
];

const Dashboard = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((card, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <div className="flex items-center">
              <div className={`p-3 rounded-full ${card.color} text-white mr-4`}>
                <card.icon size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{card.title}</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">{card.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Node Performance</h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="nodes" fill="#3B82F6" name="Nodes" />
              <Bar dataKey="transactions" fill="#10B981" name="Transactions" />
              <Bar dataKey="uptime" fill="#6366F1" name="Uptime %" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Recent Activity</h2>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="flex items-start">
                <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center mr-3">
                  <Activity className="h-5 w-5 text-indigo-600 dark:text-indigo-300" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Node {Math.floor(Math.random() * 100)} connected to network
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {Math.floor(Math.random() * 60)} minutes ago
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">System Health</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">CPU Usage</span>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">42%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '42%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Memory Usage</span>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">68%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                <div className="bg-green-600 h-2.5 rounded-full" style={{ width: '68%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Network Load</span>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">23%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                <div className="bg-purple-600 h-2.5 rounded-full" style={{ width: '23%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Storage</span>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">54%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                <div className="bg-yellow-600 h-2.5 rounded-full" style={{ width: '54%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
