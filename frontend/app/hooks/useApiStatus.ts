import { useState, useEffect } from 'react';

interface ApiStatus {
  status: 'ready' | 'not_ready';
  components: {
    model: boolean;
    scaler_X: boolean;
    scaler_y: boolean;
  };
}

export function useApiStatus() {
  const [status, setStatus] = useState<ApiStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await fetch('http://localhost:8000/status');
        const data = await response.json();
        setStatus(data);
      } catch (error: unknown) {
        setError(error instanceof Error ? error.message : 'Unable to connect to API');
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 5000); // Check every 5 seconds
    return () => clearInterval(interval);
  }, []);

  return { status, error };
}
