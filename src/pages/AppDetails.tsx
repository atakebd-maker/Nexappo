import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, increment, collection, query, where, getDocs, addDoc, serverTimestamp, setDoc, deleteDoc } from 'firebase/firestore';
import { db, auth } from '../firebase/config';
import { AppItem, Review } from '../types';
import { ArrowLeft, Share2, Star, Download, ChevronRight, X, AlertCircle, Bookmark as BookmarkIcon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const AppDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser, userProfile } = useAuth();
  
  const [app, setApp] = useState<AppItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeScreenshot, setActiveScreenshot] = useState<string | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [userRating, setUserRating] = useState<number>(0);
  const [userReviewText, setUserReviewText] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [error, setError] = useState('');
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [bookmarkId, setBookmarkId] = useState<string | null>(null);

  useEffect(() => {
    const fetchAppAndReviews = async () => {
      if (!id || !db) return;
      setLoading(true);
      try {
        const appRef = doc(db, 'apps', id);
        const appSnap = await getDoc(appRef);
        if (appSnap.exists()) {
          setApp({ id: appSnap.id, ...appSnap.data() } as AppItem);
        } else {
          setError('App not found.');
        }

        const reviewsQuery = query(collection(db, 'reviews'), where('appId', '==', id));
        const reviewsSnap = await getDocs(reviewsQuery);
        const reviewsData = reviewsSnap.docs.map(doc => ({ ...doc.data() } as Review));
        
        // Sort newest first
        reviewsData.sort((a, b) => b.createdAt - a.createdAt);
        setReviews(reviewsData);

        if (currentUser) {
          const myReview = reviewsData.find(r => r.userId === currentUser.uid);
          if (myReview) {
            setUserRating(myReview.rating);
            setUserReviewText(myReview.reviewText);
          }
          
          const bookmarkQ = query(collection(db, 'bookmarks'), where('appId', '==', id), where('userId', '==', currentUser.uid));
          const bookmarkSnap = await getDocs(bookmarkQ);
          if (!bookmarkSnap.empty) {
            setIsBookmarked(true);
            setBookmarkId(bookmarkSnap.docs[0].id);
          }
        }
      } catch (err) {
        console.error(err);
        setError('Failed to load app details.');
      } finally {
        setLoading(false);
      }
    };
    fetchAppAndReviews();
  }, [id, currentUser]);

  const toggleBookmark = async () => {
    if (!currentUser || !db || !app) return;
    try {
      if (isBookmarked && bookmarkId) {
        await deleteDoc(doc(db, 'bookmarks', bookmarkId));
        setIsBookmarked(false);
        setBookmarkId(null);
      } else {
        const newBookmarkRef = doc(collection(db, 'bookmarks'));
        await setDoc(newBookmarkRef, {
          id: newBookmarkRef.id,
          userId: currentUser.uid,
          appId: app.id,
          createdAt: Date.now()
        });
        setIsBookmarked(true);
        setBookmarkId(newBookmarkRef.id);
      }
    } catch (err) {
      console.error('Failed to toggle bookmark', err);
    }
  };

  const handleInstall = async () => {
    if (!app || !currentUser || !db) return;
    
    // Increment download count
    try {
      const appRef = doc(db, 'apps', app.id);
      await updateDoc(appRef, {
        downloadCount: increment(1)
      });
      setApp({ ...app, downloadCount: app.downloadCount + 1 });
      
      // Record download
      await addDoc(collection(db, 'downloads'), {
        userId: currentUser.uid,
        appId: app.id,
        appName: app.appName,
        appVersion: app.version,
        apkSize: app.apkSize,
        downloadDate: Date.now()
      });

      // Start download (assuming apkFileURL is a direct link)
      window.open(app.apkFileURL, '_blank');
    } catch (err) {
      console.error('Error tracking download:', err);
      // Still allow download even if tracking fails
      window.open(app.apkFileURL, '_blank');
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Download ${app?.appName} on NexAppo`,
          url: window.location.href,
        });
      } catch (err) {
        console.error(err);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const submitReview = async () => {
    if (!app || !currentUser || !db || !userProfile) return;
    if (userRating === 0) return;
    setSubmittingReview(true);
    
    try {
      const reviewRef = doc(db, 'reviews', `${app.id}_${currentUser.uid}`);
      const reviewData: Review = {
        reviewId: reviewRef.id,
        appId: app.id,
        userId: currentUser.uid,
        userName: userProfile.displayName,
        userAvatar: userProfile.photoURL,
        rating: userRating,
        reviewText: userReviewText,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      
      await setDoc(reviewRef, reviewData);
      
      // We would normally also need a Cloud Function or transaction to recalculate app averageRating
      // For simplicity in UI:
      const updatedReviews = [reviewData, ...reviews.filter(r => r.userId !== currentUser.uid)];
      setReviews(updatedReviews);
      
      const newTotal = updatedReviews.reduce((sum, r) => sum + r.rating, 0);
      const newAverage = newTotal / updatedReviews.length;
      
      await updateDoc(doc(db, 'apps', app.id), {
        averageRating: newAverage,
        ratingCount: updatedReviews.length
      });
      
      setApp({ ...app, averageRating: newAverage, ratingCount: updatedReviews.length });
    } catch (err) {
      console.error(err);
      alert('Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !app) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center p-4">
        <AlertCircle className="w-12 h-12 text-rose-500 mb-4" />
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{error || 'App not found'}</h2>
        <button onClick={() => navigate(-1)} className="text-indigo-600 dark:text-indigo-400 font-medium mt-4">
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-20">
      {/* Sticky Header */}
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 py-3 flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <span className="font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600">NexAppo</span>
        <div className="flex items-center">
          {currentUser && (
            <button onClick={toggleBookmark} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300">
              <BookmarkIcon className={`w-6 h-6 ${isBookmarked ? 'fill-indigo-500 text-indigo-500' : ''}`} />
            </button>
          )}
          <button onClick={handleShare} className="p-2 -mr-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300">
            <Share2 className="w-6 h-6" />
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto">
        {/* Top Info */}
        <section className="p-4 md:p-8 flex flex-col md:flex-row gap-6">
          <div className="w-32 h-32 md:w-48 md:h-48 rounded-3xl overflow-hidden shadow-lg shrink-0 mx-auto md:mx-0">
            <img src={app.logoURL} alt={app.appName} className="w-full h-full object-cover" />
          </div>
          
          <div className="flex-1 flex flex-col justify-center text-center md:text-left">
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2">{app.appName}</h1>
            <p 
              onClick={() => navigate(`/publisher/${app.publisherId}`)}
              className="text-indigo-600 dark:text-indigo-400 font-semibold text-lg cursor-pointer hover:underline mb-4 w-fit"
            >
              {app.publisherName}
            </p>
            
            <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-slate-600 dark:text-slate-400">
              <div className="flex flex-col items-center md:items-start">
                <div className="flex items-center font-bold text-slate-900 dark:text-white text-base">
                  {app.averageRating.toFixed(1)} <Star className="w-4 h-4 ml-1 fill-current text-amber-400" />
                </div>
                <span>{app.ratingCount} reviews</span>
              </div>
              <div className="w-px bg-slate-200 dark:bg-slate-700"></div>
              <div className="flex flex-col items-center md:items-start">
                <div className="font-bold text-slate-900 dark:text-white text-base">{(app.downloadCount / 1000).toFixed(1)}K+</div>
                <span>Downloads</span>
              </div>
              <div className="w-px bg-slate-200 dark:bg-slate-700"></div>
              <div className="flex flex-col items-center md:items-start">
                <div className="font-bold text-slate-900 dark:text-white text-base">{app.category}</div>
                <span>Category</span>
              </div>
            </div>
            
            <button 
              onClick={handleInstall}
              className="mt-6 w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] transition-all text-white py-4 px-10 rounded-full font-bold text-lg shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2"
            >
              <Download className="w-6 h-6" /> Install
            </button>
          </div>
        </section>

        {/* Feature Image */}
        {app.featureImageURL && (
          <section className="px-4 md:px-8 mb-8">
            <div className="w-full aspect-[16/9] rounded-3xl overflow-hidden shadow-sm">
              <img src={app.featureImageURL} alt={`${app.appName} Feature`} className="w-full h-full object-cover" />
            </div>
          </section>
        )}

        {/* Screenshots Gallery */}
        {app.screenshotURLs && app.screenshotURLs.length > 0 && (
          <section className="mb-8 pl-4 md:pl-8">
            <div className="flex overflow-x-auto gap-4 hide-scrollbar pb-4 pr-4">
              {app.screenshotURLs.map((url, idx) => (
                <div 
                  key={idx} 
                  onClick={() => setActiveScreenshot(url)}
                  className="w-40 sm:w-56 md:w-64 aspect-[9/16] rounded-2xl overflow-hidden shrink-0 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                >
                  <img src={url} alt={`Screenshot ${idx + 1}`} className="w-full h-full object-cover" loading="lazy" />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Description */}
        <section className="px-4 md:px-8 mb-8">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">About this {app.appType.toLowerCase()}</h2>
          <div className="text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap text-sm md:text-base bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
            {app.fullDescription}
          </div>
        </section>

        {/* App Info Metadata */}
        <section className="px-4 md:px-8 mb-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-slate-100 dark:bg-slate-800/50 rounded-3xl border border-slate-200 dark:border-slate-800">
            <div>
              <p className="text-xs text-slate-500 mb-1">Version</p>
              <p className="font-semibold text-slate-900 dark:text-white">{app.version}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">Updated on</p>
              <p className="font-semibold text-slate-900 dark:text-white">{new Date(app.updatedAt).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">Size</p>
              <p className="font-semibold text-slate-900 dark:text-white">{app.apkSize} MB</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">Devices</p>
              <p className="font-semibold text-slate-900 dark:text-white truncate">{app.supportedDevices[0]}{app.supportedDevices.length > 1 ? ' +' : ''}</p>
            </div>
          </div>
        </section>

        {/* Rating and Reviews */}
        <section className="px-4 md:px-8 mb-12">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Ratings and reviews</h2>
          
          {currentUser && (
            <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 mb-8">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-4 text-center">Rate this {app.appType.toLowerCase()}</h3>
              <div className="flex justify-center gap-2 mb-6">
                {[1,2,3,4,5].map(star => (
                  <button 
                    key={star}
                    onClick={() => setUserRating(star)}
                    className={`p-2 transition-transform hover:scale-110 ${userRating >= star ? 'text-amber-400' : 'text-slate-300 dark:text-slate-600'}`}
                  >
                    <Star className={`w-8 h-8 ${userRating >= star ? 'fill-current' : ''}`} />
                  </button>
                ))}
              </div>
              
              <textarea 
                value={userReviewText}
                onChange={(e) => setUserReviewText(e.target.value)}
                placeholder="Describe your experience (optional)"
                className="w-full p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl mb-4 focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 dark:text-white resize-none h-24 transition-colors"
              />
              
              <div className="flex justify-end">
                <button 
                  onClick={submitReview}
                  disabled={submittingReview || userRating === 0}
                  className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full font-semibold disabled:opacity-50 transition-all"
                >
                  {submittingReview ? 'Submitting...' : 'Post Review'}
                </button>
              </div>
            </div>
          )}

          <div className="space-y-6">
            {reviews.map(review => (
              <div key={review.reviewId} className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900 rounded-full overflow-hidden shrink-0">
                    {review.userAvatar ? (
                      <img src={review.userAvatar} alt={review.userName} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-indigo-600 font-bold text-lg">
                        {review.userName.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white">{review.userName}</h4>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <div className="flex">
                        {[1,2,3,4,5].map(star => (
                          <Star key={star} className={`w-3 h-3 ${review.rating >= star ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-600'}`} />
                        ))}
                      </div>
                      <span>•</span>
                      <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                {review.reviewText && (
                  <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                    {review.reviewText}
                  </p>
                )}
              </div>
            ))}
            {reviews.length === 0 && (
              <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                No reviews yet. Be the first to review!
              </div>
            )}
          </div>
        </section>

      </main>

      {/* Fullscreen Screenshot Viewer Modal */}
      {activeScreenshot && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex justify-center items-center p-4">
          <button 
            onClick={() => setActiveScreenshot(null)}
            className="absolute top-6 right-6 p-2 bg-white/10 rounded-full text-white hover:bg-white/20 transition-colors z-50"
          >
            <X className="w-6 h-6" />
          </button>
          <img 
            src={activeScreenshot} 
            alt="Fullscreen Screenshot" 
            className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl" 
          />
        </div>
      )}
    </div>
  );
};

export default AppDetails;
