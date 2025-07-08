import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { BookmarkProvider } from './context/BookmarkContext';
import { useAuth } from './context/AuthContext';
import ModernLoginPage from './components/auth/ModernLoginPage';
import ModernDashboard from './components/dashboard/ModernDashboard';
import LandingPage from './components/landing/LandingPage';

function AppContent() {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-t-[#FF0000] border-b-[#FF0000] border-l-transparent border-r-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
  
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<ModernLoginPage />} />
      <Route path="/app" element={user ? <ModernDashboard /> : <ModernLoginPage />} />
      <Route path="*" element={user ? <ModernDashboard /> : <ModernLoginPage />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <BookmarkProvider>
        <Router>
          <AppContent />
        </Router>
      </BookmarkProvider>
    </AuthProvider>
  );
}

export default App;