import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import { Compass, Mail, Lock, User as UserIcon, AlertCircle } from 'lucide-react';
import { getAuthErrorMessage } from '../firebase/authErrors';

const Register: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) {
      setError('Firebase কনফিগারেশন পাওয়া যায়নি। দয়া করে src/firebase/config.ts চেক করুন।');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const result = await createUserWithEmailAndPassword(auth, email.trim(), password);
      
      // Create user profile
      if (db) {
        try {
          const userRef = doc(db, 'users', result.user.uid);
          await setDoc(userRef, {
            uid: result.user.uid,
            displayName: name.trim() || 'User',
            email: result.user.email,
            photoURL: '',
            joinDate: new Date().toISOString(),
            lastLogin: new Date().toISOString(),
            totalApps: 0,
            totalGames: 0,
            totalDownloads: 0,
            totalRatingsReceived: 0,
            savedApps: [],
            bookmarks: [],
            role: 'Standard User',
            isVerifiedPublisher: false
          });
        } catch (docErr) {
          console.warn("Could not write user profile doc:", docErr);
        }
      }

      navigate('/');
    } catch (err: any) {
      console.error("Register error:", err);
      setError(getAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <img 
            src="/logo-icon.png" 
            alt="NexAppo Logo" 
            className="w-20 h-20 object-contain dark:bg-white dark:p-2 dark:rounded-2xl mix-blend-multiply dark:mix-blend-normal"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
              const fallback = document.getElementById('fallback-register-logo');
              if (fallback) fallback.style.display = 'flex';
            }}
          />
          <div id="fallback-register-logo" className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-500/30 hidden">
            <Compass className="w-10 h-10" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900 dark:text-white">
          Create an account
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-slate-800 py-8 px-4 shadow-xl sm:rounded-3xl sm:px-10 border border-slate-100 dark:border-slate-700/50">
          
          {error && (
            <div className="mb-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 rounded-md flex gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
              <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleRegister}>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Display Name
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserIcon className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="appearance-none block w-full pl-10 px-3 py-2.5 border border-slate-300 dark:border-slate-600 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white transition-colors"
                  placeholder="John Doe"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Email address
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full pl-10 px-3 py-2.5 border border-slate-300 dark:border-slate-600 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white transition-colors"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Password
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full pl-10 px-3 py-2.5 border border-slate-300 dark:border-slate-600 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white transition-colors"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-all active:scale-[0.98]"
              >
                {loading ? 'Creating account...' : 'Register'}
              </button>
            </div>
          </form>

          <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
