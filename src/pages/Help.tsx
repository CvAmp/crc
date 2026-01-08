import React from 'react';
import { HelpCircle } from 'lucide-react';

export function Help() {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="h-10 w-10 rounded-full bg-teal-100 flex items-center justify-center">
          <HelpCircle className="h-6 w-6 text-teal-600" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Help Center</h1>
          <p className="text-sm text-gray-500">Find answers and get support</p>
        </div>
      </div>
      
      {/* Placeholder content - to be implemented */}
      <div className="bg-white shadow-lg rounded-lg p-6">
        <p className="text-gray-600">Help center coming soon...</p>
      </div>
    </div>
  );
}