import React from 'react';
import { ExternalLink } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-gray-200 py-6 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
          <div className="text-sm text-gray-600">
            © 2025 ChronoRoom. Built for distributed teams worldwide.
          </div>
          
          <a
            href="https://bolt.new"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <div className="w-5 h-5 bg-white rounded flex items-center justify-center">
              <div className="w-3 h-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded"></div>
            </div>
            <span className="text-sm font-medium">Made with Bolt.new</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </footer>
  );
};