import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Dashboard from './pages/Dashboard';
import Nodes from './pages/Nodes';
import Wallets from './pages/Wallets';
import Graphs from './pages/Graphs';
import Documents from './pages/Documents';
import Settings from './pages/Settings';
import MapViewer from './pages/MapViewer';
import Intelligence from './pages/Intelligence';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Layout from './components/Layout';
import { ModuleRegistryProvider } from './core/ModuleRegistry';
import './App.css';

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const isAuthenticated = localStorage.getItem('user_logged_in') === 'true';
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

function AppRoutes() {
  const [isOnline] = useState(true);
  const [syncStatus] = useState({
    lastSync: new Date().toISOString(),
    pendingOperations: 0
  });

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      {/* Protected routes */}
      <Route path="/" element={
        <ProtectedRoute>
          <Layout isOnline={isOnline} syncStatus={syncStatus} />
        </ProtectedRoute>
      }>
        <Route index element={<Dashboard />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="nodes" element={<Nodes />} />
        <Route path="wallets" element={<Wallets />} />
        <Route path="graphs" element={<Graphs />} />
        <Route path="documents" element={<Documents />} />
        <Route path="map" element={<MapViewer />} />
        <Route path="intelligence" element={<Intelligence />} />
        <Route path="profile" element={<Profile />} />
        <Route path="settings" element={<Settings />} />
      </Route>
      
      {/* Fallback route */}
      <Route path="*" element={<Navigate to="/login" replace />} />
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
