import React from 'react';
import { AppMode, LightingMode } from '../types';

interface OverlayProps {
  mode: AppMode;
  setMode: (m: AppMode) => void;
  isCameraActive: boolean;
  toggleCamera: () => void;
  onUploadPhotos: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onUploadMusic: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onUploadModel: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClearData: () => void;
  musicName: string | null;
  isPlaying: boolean;
  toggleMusic: () => void;
  lighting: LightingMode;
  toggleLighting: () => void;
}

export const Overlay: React.FC<OverlayProps> = ({
  mode, setMode, isCameraActive, toggleCamera, onUploadPhotos, onUploadMusic, onUploadModel, onClearData, musicName, isPlaying, toggleMusic, lighting, toggleLighting
}) => {
  return (
    <div className="absolute inset-0 z-10 pointer-events-none flex flex-col justify-between p-6">
      
      {/* Header */}
      <div className="w-full text-center mt-4">
        <h1 className="text-4xl md:text-6xl font-serif text-transparent bg-clip-text bg-gradient-to-b from-white to-[#d4af37] drop-shadow-[0_0_15px_rgba(212,175,55,0.5)] opacity-90 tracking-widest uppercase">
          Grand Luxury
        </h1>
        <p className="text-[#d4af37] text-xs tracking-[0.3em] uppercase mt-2 opacity-70">Product Showcase Edition</p>
      </div>

      {/* Controls (Right Side) */}
      <div className="absolute top-24 right-6 flex flex-col gap-3 items-end pointer-events-auto">
        <button 
          onClick={toggleCamera}
          className={`px-4 py-2 border backdrop-blur-md text-xs uppercase tracking-widest transition-all duration-300 min-w-[140px] flex items-center justify-center gap-2
            ${isCameraActive 
              ? 'bg-[#d4af37]/80 text-black border-[#d4af37] shadow-[0_0_15px_rgba(212,175,55,0.6)]' 
              : 'bg-black/40 text-[#d4af37] border-[#d4af37]/40 hover:bg-[#d4af37] hover:text-black'}`}
        >
          <i className="fas fa-camera"></i> {isCameraActive ? 'Gesture On' : 'Enable Gesture'}
        </button>

        <button 
          onClick={toggleLighting}
          className="px-4 py-2 border border-[#d4af37]/40 bg-black/40 text-[#d4af37] backdrop-blur-md text-xs uppercase tracking-widest hover:bg-[#d4af37] hover:text-black transition-all min-w-[140px]"
        >
          <i className="fas fa-lightbulb mr-2"></i> Light: {lighting}
        </button>

        <div className="flex flex-col gap-1 items-end">
           <button 
            onClick={toggleMusic}
            onContextMenu={(e) => { e.preventDefault(); document.getElementById('music-upload')?.click(); }}
            className={`px-4 py-2 border backdrop-blur-md text-xs uppercase tracking-widest transition-all duration-300 min-w-[140px]
              ${isPlaying 
                ? 'border-[#64ffda] text-[#64ffda] bg-black/40 shadow-[0_0_10px_rgba(100,255,218,0.3)]' 
                : 'bg-black/40 text-[#d4af37] border-[#d4af37]/40 hover:bg-[#d4af37] hover:text-black'}`}
          >
             <i className="fas fa-music mr-2"></i> {musicName ? (isPlaying ? 'Playing' : 'Paused') : 'Upload BGM'}
          </button>
          <input id="music-upload" type="file" accept="audio/*" onChange={onUploadMusic} className="hidden" />
          <span className="text-[9px] text-[#d4af37]/50 uppercase tracking-wider">Right click to change song</span>
        </div>

        <label className="px-4 py-2 border border-[#d4af37]/40 bg-black/40 text-[#d4af37] backdrop-blur-md text-xs uppercase tracking-widest hover:bg-[#d4af37] hover:text-black transition-all cursor-pointer min-w-[140px] text-center">
          Upload Photos
          <input type="file" multiple accept="image/*" onChange={onUploadPhotos} className="hidden" />
        </label>

        <label className="px-4 py-2 border border-[#d4af37]/40 bg-black/40 text-[#d4af37] backdrop-blur-md text-xs uppercase tracking-widest hover:bg-[#d4af37] hover:text-black transition-all cursor-pointer min-w-[140px] text-center">
          Upload Model
          <input type="file" accept=".glb,.gltf" onChange={onUploadModel} className="hidden" />
        </label>

        <button 
          onClick={onClearData}
          className="px-4 py-2 border border-red-500/40 text-red-300 bg-black/40 backdrop-blur-md text-xs uppercase tracking-widest hover:bg-red-800 hover:text-white transition-all min-w-[140px]"
        >
          <i className="fas fa-trash mr-2"></i> Reset
        </button>
      </div>

      {/* Mode Switcher (Bottom Center) */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-4 pointer-events-auto">
        <button 
          onClick={() => setMode('PRODUCT')}
          className={`w-12 h-12 rounded-full border flex items-center justify-center text-lg transition-all duration-300 backdrop-blur-sm
            ${mode === 'PRODUCT' ? 'bg-[#d4af37] text-black border-[#d4af37] scale-110 shadow-[0_0_20px_rgba(212,175,55,0.4)]' : 'bg-black/60 text-[#d4af37] border-[#d4af37] hover:scale-105'}`}
          title="Product Mode"
        >
          <i className="fas fa-cube"></i>
        </button>
        <button 
          onClick={() => setMode('SCATTER')}
          className={`w-12 h-12 rounded-full border flex items-center justify-center text-lg transition-all duration-300 backdrop-blur-sm
            ${mode === 'SCATTER' ? 'bg-[#d4af37] text-black border-[#d4af37] scale-110 shadow-[0_0_20px_rgba(212,175,55,0.4)]' : 'bg-black/60 text-[#d4af37] border-[#d4af37] hover:scale-105'}`}
           title="Scatter Mode"
        >
          <i className="fas fa-snowflake"></i>
        </button>
      </div>

      {/* Webcam Preview */}
      <div className={`absolute bottom-24 left-6 border border-[#d4af37]/50 rounded overflow-hidden shadow-[0_0_20px_black] transition-opacity duration-500 w-32 h-24 bg-black ${isCameraActive ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <video id="webcam" className="w-full h-full object-cover scale-x-[-1]" autoPlay playsInline muted></video>
      </div>
      
      {/* Instructions */}
      <div className="absolute bottom-2 left-0 w-full text-center pointer-events-none">
        <p className="text-[#d4af37]/60 text-[10px] uppercase tracking-widest font-mono">
          {isCameraActive ? 'Gesture Active: Open Hand to Rotate • Pinch to Focus' : 'Drag to Rotate • Click Photos'}
        </p>
      </div>

    </div>
  );
};