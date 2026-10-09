import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useUpload } from '../contexts/UploadContext';
import { DeviceType, Category, AppType } from '../types';
import { ArrowLeft, Upload, CheckCircle2, Link as LinkIcon, Plus, X } from 'lucide-react';

const devices: DeviceType[] = ['Android Phone', 'Tablet', 'Android TV', 'Wear OS', 'Chromebook'];
const categories: Category[] = ['Tools', 'Productivity', 'Social', 'Photography', 'Music', 'Video', 'Education', 'Business', 'Finance', 'Health', 'Lifestyle', 'Shopping', 'Communication', 'Entertainment', 'Action', 'Adventure', 'Arcade', 'Puzzle', 'Racing', 'Sports', 'Strategy', 'Simulation', 'Casual', 'Role Playing'];

const UploadApp: React.FC = () => {
  const { currentUser, userProfile } = useAuth();
  const { startUpload } = useUpload();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form State
  const [appName, setAppName] = useState('');
  const [shortDesc, setShortDesc] = useState('');
  const [fullDesc, setFullDesc] = useState('');
  const [version, setVersion] = useState('');
  const [apkSize, setApkSize] = useState('');
  const [appType, setAppType] = useState<AppType>('App');
  const [selectedCategory, setSelectedCategory] = useState<Category>('Tools');
  const [selectedDevices, setSelectedDevices] = useState<DeviceType[]>(['Android Phone']);

  // URL States
  const [logoURL, setLogoURL] = useState('');
  const [featureImageURL, setFeatureImageURL] = useState('');
  const [screenshotURLs, setScreenshotURLs] = useState<string[]>([]);
  const [newScreenshotURL, setNewScreenshotURL] = useState('');
  const [apkFileURL, setApkFileURL] = useState('');

  const toggleDevice = (device: DeviceType) => {
    setSelectedDevices(prev => 
      prev.includes(device) ? prev.filter(d => d !== device) : [...prev, device]
    );
  };

  const addScreenshot = () => {
    if (newScreenshotURL) {
      setScreenshotURLs(prev => [...prev, newScreenshotURL]);
      setNewScreenshotURL('');
    }
  };

  const removeScreenshot = (index: number) => {
    setScreenshotURLs(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!currentUser || !userProfile) {
      setError('You must be logged in to upload.');
      return;
    }
    if (!logoURL || !apkFileURL || !appName || !shortDesc || !fullDesc || !version || !apkSize) {
      setError('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      startUpload({
        appName,
        shortDesc,
        fullDesc,
        version,
        apkSize: parseFloat(apkSize),
        appType,
        selectedCategory,
        selectedDevices,
        logoURL,
        featureImageURL,
        screenshotURLs,
        apkFileURL
      });
      // Navigate immediately to home
      navigate('/');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to start upload.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-20">
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 pt-safe py-3 flex items-center">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 mr-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <span className="font-bold text-lg text-slate-900 dark:text-white">Publish New App</span>
      </header>

      <main className="max-w-3xl mx-auto p-4 md:p-8 space-y-6">
        
        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-xl text-sm border border-red-200">
            {error}
          </div>
        )}

        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 space-y-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">App Details</h2>
          
          <div className="flex gap-4 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl">
            <button
              onClick={() => setAppType('App')}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${appType === 'App' ? 'bg-white dark:bg-slate-800 text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              App
            </button>
            <button
              onClick={() => setAppType('Game')}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${appType === 'Game' ? 'bg-white dark:bg-slate-800 text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Game
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">App Name *</label>
            <input type="text" value={appName} onChange={(e) => setAppName(e.target.value)} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 dark:text-white" placeholder="e.g. Flappy Bird" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Short Description *</label>
            <input type="text" value={shortDesc} onChange={(e) => setShortDesc(e.target.value)} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 dark:text-white" maxLength={80} placeholder="A brief summary (max 80 chars)" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Full Description *</label>
            <textarea value={fullDesc} onChange={(e) => setFullDesc(e.target.value)} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 dark:text-white h-32 resize-none" placeholder="Detailed description of your app..." />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Version *</label>
              <input type="text" value={version} onChange={(e) => setVersion(e.target.value)} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 dark:text-white" placeholder="1.0.0" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Category *</label>
              <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value as Category)} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 dark:text-white">
                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">APK Size (MB) *</label>
              <input type="number" step="0.1" value={apkSize} onChange={(e) => setApkSize(e.target.value)} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 dark:text-white" placeholder="e.g. 24.5" />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Supported Devices</label>
            <div className="flex flex-wrap gap-2">
              {devices.map(device => (
                <button
                  key={device}
                  type="button"
                  onClick={() => toggleDevice(device)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors border ${
                    selectedDevices.includes(device)
                      ? 'bg-indigo-100 dark:bg-indigo-900/50 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {device}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 space-y-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Assets & Download Link</h2>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">APK Download URL *</label>
            <div className="relative">
              <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input type="url" value={apkFileURL} onChange={(e) => setApkFileURL(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 dark:text-white" placeholder="https://example.com/download/app.apk" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">App Logo URL *</label>
              <div className="relative mb-2">
                <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input type="url" value={logoURL} onChange={(e) => setLogoURL(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 dark:text-white" placeholder="https://..." />
              </div>
              {logoURL && (
                <div className="w-24 h-24 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700">
                  <img src={logoURL} alt="Logo preview" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Feature Image URL</label>
              <div className="relative mb-2">
                <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input type="url" value={featureImageURL} onChange={(e) => setFeatureImageURL(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 dark:text-white" placeholder="https://..." />
              </div>
              {featureImageURL && (
                <div className="w-full aspect-[16/9] rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 max-w-[200px]">
                  <img src={featureImageURL} alt="Feature preview" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Screenshot URLs</label>
            <div className="flex gap-2 mb-4">
              <input type="url" value={newScreenshotURL} onChange={(e) => setNewScreenshotURL(e.target.value)} className="flex-1 px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 dark:text-white" placeholder="https://..." onKeyDown={(e) => e.key === 'Enter' && addScreenshot()} />
              <button onClick={addScreenshot} type="button" className="bg-indigo-100 hover:bg-indigo-200 dark:bg-indigo-900/50 dark:hover:bg-indigo-800 text-indigo-600 dark:text-indigo-400 px-4 py-2 rounded-xl transition-colors font-semibold">
                Add
              </button>
            </div>
            
            {screenshotURLs.length > 0 && (
              <div className="flex gap-4 overflow-x-auto pb-2">
                {screenshotURLs.map((url, idx) => (
                  <div key={idx} className="relative shrink-0 w-24 h-40 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 group">
                    <img src={url} alt={`Screenshot ${idx}`} className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
                    <button onClick={() => removeScreenshot(idx)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <button 
          onClick={handleSubmit} 
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-70 text-white py-4 rounded-xl font-bold text-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2"
        >
          {loading ? 'Publishing...' : <><Upload className="w-5 h-5" /> Publish Instantly</>}
        </button>
      </main>
    </div>
  );
};

export default UploadApp;
