import React, { useRef, useEffect, useState, useMemo, Suspense } from 'react';
import { useFrame, useThree, useLoader } from '@react-three/fiber';
import { Float, PerspectiveCamera, Stars, Gltf, Center, OrbitControls, Resize, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { AppMode, PhotoItem, HandState, LightingMode } from '../types';

// Fix for missing JSX types in current environment
declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      ambientLight: any;
      pointLight: any;
      spotLight: any;
      hemisphereLight: any;
      group: any;
      mesh: any;
      icosahedronGeometry: any;
      meshStandardMaterial: any;
      torusGeometry: any;
      meshBasicMaterial: any;
      axesHelper: any;
      sphereGeometry: any;
      boxGeometry: any;
      gridHelper: any;
      planeGeometry: any;
    }
  }
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      ambientLight: any;
      pointLight: any;
      spotLight: any;
      hemisphereLight: any;
      group: any;
      mesh: any;
      icosahedronGeometry: any;
      meshStandardMaterial: any;
      torusGeometry: any;
      meshBasicMaterial: any;
      axesHelper: any;
      sphereGeometry: any;
      boxGeometry: any;
      gridHelper: any;
      planeGeometry: any;
    }
  }
}

// --- Placeholder for your 3D Product ---
const ProductPlaceholder = () => {
  return (
    <group>
      {/* Central "Product" Core */}
      <mesh castShadow receiveShadow>
        <icosahedronGeometry args={[2.5, 1]} />
        <meshStandardMaterial 
          color="#1a1a1a" 
          metalness={0.5} 
          roughness={0.2} 
          emissive="#d4af37"
          emissiveIntensity={0.2}
        />
      </mesh>
      
      {/* Decorative Rings */}
      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[3.5, 0.05, 16, 100]} />
          <meshBasicMaterial color="#d4af37" transparent opacity={0.5} />
        </mesh>
      </Float>
      <Float speed={-2} rotationIntensity={0.5} floatIntensity={0.5}>
        <mesh rotation={[0, 0, Math.PI / 4]}>
          <torusGeometry args={[4.2, 0.02, 16, 100]} />
          <meshBasicMaterial color="#64ffda" transparent opacity={0.3} />
        </mesh>
      </Float>
    </group>
  );
};

// --- Custom User Product ---
const UserProduct = ({ url }: { url: string }) => {
  return (
    <Suspense fallback={<ProductPlaceholder />}>
      <Center>
        {/* Resize ensures the model fits within a standard size box regardless of its original scale */}
        <Resize scale={10}>
          <Gltf 
            src={url} 
            castShadow 
            receiveShadow 
          />
        </Resize>
      </Center>
    </Suspense>
  );
};

// --- Background Loader Component ---
const CustomBackground = ({ url }: { url: string }) => {
  const texture = useLoader(THREE.TextureLoader, url);
  texture.mapping = THREE.EquirectangularReflectionMapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  return <Environment background map={texture} />;
};

// --- Floating Photos ---
const PhotoCloud = ({ photos, mode, focusTarget }: { photos: PhotoItem[], mode: AppMode, focusTarget: number | null }) => {
  const meshRefs = useRef<THREE.Mesh[]>([]);
  const textureLoader = useMemo(() => new THREE.TextureLoader(), []);

  // Preload textures
  const textures = useMemo(() => {
    return photos.map(p => {
      const t = textureLoader.load(p.data);
      t.colorSpace = THREE.SRGBColorSpace;
      return t;
    });
  }, [photos, textureLoader]);

  useFrame((state, delta) => {
    const time = state.clock.elapsedTime;
    
    meshRefs.current.forEach((mesh, i) => {
      if (!mesh) return;
      
      let targetPos = new THREE.Vector3();
      let targetRot = new THREE.Euler();
      let targetScale = 1;

      if (mode === 'PRODUCT') {
        // Cylinder arrangement around product
        const radius = 10; // Slightly larger radius to accommodate larger product
        const height = 15;
        const yOffset = -height / 2;
        const angleStep = (Math.PI * 2 * 2) / photos.length; // 2 loops
        const angle = i * angleStep + time * 0.1;
        const y = yOffset + (i / photos.length) * height;

        targetPos.set(
          Math.cos(angle) * radius,
          y,
          Math.sin(angle) * radius
        );
        // Face center
        targetRot.set(0, -angle + Math.PI / 2, 0); 

      } else if (mode === 'SCATTER') {
        // Random floating
        const seed = i * 133.7;
        const r = 18 + Math.sin(seed) * 5;
        targetPos.set(
          Math.sin(seed + time * 0.1) * r,
          Math.cos(seed * 0.5 + time * 0.2) * r * 0.5,
          Math.cos(seed + time * 0.1) * r
        );
        targetRot.set(time * 0.2, time * 0.1, 0);
        targetScale = 1.5;

      } else if (mode === 'FOCUS' && focusTarget === i) {
        // Bring to front
        targetPos.set(0, 0, 15);
        targetRot.set(0, 0, 0);
        targetScale = 4;
      } else if (mode === 'FOCUS') {
        // Push others back
        const seed = i * 133.7;
        targetPos.set(
           Math.sin(seed) * 30,
           Math.cos(seed) * 30,
           -20
        );
        targetScale = 0;
      }

      mesh.position.lerp(targetPos, delta * 2);
      mesh.rotation.x = THREE.MathUtils.lerp(mesh.rotation.x, targetRot.x, delta * 2);
      mesh.rotation.y = THREE.MathUtils.lerp(mesh.rotation.y, targetRot.y, delta * 2);
      mesh.rotation.z = THREE.MathUtils.lerp(mesh.rotation.z, targetRot.z, delta * 2);
      mesh.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), delta * 4);
    });
  });

  return (
    <group>
      {photos.map((photo, i) => (
        <group key={photo.id || i}>
           {/* Frame */}
           <mesh 
             ref={(el) => (meshRefs.current[i] = el!)}
             position={[0,0,0]}
             onClick={(e) => {
               e.stopPropagation();
               // Handle click if needed
             }}
           >
             <boxGeometry args={[1.6, 1.2, 0.05]} />
             <meshStandardMaterial color="#d4af37" metalness={0.8} roughness={0.2} />
             
             {/* Photo */}
             <mesh position={[0, 0, 0.03]}>
                <planeGeometry args={[1.5, 1.1]} />
                <meshBasicMaterial map={textures[i]} />
             </mesh>
           </mesh>
        </group>
      ))}
    </group>
  );
};

