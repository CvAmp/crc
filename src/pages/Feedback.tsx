import React from 'react';
import { MessageSquare } from 'lucide-react';

export function Feedback() {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="h-10 w-10 rounded-full bg-rose-100 flex items-center justify-center">
          <MessageSquare className="h-6 w-6 text-rose-600" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Send Feedback</h1>
          <p className="text-sm text-gray-500">Help us improve your experience</p>
        </div>
      </div>
      
      {/* Placeholder content - to be implemented */}
      <div className="bg-white shadow-lg rounded-lg p-6">
        <p className="text-gray-600">Feedback form coming soon...</p>
      </div>
    </div>
  );
}