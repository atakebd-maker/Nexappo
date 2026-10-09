import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';
import { DownloadRecord } from '../types';
import { ArrowLeft, Download as DownloadIcon, Clock } from 'lucide-react';

const DownloadHistory: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [history, setHistory] = useState<DownloadRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!currentUser || !db) return;
      setLoading(true);
      try {
        const q = query(
          collection(db, 'downloads'), 
          where('userId', '==', currentUser.uid),
          orderBy('downloadDate', 'desc')
        );
        const snap = await getDocs(q);
        const historyData = snap.docs.map(d => ({ id: d.id, ...d.data() } as DownloadRecord));
        setHistory(historyData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [currentUser]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 pt-safe py-3 flex items-center justify-between">
        <div className="flex items-center">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 mr-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <span className="font-bold text-lg text-slate-900 dark:text-white">Download History</span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto p-4 md:p-8">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
          </div>
        ) : history.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
              <DownloadIcon className="w-10 h-10 text-slate-400" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No downloads yet</h2>
            <p className="text-slate-500 text-sm">Apps you download will appear here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {history.map(record => (
              <div 
                key={record.id} 
                onClick={() => navigate(`/app/${record.appId}`)}
                className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 cursor-pointer hover:shadow-md transition-shadow"
              >
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-slate-100">{record.appName}</h3>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                    <span>v{record.appVersion}</span>
                    <span>•</span>
                    <span>{record.apkSize} MB</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Clock className="w-3 h-3" />
                  {new Date(record.downloadDate).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default DownloadHistory;
