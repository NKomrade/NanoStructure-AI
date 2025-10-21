"use client";

import { useState } from "react";
import InputForm from "./components/InputForm";
import CNTViewer from "./components/CNTViewer";
import { useApiStatus } from "./hooks/useApiStatus";

// Define the structure for the prediction output
interface PredictionResult {
  u_prime: number;
  v_prime: number;
  w_prime: number;
  displacement: number;
  confidence?: number;
}

export interface Prediction {
  initial: { u: number; v: number; w: number };
  calculated: { u: number; v: number; w: number };
  result?: PredictionResult;
}

export interface ApiStatus {
  status: 'ready' | 'not_ready';
  components?: Record<string, boolean>;
}

const ResultsPanel = ({ result }: { result: PredictionResult | null }) => {
  if (!result) return null;

  return (
    <div className="bg-gray-800 p-6 rounded-lg mt-4">
      <h3 className="text-xl font-bold text-cyan-400 mb-4">Prediction Results</h3>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h4 className="text-white font-semibold">Optimized Coordinates</h4>
          <div className="text-gray-300">
            <p>u&apos;: {result.u_prime.toFixed(6)}</p>
            <p>v&apos;: {result.v_prime.toFixed(6)}</p>
            <p>w&apos;: {result.w_prime.toFixed(6)}</p>
          </div>
        </div>
        
        <div>
          <h4 className="text-white font-semibold">Analysis</h4>
          <div className="text-gray-300">
            <p>Displacement: {result.displacement.toFixed(6)} Å</p>
            <p>Prediction Time: &lt;1ms</p>
            <p>vs DFT: ~1800x faster</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function Home() {
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const { status, error } = useApiStatus();

  const ApiErrorMessage = () => (
    <div className="bg-red-500/20 border border-red-500 rounded-lg p-4 mb-6">
      <h3 className="text-red-500 font-bold mb-2">API Error</h3>
      {error ? (
        <p>{error}</p>
      ) : (
        <p>
          Model components are not loaded. Please check if model files exist on the server.
          Missing components: {status?.components && 
            Object.entries(status.components)
              .filter(([name, loaded]) => !loaded)
              .map(([name]) => name)
              .join(', ')}
        </p>
      )}
    </div>
  );

  return (
    <main className="min-h-screen bg-gray-900 text-white p-4 sm:p-8 overflow-x-hidden">
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="text-center mb-10">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-cyan-400 mb-4 leading-tight">
            NanoStructure AI
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Full-Stack Carbon Nanotube Coordinate Predictor
          </p>
        </header>

        {(error || status?.status === 'not_ready') && <ApiErrorMessage />}

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <div className="bg-gray-800/90 p-6 rounded-xl shadow-lg backdrop-blur-sm">
            <h2 className="text-2xl font-bold mb-6 text-cyan-300 flex items-center gap-2">
              <span>Input Parameters</span>
            </h2>
            <InputForm
              setPrediction={setPrediction}
              setLoading={setLoading}
              apiStatus={status}
            />
            {prediction?.result && <ResultsPanel result={prediction.result} />}
          </div>

          <div className="bg-gray-800/90 rounded-xl shadow-lg backdrop-blur-sm overflow-hidden">
            {loading ? (
              <div className="h-[600px] flex flex-col items-center justify-center">
                <div className="w-16 h-16 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 text-gray-400">Generating prediction...</p>
              </div>
            ) : (
              <CNTViewer prediction={prediction} />
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
