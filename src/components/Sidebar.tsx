import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Grid, Gamepad2, User, Settings, Compass, Bookmark, DownloadCloud, Search } from 'lucide-react';

const Sidebar: React.FC = () => {
  const navItems = [
    { name: 'Home', path: '/', icon: <Home className="w-5 h-5" /> },
    { name: 'Search', path: '/search', icon: <Search className="w-5 h-5" /> },
    { name: 'Apps', path: '/apps', icon: <Grid className="w-5 h-5" /> },
    { name: 'Games', path: '/games', icon: <Gamepad2 className="w-5 h-5" /> },
    { name: 'Bookmarks', path: '/bookmarks', icon: <Bookmark className="w-5 h-5" /> },
    { name: 'Downloads', path: '/downloads', icon: <DownloadCloud className="w-5 h-5" /> },
    { name: 'Profile', path: '/profile', icon: <User className="w-5 h-5" /> },
    { name: 'Settings', path: '/settings', icon: <Settings className="w-5 h-5" /> },
  ];

  return (
    <aside className="h-full bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 flex flex-col p-4 shadow-sm z-40 relative">
      <div className="flex items-center gap-3 px-4 py-6 mb-4">
        <img 
          src="/logo-with-name.png" 
          alt="NexAppo" 
          className="h-10 w-auto object-contain dark:bg-white dark:p-1 dark:rounded-md mix-blend-multiply dark:mix-blend-normal" 
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
            const fallback = document.getElementById('fallback-sidebar-logo');
            if (fallback) fallback.style.display = 'flex';
          }}
        />
        <div id="fallback-sidebar-logo" className="items-center gap-3 hidden">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
            <Compass className="w-6 h-6" />
          </div>
          <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600">
            NexAppo
          </span>
        </div>
      </div>

      <nav className="flex-1 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-4 px-4 py-3 rounded-2xl font-medium transition-all duration-200 group ${
                isActive
                  ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900/50 hover:text-slate-900 dark:hover:text-slate-100'
              }`
            }
          >
            {item.icon}
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>
      
      <div className="p-4 mt-auto">
        <div className="text-xs text-slate-400 dark:text-slate-500 text-center">
          &copy; {new Date().getFullYear()} NexAppo
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
