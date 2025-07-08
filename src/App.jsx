import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { BookmarkProvider } from './context/BookmarkContext';
import { useAuth } from './context/AuthContext';
import LoginPage from './components/auth/LoginPage';
import Dashboard from './components/dashboard/Dashboard';

function AppContent() {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
  
  return (
    <Routes>
      <Route 
        path="/" 
        element={user ? <Dashboard /> : <LoginPage />} 
      />
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