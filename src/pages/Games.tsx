import React, { useState, useEffect } from 'react';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import { AppItem, DeviceType, Category } from '../types';
import PageHeader from '../components/PageHeader';
import FilterBar from '../components/FilterBar';
import { IconGridCard, FeaturedAppCard } from '../components/AppCards';
import { Gamepad2 } from 'lucide-react';

const Games: React.FC = () => {
  const [apps, setApps] = useState<AppItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [device, setDevice] = useState<DeviceType | 'All'>('All');
  const [category, setCategory] = useState<Category | 'All'>('All');

  useEffect(() => {
    const fetchApps = async () => {
      setLoading(true);
      setError(null);
      if (!db) {
        setLoading(false);
        return;
      }
      try {
        const q = query(
          collection(db, 'apps'), 
          where('appType', '==', 'Game'),
          limit(50)
        );
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AppItem));
        data.sort((a, b) => b.createdAt - a.createdAt);
        setApps(data);
      } catch (error: any) {
        console.error("Error fetching games: ", error);
        if (error.code === 'permission-denied') {
          setError('Missing Firestore permissions. Please update your Firebase security rules to allow read access.');
        } else {
          setError('Failed to load games. Please try again later.');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchApps();
  }, []);

  const filteredApps = apps.filter(app => {
    if (device !== 'All' && !app.supportedDevices.includes(device)) return false;
    if (category !== 'All' && app.category !== category) return false;
    return true;
  });

  return (
    <div className="flex flex-col min-h-full">
      <PageHeader title="Games" />
      <FilterBar 
        selectedDevice={device} 
        onDeviceChange={setDevice}
        selectedCategory={category}
        onCategoryChange={setCategory}
      />

      <main className="flex-1 p-4 lg:p-8 max-w-7xl mx-auto w-full">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-red-50 dark:bg-red-900/20 rounded-3xl border border-red-100 dark:border-red-800">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/40 rounded-full flex items-center justify-center mb-4">
              <span className="text-2xl">⚠️</span>
            </div>
            <h3 className="text-xl font-bold text-red-700 dark:text-red-400 mb-2">Error Loading Data</h3>
            <p className="text-red-600 dark:text-red-300 max-w-md">
              {error}
            </p>
          </div>
        ) : filteredApps.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 px-4 text-center">
            <div className="w-32 h-32 bg-indigo-50 dark:bg-indigo-900/20 rounded-full flex items-center justify-center mb-6">
              <Gamepad2 className="w-16 h-16 text-indigo-300 dark:text-indigo-700" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">No games found.</h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-md">
              There are currently no games matching your criteria.
            </p>
          </div>
        ) : (
          <div className="space-y-12 pb-10">
            <section>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-8 gap-4 sm:gap-6">
                {filteredApps.slice(0, 16).map(app => (
                  <IconGridCard key={`icon-${app.id}`} app={app} />
                ))}
              </div>
            </section>

            {filteredApps.length > 0 && (
              <section>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredApps.map(app => (
                    <FeaturedAppCard key={`featured-${app.id}`} app={app} />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default Games;
