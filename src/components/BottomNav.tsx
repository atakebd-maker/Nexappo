import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Grid, Gamepad2, User } from 'lucide-react';

const BottomNav: React.FC = () => {
  const navItems = [
    { name: 'Home', path: '/', icon: <Home className="w-6 h-6" /> },
    { name: 'Apps', path: '/apps', icon: <Grid className="w-6 h-6" /> },
    { name: 'Games', path: '/games', icon: <Gamepad2 className="w-6 h-6" /> },
    { name: 'Profile', path: '/profile', icon: <User className="w-6 h-6" /> },
  ];

  return (
    <nav className="bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 pb-safe">
      <div className="flex justify-around items-center px-2 py-3">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 transition-colors duration-200 ${
                isActive
                  ? 'text-indigo-600 dark:text-indigo-400'
                  : 'text-slate-500 dark:text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'
              }`
            }
          >
            {item.icon}
            <span className="text-[10px] font-medium">{item.name}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;
