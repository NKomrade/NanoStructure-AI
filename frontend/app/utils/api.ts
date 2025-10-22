const API_URL = process.env.NEXT_PUBLIC_API_URL;

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
      credentials: 'omit',
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
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
      mode: 'cors',
      credentials: 'omit',
    });
    return await response.json();
  } catch (error) {
    console.error('API Status error:', error);
    throw error;
  }
};
