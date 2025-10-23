const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://nanostructure-ai-backend.onrender.com';

interface PredictionInput {
  n: number;
  m: number;
  u: number;
  v: number;
  w: number;
}

export async function makePrediction(input: PredictionInput) {
  try {
    const response = await fetch(`${API_URL}/predict`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      mode: 'cors',
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      if (response.status === 502) {
        throw new Error("Server is starting up. Please wait a moment and try again.");
      }
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.error || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Prediction error:', error);
    throw error;
  }
}

export const getApiStatus = async () => {
  try {
    const response = await fetch(`${API_URL}/status`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      mode: 'cors',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.error || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API Status error:', error);
    throw error;
  }
};
