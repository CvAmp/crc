import React from 'react';
import { FileSpreadsheet } from 'lucide-react';

export function MACDs() {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
          <FileSpreadsheet className="h-6 w-6 text-indigo-600" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">MACDs</h1>
          <p className="text-sm text-gray-500">Manage MACD requests and status</p>
        </div>
      </div>
      
      {/* Placeholder content - to be implemented */}
      <div className="bg-white shadow-lg rounded-lg p-6">
        <p className="text-gray-600">MACDs view coming soon...</p>
      </div>
    </div>
  );
}