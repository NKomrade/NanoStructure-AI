import React from 'react';

interface ApiStatus {
  status: 'ready' | 'not_ready';
  components?: Record<string, boolean>;
}

interface LoadingStatusProps {
  apiStatus: ApiStatus | null;
}

const LoadingStatus: React.FC<LoadingStatusProps> = ({ apiStatus }) => {
  const getStatusColor = () => {
    if (!apiStatus) return 'yellow';
    return apiStatus.status === 'ready' ? 'green' : 'yellow';
  };

  const getStatusMessage = () => {
    if (!apiStatus) return 'Connecting to API...';
    if (apiStatus.status === 'ready') return 'Model Ready';
    return (
      <div>
        <p className="mb-2">Model files not found. Please ensure the following files exist in the backend/model directory:</p>
        <ul className="list-disc list-inside text-xs space-y-1">
          <li>cnt_predictor_model.keras</li>
          <li>scaler_X.pkl</li>
          <li>scaler_y.pkl</li>
        </ul>
      </div>
    );
  };

  return (
    <div className={`bg-${getStatusColor()}-500/20 border border-${getStatusColor()}-500 rounded-lg p-4 mb-4`}>
      <div className="flex items-center space-x-3">
        <div className={`animate-pulse w-3 h-3 rounded-full bg-${getStatusColor()}-400`} />
        <div className={`text-${getStatusColor()}-400 text-sm font-medium`}>
          {getStatusMessage()}
        </div>
      </div>
      {apiStatus?.components && (
        <div className="mt-2 space-y-1">
          {Object.entries(apiStatus.components).map(([name, loaded]) => (
            <div key={name} className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${loaded ? 'bg-green-400' : 'bg-yellow-400'}`} />
              <span className="text-xs text-gray-400">{name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LoadingStatus;
