import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';
import { DeviceType, Category, AppItem } from '../types';
import { ArrowLeft, Save, Trash2, Link as LinkIcon, Plus, X } from 'lucide-react';

const categories: Category[] = ['Tools', 'Productivity', 'Social', 'Photography', 'Music', 'Video', 'Education', 'Business', 'Finance', 'Health', 'Lifestyle', 'Shopping', 'Communication', 'Entertainment', 'Action', 'Adventure', 'Arcade', 'Puzzle', 'Racing', 'Sports', 'Strategy', 'Simulation', 'Casual', 'Role Playing'];

const EditApp: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { currentUser, userProfile, refreshProfile } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [appData, setAppData] = useState<AppItem | null>(null);

  // Form State
  const [appName, setAppName] = useState('');
  const [shortDesc, setShortDesc] = useState('');
  const [fullDesc, setFullDesc] = useState('');
  const [version, setVersion] = useState('');
  const [apkSize, setApkSize] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category>('Tools');

  // URL States
  const [logoURL, setLogoURL] = useState('');
  const [featureImageURL, setFeatureImageURL] = useState('');
  const [screenshotURLs, setScreenshotURLs] = useState<string[]>([]);
  const [newScreenshotURL, setNewScreenshotURL] = useState('');
  const [apkFileURL, setApkFileURL] = useState('');

  useEffect(() => {
    const fetchApp = async () => {
      if (!id || !db) return;
      try {
        const appRef = doc(db, 'apps', id);
        const snap = await getDoc(appRef);
        if (snap.exists()) {
          const data = snap.data() as AppItem;
          if (data.publisherId !== currentUser?.uid) {
            setError('You do not have permission to edit this app.');
            return;
          }
          setAppData({ id: snap.id, ...data });
          
          setAppName(data.appName);
          setShortDesc(data.shortDescription);
          setFullDesc(data.fullDescription);
          setVersion(data.version);
          setApkSize(data.apkSize.toString());
          setSelectedCategory(data.category);
          
          setLogoURL(data.logoURL);
          setFeatureImageURL(data.featureImageURL);
          setScreenshotURLs(data.screenshotURLs || []);
          setApkFileURL(data.apkFileURL);
        } else {
          setError('App not found.');
        }
      } catch (err) {
        console.error(err);
        setError('Failed to fetch app data.');
      } finally {
        setLoading(false);
      }
    };
    fetchApp();
  }, [id, currentUser]);

  const addScreenshot = () => {
    if (newScreenshotURL) {
      setScreenshotURLs(prev => [...prev, newScreenshotURL]);
      setNewScreenshotURL('');
    }
  };

  const removeScreenshot = (index: number) => {
    setScreenshotURLs(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!appData || !db || !id) return;
    setSaving(true);
    setError('');
    
    try {
      await updateDoc(doc(db, 'apps', id), {
        appName,
        shortDescription: shortDesc,
        fullDescription: fullDesc,
        version,
        apkSize: parseFloat(apkSize) || appData.apkSize,
        category: selectedCategory,
        logoURL,
        featureImageURL,
        apkFileURL,
        screenshotURLs,
        updatedAt: Date.now()
      });

      navigate(`/app/${id}`);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to save changes.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!appData || !db || !id) return;
    if (window.confirm(`Are you sure you want to permanently delete ${appData.appName}? This cannot be undone.`)) {
      try {
        setSaving(true);
        // Delete from Firestore
        await deleteDoc(doc(db, 'apps', id));
        
        // Update user stats
        if (currentUser && userProfile) {
          const userRef = doc(db, 'users', currentUser.uid);
          if (appData.appType === 'App') {
            await updateDoc(userRef, { totalApps: Math.max(0, userProfile.totalApps - 1) });
          } else {
            await updateDoc(userRef, { totalGames: Math.max(0, userProfile.totalGames - 1) });
          }
          await refreshProfile();
        }
        navigate('/profile');
      } catch (err: any) {
        setError(err.message);
        setSaving(false);
      }
    }
  };

  if (loading) return <div className="p-8 text-center flex justify-center"><div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div></div>;
  if (error && !appData) return <div className="p-8 text-center text-red-500 font-bold">{error}</div>;
  if (!appData) return null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-20">
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 pt-safe py-3 flex items-center justify-between">
        <div className="flex items-center">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 mr-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <span className="font-bold text-lg text-slate-900 dark:text-white truncate max-w-[150px] sm:max-w-xs">Edit {appData.appName}</span>
        </div>
        <button 
          onClick={handleSave} 
          disabled={saving || !appName}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-4 py-1.5 rounded-full font-semibold transition-colors"
        >
          {saving ? `Saving...` : <><Save className="w-4 h-4" /> Save</>}
        </button>
      </header>

      <main className="max-w-3xl mx-auto p-4 md:p-8 space-y-6">
        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-xl text-sm border border-red-200">{error}</div>
        )}
        
        {/* Assets & Links */}
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

        {/* Text Details */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 space-y-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">App Details</h2>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">App Name *</label>
            <input type="text" value={appName} onChange={(e) => setAppName(e.target.value)} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 dark:text-white" />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Short Description *</label>
            <input type="text" value={shortDesc} onChange={(e) => setShortDesc(e.target.value)} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 dark:text-white" maxLength={80} />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Full Description *</label>
            <textarea value={fullDesc} onChange={(e) => setFullDesc(e.target.value)} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 dark:text-white h-32 resize-none" />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Version *</label>
              <input type="text" value={version} onChange={(e) => setVersion(e.target.value)} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Category *</label>
              <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value as Category)} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 dark:text-white">
                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">APK Size (MB)</label>
              <input type="number" step="0.1" value={apkSize} onChange={(e) => setApkSize(e.target.value)} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 dark:text-white" />
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-rose-50 dark:bg-rose-900/10 rounded-3xl p-6 border border-rose-100 dark:border-rose-900/30 flex justify-between items-center">
          <div>
            <h3 className="font-bold text-rose-600 dark:text-rose-400">Danger Zone</h3>
            <p className="text-sm text-rose-500/80">Permanently delete this app and all its data.</p>
          </div>
          <button 
            onClick={handleDelete} 
            disabled={saving}
            className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-xl font-medium transition-colors"
          >
            <Trash2 className="w-4 h-4" /> Delete App
          </button>
        </div>

      </main>
    </div>
  );
};

export default EditApp;
