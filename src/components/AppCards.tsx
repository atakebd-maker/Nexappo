import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AppItem } from '../types';

interface AppCardsProps {
  app: AppItem;
}

export const IconGridCard: React.FC<AppCardsProps> = ({ app }) => {
  const navigate = useNavigate();
  return (
    <div 
      onClick={() => navigate(`/app/${app.id}`)}
      className="flex flex-col items-center gap-2 group cursor-pointer"
    >
      <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-2xl overflow-hidden shadow-sm group-hover:shadow-md transition-all duration-300 transform group-hover:scale-105">
        <img src={app.logoURL} alt={app.appName} className="w-full h-full object-cover" loading="lazy" />
      </div>
      <span className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 text-center w-full truncate px-1">
        {app.appName}
      </span>
    </div>
  );
};

export const FeaturedAppCard: React.FC<AppCardsProps> = ({ app }) => {
  const navigate = useNavigate();
  return (
    <div 
      onClick={() => navigate(`/app/${app.id}`)}
      className="flex items-center gap-4 p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer group"
    >
      <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0">
        <img src={app.logoURL} alt={app.appName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-slate-900 dark:text-slate-100 truncate text-base">{app.appName}</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2">
          <span>⭐ {app.averageRating.toFixed(1)}</span>
          <span>•</span>
          <span>{(app.downloadCount / 1000).toFixed(1)}K</span>
        </p>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{app.apkSize} MB</p>
      </div>
      <button 
        onClick={(e) => { e.stopPropagation(); navigate(`/app/${app.id}`); }}
        className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-indigo-600 dark:text-indigo-400 text-sm font-semibold rounded-full transition-colors"
      >
        Install
      </button>
    </div>
  );
};

export const LargeFeatureCard: React.FC<AppCardsProps> = ({ app }) => {
  const navigate = useNavigate();
  return (
    <div 
      onClick={() => navigate(`/app/${app.id}`)}
      className="rounded-3xl overflow-hidden relative group cursor-pointer w-full max-w-[800px] shadow-sm hover:shadow-xl transition-all duration-500"
    >
      <div className="aspect-[16/9] w-full bg-slate-200 dark:bg-slate-800 overflow-hidden relative">
        <img src={app.featureImageURL} alt={app.appName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" loading="lazy" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 flex items-end justify-between">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-white/20 shadow-lg shrink-0">
            <img src={app.logoURL} alt={app.appName} className="w-full h-full object-cover" loading="lazy" />
          </div>
          <div>
            <h3 className="font-bold text-white text-xl md:text-2xl drop-shadow-md">{app.appName}</h3>
            <p className="text-sm text-slate-200 mt-1 drop-shadow flex items-center gap-3">
              <span>⭐ {app.averageRating.toFixed(1)}</span>
              <span>{(app.downloadCount / 1000).toFixed(1)}K</span>
              <span>{app.apkSize} MB</span>
            </p>
          </div>
        </div>
        <button 
          onClick={(e) => { e.stopPropagation(); navigate(`/app/${app.id}`); }}
          className="hidden sm:block px-6 py-2.5 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white font-semibold rounded-full transition-colors border border-white/20"
        >
          Install
        </button>
      </div>
    </div>
  );
};
