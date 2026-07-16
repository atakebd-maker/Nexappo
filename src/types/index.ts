export type AppType = 'App' | 'Game';

export type DeviceType = 'Android Phone' | 'Tablet' | 'Android TV' | 'Wear OS' | 'Chromebook';

export type Category = 
  | 'Tools' | 'Productivity' | 'Photography' | 'Music' | 'Finance' | 'Education' 
  | 'Health' | 'Shopping' | 'Communication' | 'Action' | 'Adventure' | 'Arcade' 
  | 'Puzzle' | 'Racing' | 'Sports' | 'Strategy' | 'Simulation' | 'Casual' 
  | 'Role Playing' | 'Entertainment' | 'Business' | 'Lifestyle' | 'Social' | 'Video';

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string;
  joinDate: string;
  lastLogin: string;
  totalApps: number;
  totalGames: number;
  totalDownloads: number;
  totalRatingsReceived: number;
  savedApps: string[];
  bookmarks: string[];
  role: 'Standard User' | 'Verified Publisher';
  isVerifiedPublisher: boolean;
  bio?: string;
  website?: string;
  following?: string[]; // publisher uids
  followers?: string[];
}

export interface AppItem {
  id: string; // Document ID
  publisherId: string;
  publisherName: string;
  publisherAvatar: string;
  appName: string;
  appType: AppType;
  category: Category;
  supportedDevices: DeviceType[];
  shortDescription: string;
  fullDescription: string;
  version: string;
  apkSize: number; // in MB
  logoURL: string;
  featureImageURL: string;
  screenshotURLs: string[];
  apkFileURL: string;
  averageRating: number;
  ratingCount: number;
  downloadCount: number;
  createdAt: number;
  updatedAt: number;
  status: 'Published' | 'Draft';
}

export interface Review {
  reviewId: string;
  appId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  rating: number;
  reviewText: string;
  createdAt: number;
  updatedAt: number;
}

export interface DownloadRecord {
  id: string;
  userId: string;
  appId: string;
  appName: string;
  appVersion: string;
  apkSize: number;
  downloadDate: number;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'Download' | 'Rating' | 'Review' | 'Upload' | 'Account' | 'System';
  isRead: boolean;
  createdAt: number;
  link?: string;
}

export interface Bookmark {
  id: string;
  userId: string;
  appId: string;
  createdAt: number;
}
