import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '@clerk/clerk-react';
import { 
  MessageSquare, ThumbsUp, Flag, Send, Eye, Clock, 
  Plus, Search
} from 'lucide-react';

interface Post {
  _id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  likes: number;
  likedBy: string[];
  views: number;
  commentsCount: number;
  anonymous: boolean;
  pseudonym?: string;
  username?: string;
  authorId?: string;
  createdAt: string;
  isPinned: boolean;
}

interface Comment {
  _id: string;
  content: string;
  likes: number;
  likedBy: string[];
  anonymous: boolean;
  pseudonym?: string;
  username?: string;
  authorId?: string;
  createdAt: string;
}

const ForumNew: React.FC = () => {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://waypoint-demo-two-backend.vercel.app/api/v1';
  const navigate = useNavigate();
  const { currentTheme } = useTheme();
  const { getToken, userId } = useAuth();
  
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  // Create post form
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    category: 'general',
    tags: '',
    anonymous: false
  });
  
  // Comment form
  const [newComment, setNewComment] = useState({
    content: '',
    anonymous: false
  });

  const categories = [
    { value: 'all', label: 'All Posts', icon: '📋' },
    { value: 'general', label: 'General', icon: '💬' },
    { value: 'stress', label: 'Stress', icon: '😰' },
    { value: 'anxiety', label: 'Anxiety', icon: '😟' },
    { value: 'academic', label: 'Academic', icon: '📚' },
    { value: 'relationships', label: 'Relationships', icon: '❤️' },
    { value: 'success_stories', label: 'Success Stories', icon: '🌟' },
    { value: 'tips', label: 'Tips & Advice', icon: '💡' },
    { value: 'questions', label: 'Questions', icon: '❓' }
  ];

  useEffect(() => {
    loadPosts();
  }, [selectedCategory]);

  const loadPosts = async () => {
    setIsLoading(true);
    try {
      const url = selectedCategory === 'all' 
        ? `${API_BASE_URL}/forum/posts`
        : `${API_BASE_URL}/forum/posts?category=${selectedCategory}`;
      
      const response = await fetch(url, {
        credentials: 'include'
      });
      const data = await response.json();
      setPosts(data.posts || []);
    } catch (error) {
      console.error('Failed to load posts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadPostWithComments = async (postId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/forum/posts/${postId}`, {
        credentials: 'include'
      });
      const data = await response.json();
      setSelectedPost(data.post);
      setComments(data.comments || []);
    } catch (error) {
      console.error('Failed to load post:', error);
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const token = await getToken();
      const response = await fetch(`${API_BASE_URL}/forum/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include',
        body: JSON.stringify({
          ...newPost,
          tags: newPost.tags.split(',').map(t => t.trim()).filter(t => t)
        })
      });

      if (response.ok) {
        setShowCreatePost(false);
        setNewPost({ title: '', content: '', category: 'general', tags: '', anonymous: false });
        loadPosts();
      }
    } catch (error) {
      console.error('Failed to create post:', error);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedPost) return;
    
    try {
      const token = await getToken();
      const response = await fetch(`${API_BASE_URL}/forum/posts/${selectedPost._id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include',
        body: JSON.stringify(newComment)
      });

      if (response.ok) {
        setNewComment({ content: '', anonymous: false });
        loadPostWithComments(selectedPost._id);
      }
    } catch (error) {
      console.error('Failed to add comment:', error);
    }
  };

  const handleLikePost = async (postId: string) => {
    try {
      const token = await getToken();
      const response = await fetch(`${API_BASE_URL}/forum/posts/${postId}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        
        // Update posts list
        setPosts(posts.map(p => 
          p._id === postId 
            ? { ...p, likes: data.likes, likedBy: data.liked ? [...p.likedBy, userId!] : p.likedBy.filter(id => id !== userId) }
            : p
        ));
        
        // Update selected post if viewing
        if (selectedPost?._id === postId) {
          setSelectedPost({
            ...selectedPost,
            likes: data.likes,
            likedBy: data.liked ? [...selectedPost.likedBy, userId!] : selectedPost.likedBy.filter(id => id !== userId)
          });
        }
      }
    } catch (error) {
      console.error('Failed to like post:', error);
    }
  };

  const handleLikeComment = async (commentId: string) => {
    try {
      const token = await getToken();
      const response = await fetch(`${API_BASE_URL}/forum/comments/${commentId}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setComments(comments.map(c => 
          c._id === commentId 
            ? { ...c, likes: data.likes, likedBy: data.liked ? [...c.likedBy, userId!] : c.likedBy.filter(id => id !== userId) }
            : c
        ));
      }
    } catch (error) {
      console.error('Failed to like comment:', error);
    }
  };

  const handleFlagPost = async (postId: string) => {
    const reason = prompt('Please provide a reason for flagging this post:');
    if (!reason) return;

    try {
      const token = await getToken();
      await fetch(`${API_BASE_URL}/forum/posts/${postId}/flag`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include',
        body: JSON.stringify({ reason })
      });
      
      alert('Post flagged for moderation. Thank you for helping keep our community safe.');
    } catch (error) {
      console.error('Failed to flag post:', error);
    }
  };

  const formatTimeAgo = (date: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return new Date(date).toLocaleDateString();
  };

  if (selectedPost) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => setSelectedPost(null)}
            className="mb-6 text-gray-600 hover:text-gray-800 flex items-center"
          >
            ← Back to Forum
          </button>

          {/* Post Detail */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            {selectedPost.isPinned && (
              <div className="inline-block px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full mb-3">
                📌 Pinned
              </div>
            )}
            
            <h1 className="text-3xl font-bold text-gray-800 mb-4">{selectedPost.title}</h1>
            
            <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
              <span>
                {selectedPost.anonymous ? selectedPost.pseudonym : (selectedPost.username || 'Student')}
              </span>
              <span>•</span>
              <span className="flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                {formatTimeAgo(selectedPost.createdAt)}
              </span>
              <span>•</span>
              <span className="flex items-center">
                <Eye className="w-4 h-4 mr-1" />
                {selectedPost.views} views
              </span>
            </div>

            <div className="prose max-w-none mb-6">
              <p className="text-gray-700 whitespace-pre-wrap">{selectedPost.content}</p>
            </div>

            {selectedPost.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {selectedPost.tags.map(tag => (
                  <span key={tag} className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            <div className="flex items-center space-x-4 pt-4 border-t">
              <button
                onClick={() => handleLikePost(selectedPost._id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                  selectedPost.likedBy.includes(userId!)
                    ? 'bg-blue-100 text-blue-600'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <ThumbsUp className="w-4 h-4" />
                <span>{selectedPost.likes}</span>
              </button>

              <button
                onClick={() => handleFlagPost(selectedPost._id)}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-red-50 hover:text-red-600 transition-all"
              >
                <Flag className="w-4 h-4" />
                <span>Report</span>
              </button>
            </div>
          </div>

          {/* Comments Section */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Comments ({selectedPost.commentsCount})
            </h2>

            {/* Add Comment Form */}
            <form onSubmit={handleAddComment} className="mb-6">
              <textarea
                value={newComment.content}
                onChange={(e) => setNewComment({ ...newComment, content: e.target.value })}
                placeholder="Share your thoughts..."
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent resize-none"
                style={{ '--tw-ring-color': currentTheme.primary } as React.CSSProperties}
                required
              />
              
              <div className="flex items-center justify-between mt-3">
                <label className="flex items-center space-x-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={newComment.anonymous}
                    onChange={(e) => setNewComment({ ...newComment, anonymous: e.target.checked })}
                    className="rounded"
                  />
                  <span>Post anonymously</span>
                </label>

                <button
                  type="submit"
                  className="flex items-center space-x-2 px-6 py-2 text-white rounded-lg transition-all hover:scale-105"
                  style={{ backgroundColor: currentTheme.primary }}
                >
                  <Send className="w-4 h-4" />
                  <span>Comment</span>
                </button>
              </div>
            </form>

            {/* Comments List */}
            <div className="space-y-4">
              {comments.map(comment => (
                <div key={comment._id} className="border-l-4 pl-4 py-3" style={{ borderColor: currentTheme.primary + '40' }}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2 text-sm">
                      <span className="font-medium text-gray-700">
                        {comment.anonymous ? comment.pseudonym : (comment.username || 'Student')}
                      </span>
                      <span className="text-gray-400">•</span>
                      <span className="text-gray-500">{formatTimeAgo(comment.createdAt)}</span>
                    </div>
                  </div>
                  
                  <p className="text-gray-700 mb-3">{comment.content}</p>
                  
                  <button
                    onClick={() => handleLikeComment(comment._id)}
                    className={`flex items-center space-x-1 text-sm ${
                      comment.likedBy.includes(userId!)
                        ? 'text-blue-600'
                        : 'text-gray-500 hover:text-blue-600'
                    }`}
                  >
                    <ThumbsUp className="w-4 h-4" />
                    <span>{comment.likes}</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (showCreatePost) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-8">
        <div className="max-w-3xl mx-auto">
          <button
            onClick={() => setShowCreatePost(false)}
            className="mb-6 text-gray-600 hover:text-gray-800"
          >
            ← Back to Forum
          </button>

          <div className="bg-white rounded-xl shadow-lg p-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Create New Post</h1>

            <form onSubmit={handleCreatePost} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={newPost.title}
                  onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                  placeholder="What's on your mind?"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent"
                  style={{ '--tw-ring-color': currentTheme.primary } as React.CSSProperties}
                  maxLength={200}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  value={newPost.category}
                  onChange={(e) => setNewPost({ ...newPost, category: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent"
                  style={{ '--tw-ring-color': currentTheme.primary } as React.CSSProperties}
                >
                  {categories.filter(c => c.value !== 'all').map(cat => (
                    <option key={cat.value} value={cat.value}>
                      {cat.icon} {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Content *
                </label>
                <textarea
                  value={newPost.content}
                  onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                  placeholder="Share your thoughts, experiences, or questions..."
                  rows={8}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent resize-none"
                  style={{ '--tw-ring-color': currentTheme.primary } as React.CSSProperties}
                  maxLength={5000}
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  {newPost.content.length} / 5000 characters
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  value={newPost.tags}
                  onChange={(e) => setNewPost({ ...newPost, tags: e.target.value })}
                  placeholder="e.g., exam-stress, coping-strategies, self-care"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent"
                  style={{ '--tw-ring-color': currentTheme.primary } as React.CSSProperties}
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <label className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    checked={newPost.anonymous}
                    onChange={(e) => setNewPost({ ...newPost, anonymous: e.target.checked })}
                    className="mt-1 rounded"
                  />
                  <div>
                    <span className="font-medium text-blue-900">Post anonymously</span>
                    <p className="text-sm text-blue-700 mt-1">
                      Your identity will be hidden and replaced with a random pseudonym. 
                      This helps maintain privacy while sharing sensitive experiences.
                    </p>
                  </div>
                </label>
              </div>

              <div className="flex space-x-4">
                <button
                  type="submit"
                  className="flex-1 py-3 text-white rounded-lg font-medium transition-all hover:scale-105"
                  style={{ backgroundColor: currentTheme.primary }}
                >
                  Publish Post
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreatePost(false)}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Peer Support Forum</h1>
          <p className="text-lg text-gray-600">
            A safe space to share experiences, seek advice, and support each other
          </p>
        </div>

        {/* Actions Bar */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <button
            onClick={() => setShowCreatePost(true)}
            className="flex items-center space-x-2 px-6 py-3 text-white rounded-lg font-medium transition-all hover:scale-105 shadow-lg"
            style={{ backgroundColor: currentTheme.primary }}
          >
            <Plus className="w-5 h-5" />
            <span>New Post</span>
          </button>

          <div className="flex items-center space-x-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search posts..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent"
                style={{ '--tw-ring-color': currentTheme.primary } as React.CSSProperties}
              />
            </div>
          </div>
        </div>

        {/* Categories */}
        <div className="flex overflow-x-auto space-x-2 mb-6 pb-2">
          {categories.map(cat => (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
                selectedCategory === cat.value
                  ? 'text-white shadow-md'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
              style={{
                backgroundColor: selectedCategory === cat.value ? currentTheme.primary : undefined
              }}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Posts List */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto" 
                 style={{ borderColor: currentTheme.primary }} />
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl">
            <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No posts yet. Be the first to start a conversation!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map(post => (
              <div
                key={post._id}
                onClick={() => loadPostWithComments(post._id)}
                className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all cursor-pointer"
              >
                {post.isPinned && (
                  <div className="inline-block px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full mb-3">
                    📌 Pinned
                  </div>
                )}
                
                <h2 className="text-xl font-bold text-gray-800 mb-2 hover:text-blue-600">
                  {post.title}
                </h2>
                
                <p className="text-gray-600 mb-4 line-clamp-2">{post.content}</p>
                
                {post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {post.tags.slice(0, 3).map(tag => (
                      <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
                
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center space-x-4">
                    <span>{post.anonymous ? post.pseudonym : (post.username || 'Student')}</span>
                    <span>•</span>
                    <span>{formatTimeAgo(post.createdAt)}</span>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <span className="flex items-center space-x-1">
                      <ThumbsUp className="w-4 h-4" />
                      <span>{post.likes}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <MessageSquare className="w-4 h-4" />
                      <span>{post.commentsCount}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Eye className="w-4 h-4" />
                      <span>{post.views}</span>
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ForumNew;
