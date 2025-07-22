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
    
    // Retry every 3 seconds if backend is unavailable
    const interval = setInterval(() => {
      if (status === 'unavailable') {
        setRetryCount(prev => prev + 1);
        checkBackendHealth();
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [status]);

  // Component is now hidden but still runs the backend status checking
  return null;
};