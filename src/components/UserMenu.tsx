import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import AuthModal from './AuthModal';
import styles from './UserMenu.module.scss';

export default function UserMenu() {
  const { user, loading, logout, createGuest } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup'>('login');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  // Auto-create guest user if no user exists
  useEffect(() => {
    if (!loading && !user) {
      // Don't auto-create guest, let user choose
    }
  }, [loading, user, createGuest]);

  const handleLogout = async () => {
    await logout();
    setShowDropdown(false);
  };

  const handleUpgrade = () => {
    setAuthModalMode('signup');
    setShowAuthModal(true);
    setShowDropdown(false);
  };

  if (loading) {
    return null;
  }

  if (!user) {
    return null; // Auth modal will handle authentication now
  }

  return (
    <>
      <div className={styles.userMenu} ref={dropdownRef}>
        <button className={styles.userButton} onClick={() => setShowDropdown(!showDropdown)}>
          {user.isGuest ? '👤 Guest' : (user.username || user.email)}
        </button>

        {showDropdown && (
          <div className={styles.dropdown}>
            <div className={styles.userInfo}>
              {user.isGuest ? (
                <div className={styles.guestBadge}>Guest User</div>
              ) : (
                <>
                  <div className={styles.userEmail}>{user.username}</div>
                  {user.email && <div style={{ fontSize: '0.875rem', color: '#666' }}>{user.email}</div>}
                </>
              )}
            </div>

            {user.isGuest && (
              <button className={`${styles.menuButton} ${styles.primary}`} onClick={handleUpgrade}>
                Upgrade Account
              </button>
            )}

            <button className={`${styles.menuButton} ${styles.danger}`} onClick={handleLogout}>
              Logout
            </button>
          </div>
        )}
      </div>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialMode={authModalMode}
      />
    </>
  );
}
