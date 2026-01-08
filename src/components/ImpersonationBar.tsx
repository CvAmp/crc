import React, { useState } from 'react';
import { UserCog, XCircle } from 'lucide-react';
import { useStore } from '../store';
import { Select } from './ui/Select';
import { Button } from './ui/Button';
import type { UserRole } from '../types';

export function ImpersonationBar() {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const store = useStore();
  const user = store.user;
  const users = store.users;
  const impersonatedUser = store.impersonatedUser;

  if (user?.role !== 'ADMIN') return null;

  const handleRoleChange = (role: UserRole) => {
    // Just store the role selection without activating impersonation
    setSelectedRole(role);
  };

  const handleUserChange = (userId: string) => {
    const selectedUser = users.find(u => u.id === userId);
    if (selectedUser) {
      setSelectedUserId(userId);
    }
  };

  const handleActivateImpersonation = () => {
    if (selectedUserId && selectedRole) {
      store.setImpersonatedUser({ id: selectedUserId, role: selectedRole });
    }
  };

  const handleExitImpersonation = () => {
    store.setImpersonatedUser(null);
    setSelectedRole(null);
    setSelectedUserId(null);
  };

  // Filter users based on selected role
  const filteredUsers = users.filter(u => 
    u.id !== user?.id && // Exclude current user
    (!selectedRole || u.role === selectedRole)
  );

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
          <button
            onClick={handleActivateImpersonation}
            disabled={!selectedRole || !selectedUserId}
            className={`px-2 py-1 rounded-md border flex items-center transition-colors ${
              selectedRole && selectedUserId
                ? 'bg-amber-50/50 border-amber-200 hover:bg-amber-50'
                : 'border-gray-200 opacity-50 cursor-not-allowed'
            }`}
          >
            <UserCog className="w-4 h-4 text-amber-600 mr-2" />
            <span className="text-sm font-medium text-gray-600">Impersonation Mode</span>
          </button>
        )}
      </div>

      <Select
        value={selectedRole || ''}
        onChange={(e) => handleRoleChange(e.target.value as UserRole)}
        options={[
          { value: '', label: 'Role...' },
          { value: 'CPM', label: 'CPM' },
          { value: 'ENGINEER', label: 'Engineer' },
          { value: 'CPM_MANAGER', label: 'CPM Manager' },
          { value: 'ENGINEER_MANAGER', label: 'Engineer Manager' }
        ]}
        className="w-32"
      />

      <Select
        value={selectedUserId || ''}
        onChange={(e) => handleUserChange(e.target.value)}
        options={[
          { value: '', label: 'User...' },
          ...filteredUsers.map(u => ({
            value: u.id,
            label: u.email
          }))
        ]}
        className="w-32"
        disabled={!selectedRole} // Disable user selection until role is chosen
      />
    </div>
  );
}