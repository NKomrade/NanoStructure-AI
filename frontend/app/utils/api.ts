const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://nanostructure-ai-backend.onrender.com';

interface PredictionInput {
  n: number;
  m: number;
  u: number;
  v: number;
  w: number;
}

export async function makePrediction(input: PredictionInput, maxRetries = 3) {
  let lastError;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetch(`${API_URL}/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        mode: 'cors',
        credentials: 'include',
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }

      return await response.json();
    } catch (error: unknown) {
      lastError = error instanceof Error ? error : new Error('Unknown error occurred');
      console.error(`Attempt ${attempt + 1} failed:`, error);
      if (attempt < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  }
  
  throw lastError || new Error('Failed to connect to the server');
}

export const getApiStatus = async () => {
  const response = await fetch(`${API_URL}/status`, {
    mode: 'cors',
    credentials: 'include',
    headers: {
      'Accept': 'application/json',
    },
  });
  return response.json();
};
