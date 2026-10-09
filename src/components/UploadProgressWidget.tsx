import React from 'react';
import { useUpload } from '../contexts/UploadContext';
import { X, CheckCircle2, AlertCircle, UploadCloud, PauseCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const UploadProgressWidget: React.FC = () => {
  const { activeUploads, removeUpload } = useUpload();
  const navigate = useNavigate();

  if (activeUploads.length === 0) return null;

  return (
    <div className="fixed right-4 z-[60] flex flex-col gap-3 pb-safe bottom-20 lg:bottom-6">
      {activeUploads.map((upload) => (
        <div key={upload.id} className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-4 w-80 animate-in slide-in-from-right-8 fade-in">
          <div className="flex justify-between items-start mb-3">
            <div className="flex items-center gap-2 overflow-hidden">
              {upload.status === 'uploading' && <UploadCloud className="w-5 h-5 text-indigo-500 animate-pulse shrink-0" />}
              {upload.status === 'completed' && <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />}
              {upload.status === 'error' && <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />}
              {upload.status === 'paused' && <PauseCircle className="w-5 h-5 text-amber-500 shrink-0" />}
              <span className="font-semibold text-slate-900 dark:text-white truncate">
                {upload.appName}
              </span>
            </div>
            <button onClick={() => removeUpload(upload.id)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 shrink-0">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="w-full bg-slate-100 dark:bg-slate-900 rounded-full h-2 mb-2 overflow-hidden">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${
                upload.status === 'completed' ? 'bg-green-500' : 
                upload.status === 'error' ? 'bg-red-500' :
                upload.status === 'paused' ? 'bg-amber-500' : 'bg-indigo-600'
              }`}
              style={{ width: `${upload.progress}%` }}
            ></div>
          </div>

          <div className="flex justify-between items-center text-xs">
            <span className={`font-medium ${
              upload.status === 'completed' ? 'text-green-600 dark:text-green-400' : 
              upload.status === 'error' ? 'text-red-600 dark:text-red-400' :
              upload.status === 'paused' ? 'text-amber-600 dark:text-amber-400' : 'text-slate-500'
            }`}>
              {upload.status === 'uploading' && 'Publishing in background...'}
              {upload.status === 'completed' && 'Published successfully!'}
              {upload.status === 'error' && 'Publishing failed.'}
              {upload.status === 'paused' && 'Paused (Waiting for connection)'}
            </span>
            <span className="text-slate-500 font-bold">{upload.progress}%</span>
          </div>
          
          {upload.status === 'completed' && upload.appId && (
             <button 
                onClick={() => navigate(`/app/${upload.appId}`)}
                className="mt-3 w-full py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 rounded-lg text-sm font-semibold transition-colors text-slate-900 dark:text-white"
              >
               View App
             </button>
          )}
        </div>
      ))}
    </div>
  );
};

export default UploadProgressWidget;
