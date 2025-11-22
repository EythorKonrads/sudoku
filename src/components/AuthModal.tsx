import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import styles from './AuthModal.module.scss';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'signup';
  allowClose?: boolean;
}

export default function AuthModal({ isOpen, onClose, initialMode = 'login', allowClose = true }: AuthModalProps) {
  const { user, login, signup, upgradeGuest, createGuest } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [guestLoading, setGuestLoading] = useState(false);

  if (!isOpen) return null;

  const isUpgrading = user?.isGuest;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isUpgrading) {
        await upgradeGuest(username, email, password);
      } else if (mode === 'login') {
        await login(email, password);
      } else {
        await signup(username, email, password);
      }
      // Clear inputs on success
      setUsername('');
      setEmail('');
      setPassword('');
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handlePlayAsGuest = async () => {
    setError('');
    setGuestLoading(true);
    try {
      await createGuest();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create guest user');
    } finally {
      setGuestLoading(false);
    }
  };

  const getTitle = () => {
    if (isUpgrading) return 'Upgrade Your Account';
    return mode === 'login' ? 'Login' : 'Sign Up';
  };

  const getButtonText = () => {
    if (isUpgrading) return 'Upgrade Account';
    return mode === 'login' ? 'Login' : 'Sign Up';
  };

  return (
    <div className={styles.authModal} onClick={allowClose ? onClose : undefined}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>{getTitle()}</h2>
          {allowClose && (
            <button className={styles.closeButton} onClick={onClose}>
              ×
            </button>
          )}
        </div>

        {!isUpgrading && (
          <div className={styles.welcomeMessage}>
            <p>Welcome to Sudoku! Please login or create an account to start playing.</p>
          </div>
        )}

        {isUpgrading && (
          <div className={styles.guestNotice}>
            <p><strong>You're currently playing as a guest.</strong></p>
            <p>Create an account to save your progress permanently!</p>
          </div>
        )}

        <form className={styles.form} onSubmit={handleSubmit}>
          {(mode === 'signup' || isUpgrading) && (
            <div className={styles.formGroup}>
              <label htmlFor="username">Username</label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                minLength={3}
                maxLength={20}
                pattern="[a-zA-Z0-9_]+"
                title="3-20 characters, letters, numbers and underscores only"
                autoComplete="username"
              />
            </div>
          )}

          <div className={styles.formGroup}>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            />
          </div>

          {error && <div className={styles.error}>{error}</div>}

          <button
            type="submit"
            className={styles.submitButton}
            disabled={loading}
          >
            {loading ? 'Loading...' : getButtonText()}
          </button>
        </form>

        {!isUpgrading && (
          <div className={styles.switchMode}>
            {mode === 'login' ? (
              <p>
                Don't have an account?{' '}
                <button type="button" onClick={() => setMode('signup')}>
                  Sign Up
                </button>
              </p>
            ) : (
              <p>
                Already have an account?{' '}
                <button type="button" onClick={() => setMode('login')}>
                  Login
                </button>
              </p>
            )}
          </div>
        )}

        {!isUpgrading && (
          <>
            <div className={styles.divider}>
              <span>OR</span>
            </div>
            <button
              type="button"
              onClick={handlePlayAsGuest}
              className={styles.guestButton}
              disabled={guestLoading || loading}
            >
              {guestLoading ? 'Creating Guest...' : 'Play as Guest'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
