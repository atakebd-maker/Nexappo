import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';
import { DeviceType, Category, AppType } from '../types';
import { ArrowLeft, Upload, CheckCircle2, Image as ImageIcon, FileBox, AlertCircle, Plus } from 'lucide-react';

const devices: DeviceType[] = ['Android Phone', 'Tablet', 'Android TV', 'Wear OS', 'Chromebook'];
const categories: Category[] = ['Tools', 'Productivity', 'Social', 'Photography', 'Music', 'Video', 'Education', 'Business', 'Finance', 'Health', 'Lifestyle', 'Shopping', 'Communication', 'Entertainment', 'Action', 'Adventure', 'Arcade', 'Puzzle', 'Racing', 'Sports', 'Strategy', 'Simulation', 'Casual', 'Role Playing'];

const UploadApp: React.FC = () => {
  const { currentUser, userProfile, refreshProfile } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);

  // Form State
  const [appName, setAppName] = useState('');
  const [shortDesc, setShortDesc] = useState('');
  const [fullDesc, setFullDesc] = useState('');
  const [version, setVersion] = useState('');
  const [apkSize, setApkSize] = useState('');
  const [appType, setAppType] = useState<AppType>('App');
  const [selectedCategory, setSelectedCategory] = useState<Category>('Tools');
  const [selectedDevices, setSelectedDevices] = useState<DeviceType[]>(['Android Phone']);

  // Files
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [featureFile, setFeatureFile] = useState<File | null>(null);
  const [screenshots, setScreenshots] = useState<File[]>([]);
  const [apkFile, setApkFile] = useState<File | null>(null);

  // Previews
  const [logoPreview, setLogoPreview] = useState('');
  const [featurePreview, setFeaturePreview] = useState('');

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleFeatureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFeatureFile(file);
      setFeaturePreview(URL.createObjectURL(file));
    }
  };

  const handleScreenshotsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setScreenshots(prev => [...prev, ...filesArray]);
    }
  };

  const removeScreenshot = (index: number) => {
    setScreenshots(prev => prev.filter((_, i) => i !== index));
  };

  const handleApkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setApkFile(e.target.files[0]);
    }
  };

  const toggleDevice = (device: DeviceType) => {
    setSelectedDevices(prev => 
      prev.includes(device) ? prev.filter(d => d !== device) : [...prev, device]
    );
  };

  const uploadFile = async (file: File, path: string): Promise<string> => {
    if (!storage) throw new Error("Storage not configured");
    const storageRef = ref(storage, path);
    const uploadTask = uploadBytesResumable(storageRef, file);

    return new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          // Could track individual progress here
        },
        (error) => reject(error),
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(downloadURL);
        }
      );
    });
  };

  const handleSubmit = async () => {
    if (!currentUser || !userProfile || !db) {
      setError('You must be logged in to upload.');
      return;
    }
    if (!logoFile || !apkFile || !appName || !shortDesc || !fullDesc || !version || !apkSize) {
      setError('Please fill in all required fields and files.');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      // Fake progress for UI feedback since real progress can be complex with multiple files
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => (prev >= 90 ? 90 : prev + 5));
      }, 500);

      const timestamp = Date.now();
      const appId = `app_${timestamp}_${Math.random().toString(36).substr(2, 9)}`;

      // 1. Upload Logo
      const logoURL = await uploadFile(logoFile, `logos/${appId}_${logoFile.name}`);

      // 2. Upload Feature Image
      let featureImageURL = '';
      if (featureFile) {
        featureImageURL = await uploadFile(featureFile, `feature-images/${appId}_${featureFile.name}`);
      }

      // 3. Upload Screenshots
      const screenshotURLs: string[] = [];
      for (let i = 0; i < screenshots.length; i++) {
        const url = await uploadFile(screenshots[i], `screenshots/${appId}_${i}_${screenshots[i].name}`);
        screenshotURLs.push(url);
      }

      // 4. Upload APK
      const apkFileURL = await uploadFile(apkFile, `apks/${appId}_${apkFile.name}`);

      // 5. Create Firestore Document
      await setDoc(doc(db, 'apps', appId), {
        publisherId: currentUser.uid,
        publisherName: userProfile.displayName,
        publisherAvatar: userProfile.photoURL,
        appName,
        appType,
        category: selectedCategory,
        supportedDevices: selectedDevices.length > 0 ? selectedDevices : ['Android Phone'],
        shortDescription: shortDesc,
        fullDescription: fullDesc,
        version,
        apkSize: parseFloat(apkSize),
        logoURL,
        featureImageURL,
        screenshotURLs,
        apkFileURL,
        averageRating: 0,
        ratingCount: 0,
        downloadCount: 0,
        createdAt: timestamp,
        updatedAt: timestamp,
        status: 'Published'
      });

      // Update user total apps/games
      const userRef = doc(db, 'users', currentUser.uid);
      if (appType === 'App') {
        await setDoc(userRef, { totalApps: userProfile.totalApps + 1 }, { merge: true });
      } else {
        await setDoc(userRef, { totalGames: userProfile.totalGames + 1 }, { merge: true });
      }

      clearInterval(progressInterval);
      setUploadProgress(100);
      
      await refreshProfile();

      setTimeout(() => {
        navigate(`/app/${appId}`);
      }, 1000);

    } catch (err: any) {
      console.error(err);
      if (err.code === 'permission-denied') {
        setError('Missing Firestore permissions. Please update your Firebase security rules to allow write access to the apps and users collections.');
      } else {
        setError(err.message || 'Failed to upload app. Check Firebase config.');
      }
      setUploadProgress(0);
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    setError('');
    setStep(prev => prev + 1);
  };

  const prevStep = () => setStep(prev => prev - 1);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-20">
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 py-3 flex items-center">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 mr-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <span className="font-bold text-lg text-slate-900 dark:text-white">Upload Center</span>
      </header>

      <main className="max-w-3xl mx-auto p-4 md:p-8">
        
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-xs font-semibold text-slate-500 mb-2">
            <span>Step {step} of 4</span>
            <span>{Math.round((step / 4) * 100)}%</span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2">
            <div className="bg-indigo-600 h-2 rounded-full transition-all duration-300" style={{ width: `${(step / 4) * 100}%` }}></div>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 rounded-xl flex gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
            <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
          </div>
        )}

        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
          
          {/* STEP 1: Basic Info & Metadata */}
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">App Details</h2>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">App Name *</label>
                <input type="text" value={appName} onChange={(e) => setAppName(e.target.value)} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 dark:text-white" placeholder="My Awesome App" />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Short Description *</label>
                <input type="text" value={shortDesc} onChange={(e) => setShortDesc(e.target.value)} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 dark:text-white" placeholder="A brief catchphrase for your app" maxLength={80} />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Full Description *</label>
                <textarea value={fullDesc} onChange={(e) => setFullDesc(e.target.value)} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 dark:text-white h-32 resize-none" placeholder="Detailed description of features and usage..." />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Version *</label>
                  <input type="text" value={version} onChange={(e) => setVersion(e.target.value)} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 dark:text-white" placeholder="1.0.0" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">APK Size (MB) *</label>
                  <input type="number" step="0.1" value={apkSize} onChange={(e) => setApkSize(e.target.value)} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 dark:text-white" placeholder="25.5" />
                </div>
              </div>

              <button onClick={nextStep} disabled={!appName || !shortDesc || !fullDesc || !version || !apkSize} className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all disabled:opacity-50 mt-6">Next Step</button>
            </div>
          )}

          {/* STEP 2: Categorization */}
          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Categorization</h2>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Content Type *</label>
                <div className="flex gap-4">
                  <button onClick={() => setAppType('App')} className={`flex-1 py-3 rounded-xl border-2 font-semibold transition-all ${appType === 'App' ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}>App</button>
                  <button onClick={() => setAppType('Game')} className={`flex-1 py-3 rounded-xl border-2 font-semibold transition-all ${appType === 'Game' ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}>Game</button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Category *</label>
                <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value as Category)} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 dark:text-white">
                  {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Supported Devices *</label>
                <div className="flex flex-wrap gap-2">
                  {devices.map(device => (
                    <button key={device} onClick={() => toggleDevice(device)} className={`px-4 py-2 rounded-full text-sm font-medium border ${selectedDevices.includes(device) ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'}`}>
                      {device}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-4 mt-6">
                <button onClick={prevStep} className="flex-1 py-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold transition-all">Back</button>
                <button onClick={nextStep} disabled={selectedDevices.length === 0} className="flex-[2] py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all disabled:opacity-50">Next Step</button>
              </div>
            </div>
          )}

          {/* STEP 3: Media Upload */}
          {step === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Visual Assets</h2>
              
              {/* Logo */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">App Logo * (Square)</label>
                <div className="flex items-center gap-4">
                  <div className="w-24 h-24 rounded-2xl bg-slate-100 dark:bg-slate-900 border-2 border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center overflow-hidden relative group">
                    {logoPreview ? (
                      <img src={logoPreview} alt="Logo Preview" className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="w-8 h-8 text-slate-400" />
                    )}
                    <input type="file" accept="image/png, image/jpeg, image/webp" onChange={handleLogoChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                  </div>
                  <div className="text-sm text-slate-500">512x512px recommended. PNG or JPG.</div>
                </div>
              </div>

              {/* Feature Image */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Feature Banner (16:9)</label>
                <div className="w-full aspect-[21/9] rounded-2xl bg-slate-100 dark:bg-slate-900 border-2 border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center overflow-hidden relative group">
                  {featurePreview ? (
                    <img src={featurePreview} alt="Feature Preview" className="w-full h-full object-cover" />
                  ) : (
                    <>
                      <ImageIcon className="w-8 h-8 text-slate-400 mb-2" />
                      <span className="text-sm text-slate-500">Tap to upload feature image</span>
                    </>
                  )}
                  <input type="file" accept="image/png, image/jpeg, image/webp" onChange={handleFeatureChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                </div>
              </div>

              {/* Screenshots */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Screenshots</label>
                <div className="flex overflow-x-auto gap-4 pb-2 hide-scrollbar">
                  {screenshots.map((file, i) => (
                    <div key={i} className="w-24 h-40 shrink-0 rounded-xl bg-slate-100 relative overflow-hidden group border border-slate-200">
                      <img src={URL.createObjectURL(file)} alt="Screenshot" className="w-full h-full object-cover" />
                      <button onClick={() => removeScreenshot(i)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  <div className="w-24 h-40 shrink-0 rounded-xl bg-slate-50 dark:bg-slate-900 border-2 border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center relative">
                    <Plus className="w-6 h-6 text-slate-400 mb-1" />
                    <span className="text-xs text-slate-500">Add</span>
                    <input type="file" multiple accept="image/png, image/jpeg, image/webp" onChange={handleScreenshotsChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                  </div>
                </div>
              </div>

              <div className="flex gap-4 mt-6">
                <button onClick={prevStep} className="flex-1 py-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold transition-all">Back</button>
                <button onClick={nextStep} disabled={!logoFile} className="flex-[2] py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all disabled:opacity-50">Next Step</button>
              </div>
            </div>
          )}

          {/* STEP 4: APK Upload & Submit */}
          {step === 4 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Final Step: APK</h2>
              
              <div className="w-full border-2 border-dashed border-indigo-300 dark:border-indigo-700/50 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-3xl p-8 flex flex-col items-center justify-center relative min-h-[200px]">
                <FileBox className="w-16 h-16 text-indigo-400 mb-4" />
                <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-2">
                  {apkFile ? apkFile.name : 'Upload APK File *'}
                </h3>
                <p className="text-slate-500 text-sm text-center">
                  {apkFile ? `${(apkFile.size / (1024*1024)).toFixed(2)} MB` : 'Tap to select or drag and drop here.'}
                </p>
                <input type="file" accept=".apk" onChange={handleApkChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
              </div>

              {loading && (
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-4 overflow-hidden relative">
                  <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
                  <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white drop-shadow-md">
                    {uploadProgress}%
                  </div>
                </div>
              )}

              <div className="flex gap-4 mt-6">
                <button onClick={prevStep} disabled={loading} className="flex-1 py-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold transition-all disabled:opacity-50">Back</button>
                <button onClick={handleSubmit} disabled={loading || !apkFile} className="flex-[2] py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50 active:scale-[0.98] flex justify-center items-center gap-2">
                  {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <Upload className="w-5 h-5" />}
                  {loading ? 'Publishing...' : 'Publish App'}
                </button>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
};

export default UploadApp;
