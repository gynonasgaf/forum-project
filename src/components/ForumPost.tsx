import React from 'react';
import { Heart, MessageSquare, Reply, Calendar, MessageCircle, Award, Shield, CheckCircle } from 'lucide-react';
import { getUserLevel } from '../lib/userLevels';

interface ForumPostProps {
  post: {
    id: string;
    content: string;
    created_at: string;
    profiles: {
      id: string;
      username: string;
      avatar_url?: string | null;
      post_count: number;
      reputation: number;
      is_verified: boolean;
      is_admin: boolean;
      honorable_title?: string | null;
      created_at: string;
    };
  };
  isOriginalPost?: boolean;
  postNumber?: number;
  onLike?: () => void;
  onQuote?: () => void;
  onReply?: () => void;
}

export default function ForumPost({ 
  post, 
  isOriginalPost = false, 
  postNumber,
  onLike,
  onQuote,
  onReply 
}: ForumPostProps) {
  const profile = post.profiles;
  const level = getUserLevel(profile.post_count, profile.reputation);
  
  const formatPostTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.abs(now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffInHours < 48) {
      return `Yesterday at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return date.toLocaleDateString([], { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  const getMemberSince = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString([], { month: 'long', year: 'numeric' });
  };

  return (
    <div className="bg-gray-900 rounded-lg overflow-hidden shadow-lg border border-gray-700">
      <div className="flex">
        {/* Left Side - User Profile Section */}
        <div className="w-64 bg-gray-800 p-6 border-r border-gray-700 flex-shrink-0">
          <div className="text-center">
            {/* Avatar */}
            <div className="relative mb-4">
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.username}
                  className={`w-20 h-20 rounded-full mx-auto object-cover border-4 ${
                    level.specialEffect 
                      ? 'border-yellow-400 shadow-lg shadow-yellow-400/30 animate-pulse' 
                      : 'border-gray-600'
                  }`}
                />
              ) : (
                <div className={`w-20 h-20 rounded-full mx-auto bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-2xl font-bold text-white border-4 ${
                  level.specialEffect 
                    ? 'border-yellow-400 shadow-lg shadow-yellow-400/30 animate-pulse' 
                    : 'border-gray-600'
                }`}>
                  {profile.username.charAt(0).toUpperCase()}
                </div>
              )}
              
              {/* Status Badges */}
              <div className="absolute -bottom-1 -right-1 flex space-x-1">
                {profile.is_verified && (
                  <div className="bg-blue-500 rounded-full p-1">
                    <CheckCircle className="w-3 h-3 text-white" />
                  </div>
                )}
                {profile.is_admin && (
                  <div className="bg-red-500 rounded-full p-1">
                    <Shield className="w-3 h-3 text-white" />
                  </div>
                )}
              </div>
            </div>

            {/* Username */}
            <h3 className="text-lg font-bold text-white mb-1">{profile.username}</h3>
            
            {/* User Level */}
            <div className="flex items-center justify-center space-x-1 mb-2">
              <span className={`text-sm font-medium ${level.color.replace('text-', 'text-')} ${level.specialEffect ? 'animate-pulse' : ''}`}>
                {level.title}
              </span>
              {level.badge && (
                <span className="text-sm">{level.badge}</span>
              )}
            </div>

            {/* Honorable Title */}
            {profile.honorable_title && (
              <div className="flex items-center justify-center space-x-1 mb-3">
                <Award className="w-3 h-3 text-purple-400" />
                <span className="text-xs text-purple-400 italic font-medium">
                  {profile.honorable_title}
                </span>
              </div>
            )}

            {/* User Stats */}
            <div className="space-y-2 text-sm text-gray-300">
              <div className="flex items-center justify-center space-x-1">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span>Joined {getMemberSince(profile.created_at)}</span>
              </div>
              
              <div className="flex items-center justify-center space-x-1">
                <MessageCircle className="w-4 h-4 text-gray-400" />
                <span>{profile.post_count.toLocaleString()} messages</span>
              </div>
              
              <div className="bg-gray-700 rounded-lg p-3 mt-4">
                <div className="text-xs text-gray-400 mb-1">Reaction Score</div>
                <div className="text-lg font-bold text-green-400">{profile.reputation.toLocaleString()}</div>
              </div>
              
              <div className="bg-gray-700 rounded-lg p-3">
                <div className="text-xs text-gray-400 mb-1">Points</div>
                <div className="text-lg font-bold text-blue-400">{(profile.reputation * 2).toLocaleString()}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Post Content */}
        <div className="flex-1 p-6">
          {/* Post Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              {!isOriginalPost && postNumber && (
                <span className="text-sm font-medium text-gray-400">#{postNumber}</span>
              )}
              {isOriginalPost && (
                <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full font-medium">
                  Original Post
                </span>
              )}
            </div>
            
            <div className="text-sm text-gray-400">
              {formatPostTime(post.created_at)}
            </div>
          </div>

          {/* Post Content */}
          <div className="prose prose-invert max-w-none mb-6">
            <div className="text-gray-100 leading-relaxed whitespace-pre-wrap">
              {post.content}
            </div>
          </div>

          {/* Post Footer - Action Buttons */}
          <div className="flex items-center justify-end space-x-4 pt-4 border-t border-gray-700">
            <button
              onClick={onLike}
              className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-300 hover:text-red-400 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <Heart className="w-4 h-4" />
              <span>Like</span>
            </button>
            
            <button
              onClick={onQuote}
              className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-300 hover:text-blue-400 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Quote</span>
            </button>
            
            <button
              onClick={onReply}
              className="flex items-center space-x-2 px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors font-medium"
            >
              <Reply className="w-4 h-4" />
              <span>Reply</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}