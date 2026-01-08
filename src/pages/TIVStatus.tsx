import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileCheck, Plus, Clock, CheckCircle2, XCircle, AlertCircle, User, FileText, Pencil, Trash2 } from 'lucide-react';
import { useStore } from '../store';
import { Alert } from '../components/ui/Alert'; 
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { Tabs } from '../components/ui/Tabs';
import { Dialog } from '../components/ui/Dialog';
import { FormField } from '../components/ui/FormField';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';

interface TIVRequest {
  id: string;
  customer_name: string;
  sr_id: string;
  so_id: string;
  customer_address: string;
  product_type: string;
  approving_engineer: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  created_by: string;
  created_at: string;
}

export function TIVStatus() {
  const navigate = useNavigate();
  const { user, impersonatedUser } = useStore();
  const [requests, setRequests] = useState<TIVRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showNewRequestModal, setShowNewRequestModal] = useState(false);
  const [editingRequest, setEditingRequest] = useState<TIVRequest | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const store = useStore();
  const [newRequest, setNewRequest] = useState({
    customer_name: '',
    sr_id: '',
    so_id: '',
    customer_address: '',
    product_type: '',
    approving_engineer: ''
  });

  const productTypes = store.productTypes;
  const users = store.users;
  
  // Get engineers for selected product type
  const getEngineersForProductType = (productTypeId: string) => {
    const productType = productTypes.find(pt => pt.id === productTypeId);
    if (!productType?.teamId) return [];
    
    return users.filter(user => 
      user.teamId === productType.teamId && 
      (user.role === 'ENGINEER' || user.role === 'ENGINEER_MANAGER')
    );
  };
  
  const availableEngineers = newRequest.product_type 
    ? getEngineersForProductType(newRequest.product_type)
    : [];

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      // Get requests from local storage
      const storedRequests = JSON.parse(localStorage.getItem('tivRequests') || '[]');
      setRequests(storedRequests);
    } catch (err) {
      console.error('Error fetching requests:', err);
      setError('Failed to load TIV requests');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitRequest = async () => {
    try {
      if (!user) {
        setError('You must be logged in to submit requests');
        return;
      }

      // Validate required fields
      if (!newRequest.customer_name || !newRequest.sr_id || !newRequest.so_id || !newRequest.product_type || !newRequest.approving_engineer) {
        setError('Please fill in all required fields');
        return;
      }

      // Create new request
      const tivRequest: TIVRequest = {
        id: (requests.length + 1).toString(),
        ...newRequest,
        status: 'PENDING',
        created_by: user.id,
        created_at: new Date().toISOString()
      };

      // Add to requests array
      const updatedRequests = [tivRequest, ...requests];
      setRequests(updatedRequests);
      
      // Store in local storage
      localStorage.setItem('tivRequests', JSON.stringify(updatedRequests));

      setSuccess('TIV request submitted successfully');
      setTimeout(() => setSuccess(null), 3000);
      setShowNewRequestModal(false);
      setNewRequest({
        customer_name: '',
        sr_id: '',
        so_id: '',
        customer_address: '',
        product_type: '',
        approving_engineer: ''
      });
    } catch (err) {
      console.error('Error submitting request:', err);
      setError('Failed to submit TIV request');
    }
  };

  const handleEditRequest = async () => {
    if (!editingRequest) return;

    try {
      const updatedRequests = requests.map(request =>
        request.id === editingRequest.id
          ? {
              ...request,
              customer_name: editingRequest.customer_name,
              sr_id: editingRequest.sr_id,
              so_id: editingRequest.so_id,
              customer_address: editingRequest.customer_address,
              product_type: editingRequest.product_type,
              approving_engineer: editingRequest.approving_engineer
            }
          : request
      );

      setRequests(updatedRequests);
      localStorage.setItem('tivRequests', JSON.stringify(updatedRequests));
      
      setSuccess('Request updated successfully');
      setTimeout(() => setSuccess(null), 3000);
      setEditingRequest(null);
    } catch (err) {
      console.error('Error updating request:', err);
      setError('Failed to update request');
    }
  };

  const handleDeleteRequest = async (id: string) => {
    try {
      const updatedRequests = requests.filter(request => request.id !== id);
      setRequests(updatedRequests);
      localStorage.setItem('tivRequests', JSON.stringify(updatedRequests));
      
      setSuccess('Request deleted successfully');
      setTimeout(() => setSuccess(null), 3000);
      setShowDeleteConfirm(null);
    } catch (err) {
      console.error('Error deleting request:', err);
      setError('Failed to delete request');
    }
  };

  const handleUpdateStatus = async (requestId: string, newStatus: TIVRequest['status']) => {
    try {
      const updatedRequests = requests.map(request =>
        request.id === requestId
          ? { ...request, status: newStatus }
          : request
      );
      setRequests(updatedRequests);
      localStorage.setItem('tivRequests', JSON.stringify(updatedRequests));
      
      setSuccess(`Request ${newStatus.toLowerCase()} successfully`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error updating request:', err);
      setError('Failed to update request status');
    }
  };

  const getStatusColor = (status: TIVRequest['status']) => {
    switch (status) {
      case 'APPROVED':
        return 'success';
      case 'REJECTED':
        return 'error';
      default:
        return 'warning';
    }
  };

  const getStatusIcon = (status: TIVRequest['status']) => {
    switch (status) {
      case 'APPROVED':
        return CheckCircle2;
      case 'REJECTED':
        return XCircle;
      default:
        return Clock;
    }
  };

  const filteredRequests = requests.filter(request => {
    if (statusFilter === 'all') return true;
    return request.status === statusFilter;
  });

  // Get the effective user ID (impersonated user or actual user)
  const effectiveUserId = impersonatedUser?.id !== 'role' ? impersonatedUser?.id : user?.id;

  const myTasks = requests.filter(request => 
    request.approving_engineer === effectiveUserId && request.status === 'PENDING'
  );

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
            <FileCheck className="h-6 w-6 text-amber-600" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">TIV Status</h1>
            <p className="text-sm text-gray-500">Track and manage TIV requests</p>
          </div>
        </div>
        <Button
          onClick={() => setShowNewRequestModal(true)}
          icon={Plus}
        >
          New TIV Request
        </Button>
      </div>

      {error && <Alert type="error" message={error} />}
      {success && <Alert type="success" message={success} />}

      <div className="bg-white shadow-lg rounded-lg">
        <Tabs
          tabs={[
            {
              id: 'all',
              label: 'All Requests',
              icon: FileText,
              content: (
                <div className="p-6 space-y-4">
                  <div className="flex items-center space-x-4 mb-6">
                    <Select
                      className="w-1/2"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      options={[
                        { value: 'all', label: 'All Status' },
                        { value: 'PENDING', label: 'Pending' },
                        { value: 'APPROVED', label: 'Approved' },
                        { value: 'REJECTED', label: 'Rejected' }
                      ]}
                    />
                  </div>

                  {loading ? (
                    <LoadingSpinner />
                  ) : filteredRequests.length === 0 ? (
                    <div className="text-center py-12">
                      <FileCheck className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No TIV requests</h3>
                      <p className="mt-1 text-sm text-gray-500">Get started by creating a new request.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredRequests.map((request) => {
                        const StatusIcon = getStatusIcon(request.status);
                        const requestingUser = users.find(u => u.id === request.created_by);
                        const productType = productTypes.find(pt => pt.id === request.product_type);
                        const approvingEngineer = users.find(u => u.id === request.approving_engineer);
                        const createdAt = new Date(request.created_at);

                        return (
                          <div
                            key={request.id}
                            className="relative flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                          >
                            <div className="flex-1 space-y-2">
                              {/* First Row: Status, Request ID, Customer */}
                              <div className="flex items-center space-x-3">
                                <Badge variant={getStatusColor(request.status)}>
                                  <StatusIcon className="w-4 h-4 mr-1" />
                                  {request.status}
                                </Badge>
                                <span className="text-sm font-medium text-gray-500">
                                  Request #{request.id}
                                </span>
                                <span className="text-sm font-medium text-gray-900">
                                  {request.customer_name}
                                </span>
                              </div>
                              
                              {/* Second Row: Product Type, Approving Engineer */}
                              <div className="text-sm text-gray-600">
                                <span className="font-medium">{productType?.name}</span>
                                <span className="mx-2">•</span>
                                <span>Approving Engineer: {approvingEngineer?.email}</span>
                              </div>
                              
                              {/* Third Row: SR ID, SO ID, Customer Address */}
                              <div className="text-sm text-gray-500">
                                <span>SR ID: {request.sr_id}</span>
                                <span className="mx-2">•</span>
                                <span>SO ID: {request.so_id}</span>
                                <span className="mx-2">•</span>
                                <span>Address: {request.customer_address}</span>
                              </div>
                              
                              {/* Fourth Row: Requesting User, Date, Time */}
                              <div className="text-sm text-gray-500">
                                <span>Requested by: {requestingUser?.email}</span>
                                <span className="mx-2">•</span>
                                <span>{createdAt.toLocaleDateString()}</span>
                                <span className="mx-2">•</span>
                                <span>{createdAt.toLocaleTimeString()}</span>
                              </div>
                            </div>
                            {/* Action Buttons */}
                            <div className="flex items-center space-x-2 ml-4">
                              <Button
                                variant="ghost"
                                size="sm"
                                icon={Pencil}
                                onClick={() => setEditingRequest(request)}
                              >
                                Edit
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                icon={Trash2}
                                onClick={() => setShowDeleteConfirm(request.id)}
                              >
                                Delete
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )
            },
            {
              id: 'tasks',
              label: 'My Tasks',
              icon: User,
              content: (
                <div className="p-6 space-y-4">
                  {myTasks.length === 0 ? (
                    <div className="text-center py-12">
                      <CheckCircle2 className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No pending tasks</h3>
                      <p className="mt-1 text-sm text-gray-500">You're all caught up!</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {myTasks.map((task) => (
                        <div
                          key={task.id}
                          className="bg-white shadow rounded-lg p-4 hover:shadow-md transition-shadow"
                        >
                          <div className="flex justify-between items-start">
                            <div className="space-y-1">
                              <div className="flex items-center space-x-2">
                                <span className="font-medium text-gray-900">
                                  {task.customer_name}
                                </span>
                                <Badge variant="warning">
                                  <Clock className="w-4 h-4 mr-1" />
                                  PENDING
                                </Badge>
                                <span className="text-sm text-gray-500">
                                  Request #{task.id}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600">
                                SR ID: {task.sr_id} | SO ID: {task.so_id}
                                <br />
                                Product Type: {productTypes.find(pt => pt.id === task.product_type)?.name}
                              </p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() => handleUpdateStatus(task.id, 'REJECTED')}
                              >
                                Reject
                              </Button>
                              <Button
                                variant="success"
                                size="sm"
                                onClick={() => handleUpdateStatus(task.id, 'APPROVED')}
                              >
                                Approve
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            }
          ]}
        />
      </div>

      {/* New Request Modal */}
      {(showNewRequestModal || editingRequest) && (
        <Dialog
          open={true}
          onClose={() => {
            setShowNewRequestModal(false);
            setEditingRequest(null);
          }}
          title={editingRequest ? "Edit TIV Request" : "New TIV Request"}
          maxWidth="md"
        >
          <div className="space-y-4">
            <FormField label="Customer Name" required>
              <Input
                type="text"
                value={editingRequest?.customer_name || newRequest.customer_name}
                onChange={(e) => editingRequest ? setEditingRequest({
                  ...editingRequest,
                  customer_name: e.target.value
                }) : setNewRequest(prev => ({
                  ...prev,
                  customer_name: e.target.value
                }))}
                required
              />
            </FormField>

            <div className="grid grid-cols-2 gap-4">
              <FormField label="SR ID" required>
                <Input
                  type="text"
                  value={editingRequest?.sr_id || newRequest.sr_id}
                  onChange={(e) => editingRequest ? setEditingRequest({
                    ...editingRequest,
                    sr_id: e.target.value
                  }) : setNewRequest(prev => ({
                    ...prev,
                    sr_id: e.target.value
                  }))}
                  required
                />
              </FormField>

              <FormField label="SO ID" required>
                <Input
                  type="text"
                  value={editingRequest?.so_id || newRequest.so_id}
                  onChange={(e) => editingRequest ? setEditingRequest({
                    ...editingRequest,
                    so_id: e.target.value
                  }) : setNewRequest(prev => ({
                    ...prev,
                    so_id: e.target.value
                  }))}
                  required
                />
              </FormField>
            </div>

            <FormField label="Customer Address" required>
              <Input
                type="text"
                value={editingRequest?.customer_address || newRequest.customer_address}
                onChange={(e) => editingRequest ? setEditingRequest({
                  ...editingRequest,
                  customer_address: e.target.value
                }) : setNewRequest(prev => ({
                  ...prev,
                  customer_address: e.target.value
                }))}
                required
              />
            </FormField>

            <FormField label="Product Type" required>
              <Select
                value={editingRequest?.product_type || newRequest.product_type}
                onChange={(e) => editingRequest ? setEditingRequest({
                  ...editingRequest,
                  product_type: e.target.value,
                  approving_engineer: ''
                }) : setNewRequest(prev => ({
                  ...prev,
                  product_type: e.target.value,
                  // Clear engineer selection when product type changes
                  approving_engineer: ''
                }))}
                options={[
                  { value: '', label: 'Select a product type' },
                  ...productTypes.map(type => ({
                    value: type.id,
                    label: type.name
                  }))
                ]}
                required
              />
            </FormField>

            <FormField label="Approving Engineer" required>
              <Select
                value={editingRequest?.approving_engineer || newRequest.approving_engineer}
                disabled={!(editingRequest?.product_type || newRequest.product_type)}
                onChange={(e) => editingRequest ? setEditingRequest({
                  ...editingRequest,
                  approving_engineer: e.target.value
                }) : setNewRequest(prev => ({
                  ...prev,
                  approving_engineer: e.target.value
                }))}
                options={[
                  { value: '', label: 'Select an engineer' },
                  ...availableEngineers.map(engineer => ({
                    value: engineer.id,
                    label: engineer.email
                  }))
                ]}
                required
              />
            </FormField>

            <div className="flex justify-end space-x-3 pt-4">
              <Button
                variant="ghost"
                onClick={() => {
                  setShowNewRequestModal(false);
                  setEditingRequest(null);
                }}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={editingRequest ? handleEditRequest : handleSubmitRequest}
              >
                {editingRequest ? 'Save Changes' : 'Submit Request'}
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
          title="Confirm Delete"
          maxWidth="sm"
        >
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-amber-600">
              <AlertCircle className="w-5 h-5" />
              <p>Are you sure you want to delete this request? This action cannot be undone.</p>
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