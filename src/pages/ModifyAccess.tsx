import React, { useState, useEffect } from 'react';
import { Plus, Trash2, UserPlus, Users, Building2, AlertTriangle } from 'lucide-react';
import { Alert } from '../components/ui/Alert';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { EmptyState } from '../components/ui/EmptyState';
import { FormField } from '../components/ui/FormField';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Button } from '../components/ui/Button';
import { Table } from '../components/ui/Table';
import { Badge } from '../components/ui/Badge';
import { Dialog } from '../components/ui/Dialog';
import { useStore } from '../store';
import type { UserRole } from '../types';

interface User {
  id: string;
  email: string;
  role: UserRole;
  team_id?: string;
  team_name?: string;
}

interface ConfirmDialogProps {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  title,
  message,
  onConfirm,
  onCancel
}) => (
  <Dialog
    open={true}
    onClose={onCancel}
    title={title}
    maxWidth="sm"
  >
    <div className="p-6">
      <div className="flex items-center space-x-3 text-amber-600 mb-4">
        <AlertTriangle className="w-6 h-6" />
        <h3 className="text-lg font-semibold">{title}</h3>
      </div>
      <p className="text-gray-600 mb-6">{message}</p>
      <div className="flex justify-end space-x-3">
        <Button variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="danger" onClick={onConfirm}>
          Delete
        </Button>
      </div>
    </div>
  </Dialog>
);

