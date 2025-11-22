import type { NextPage } from 'next';
import { useState, useEffect } from 'react';
import SudokuBoard from '../components/SudokuBoard';
import UserMenu from '../components/UserMenu';
import AuthModal from '../components/AuthModal';
import { useAuth } from '@/contexts/AuthContext';

const Home: NextPage = () => {
  const { user, loading } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Show auth modal immediately if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      setShowAuthModal(true);
    } else if (user) {
      // Close modal when user logs in
      setShowAuthModal(false);
    }
  }, [loading, user]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <UserMenu />
      {user && <SudokuBoard />}

      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => {
          // Don't allow closing unless authenticated
          if (user) {
            setShowAuthModal(false);
          }
        }}
        allowClose={!!user}
      />
    </div>
  );
};

export default Home;
