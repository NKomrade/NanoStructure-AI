"use client";

import { useState } from "react";
import { Prediction, ApiStatus } from "../page";
import LoadingStatus from "./LoadingStatus";

interface InputFormProps {
  setPrediction: (prediction: Prediction | null) => void;
  setLoading: (loading: boolean) => void;
  apiStatus: ApiStatus | null;
}

const validateInputs = (n: number, m: number) => {
  const errors: string[] = [];
  
  if (m > n) errors.push("m must be ≤ n for valid chiral vectors");
  if (n < 1 || n > 20) errors.push("n should be between 1-20");
  if (m < 0 || m > 20) errors.push("m should be between 0-20");
  
  return errors;
};

const presets = [
  { name: "Armchair (5,5)", n: 5, m: 5 },
  { name: "Zigzag (10,0)", n: 10, m: 0 },
  { name: "Chiral (8,3)", n: 8, m: 3 },
  { name: "Metallic (6,6)", n: 6, m: 6 }
];

const InputForm: React.FC<InputFormProps> = ({
  setPrediction,
  setLoading,
  apiStatus,
}) => {
  const [n, setN] = useState<number>(2);
  const [m, setM] = useState<number>(1);
  const [u, setU] = useState<number>(0.679);
  const [v, setV] = useState<number>(0.701);
  const [w, setW] = useState<number>(0.017);
  const [error, setError] = useState<string>("");

  const isApiReady = apiStatus?.status === 'ready';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isApiReady) {
      setError("API is not ready. Please wait for the model to load.");
      return;
    }

    const validationErrors = validateInputs(n, m);
    if (validationErrors.length > 0) {
      setError(validationErrors.join(", "));
      return;
    }

    setError("");
    setLoading(true);
    setPrediction(null);

    try {
      const response = await fetch("http://127.0.0.1:8000/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ n, m, u, v, w }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Server error: ${response.status}`);
      }

      if (!data.calculated || !data.initial) {
        throw new Error("Invalid response format from server");
      }

      setPrediction(data);
    } catch (err: Error | unknown) {
      console.error("Prediction error:", err);
      setError(err instanceof Error ? err.message : "Failed to get prediction. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handlePresetSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedPreset = presets.find(p => p.name === e.target.value);
    if (selectedPreset) {
      setN(selectedPreset.n);
      setM(selectedPreset.m);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <LoadingStatus apiStatus={apiStatus} />
      
      <div className="space-y-6 bg-gray-800/50 p-4 rounded-lg">
        <div>
          <label htmlFor="preset" className="block text-sm font-medium text-gray-300 mb-2">
            Preset Configurations
          </label>
          <select
            id="preset"
            onChange={handlePresetSelect}
            className="w-full bg-gray-700 border-gray-600 rounded-md shadow-sm focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm text-white p-2"
          >
            <option value="">Select a preset...</option>
            {presets.map(preset => (
              <option key={preset.name} value={preset.name}>
                {preset.name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="n" className="block text-sm font-medium text-gray-300">
              Chiral Index (n)
            </label>
            <input
              type="number"
              id="n"
              value={n}
              onChange={(e) => setN(Number(e.target.value))}
              className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm text-white p-2"
            />
          </div>
          <div>
            <label htmlFor="m" className="block text-sm font-medium text-gray-300">
              Chiral Index (m)
            </label>
            <input
              type="number"
              id="m"
              value={m}
              onChange={(e) => setM(Number(e.target.value))}
              className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm text-white p-2"
            />
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium text-gray-300 mb-2">
            Initial Atomic Coordinates
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label htmlFor="u" className="block text-sm font-medium text-gray-300">
                u
              </label>
              <input
                type="number"
                step="any"
                id="u"
                value={u}
                onChange={(e) => setU(Number(e.target.value))}
                className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm text-white p-2"
              />
            </div>
            <div>
              <label htmlFor="v" className="block text-sm font-medium text-gray-300">
                v
              </label>
              <input
                type="number"
                step="any"
                id="v"
                value={v}
                onChange={(e) => setV(Number(e.target.value))}
                className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm text-white p-2"
              />
            </div>
            <div>
              <label htmlFor="w" className="block text-sm font-medium text-gray-300">
                w
              </label>
              <input
                type="number"
                step="any"
                id="w"
                value={w}
                onChange={(e) => setW(Number(e.target.value))}
                className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm text-white p-2"
              />
            </div>
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={!isApiReady}
        className={`w-full py-3 px-4 border border-transparent rounded-lg shadow-md text-sm font-medium text-white transition-all duration-200 
          ${isApiReady 
            ? 'bg-cyan-600 hover:bg-cyan-700 hover:shadow-lg focus:ring-2 focus:ring-cyan-500' 
            : 'bg-gray-600 cursor-not-allowed'
          } focus:outline-none`}
      >
        {isApiReady ? 'Predict Coordinates' : 'Waiting for API...'}
      </button>

      {error && (
        <div className="bg-red-500/20 border border-red-500 rounded-lg p-4">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}
    </form>
  );
};

export default InputForm;
