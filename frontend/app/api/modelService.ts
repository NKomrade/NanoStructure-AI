const API_BASE_URL = 'http://localhost:8000';

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
  const response = await fetch(`${API_BASE_URL}/model-info`);
  if (!response.ok) {
    throw new Error('Failed to fetch model information');
  }
  return response.json();
};

export const checkModelStatus = async () => {
  const response = await fetch(`${API_BASE_URL}/status`);
  if (!response.ok) {
    throw new Error('Failed to check model status');
  }
  return response.json();
};
