import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Package, 
  List, 
  CheckSquare, 
  Clock, 
  Search, 
  Filter, 
  ChevronDown, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  Zap
} from 'lucide-react';
import { useStore } from '../store';
import { Alert } from '../components/ui/Alert';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { Tabs } from '../components/ui/Tabs';
import { AccelerationTable } from '../components/accelerations/AccelerationTable';
import { EditModal } from '../components/accelerations/EditModal';
import { DeleteModal } from '../components/accelerations/DeleteModal';
import { Button } from '../components/ui/Button';
import type { Column, Acceleration } from '../components/accelerations/types';

interface TaskItem extends Acceleration {
  priority_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  approval_status: 'PENDING' | 'APPROVED' | 'REJECTED';
  due_date?: string;
  approver_name?: string;
}

const statusColors = {
  PENDING: { bg: 'bg-yellow-50', text: 'text-yellow-700', icon: Clock },
  APPROVED: { bg: 'bg-green-50', text: 'text-green-700', icon: CheckCircle2 },
  REJECTED: { bg: 'bg-red-50', text: 'text-red-700', icon: XCircle },
};

const priorityColors = {
  URGENT: 'text-red-600 bg-red-50',
  HIGH: 'text-orange-600 bg-orange-50',
  MEDIUM: 'text-yellow-600 bg-yellow-50',
  LOW: 'text-blue-600 bg-blue-50',
};

