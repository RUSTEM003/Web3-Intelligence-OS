import React, { useState } from 'react';
import { Github, LogIn, LogOut } from 'lucide-react';

interface GitHubAuthProps {
  onLogin: (token: string) => void;
  onLogout: () => void;
  isLoggedIn: boolean;
  username?: string;
}

const GitHubAuth: React.FC<GitHubAuthProps> = ({ 
  onLogin, 
  onLogout, 
  isLoggedIn, 
  username 
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = () => {
    setIsLoading(true);
    
    setTimeout(() => {
      const mockToken = 'github_mock_token_' + Math.random().toString(36).substring(2);
      onLogin(mockToken);
      setIsLoading(false);
    }, 1500);
  };

  const handleLogout = () => {
    setIsLoading(true);
    
    setTimeout(() => {
      onLogout();
      setIsLoading(false);
    }, 500);
  };

  return (
    <div className="flex flex-col items-center space-y-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-700">
        <Github className="h-6 w-6 text-gray-700 dark:text-gray-300" />
      </div>
      
      <h3 className="text-lg font-medium text-gray-900 dark:text-white">
        GitHub Authentication
      </h3>
      
      {isLoggedIn ? (
        <div className="flex flex-col items-center space-y-2 w-full">
          <div className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-md w-full text-center">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Logged in as {username || 'User'}
            </span>
          </div>
          
          <button
            onClick={handleLogout}
            disabled={isLoading}
            className="flex items-center justify-center space-x-2 w-full px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="animate-spin h-4 w-4 border-2 border-white border-opacity-20 border-t-white rounded-full" />
            ) : (
              <LogOut className="h-4 w-4" />
            )}
            <span>Logout</span>
          </button>
        </div>
      ) : (
        <button
          onClick={handleLogin}
          disabled={isLoading}
          className="flex items-center justify-center space-x-2 w-full px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:hover:bg-gray-600"
        >
          {isLoading ? (
            <span className="animate-spin h-4 w-4 border-2 border-white border-opacity-20 border-t-white rounded-full" />
          ) : (
            <LogIn className="h-4 w-4" />
          )}
          <span>Login with GitHub</span>
        </button>
      )}
      
      <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
        {isLoggedIn 
          ? 'You have access to all platform features' 
          : 'Login to access deployment and synchronization features'}
      </p>
    </div>
  );
};

export default GitHubAuth;
