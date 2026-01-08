import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Clock, CheckCircle2, XCircle, AlertCircle, Users } from 'lucide-react';
import { format, addDays, isBefore, parseISO } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';
import { useStore } from '../store';
import { Alert } from '../components/ui/Alert';
import { Button } from '../components/ui/Button';
import { Dialog } from '../components/ui/Dialog';
import { FormField } from '../components/ui/FormField';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { TextArea } from '../components/ui/TextArea';
import { Badge } from '../components/ui/Badge';
import { Tabs } from '../components/ui/Tabs';

interface TimeOffRequest {
  id: string;
  user_id: string;
  start_date: string;
  end_date: string;
  type: 'TIME_OFF';
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  reason: string;
  approver_id?: string;
  approved_at?: string;
  created_at: string;
  start_time?: string;
  end_time?: string;
}

// Helper function to generate IDs
const generateId = () => uuidv4();

export function ShiftSchedule() {
  const { user, impersonatedUser } = useStore();
  const [requests, setRequests] = useState<TimeOffRequest[]>([]);
  const [teamRequests, setTeamRequests] = useState<TimeOffRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showNewRequestModal, setShowNewRequestModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [newRequest, setNewRequest] = useState({
    start_date: format(addDays(new Date(), 1), 'yyyy-MM-dd'),
    end_date: format(addDays(new Date(), 1), 'yyyy-MM-dd'),
    type: 'TIME_OFF' as const,
    start_time: '',
    end_time: '',
    is_full_day: true
  });

  const store = useStore();
  const users = store.users;

  // Get the effective user (impersonated or actual)
  const effectiveUser = impersonatedUser ? users.find(u => u.id === impersonatedUser.id) : user;
  const isManager = effectiveUser?.role === 'ENGINEER_MANAGER' || effectiveUser?.role === 'CPM_MANAGER';

  // Update end date when start date changes if needed
  const handleStartDateChange = (newStartDate: string) => {
    setNewRequest(prev => ({
      ...prev,
      start_date: newStartDate,
      // If end date is before new start date, update it
      end_date: prev.end_date < newStartDate ? newStartDate : prev.end_date
    }));
  };

  useEffect(() => {
    fetchRequests();
  }, [effectiveUser]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      // Get requests from local storage
      const storedRequests = JSON.parse(localStorage.getItem('timeOffRequests') || '[]');
      
      if (effectiveUser) {
        // Filter personal requests
        setRequests(storedRequests.filter((req: TimeOffRequest) => req.user_id === effectiveUser.id));

        // If manager, get team requests
        if (isManager) {
          const teamMembers = users.filter(u => u.teamId === effectiveUser.teamId && u.id !== effectiveUser.id);
          const teamTimeOffRequests = storedRequests.filter((req: TimeOffRequest) => 
            teamMembers.some(member => member.id === req.user_id)
          );
          setTeamRequests(teamTimeOffRequests);
        }
      }
    } catch (err) {
      console.error('Error fetching requests:', err);
      setError('Failed to load time off requests');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitRequest = async () => {
    try {
      setError(null);
      if (!effectiveUser) {
        setError('You must be logged in to submit requests');
        return;
      }

      // Validate dates
      if (isBefore(parseISO(newRequest.end_date), parseISO(newRequest.start_date))) {
        setError('End date cannot be before start date');
        return;
      }

      if (isBefore(parseISO(newRequest.start_date), new Date())) {
        setError('Start date cannot be in the past');
        return;
      }

      // Create new request object
      const newTimeOffRequest = {
        id: generateId(),
        user_id: effectiveUser.id,
        type: 'TIME_OFF',
        // For managers, automatically approve their own requests
        status: isManager ? 'APPROVED' : 'PENDING',
        start_date: newRequest.start_date,
        end_date: newRequest.end_date,
        start_time: newRequest.is_full_day ? undefined : newRequest.start_time || undefined,
        end_time: newRequest.is_full_day ? undefined : newRequest.end_time || undefined,
        reason: '',
        created_at: new Date().toISOString()
      };

      // Add to requests array
      setRequests(prev => [newTimeOffRequest, ...prev]);
      
      // Store the request in local storage
      const existingRequests = JSON.parse(localStorage.getItem('timeOffRequests') || '[]');
      localStorage.setItem('timeOffRequests', JSON.stringify([newTimeOffRequest, ...existingRequests]));

      setSuccess('Time off request submitted successfully');
      setTimeout(() => setSuccess(null), 3000);
      setShowNewRequestModal(false);
      setNewRequest({
        start_date: format(addDays(new Date(), 1), 'yyyy-MM-dd'),
        end_date: format(addDays(new Date(), 1), 'yyyy-MM-dd'),
        type: 'TIME_OFF',
        start_time: '',
        end_time: '',
        is_full_day: true
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit time off request';
      console.error('Error submitting request:', err);
      setError(errorMessage);
    }
  };

  const handleDeleteRequest = async (requestId: string) => {
    try {
      // Get all requests from local storage
      const allRequests = JSON.parse(localStorage.getItem('timeOffRequests') || '[]');
      
      // Filter out the request to delete
      const updatedRequests = allRequests.filter((req: TimeOffRequest) => req.id !== requestId);
      
      // Update local storage
      localStorage.setItem('timeOffRequests', JSON.stringify(updatedRequests));
      
      // Update state
      setRequests(prev => prev.filter(req => req.id !== requestId));
      if (isManager) {
        setTeamRequests(prev => prev.filter(req => req.id !== requestId));
      }
      
      setSuccess('Time off request deleted successfully');
      setTimeout(() => setSuccess(null), 3000);
      setShowDeleteConfirm(null);
    } catch (err) {
      console.error('Error deleting request:', err);
      setError('Failed to delete time off request');
    }
  };

  const handleUpdateStatus = async (requestId: string, newStatus: TimeOffRequest['status']) => {
    try {
      // Get all requests from local storage
      const allRequests = JSON.parse(localStorage.getItem('timeOffRequests') || '[]');
      
      // Update the request status
      const updatedRequests = allRequests.map((req: TimeOffRequest) => 
        req.id === requestId 
          ? {
              ...req,
              status: newStatus,
              approver_id: effectiveUser?.id,
              approved_at: new Date().toISOString()
            }
          : req
      );
      
      // Update local storage
      localStorage.setItem('timeOffRequests', JSON.stringify(updatedRequests));
      
      // Update state
      setTeamRequests(prev => prev.map(req => 
        req.id === requestId
          ? {
              ...req,
              status: newStatus,
              approver_id: effectiveUser?.id,
              approved_at: new Date().toISOString()
            }
          : req
      ));
      
      setSuccess(`Request ${newStatus.toLowerCase()} successfully`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error updating request:', err);
      setError('Failed to update request status');
    }
  };

  const getStatusColor = (status: TimeOffRequest['status']) => {
    switch (status) {
      case 'APPROVED':
        return 'success';
      case 'REJECTED':
        return 'error';
      default:
        return 'warning';
    }
  };

  const getStatusIcon = (status: TimeOffRequest['status']) => {
    switch (status) {
      case 'APPROVED':
        return CheckCircle2;
      case 'REJECTED':
        return XCircle;
      default:
        return Clock;
    }
  };

  const renderRequest = (request: TimeOffRequest, showActions: boolean = false) => {
    const StatusIcon = getStatusIcon(request.status);
    const requestUser = users.find(u => u.id === request.user_id);

    return (
      <div
        key={request.id}
        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
      >
        <div className="flex-1">
          <div className="flex items-center space-x-3">
            <Badge variant={getStatusColor(request.status)}>
              <StatusIcon className="w-4 h-4 mr-1" />
              {request.status}
            </Badge>
            {requestUser && (
              <span className="text-sm font-medium text-gray-900">
                {requestUser.email}
              </span>
            )}
          </div>
          <div className="mt-1 text-sm text-gray-500">
            {format(parseISO(request.start_date), 'MMM d, yyyy')} - {format(parseISO(request.end_date), 'MMM d, yyyy')}
            {request.start_time && request.end_time && (
              <span className="ml-2">
                ({request.start_time} - {request.end_time})
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right text-sm text-gray-500">
            <div>Submitted {format(parseISO(request.created_at), 'MMM d, yyyy')}</div>
            {request.status !== 'PENDING' && request.approved_at && (
              <div>
                {request.status} {format(parseISO(request.approved_at), 'MMM d, yyyy')}
              </div>
            )}
          </div>
          {showActions && request.status === 'PENDING' && (
            <div className="flex items-center space-x-2">
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleUpdateStatus(request.id, 'APPROVED')}
                className="bg-blue-600 text-white hover:bg-blue-700"
              >
                Approve
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => handleUpdateStatus(request.id, 'REJECTED')}
              >
                Reject
              </Button>
            </div>
          )}
          {!showActions && request.status === 'PENDING' && !isManager && (
            <Button
              variant="danger"
              size="sm"
              onClick={() => setShowDeleteConfirm(request.id)}
            >
              Delete
            </Button>
          )}
        </div>
      </div>
    );
  };

  // Determine which tabs to show and their order
  const tabs = isManager ? [
    // Show team requests first for managers
    {
      id: 'team-requests',
      label: 'Team Requests',
      icon: Users,
      content: (
        <div className="p-6 space-y-4">
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : teamRequests.length === 0 ? (
            <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No team requests</h3>
              <p className="mt-1 text-sm text-gray-500">Your team members haven't submitted any time off requests.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {teamRequests.map(request => renderRequest(request, true))}
            </div>
          )}
        </div>
      )
    },
    // Show entered time off second for managers
    {
      id: 'entered-time-off',
      label: 'Entered Time Off',
      icon: Calendar,
      content: (
        <div className="p-6 space-y-4">
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No time off entered</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by entering time off.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map(request => renderRequest(request))}
            </div>
          )}
        </div>
      )
    }
  ] : [
    // For non-managers, just show their requests
    {
      id: 'my-requests',
      label: 'My Requests',
      icon: Calendar,
      content: (
        <div className="p-6 space-y-4">
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No time off requests</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by creating a new request.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map(request => renderRequest(request))}
            </div>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
            <Calendar className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Shift Schedule</h1>
            <p className="text-sm text-gray-500">View and manage your upcoming shifts</p>
          </div>
        </div>
        <Button
          onClick={() => setShowNewRequestModal(true)}
          icon={Plus}
        >
          Request Time Off
        </Button>
      </div>

      {error && <Alert type="error" message={error} />}
      {success && <Alert type="success" message={success} />}

      <div className="bg-white shadow-lg rounded-lg">
        <Tabs tabs={tabs} />
      </div>

      {/* New Request Modal */}
      {showNewRequestModal && (
        <Dialog
          open={true}
          onClose={() => setShowNewRequestModal(false)}
          title="Request Time Off"
          maxWidth="md"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Start Date" required>
                <Input
                  type="date"
                  value={newRequest.start_date}
                  onChange={(e) => handleStartDateChange(e.target.value)}
                  min={format(addDays(new Date(), 1), 'yyyy-MM-dd')}
                  required
                />
              </FormField>

              <FormField label="End Date" required>
                <Input
                  type="date"
                  value={newRequest.end_date}
                  onChange={(e) => setNewRequest(prev => ({
                    ...prev,
                    end_date: e.target.value
                  }))}
                  min={newRequest.start_date}
                  required
                />
              </FormField>

              <FormField label="Full Day" className="col-span-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={newRequest.is_full_day}
                    onChange={(e) => setNewRequest(prev => ({
                      ...prev,
                      is_full_day: e.target.checked,
                      start_time: e.target.checked ? '' : prev.start_time,
                      end_time: e.target.checked ? '' : prev.end_time
                    }))}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Full day request</span>
                </label>
              </FormField>

              {!newRequest.is_full_day && (
                <>
                  <FormField label="Start Time" required>
                    <Input
                      type="time"
                      value={newRequest.start_time}
                      onChange={(e) => setNewRequest(prev => ({
                        ...prev,
                        start_time: e.target.value
                      }))}
                      required
                    />
                  </FormField>

                  <FormField label="End Time" required>
                    <Input
                      type="time"
                      value={newRequest.end_time}
                      onChange={(e) => setNewRequest(prev => ({
                        ...prev,
                        end_time: e.target.value
                      }))}
                      required
                    />
                  </FormField>
                </>
              )}
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button
                variant="ghost"
                onClick={() => setShowNewRequestModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleSubmitRequest}
              >
                Submit Request
              </Button>
            </div>
          </div>
        </Dialog>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <Dialog
          open={true}
          onClose={() => setShowDeleteConfirm(null)}
          title="Delete Time Off Request"
          maxWidth="sm"
        >
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-amber-600">
              <AlertCircle className="w-5 h-5" />
              <p>Are you sure you want to delete this time off request? This action cannot be undone.</p>
            </div>
            
            <div className="flex justify-end space-x-3 pt-4">
              <Button
                variant="ghost"
                onClick={() => setShowDeleteConfirm(null)}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={() => handleDeleteRequest(showDeleteConfirm)}
              >
                Delete Request
              </Button>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
}