export function Accelerations() {
  const navigate = useNavigate();
  const store = useStore();
  const [accelerations, setAccelerations] = useState<Acceleration[]>([]);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [requiredFields, setRequiredFields] = useState<string[]>([]);
  const [sortField, setSortField] = useState<keyof Acceleration>('id');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [editingAcceleration, setEditingAcceleration] = useState<Acceleration | null>(null);
  const [productTypes, setProductTypes] = useState<{ id: string; name: string; }[]>([]);
  const [changeTypes, setChangeTypes] = useState<{ id: string; name: string; product_type_id: string; }[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editFormData, setEditFormData] = useState({
    customerName: '',
    soId: '',
    srId: '',
    siteAddress: '',
    productType: '',
    changeTypes: [] as string[]
  });
  const [lastRefresh, setLastRefresh] = useState(Date.now());
  
  const [columns, setColumns] = useState<Column[]>([
    { key: 'id', label: 'ID', width: '80px' },
    { key: 'customer_name', label: 'Customer Name' },
    { key: 'order_id', label: 'Order ID', width: '120px' },
    { key: 'sr_id', label: 'SR ID', width: '120px' },
    { key: 'site_address', label: 'Site Address' },
    { key: 'product_type_name', label: 'Product Type' },
    { key: 'created_at', label: 'Created At', width: '180px' }
  ]);
  
  const [draggedColumn, setDraggedColumn] = useState<number | null>(null);

  const [taskSortField, setTaskSortField] = useState<keyof TaskItem>('created_at');
  const [taskSortDirection, setTaskSortDirection] = useState<'asc' | 'desc'>('desc');
  const [taskFilter, setTaskFilter] = useState({
    status: 'all',
    priority: 'all'
  });

  useEffect(() => {
    fetchAccelerations();
    fetchTypes();
    fetchRequiredFields();
    fetchTasks();
  }, [lastRefresh]);

  const fetchTasks = async () => {
    try {
      // Get tasks from store
      const tasks = store.accelerations
        .filter(acc => acc.created_by === store.user?.id)
        .map(acc => ({
          ...acc,
          product_type_name: store.productTypes.find(pt => pt.id === acc.product_type)?.name || 'Unknown Product',
          priority_level: 'MEDIUM' as const,
          approval_status: 'PENDING' as const
        }));
      
      setTasks(tasks);
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setError('Failed to load tasks');
    }
  };

  const handleTaskAction = async (taskId: number, action: 'APPROVED' | 'REJECTED', comment?: string) => {
    try {
      store.updateAcceleration(taskId, { approval_status: action });

      setSuccess(`Task ${action.toLowerCase()} successfully`);
      setTimeout(() => setSuccess(null), 3000);
      fetchTasks();
    } catch (err) {
      console.error('Error updating task:', err);
      setError('Failed to update task');
    }
  };

  const handleNewAcceleration = async (newAcceleration: any) => {
    try {
      // Process the new acceleration
      const processedAcceleration = {
        ...newAcceleration,
        product_type_name: store.productTypes.find(pt => pt.id === newAcceleration.product_type)?.name || 'Unknown Product',
        change_type_names: newAcceleration.change_types.map(
          (ctId: string) => changeTypes.find(ct => ct.id === ctId)?.name
        ).filter(Boolean) || []
      };

      setAccelerations(prev => [processedAcceleration, ...prev]);
    } catch (err) {
      console.error('Error processing new acceleration:', err);
    }
  };

  const handleUpdatedAcceleration = async (updatedAcceleration: any) => {
    try {
      // Process the updated acceleration
      const processedAcceleration = {
        ...updatedAcceleration,
        product_type_name: store.productTypes.find(pt => pt.id === updatedAcceleration.product_type)?.name || 'Unknown Product',
        change_type_names: updatedAcceleration.change_types.map(
          (ctId: string) => changeTypes.find(ct => ct.id === ctId)?.name
        ).filter(Boolean) || []
      };

      setAccelerations(prev => 
        prev.map(acc => 
          acc.id === updatedAcceleration.id ? processedAcceleration : acc
        )
      );
    } catch (err) {
      console.error('Error processing updated acceleration:', err);
    }
  };

  const handleDeletedAcceleration = (deletedId: number) => {
    setAccelerations(prev => prev.filter(acc => acc.id !== deletedId));
  };

  const fetchRequiredFields = async () => {
    try {
      setRequiredFields(store.accelerationFields
        .filter(field => field.required || field.show_in_create_form)
        .map(field => field.name)
      );
    } catch (err) {
      console.error('Error fetching required fields:', err);
      setError('Failed to load field requirements');
    }
  };

  const fetchTypes = async () => {
    try {
      setProductTypes(store.productTypes);
      setChangeTypes(store.changeTypes);
    } catch (err) {
      console.error('Error fetching types:', err);
      setError('Failed to load form options');
    }
  };

  const fetchAccelerations = async () => {
    try {
      const processedAccelerations = store.accelerations.map(acc => ({
        ...acc,
        product_type_name: store.productTypes.find(pt => pt.id === acc.product_type)?.name || 'Unknown Product',
        change_type_names: acc.change_types.map(
          ctId => changeTypes.find(ct => ct.id === ctId)?.name
        ).filter(Boolean) || []
      }));

      setAccelerations(processedAccelerations);
    } catch (err) {
      console.error('Error fetching accelerations:', err);
      setError('Failed to load accelerations');
    } finally {
      setLoading(false);
    }
  };

  // Add function to manually refresh data
  const refreshData = () => {
    setLastRefresh(Date.now());
  };

  const handleSort = (field: keyof Acceleration) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleEdit = (acceleration: Acceleration) => {
    setEditingAcceleration(acceleration);
    setEditFormData({
      customerName: acceleration.customer_name || '',
      soId: acceleration.order_id || '',
      srId: acceleration.sr_id || '',
      siteAddress: acceleration.site_address || '',
      productType: acceleration.product_type || '',
      changeTypes: acceleration.change_types || []
    });
  };

  const handleUpdate = async () => {
    if (!editingAcceleration) return;

    // Validate required fields
    const missingFields = requiredFields.filter(field => {
      switch (field) {
        case 'customer_name':
          return !editFormData.customerName.trim();
        case 'order_id':
          return !editFormData.soId.trim();
        case 'sr_id':
          return !editFormData.srId.trim();
        case 'site_address':
          return !editFormData.siteAddress.trim();
        case 'product_type':
          return !editFormData.productType;
        case 'change_types':
          return editFormData.changeTypes.length === 0;
        default:
          return false;
      }
    });

    if (missingFields.length > 0) {
      setError(`Please fill in all required fields: ${missingFields.join(', ')}`);
      return;
    }

    try {
      store.updateAcceleration(editingAcceleration.id, {
        customer_name: editFormData.customerName,
        order_id: editFormData.soId,
        sr_id: editFormData.srId,
        site_address: editFormData.siteAddress,
        product_type: editFormData.productType,
        change_types: editFormData.changeTypes
      });

      setSuccess('Acceleration updated successfully');
      setTimeout(() => setSuccess(null), 3000);
      setEditingAcceleration(null);
      refreshData();
    } catch (err) {
      console.error('Error updating acceleration:', err);
      setError('Failed to update acceleration');
    }
  };

  const handleDelete = async () => {
    if (!editingAcceleration) return;
    const accelerationId = editingAcceleration.id;

    try {
      store.removeAcceleration(accelerationId);

      // Update local state immediately
      setAccelerations(prev => prev.filter(acc => acc.id !== accelerationId));

      setSuccess('Acceleration deleted successfully');
      setTimeout(() => setSuccess(null), 3000);
      setShowDeleteConfirm(false);
      setEditingAcceleration(null);
    } catch (err) {
      console.error('Error deleting acceleration:', err);
      setError('Failed to delete acceleration');
      // Refresh the list in case of error to ensure consistency
      refreshData();
    }
  };

  const handleDragStart = (index: number) => {
    setDraggedColumn(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedColumn === null) return;

    const newColumns = [...columns];
    const draggedItem = newColumns[draggedColumn];
    newColumns.splice(draggedColumn, 1);
    newColumns.splice(index, 0, draggedItem);
    setColumns(newColumns);
    setDraggedColumn(index);
  };

  const handleDragEnd = () => {
    setDraggedColumn(null);
  };

  const sortedAccelerations = [...accelerations].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];
    const direction = sortDirection === 'asc' ? 1 : -1;
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return aValue.localeCompare(bValue) * direction;
    }
    return ((aValue as any) - (bValue as any)) * direction;
  });

  const filteredAccelerations = accelerations.filter(acc => {
    const matchesSearch = 
      acc.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      acc.order_id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || acc.approval_status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || acc.priority_level === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  if (loading) {
    return (
      <LoadingSpinner />
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
            <Zap className="h-6 w-6 text-red-600" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Accelerations</h1>
            <p className="text-sm text-gray-500">Manage and track acceleration requests</p>
          </div>
        </div>
        <Button
          onClick={() => navigate('/create-acceleration')}
          icon={Zap}
          variant="primary"
          className="bg-red-600 hover:bg-red-700"
        >
          New Request
        </Button>
      </div>

      {error && <Alert type="error" message={error} />}
      {success && <Alert type="success" message={success} />}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Filters */}
        <div className="border-b border-gray-200 p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by customer or service order..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex gap-4">
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="appearance-none pl-9 pr-8 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="PENDING">Pending</option>
                  <option value="APPROVED">Approved</option>
                  <option value="REJECTED">Rejected</option>
                </select>
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
              <div className="relative">
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="appearance-none pl-9 pr-8 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Priority</option>
                  <option value="URGENT">Urgent</option>
                  <option value="HIGH">High</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="LOW">Low</option>
                </select>
                <AlertCircle className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
            </div>
          </div>
        </div>

        <Tabs
          tabs={[
            {
              id: 'list',
              label: 'All Requests',
              icon: List,
              content: (
                <div className="space-y-4">
                  {accelerations.length === 0 ? (
                    <div className="text-center py-12">
                      <Package className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No accelerations</h3>
                      <p className="mt-1 text-sm text-gray-500">Get started by creating a new acceleration.</p>
                    </div>
                  ) : (
                    <AccelerationTable
                      columns={columns}
                      accelerations={filteredAccelerations}
                      onEdit={handleEdit}
                      onDragStart={handleDragStart}
                      onDragOver={handleDragOver}
                      onDragEnd={handleDragEnd}
                      draggedColumn={draggedColumn}
                      sortField={sortField}
                      sortDirection={sortDirection}
                      onSort={handleSort}
                    />
                  )}
                </div>
              )
            },
            {
              id: 'tasks',
              label: 'My Tasks',
              icon: CheckSquare,
              content: (
                <div className="space-y-4">
                  {tasks.length === 0 ? (
                    <div className="text-center py-12">
                      <CheckSquare className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No tasks</h3>
                      <p className="mt-1 text-sm text-gray-500">You're all caught up!</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {tasks.map((task) => (
                        <div
                          key={task.id}
                          className="bg-white shadow rounded-lg p-4 hover:shadow-md transition-shadow"
                        >
                          <div className="flex justify-between items-start">
                            <div className="space-y-1">
                              <div className="flex items-center space-x-2">
                                <span className="font-medium text-gray-900">
                                  SO-{task.order_id}
                                </span>
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                  task.priority_level === 'URGENT' ? 'bg-red-100 text-red-800' :
                                  task.priority_level === 'HIGH' ? 'bg-orange-100 text-orange-800' :
                                  task.priority_level === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-green-100 text-green-800'
                                }`}>
                                  {task.priority_level}
                                </span>
                              </div>
                              <p className="text-gray-600">{task.customer_name}</p>
                              <p className="text-sm text-gray-500">{task.product_type_name}</p>
                            </div>
                            {task.approval_status === 'PENDING' && (
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => handleTaskAction(task.id, 'REJECTED')}
                                  className="px-3 py-1.5 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md"
                                >
                                  Reject
                                </button>
                                <button
                                  onClick={() => handleTaskAction(task.id, 'APPROVED')}
                                  className="px-3 py-1.5 text-sm font-medium text-green-600 hover:text-green-700 hover:bg-green-50 rounded-md"
                                >
                                  Approve
                                </button>
                              </div>
                            )}
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

        {editingAcceleration && (
          <EditModal
            acceleration={editingAcceleration}
            editFormData={editFormData}
            onClose={() => setEditingAcceleration(null)}
            onUpdate={handleUpdate}
            onDelete={() => setShowDeleteConfirm(true)}
            onFormChange={(field, value) => setEditFormData(prev => ({ ...prev, [field]: value }))}
            productTypes={productTypes}
            changeTypes={changeTypes}
          />
        )}

        {showDeleteConfirm && (
          <DeleteModal
            onClose={() => setShowDeleteConfirm(false)}
            onConfirm={handleDelete}
          />
        )}
      </div>
    </div>
  );
}