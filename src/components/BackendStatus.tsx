import React, { useState, useEffect } from 'react';
import { Loader2, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { apiService } from '../services/api';

interface BackendStatusProps {
  onStatusChange: (isAvailable: boolean) => void;
}

export const BackendStatus: React.FC<BackendStatusProps> = ({ onStatusChange }) => {
  const [status, setStatus] = useState<'checking' | 'available' | 'unavailable'>('checking');
  const [retryCount, setRetryCount] = useState(0);

  const checkBackendHealth = async () => {
    try {
      const isHealthy = await apiService.checkHealth();
      if (isHealthy) {
        setStatus('available');
        onStatusChange(true);
      } else {
        setStatus('unavailable');
        onStatusChange(false);
      }
    } catch (error) {
      setStatus('unavailable');
      onStatusChange(false);
    }
  };

  useEffect(() => {
    checkBackendHealth();
    
    // Retry every 5 seconds if backend is unavailable, but less frequently after many attempts
    const interval = setInterval(() => {
      if (status === 'unavailable') {
        setRetryCount(prev => prev + 1);
        checkBackendHealth();
      }
    }, retryCount > 10 ? 15000 : 5000); // Slow down after 10 attempts

    return () => clearInterval(interval);
  }, [status, retryCount]);

  if (status === 'available') {
    return (
      <div className="flex items-center gap-2 text-green-400 text-sm">
        <CheckCircle className="w-4 h-4" />
        <span>NASA Archive Connected</span>
      </div>
    );
  }

  if (status === 'unavailable') {
    return (
      <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-400" />
          <div className="flex-1">
            <h3 className="text-yellow-300 font-medium">Backend Starting Up</h3>
            <p className="text-yellow-200/80 text-sm mt-1">
              Connecting to NASA Exoplanet Archive... This may take a moment.
            </p>
            <p className="text-yellow-200/60 text-xs mt-1">
              Retry attempt: {retryCount}
            </p>
          </div>
          <button
            onClick={checkBackendHealth}
            className="px-3 py-1 bg-yellow-600 hover:bg-yellow-700 text-white rounded text-sm transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-blue-400 text-sm">
      <Loader2 className="w-4 h-4 animate-spin" />
      <span>Checking NASA Archive connection...</span>
    </div>
  );
};