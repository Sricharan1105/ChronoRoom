import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Circle } from 'lucide-react';
import { PresenceStatus } from '../types';
import { getCurrentTimeInTimezone } from '../utils/timezone';

interface PresenceTimelineProps {
  presenceData: PresenceStatus[];
}

export const PresenceTimeline: React.FC<PresenceTimelineProps> = ({ presenceData }) => {
  const getStatusColor = (status: PresenceStatus['status']) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'idle': return 'bg-yellow-500';
      case 'offline': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  };

  const getStatusText = (status: PresenceStatus['status']) => {
    switch (status) {
      case 'active': return 'Active';
      case 'idle': return 'Idle';
      case 'offline': return 'Offline';
      default: return 'Unknown';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center space-x-2 mb-6">
        <Clock className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900">Team Presence</h3>
      </div>

      <div className="space-y-4">
        {presenceData.map((presence, index) => (
          <motion.div
            key={presence.userId}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-white">
                    {presence.userId.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className={`absolute -bottom-1 -right-1 w-4 h-4 ${getStatusColor(presence.status)} rounded-full border-2 border-white`}>
                  <Circle className="w-full h-full" />
                </div>
              </div>
              
              <div>
                <p className="font-medium text-gray-900">User {presence.userId}</p>
                <p className="text-sm text-gray-500">{getStatusText(presence.status)}</p>
              </div>
            </div>

            <div className="text-right">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-900">
                  {getCurrentTimeInTimezone(presence.timezone)}
                </span>
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  {presence.timezone.split('/')[1]?.replace('_', ' ') || 'UTC'}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Work: {presence.workingHours.start} - {presence.workingHours.end}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {presenceData.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Clock className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>No team members online</p>
        </div>
      )}
    </div>
  );
};