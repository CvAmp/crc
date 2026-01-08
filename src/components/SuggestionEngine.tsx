import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card';
import { FormField } from './ui/FormField';
import { Input } from './ui/Input';
import { ThreeWayToggle, TogglePosition } from './ThreeWayToggle';
import { useStore } from '../store';

interface SuggestionEngineProps {
  onFilterChange: (filters: SuggestionFilters) => void;
  productTypeId?: string;
  maxDisplayedSlots?: number;
}

export interface SuggestionFilters {
  date: {
    value: string;
    position: TogglePosition;
  };
  time: {
    value: string;
    position: TogglePosition;
  };
  maxDisplayedSlots?: number;
}

export function SuggestionEngine({ onFilterChange, productTypeId, maxDisplayedSlots = 20 }: SuggestionEngineProps) {
  const [filters, setFilters] = useState<SuggestionFilters>({
    date: {
      value: format(new Date(), 'yyyy-MM-dd'),
      position: 'after'
    },
    time: {
      value: '09:00',
      position: 'after'
    }
  });
  const [minimumHoursNotice, setMinimumHoursNotice] = useState<number | null>(null);
  const [localMaxSlots, setLocalMaxSlots] = useState(maxDisplayedSlots);

  useEffect(() => {
    async function fetchThreshold() {
      if (!productTypeId) return;

      try {
        // For demo purposes, set a default minimum notice period
        const daysNotice = 2;
        const maxSlots = maxDisplayedSlots;

        setMinimumHoursNotice(daysNotice * 24);
        setLocalMaxSlots(maxSlots);

        const minDate = new Date();
        minDate.setDate(minDate.getDate() + daysNotice);
        const newDate = format(minDate, 'yyyy-MM-dd');
        
        if (filters.date.value < newDate) {
          const newFilters = {
            ...filters,
            date: {
              ...filters.date,
              value: newDate
            }
          };
          setFilters(newFilters);
          onFilterChange({
            ...newFilters,
            maxDisplayedSlots: maxSlots
          });
        } else {
          onFilterChange({
            ...filters,
            maxDisplayedSlots: maxSlots
          });
        }
      } catch (err) {
        console.error('Error fetching threshold:', err);
        setMinimumHoursNotice(2 * 24);
        const minDate = new Date();
        minDate.setDate(minDate.getDate() + 2);
        if (filters.date.value < format(minDate, 'yyyy-MM-dd')) {
          const newFilters = {
            ...filters,
            date: {
              ...filters.date,
              value: format(minDate, 'yyyy-MM-dd')
            }
          };
          setFilters(newFilters);
          onFilterChange({
            ...newFilters,
            maxDisplayedSlots
          });
        }
      }
    }
    
    fetchThreshold();
  }, [productTypeId, maxDisplayedSlots]);

  const handleFilterChange = (
    type: 'date' | 'time',
    value: string | TogglePosition,
    isPosition = false
  ) => {
    const newFilters = {
      ...filters,
      [type]: {
        ...filters[type],
        [isPosition ? 'position' : 'value']: value
      }
    };

    if (type === 'date' && !isPosition) {
      const minDate = getMinDate();
      if (value < minDate) {
        return;
      }
    }

    setFilters(newFilters);
    onFilterChange({
      ...newFilters,
      maxDisplayedSlots: localMaxSlots
    });
  };

  const getMinDate = () => {
    if (minimumHoursNotice === null) return format(new Date(), 'yyyy-MM-dd');
    
    const now = new Date();
    now.setDate(now.getDate() + Math.ceil(minimumHoursNotice / 24));
    return format(now, 'yyyy-MM-dd');
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Calendar Suggestions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField label="Date" icon={AlertCircle}>
              <Input
                type="date"
                value={filters.date.value}
                min={getMinDate()}
                onChange={(e) => handleFilterChange('date', e.target.value)}
              />
            </FormField>
            <ThreeWayToggle
              value={filters.date.position}
              onChange={(position) => handleFilterChange('date', position, true)}
              label="Date Filter"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField label="Time" icon={CheckCircle2}>
              <Input
                type="time"
                value={filters.time.value}
                onChange={(e) => handleFilterChange('time', e.target.value)}
              />
            </FormField>
            <ThreeWayToggle
              value={filters.time.position}
              onChange={(position) => handleFilterChange('time', position, true)}
              label="Time Filter"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}