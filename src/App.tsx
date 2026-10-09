import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import { AuthProvider } from './contexts/AuthContext';
import { UploadProvider } from './contexts/UploadContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Apps from './pages/Apps';
import Games from './pages/Games';
import Profile from './pages/Profile';
import AppDetails from './pages/AppDetails';
import UploadApp from './pages/UploadApp';
import EditApp from './pages/EditApp';
import Settings from './pages/Settings';
import EditProfile from './pages/EditProfile';
import Search from './pages/Search';
import Notifications from './pages/Notifications';
import PublisherProfile from './pages/PublisherProfile';
import Bookmarks from './pages/Bookmarks';
import DownloadHistory from './pages/DownloadHistory';
import UploadProgressWidget from './components/UploadProgressWidget';

export default function App() {

  return (
    <AuthProvider>
      <UploadProvider>
        <HashRouter>
          <UploadProgressWidget />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
              <Route index element={<Home />} />
              <Route path="apps" element={<Apps />} />
              <Route path="games" element={<Games />} />
              <Route path="app/:id" element={<AppDetails />} />
              <Route path="publisher/:id" element={<PublisherProfile />} />
              <Route path="profile" element={<Profile />} />
              <Route path="upload" element={<UploadApp />} />
              <Route path="edit-app/:id" element={<EditApp />} />
              <Route path="settings" element={<Settings />} />
              <Route path="edit-profile" element={<EditProfile />} />
              <Route path="search" element={<Search />} />
              <Route path="notifications" element={<Notifications />} />
              <Route path="bookmarks" element={<Bookmarks />} />
              <Route path="downloads" element={<DownloadHistory />} />
            </Route>
          </Routes>
        </HashRouter>
      </UploadProvider>
    </AuthProvider>
  );
}

