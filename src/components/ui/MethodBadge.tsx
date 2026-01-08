import React from 'react';

interface MethodBadgeProps {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
}

export function MethodBadge({ method }: MethodBadgeProps) {
  const colors = {
    GET: 'bg-green-100 text-green-800',
    POST: 'bg-blue-100 text-blue-800',
    PUT: 'bg-yellow-100 text-yellow-800',
    DELETE: 'bg-red-100 text-red-800'
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[method]}`}>
      {method}
    </span>
  );
}