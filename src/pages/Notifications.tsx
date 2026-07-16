import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Notifications: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  // Fake state for notifications
  const [notifications, setNotifications] = useState<any[]>([]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-20">
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 py-3 flex items-center">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 mr-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <span className="font-bold text-lg text-slate-900 dark:text-white">Notifications</span>
      </header>

      <main className="max-w-2xl mx-auto p-4">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
              <Bell className="w-10 h-10 text-slate-400" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">You're all caught up!</h2>
            <p className="text-slate-500 text-sm">No new notifications right now.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* List notifications here */}
          </div>
        )}
      </main>
    </div>
  );
};

export default Notifications;
