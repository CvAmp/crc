# Time Type System Documentation

## Overview

The time type system provides a robust, type-safe implementation for handling time-related operations in the calendar application. It follows strict safety-critical coding principles to ensure reliability and prevent runtime errors.

## Core Types

### Branded Types

```typescript
type TimeString = string & { __brand: 'TimeString' };
type SlotIndex = number & { __brand: 'SlotIndex' };
```

These branded types prevent mixing of raw strings/numbers with validated time values. The TypeScript compiler enforces type checking, making it impossible to accidentally pass unvalidated values.

### Literal Types

```typescript
type Hour = 0 | 1 | 2 | ... | 22 | 23;
type Minute = 0 | 15 | 30 | 45;
```

These union types ensure hours and minutes are within valid ranges at compile time. Invalid values become type errors before runtime.

### Interfaces

```typescript
interface TimeComponents {
  hours: Hour;
  minutes: Minute;
}

interface TimeRange {
  startTime: TimeString;
  endTime: TimeString;
}

interface TimeSlot {
  index: SlotIndex;
  startTime: TimeString;
  endTime: TimeString;
}
```

## Validation Functions

### Type Guards

```typescript
isHour(value: number): value is Hour
isMinute(value: number): value is Minute
isTimeString(value: string): value is TimeString
isSlotIndex(value: number): value is SlotIndex
```

These functions perform runtime validation and act as type guards for TypeScript.

### Validation Functions

```typescript
validateHour(hour: number): Hour
validateMinute(minute: number): Minute
validateTimeString(time: string): TimeString
validateTimeRange(startTime: TimeString, endTime: TimeString, allowOvernight?: boolean): boolean
```

## Error Handling

Custom error classes provide specific error types:

```typescript
class TimeFormatError extends Error
class TimeRangeError extends Error
class SlotIndexError extends Error
```

## Time Manipulation

### Core Functions

```typescript
parseTimeString(time: TimeString): TimeComponents
formatTimeString(hours: Hour, minutes: Minute): TimeString
timeToSlotIndex(time: TimeString): SlotIndex
slotIndexToTime(index: SlotIndex): TimeString
```

### Utility Functions

```typescript
addMinutesToTime(time: TimeString, minutes: number): TimeString
compareTimeStrings(time1: TimeString, time2: TimeString): number
formatTime(time: TimeString): string
```

## Bitmap Operations

For efficient time slot storage:

```typescript
type TimeBitmap = [number, number];

generateBitmap(startTime: string, endTime: string): number[]
```

## Constants

```typescript
const TIME_BOUNDS = {
  HOURS: { MIN: 0, MAX: 23 },
  MINUTES: { MIN: 0, MAX: 59 },
  SLOTS: { MIN: 0, MAX: 47 }
} as const;
```

## Usage Examples

### Basic Time Handling

```typescript
// Creating a validated time string
const time = validateTimeString("09:30");

// Parsing time components
const { hours, minutes } = parseTimeString(time);

// Formatting for display
const displayTime = formatTime(time); // "9:30 AM"
```

### Time Range Operations

```typescript
// Validate a time range
const start = validateTimeString("09:00");
const end = validateTimeString("17:00");
const isValid = validateTimeRange(start, end);

// Generate bitmap for time slots
const bitmap = generateBitmap(start, end);
```

### Error Handling

```typescript
try {
  const time = validateTimeString("25:00"); // Throws TimeFormatError
} catch (error) {
  if (error instanceof TimeFormatError) {
    console.error("Invalid time format:", error.message);
  }
}
```

## Safety Guidelines

1. **Type Safety**
   - Always use the provided type guards and validation functions
   - Never cast raw strings/numbers to branded types
   - Let TypeScript's type system catch errors at compile time

2. **Error Handling**
   - Always handle potential errors from validation functions
   - Use specific error types for better error handling
   - Provide meaningful error messages

3. **Time Range Validation**
   - Always validate time ranges before using them
   - Consider overnight ranges when needed
   - Use the `allowOvernight` parameter appropriately

4. **Bitmap Operations**
   - Use the provided bitmap functions for slot management
   - Never manipulate bitmaps directly
   - Validate time ranges before generating bitmaps

## Best Practices

1. **Input Validation**
   ```typescript
   // ✅ Good
   const time = validateTimeString(userInput);
   
   // ❌ Bad
   const time = userInput as TimeString;
   ```

2. **Error Handling**
   ```typescript
   // ✅ Good
   try {
     const time = validateTimeString(input);
   } catch (error) {
     if (error instanceof TimeFormatError) {
       handleTimeFormatError(error);
     }
   }
   
   // ❌ Bad
   const time = validateTimeString(input); // Uncaught errors
   ```

3. **Type Safety**
   ```typescript
   // ✅ Good
   function processTime(time: TimeString) {
     // Time is guaranteed to be valid
   }
   
   // ❌ Bad
   function processTime(time: string) {
     // No guarantee of time format
   }
   ```

## Common Pitfalls

1. **Avoid Direct Type Assertions**
   ```typescript
   // ❌ Dangerous
   const time = "12:34" as TimeString;
   
   // ✅ Safe
   const time = validateTimeString("12:34");
   ```

2. **Don't Skip Validation**
   ```typescript
   // ❌ Unsafe
   function processTimeRange(start: string, end: string) {
     const bitmap = generateBitmap(start, end);
   }
   
   // ✅ Safe
   function processTimeRange(start: string, end: string) {
     const validStart = validateTimeString(start);
     const validEnd = validateTimeString(end);
     if (validateTimeRange(validStart, validEnd)) {
       const bitmap = generateBitmap(validStart, validEnd);
     }
   }
   ```

3. **Remember Time Bounds**
   ```typescript
   // ❌ Might fail
   const time = validateTimeString("24:00");
   
   // ✅ Valid
   const time = validateTimeString("23:59");
   ```