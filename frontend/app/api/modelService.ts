const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://nanostructure-ai-backend.onrender.com';

export interface ModelInfo {
  architecture: string;
  input_features: string[];
  output_features: string[];
  test_metrics: {
    overall: {
      rmse: number;
      mae: number;
      r2: number;
    };
  };
  // Add other fields as needed
}

export const getModelInfo = async (): Promise<ModelInfo> => {
  try {
    const response = await fetch(`${API_BASE_URL}/model-info`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      mode: 'cors',
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Failed to fetch model information: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    console.error('Model info fetch error:', error);
    throw error;
  }
};

export const checkModelStatus = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/status`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      mode: 'cors',
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Failed to check model status: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    console.error('Model status check error:', error);
    throw error;
  }
};
