import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Calendar, 
  PlusCircle, 
  Rocket,
  Users,
  Workflow,
  FileText,
  ChevronLeft,
  ChevronRight,
  Home,
  Settings,
  User,
  History,
  MessageSquare,
  Inbox,
  FileCheck,
  FileSpreadsheet,
  BarChart3
} from 'lucide-react';
import { useStore } from '../store';
import { ThemeToggle } from './ThemeToggle';

// Helper function to check if a role has admin access
const hasAdminAccess = (role: UserRole) => role === 'ADMIN';

export function Navigation() {
  const { user, impersonatedUser } = useStore();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Use impersonated role if available, otherwise use actual user role
  const effectiveRole = impersonatedUser || user?.role;

  const NavItem = ({ to, icon: Icon, children }: { to: string; icon: React.ElementType; children: React.ReactNode }) => (
    <NavLink
      to={to}
      className={({ isActive }) => 
        `flex items-center px-4 py-3 rounded-md text-sm font-medium transition-colors duration-150
        ${isActive 
          ? 'bg-accent/10 text-accent' 
          : 'text-secondary-text hover:bg-secondary-bg hover:text-accent'
        }
        ${isCollapsed ? 'justify-center' : ''}`
      }
      title={isCollapsed ? String(children) : undefined}
    >
      <Icon className={`w-5 h-5 ${isCollapsed ? '' : 'mr-3'}`} />
      {!isCollapsed && <span>{children}</span>}
    </NavLink>
  );

  return (
    <div className={`fixed left-0 top-0 h-full bg-primary-bg shadow-lg transition-all duration-300 flex flex-col
      ${isCollapsed ? 'w-20' : 'w-64'}`}
    >
      <div className="flex items-center justify-between p-4 border-b border-secondary-bg">
        {!isCollapsed && (
          <span className="text-lg font-semibold text-primary-text">Calendar Tool</span>
        )}
        <div className="flex items-center space-x-2">
          <ThemeToggle />
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-md hover:bg-secondary-bg text-secondary-text"
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? <ChevronRight className="w-6 h-6" /> : <ChevronLeft className="w-6 h-6" />}
          </button>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-4 space-y-2">
        {/* Home Section */}
        <NavItem to="/" icon={Home}>Home</NavItem>
        <NavItem to="/create-appointment" icon={PlusCircle}>Create Appointment</NavItem>
        <NavItem to="/accelerations" icon={Settings}>Accelerations</NavItem>
        
        {/* Work Queues Section */}
        {!isCollapsed && (
          <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Work Queues
          </div>
        )}
        <NavItem to="/tiv-status" icon={FileCheck}>TIV Status</NavItem>
        <NavItem to="/macds" icon={FileSpreadsheet}>MACDs</NavItem>
        <NavItem to="/work-orders" icon={Inbox}>Work Orders</NavItem>

        {/* You Section */}
        {!isCollapsed && (
          <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            You
          </div>
        )}
        <NavItem to="/shift-schedule" icon={User}>Shift Schedule</NavItem>
        <NavItem to="/history" icon={History}>History</NavItem>
        <NavItem to="/reports" icon={BarChart3}>Reports</NavItem>

        {/* Help & Support Section */}
        {!isCollapsed && (
          <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Help & Support
          </div>
        )}
        <NavItem to="/help-and-faq" icon={MessageSquare}>Help & FAQ</NavItem>
        {hasAdminAccess(effectiveRole) && (
          <>
            {!isCollapsed && (
              <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Admin Functions
              </div>
            )}
            <NavItem to="/modify-availability" icon={Calendar}>Modify Availability</NavItem>
            <NavItem to="/modify-access" icon={Users}>Modify Access</NavItem>
            <NavItem to="/modify-workflows" icon={Workflow}>Modify Workflows</NavItem>
            <NavItem to="/modify-templates" icon={FileText}>Modify Templates</NavItem>
            <NavItem to="/modify-accelerations" icon={Settings}>Modify Accelerations</NavItem>
          </>
        )}
      </nav>
    </div>
  );
}