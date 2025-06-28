import React from 'react';
import { MessageCircle, Eye, Clock, Pin, Lock } from 'lucide-react';
import UserBadge from './UserBadge';

interface ThreadCardProps {
  thread: {
    id: string;
    title: string;
    content: string;
    author_id: string;
    is_pinned: boolean;
    is_locked: boolean;
    views: number;
    created_at: string;
    profiles: any;
    categories: any;
  };
  postCount: number;
  onClick: () => void;
  viewMode?: 'list' | 'grid';
}

export default function ThreadCard({ thread, postCount, onClick, viewMode = 'list' }: ThreadCardProps) {
  const timeAgo = new Date(thread.created_at).toLocaleDateString();

  return (
    <div
      onClick={onClick}
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 ${
        thread.is_pinned ? 'ring-2 ring-yellow-200 dark:ring-yellow-800 bg-yellow-50 dark:bg-yellow-900/10' : ''
      } ${viewMode === 'grid' ? 'h-full' : ''}`}
    >
      <div className="p-6 h-full flex flex-col">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              {thread.is_pinned && (
                <Pin className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
              )}
              {thread.is_locked && (
                <Lock className="w-4 h-4 text-red-600 dark:text-red-400" />
              )}
              <span
                className="px-2 py-1 text-xs font-medium rounded-full"
                style={{
                  backgroundColor: thread.categories.color + '20',
                  color: thread.categories.color,
                }}
              >
                {thread.categories.name}
              </span>
            </div>
            
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors line-clamp-2">
              {thread.title}
            </h3>
            
            <p className={`text-gray-600 dark:text-gray-400 mb-4 ${viewMode === 'grid' ? 'line-clamp-3' : 'line-clamp-2'}`}>
              {thread.content}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between mt-auto">
          <UserBadge profile={thread.profiles} size="sm" showLevel={false} />
          
          <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center space-x-1">
              <MessageCircle className="w-4 h-4" />
              <span>{postCount}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Eye className="w-4 h-4" />
              <span>{thread.views}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="w-4 h-4" />
              <span>{timeAgo}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}