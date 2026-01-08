import React, { useState, useRef, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { UserCircle, Settings } from 'lucide-react';
import { Tooltip } from './ui/Tooltip';
import { useStore } from '../store';

export function UserMenu() {
  const user = useStore((state) => state.user);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <Tooltip content={user?.email || 'User Profile'} position="bottom">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="p-2 rounded-full hover:bg-secondary-bg text-secondary-text"
        >
          <UserCircle className="w-6 h-6" />
        </button>
      </Tooltip>
      
      {showMenu && (
        <div className="absolute right-0 mt-2 w-48 bg-primary-bg rounded-lg shadow-lg py-1 border border-secondary-bg z-[100]">
          <div className="px-4 py-2 border-b border-secondary-bg">
            <p className="text-sm font-medium text-primary-text truncate">
              {user?.email}
            </p>
            <p className="text-xs font-medium text-purple-600">
              {user?.role === 'CPM' ? 'CPM' :
               user?.role === 'ENGINEER' ? 'Engineer' :
               user?.role === 'CPM_MANAGER' ? 'CPM Manager' :
               user?.role === 'ENGINEER_MANAGER' ? 'Engineer Manager' :
               user?.role === 'ADMIN' ? 'Admin' : user?.role}
            </p>
          </div>
          <NavLink
            to="/modify-access"
            className="flex items-center px-4 py-2 text-sm text-secondary-text hover:bg-secondary-bg transition-colors duration-150"
            onClick={() => setShowMenu(false)}
          >
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </NavLink>
        </div>
      )}
    </div>
  );
}