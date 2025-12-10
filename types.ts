
export type AppMode = 'PRODUCT' | 'SCATTER' | 'FOCUS';
export type LightingMode = 'studio' | 'city' | 'sunset';

export interface PhotoItem {
  id?: number;
  data: string; // Base64 data URL
  date: string;
}

export interface MusicItem {
  id: string;
  data: string;
  name: string;
}

export interface HandState {
  detected: boolean;
  x: number; // Normalized -1 to 1
  y: number; // Normalized -1 to 1
  pinchDistance?: number;
}
