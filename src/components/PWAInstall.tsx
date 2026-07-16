import React, { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

const PWAInstall: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Don't show immediately to not annoy the user, maybe wait a bit
      setTimeout(() => setIsVisible(true), 3000);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      console.log('User accepted the A2HS prompt');
    }
    setDeferredPrompt(null);
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 md:left-auto md:right-8 md:bottom-8 z-50 animate-in slide-in-from-bottom-5">
      <div className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 p-4 rounded-2xl shadow-2xl flex items-center gap-4 max-w-sm mx-auto border border-slate-700 dark:border-slate-200">
        <div className="bg-indigo-600 dark:bg-indigo-500 p-2 rounded-xl shrink-0">
          <Download className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-sm truncate">Install NexAppo</h4>
          <p className="text-xs opacity-80 truncate">Get the full experience on your device.</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button 
            onClick={handleInstallClick}
            className="text-xs font-bold bg-white dark:bg-slate-900 text-slate-900 dark:text-white px-3 py-1.5 rounded-lg hover:opacity-90 transition-opacity"
          >
            Install
          </button>
          <button 
            onClick={() => setIsVisible(false)}
            className="p-1.5 hover:bg-slate-800 dark:hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PWAInstall;
