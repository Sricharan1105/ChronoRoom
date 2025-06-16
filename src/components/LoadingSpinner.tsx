import React from 'react';
import { Clock } from 'lucide-react';

export const LoadingSpinner: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
      <div className="text-center">
        <div className="relative">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mb-4 mx-auto animate-pulse">
            <Clock className="w-8 h-8 text-white" />
          </div>
          <div className="absolute inset-0 w-16 h-16 border-4 border-blue-200 rounded-xl animate-spin mx-auto"></div>
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">ChronoRoom</h2>
        <p className="text-gray-600">Loading your workspace...</p>
      </div>
    </div>
  );
};