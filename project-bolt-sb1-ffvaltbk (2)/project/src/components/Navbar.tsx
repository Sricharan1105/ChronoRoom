import React from 'react';
import { Clock, Users, Settings, Bell } from 'lucide-react';
import { getCurrentTimeInTimezone, getUserTimezone } from '../utils/timezone';

interface NavbarProps {
  currentUser?: {
    name: string;
    timezone: string;
    avatar?: string;
  };
}

export const Navbar: React.FC<NavbarProps> = ({ currentUser }) => {
  const userTimezone = getUserTimezone();
  const currentTime = getCurrentTimeInTimezone(userTimezone);

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-50 backdrop-blur-sm bg-white/95">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">ChronoRoom</h1>
          </div>
          
          {currentUser && (
            <div className="hidden md:flex items-center space-x-6 ml-8">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Clock className="w-4 h-4" />
                <span>{currentTime}</span>
                <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                  {userTimezone.split('/')[1]?.replace('_', ' ') || userTimezone}
                </span>
              </div>
            </div>
          )}
        </div>

        {currentUser && (
          <div className="flex items-center space-x-4">
            <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
            </button>
            
            <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
              <Settings className="w-5 h-5" />
            </button>
            
            <div className="flex items-center space-x-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-gray-900">{currentUser.name}</p>
                <p className="text-xs text-gray-500">{currentUser.timezone}</p>
              </div>
              
              <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-white">
                  {currentUser.name.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};