export const ProductScene = ({ 
  mode, 
  photos, 
  handState,
  modelUrl,
  backgroundUrl,
  onPhotoClick,
  lighting
}: { 
  mode: AppMode; 
  photos: PhotoItem[]; 
  handState: React.MutableRefObject<HandState>;
  modelUrl?: string | null;
  backgroundUrl?: string | null;
  onPhotoClick: (index: number) => void;
  lighting: LightingMode;
}) => {
  const mainGroupRef = useRef<THREE.Group>(null);
  
  useFrame((state, delta) => {
    if (mainGroupRef.current) {
      const { detected, x, y, pinchDistance } = handState.current;
      
      if (detected) {
        // --- Rotation Logic ---
        const targetRotY = x * Math.PI * 0.5;
        const targetRotX = y * Math.PI * 0.2;
        
        mainGroupRef.current.rotation.y += (targetRotY - mainGroupRef.current.rotation.y) * 2 * delta;
        mainGroupRef.current.rotation.x += (targetRotX - mainGroupRef.current.rotation.x) * 2 * delta;

        // --- Scale Logic (Pinch to Zoom) ---
        if (pinchDistance !== undefined) {
           const minPinch = 0.02; 
           const maxPinch = 0.15; 
           
           const normalizedInput = THREE.MathUtils.clamp((pinchDistance - minPinch) / (maxPinch - minPinch), 0, 1);
           const targetScale = 0.6 + (normalizedInput * 1.2); 

           const currentScale = mainGroupRef.current.scale;
           currentScale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), delta * 5);
        }

      } else {
        // Auto rotate if no hand
        if (mode === 'PRODUCT') {
          mainGroupRef.current.rotation.y += 0.2 * delta;
          mainGroupRef.current.rotation.x = THREE.MathUtils.lerp(mainGroupRef.current.rotation.x, 0, delta);
        }
        // Reset scale
        mainGroupRef.current.scale.lerp(new THREE.Vector3(1, 1, 1), delta * 2);
      }
    }
  });

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 2, 25]} fov={50} />
      
      <OrbitControls 
        makeDefault 
        enablePan={false} 
        minDistance={5} 
        maxDistance={50} 
        enableDamping
        dampingFactor={0.05}
      />
      
      <Suspense fallback={null}>
        {backgroundUrl ? (
          <CustomBackground url={backgroundUrl} />
        ) : (
          <>
            <Environment preset={lighting} background={false} />
            <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
          </>
        )}
      </Suspense>

      <ambientLight intensity={0.2} />
      <hemisphereLight intensity={0.3} color="#ffffff" groundColor="#444444" />
      <pointLight position={[10, 10, 10]} intensity={1.5} color="#ffd700" castShadow />
      <pointLight position={[-10, -5, -10]} intensity={1} color="#64ffda" />
      <spotLight position={[0, 50, 0]} angle={0.3} penumbra={1} intensity={800} castShadow />

      <group ref={mainGroupRef}>
        {modelUrl ? <UserProduct url={modelUrl} /> : <ProductPlaceholder />}
        <PhotoCloud photos={photos} mode={mode} focusTarget={null} />
      </group>
    </>
  );
};