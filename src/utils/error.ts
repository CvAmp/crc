// Rule 1: Simple control flow
// Rule 4: Keep functions small and focused
// Rule 5: Runtime assertions

export const formatError = (error: unknown): string => {
  // Assert error is not null/undefined
  if (error === null || error === undefined) {
    return 'Unknown error occurred';
  }

  // Rule 2: Fixed bounds on string length
  const MAX_ERROR_LENGTH = 1000;

  if (error instanceof Error) {
    // Ensure error message doesn't exceed max length
    return error.message.slice(0, MAX_ERROR_LENGTH);
  }
  
  const errorStr = String(error);
  return errorStr.slice(0, MAX_ERROR_LENGTH);
};