"use client";

import { Canvas } from '@react-three/fiber';
import { OrbitControls, Sphere, Line, Html, PerspectiveCamera, Grid } from '@react-three/drei';
import { useState } from 'react';

interface Prediction {
  initial: { u: number; v: number; w: number };
  calculated: { u: number; v: number; w: number };
}

interface CNTViewerProps {
  prediction: Prediction | null;
}

const CoordinateLabel = ({ position, label, color, offset = [0, 0.3, 0] }: { 
  position: [number, number, number], 
  label: string, 
  color: string,
  offset?: [number, number, number]
}) => {
  const adjustedPosition: [number, number, number] = [
    position[0] + offset[0],
    position[1] + offset[1],
    position[2] + offset[2]
  ];
  
  return (
    <Html position={adjustedPosition} center>
      <div 
        className="pointer-events-none px-2 py-1 rounded text-xs font-medium shadow-lg backdrop-blur-sm whitespace-nowrap"
        style={{ 
          backgroundColor: `${color}15`,
          border: `1px solid ${color}60`,
          color: color
        }}
      >
        {label}
      </div>
    </Html>
  );
};

const CNTViewer: React.FC<CNTViewerProps> = ({ prediction }) => {
  const [showInfo, setShowInfo] = useState(true);

  if (!prediction) {
    return (
      <div className="w-full h-[600px] flex items-center justify-center text-gray-400 bg-gray-900/30 rounded-lg">
        <p className="text-sm">Submit parameters to see the visualization</p>
      </div>
    );
  }

  const initialCoords: [number, number, number] = [
    prediction.initial.u || 0,
    prediction.initial.v || 0,
    prediction.initial.w || 0
  ];

  const calculatedCoords: [number, number, number] = [
    prediction.calculated.u || 0,
    prediction.calculated.v || 0,
    prediction.calculated.w || 0
  ];

  const displacement = Math.sqrt(
    Math.pow(calculatedCoords[0] - initialCoords[0], 2) +
    Math.pow(calculatedCoords[1] - initialCoords[1], 2) +
    Math.pow(calculatedCoords[2] - initialCoords[2], 2)
  );

  return (
    <div className="w-full h-[600px] relative">
      {/* Title */}
      <div className="absolute top-4 right-4 z-10 bg-gray-900/90 px-4 py-2 rounded-lg">
        <h2 className="text-lg font-bold text-cyan-300">3D Visualization</h2>
      </div>

      {/* Compact Info Toggle */}
      <button
        onClick={() => setShowInfo(!showInfo)}
        className="absolute top-3 left-3 z-10 bg-gray-900/90 hover:bg-gray-800/90 px-3 py-1.5 rounded text-xs font-medium text-gray-300 hover:text-white transition-all shadow-lg border border-gray-700/50"
      >
        {showInfo ? '← Hide Info' : 'Info →'}
      </button>

      {/* Sliding Info Panel */}
      <div 
        className={`absolute top-10 -left-12 z-10 bg-gray-900/95 backdrop-blur-sm rounded shadow-xl border border-gray-700/50 transition-all duration-300 ${
          showInfo ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0 pointer-events-none'
        }`}
        style={{ width: '220px', marginLeft: showInfo ? '60px' : '0' }}
      >
        <div className="p-3 space-y-2">
          <h3 className="font-semibold text-cyan-400 text-sm border-b border-gray-700 pb-2">
        Coordinate Visualization
          </h3>
          
          <div className="space-y-1.5 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-cyan-400 flex-shrink-0"></div>
          <span className="text-gray-300">Initial Position</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-orange-500 flex-shrink-0"></div>
          <span className="text-gray-300">Calculated Position</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-0.5 bg-white/60 flex-shrink-0"></div>
          <span className="text-gray-300">Displacement Line</span>
        </div>
          </div>

          <div className="pt-2 border-t border-gray-700 mt-2">
        <div className="text-xs">
          <span className="text-gray-400">Displacement:</span>
          <span className="ml-2 font-mono text-cyan-400">{displacement.toFixed(4)}</span>
          <span className="text-gray-500 ml-1">units</span>
        </div>
          </div>

          <div className="pt-2 border-t border-gray-700 text-xs text-gray-500">
        Drag to rotate • Scroll to zoom
          </div>
        </div>
      </div>

      <Canvas>
        <PerspectiveCamera makeDefault position={[2, 2, 2]} fov={60} />
        <ambientLight intensity={0.6} />
        <pointLight position={[10, 10, 5]} intensity={0.8} />
        <pointLight position={[-10, -10, -5]} intensity={0.3} />
        
        <Grid
          args={[10, 10]}
          position={[0, 0, 0]}
          cellSize={0.5}
          cellThickness={0.5}
          cellColor="#ffffff15"
          sectionSize={1}
          sectionThickness={1}
          sectionColor="#ffffff30"
        />
        
        {/* Initial Position */}
        <Sphere position={initialCoords} args={[0.08]}>
          <meshStandardMaterial color="#ff6b35" emissive="#ff6b35" emissiveIntensity={0.3} />
        </Sphere>
        <CoordinateLabel
          position={initialCoords}
          label={`Initial (${initialCoords.map(c => c.toFixed(2)).join(', ')})`}
          color="#ff6b35"
          offset={[0, 0.25, 0]}
        />
        
        {/* Calculated Position */}
        <Sphere position={calculatedCoords} args={[0.08]}>
          <meshStandardMaterial color="#00d4ff" emissive="#00d4ff" emissiveIntensity={0.3} />
        </Sphere>
        <CoordinateLabel
          position={calculatedCoords}
          label={`Calculated (${calculatedCoords.map(c => c.toFixed(2)).join(', ')})`}
          color="#00d4ff"
          offset={[0, -0.25, 0]}
        />
        
        {/* Connection Line */}
        <Line
          points={[initialCoords, calculatedCoords]}
          color="#ffffff"
          lineWidth={2}
          opacity={0.6}
          transparent
          dashed
          dashScale={50}
          dashSize={0.1}
          gapSize={0.05}
        />
        
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={1}
          maxDistance={10}
        />
      </Canvas>
    </div>
  );
};

export default CNTViewer;