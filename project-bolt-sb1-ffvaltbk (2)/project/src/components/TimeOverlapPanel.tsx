import React from 'react';
import { motion } from 'framer-motion';
import { Users, Clock, Target } from 'lucide-react';
import { TimeOverlap } from '../types';

interface TimeOverlapPanelProps {
  overlaps: TimeOverlap[];
}

export const TimeOverlapPanel: React.FC<TimeOverlapPanelProps> = ({ overlaps }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center space-x-2 mb-6">
        <Target className="w-5 h-5 text-purple-600" />
        <h3 className="text-lg font-semibold text-gray-900">Optimal Collaboration Windows</h3>
      </div>

      <div className="space-y-4">
        {overlaps.map((overlap, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-100"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-purple-600" />
                <span className="font-medium text-gray-900">
                  {overlap.startTime} - {overlap.endTime}
                </span>
                <span className="text-sm text-gray-500">
                  ({overlap.timezone})
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-600">
                  {overlap.users.length} members
                </span>
              </div>
            </div>
            
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>{overlap.duration} minutes available</span>
              
              <div className="flex -space-x-1">
                {overlap.users.slice(0, 3).map((userId, userIndex) => (
                  <div
                    key={userId}
                    className="w-6 h-6 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full border-2 border-white flex items-center justify-center"
                    title={`User ${userId}`}
                  >
                    <span className="text-xs font-medium text-white">
                      {userId.charAt(0).toUpperCase()}
                    </span>
                  </div>
                ))}
                {overlap.users.length > 3 && (
                  <div className="w-6 h-6 bg-gray-400 rounded-full border-2 border-white flex items-center justify-center">
                    <span className="text-xs font-medium text-white">
                      +{overlap.users.length - 3}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {overlaps.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Target className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>No overlap windows found</p>
          <p className="text-sm">Try adjusting working hours or add more team members</p>
        </div>
      )}
    </div>
  );
};