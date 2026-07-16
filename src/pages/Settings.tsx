import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { doc, deleteDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';
import { ArrowLeft, LogOut, Trash2, Moon, Sun, Monitor, Shield, User, Bell } from 'lucide-react';

const Settings: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [theme, setTheme] = useState<'Light' | 'Dark' | 'System'>('System');

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to log out?')) {
      if (auth) {
        await signOut(auth);
      }
      navigate('/login');
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('WARNING: This will permanently delete your account and all your data. Are you sure?')) {
      if (currentUser && db) {
        try {
          await deleteDoc(doc(db, 'users', currentUser.uid));
          await currentUser.delete();
          navigate('/login');
        } catch (error) {
          alert('Failed to delete account. You may need to sign in again to perform this action.');
        }
      }
    }
  };

  const toggleTheme = () => {
    if (theme === 'System') setTheme('Dark');
    else if (theme === 'Dark') setTheme('Light');
    else setTheme('System');
    // Implement actual theme switching logic if needed, 
    // Tailwind's dark class needs to be toggled on document element.
    if (theme === 'System') document.documentElement.classList.add('dark');
    else if (theme === 'Dark') document.documentElement.classList.remove('dark');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-20">
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 py-3 flex items-center">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 mr-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <span className="font-bold text-lg text-slate-900 dark:text-white">Settings</span>
      </header>

      <main className="max-w-2xl mx-auto p-4 md:p-8 space-y-6">
        
        {/* Account Settings */}
        <section className="bg-white dark:bg-slate-800 rounded-3xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-700">
          <div className="p-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
            <h2 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <User className="w-5 h-5 text-indigo-500" /> Account
            </h2>
          </div>
          <div className="p-2">
            <button onClick={() => navigate('/edit-profile')} className="w-full flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-2xl transition-colors text-left">
              <span className="font-medium text-slate-700 dark:text-slate-300">Edit Profile</span>
            </button>
            <button className="w-full flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-2xl transition-colors text-left">
              <span className="font-medium text-slate-700 dark:text-slate-300">Change Password</span>
            </button>
          </div>
        </section>

        {/* Preferences */}
        <section className="bg-white dark:bg-slate-800 rounded-3xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-700">
          <div className="p-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
            <h2 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Shield className="w-5 h-5 text-indigo-500" /> Preferences
            </h2>
          </div>
          <div className="p-2">
            <button onClick={toggleTheme} className="w-full flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-2xl transition-colors text-left">
              <span className="font-medium text-slate-700 dark:text-slate-300">Theme</span>
              <div className="flex items-center gap-2 text-slate-500">
                {theme === 'System' && <Monitor className="w-4 h-4" />}
                {theme === 'Dark' && <Moon className="w-4 h-4" />}
                {theme === 'Light' && <Sun className="w-4 h-4" />}
                <span className="text-sm">{theme}</span>
              </div>
            </button>
            <button className="w-full flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-2xl transition-colors text-left">
              <span className="font-medium text-slate-700 dark:text-slate-300">Notifications</span>
              <Bell className="w-4 h-4 text-slate-500" />
            </button>
          </div>
        </section>

        {/* Danger Zone */}
        <section className="bg-white dark:bg-slate-800 rounded-3xl overflow-hidden shadow-sm border border-rose-100 dark:border-rose-900/30">
          <div className="p-4 border-b border-rose-100 dark:border-rose-900/30 bg-rose-50 dark:bg-rose-900/10">
            <h2 className="font-bold text-rose-600 dark:text-rose-400 flex items-center gap-2">
               Danger Zone
            </h2>
          </div>
          <div className="p-2 space-y-2">
            <button onClick={handleLogout} className="w-full flex items-center gap-3 p-4 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-2xl transition-colors text-left text-rose-600 dark:text-rose-400 font-medium">
              <LogOut className="w-5 h-5" /> Log Out
            </button>
            <button onClick={handleDeleteAccount} className="w-full flex items-center gap-3 p-4 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-2xl transition-colors text-left text-rose-600 dark:text-rose-400 font-medium">
              <Trash2 className="w-5 h-5" /> Delete Account
            </button>
          </div>
        </section>

      </main>
    </div>
  );
};

export default Settings;
