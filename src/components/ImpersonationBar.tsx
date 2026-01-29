import React, { useState } from 'react';
import { UserCog, XCircle } from 'lucide-react';
import { useStore } from '../store';
import { Select } from './ui/Select';
import { Button } from './ui/Button';
import type { UserRole } from '../types';

export function ImpersonationBar() {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const store = useStore();
  const user = store.user;
  const impersonatedUser = store.impersonatedUser;

  if (user?.role !== 'ADMIN') return null;

  const handleRoleChange = (role: UserRole) => {
    if (role) {
      store.setImpersonatedUser(role);
      setSelectedRole(role);
    }
  };

  const handleExitImpersonation = () => {
    store.setImpersonatedUser(null);
    setSelectedRole(null);
  };

  return (
    <div className="flex items-center space-x-4">
      <div className="flex items-center space-x-2">
        {impersonatedUser ? (
          <button
            onClick={handleExitImpersonation}
            className="px-2 py-1 rounded-md border border-amber-200 bg-amber-50 flex items-center hover:bg-amber-100 transition-colors"
          >
            <UserCog className="w-4 h-4 text-amber-600 mr-2" />
            <span className="text-sm font-medium text-amber-700">Exit Impersonation</span>
          </button>
        ) : (
          <span className="text-sm font-medium text-gray-500 flex items-center">
            <UserCog className="w-4 h-4 text-gray-400 mr-2" />
            Impersonate Role:
          </span>
        )}
      </div>

      {!impersonatedUser && (
        <Select
          value={selectedRole || ''}
          onChange={(e) => handleRoleChange(e.target.value as UserRole)}
          options={[
            { value: '', label: 'Select role...' },
            { value: 'CPM', label: 'CPM' },
            { value: 'ENGINEER', label: 'Engineer' },
            { value: 'CPM_MANAGER', label: 'CPM Manager' },
            { value: 'ENGINEER_MANAGER', label: 'Engineer Manager' }
          ]}
          className="w-40"
        />
      )}

      {impersonatedUser && (
        <span className="text-sm font-medium text-amber-700 bg-amber-50 px-3 py-1 rounded-md border border-amber-200">
          As: {impersonatedUser}
        </span>
      )}
    </div>
  );
}