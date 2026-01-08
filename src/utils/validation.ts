// Rule 1: Simple control flow
// Rule 4: Keep functions small and focused
// Rule 5: Runtime assertions

// Rule 2: Fixed bounds - Define constants at the top level
const VALIDATION_BOUNDS = {
  ORDER_ID: {
    MIN_LENGTH: 1,
    MAX_LENGTH: 10
  },
  EMAIL: {
    // RFC 5321
    MAX_LENGTH: 254,
    // RFC 5322
    LOCAL_MAX_LENGTH: 64,
    DOMAIN_MAX_LENGTH: 255
  },
  ARRAY: {
    MAX_LENGTH: 1000
  }
} as const;

export const validateOrderId = (orderId: string): boolean => {
  // Assert input is string
  if (typeof orderId !== 'string') {
    throw new Error('OrderId must be a string');
  }

  // Rule 2: Fixed bounds checking
  if (orderId.length < VALIDATION_BOUNDS.ORDER_ID.MIN_LENGTH || 
      orderId.length > VALIDATION_BOUNDS.ORDER_ID.MAX_LENGTH) {
    return false;
  }

  // Rule 1: Simple control flow - Split validation steps
  const containsOnlyDigits = /^\d+$/.test(orderId);
  if (!containsOnlyDigits) {
    return false;
  }

  return true;
};

export const validateEmail = (email: string): boolean => {
  // Assert input is string
  if (typeof email !== 'string') {
    throw new Error('Email must be a string');
  }

  // Rule 2: Fixed bounds checking
  if (email.length > VALIDATION_BOUNDS.EMAIL.MAX_LENGTH) {
    return false;
  }

  // Rule 1: Simple control flow - Split validation into steps
  const parts = email.split('@');
  if (parts.length !== 2) {
    return false;
  }

  const [local, domain] = parts;

  // Validate local part
  if (local.length === 0 || local.length > VALIDATION_BOUNDS.EMAIL.LOCAL_MAX_LENGTH) {
    return false;
  }

  // Validate domain part
  if (domain.length === 0 || domain.length > VALIDATION_BOUNDS.EMAIL.DOMAIN_MAX_LENGTH) {
    return false;
  }

  // Check for invalid characters
  if (/\s/.test(email)) {
    return false;
  }

  // Validate domain has at least one dot and valid characters
  const domainParts = domain.split('.');
  if (domainParts.length < 2) {
    return false;
  }

  return true;
};

// Rule 3: Static allocation helper
export const createFixedArray = <T>(size: number, defaultValue: T): T[] => {
  // Assert positive size
  if (size <= 0 || !Number.isInteger(size)) {
    throw new Error('Array size must be a positive integer');
  }

  // Rule 2: Fixed bounds
  if (size > VALIDATION_BOUNDS.ARRAY.MAX_LENGTH) {
    throw new Error(`Array size cannot exceed ${VALIDATION_BOUNDS.ARRAY.MAX_LENGTH}`);
  }

  return new Array(size).fill(defaultValue);
};

// Rule 4: Keep functions small and focused
// Helper function to validate string length within bounds
export const validateStringLength = (
  str: string,
  minLength: number,
  maxLength: number,
  fieldName: string
): boolean => {
  // Assert input is string
  if (typeof str !== 'string') {
    throw new Error(`${fieldName} must be a string`);
  }

  // Assert bounds are valid
  if (minLength < 0 || maxLength < minLength) {
    throw new Error('Invalid length bounds');
  }

  return str.length >= minLength && str.length <= maxLength;
};

// Rule 5: Runtime assertions
// Helper function to ensure a value is within numeric bounds
export const assertNumericBounds = (
  value: number,
  min: number,
  max: number,
  fieldName: string
): void => {
  if (!Number.isFinite(value)) {
    throw new Error(`${fieldName} must be a finite number`);
  }

  if (value < min || value > max) {
    throw new Error(`${fieldName} must be between ${min} and ${max}`);
  }
};