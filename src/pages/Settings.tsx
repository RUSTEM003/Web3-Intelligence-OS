import React, { useState } from 'react';
import { Save, Globe, Moon, Sun, Bell, Lock, User, Github, Terminal, FileText, Cloud } from 'lucide-react';

const Settings = () => {
  const [settings, setSettings] = useState({
    general: {
      language: 'en',
      theme: 'light',
      notifications: true,
      autoSync: true
    },
    security: {
      twoFactorAuth: false,
      sessionTimeout: 30,
      ipWhitelist: '',
      apiKeyExpiration: 90
    },
    nodes: {
      defaultRegion: 'global',
      autoConnect: true,
      maxConnections: 10,
      syncInterval: 5
    },
    deployment: {
      preferredProvider: 'aws',
      autoBackup: true,
      backupInterval: 24,
      logLevel: 'info'
    }
  });

  const [activeTab, setActiveTab] = useState('general');

  const handleChange = (section: string, field: string, value: any) => {
    setSettings({
      ...settings,
      [section]: {
        ...settings[section as keyof typeof settings],
        [field]: value
      }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Settings saved:', settings);
  };

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'ru', name: 'Russian' },
    { code: 'zh', name: 'Chinese' }
  ];

  const regions = [
    { code: 'global', name: 'Global (Auto-select)' },
    { code: 'us', name: 'United States' },
    { code: 'eu', name: 'Europe' },
    { code: 'asia', name: 'Asia Pacific' }
  ];

  const cloudProviders = [
    { code: 'aws', name: 'Amazon Web Services' },
    { code: 'gcp', name: 'Google Cloud Platform' },
    { code: 'azure', name: 'Microsoft Azure' },
    { code: 'local', name: 'Local Deployment' }
  ];

  const logLevels = ['debug', 'info', 'warn', 'error'];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="sm:hidden">
          <select
            id="tabs"
            name="tabs"
            className="block w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            value={activeTab}
            onChange={(e) => setActiveTab(e.target.value)}
          >
            <option value="general">General</option>
            <option value="security">Security</option>
            <option value="nodes">Nodes</option>
            <option value="deployment">Deployment</option>
            <option value="integrations">Integrations</option>
          </select>
        </div>
        <div className="hidden sm:block">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex -mb-px" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('general')}
                className={`w-1/5 py-4 px-1 text-center border-b-2 font-medium text-sm ${
                  activeTab === 'general'
                    ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <Globe className="h-5 w-5 mx-auto mb-1" />
                General
              </button>
              <button
                onClick={() => setActiveTab('security')}
                className={`w-1/5 py-4 px-1 text-center border-b-2 font-medium text-sm ${
                  activeTab === 'security'
                    ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <Lock className="h-5 w-5 mx-auto mb-1" />
                Security
              </button>
              <button
                onClick={() => setActiveTab('nodes')}
                className={`w-1/5 py-4 px-1 text-center border-b-2 font-medium text-sm ${
                  activeTab === 'nodes'
                    ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <Terminal className="h-5 w-5 mx-auto mb-1" />
                Nodes
              </button>
              <button
                onClick={() => setActiveTab('deployment')}
                className={`w-1/5 py-4 px-1 text-center border-b-2 font-medium text-sm ${
                  activeTab === 'deployment'
                    ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <Cloud className="h-5 w-5 mx-auto mb-1" />
                Deployment
              </button>
              <button
                onClick={() => setActiveTab('integrations')}
                className={`w-1/5 py-4 px-1 text-center border-b-2 font-medium text-sm ${
                  activeTab === 'integrations'
                    ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <Github className="h-5 w-5 mx-auto mb-1" />
                Integrations
              </button>
            </nav>
          </div>
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit}>
            {activeTab === 'general' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">General Settings</h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Configure the basic settings for your Web3 Intelligence OS.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                  <div className="sm:col-span-3">
                    <label htmlFor="language" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Language
                    </label>
                    <div className="mt-1">
                      <select
                        id="language"
                        name="language"
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
                        value={settings.general.language}
                        onChange={(e) => handleChange('general', 'language', e.target.value)}
                      >
                        {languages.map((lang) => (
                          <option key={lang.code} value={lang.code}>
                            {lang.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="sm:col-span-3">
                    <label htmlFor="theme" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Theme
                    </label>
                    <div className="mt-1">
                      <div className="flex items-center space-x-4">
                        <label className="inline-flex items-center">
                          <input
                            type="radio"
                            className="form-radio text-indigo-600 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600"
                            name="theme"
                            value="light"
                            checked={settings.general.theme === 'light'}
                            onChange={() => handleChange('general', 'theme', 'light')}
                          />
                          <Sun className="ml-2 h-5 w-5 text-gray-400" />
                          <span className="ml-2 text-gray-700 dark:text-gray-300">Light</span>
                        </label>
                        <label className="inline-flex items-center">
                          <input
                            type="radio"
                            className="form-radio text-indigo-600 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600"
                            name="theme"
                            value="dark"
                            checked={settings.general.theme === 'dark'}
                            onChange={() => handleChange('general', 'theme', 'dark')}
                          />
                          <Moon className="ml-2 h-5 w-5 text-gray-400" />
                          <span className="ml-2 text-gray-700 dark:text-gray-300">Dark</span>
                        </label>
                        <label className="inline-flex items-center">
                          <input
                            type="radio"
                            className="form-radio text-indigo-600 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600"
                            name="theme"
                            value="system"
                            checked={settings.general.theme === 'system'}
                            onChange={() => handleChange('general', 'theme', 'system')}
                          />
                          <span className="ml-2 text-gray-700 dark:text-gray-300">System</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="sm:col-span-6">
                    <div className="flex items-start">
                      <div className="flex items-center h-5">
                        <input
                          id="notifications"
                          name="notifications"
                          type="checkbox"
                          className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
                          checked={settings.general.notifications}
                          onChange={(e) => handleChange('general', 'notifications', e.target.checked)}
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor="notifications" className="font-medium text-gray-700 dark:text-gray-300">
                          Enable Notifications
                        </label>
                        <p className="text-gray-500 dark:text-gray-400">
                          Receive notifications about system events, updates, and alerts.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="sm:col-span-6">
                    <div className="flex items-start">
                      <div className="flex items-center h-5">
                        <input
                          id="autoSync"
                          name="autoSync"
                          type="checkbox"
                          className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
                          checked={settings.general.autoSync}
                          onChange={(e) => handleChange('general', 'autoSync', e.target.checked)}
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor="autoSync" className="font-medium text-gray-700 dark:text-gray-300">
                          Automatic Synchronization
                        </label>
                        <p className="text-gray-500 dark:text-gray-400">
                          Automatically sync data when online after working in offline mode.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">Security Settings</h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Configure security and privacy settings for your account.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                  <div className="sm:col-span-6">
                    <div className="flex items-start">
                      <div className="flex items-center h-5">
                        <input
                          id="twoFactorAuth"
                          name="twoFactorAuth"
                          type="checkbox"
                          className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
                          checked={settings.security.twoFactorAuth}
                          onChange={(e) => handleChange('security', 'twoFactorAuth', e.target.checked)}
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor="twoFactorAuth" className="font-medium text-gray-700 dark:text-gray-300">
                          Two-Factor Authentication
                        </label>
                        <p className="text-gray-500 dark:text-gray-400">
                          Add an extra layer of security to your account with 2FA.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="sm:col-span-3">
                    <label htmlFor="sessionTimeout" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Session Timeout (minutes)
                    </label>
                    <div className="mt-1">
                      <input
                        type="number"
                        name="sessionTimeout"
                        id="sessionTimeout"
                        min="5"
                        max="240"
                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        value={settings.security.sessionTimeout}
                        onChange={(e) => handleChange('security', 'sessionTimeout', parseInt(e.target.value))}
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-3">
                    <label htmlFor="apiKeyExpiration" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      API Key Expiration (days)
                    </label>
                    <div className="mt-1">
                      <input
                        type="number"
                        name="apiKeyExpiration"
                        id="apiKeyExpiration"
                        min="1"
                        max="365"
                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        value={settings.security.apiKeyExpiration}
                        onChange={(e) => handleChange('security', 'apiKeyExpiration', parseInt(e.target.value))}
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-6">
                    <label htmlFor="ipWhitelist" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      IP Whitelist (comma separated)
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="ipWhitelist"
                        id="ipWhitelist"
                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        placeholder="192.168.1.1, 10.0.0.1"
                        value={settings.security.ipWhitelist}
                        onChange={(e) => handleChange('security', 'ipWhitelist', e.target.value)}
                      />
                    </div>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                      Leave empty to allow all IP addresses.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'nodes' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">Node Settings</h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Configure node connection and synchronization settings.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                  <div className="sm:col-span-3">
                    <label htmlFor="defaultRegion" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Default Region
                    </label>
                    <div className="mt-1">
                      <select
                        id="defaultRegion"
                        name="defaultRegion"
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
                        value={settings.nodes.defaultRegion}
                        onChange={(e) => handleChange('nodes', 'defaultRegion', e.target.value)}
                      >
                        {regions.map((region) => (
                          <option key={region.code} value={region.code}>
                            {region.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="sm:col-span-3">
                    <label htmlFor="maxConnections" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Maximum Connections
                    </label>
                    <div className="mt-1">
                      <input
                        type="number"
                        name="maxConnections"
                        id="maxConnections"
                        min="1"
                        max="100"
                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        value={settings.nodes.maxConnections}
                        onChange={(e) => handleChange('nodes', 'maxConnections', parseInt(e.target.value))}
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-3">
                    <label htmlFor="syncInterval" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Sync Interval (minutes)
                    </label>
                    <div className="mt-1">
                      <input
                        type="number"
                        name="syncInterval"
                        id="syncInterval"
                        min="1"
                        max="60"
                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        value={settings.nodes.syncInterval}
                        onChange={(e) => handleChange('nodes', 'syncInterval', parseInt(e.target.value))}
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-6">
                    <div className="flex items-start">
                      <div className="flex items-center h-5">
                        <input
                          id="autoConnect"
                          name="autoConnect"
                          type="checkbox"
                          className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
                          checked={settings.nodes.autoConnect}
                          onChange={(e) => handleChange('nodes', 'autoConnect', e.target.checked)}
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor="autoConnect" className="font-medium text-gray-700 dark:text-gray-300">
                          Auto-Connect to Nodes
                        </label>
                        <p className="text-gray-500 dark:text-gray-400">
                          Automatically connect to available nodes on startup.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'deployment' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">Deployment Settings</h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Configure cloud deployment and backup settings.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                  <div className="sm:col-span-3">
                    <label htmlFor="preferredProvider" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Preferred Cloud Provider
                    </label>
                    <div className="mt-1">
                      <select
                        id="preferredProvider"
                        name="preferredProvider"
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
                        value={settings.deployment.preferredProvider}
                        onChange={(e) => handleChange('deployment', 'preferredProvider', e.target.value)}
                      >
                        {cloudProviders.map((provider) => (
                          <option key={provider.code} value={provider.code}>
                            {provider.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="sm:col-span-3">
                    <label htmlFor="logLevel" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Log Level
                    </label>
                    <div className="mt-1">
                      <select
                        id="logLevel"
                        name="logLevel"
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
                        value={settings.deployment.logLevel}
                        onChange={(e) => handleChange('deployment', 'logLevel', e.target.value)}
                      >
                        {logLevels.map((level) => (
                          <option key={level} value={level}>
                            {level.charAt(0).toUpperCase() + level.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="sm:col-span-6">
                    <div className="flex items-start">
                      <div className="flex items-center h-5">
                        <input
                          id="autoBackup"
                          name="autoBackup"
                          type="checkbox"
                          className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
                          checked={settings.deployment.autoBackup}
                          onChange={(e) => handleChange('deployment', 'autoBackup', e.target.checked)}
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor="autoBackup" className="font-medium text-gray-700 dark:text-gray-300">
                          Automatic Backups
                        </label>
                        <p className="text-gray-500 dark:text-gray-400">
                          Automatically create backups of your data and configuration.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="sm:col-span-3">
                    <label htmlFor="backupInterval" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Backup Interval (hours)
                    </label>
                    <div className="mt-1">
                      <input
                        type="number"
                        name="backupInterval"
                        id="backupInterval"
                        min="1"
                        max="168"
                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        value={settings.deployment.backupInterval}
                        onChange={(e) => handleChange('deployment', 'backupInterval', parseInt(e.target.value))}
                        disabled={!settings.deployment.autoBackup}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'integrations' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">Integrations</h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Connect with external services and platforms.
                  </p>
                </div>

                <div className="space-y-6">
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Github className="h-8 w-8 text-gray-700 dark:text-gray-300" />
                        <div className="ml-4">
                          <h4 className="text-lg font-medium text-gray-900 dark:text-white">GitHub</h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Connect your GitHub account for repository access and OAuth login.
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        Connect
                      </button>
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Terminal className="h-8 w-8 text-gray-700 dark:text-gray-300" />
                        <div className="ml-4">
                          <h4 className="text-lg font-medium text-gray-900 dark:text-white">CLI Integration</h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Generate API keys for CLI access and automation.
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        Generate Key
                      </button>
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <FileText className="h-8 w-8 text-gray-700 dark:text-gray-300" />
                        <div className="ml-4">
                          <h4 className="text-lg font-medium text-gray-900 dark:text-white">Document Generation</h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Configure PDF and Markdown document generation settings.
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        Configure
                      </button>
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Bell className="h-8 w-8 text-gray-700 dark:text-gray-300" />
                        <div className="ml-4">
                          <h4 className="text-lg font-medium text-gray-900 dark:text-white">Notification Services</h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Connect to Telegram, Slack, or email notification services.
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        Connect
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="pt-5">
              <div className="flex justify-end">
                <button
                  type="button"
                  className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <Save className="h-5 w-5 mr-2" />
                  Save Settings
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Settings;
