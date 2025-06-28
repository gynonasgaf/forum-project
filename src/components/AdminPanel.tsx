import React, { useState, useEffect } from 'react';
import { X, CheckCircle, XCircle, Plus, Minus, Shield, Hash, MessageSquare, Edit, Trash2, Save, Eye, EyeOff, Pin, Lock, Unlock } from 'lucide-react';
import { supabase } from '../lib/supabase';
import UserBadge from './UserBadge';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AdminPanel({ isOpen, onClose }: AdminPanelProps) {
  const [categories, setCategories] = useState<any[]>([]);
  const [threads, setThreads] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [verificationRequests, setVerificationRequests] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('verification');
  
  // Category form state
  const [categoryForm, setCategoryForm] = useState({
    id: '',
    name: '',
    description: '',
    color: '#3b82f6'
  });
  const [editingCategory, setEditingCategory] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchCurrentUser();
      fetchCategories();
      fetchThreads();
      fetchPosts();
      fetchVerificationRequests();
    }
  }, [isOpen]);

  const fetchCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      setCurrentUser(profile);
    }
  };

  const fetchCategories = async () => {
    const { data } = await supabase
      .from('categories')
      .select('*')
      .order('name');
    
    if (data) setCategories(data);
  };

  const fetchThreads = async () => {
    const { data } = await supabase
      .from('threads')
      .select(`
        *,
        profiles(*),
        categories(*)
      `)
      .order('created_at', { ascending: false });
    
    if (data) setThreads(data);
  };

  const fetchPosts = async () => {
    const { data } = await supabase
      .from('posts')
      .select(`
        *,
        profiles(*),
        threads(title)
      `)
      .order('created_at', { ascending: false });
    
    if (data) setPosts(data);
  };

  const fetchVerificationRequests = async () => {
    const { data } = await supabase
      .from('verification_requests')
      .select(`
        *,
        profiles(username, avatar_url)
      `)
      .order('created_at', { ascending: false });
    
    if (data) setVerificationRequests(data);
  };

  // Verification Request Functions
  const handleVerificationRequest = async (requestId: string, status: 'approved' | 'rejected', adminNotes?: string) => {
    const request = verificationRequests.find(r => r.id === requestId);
    if (!request) return;

    try {
      // Update the verification request
      const { error: requestError } = await supabase
        .from('verification_requests')
        .update({ 
          status, 
          admin_notes: adminNotes || null 
        })
        .eq('id', requestId);

      if (requestError) throw requestError;

      // If approved, update the user's verification status
      if (status === 'approved') {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ is_verified: true })
          .eq('id', request.user_id);

        if (profileError) throw profileError;
      }

      fetchVerificationRequests();
    } catch (error: any) {
      alert(error.message);
    }
  };

  // Category Management Functions
  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingCategory) {
        const { error } = await supabase
          .from('categories')
          .update({
            name: categoryForm.name,
            description: categoryForm.description,
            color: categoryForm.color
          })
          .eq('id', editingCategory);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('categories')
          .insert({
            name: categoryForm.name,
            description: categoryForm.description,
            color: categoryForm.color
          });
        
        if (error) throw error;
      }
      
      setCategoryForm({ id: '', name: '', description: '', color: '#3b82f6' });
      setEditingCategory(null);
      fetchCategories();
    } catch (error: any) {
      alert(error.message);
    }
  };

  const editCategory = (category: any) => {
    setCategoryForm({
      id: category.id,
      name: category.name,
      description: category.description,
      color: category.color
    });
    setEditingCategory(category.id);
  };

  const deleteCategory = async (categoryId: string) => {
    if (!confirm('Are you sure you want to delete this category? All threads in this category will also be deleted.')) {
      return;
    }

    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', categoryId);

    if (!error) {
      fetchCategories();
      fetchThreads();
    }
  };

  // Thread Management Functions
  const toggleThreadPin = async (threadId: string, isPinned: boolean) => {
    const { error } = await supabase
      .from('threads')
      .update({ is_pinned: !isPinned })
      .eq('id', threadId);

    if (!error) {
      fetchThreads();
    }
  };

  const toggleThreadLock = async (threadId: string, isLocked: boolean) => {
    const { error } = await supabase
      .from('threads')
      .update({ is_locked: !isLocked })
      .eq('id', threadId);

    if (!error) {
      fetchThreads();
    }
  };

  const deleteThread = async (threadId: string) => {
    if (!confirm('Are you sure you want to delete this thread? All posts in this thread will also be deleted.')) {
      return;
    }

    const { error } = await supabase
      .from('threads')
      .delete()
      .eq('id', threadId);

    if (!error) {
      fetchThreads();
      fetchPosts();
    }
  };

  // Post Management Functions
  const deletePost = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post?')) {
      return;
    }

    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', postId);

    if (!error) {
      fetchPosts();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl relative overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-600 to-orange-600"></div>
        
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <Shield className="w-8 h-8 text-red-600" />
              <h2 className="text-2xl font-bold text-gray-900">Admin Panel</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('verification')}
              className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
                activeTab === 'verification'
                  ? 'bg-white text-red-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <CheckCircle className="w-4 h-4 inline mr-2" />
              Verification Requests
            </button>
            <button
              onClick={() => setActiveTab('categories')}
              className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
                activeTab === 'categories'
                  ? 'bg-white text-red-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Hash className="w-4 h-4 inline mr-2" />
              Category Manager
            </button>
            <button
              onClick={() => setActiveTab('threads')}
              className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
                activeTab === 'threads'
                  ? 'bg-white text-red-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <MessageSquare className="w-4 h-4 inline mr-2" />
              Thread Manager
            </button>
            <button
              onClick={() => setActiveTab('posts')}
              className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
                activeTab === 'posts'
                  ? 'bg-white text-red-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <MessageSquare className="w-4 h-4 inline mr-2" />
              Post Manager
            </button>
          </div>

          {/* Verification Requests */}
          {activeTab === 'verification' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Verification Requests ({verificationRequests.length})</h3>
              </div>

              <div className="space-y-4">
                {verificationRequests.length === 0 ? (
                  <div className="text-center py-12">
                    <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No verification requests pending</p>
                  </div>
                ) : (
                  verificationRequests.map((request) => (
                    <div key={request.id} className="bg-white border border-gray-200 rounded-lg p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          {request.profiles?.avatar_url ? (
                            <img
                              src={request.profiles.avatar_url}
                              alt={request.profiles.username}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-medium">
                              {request.profiles?.username?.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <h4 className="font-medium text-gray-900">{request.profiles?.username}</h4>
                            <p className="text-sm text-gray-500">
                              Submitted {new Date(request.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                          request.status === 'pending' 
                            ? 'bg-yellow-100 text-yellow-800'
                            : request.status === 'approved'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                        </span>
                      </div>

                      <div className="mb-4">
                        <h5 className="font-medium text-gray-900 mb-2">Request Details:</h5>
                        <p className="text-gray-700 text-sm leading-relaxed">{request.content}</p>
                      </div>

                      {request.images && request.images.length > 0 && (
                        <div className="mb-4">
                          <h5 className="font-medium text-gray-900 mb-2">Supporting Images:</h5>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            {request.images.map((imageUrl: string, index: number) => (
                              <img
                                key={index}
                                src={imageUrl}
                                alt={`Verification image ${index + 1}`}
                                className="w-full h-32 object-cover rounded-lg border border-gray-200"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                            ))}
                          </div>
                        </div>
                      )}

                      {request.admin_notes && (
                        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                          <h5 className="font-medium text-gray-900 mb-1">Admin Notes:</h5>
                          <p className="text-gray-700 text-sm">{request.admin_notes}</p>
                        </div>
                      )}

                      {request.status === 'pending' && (
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => {
                              const notes = prompt('Add admin notes (optional):');
                              handleVerificationRequest(request.id, 'approved', notes || undefined);
                            }}
                            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                          >
                            <CheckCircle className="w-4 h-4" />
                            <span>Approve</span>
                          </button>
                          <button
                            onClick={() => {
                              const notes = prompt('Add admin notes (optional):');
                              handleVerificationRequest(request.id, 'rejected', notes || undefined);
                            }}
                            className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                          >
                            <XCircle className="w-4 h-4" />
                            <span>Reject</span>
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Category Management */}
          {activeTab === 'categories' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Manage Categories ({categories.length})</h3>
              </div>

              {/* Category Form */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h4 className="font-medium text-gray-900 mb-4">
                  {editingCategory ? 'Edit Category' : 'Create New Category'}
                </h4>
                <form onSubmit={handleCategorySubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                      <input
                        type="text"
                        value={categoryForm.name}
                        onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                      <input
                        type="color"
                        value={categoryForm.color}
                        onChange={(e) => setCategoryForm({ ...categoryForm, color: e.target.value })}
                        className="w-full h-10 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div className="flex items-end">
                      <button
                        type="submit"
                        className="w-full bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors flex items-center justify-center space-x-2"
                      >
                        <Save className="w-4 h-4" />
                        <span>{editingCategory ? 'Update' : 'Create'}</span>
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      value={categoryForm.description}
                      onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>
                  {editingCategory && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingCategory(null);
                        setCategoryForm({ id: '', name: '', description: '', color: '#3b82f6' });
                      }}
                      className="text-gray-600 hover:text-gray-800"
                    >
                      Cancel Edit
                    </button>
                  )}
                </form>
              </div>

              {/* Categories List */}
              <div className="space-y-3">
                {categories.map((category) => (
                  <div key={category.id} className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div
                          className="w-6 h-6 rounded-full"
                          style={{ backgroundColor: category.color }}
                        ></div>
                        <div>
                          <h4 className="font-medium text-gray-900">{category.name}</h4>
                          <p className="text-sm text-gray-600">{category.description}</p>
                          <p className="text-xs text-gray-500">
                            {threads.filter(t => t.category_id === category.id).length} threads
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => editCategory(category)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit category"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteCategory(category.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete category"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Thread Management */}
          {activeTab === 'threads' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Manage Threads ({threads.length})</h3>
              </div>

              <div className="space-y-3">
                {threads.map((thread) => (
                  <div key={thread.id} className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          {thread.is_pinned && <Pin className="w-4 h-4 text-yellow-600" />}
                          {thread.is_locked && <Lock className="w-4 h-4 text-red-600" />}
                          <span
                            className="px-2 py-1 text-xs font-medium rounded-full"
                            style={{
                              backgroundColor: thread.categories?.color + '20',
                              color: thread.categories?.color,
                            }}
                          >
                            {thread.categories?.name}
                          </span>
                        </div>
                        <h4 className="font-medium text-gray-900 mb-1">{thread.title}</h4>
                        <p className="text-sm text-gray-600 line-clamp-2 mb-2">{thread.content}</p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span>By {thread.profiles?.username}</span>
                          <span>{thread.views} views</span>
                          <span>{new Date(thread.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <button
                          onClick={() => toggleThreadPin(thread.id, thread.is_pinned)}
                          className={`p-2 rounded-lg transition-colors ${
                            thread.is_pinned
                              ? 'text-yellow-600 hover:bg-yellow-50'
                              : 'text-gray-400 hover:bg-gray-100'
                          }`}
                          title={thread.is_pinned ? 'Unpin thread' : 'Pin thread'}
                        >
                          <Pin className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => toggleThreadLock(thread.id, thread.is_locked)}
                          className={`p-2 rounded-lg transition-colors ${
                            thread.is_locked
                              ? 'text-red-600 hover:bg-red-50'
                              : 'text-gray-400 hover:bg-gray-100'
                          }`}
                          title={thread.is_locked ? 'Unlock thread' : 'Lock thread'}
                        >
                          {thread.is_locked ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => deleteThread(thread.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete thread"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Post Management */}
          {activeTab === 'posts' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Manage Posts ({posts.length})</h3>
              </div>

              <div className="space-y-3">
                {posts.map((post) => (
                  <div key={post.id} className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <UserBadge profile={post.profiles} size="sm" showLevel={false} />
                          <span className="text-xs text-gray-500">
                            in thread: {post.threads?.title}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 mb-2 line-clamp-3">{post.content}</p>
                        <div className="text-xs text-gray-500">
                          {new Date(post.created_at).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <button
                          onClick={() => deletePost(post.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete post"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}