import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Header from './components/Header';
import Toolbar from '@mui/material/Toolbar';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import ProfilePage from './pages/ProfilePage';
import PredictionPage from './pages/PredictionPage';
import PredictionListPage from './pages/PredictionListPage';
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
          <Route path="/predictions/new" element={<PredictionPage />} />
          <Route path="/predictions" element={<PredictionListPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;