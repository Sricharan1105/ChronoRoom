import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Users, Clock, Target } from 'lucide-react';
import { WorkRoomCard } from './WorkRoomCard';
import { PresenceTimeline } from './PresenceTimeline';
import { TaskBoard } from './TaskBoard';
import { MessageBoard } from './MessageBoard';
import { TimeOverlapPanel } from './TimeOverlapPanel';
import { Room, Task, Message, PresenceStatus, User, TimeOverlap } from '../types';
import { findOptimalOverlapWindows, getUserTimezone } from '../utils/timezone';

// Mock data for demonstration
const mockRooms: Room[] = [
  {
    id: '1',
    name: 'Frontend Team',
    description: 'React & TypeScript development',
    color: 'blue',
    members: [
      { id: '1', name: 'Alice Johnson', email: 'alice@example.com', timezone: 'America/New_York', workingHours: { start: '09:00', end: '17:00' }, isOnline: true, lastSeen: new Date() },
      { id: '2', name: 'Bob Smith', email: 'bob@example.com', timezone: 'Europe/London', workingHours: { start: '08:00', end: '16:00' }, isOnline: true, lastSeen: new Date() }
    ],
    createdAt: new Date('2024-01-15'),
    isActive: true
  },
  {
    id: '2',
    name: 'Design Sprint',
    description: 'UX/UI design collaboration',
    color: 'purple',
    members: [
      { id: '3', name: 'Carol Davis', email: 'carol@example.com', timezone: 'Asia/Tokyo', workingHours: { start: '09:00', end: '18:00' }, isOnline: false, lastSeen: new Date() },
      { id: '4', name: 'David Wilson', email: 'david@example.com', timezone: 'Australia/Sydney', workingHours: { start: '09:00', end: '17:00' }, isOnline: true, lastSeen: new Date() }
    ],
    createdAt: new Date('2024-01-10'),
    isActive: true
  }
];

const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Implement user authentication',
    description: 'Add login/signup functionality with timezone detection',
    priority: 'high',
    status: 'in-progress',
    createdAt: new Date(),
    roomId: '1'
  },
  {
    id: '2',
    title: 'Design time overlap UI',
    description: 'Create intuitive interface for viewing team availability',
    priority: 'medium',
    status: 'todo',
    createdAt: new Date(),
    roomId: '1'
  }
];

const mockMessages: Message[] = [
  {
    id: '1',
    content: 'Hey team! I\'ve pushed the latest changes to the main branch.',
    authorId: '1',
    author: { id: '1', name: 'Alice Johnson', email: 'alice@example.com', timezone: 'America/New_York', workingHours: { start: '09:00', end: '17:00' }, isOnline: true, lastSeen: new Date() },
    timestamp: new Date(Date.now() - 300000), // 5 minutes ago
    roomId: '1'
  },
  {
    id: '2',
    content: 'Great work! I\'ll review them in my morning (your evening).',
    authorId: '2',
    author: { id: '2', name: 'Bob Smith', email: 'bob@example.com', timezone: 'Europe/London', workingHours: { start: '08:00', end: '16:00' }, isOnline: true, lastSeen: new Date() },
    timestamp: new Date(Date.now() - 240000), // 4 minutes ago
    roomId: '1'
  }
];

const mockPresence: PresenceStatus[] = [
  {
    userId: '1',
    status: 'active',
    timezone: 'America/New_York',
    localTime: '14:30',
    workingHours: { start: '09:00', end: '17:00' }
  },
  {
    userId: '2',
    status: 'active',
    timezone: 'Europe/London',
    localTime: '19:30',
    workingHours: { start: '08:00', end: '16:00' }
  },
  {
    userId: '3',
    status: 'offline',
    timezone: 'Asia/Tokyo',
    localTime: '03:30',
    workingHours: { start: '09:00', end: '18:00' }
  }
];

export const Dashboard: React.FC = () => {
  const [rooms] = useState<Room[]>(mockRooms);
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [presence] = useState<PresenceStatus[]>(mockPresence);
  const [timeOverlaps, setTimeOverlaps] = useState<TimeOverlap[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'tasks' | 'messages'>('overview');

  const currentUser = {
    id: 'current-user',
    name: 'You',
    timezone: getUserTimezone()
  };

  useEffect(() => {
    // Calculate time overlaps
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
  }, [rooms]);

  const handleEnterRoom = (roomId: string) => {
    console.log('Entering room:', roomId);
    // This would navigate to the room view
  };

  const handleTaskUpdate = (taskId: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, ...updates } : task
    ));
  };

  const handleTaskCreate = (newTask: Omit<Task, 'id' | 'createdAt'>) => {
    const task: Task = {
      ...newTask,
      id: Date.now().toString(),
      createdAt: new Date()
    };
    setTasks(prev => [...prev, task]);
  };

  const handleSendMessage = (content: string) => {
    const message: Message = {
      id: Date.now().toString(),
      content,
      authorId: currentUser.id,
      author: { 
        id: currentUser.id, 
        name: currentUser.name, 
        email: 'you@example.com',
        timezone: currentUser.timezone,
        workingHours: { start: '09:00', end: '17:00' },
        isOnline: true,
        lastSeen: new Date()
      },
      timestamp: new Date(),
      roomId: 'current-room'
    };
    setMessages(prev => [...prev, message]);
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Users },
    { id: 'tasks', label: 'Tasks', icon: Target },
    { id: 'messages', label: 'Messages', icon: Clock }
  ];

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
                  <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    <Plus className="w-4 h-4" />
                    <span>Create Room</span>
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  {rooms.map((room) => (
                    <WorkRoomCard
                      key={room.id}
                      room={room}
                      onEnterRoom={handleEnterRoom}
                    />
                  ))}
                </div>

                <TimeOverlapPanel overlaps={timeOverlaps} />
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                <PresenceTimeline presenceData={presence} />
              </div>
            </div>
          )}

          {activeTab === 'tasks' && (
            <TaskBoard 
              tasks={tasks}
              onTaskUpdate={handleTaskUpdate}
              onTaskCreate={handleTaskCreate}
            />
          )}

          {activeTab === 'messages' && (
            <div className="max-w-4xl">
              <MessageBoard
                messages={messages}
                currentUserId={currentUser.id}
                onSendMessage={handleSendMessage}
              />
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};