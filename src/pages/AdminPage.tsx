import React, { useState, useEffect } from 'react';
import { Shield, Users, Hash, MessageSquare, CheckCircle, Plus, Minus, Edit, Trash2, Save, Pin, Lock, Unlock, Award, Search, ChevronLeft, ChevronRight, Filter, Upload, Eye, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import UserBadge from '../components/UserBadge';

export default function AdminPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [threads, setThreads] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [verificationRequests, setVerificationRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('users');
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  // Pagination and search state
  const [searchTerms, setSearchTerms] = useState({
    users: '',
    categories: '',
    threads: '',
    posts: '',
    verifications: ''
  });
  const [currentPages, setCurrentPages] = useState({
    users: 1,
    categories: 1,
    threads: 1,
    posts: 1,
    verifications: 1
  });
  const [pageSizes, setPageSizes] = useState({
    users: 10,
    categories: 10,
    threads: 10,
    posts: 10,
    verifications: 10
  });
  
  // Category form state
  const [categoryForm, setCategoryForm] = useState({
    id: '',
    name: '',
    description: '',
    color: '#3b82f6'
  });
  const [editingCategory, setEditingCategory] = useState<string | null>(null);

  // Honorable title editing state
  const [editingTitle, setEditingTitle] = useState<string | null>(null);
  const [titleForm, setTitleForm] = useState('');

  // Verification modal state
  const [selectedVerification, setSelectedVerification] = useState<any>(null);

  useEffect(() => {
    fetchCurrentUser();
    fetchUsers();
    fetchCategories();
    fetchThreads();
    fetchPosts();
    fetchVerificationRequests();
  }, []);

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

  const fetchUsers = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) setUsers(data);
    setLoading(false);
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
        profiles(*)
      `)
      .order('created_at', { ascending: false });
    
    if (data) setVerificationRequests(data);
  };

  // Search and pagination functions
  const updateSearchTerm = (tab: string, term: string) => {
    setSearchTerms(prev => ({ ...prev, [tab]: term }));
    setCurrentPages(prev => ({ ...prev, [tab]: 1 })); // Reset to first page when searching
  };

  const updatePageSize = (tab: string, size: number) => {
    setPageSizes(prev => ({ ...prev, [tab]: size }));
    setCurrentPages(prev => ({ ...prev, [tab]: 1 })); // Reset to first page when changing page size
  };

  const updateCurrentPage = (tab: string, page: number) => {
    setCurrentPages(prev => ({ ...prev, [tab]: page }));
  };

  const filterData = (data: any[], searchTerm: string, searchFields: string[]) => {
    if (!searchTerm) return data;
    
    return data.filter(item => 
      searchFields.some(field => {
        const value = field.split('.').reduce((obj, key) => obj?.[key], item);
        return value?.toString().toLowerCase().includes(searchTerm.toLowerCase());
      })
    );
  };

  const paginateData = (data: any[], currentPage: number, pageSize: number) => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return data.slice(startIndex, endIndex);
  };

  const getTotalPages = (dataLength: number, pageSize: number) => {
    return Math.ceil(dataLength / pageSize);
  };

  // Get filtered and paginated data
  const getFilteredUsers = () => {
    const filtered = filterData(users, searchTerms.users, ['username', 'bio', 'honorable_title']);
    return {
      data: paginateData(filtered, currentPages.users, pageSizes.users),
      total: filtered.length,
      totalPages: getTotalPages(filtered.length, pageSizes.users)
    };
  };

  const getFilteredCategories = () => {
    const filtered = filterData(categories, searchTerms.categories, ['name', 'description']);
    return {
      data: paginateData(filtered, currentPages.categories, pageSizes.categories),
      total: filtered.length,
      totalPages: getTotalPages(filtered.length, pageSizes.categories)
    };
  };

  const getFilteredThreads = () => {
    const filtered = filterData(threads, searchTerms.threads, ['title', 'content', 'profiles.username', 'categories.name']);
    return {
      data: paginateData(filtered, currentPages.threads, pageSizes.threads),
      total: filtered.length,
      totalPages: getTotalPages(filtered.length, pageSizes.threads)
    };
  };

  const getFilteredPosts = () => {
    const filtered = filterData(posts, searchTerms.posts, ['content', 'profiles.username', 'threads.title']);
    return {
      data: paginateData(filtered, currentPages.posts, pageSizes.posts),
      total: filtered.length,
      totalPages: getTotalPages(filtered.length, pageSizes.posts)
    };
  };

  const getFilteredVerifications = () => {
    const filtered = filterData(verificationRequests, searchTerms.verifications, ['content', 'profiles.username', 'status']);
    return {
      data: paginateData(filtered, currentPages.verifications, pageSizes.verifications),
      total: filtered.length,
      totalPages: getTotalPages(filtered.length, pageSizes.verifications)
    };
  };

  // Pagination component
  const PaginationControls = ({ 
    currentPage, 
    totalPages, 
    pageSize, 
    totalItems, 
    onPageChange, 
    onPageSizeChange,
    tab 
  }: {
    currentPage: number;
    totalPages: number;
    pageSize: number;
    totalItems: number;
    onPageChange: (page: number) => void;
    onPageSizeChange: (size: number) => void;
    tab: string;
  }) => {
    const startItem = (currentPage - 1) * pageSize + 1;
    const endItem = Math.min(currentPage * pageSize, totalItems);

    return (
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-700 dark:text-gray-300">Show:</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {[10, 25, 50, 100].map(size => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
            <span className="text-sm text-gray-700 dark:text-gray-300">per page</span>
          </div>
          
          <div className="text-sm text-gray-700 dark:text-gray-300">
            Showing {startItem}-{endItem} of {totalItems} items
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center space-x-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }

              return (
                <button
                  key={pageNum}
                  onClick={() => onPageChange(pageNum)}
                  className={`px-3 py-1 rounded-md text-sm transition-colors ${
                    currentPage === pageNum
                      ? 'bg-blue-600 text-white'
                      : 'border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  // Search component
  const SearchBar = ({ 
    searchTerm, 
    onSearchChange, 
    placeholder 
  }: {
    searchTerm: string;
    onSearchChange: (term: string) => void;
    placeholder: string;
  }) => (
    <div className="relative mb-6">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
      />
    </div>
  );

  // User Management Functions
  const updateUserVerification = async (userId: string, verified: boolean) => {
    const { error } = await supabase
      .from('profiles')
      .update({ is_verified: verified })
      .eq('id', userId);

    if (!error) {
      fetchUsers();
    }
  };

  const updateUserReputation = async (userId: string, change: number) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    const newReputation = Math.max(0, user.reputation + change);
    
    const { error } = await supabase
      .from('profiles')
      .update({ reputation: newReputation })
      .eq('id', userId);

    if (!error) {
      fetchUsers();
    }
  };

  const toggleAdminStatus = async (userId: string, isAdmin: boolean) => {
    // Prevent admins from removing admin status from themselves or other admins
    const targetUser = users.find(u => u.id === userId);
    if (!targetUser) return;

    // Only owners can modify admin status
    if (!currentUser?.is_owner) {
      alert('Only owners can modify admin privileges.');
      return;
    }

    // Prevent removing admin status from owners
    if (targetUser.is_owner && !isAdmin) {
      alert('Cannot remove admin status from owners.');
      return;
    }

    const { error } = await supabase
      .from('profiles')
      .update({ is_admin: isAdmin })
      .eq('id', userId);

    if (!error) {
      fetchUsers();
    }
  };

  const updateHonorableTitle = async (userId: string, title: string) => {
    const { error } = await supabase
      .from('profiles')
      .update({ honorable_title: title || null })
      .eq('id', userId);

    if (!error) {
      setEditingTitle(null);
      setTitleForm('');
      fetchUsers();
    }
  };

  const startEditingTitle = (userId: string, currentTitle: string) => {
    setEditingTitle(userId);
    setTitleForm(currentTitle || '');
  };

  // Verification request functions
  const handleVerificationAction = async (requestId: string, action: 'approved' | 'rejected', adminNotes?: string) => {
    const { error } = await supabase
      .from('verification_requests')
      .update({
        status: action,
        admin_notes: adminNotes || null
      })
      .eq('id', requestId);

    if (!error) {
      // If approved, also update the user's verification status
      if (action === 'approved') {
        const request = verificationRequests.find(r => r.id === requestId);
        if (request) {
          await updateUserVerification(request.user_id, true);
        }
      }
      
      fetchVerificationRequests();
      setSelectedVerification(null);
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

  const filteredUsers = getFilteredUsers();
  const filteredCategories = getFilteredCategories();
  const filteredThreads = getFilteredThreads();
  const filteredPosts = getFilteredPosts();
  const filteredVerifications = getFilteredVerifications();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-r from-red-600 to-orange-600 rounded-xl flex items-center justify-center">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-400">Manage users, categories, threads, posts, and verifications</p>
          </div>
        </div>
        
        <div className="h-1 bg-gradient-to-r from-red-600 to-orange-600 rounded-full"></div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-8 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg overflow-x-auto">
        <button
          onClick={() => setActiveTab('users')}
          className={`flex-1 min-w-max py-3 px-4 rounded-md font-medium transition-colors ${
            activeTab === 'users'
              ? 'bg-white dark:bg-gray-700 text-red-600 dark:text-red-400 shadow-sm'
              : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <Users className="w-4 h-4 inline mr-2" />
          Users ({users.length})
        </button>
        <button
          onClick={() => setActiveTab('verifications')}
          className={`flex-1 min-w-max py-3 px-4 rounded-md font-medium transition-colors ${
            activeTab === 'verifications'
              ? 'bg-white dark:bg-gray-700 text-red-600 dark:text-red-400 shadow-sm'
              : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <Upload className="w-4 h-4 inline mr-2" />
          Verifications ({verificationRequests.filter(r => r.status === 'pending').length})
        </button>
        <button
          onClick={() => setActiveTab('categories')}
          className={`flex-1 min-w-max py-3 px-4 rounded-md font-medium transition-colors ${
            activeTab === 'categories'
              ? 'bg-white dark:bg-gray-700 text-red-600 dark:text-red-400 shadow-sm'
              : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <Hash className="w-4 h-4 inline mr-2" />
          Categories ({categories.length})
        </button>
        <button
          onClick={() => setActiveTab('threads')}
          className={`flex-1 min-w-max py-3 px-4 rounded-md font-medium transition-colors ${
            activeTab === 'threads'
              ? 'bg-white dark:bg-gray-700 text-red-600 dark:text-red-400 shadow-sm'
              : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <MessageSquare className="w-4 h-4 inline mr-2" />
          Threads ({threads.length})
        </button>
        <button
          onClick={() => setActiveTab('posts')}
          className={`flex-1 min-w-max py-3 px-4 rounded-md font-medium transition-colors ${
            activeTab === 'posts'
              ? 'bg-white dark:bg-gray-700 text-red-600 dark:text-red-400 shadow-sm'
              : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <MessageSquare className="w-4 h-4 inline mr-2" />
          Posts ({posts.length})
        </button>
      </div>

      {/* Content */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* User Management */}
        {activeTab === 'users' && (
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Manage Users ({filteredUsers.total} of {users.length})
              </h2>
            </div>

            <SearchBar
              searchTerm={searchTerms.users}
              onSearchChange={(term) => updateSearchTerm('users', term)}
              placeholder="Search users by username, bio, or title..."
            />

            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  {filteredUsers.data.map((user) => (
                    <div key={user.id} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-4 flex-1">
                          <UserBadge profile={user} />
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            <div>Posts: {user.post_count}</div>
                            <div>Reputation: {user.reputation}</div>
                            <div>Joined: {new Date(user.created_at).toLocaleDateString()}</div>
                          </div>
                        </div>

                        <div className="flex flex-col space-y-3 ml-4">
                          {/* Honorable Title Management */}
                          <div className="flex items-center space-x-2">
                            {editingTitle === user.id ? (
                              <div className="flex items-center space-x-2">
                                <input
                                  type="text"
                                  value={titleForm}
                                  onChange={(e) => setTitleForm(e.target.value)}
                                  placeholder="Enter honorable title"
                                  className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                                />
                                <button
                                  onClick={() => updateHonorableTitle(user.id, titleForm)}
                                  className="p-1 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded transition-colors"
                                  title="Save title"
                                >
                                  <Save className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => {
                                    setEditingTitle(null);
                                    setTitleForm('');
                                  }}
                                  className="p-1 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                                  title="Cancel"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => startEditingTitle(user.id, user.honorable_title)}
                                className="flex items-center space-x-1 p-2 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors"
                                title="Edit honorable title"
                              >
                                <Award className="w-4 h-4" />
                                <span className="text-sm">
                                  {user.honorable_title || 'Set Title'}
                                </span>
                              </button>
                            )}
                          </div>

                          {/* User Controls */}
                          <div className="flex items-center space-x-2">
                            {/* Reputation Controls */}
                            <div className="flex items-center space-x-1">
                              <button
                                onClick={() => updateUserReputation(user.id, -10)}
                                className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                title="Remove 10 reputation"
                              >
                                <Minus className="w-4 h-4" />
                              </button>
                              <span className="text-sm font-medium px-2 text-gray-700 dark:text-gray-300">Rep</span>
                              <button
                                onClick={() => updateUserReputation(user.id, 10)}
                                className="p-2 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                                title="Add 10 reputation"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>

                            {/* Verification Toggle */}
                            <button
                              onClick={() => updateUserVerification(user.id, !user.is_verified)}
                              className={`p-2 rounded-lg transition-colors ${
                                user.is_verified
                                  ? 'text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                                  : 'text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'
                              }`}
                              title={user.is_verified ? 'Remove verification' : 'Verify user'}
                            >
                              <CheckCircle className="w-5 h-5" />
                            </button>

                            {/* Admin Toggle - Only show for owners */}
                            {currentUser?.is_owner && (
                              <button
                                onClick={() => toggleAdminStatus(user.id, !user.is_admin)}
                                disabled={user.is_owner}
                                className={`p-2 rounded-lg transition-colors ${
                                  user.is_admin
                                    ? 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20'
                                    : 'text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'
                                } ${user.is_owner ? 'opacity-50 cursor-not-allowed' : ''}`}
                                title={user.is_owner ? 'Cannot modify owner status' : (user.is_admin ? 'Remove admin' : 'Make admin')}
                              >
                                <Shield className="w-5 h-5" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <PaginationControls
                  currentPage={currentPages.users}
                  totalPages={filteredUsers.totalPages}
                  pageSize={pageSizes.users}
                  totalItems={filteredUsers.total}
                  onPageChange={(page) => updateCurrentPage('users', page)}
                  onPageSizeChange={(size) => updatePageSize('users', size)}
                  tab="users"
                />
              </>
            )}
          </div>
        )}

        {/* Verification Requests */}
        {activeTab === 'verifications' && (
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Verification Requests ({filteredVerifications.total} of {verificationRequests.length})
              </h2>
            </div>

            <SearchBar
              searchTerm={searchTerms.verifications}
              onSearchChange={(term) => updateSearchTerm('verifications', term)}
              placeholder="Search verification requests by content, username, or status..."
            />

            <div className="space-y-4">
              {filteredVerifications.data.map((request) => (
                <div key={request.id} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <UserBadge profile={request.profiles} size="sm" showLevel={false} />
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          request.status === 'pending' 
                            ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400'
                            : request.status === 'approved'
                            ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400'
                            : 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400'
                        }`}>
                          {request.status}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(request.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-700 dark:text-gray-300 mb-3 line-clamp-2">
                        {request.content}
                      </p>
                      
                      {request.images && request.images.length > 0 && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                          {request.images.length} image(s) attached
                        </div>
                      )}
                      
                      {request.admin_notes && (
                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded p-2 mt-2">
                          <div className="text-xs font-medium text-blue-800 dark:text-blue-400 mb-1">Admin Notes:</div>
                          <div className="text-xs text-blue-700 dark:text-blue-300">{request.admin_notes}</div>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => setSelectedVerification(request)}
                        className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                        title="View details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <PaginationControls
              currentPage={currentPages.verifications}
              totalPages={filteredVerifications.totalPages}
              pageSize={pageSizes.verifications}
              totalItems={filteredVerifications.total}
              onPageChange={(page) => updateCurrentPage('verifications', page)}
              onPageSizeChange={(size) => updatePageSize('verifications', size)}
              tab="verifications"
            />
          </div>
        )}

        {/* Category Management */}
        {activeTab === 'categories' && (
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Manage Categories ({filteredCategories.total} of {categories.length})
              </h2>
            </div>

            <SearchBar
              searchTerm={searchTerms.categories}
              onSearchChange={(term) => updateSearchTerm('categories', term)}
              placeholder="Search categories by name or description..."
            />

            {/* Category Form */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-6">
              <h3 className="font-medium text-gray-900 dark:text-white mb-4">
                {editingCategory ? 'Edit Category' : 'Create New Category'}
              </h3>
              <form onSubmit={handleCategorySubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
                    <input
                      type="text"
                      value={categoryForm.name}
                      onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Color</label>
                    <input
                      type="color"
                      value={categoryForm.color}
                      onChange={(e) => setCategoryForm({ ...categoryForm, color: e.target.value })}
                      className="w-full h-10 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      type="submit"
                      className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition-colors flex items-center justify-center space-x-2"
                    >
                      <Save className="w-4 h-4" />
                      <span>{editingCategory ? 'Update' : 'Create'}</span>
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                  <textarea
                    value={categoryForm.description}
                    onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  />
                </div>
                {editingCategory && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingCategory(null);
                      setCategoryForm({ id: '', name: '', description: '', color: '#3b82f6' });
                    }}
                    className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                  >
                    Cancel Edit
                  </button>
                )}
              </form>
            </div>

            {/* Categories List */}
            <div className="space-y-3">
              {filteredCategories.data.map((category) => (
                <div key={category.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-6 h-6 rounded-full"
                        style={{ backgroundColor: category.color }}
                      ></div>
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">{category.name}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{category.description}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-500">
                          {threads.filter(t => t.category_id === category.id).length} threads
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => editCategory(category)}
                        className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                        title="Edit category"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteCategory(category.id)}
                        className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title="Delete category"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <PaginationControls
              currentPage={currentPages.categories}
              totalPages={filteredCategories.totalPages}
              pageSize={pageSizes.categories}
              totalItems={filteredCategories.total}
              onPageChange={(page) => updateCurrentPage('categories', page)}
              onPageSizeChange={(size) => updatePageSize('categories', size)}
              tab="categories"
            />
          </div>
        )}

        {/* Thread Management */}
        {activeTab === 'threads' && (
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Manage Threads ({filteredThreads.total} of {threads.length})
              </h2>
            </div>

            <SearchBar
              searchTerm={searchTerms.threads}
              onSearchChange={(term) => updateSearchTerm('threads', term)}
              placeholder="Search threads by title, content, author, or category..."
            />

            <div className="space-y-3">
              {filteredThreads.data.map((thread) => (
                <div key={thread.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        {thread.is_pinned && <Pin className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />}
                        {thread.is_locked && <Lock className="w-4 h-4 text-red-600 dark:text-red-400" />}
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
                      <h4 className="font-medium text-gray-900 dark:text-white mb-1">{thread.title}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">{thread.content}</p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-500">
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
                            ? 'text-yellow-600 dark:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-900/20'
                            : 'text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                        title={thread.is_pinned ? 'Unpin thread' : 'Pin thread'}
                      >
                        <Pin className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => toggleThreadLock(thread.id, thread.is_locked)}
                        className={`p-2 rounded-lg transition-colors ${
                          thread.is_locked
                            ? 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20'
                            : 'text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                        title={thread.is_locked ? 'Unlock thread' : 'Lock thread'}
                      >
                        {thread.is_locked ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => deleteThread(thread.id)}
                        className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title="Delete thread"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <PaginationControls
              currentPage={currentPages.threads}
              totalPages={filteredThreads.totalPages}
              pageSize={pageSizes.threads}
              totalItems={filteredThreads.total}
              onPageChange={(page) => updateCurrentPage('threads', page)}
              onPageSizeChange={(size) => updatePageSize('threads', size)}
              tab="threads"
            />
          </div>
        )}

        {/* Post Management */}
        {activeTab === 'posts' && (
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Manage Posts ({filteredPosts.total} of {posts.length})
              </h2>
            </div>

            <SearchBar
              searchTerm={searchTerms.posts}
              onSearchChange={(term) => updateSearchTerm('posts', term)}
              placeholder="Search posts by content, author, or thread title..."
            />

            <div className="space-y-3">
              {filteredPosts.data.map((post) => (
                <div key={post.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <UserBadge profile={post.profiles} size="sm" showLevel={false} />
                        <span className="text-xs text-gray-500 dark:text-gray-500">
                          in thread: {post.threads?.title}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300 mb-2 line-clamp-3">{post.content}</p>
                      <div className="text-xs text-gray-500 dark:text-gray-500">
                        {new Date(post.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => deletePost(post.id)}
                        className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title="Delete post"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <PaginationControls
              currentPage={currentPages.posts}
              totalPages={filteredPosts.totalPages}
              pageSize={pageSizes.posts}
              totalItems={filteredPosts.total}
              onPageChange={(page) => updateCurrentPage('posts', page)}
              onPageSizeChange={(size) => updatePageSize('posts', size)}
              tab="posts"
            />
          </div>
        )}
      </div>

      {/* Verification Request Detail Modal */}
      {selectedVerification && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-4xl relative overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 to-purple-600"></div>
            
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <Upload className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Verification Request</h2>
                </div>
                <button
                  onClick={() => setSelectedVerification(null)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                </button>
              </div>

              <div className="space-y-6">
                {/* User Info */}
                <div className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <UserBadge profile={selectedVerification.profiles} />
                  <div className="flex-1">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Submitted: {new Date(selectedVerification.created_at).toLocaleDateString()}
                    </div>
                    <div className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      selectedVerification.status === 'pending' 
                        ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400'
                        : selectedVerification.status === 'approved'
                        ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400'
                        : 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400'
                    }`}>
                      {selectedVerification.status}
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white mb-3">Verification Details</h3>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                      {selectedVerification.content}
                    </p>
                  </div>
                </div>

                {/* Images */}
                {selectedVerification.images && selectedVerification.images.length > 0 && (
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white mb-3">Supporting Images</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {selectedVerification.images.map((imageUrl: string, index: number) => (
                        <div key={index} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-2">
                          <img
                            src={imageUrl}
                            alt={`Verification image ${index + 1}`}
                            className="w-full h-48 object-cover rounded"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              e.currentTarget.nextElementSibling?.classList.remove('hidden');
                            }}
                          />
                          <div className="hidden text-center text-gray-500 dark:text-gray-400 text-sm mt-2">
                            Failed to load image
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Admin Notes */}
                {selectedVerification.admin_notes && (
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white mb-3">Admin Notes</h3>
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                      <p className="text-blue-700 dark:text-blue-300">
                        {selectedVerification.admin_notes}
                      </p>
                    </div>
                  </div>
                )}

                {/* Actions */}
                {selectedVerification.status === 'pending' && (
                  <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                      onClick={() => {
                        const notes = prompt('Admin notes (optional):');
                        handleVerificationAction(selectedVerification.id, 'rejected', notes || undefined);
                      }}
                      className="px-6 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => {
                        const notes = prompt('Admin notes (optional):');
                        handleVerificationAction(selectedVerification.id, 'approved', notes || undefined);
                      }}
                      className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                    >
                      Approve
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}