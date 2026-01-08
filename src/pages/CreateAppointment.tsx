import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, parseISO, addDays } from 'date-fns';
import { AlertCircle, Building2 } from 'lucide-react';
import { useStore } from '../store';
import { FormField } from '../components/ui/FormField';
import { FSOConfirmationModal } from '../components/FSOConfirmationModal';
import { AppointmentDetails } from '../components/appointment/AppointmentDetails';
import { ProductTypeSelector } from '../components/appointment/ProductTypeSelector';
import { ChangeTypeSelector } from '../components/appointment/ChangeTypeSelector';
import { TimeSlotSelector } from '../components/appointment/TimeSlotSelector';
import { Select } from '../components/ui/Select';
import { Alert } from '../components/ui/Alert';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { SuggestionEngine, SuggestionFilters } from '../components/SuggestionEngine';
import { useAppointmentForm } from '../hooks/useAppointmentForm';
import { useChangeTypes } from '../hooks/useChangeTypes';
import { createAppointmentAction } from '../actions/appointment';
import type { Template, TimeSlot } from '../types';

export function CreateAppointment() {
  const navigate = useNavigate();
  const user = useStore((state) => state.user);
  const store = useStore();
  const [teams, setTeams] = useState<{ id: string; name: string; }[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<string>('');
  const [productTypes, setProductTypes] = useState<Array<{ id: string; name: string; }>>([]);
  const [changeTypes, setChangeTypes] = useState<Array<{
    id: string;
    name: string;
    product_type_id: string;
    duration_minutes: number;
    is_exclusive: boolean;
  }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [suggestedSlots, setSuggestedSlots] = useState<TimeSlot[]>([]);
  const [sowTemplate, setSowTemplate] = useState<Template | null>(null);
  const [allowUnavailable, setAllowUnavailable] = useState(false);
  const [showFSOConfirmation, setShowFSOConfirmation] = useState(false);

  const {
    formData,
    selectedSlot,
    error: formError,
    setSelectedSlot,
    updateField,
    handleSubmit
  } = useAppointmentForm({
    onSubmit: async (data, slot) => {
      if (!slot) return;
      
      if (data.needsFsoDispatch) {
        setShowFSOConfirmation(true);
        return;
      }
      
      await createAppointment(data, slot);
    }
  });

  const {
    selectedTypes,
    filteredTypes,
    isChangeTypeDisabled,
    onChangeTypeSelect,
    setSelectedTypes
  } = useChangeTypes(formData.productType, changeTypes);

  // Fetch initial data
  useEffect(() => {
    async function fetchData() {
      try {
        setTeams(store.teams);
        setProductTypes(selectedTeam ? store.productTypes.filter(pt => pt.teamId === selectedTeam) : []);
        setChangeTypes(store.changeTypes);
      } catch (err) {
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [store.teams, store.productTypes, store.changeTypes, selectedTeam]);

  // Fetch SOW template
  useEffect(() => {
    const activeTemplate = store.templates.find(t => t.type === 'sow' && t.is_active);
    setSowTemplate(activeTemplate || null);
  }, [store.templates]);

  // Update SOW details when relevant fields change
  useEffect(() => {
    if (!sowTemplate || !formData.needsFsoDispatch) {
      updateField('sowDetails', '');
      return;
    }

    let content = sowTemplate.content;
    
    content = content.replace('{Notes}', formData.notes || '');
    content = content.replace('{Bridge}', formData.bridge || '');
    content = content.replace('{EventDate}', selectedSlot ? format(parseISO(selectedSlot.startTime), 'MMMM d, yyyy') : '');
    content = content.replace('{EventStartTime}', selectedSlot ? format(parseISO(selectedSlot.startTime), 'h:mm a') : '');
    content = content.replace('{EventEndTime}', selectedSlot ? format(parseISO(selectedSlot.endTime), 'h:mm a') : '');
    content = content.replace('{CustomerName}', formData.customerName);
    content = content.replace('{CustomerAddress}', formData.customerAddress);
    content = content.replace('{SRID}', formData.srId);
    content = content.replace('{SOID}', formData.orderId);
    content = content.replace('{ProductType}', productTypes.find(p => p.id === formData.productType)?.name || '');
    content = content.replace('{ChangeTypes}', selectedTypes
      .map(id => changeTypes.find(ct => ct.id === id)?.name)
      .filter(Boolean)
      .join(', '));

    updateField('sowDetails', content);
  }, [
    sowTemplate,
    formData.needsFsoDispatch,
    formData.notes,
    formData.bridge,
    selectedSlot,
    formData.customerName,
    formData.customerAddress,
    formData.srId,
    formData.orderId,
    formData.productType,
    selectedTypes,
    productTypes,
    changeTypes,
    updateField
  ]);

  // Memoize handleFilterChange to prevent unnecessary recreations
  const handleFilterChange = useCallback((filters: SuggestionFilters) => {
    try {
      setError(null);

      // Validate team and product type are selected
      if (!selectedTeam) {
        setError('Please select a team first');
        return;
      }

      if (!formData.productType) {
        setError('Please select a product type first');
        return;
      }

      // Generate mock slots for demonstration
      const startDate = parseISO(`${filters.date.value}T00:00:00`);
      const slots: TimeSlot[] = [];
      
      // Generate slots for 5 days
      for (let day = 0; day < 5; day++) {
        const currentDate = addDays(startDate, day);
        
        // Generate slots for business hours (9 AM - 5 PM)
        for (let hour = 9; hour < 17; hour++) {
          for (let minute = 0; minute < 60; minute += 30) {
            const slotDate = new Date(currentDate);
            slotDate.setHours(hour, minute, 0, 0);
            
            const endDate = new Date(slotDate);
            endDate.setMinutes(endDate.getMinutes() + 30);
            
            // Random capacity and availability
            const capacity = Math.floor(Math.random() * 3) + 1;
            const available = allowUnavailable ? 0 : Math.min(capacity, Math.floor(Math.random() * (capacity + 1)));
            
            // Apply filters
            const slotTime = format(slotDate, 'HH:mm');
            const slotDateStr = format(slotDate, 'yyyy-MM-dd');
            let shouldInclude = true;
            
            // Apply date filter
            if (filters.date.position === 'exact') {
              shouldInclude = slotDateStr === filters.date.value;
            } else if (filters.date.position === 'before') {
              shouldInclude = slotDateStr <= filters.date.value;
            } else if (filters.date.position === 'after') {
              shouldInclude = slotDateStr >= filters.date.value;
            }
            
            // Apply time filter if date filter passed
            if (shouldInclude) {
              if (filters.time.position === 'exact') {
                shouldInclude = slotTime === filters.time.value;
              } else if (filters.time.position === 'before') {
                shouldInclude = slotTime <= filters.time.value;
              } else if (filters.time.position === 'after') {
                shouldInclude = slotTime >= filters.time.value;
              }
            }
            
            if (shouldInclude) {
              slots.push({
                startTime: slotDate.toISOString(),
                endTime: endDate.toISOString(),
                capacity,
                available,
                key: `${slotDate.toISOString()}-${capacity}-${available}`
              });
            }
          }
        }
      }
      
      // Sort slots chronologically
      const sortedSlots = slots.sort((a, b) => 
        new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
      );
      
      // Limit to max displayed slots
      const maxSlots = filters.maxDisplayedSlots || 20;
      setSuggestedSlots(sortedSlots.slice(0, maxSlots));
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred while loading time slots');
      }
    }
  }, [selectedTeam, formData.productType, allowUnavailable]);

  // Trigger calendar suggestions when both product type and change type are selected
  useEffect(() => {
    if (formData.productType && selectedTypes.length > 0) {
      // Update form data with selected change types
      updateField('changeTypes', selectedTypes);
      
      handleFilterChange({
        date: {
          value: format(new Date(), 'yyyy-MM-dd'),
          position: 'after'
        },
        time: {
          value: '09:00',
          position: 'after'
        }
      });
    }
  }, [formData.productType, selectedTypes, handleFilterChange, updateField]);

  const handleChangeTypeSelection = (typeId: string, isChecked: boolean) => {
    if (onChangeTypeSelect) {
      onChangeTypeSelect(typeId, isChecked);
    }
  };

  const createAppointment = async (data: typeof formData, slot: TimeSlot) => {
    try {
      // Use React 19's action to create the appointment
      const result = await createAppointmentAction(data, slot, user?.id);
      
      if (result.success) {
        navigate('/');
      } else {
        setError('Failed to create appointment');
      }
    } catch (err) {
      setError('Failed to create appointment. Please try again.');
      console.error('Error creating appointment:', err);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white shadow-lg rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Create Appointment
        </h1>
        
        {/* Team Selection */}
        <div className="mb-6">
          <FormField 
            label="Team" 
            required 
            icon={Building2}
            error={error && !selectedTeam ? 'Please select a team' : undefined}
          >
            <Select
              value={selectedTeam}
              onChange={(e) => {
                const newTeam = e.target.value;
                setSelectedTeam(newTeam);
                updateField('productType', '');
                setSelectedTypes([]);
              }}
              options={[
                { value: '', label: 'Select a team' },
                ...teams.map(team => ({
                  value: team.id,
                  label: team.name
                }))
              ]}
            />
          </FormField>
        </div>

        {(error || formError) && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md flex items-start">
            <AlertCircle className="w-5 h-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
            <p className="text-red-700">{error || formError}</p>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <ProductTypeSelector
              productTypes={productTypes}
              selectedType={formData.productType}
              onChange={(value) => {
                updateField('productType', value);
                setSelectedTypes([]);
              }}
            />
          </div>

          {selectedTeam && formData.productType && (
            <div className="mb-6">
              <ChangeTypeSelector
                key={formData.productType}
                changeTypes={filteredTypes}
                selectedTypes={selectedTypes}
                onSelect={onChangeTypeSelect}
                isDisabled={isChangeTypeDisabled}
              />
            </div>
          )}

          {formData.productType && selectedTypes.length > 0 && (
            <TimeSlotSelector
              slots={suggestedSlots}
              selectedSlot={selectedSlot}
              onSelectSlot={setSelectedSlot}
              allowUnavailable={allowUnavailable}
              onAllowUnavailableChange={setAllowUnavailable}
              onDateChange={(newDate) => {
                handleFilterChange({
                  date: {
                    value: format(newDate, 'yyyy-MM-dd'),
                    position: 'exact'
                  },
                  time: {
                    value: '09:00',
                    position: 'after'
                  }
                });
              }}
            />
          )}

          <div className="mt-6">
            <AppointmentDetails
              formData={formData}
              onFieldChange={updateField}
            />
          </div>

          <button
            onClick={handleSubmit}
            className="w-full px-4 py-2 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 bg-blue-600 hover:bg-blue-700 focus:ring-blue-500"
          >
            Create Appointment
          </button>
        </div>
      </div>

      {showFSOConfirmation && selectedSlot && (
        <FSOConfirmationModal
          open={showFSOConfirmation}
          onClose={() => setShowFSOConfirmation(false)}
          onConfirm={async () => {
            await createAppointment(formData, selectedSlot);
            setShowFSOConfirmation(false);
          }}
          data={{
            customerName: formData.customerName,
            orderId: formData.orderId,
            srId: formData.srId,
            customerAddress: formData.customerAddress,
            startTime: selectedSlot.startTime,
            endTime: selectedSlot.endTime,
            notes: formData.notes,
            sowDetails: formData.sowDetails,
          }}
        />
      )}
    </div>
  );
}

export default CreateAppointment;