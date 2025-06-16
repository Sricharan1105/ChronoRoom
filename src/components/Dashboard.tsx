import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Users, Clock, Target } from 'lucide-react';
import { WorkRoomCard } from './WorkRoomCard';
import { PresenceTimeline } from './PresenceTimeline';
import { TaskBoard } from './TaskBoard';
import { MessageBoard } from './MessageBoard';
import { TimeOverlapPanel } from './TimeOverlapPanel';
import { CreateRoomModal } from './CreateRoomModal';
import { useAuth } from '../hooks/useAuth';
import { useRooms } from '../hooks/useRooms';
import { useTasks } from '../hooks/useTasks';
import { useMessages } from '../hooks/useMessages';
import { PresenceStatus, TimeOverlap } from '../types';
import { findOptimalOverlapWindows } from '../utils/timezone';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { rooms, loading: roomsLoading, createRoom } = useRooms(user?.id);
  const [selectedRoomId, setSelectedRoomId] = useState<string>('');
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'tasks' | 'messages'>('overview');
  const [timeOverlaps, setTimeOverlaps] = useState<TimeOverlap[]>([]);
  const [presence, setPresence] = useState<PresenceStatus[]>([]);

  // Use the first room as default selected room
  useEffect(() => {
    if (rooms.length > 0 && !selectedRoomId) {
      setSelectedRoomId(rooms[0].id);
    }
  }, [rooms, selectedRoomId]);

  const { tasks, createTask, updateTask } = useTasks(selectedRoomId, user?.id);
  const { messages, sendMessage } = useMessages(selectedRoomId, user?.id);

  useEffect(() => {
    // Calculate time overlaps
    if (rooms.length > 0) {
      const users = rooms.flatMap(room => room.members);
      const overlaps = findOptimalOverlapWindows(users.map(user => ({
        timezone: user.timezone,
        workingHours: user.workingHours
      })));

      const formattedOverlaps: TimeOverlap[] = overlaps.map(overlap => ({
        users: users.slice(0, overlap.participants).map(u => u.id),
        startTime: overlap.startTime,
        endTime: overlap.endTime,
        duration: overlap.duration,
        timezone: 'UTC'
      }));

      setTimeOverlaps(formattedOverlaps);

      // Generate presence data
      const presenceData: PresenceStatus[] = users.map(user => ({
        userId: user.id,
        status: user.isOnline ? 'active' : 'offline',
        timezone: user.timezone,
        localTime: new Date().toLocaleTimeString('en-US', { 
          timeZone: user.timezone,
          hour12: false,
          hour: '2-digit',
          minute: '2-digit'
        }),
        workingHours: user.workingHours
      }));

      setPresence(presenceData);
    }
  }, [rooms]);

  const handleEnterRoom = (roomId: string) => {
    setSelectedRoomId(roomId);
    setActiveTab('overview');
  };

  const handleTaskUpdate = async (taskId: string, updates: any) => {
    try {
      await updateTask(taskId, updates);
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const handleTaskCreate = async (newTask: any) => {
    try {
      await createTask(newTask);
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const handleSendMessage = async (content: string) => {
    try {
      await sendMessage(content);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleCreateRoom = async (roomData: { name: string; description?: string; color?: string }) => {
    try {
      await createRoom(roomData);
      setShowCreateRoom(false);
    } catch (error) {
      console.error('Error creating room:', error);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Users },
    { id: 'tasks', label: 'Tasks', icon: Target },
    { id: 'messages', label: 'Messages', icon: Clock }
  ];

  if (roomsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to ChronoRoom</h1>
          <p className="text-gray-600">Collaborate seamlessly across time zones with your distributed team</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-8 bg-gray-100 p-1 rounded-lg w-fit">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                activeTab === tab.id
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Work Rooms */}
              <div className="lg:col-span-2">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Work Rooms</h2>
                  <button 
                    onClick={() => setShowCreateRoom(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create Room</span>
                  </button>
                </div>
                
                {rooms.length > 0 ? (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                      {rooms.map((room) => (
                        <WorkRoomCard
                          key={room.id}
                          room={room}
                          onEnterRoom={handleEnterRoom}
                          isSelected={room.id === selectedRoomId}
                        />
                      ))}
                    </div>
                    <TimeOverlapPanel overlaps={timeOverlaps} />
                  </>
                ) : (
                  <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                    <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No rooms yet</h3>
                    <p className="text-gray-600 mb-4">Create your first room to start collaborating</p>
                    <button 
                      onClick={() => setShowCreateRoom(true)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Create Room
                    </button>
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                <PresenceTimeline presenceData={presence} />
              </div>
            </div>
          )}

          {activeTab === 'tasks' && selectedRoomId && (
            <TaskBoard 
              tasks={tasks}
              onTaskUpdate={handleTaskUpdate}
              onTaskCreate={handleTaskCreate}
            />
          )}

          {activeTab === 'messages' && selectedRoomId && (
            <div className="max-w-4xl">
              <MessageBoard
                messages={messages}
                currentUserId={user?.id || ''}
                onSendMessage={handleSendMessage}
              />
            </div>
          )}

          {(activeTab === 'tasks' || activeTab === 'messages') && !selectedRoomId && (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
              <Clock className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Select a room</h3>
              <p className="text-gray-600">Choose a room to view {activeTab}</p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Create Room Modal */}
      {showCreateRoom && (
        <CreateRoomModal
          onClose={() => setShowCreateRoom(false)}
          onCreateRoom={handleCreateRoom}
        />
      )}
    </div>
  );
};