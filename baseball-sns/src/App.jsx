import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Header from './components/Header';
import Toolbar from '@mui/material/Toolbar';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import ProfilePage from './pages/ProfilePage';
import UserProfilePage from './pages/UserProfilePage';
import PredictionPage from './pages/PredictionPage';
import PredictionListPage from './pages/PredictionListPage';
import TitlePredictionPage from './pages/TitlePredictionPage';
import TitlePredictionListPage from './pages/TitlePredictionListPage';
import NotFoundPage from './pages/NotFoundPage';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Header />
        <Toolbar /> {/* ヘッダーの高さ分コンテンツをオフセットするためのダミー */}
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/users/:userId" element={<UserProfilePage />} />
          <Route path="/predictions/new" element={<PredictionPage />} />
          <Route path="/predictions" element={<PredictionListPage />} />
          <Route path="/predictions/titles" element={<TitlePredictionPage />} />
          <Route path="/predictions/titles/all" element={<TitlePredictionListPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;