export function ModifyAccess() {
  const store = useStore();
  const user = useStore((state) => state.user);
  const [teams, setTeams] = useState<Team[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [newTeam, setNewTeam] = useState('');
  const [newUser, setNewUser] = useState({
    email: '',
    role: 'CPM' as UserRole,
    teamId: ''
  });
  const [confirmDialog, setConfirmDialog] = useState<{
    show: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    show: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });

  useEffect(() => {
    if (!user?.role || user.role !== 'ADMIN') {
      setError('Only administrators can access this page');
      return;
    }
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const storeTeams = store.teams;
      const storeUsers = store.users;
      
      // Update local state with store data
      setTeams(storeTeams);
      setUsers(storeUsers.map(user => ({
        ...user,
        team_name: storeTeams.find(t => t.id === user.teamId)?.name
      })));
    } catch (err) {
      setError('Failed to load data');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeam.trim()) return;

    setLoading(true);
    try {
      setError(null);
      
      await store.addTeam({ name: newTeam.trim() });
      await fetchData();
      setSuccess('Team added successfully');
      setTimeout(() => setSuccess(null), 3000);
      setNewTeam('');
    } catch (err) {
      console.error('Error adding team:', err);
      setError('Failed to add team');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTeam = async (id: string) => {
    try {
      await store.removeTeam(id);
      await fetchData();
      setSuccess('Team deleted successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error deleting team:', err);
      setError('Failed to delete team');
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.email.trim() || !newUser.role) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      await store.addUser({
        email: newUser.email.trim(),
        role: newUser.role,
        teamId: newUser.teamId || undefined
      });
      await fetchData();
      setSuccess('User added successfully');
      setTimeout(() => setSuccess(null), 3000);
      setNewUser({
        email: '',
        role: 'CPM',
        teamId: ''
      });
    } catch (err) {
      console.error('Error adding user:', err);
      setError('Failed to add user');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      await store.removeUser(userId);
      await fetchData();
      setSuccess('User removed successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error deleting user:', err);
      setError('Failed to delete user');
    }
  };

  if (!user?.role || user.role !== 'ADMIN') {
    return (
      <div className="max-w-7xl mx-auto">
        <Alert type="error" message="You do not have permission to access this page" />
      </div>
    );
  }

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {error && <Alert type="error" message={error} />}
      {success && <Alert type="success" message={success} />}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Teams Section */}
        <Card>
          <CardHeader>
            <CardTitle>Teams</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddTeam} className="mb-6">
              <div className="flex space-x-2">
                <Input
                  type="text"
                  value={newTeam}
                  onChange={(e) => {
                    setNewTeam(e.target.value);
                    setError(null);
                  }}
                  placeholder="Enter team name"
                  required
                />
                <Button type="submit" icon={Plus}>
                  Add Team
                </Button>
              </div>
            </form>

            {teams.length === 0 ? (
              <EmptyState
                icon={Building2}
                title="No teams"
                description="Get started by creating a new team"
              />
            ) : (
              <Table
                data={teams}
                columns={[
                  { key: 'name', label: 'Team Name' },
                  {
                    key: 'id',
                    label: 'Actions',
                    render: (_, team) => (
                      <Button
                        variant="danger"
                        size="sm"
                        icon={Trash2}
                        onClick={() => setConfirmDialog({
                          show: true,
                          title: 'Delete Team',
                          message: `Are you sure you want to delete the team "${team.name}"? This will remove all team members.`,
                          onConfirm: () => {
                            handleDeleteTeam(team.id);
                            setConfirmDialog(prev => ({ ...prev, show: false }));
                          }
                        })}
                      >
                        Delete
                      </Button>
                    )
                  }
                ]}
              />
            )}
          </CardContent>
        </Card>

        {/* Users Section */}
        <Card>
          <CardHeader>
            <CardTitle>Users</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddUser} className="mb-6 space-y-4">
              <FormField label="Email" required>
                <Input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => {
                    setNewUser(prev => ({
                      ...prev,
                      email: e.target.value
                    }));
                    setError(null);
                  }}
                  placeholder="Enter email address"
                  required
                />
              </FormField>

              <FormField label="Role" required>
                <Select
                  value={newUser.role}
                  onChange={(e) => setNewUser(prev => ({
                    ...prev,
                    role: e.target.value as UserRole
                  }))}
                  options={[
                    { value: 'CPM', label: 'CPM' },
                    { value: 'ENGINEER', label: 'Engineer' },
                    { value: 'CPM_MANAGER', label: 'CPM Manager' },
                    { value: 'ENGINEER_MANAGER', label: 'Engineer Manager' },
                    { value: 'ADMIN', label: 'Admin' }
                  ]}
                  required
                />
              </FormField>

              <FormField label="Team">
                <Select
                  value={newUser.teamId}
                  onChange={(e) => setNewUser(prev => ({
                    ...prev,
                    teamId: e.target.value
                  }))}
                  options={[
                    { value: '', label: 'No team' },
                    ...teams.map(team => ({
                      value: team.id,
                      label: team.name
                    }))
                  ]}
                />
              </FormField>

              <Button type="submit" icon={UserPlus} fullWidth>
                Add User
              </Button>
            </form>

            {users.length === 0 ? (
              <EmptyState
                icon={Users}
                title="No users"
                description="Get started by adding a new user"
              />
            ) : (
              <Table
                data={users}
                columns={[
                  { key: 'email', label: 'Email' },
                  {
                    key: 'role',
                    label: 'Role',
                    render: (role) => (
                      <Badge variant="info">
                        {role === 'CPM' ? 'CPM' :
                         role === 'ENGINEER' ? 'Engineer' :
                         role === 'CPM_MANAGER' ? 'CPM Manager' :
                         role === 'ENGINEER_MANAGER' ? 'Engineer Manager' :
                         role === 'ADMIN' ? 'Admin' : role}
                      </Badge>
                    )
                  },
                  {
                    key: 'team_name',
                    label: 'Team',
                    render: (team) => team || 'No team'
                  },
                  {
                    key: 'id',
                    label: 'Actions',
                    render: (_, user) => (
                      <Button
                        variant="danger"
                        size="sm"
                        icon={Trash2}
                        onClick={() => setConfirmDialog({
                          show: true,
                          title: 'Delete User',
                          message: `Are you sure you want to delete the user "${user.email}"?`,
                          onConfirm: () => {
                            handleDeleteUser(user.id);
                            setConfirmDialog(prev => ({ ...prev, show: false }));
                          }
                        })}
                      >
                        Delete
                      </Button>
                    )
                  }
                ]}
              />
            )}
          </CardContent>
        </Card>
      </div>

      {confirmDialog.show && (
        <ConfirmDialog
          title={confirmDialog.title}
          message={confirmDialog.message}
          onConfirm={confirmDialog.onConfirm}
          onCancel={() => setConfirmDialog(prev => ({ ...prev, show: false }))}
        />
      )}
    </div>
  );
}