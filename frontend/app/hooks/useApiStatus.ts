import { useState, useEffect } from 'react';
import { ApiStatus } from '../page';

export function useApiStatus() {
  const [status, setStatus] = useState<ApiStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/status`);
        const data = await response.json();
        setStatus(data);
        setError(null);
      } catch (err) {
        setError('Failed to connect to API');
        console.error('API Status Error:', err);
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  return { status, error };
}
