import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';
import PWAInstall from './PWAInstall';

const Layout: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-50 transition-colors duration-300">
      <div className="flex">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block w-64 fixed h-full">
          <Sidebar />
        </div>

        {/* Main Content */}
        <div className="flex-1 lg:ml-64 pb-20 lg:pb-0 min-h-screen relative">
          <Outlet />
        </div>

        {/* Mobile Bottom Navigation */}
        <div className="lg:hidden fixed bottom-0 w-full z-50">
          <BottomNav />
        </div>
      </div>
      <PWAInstall />
    </div>
  );
};

export default Layout;
