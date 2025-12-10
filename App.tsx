import React, { useEffect, useState, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';
import { AppDB } from './services/storage';
import { ProductScene } from './components/ProductScene';
import { Overlay } from './components/Overlay';
import { AppMode, PhotoItem, HandState, MusicItem, LightingMode } from './types';

function App() {
  const [mode, setMode] = useState<AppMode>('PRODUCT');
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [music, setMusic] = useState<MusicItem | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [modelUrl, setModelUrl] = useState<string | null>(null);
  const [lighting, setLighting] = useState<LightingMode>('studio');
  
  const audioRef = useRef<HTMLAudioElement>(new Audio());
  const handLandmarkerRef = useRef<HandLandmarker | null>(null);
  // We use a ref for hand state to avoid re-rendering the React tree 60fps, 
  // instead passing it to Three.js loop
  const handStateRef = useRef<HandState>({ detected: false, x: 0, y: 0, pinchDistance: 0 });

  // --- Initialization ---
  useEffect(() => {
    const initApp = async () => {
      // Load DB Data
      const savedPhotos = await AppDB.loadPhotos();
      setPhotos(savedPhotos);
      
      const savedMusic = await AppDB.loadMusic();
      if (savedMusic) {
        setMusic(savedMusic);
        audioRef.current.src = savedMusic.data;
        audioRef.current.loop = true;
      }

      const savedModel = await AppDB.loadModel();
      if (savedModel) {
        setModelUrl(savedModel);
      }
    };
    initApp();
  }, []);

  // --- Hand Gesture Logic ---
  useEffect(() => {
    let video: HTMLVideoElement | null = null;
    let requestUrl: number;

    const startCamera = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm");
        handLandmarkerRef.current = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
            delegate: "GPU"
          },
          runningMode: "VIDEO",
          numHands: 1
        });

        video = document.getElementById('webcam') as HTMLVideoElement;
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
        video.srcObject = stream;
        video.addEventListener("loadeddata", predictWebcam);
      } catch (e) {
        console.error("Camera failed", e);
        setIsCameraActive(false);
        alert("Could not access camera.");
      }
    };

    const predictWebcam = () => {
      if (!handLandmarkerRef.current || !video) return;
      
      const startTimeMs = performance.now();
      if (video.currentTime > 0) {
        const result = handLandmarkerRef.current.detectForVideo(video, startTimeMs);
        
        if (result.landmarks && result.landmarks.length > 0) {
          const lm = result.landmarks[0];
          // Normalized Coordinates (-1 to 1)
          const x = (lm[9].x - 0.5) * 2;
          const y = (lm[9].y - 0.5) * 2;
          
          // Calculate Pinch Distance (Thumb Tip #4 to Index Tip #8)
          const thumbTip = lm[4];
          const indexTip = lm[8];
          const dist = Math.hypot(thumbTip.x - indexTip.x, thumbTip.y - indexTip.y);

          handStateRef.current = {
             detected: true,
             x: x, 
             y: y,
             pinchDistance: dist
          };
          
        } else {
          handStateRef.current = { ...handStateRef.current, detected: false };
        }
      }
      requestUrl = requestAnimationFrame(predictWebcam);
    };

    if (isCameraActive) {
      startCamera();
    } else {
       // Cleanup logic if needed when toggling off
    }

    return () => {
      if (requestUrl) cancelAnimationFrame(requestUrl);
    };
  }, [isCameraActive]);

  // --- Handlers ---
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      Array.from(e.target.files).forEach(file => {
        const reader = new FileReader();
        reader.onload = async (ev) => {
          if (ev.target?.result) {
            await AppDB.savePhoto(ev.target.result as string);
            setPhotos(await AppDB.loadPhotos());
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleMusicUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (ev) => {
        if (ev.target?.result) {
          const data = ev.target.result as string;
          await AppDB.saveMusic(data, file.name);
          setMusic({ id: 'bgm', data, name: file.name });
          audioRef.current.src = data;
          audioRef.current.play();
          setIsPlaying(true);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleModelUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (ev) => {
        if (ev.target?.result) {
          const data = ev.target.result as string;
          // Optimistically update state and save to DB
          setModelUrl(data);
          await AppDB.saveModel(data);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleMusic = () => {
    if (!music) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const toggleLighting = () => {
    const modes: LightingMode[] = ['studio', 'city', 'sunset'];
    const currentIndex = modes.indexOf(lighting);
    const nextIndex = (currentIndex + 1) % modes.length;
    setLighting(modes[nextIndex]);
  };

  const clearData = async () => {
    if (window.confirm("Clear all photos, music, and custom models?")) {
      await AppDB.clear();
      window.location.reload();
    }
  };

  return (
    <div className="relative w-full h-full bg-[#050d1a]">
      
      <Overlay 
        mode={mode} 
        setMode={setMode} 
        isCameraActive={isCameraActive} 
        toggleCamera={() => setIsCameraActive(!isCameraActive)}
        onUploadPhotos={handlePhotoUpload}
        onUploadMusic={handleMusicUpload}
        onUploadModel={handleModelUpload}
        onClearData={clearData}
        musicName={music?.name || null}
        isPlaying={isPlaying}
        toggleMusic={toggleMusic}
        lighting={lighting}
        toggleLighting={toggleLighting}
      />

      <Canvas shadows dpr={[1, 2]} className="w-full h-full">
        <ProductScene 
          mode={mode} 
          photos={photos} 
          handState={handStateRef}
          modelUrl={modelUrl}
          onPhotoClick={() => {}}
          lighting={lighting}
        />
      </Canvas>
    </div>
  );
}

export default App;