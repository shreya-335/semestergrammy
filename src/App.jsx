'use client'

import { useState, useEffect } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import SemesterCabinet from './components/SemesterCabinet';
import SemesterView from './components/SemesterView';
import SemesterJoin from './components/SemesterJoin';
import AuthModal from './components/AuthModal';
import { testFirebaseConnection } from './services/firestore';

// Main App Content (inside AuthProvider)
const AppContent = () => {
  const [selectedSemester, setSelectedSemester] = useState(null);
  const [joiningSemester, setJoiningSemester] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [firebaseConnected, setFirebaseConnected] = useState(false);
  const { user, loading: authLoading } = useAuth();

  // Check for invite link in URL
  useEffect(() => {
    const path = window.location.pathname;
    const inviteMatch = path.match(/\/invite\/(.+)/);
    
    if (inviteMatch) {
      const semesterId = inviteMatch[1];
      setJoiningSemester(semesterId);
    }
  }, []);

  // Test Firebase connection on app load
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const connected = await testFirebaseConnection();
        setFirebaseConnected(connected);
        
        if (!connected) {
          setError('Cannot connect to Firebase. Please check your configuration.');
          toast.error('Firebase connection failed.');
        } else {
          toast.success('Connected to Firebase! 🎉');
        }
      } catch (err) {
        console.error('Connection test failed:', err);
        setError('Failed to test Firebase connection.');
        setFirebaseConnected(false);
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      checkConnection();
    }
  }, [authLoading]);

  const handleJoinSuccess = (semesterId) => {
    setJoiningSemester(null);
    setSelectedSemester({ id: semesterId });
    // Clear the invite URL
    window.history.replaceState({}, '', '/');
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center">
        <div className="text-amber-800 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-800 mx-auto mb-4"></div>
          <p className="text-lg">Loading your semester cabinet...</p>
        </div>
      </div>
    );
  }

  if (error && !firebaseConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center border border-red-200">
          <div className="text-red-500 text-6xl mb-4">📁</div>
          <h2 className="text-red-800 text-xl font-bold mb-4">Cabinet Locked</h2>
          <p className="text-red-600 mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Show join page if accessing via invite link
  if (joiningSemester) {
    return (
      <SemesterJoin
        semesterId={joiningSemester}
        onJoinSuccess={handleJoinSuccess}
      />
    );
  }

  // Show auth modal if not logged in
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
        <AuthModal
          isOpen={true}
          onClose={() => {}} // Can't close if not logged in
          mode="signin"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-amber-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">📁</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-amber-900">Semester Cabinet</h1>
                <p className="text-amber-600 text-sm">Your organized college memories</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {selectedSemester && (
                <button
                  onClick={() => setSelectedSemester(null)}
                  className="bg-amber-100 hover:bg-amber-200 text-amber-800 px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                >
                  <span>←</span> Back to Cabinet
                </button>
              )}
              
              {/* User Menu */}
              <div className="flex items-center gap-2 text-amber-700">
                <span className="text-sm">Welcome, {user.displayName || user.email}</span>
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="text-amber-500 hover:text-amber-700 text-sm underline"
                >
                  Account
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {selectedSemester ? (
          <SemesterView 
            semester={selectedSemester} 
            onBack={() => setSelectedSemester(null)}
          />
        ) : (
          <SemesterCabinet onSelectSemester={setSelectedSemester} />
        )}
      </main>
      
      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        mode="signin"
      />
      
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'white',
            color: '#92400e',
            border: '1px solid #fbbf24',
          },
        }}
      />
    </div>
  );
};

// Main App Component with AuthProvider
export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
