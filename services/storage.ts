import { PhotoItem, MusicItem } from '../types';

const DB_NAME = 'GrandLuxuryProductDB';
const DB_VERSION = 3; // Incremented for background store

export const AppDB = {
  db: null as IDBDatabase | null,

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (e) => {
        const db = (e.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains('photos')) {
          db.createObjectStore('photos', { keyPath: 'id', autoIncrement: true });
        }
        if (!db.objectStoreNames.contains('music')) {
          db.createObjectStore('music', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('model')) {
          db.createObjectStore('model', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('background')) {
          db.createObjectStore('background', { keyPath: 'id' });
        }
      };

      request.onsuccess = (e) => {
        this.db = (e.target as IDBOpenDBRequest).result;
        console.log("Storage System Online");
        resolve();
      };

      request.onerror = (e) => reject(e);
    });
  },

  async savePhoto(dataUrl: string): Promise<void> {
    if (!this.db) await this.init();
    return new Promise((resolve) => {
      const tx = this.db!.transaction(['photos'], 'readwrite');
      tx.objectStore('photos').add({ data: dataUrl, date: new Date().toISOString() });
      tx.oncomplete = () => resolve();
    });
  },

  async loadPhotos(): Promise<PhotoItem[]> {
    if (!this.db) await this.init();
    return new Promise((resolve) => {
      const tx = this.db!.transaction(['photos'], 'readonly');
      const request = tx.objectStore('photos').getAll();
      request.onsuccess = () => resolve(request.result || []);
    });
  },

  async saveMusic(dataUrl: string, name: string): Promise<void> {
    if (!this.db) await this.init();
    return new Promise((resolve) => {
      const tx = this.db!.transaction(['music'], 'readwrite');
      tx.objectStore('music').put({ id: 'bgm', data: dataUrl, name });
      tx.oncomplete = () => resolve();
    });
  },

  async loadMusic(): Promise<MusicItem | null> {
    if (!this.db) await this.init();
    return new Promise((resolve) => {
      const tx = this.db!.transaction(['music'], 'readonly');
      const request = tx.objectStore('music').get('bgm');
      request.onsuccess = () => resolve(request.result || null);
    });
  },

  async saveModel(dataUrl: string): Promise<void> {
    if (!this.db) await this.init();
    return new Promise((resolve) => {
      const tx = this.db!.transaction(['model'], 'readwrite');
      tx.objectStore('model').put({ id: 'customModel', data: dataUrl });
      tx.oncomplete = () => resolve();
    });
  },

  async loadModel(): Promise<string | null> {
    if (!this.db) await this.init();
    return new Promise((resolve) => {
      const tx = this.db!.transaction(['model'], 'readonly');
      const request = tx.objectStore('model').get('customModel');
      request.onsuccess = () => resolve(request.result?.data || null);
    });
  },

  async saveBackground(dataUrl: string): Promise<void> {
    if (!this.db) await this.init();
    return new Promise((resolve) => {
      const tx = this.db!.transaction(['background'], 'readwrite');
      tx.objectStore('background').put({ id: 'customBg', data: dataUrl });
      tx.oncomplete = () => resolve();
    });
  },

  async loadBackground(): Promise<string | null> {
    if (!this.db) await this.init();
    return new Promise((resolve) => {
      const tx = this.db!.transaction(['background'], 'readonly');
      const request = tx.objectStore('background').get('customBg');
      request.onsuccess = () => resolve(request.result?.data || null);
    });
  },

  async clear(): Promise<void> {
    if (!this.db) await this.init();
    return new Promise((resolve) => {
      const tx = this.db!.transaction(['photos', 'music', 'model', 'background'], 'readwrite');
      tx.objectStore('photos').clear();
      tx.objectStore('music').clear();
      tx.objectStore('model').clear();
      tx.objectStore('background').clear();
      tx.oncomplete = () => resolve();
    });
  }
};