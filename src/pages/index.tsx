import type { NextPage } from 'next';
import { useState, useEffect } from 'react';
import SudokuBoard from '../components/SudokuBoard';
import UserMenu from '../components/UserMenu';
import AuthModal from '../components/AuthModal';
import { useAuth } from '@/contexts/AuthContext';

const Home: NextPage = () => {
  const { user, loading, createGuest } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [_isCreatingGuest, setIsCreatingGuest] = useState(false);

  // Show auth modal immediately if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      setShowAuthModal(true);
    } else if (user) {
      // Close modal when user logs in
      setShowAuthModal(false);
    }
  }, [loading, user]);

  const _handlePlayAsGuest = async () => {
    setIsCreatingGuest(true);
    try {
      await createGuest();
      setShowAuthModal(false);
    } catch (error) {
      console.error('Failed to create guest user:', error);
    } finally {
      setIsCreatingGuest(false);
    }
  };

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
