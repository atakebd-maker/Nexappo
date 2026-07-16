import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';
import { AppItem } from '../types';
import { Settings, Edit2, Plus, Grid, Gamepad2, AlertCircle } from 'lucide-react';

const Profile: React.FC = () => {
  const { userProfile, currentUser } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'Apps' | 'Games'>('Apps');
  const [myApps, setMyApps] = useState<AppItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyApps = async () => {
      if (!db || !currentUser) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const q = query(
          collection(db, 'apps'),
          where('publisherId', '==', currentUser.uid)
        );
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AppItem));
        setMyApps(data);
      } catch (error) {
        console.error("Error fetching my apps:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMyApps();
  }, [currentUser]);

  if (!userProfile) {
    return (
      <div className="flex justify-center items-center h-full py-20">
        <div className="text-slate-500">Profile not found.</div>
      </div>
    );
  }

  const displayedContent = myApps.filter(app => app.appType === (activeTab === 'Apps' ? 'App' : 'Game'));

  return (
    <div className="flex flex-col min-h-full pb-20">
      {/* Profile Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-4xl mx-auto px-4 lg:px-8 py-8 md:py-12 relative">
          <div className="absolute top-4 right-4 flex gap-3">
            <button 
              onClick={() => navigate('/edit-profile')}
              className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              title="Edit Profile"
            >
              <Edit2 className="w-5 h-5" />
            </button>
            <button 
              onClick={() => navigate('/settings')}
              className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              title="Settings"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="w-24 h-24 md:w-32 md:h-32 bg-indigo-100 dark:bg-indigo-900/30 rounded-full overflow-hidden flex items-center justify-center border-4 border-white dark:border-slate-900 shadow-lg shrink-0">
              {userProfile.photoURL ? (
                <img src={userProfile.photoURL} alt={userProfile.displayName} className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl md:text-4xl font-bold text-indigo-600 dark:text-indigo-400">
                  {userProfile.displayName.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            
            <div className="text-center md:text-left flex-1">
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white flex items-center justify-center md:justify-start gap-2">
                {userProfile.displayName}
                {userProfile.isVerifiedPublisher && (
                  <span className="bg-blue-500 text-white text-[10px] px-1.5 py-0.5 rounded-full uppercase font-bold tracking-wider">Verified</span>
                )}
              </h1>
              <p className="text-slate-500 dark:text-slate-400 mt-1">{userProfile.email}</p>
              
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-4 text-sm">
                <div className="text-slate-600 dark:text-slate-300">
                  <span className="font-bold text-slate-900 dark:text-white mr-1">{myApps.filter(a => a.appType === 'App').length}</span> Apps
                </div>
                <div className="text-slate-600 dark:text-slate-300">
                  <span className="font-bold text-slate-900 dark:text-white mr-1">{myApps.filter(a => a.appType === 'Game').length}</span> Games
                </div>
                <div className="text-slate-600 dark:text-slate-300">
                  <span className="font-bold text-slate-900 dark:text-white mr-1">
                    {myApps.reduce((acc, app) => acc + app.downloadCount, 0)}
                  </span> Downloads
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 lg:px-8 py-8">
        
        {/* Upload Action */}
        <div className="mb-8">
          <button 
            onClick={() => navigate('/upload')}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-lg shadow-indigo-600/30 transition-all active:scale-[0.98]"
          >
            <Plus className="w-6 h-6" />
            Upload New App or Game
          </button>
        </div>

        {/* Content Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 mb-6">
          <button
            onClick={() => setActiveTab('Apps')}
            className={`flex items-center gap-2 pb-4 px-6 text-sm font-semibold transition-colors border-b-2 ${
              activeTab === 'Apps' 
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' 
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <Grid className="w-5 h-5" />
            My Apps
          </button>
          <button
            onClick={() => setActiveTab('Games')}
            className={`flex items-center gap-2 pb-4 px-6 text-sm font-semibold transition-colors border-b-2 ${
              activeTab === 'Games' 
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' 
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <Gamepad2 className="w-5 h-5" />
            My Games
          </button>
        </div>

        {/* Content List */}
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
          </div>
        ) : displayedContent.length === 0 ? (
          <div className="flex flex-col items-center py-20 text-center bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-800">
            <AlertCircle className="w-12 h-12 text-slate-400 dark:text-slate-500 mb-4" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">No {activeTab.toLowerCase()} uploaded yet.</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm max-w-sm">
              You haven't published any {activeTab.toLowerCase()} to NexAppo. Click the upload button above to get started.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {displayedContent.map(app => (
              <div 
                key={app.id} 
                className="flex items-center gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm"
              >
                <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0">
                  <img src={app.logoURL} alt={app.appName} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 truncate">{app.appName}</h3>
                  <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-1">
                    <span>⭐ {app.averageRating.toFixed(1)}</span>
                    <span>{app.downloadCount} dl</span>
                    <span>{app.apkSize} MB</span>
                  </div>
                </div>
                <button 
                  onClick={() => navigate(`/edit-app/${app.id}`)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-indigo-600 dark:text-indigo-400 text-sm font-semibold rounded-xl transition-colors shrink-0"
                >
                  Edit
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Profile;
