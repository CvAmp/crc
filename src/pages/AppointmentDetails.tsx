import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { 
  Building2, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  User, 
  FileText, 
  Phone, 
  Pencil, 
  Trash2, 
  Copy, 
  Check, 
  Video, 
  RefreshCw, 
  ArrowLeft, 
  MapPin, 
  Package, 
  Settings,
  Calendar as CalendarIcon // Renamed to avoid conflict
} from 'lucide-react';
import { useStore } from '../store';
import { Alert } from '../components/ui/Alert';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { FormField } from '../components/ui/FormField';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Button } from '../components/ui/Button';
import { Dialog } from '../components/ui/Dialog';
import { createTeamsMeeting, formatTeamsBridgeInfo } from '../lib/teams';
import type { CalendarEvent } from '../types';

export function AppointmentDetails() {
  const { id } = useParams();
  const store = useStore();
  const navigate = useNavigate();
  const [event, setEvent] = useState<CalendarEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [productTypeName, setProductTypeName] = useState<string>('');
  const [changeTypeNames, setChangeTypeNames] = useState<string[]>([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeTemplate, setActiveTemplate] = useState<{ id: string; name: string; type: 'email' | 'sow'; content: string; is_active: boolean; } | null>(null);
  const [isRegeneratingMeeting, setIsRegeneratingMeeting] = useState(false);
  const [showCopiedMessage, setShowCopiedMessage] = useState(false);
  const [editFormData, setEditFormData] = useState<{
    customerName: string;
    orderId: string;
    srId: string;
    customerAddress: string;
    bridge: string;
    notes: string;
    needsFsoDispatch: boolean;
    sowDetails: string;
  }>({
    customerName: '',
    orderId: '',
    srId: '',
    customerAddress: '',
    bridge: '',
    notes: '',
    needsFsoDispatch: false,
    sowDetails: ''
  });

  useEffect(() => {
    if (!activeTemplate || !editFormData.needsFsoDispatch || !event) return;

    let content = activeTemplate.content;
    
    content = content.replace('{Notes}', editFormData.notes || '');
    content = content.replace('{Bridge}', editFormData.bridge || '');
    content = content.replace('{EventDate}', format(parseISO(event.startTime), 'MMMM d, yyyy'));
    content = content.replace('{EventStartTime}', format(parseISO(event.startTime), 'h:mm a'));
    content = content.replace('{EventEndTime}', format(parseISO(event.endTime), 'h:mm a'));
    content = content.replace('{CustomerName}', editFormData.customerName);
    content = content.replace('{CustomerAddress}', editFormData.customerAddress);
    content = content.replace('{SRID}', editFormData.srId);
    content = content.replace('{SOID}', editFormData.orderId);
    content = content.replace('{ProductType}', productTypeName);
    content = content.replace('{ChangeTypes}', changeTypeNames.join(', '));

    setEditFormData(prev => ({
      ...prev,
      sowDetails: content
    }));
  }, [
    activeTemplate,
    editFormData.needsFsoDispatch,
    editFormData.notes,
    editFormData.bridge,
    editFormData.customerName,
    editFormData.customerAddress,
    editFormData.srId,
    editFormData.orderId,
    event,
    productTypeName,
    changeTypeNames
  ]);

  const handleRegenerateMeeting = async () => {
    if (!event) return;
    
    try {
      setIsRegeneratingMeeting(true);
      setError(null);
      
      const teamsMeeting = await createTeamsMeeting({
        startTime: event.startTime,
        endTime: event.endTime,
        title: `SO-${event.orderId}`,
        customerName: event.customerName,
        orderId: event.orderId
      });

      await store.updateEvent(event.id, {
        teams_meeting_id: teamsMeeting.id,
        teams_meeting_url: teamsMeeting.joinUrl,
        teams_meeting_created_at: teamsMeeting.createdAt,
        bridge: formatTeamsBridgeInfo(teamsMeeting.joinUrl)
      });

      setSuccess('Teams meeting regenerated successfully');
      setTimeout(() => setSuccess(null), 3000);
      await fetchEventDetails();
    } catch (err) {
      setError('Failed to regenerate Teams meeting');
      console.error('Error regenerating Teams meeting:', err);
    } finally {
      setIsRegeneratingMeeting(false);
    }
  };

  const handleUpdate = async () => {
    if (!event || !editFormData) return;

    try {
      // Validate required fields
      if (!editFormData.customerName.trim() || !editFormData.orderId.trim() || !editFormData.srId.trim() || !editFormData.customerAddress.trim()) {
        setError('Please fill in all required fields');
        return;
      }

      const updates: Partial<CalendarEvent> = {
        customerName: editFormData.customerName,
        orderId: editFormData.orderId,
        srId: editFormData.srId,
        customerAddress: editFormData.customerAddress,
        bridge: editFormData.bridge || undefined,
        notes: editFormData.notes || undefined,
        needsFsoDispatch: editFormData.needsFsoDispatch,
        sowDetails: editFormData.needsFsoDispatch ? editFormData.sowDetails : undefined
      };

      await store.updateEvent(event.id, updates);
      setSuccess('Appointment updated successfully');
      const timer = setTimeout(() => setSuccess(null), 3000);
      setShowEditModal(false);
      await fetchEventDetails();
      return () => clearTimeout(timer);
    } catch (err) {
      setError('Failed to update appointment');
    }
  };

  const handleDelete = async () => {
    if (!event) return;
    try {
      await store.removeEvent(event.id);
      setSuccess('Appointment deleted successfully');
      const timer = setTimeout(() => {
        setSuccess(null);
        navigate('/', { replace: true });
      }, 3000);
      return () => clearTimeout(timer);
    } catch (err) {
      setError('Failed to delete appointment');
    }
  };

  const handleEdit = () => {
    if (!event) return;
    
    setEditFormData({
      customerName: event.customerName,
      orderId: event.orderId,
      srId: event.srId,
      customerAddress: event.customerAddress,
      bridge: event.bridge || '',
      notes: event.notes || '',
      needsFsoDispatch: event.needsFsoDispatch || false,
      sowDetails: event.sowDetails || ''
    });
    setShowEditModal(true);
  };

  const handleCopyUrl = async () => {
    if (!event?.teams_meeting_url) return;
    
    try {
      await navigator.clipboard.writeText(event.teams_meeting_url);
      setShowCopiedMessage(true);
      const timer = setTimeout(() => setShowCopiedMessage(false), 2000);
      return () => clearTimeout(timer);
    } catch (err) {
      console.error('Error copying URL:', err);
      setError('Failed to copy meeting URL');
    }
  };

  const fetchEventDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!id) {
        setNotFound(true);
        return;
      }

      const foundEvent = store.events.find(e => e.id === id);
      if (!foundEvent) {
        setNotFound(true);
        return;
      }

      setEvent(foundEvent);

      const productType = store.productTypes.find(pt => pt.id === foundEvent.productType);
      if (productType) {
        setProductTypeName(productType.name);
      }

      const changeTypeNames = foundEvent.changeTypes
        .map(ctId => store.changeTypes.find(ct => ct.id === ctId)?.name)
        .filter((name): name is string => name !== undefined);
      setChangeTypeNames(changeTypeNames);

    } catch (err) {
      console.error('Error fetching event details:', err);
      setError(err instanceof Error ? err.message : 'Failed to load appointment details');
    } finally {
      setLoading(false);
    }
  };

  const fetchActiveTemplate = async () => {
    // Get active template from store
    const template = store.templates.find(t => t.type === 'sow' && t.is_active);
    setActiveTemplate(template || null);
  };

  useEffect(() => {
    fetchEventDetails();
    fetchActiveTemplate();
  }, [id]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (notFound) {
    return (
      <div className="max-w-3xl mx-auto mt-8 p-6 bg-white rounded-lg shadow-lg">
        <div className="flex items-start space-x-3 text-red-600">
          <AlertCircle className="w-6 h-6 flex-shrink-0" />
          <div>
            <h3 className="font-semibold">Not Found</h3>
            <p className="text-red-600">The requested appointment could not be found</p>
          </div>
        </div>
        <button
          onClick={() => navigate('/')}
          className="mt-4 flex items-center text-blue-600 hover:text-blue-700"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Calendar
        </button>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto mt-8 p-6 bg-white rounded-lg shadow-lg">
        <div className="flex items-start space-x-3 text-red-600">
          <AlertCircle className="w-6 h-6 flex-shrink-0" />
          <div>
            <h3 className="font-semibold">Error</h3>
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!event) return null;

  return (
    <div className="max-w-3xl mx-auto mt-8">
      <button
        onClick={() => navigate('/')}
        className="mb-6 flex items-center text-gray-600 hover:text-gray-800"
      >
        <ArrowLeft className="w-5 h-5 mr-2" />
        Back to Calendar
      </button>
      
      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md">
          <p className="text-green-700">{success}</p>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-6 border-b">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Event ID: {event.event_id}
              </h1>
              <div className="mt-2 flex items-center space-x-3">
                {event.teams_meeting_url && (
                  <>
                    <a
                      href={event.teams_meeting_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-blue-600 hover:text-blue-700"
                    >
                      <Video className="w-4 h-4 mr-1" />
                      Join Teams Meeting
                    </a>
                    <button
                      onClick={handleCopyUrl}
                      className="inline-flex items-center text-gray-600 hover:text-gray-800"
                      title="Copy meeting URL"
                    >
                      {showCopiedMessage ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={handleRegenerateMeeting}
                      disabled={isRegeneratingMeeting}
                      className={`inline-flex items-center text-gray-600 hover:text-gray-800 ${
                        isRegeneratingMeeting ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                      title="Regenerate Teams meeting"
                    >
                      <RefreshCw className={`w-4 h-4 ${
                        isRegeneratingMeeting ? 'animate-spin' : ''
                      }`} />
                    </button>
                  </>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                SO-{event.orderId}
              </span>
              {event.needsFsoDispatch && (
                <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                  FSO Dispatch Required
                </span>
              )}
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleEdit}
                  className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-full"
                >
                  <Pencil className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-full"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Time and Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start space-x-3">
              <CalendarIcon className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <h3 className="font-medium text-gray-900">Date</h3>
                <p className="text-gray-600">
                  {format(parseISO(event.startTime), 'MMMM d, yyyy')}
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <h3 className="font-medium text-gray-900">Time</h3>
                <p className="text-gray-600">
                  {format(parseISO(event.startTime), 'h:mm a')} - {format(parseISO(event.endTime), 'h:mm a')}
                </p>
              </div>
            </div>
          </div>

          {/* Customer Information */}
          <div className="border-t pt-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Customer Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start space-x-3">
                <Building2 className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <h3 className="font-medium text-gray-900">Customer Name</h3>
                  <p className="text-gray-600">{event.customerName}</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <h3 className="font-medium text-gray-900">Site Address</h3>
                  <p className="text-gray-600 whitespace-pre-line">{event.customerAddress}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Service Details */}
          <div className="border-t pt-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Service Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start space-x-3">
                <Package className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <h3 className="font-medium text-gray-900">Product Type</h3>
                  <p className="text-gray-600">{productTypeName}</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Settings className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <h3 className="font-medium text-gray-900">Change Types</h3>
                  <div className="space-y-1">
                    {changeTypeNames.map((name, index) => (
                      <span
                        key={index}
                        className="inline-block px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-sm mr-2 mb-2"
                      >
                        {name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="border-t pt-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Additional Information</h2>
            <div className="space-y-6">
              {event.bridge && (
                <div className="flex items-start space-x-3">
                  <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">Bridge</h3>
                    {event.teams_meeting_url ? (
                      <div className="text-gray-600">
                        <p>Microsoft Teams Meeting</p>
                        <a
                          href={event.teams_meeting_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-700 hover:underline"
                        >
                          Join URL: {event.teams_meeting_url}
                        </a>
                      </div>
                    ) : (
                      <p className="text-gray-600 whitespace-pre-line">{event.bridge}</p>
                    )}
                  </div>
                </div>
              )}
              {event.notes && (
                <div className="flex items-start space-x-3">
                  <FileText className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-gray-900">Notes</h3>
                    <p className="text-gray-600 whitespace-pre-line">{event.notes}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* FSO Details */}
          {event.needsFsoDispatch && event.sowDetails && (
            <div className="border-t pt-6 space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">Scope of Work Details</h2>
              <div className="bg-gray-50 p-4 rounded-lg">
                <pre className="whitespace-pre-wrap text-sm text-gray-600">
                  {event.sowDetails}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <Dialog
          open={true}
          onClose={() => setShowEditModal(false)}
          title="Edit Appointment"
          maxWidth="md"
        >
          <div className="space-y-4">
            <FormField label="Customer Name" required>
              <Input
                type="text"
                required
                value={editFormData.customerName}
                onChange={(e) => setEditFormData(prev => ({
                  ...prev,
                  customerName: e.target.value
                }))}
              />
            </FormField>

            <div className="grid grid-cols-2 gap-4">
              <FormField label="SO ID" required>
                <Input
                  type="text"
                  required
                  pattern="\d{1,10}"
                  value={editFormData.orderId}
                  onChange={(e) => setEditFormData(prev => ({
                    ...prev,
                    orderId: e.target.value
                  }))}
                />
              </FormField>

              <FormField label="SR ID" required>
                <Input
                  type="text"
                  required
                  value={editFormData.srId}
                  onChange={(e) => setEditFormData(prev => ({
                    ...prev,
                    srId: e.target.value
                  }))}
                />
              </FormField>
            </div>

            <FormField label="Site Address" required>
              <Input
                type="text"
                required
                value={editFormData.customerAddress}
                onChange={(e) => setEditFormData(prev => ({
                  ...prev,
                  customerAddress: e.target.value
                }))}
              />
            </FormField>

            <FormField label="Bridge">
              <Input
                type="text"
                value={editFormData.bridge}
                onChange={(e) => setEditFormData(prev => ({
                  ...prev,
                  bridge: e.target.value
                }))}
              />
            </FormField>

            <FormField label="Notes">
              <textarea
                value={editFormData.notes}
                onChange={(e) => setEditFormData(prev => ({
                  ...prev,
                  notes: e.target.value
                }))}
                rows={4}
                className="w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </FormField>

            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={editFormData.needsFsoDispatch}
                  onChange={(e) => {
                    const isChecked = e.target.checked;
                    setEditFormData(prev => ({
                      ...prev,
                      needsFsoDispatch: isChecked,
                      // Clear SOW details if unchecking
                      sowDetails: isChecked ? prev.sowDetails : ''
                    }));
                  }}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  Needs FSO Dispatch
                </span>
              </label>
            </div>

            {editFormData.needsFsoDispatch && (
              <FormField label="Scope of Work Details" required>
                <textarea
                  required
                  value={editFormData.sowDetails}
                  onChange={(e) => setEditFormData(prev => ({
                    ...prev,
                    sowDetails: e.target.value
                  }))}
                  rows={4}
                  className="w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </FormField>
            )}

            <div className="flex justify-end space-x-3 pt-4">
              <Button
                variant="ghost"
                onClick={() => setShowEditModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleUpdate}
              >
                Save Changes
              </Button>
            </div>
          </div>
        </Dialog>
      )}
      
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <Dialog
          open={true}
          onClose={() => setShowDeleteModal(false)}
          title="Confirm Delete"
          maxWidth="sm"
        >
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-amber-600">
              <AlertCircle className="w-5 h-5" />
              <p>Are you sure you want to delete this appointment? This action cannot be undone.</p>
            </div>
            
            <div className="flex justify-end space-x-3 pt-4">
              <Button
                variant="ghost"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleDelete}
              >
                Delete Appointment
              </Button>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
}