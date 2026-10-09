import React, { createContext, useContext, useState, ReactNode } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase/config';
import { useAuth } from './AuthContext';
import { AppType, Category, DeviceType } from '../types';

export interface UploadTaskData {
  id: string;
  appName: string;
  progress: number;
  status: 'uploading' | 'completed' | 'error' | 'paused';
  error?: string;
  appId?: string;
}

interface UploadContextType {
  activeUploads: UploadTaskData[];
  startUpload: (data: UploadFormData) => void;
  removeUpload: (id: string) => void;
}

export interface UploadFormData {
  appName: string;
  shortDesc: string;
  fullDesc: string;
  version: string;
  apkSize: number;
  appType: AppType;
  selectedCategory: Category;
  selectedDevices: DeviceType[];
  logoURL: string;
  featureImageURL: string;
  screenshotURLs: string[];
  apkFileURL: string;
}

const UploadContext = createContext<UploadContextType>({
  activeUploads: [],
  startUpload: () => {},
  removeUpload: () => {},
});

export const useUpload = () => useContext(UploadContext);

export const UploadProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { currentUser, userProfile, refreshProfile } = useAuth();
  const [activeUploads, setActiveUploads] = useState<UploadTaskData[]>([]);

  const removeUpload = (id: string) => {
    setActiveUploads(prev => prev.filter(u => u.id !== id));
  };

  const startUpload = async (data: UploadFormData) => {
    if (!currentUser || !userProfile || !db) return;

    const uploadId = `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const timestamp = Date.now();
    const appId = `app_${timestamp}_${Math.random().toString(36).substr(2, 9)}`;

    setActiveUploads(prev => [...prev, {
      id: uploadId,
      appName: data.appName,
      progress: 0,
      status: 'uploading',
      appId
    }]);

    try {
      setActiveUploads(prev => prev.map(u => 
        u.id === uploadId ? { ...u, progress: 100, status: 'completed' } : u
      ));

      await setDoc(doc(db, 'apps', appId), {
        publisherId: currentUser.uid,
        publisherName: userProfile.displayName,
        publisherAvatar: userProfile.photoURL,
        appName: data.appName,
        appType: data.appType,
        category: data.selectedCategory,
        supportedDevices: data.selectedDevices.length > 0 ? data.selectedDevices : ['Android Phone'],
        shortDescription: data.shortDesc,
        fullDescription: data.fullDesc,
        version: data.version,
        apkSize: data.apkSize,
        logoURL: data.logoURL,
        featureImageURL: data.featureImageURL,
        screenshotURLs: data.screenshotURLs,
        apkFileURL: data.apkFileURL,
        averageRating: 0,
        ratingCount: 0,
        downloadCount: 0,
        createdAt: timestamp,
        updatedAt: timestamp,
        status: 'Published' // Instantly live
      });

      const userRef = doc(db, 'users', currentUser.uid);
      if (data.appType === 'App') {
        await setDoc(userRef, { totalApps: (userProfile.totalApps || 0) + 1 }, { merge: true });
      } else {
        await setDoc(userRef, { totalGames: (userProfile.totalGames || 0) + 1 }, { merge: true });
      }
      await refreshProfile();

      setTimeout(() => {
        removeUpload(uploadId);
      }, 5000);

    } catch (err: any) {
      console.error("Failed publish", err);
      setActiveUploads(prev => prev.map(u => 
        u.id === uploadId ? { ...u, status: 'error', error: err.message || 'Upload failed' } : u
      ));
    }
  };

  return (
    <UploadContext.Provider value={{ activeUploads, startUpload, removeUpload }}>
      {children}
    </UploadContext.Provider>
  );
};
