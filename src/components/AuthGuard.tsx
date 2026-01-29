import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { getCurrentUser } from '../lib/auth';
import { Alert } from './ui/Alert';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export function AuthGuard({ children, requireAdmin = false }: AuthGuardProps) {
  const { user, impersonatedUser } = useStore();
  const setUser = useStore((state) => state.setUser);
  const navigate = useNavigate();

  useEffect(() => {
    async function checkAuth() {
      if (!user) {
        const currentUser = await getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
        } else {
          navigate('/login');
        }
      }
    }
    checkAuth();
  }, [user, setUser, navigate]);

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <Alert type="error" message="Please log in to access this page" />
      </div>
    );
  }

  // Check if user is impersonating a non-admin role
  const effectiveRole = impersonatedUser || user.role;

  if (requireAdmin && effectiveRole !== 'ADMIN') {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <Alert type="error" message="You do not have permission to access this page" />
      </div>
    );
  }

  return <>{children}</>;
}