import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';
import { ArrowLeft, User as UserIcon, Save, Image as ImageIcon } from 'lucide-react';

const EditProfile: React.FC = () => {
  const { currentUser, userProfile, refreshProfile } = useAuth();
  const navigate = useNavigate();

  const [displayName, setDisplayName] = useState(userProfile?.displayName || '');
  const [bio, setBio] = useState(userProfile?.bio || '');
  const [website, setWebsite] = useState(userProfile?.website || '');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState(userProfile?.photoURL || '');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    if (!currentUser || !db) return;
    setLoading(true);
    setError('');
    
    try {
      let photoURL = userProfile?.photoURL || '';

      if (avatarFile && storage) {
        const storageRef = ref(storage, `avatars/${currentUser.uid}_${avatarFile.name}`);
        const uploadTask = uploadBytesResumable(storageRef, avatarFile);
        await new Promise((resolve, reject) => {
          uploadTask.on('state_changed', null, reject, resolve);
        });
        photoURL = await getDownloadURL(uploadTask.snapshot.ref);
      }

      await updateDoc(doc(db, 'users', currentUser.uid), {
        displayName,
        bio,
        website,
        photoURL
      });

      await refreshProfile();
      navigate('/profile');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-20">
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 mr-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <span className="font-bold text-lg text-slate-900 dark:text-white">Edit Profile</span>
        </div>
        <button 
          onClick={handleSave} 
          disabled={loading || !displayName}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-4 py-1.5 rounded-full font-semibold transition-colors"
        >
          {loading ? 'Saving...' : <><Save className="w-4 h-4" /> Save</>}
        </button>
      </header>

      <main className="max-w-2xl mx-auto p-4 md:p-8 space-y-6">
        
        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-xl text-sm">{error}</div>
        )}

        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
          
          <div className="flex flex-col items-center mb-8">
            <div className="w-32 h-32 rounded-full bg-slate-100 dark:bg-slate-900 border-4 border-slate-200 dark:border-slate-700 flex items-center justify-center overflow-hidden relative group">
              {avatarPreview ? (
                <img src={avatarPreview} alt="Avatar Preview" className="w-full h-full object-cover" />
              ) : (
                <UserIcon className="w-12 h-12 text-slate-400" />
              )}
              <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white">
                <ImageIcon className="w-6 h-6 mb-1" />
                <span className="text-xs font-semibold">Change</span>
              </div>
              <input type="file" accept="image/png, image/jpeg" onChange={handleAvatarChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
            </div>
            <p className="text-sm text-slate-500 mt-2">Tap to change avatar</p>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Display Name *</label>
              <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 dark:text-white" />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Bio</label>
              <textarea value={bio} onChange={(e) => setBio(e.target.value)} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 dark:text-white h-24 resize-none" placeholder="Tell us about yourself..." />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Website</label>
              <input type="url" value={website} onChange={(e) => setWebsite(e.target.value)} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 dark:text-white" placeholder="https://yourwebsite.com" />
            </div>
          </div>

        </div>

      </main>
    </div>
  );
};

export default EditProfile;
