export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  timezone: string;
  workingHours: {
    start: string; // "09:00"
    end: string;   // "17:00"
  };
  isOnline: boolean;
  lastSeen: Date;
}

export interface Room {
  id: string;
  name: string;
  description: string;
  color: string;
  members: User[];
  createdAt: Date;
  isActive: boolean;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  assignedTo?: string;
  priority: 'low' | 'medium' | 'high';
  status: 'todo' | 'in-progress' | 'completed';
  dueDate?: Date;
  createdAt: Date;
  roomId: string;
}

export interface Message {
  id: string;
  content: string;
  authorId: string;
  author: User;
  timestamp: Date;
  roomId: string;
  translatedTime?: string;
}

export interface PresenceStatus {
  userId: string;
  status: 'active' | 'idle' | 'offline';
  timezone: string;
  localTime: string;
  workingHours: {
    start: string;
    end: string;
  };
}

export interface TimeOverlap {
  users: string[];
  startTime: string;
  endTime: string;
  duration: number; // in minutes
  timezone: string;
}