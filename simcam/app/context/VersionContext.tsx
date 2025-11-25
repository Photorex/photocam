"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { APP_VERSION } from '@/app/lib/version';

const VERSION_KEY = 'app_version';
const VERSION_CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutes

interface VersionContextType {
  currentVersion: string;
  isOutdated: boolean;
  checkVersion: () => Promise<void>;
  forceRefresh: () => void;
}

const VersionContext = createContext<VersionContextType>({
  currentVersion: APP_VERSION,
  isOutdated: false,
  checkVersion: async () => {},
  forceRefresh: () => {},
});

export const VersionProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentVersion, setCurrentVersion] = useState(APP_VERSION);
  const [isOutdated, setIsOutdated] = useState(false);
  
  const checkVersion = async () => {
    try {
      const storedVersion = localStorage.getItem(VERSION_KEY) || APP_VERSION;
      
      const res = await fetch('/api/version', { 
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' }
      });
      
      if (res.ok) {
        const { version } = await res.json();
        
        if (version !== storedVersion) {
          console.log(`Version mismatch: stored=${storedVersion}, server=${version}`);
          setIsOutdated(true);
          
          // Auto-refresh after a short delay
          setTimeout(forceRefresh, 500);
        } else {
          localStorage.setItem(VERSION_KEY, version);
          setCurrentVersion(version);
          setIsOutdated(false);
        }
      }
    } catch (err) {
      console.error('Error checking version:', err);
    }
  };
  
  const forceRefresh = () => {
    // Clear cache
    localStorage.clear();
    sessionStorage.clear();
    
    // Save current app state temporarily if needed
    const currentPath = window.location.pathname;
    sessionStorage.setItem('recovery_path', currentPath);
    
    // Redirect to recovery endpoint
    window.location.href = '/api/recover';
  };

  useEffect(() => {
    // Initial check
    checkVersion();
    
    // Set up interval for periodic checks
    const interval = setInterval(checkVersion, VERSION_CHECK_INTERVAL);
    
    // Check for recovery path
    const recoveryPath = sessionStorage.getItem('recovery_path');
    if (recoveryPath) {
      sessionStorage.removeItem('recovery_path');
      // Navigate back if not on home page
      if (recoveryPath !== '/' && window.location.pathname === '/') {
        window.location.href = recoveryPath;
      }
    }
    
    return () => clearInterval(interval);
  }, []);

  return (
    <VersionContext.Provider value={{ 
      currentVersion, 
      isOutdated, 
      checkVersion,
      forceRefresh 
    }}>
      {children}
      {isOutdated && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          background: '#4a4a4a',
          color: 'white',
          textAlign: 'center',
          padding: '10px',
          zIndex: 9999
        }}>
          App update available. Refreshing...
        </div>
      )}
    </VersionContext.Provider>
  );
};

export const useVersion = () => useContext(VersionContext); 