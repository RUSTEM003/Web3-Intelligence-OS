import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Dashboard from './pages/Dashboard';
import Nodes from './pages/Nodes';
import Wallets from './pages/Wallets';
import Graphs from './pages/Graphs';
import Documents from './pages/Documents';
import Settings from './pages/Settings';
import MapViewer from './pages/MapViewer';
import Layout from './components/Layout';
import { ModuleRegistryProvider } from './core/ModuleRegistry';
import './App.css';

function AppRoutes() {
  const [isOnline] = useState(true);
  const [syncStatus] = useState({
    lastSync: new Date().toISOString(),
    pendingOperations: 0
  });

  return (
    <Routes>
      <Route path="/" element={<Layout isOnline={isOnline} syncStatus={syncStatus} />}>
        <Route index element={<Dashboard />} />
        <Route path="nodes" element={<Nodes />} />
        <Route path="wallets" element={<Wallets />} />
        <Route path="graphs" element={<Graphs />} />
        <Route path="documents" element={<Documents />} />
        <Route path="map" element={<MapViewer />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}

function App() {
  useEffect(() => {
    console.log('Registering modules...');
  }, []);

  return (
    <ModuleRegistryProvider>
      <Router>
        <AppRoutes />
      </Router>
    </ModuleRegistryProvider>
  );
}

export default App;
