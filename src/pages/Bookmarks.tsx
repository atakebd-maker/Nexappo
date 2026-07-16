import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';
import { AppItem, Bookmark } from '../types';
import { ArrowLeft, Bookmark as BookmarkIcon, Trash2 } from 'lucide-react';

const Bookmarks: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [apps, setApps] = useState<AppItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookmarks = async () => {
      if (!currentUser || !db) return;
      setLoading(true);
      try {
        const q = query(collection(db, 'bookmarks'), where('userId', '==', currentUser.uid));
        const snap = await getDocs(q);
        const bmData = snap.docs.map(d => ({ id: d.id, ...d.data() } as Bookmark));
        setBookmarks(bmData);

        if (bmData.length > 0) {
          const appIds = bmData.map(b => b.appId);
          // Due to firestore 'in' limits (max 10), we might need to chunk this or fetch individually
          // For simplicity, fetching all apps and filtering locally
          const appsQ = query(collection(db, 'apps'));
          const appsSnap = await getDocs(appsQ);
          const allApps = appsSnap.docs.map(d => ({ id: d.id, ...d.data() } as AppItem));
          setApps(allApps.filter(app => appIds.includes(app.id)));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchBookmarks();
  }, [currentUser]);

  const removeBookmark = async (bookmarkId: string) => {
    if (!db) return;
    try {
      await deleteDoc(doc(db, 'bookmarks', bookmarkId));
      setBookmarks(prev => prev.filter(b => b.id !== bookmarkId));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-20">
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 py-3 flex items-center">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 mr-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <span className="font-bold text-lg text-slate-900 dark:text-white">Bookmarks</span>
      </header>

      <main className="max-w-4xl mx-auto p-4 md:p-8">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
          </div>
        ) : bookmarks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
              <BookmarkIcon className="w-10 h-10 text-slate-400" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No bookmarks yet</h2>
            <p className="text-slate-500 text-sm max-w-md">Save apps you want to download later.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {bookmarks.map(bm => {
              const app = apps.find(a => a.id === bm.appId);
              if (!app) return null;
              return (
                <div key={bm.id} className="flex items-center gap-4 p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate(`/app/${app.id}`)}>
                  <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0">
                    <img src={app.logoURL} alt={app.appName} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-900 dark:text-slate-100 truncate">{app.appName}</h3>
                    <p className="text-xs text-slate-500 truncate">{app.publisherName}</p>
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); removeBookmark(bm.id); }}
                    className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-full transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default Bookmarks;
