# Time Type System API Reference

## Table of Contents

1. [Types](#types)
2. [Constants](#constants)
3. [Type Guards](#type-guards)
4. [Validation Functions](#validation-functions)
5. [Time Manipulation](#time-manipulation)
6. [Bitmap Operations](#bitmap-operations)
7. [Error Types](#error-types)

## Types

### Branded Types

```typescript
type TimeString = string & { __brand: 'TimeString' }
```
A branded type representing a valid time string in 24-hour format (HH:mm).

```typescript
type SlotIndex = number & { __brand: 'SlotIndex' }
```
A branded type representing a valid time slot index (0-47).

### Literal Types

```typescript
type Hour = 0 | 1 | 2 | ... | 22 | 23
```
Union type representing valid hours in 24-hour format.

```typescript
type Minute = 0 | 15 | 30 | 45
```
Union type representing valid minutes in 30-minute increments.

### Interfaces

```typescript
interface TimeComponents {
  hours: Hour;
  minutes: Minute;
}
```
Represents the components of a time value.

```typescript
interface TimeRange {
  startTime: TimeString;
  endTime: TimeString;
}
```
Represents a range of time with validated start and end times.

```typescript
interface TimeSlot {
  index: SlotIndex;
  startTime: TimeString;
  endTime: TimeString;
}
```
Represents a time slot with index and time boundaries.

## Constants

```typescript
const TIME_BOUNDS = {
  HOURS: {
    MIN: 0,
    MAX: 23
  },
  MINUTES: {
    MIN: 0,
    MAX: 59
  },
  SLOTS: {
    MIN: 0,
    MAX: 47
  }
} as const
```
Defines the valid bounds for time components.

## Type Guards

### `isHour`
```typescript
function isHour(value: number): value is Hour
```
Validates if a number is a valid hour (0-23).

**Parameters:**
- `value`: number to validate

**Returns:**
- `true` if value is a valid hour
- `false` otherwise

### `isMinute`
```typescript
function isMinute(value: number): value is Minute
```
Validates if a number is a valid minute (0-59).

**Parameters:**
- `value`: number to validate

**Returns:**
- `true` if value is a valid minute
- `false` otherwise

### `isTimeString`
```typescript
function isTimeString(value: string): value is TimeString
```
Validates if a string is a valid time string (HH:mm).

**Parameters:**
- `value`: string to validate

**Returns:**
- `true` if value is a valid time string
- `false` otherwise

### `isSlotIndex`
```typescript
function isSlotIndex(value: number): value is SlotIndex
```
Validates if a number is a valid slot index (0-47).

**Parameters:**
- `value`: number to validate

**Returns:**
- `true` if value is a valid slot index
- `false` otherwise

## Validation Functions

### `validateTimeString`
```typescript
function validateTimeString(time: string): TimeString
```
Validates and converts a string to a TimeString.

**Parameters:**
- `time`: string in HH:mm format

**Returns:**
- Validated TimeString

**Throws:**
- `TimeFormatError` if format is invalid

### `validateHour`
```typescript
function validateHour(hour: number): Hour
```
Validates and converts a number to an Hour.

**Parameters:**
- `hour`: number between 0 and 23

**Returns:**
- Validated Hour

**Throws:**
- `TimeFormatError` if hour is invalid

### `validateMinute`
```typescript
function validateMinute(minute: number): Minute
```
Validates and converts a number to a Minute.

**Parameters:**
- `minute`: number between 0 and 59

**Returns:**
- Validated Minute

**Throws:**
- `TimeFormatError` if minute is invalid

### `validateTimeRange`
```typescript
function validateTimeRange(
  startTime: TimeString,
  endTime: TimeString,
  allowOvernight?: boolean
): boolean
```
Validates a time range.

**Parameters:**
- `startTime`: Start time
- `endTime`: End time
- `allowOvernight`: Allow ranges crossing midnight (default: false)

**Returns:**
- `true` if range is valid
- `false` otherwise

## Time Manipulation

### `parseTimeString`
```typescript
function parseTimeString(time: TimeString): TimeComponents
```
Parses a TimeString into hours and minutes.

**Parameters:**
- `time`: Valid TimeString

**Returns:**
- TimeComponents object

**Throws:**
- `TimeFormatError` if parsing fails

### `formatTimeString`
```typescript
function formatTimeString(hours: Hour, minutes: Minute): TimeString
```
Formats hours and minutes into a TimeString.

**Parameters:**
- `hours`: Valid Hour
- `minutes`: Valid Minute

**Returns:**
- Formatted TimeString

### `formatTime`
```typescript
function formatTime(time: TimeString): string
```
Formats a TimeString into 12-hour format.

**Parameters:**
- `time`: Valid TimeString

**Returns:**
- Formatted string (e.g., "9:30 AM")

### `addMinutesToTime`
```typescript
function addMinutesToTime(time: TimeString, minutes: number): TimeString
```
Adds minutes to a time.

**Parameters:**
- `time`: Valid TimeString
- `minutes`: Number of minutes to add

**Returns:**
- New TimeString

### `compareTimeStrings`
```typescript
function compareTimeStrings(time1: TimeString, time2: TimeString): number
```
Compares two times.

**Parameters:**
- `time1`: First TimeString
- `time2`: Second TimeString

**Returns:**
- Negative if time1 < time2
- 0 if equal
- Positive if time1 > time2

## Bitmap Operations

### `generateBitmap`
```typescript
function generateBitmap(startTime: string, endTime: string): number[]
```
Generates a bitmap representing time slots.

**Parameters:**
- `startTime`: Start time string
- `endTime`: End time string

**Returns:**
- Array of two numbers representing the bitmap

**Throws:**
- `TimeFormatError` if times are invalid
- `TimeRangeError` if range is invalid

### `timeToSlotIndex`
```typescript
function timeToSlotIndex(time: TimeString): SlotIndex
```
Converts time to slot index.

**Parameters:**
- `time`: Valid TimeString

**Returns:**
- Slot index

**Throws:**
- `SlotIndexError` if conversion fails

### `slotIndexToTime`
```typescript
function slotIndexToTime(index: SlotIndex): TimeString
```
Converts slot index to time.

**Parameters:**
- `index`: Valid SlotIndex

**Returns:**
- TimeString

**Throws:**
- `SlotIndexError` if conversion fails

## Error Types

### `TimeFormatError`
```typescript
class TimeFormatError extends Error
```
Thrown when time format is invalid.

### `TimeRangeError`
```typescript
class TimeRangeError extends Error
```
Thrown when time range is invalid.

### `SlotIndexError`
```typescript
class SlotIndexError extends Error
```
Thrown when slot index is invalid.

## Implementation Notes

### Safety-Critical Design Principles

1. **Rule 1: Simple Control Flow**
   - No recursion or complex branching
   - Linear execution paths
   - Clear entry and exit points
   - Example:
   ```typescript
   // ✅ Simple control flow
   function validateTimeRange(start: TimeString, end: TimeString): boolean {
     const startMinutes = timeToMinutes(start);
     const endMinutes = timeToMinutes(end);
     return startMinutes < endMinutes;
   }
   
   // ❌ Complex control flow
   function validateTimeRangeRecursive(ranges: TimeRange[]): boolean {
     if (ranges.length <= 1) return true;
     return validateTimeRange(ranges[0]) && 
            validateTimeRangeRecursive(ranges.slice(1));
   }
   ```

2. **Rule 2: Fixed Bounds**
   - All loops have static upper bounds
   - Array sizes are fixed and validated
   - Time ranges have explicit limits
   - Example:
   ```typescript
   // ✅ Fixed bounds
   const MAX_SLOTS = 48; // 24 hours * 2 slots
   for (let i = 0; i < MAX_SLOTS; i++) {
     // Process slot
   }
   
   // ❌ Unbounded loop
   while (hasMoreSlots()) {
     // Process slot
   }
   ```

3. **Rule 3: Static Allocation**
   - No dynamic memory allocation after initialization
   - Fixed-size arrays for bitmaps
   - Pre-allocated error objects
   - Example:
   ```typescript
   // ✅ Static allocation
   const bitmap: TimeBitmap = [0, 0];
   
   // ❌ Dynamic allocation
   const bitmap: number[] = new Array(calculateSize());
   ```

4. **Rule 4: Function Size**
   - Each function fits on one screen
   - Single responsibility principle
   - Clear input/output contracts
   - Example:
   ```typescript
   // ✅ Small, focused function
   function validateHour(hour: number): Hour {
     if (!isHour(hour)) {
       throw new TimeFormatError('Invalid hour');
     }
     return hour;
   }
   
   // ❌ Large, multi-purpose function
   function validateAndProcessTime(time: string) {
     // 100+ lines of validation, processing, formatting...
   }
   ```

5. **Rule 5: Assertion Density**
   - Minimum two assertions per function
   - Explicit error recovery paths
   - No unreachable assertions
   - Example:
   ```typescript
   // ✅ Proper assertions
   function timeToSlotIndex(time: TimeString): SlotIndex {
     assert(isTimeString(time), 'Invalid time format');
     const { hours, minutes } = parseTimeString(time);
     const index = hours * 2 + Math.floor(minutes / 30);
     assert(isSlotIndex(index), 'Invalid slot index');
     return index;
   }
   ```

### Memory Management

1. **Static Allocation Strategy**
   ```typescript
   // Pre-allocated error messages
   const ERROR_MESSAGES = {
     INVALID_HOUR: 'Invalid hour value',
     INVALID_MINUTE: 'Invalid minute value',
     INVALID_FORMAT: 'Invalid time format'
   } as const;
   
   // Fixed-size bitmap
   const BITMAP_SIZE = 2;
   ```

2. **Bitmap Implementation**
   ```typescript
   // Two 32-bit integers for 48 slots
   // [0-31] in first integer
   // [32-47] in second integer
   type TimeBitmap = [number, number];
   ```

### Type Safety

1. **Branded Types**
   ```typescript
   // Compile-time type safety
   type TimeString = string & { __brand: 'TimeString' };
   
   // Runtime validation
   function asTimeString(value: string): TimeString {
     if (!isTimeString(value)) {
       throw new TimeFormatError();
     }
     return value as TimeString;
   }
   ```

2. **Exhaustive Type Checking**
   ```typescript
   type Hour = 0 | 1 | 2 | ... | 23;
   
   function isHour(value: number): value is Hour {
     return Number.isInteger(value) && 
            value >= 0 && 
            value <= 23;
   }
   ```

### Error Handling

1. **Error Hierarchy**
   ```typescript
   class TimeError extends Error {
     constructor(message: string) {
       super(message);
       this.name = 'TimeError';
     }
   }
   
   class TimeFormatError extends TimeError {
     constructor(message: string) {
       super(message);
       this.name = 'TimeFormatError';
     }
   }
   ```

2. **Recovery Strategies**
   ```typescript
   function safeParseTime(value: string): TimeString {
     try {
       return validateTimeString(value);
     } catch (error) {
       if (error instanceof TimeFormatError) {
         // Fall back to current time
         const now = new Date();
         return formatTimeString(
           now.getHours() as Hour,
           0 as Minute
         );
       }
       throw error;
     }
   }
   ```

### Performance Optimizations

1. **Bitmap Operations**
   ```typescript
   // O(1) slot availability check
   function isSlotAvailable(
     bitmap: TimeBitmap,
     index: SlotIndex
   ): boolean {
     const arrayIndex = Math.floor(index / 32);
     const bitPosition = index % 32;
     return (bitmap[arrayIndex] & (1 << bitPosition)) !== 0;
   }
   ```

2. **Time Comparisons**
   ```typescript
   // O(1) time comparison
   function compareTimeStrings(
     time1: TimeString,
     time2: TimeString
   ): number {
     const minutes1 = timeToMinutes(time1);
     const minutes2 = timeToMinutes(time2);
     return minutes1 - minutes2;
   }
   ```

### Testing Strategy

1. **Boundary Testing**
   ```typescript
   describe('validateHour', () => {
     it('accepts valid bounds', () => {
       expect(validateHour(0)).toBe(0);
       expect(validateHour(23)).toBe(23);
     });
     
     it('rejects invalid bounds', () => {
       expect(() => validateHour(-1)).toThrow();
       expect(() => validateHour(24)).toThrow();
     });
   });
   ```

2. **Property-Based Testing**
   ```typescript
   test('time string roundtrip', () => {
     fc.assert(fc.property(
       fc.integer(0, 23),
       fc.integer(0, 59),
       (h, m) => {
         const time = formatTimeString(h, m);
         const { hours, minutes } = parseTimeString(time);
         return hours === h && minutes === m;
       }
     ));
   });
   ```

## Safety Notes

1. All functions validate their inputs
2. Type guards ensure type safety
3. Error handling is consistent and specific
4. No side effects in validation functions
5. All bounds are strictly enforced

## Performance Considerations

1. Bitmap operations are O(1)
2. Time comparisons are O(1)
3. Validation is performed once at boundaries
4. Static allocation used where possible
5. No dynamic memory allocation in core operations