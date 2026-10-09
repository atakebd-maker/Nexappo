import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import { AppItem, UserProfile } from '../types';
import { ArrowLeft, Grid, Gamepad2, UserPlus, PackageOpen } from 'lucide-react';
import { FeaturedAppCard } from '../components/AppCards';

const PublisherProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>(); // This is publisherId
  const navigate = useNavigate();
  
  const [publisher, setPublisher] = useState<UserProfile | null>(null);
  const [publisherApps, setPublisherApps] = useState<AppItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'Apps' | 'Games'>('Apps');

  useEffect(() => {
    const fetchPublisherAndApps = async () => {
      if (!id || !db) return;
      setLoading(true);
      try {
        const pubRef = doc(db, 'users', id);
        const pubSnap = await getDoc(pubRef);
        if (pubSnap.exists()) {
          setPublisher(pubSnap.data() as UserProfile);
        }

        const q = query(collection(db, 'apps'), where('publisherId', '==', id));
        const appsSnap = await getDocs(q);
        const appsData = appsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as AppItem));
        setPublisherApps(appsData);

        if (!pubSnap.exists() && appsData.length > 0) {
          const firstApp = appsData[0];
          setPublisher({
            uid: id,
            displayName: firstApp.publisherName || 'Unknown Publisher',
            email: '',
            photoURL: firstApp.publisherAvatar || '',
            joinDate: new Date().toISOString(),
            lastLogin: new Date().toISOString(),
            totalApps: appsData.filter(a => a.appType === 'App').length,
            totalGames: appsData.filter(a => a.appType === 'Game').length,
            totalDownloads: appsData.reduce((sum, app) => sum + (app.downloadCount || 0), 0),
            totalRatingsReceived: 0,
            savedApps: [],
            bookmarks: [],
            role: 'Standard User',
            isVerifiedPublisher: false
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPublisherAndApps();
  }, [id]);

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (!publisher) return <div className="p-8 text-center text-red-500">Publisher not found.</div>;

  const displayedContent = publisherApps.filter(app => app.appType === (activeTab === 'Apps' ? 'App' : 'Game'));
  const totalDownloads = publisherApps.reduce((sum, app) => sum + app.downloadCount, 0);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 pt-safe py-3 flex items-center">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 mr-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <span className="font-bold text-lg text-slate-900 dark:text-white">Publisher</span>
      </header>

      <main className="max-w-4xl mx-auto">
        {/* Profile Header */}
        <div className="px-4 py-8 md:px-8 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="w-24 h-24 md:w-32 md:h-32 bg-indigo-100 dark:bg-indigo-900/30 rounded-full overflow-hidden flex items-center justify-center shadow-md shrink-0">
              {publisher.photoURL ? (
                <img src={publisher.photoURL} alt={publisher.displayName} className="w-full h-full object-cover" />
              ) : (
                <span className="text-4xl font-bold text-indigo-600 dark:text-indigo-400">
                  {(publisher.displayName || 'U').charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            
            <div className="text-center md:text-left flex-1">
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white flex items-center justify-center md:justify-start gap-2">
                {publisher.displayName}
                {publisher.isVerifiedPublisher && (
                  <span className="bg-blue-500 text-white text-[10px] px-1.5 py-0.5 rounded-full uppercase font-bold tracking-wider">Verified</span>
                )}
              </h1>
              {publisher.bio && <p className="text-slate-600 dark:text-slate-300 mt-2 text-sm max-w-md">{publisher.bio}</p>}
              
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-4 text-sm bg-slate-50 dark:bg-slate-800 inline-flex p-3 rounded-2xl">
                <div className="text-slate-500 text-center">
                  <div className="font-bold text-slate-900 dark:text-white text-lg">{publisherApps.filter(a => a.appType === 'App').length}</div>
                  Apps
                </div>
                <div className="w-px h-8 bg-slate-200 dark:bg-slate-700"></div>
                <div className="text-slate-500 text-center">
                  <div className="font-bold text-slate-900 dark:text-white text-lg">{publisherApps.filter(a => a.appType === 'Game').length}</div>
                  Games
                </div>
                <div className="w-px h-8 bg-slate-200 dark:bg-slate-700"></div>
                <div className="text-slate-500 text-center">
                  <div className="font-bold text-slate-900 dark:text-white text-lg">{totalDownloads}</div>
                  Downloads
                </div>
              </div>
            </div>

            <button className="flex items-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-3 rounded-full font-bold shadow-lg transition-transform active:scale-95 shrink-0 mt-4 md:mt-0">
              <UserPlus className="w-5 h-5" /> Follow
            </button>
          </div>
        </div>

        {/* Content Tabs */}
        <div className="px-4 md:px-8 mt-6">
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
              Apps
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
              Games
            </button>
          </div>

          {/* Content List */}
          {displayedContent.length === 0 ? (
            <div className="flex flex-col items-center py-20 text-center">
              <PackageOpen className="w-16 h-16 text-slate-300 dark:text-slate-600 mb-4" />
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">No {activeTab.toLowerCase()} found.</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                This publisher hasn't uploaded any {activeTab.toLowerCase()} yet.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {displayedContent.map(app => (
                <FeaturedAppCard key={app.id} app={app} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default PublisherProfile;
