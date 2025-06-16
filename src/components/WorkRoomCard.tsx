import React from 'react';
import { motion } from 'framer-motion';
import { Users, Clock, Dot } from 'lucide-react';
import { Room } from '../types';

interface WorkRoomCardProps {
  room: Room;
  onEnterRoom: (roomId: string) => void;
  isSelected?: boolean;
}

export const WorkRoomCard: React.FC<WorkRoomCardProps> = ({ room, onEnterRoom, isSelected }) => {
  const activeMembers = room.members.filter(member => member.isOnline).length;

  return (
    <motion.div
      whileHover={{ y: -4, shadow: '0 10px 25px rgba(0,0,0,0.1)' }}
      className={`bg-white rounded-xl shadow-sm border-2 p-6 cursor-pointer transition-all duration-200 ${
        isSelected 
          ? 'border-blue-300 ring-2 ring-blue-100' 
          : 'border-gray-200 hover:border-blue-300'
      }`}
      onClick={() => onEnterRoom(room.id)}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">{room.name}</h3>
          <p className="text-gray-600 text-sm">{room.description}</p>
        </div>
        
        <div className={`w-3 h-3 rounded-full ${room.isActive ? 'bg-green-500' : 'bg-gray-400'}`} />
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Users className="w-4 h-4" />
            <span>{room.members.length} members</span>
          </div>
          
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Dot className="w-4 h-4 text-green-500" />
            <span>{activeMembers} online</span>
          </div>
        </div>

        <div className="flex -space-x-2">
          {room.members.slice(0, 3).map((member, index) => (
            <div
              key={member.id}
              className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full border-2 border-white flex items-center justify-center"
              title={member.name}
            >
              <span className="text-xs font-medium text-white">
                {member.name.charAt(0).toUpperCase()}
              </span>
            </div>
          ))}
          {room.members.length > 3 && (
            <div className="w-8 h-8 bg-gray-400 rounded-full border-2 border-white flex items-center justify-center">
              <span className="text-xs font-medium text-white">
                +{room.members.length - 3}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 flex items-center text-xs text-gray-500">
        <Clock className="w-3 h-3 mr-1" />
        <span>Created {room.createdAt.toLocaleDateString()}</span>
      </div>
    </motion.div>
  );
};