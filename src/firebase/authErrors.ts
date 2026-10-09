export const getAuthErrorMessage = (error: any): string => {
  const code = error?.code || '';
  const message = error?.message || '';

  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'ভুল ইমেইল বা পাসওয়ার্ড! আপনার যদি এখনো অ্যাকাউন্ট না থাকে, তাহলে নিচে "Register now" বাটনে ক্লিক করে আগে রেজিস্টার করুন। (Invalid email or password. If you don\'t have an account, please click "Register now" below)';
    
    case 'auth/email-already-in-use':
      return 'এই ইমেইল দিয়ে ইতোমধ্যে একটি অ্যাকাউন্ট খোলা আছে। দয়া করে লগইন করুন অথবা অন্য ইমেইল ব্যবহার করুন। (Email already registered. Please sign in)';
    
    case 'auth/weak-password':
      return 'পাসওয়ার্ডটি খুব দুর্বল! কমপক্ষে ৬টি অক্ষরের পাসওয়ার্ড দিন। (Password should be at least 6 characters)';
    
    case 'auth/invalid-email':
      return 'সঠিক ইমেইল ঠিকানা দিন। (Please enter a valid email address)';
    
    case 'auth/operation-not-allowed':
      return 'Firebase Console-এ Email/Password অথেনটিকেশন চালু করা নেই। আপনার Firebase Console > Authentication > Sign-in method এ গিয়ে Email/Password এনাবল (Enable) করুন।';
    
    case 'auth/popup-closed-by-user':
      return 'গুগল সাইন-ইন উইন্ডো বন্ধ করা হয়েছে। আবার চেষ্টা করুন। (Sign-in popup was closed)';
    
    case 'auth/network-request-failed':
      return 'নেটওয়ার্ক সমস্যা! আপনার ইন্টারনেট সংযোগ চেক করে আবার চেষ্টা করুন। (Network error, please check your internet)';
    
    case 'auth/too-many-requests':
      return 'অনেকবার ভুল চেষ্টা করা হয়েছে। কিছুক্ষণ পর আবার চেষ্টা করুন। (Too many attempts. Please try again later)';

    case 'auth/user-disabled':
      return 'এই অ্যাকাউন্টটি নিষ্ক্রিয় করা হয়েছে। অ্যাডমিনের সাথে যোগাযোগ করুন। (Account disabled)';

    default:
      if (message.includes('invalid-credential')) {
        return 'ভুল ইমেইল বা পাসওয়ার্ড! আপনার অ্যাকাউন্ট না থাকলে নিচে "Register now" তে ক্লিক করে নতুন অ্যাকাউন্ট খুলুন।';
      }
      return message || 'কিছু একটা সমস্যা হয়েছে। আবার চেষ্টা করুন।';
  }
};
