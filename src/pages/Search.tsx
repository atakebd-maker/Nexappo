import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import { AppItem } from '../types';
import { Search as SearchIcon, ArrowLeft, X } from 'lucide-react';
import { FeaturedAppCard } from '../components/AppCards';

const Search: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [allApps, setAllApps] = useState<AppItem[]>([]);
  const [results, setResults] = useState<AppItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchAllApps = async () => {
      if (!db) return;
      try {
        const q = query(collection(db, 'apps'));
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AppItem));
        setAllApps(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchAllApps();
  }, []);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setResults([]);
      return;
    }
    
    setLoading(true);
    const delay = setTimeout(() => {
      const lowerQuery = searchTerm.toLowerCase();
      const filtered = allApps.filter(app => 
        app.appName.toLowerCase().includes(lowerQuery) || 
        app.publisherName.toLowerCase().includes(lowerQuery) ||
        app.category.toLowerCase().includes(lowerQuery)
      );
      setResults(filtered);
      setLoading(false);
    }, 300);

    return () => clearTimeout(delay);
  }, [searchTerm, allApps]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-20">
      <header className="sticky top-0 z-30 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-3">
        <div className="flex items-center gap-3 max-w-4xl mx-auto">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300">
            <ArrowLeft className="w-6 h-6" />
          </button>
          
          <div className="flex-1 flex items-center bg-slate-100 dark:bg-slate-800 rounded-full px-4 py-2 relative">
            <SearchIcon className="w-5 h-5 text-slate-400 shrink-0" />
            <input 
              autoFocus
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search apps, games, publishers..." 
              className="w-full bg-transparent border-none outline-none px-3 text-slate-900 dark:text-white placeholder-slate-400"
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4">
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
          </div>
        ) : results.length > 0 ? (
          <div className="space-y-4">
            <h3 className="font-semibold text-slate-500 mb-4">Results for "{searchTerm}"</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {results.map(app => (
                <FeaturedAppCard key={app.id} app={app} />
              ))}
            </div>
          </div>
        ) : searchTerm ? (
          <div className="text-center py-20 text-slate-500">
            <p>No results found for "{searchTerm}"</p>
          </div>
        ) : (
          <div className="py-8">
            <h3 className="font-semibold text-slate-500 mb-4">Suggested Categories</h3>
            <div className="flex flex-wrap gap-2">
              {['Action', 'Tools', 'Productivity', 'Arcade', 'Social'].map(cat => (
                <button 
                  key={cat} 
                  onClick={() => setSearchTerm(cat)}
                  className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Search;
