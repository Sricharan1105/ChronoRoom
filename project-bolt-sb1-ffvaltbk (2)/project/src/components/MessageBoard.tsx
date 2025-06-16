import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Clock, Globe } from 'lucide-react';
import { Message } from '../types';
import { formatDateInTimezone, translateMessageTime, getUserTimezone } from '../utils/timezone';

interface MessageBoardProps {
  messages: Message[];
  currentUserId: string;
  onSendMessage: (content: string) => void;
}

export const MessageBoard: React.FC<MessageBoardProps> = ({ 
  messages, 
  currentUserId, 
  onSendMessage 
}) => {
  const [newMessage, setNewMessage] = useState('');
  const userTimezone = getUserTimezone();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      onSendMessage(newMessage.trim());
      setNewMessage('');
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col h-96">
      <div className="flex items-center space-x-2 mb-4">
        <Globe className="w-5 h-5 text-green-600" />
        <h3 className="text-lg font-semibold text-gray-900">Team Messages</h3>
      </div>

      {/* Messages List */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${message.authorId === currentUserId ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                message.authorId === currentUserId
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}>
                {message.authorId !== currentUserId && (
                  <p className="text-xs font-medium mb-1 opacity-70">
                    {message.author.name}
                  </p>
                )}
                
                <p className="text-sm">{message.content}</p>
                
                <div className="flex items-center space-x-2 mt-2 text-xs opacity-70">
                  <Clock className="w-3 h-3" />
                  <span>{formatDateInTimezone(message.timestamp, userTimezone)}</span>
                </div>
                
                {message.authorId !== currentUserId && message.author.timezone !== userTimezone && (
                  <div className="text-xs opacity-60 mt-1">
                    <span>{translateMessageTime(message.timestamp, message.author.timezone, userTimezone)}</span>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {messages.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Globe className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No messages yet. Start the conversation!</p>
          </div>
        )}
      </div>

      {/* Message Input */}
      <form onSubmit={handleSubmit} className="flex space-x-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <button
          type="submit"
          disabled={!newMessage.trim()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};