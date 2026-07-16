import React from 'react';
import { Search, Bell, Compass } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PageHeaderProps {
  title?: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title }) => {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 py-4 lg:px-8">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-3 lg:hidden">
          <img 
            src="/logo-with-name.png" 
            alt="NexAppo" 
            className="h-8 w-auto object-contain dark:bg-white dark:p-1 dark:rounded-md mix-blend-multiply dark:mix-blend-normal" 
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
              const fallback = document.getElementById('fallback-header-logo');
              if (fallback) fallback.style.display = 'flex';
            }}
          />
          <div id="fallback-header-logo" className="items-center gap-3 hidden">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
              <Compass className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600">
              {title || 'NexAppo'}
            </span>
          </div>
        </div>
        
        <div className="hidden lg:block">
          {title && <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{title}</h1>}
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/search')}
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors"
          >
            <Search className="w-6 h-6" />
          </button>
          <button 
            onClick={() => navigate('/notifications')}
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors relative"
          >
            <Bell className="w-6 h-6" />
            <span className="absolute top-1.5 right-2 w-2 h-2 bg-rose-500 rounded-full border border-white dark:border-slate-900"></span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default PageHeader;
