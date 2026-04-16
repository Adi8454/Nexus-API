/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import AuthForms from './components/AuthForms';
import Dashboard from './components/Dashboard';
import { Toaster } from '@/components/ui/sonner';

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setIsReady(true);
  }, []);

  const handleAuthSuccess = (user: any, token: string) => {
    setUser(user);
    setToken(token);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  if (!isReady) return null;

  return (
    <>
      {token && user ? (
        <Dashboard user={user} onLogout={handleLogout} />
      ) : (
        <AuthForms onAuthSuccess={handleAuthSuccess} />
      )}
      <Toaster position="top-right" />
    </>
  );
}

