/**
 * Forum Controller
 * Manages peer support forum posts and comments
 */

import ForumPost from '../models/ForumPost.js';
import ForumComment from '../models/ForumComment.js';
import User from '../models/User.js';
import { sanitizeInput } from '../utils/redaction.js';
import { getAuth, clerkClient } from '@clerk/express';

/**
 * GET /api/v1/forum/posts
 * Get forum posts with filtering and pagination
 */
export const getPosts = async (req, res, next) => {
  try {
    const { category, tags, page = 1, limit = 20 } = req.query;

    const query = { isActive: true, isApproved: true };

    if (category) query.category = category;
    if (tags) {
      const tagArray = tags.split(',').map(t => t.trim().toLowerCase());
      query.tags = { $in: tagArray };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const posts = await ForumPost.find(query)
      .sort({ isPinned: -1, createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip)
      .select('-flaggedBy')
      .lean();
    
    // Populate usernames for non-anonymous posts from Clerk
    for (const post of posts) {
      if (!post.anonymous && post.authorId) {
        try {
          const clerkUser = await clerkClient.users.getUser(post.authorId);
          post.username = clerkUser.publicMetadata?.username || 'Student';
        } catch (error) {
          post.username = 'Student';
        }
      }
    }

    const total = await ForumPost.countDocuments(query);

    res.json({
      posts,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/forum/posts/:id
 * Get single post with comments
 */
export const getPostById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const post = await ForumPost.findById(id);

    if (!post || !post.isActive || !post.isApproved) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Increment view count
    post.views += 1;
    await post.save();

    // Get comments
    const comments = await ForumComment.find({ 
      postId: id, 
      isActive: true, 
      isApproved: true 
    })
      .sort({ createdAt: 1 })
      .select('-flaggedBy')
      .lean();
    
    // Populate usernames for non-anonymous comments from Clerk
    for (const comment of comments) {
      if (!comment.anonymous && comment.authorId) {
        try {
          const clerkUser = await clerkClient.users.getUser(comment.authorId);
          comment.username = clerkUser.publicMetadata?.username || 'Student';
        } catch (error) {
          comment.username = 'Student';
        }
      }
    }

    res.json({ post, comments });

  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/forum/posts
 * Create new forum post
 */
export const createPost = async (req, res, next) => {
  try {
    const { userId } = getAuth(req);
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { title, content, category, tags, anonymous } = req.body;

    // Validate required fields
    if (!title || !content) {
      return res.status(400).json({ 
        error: 'Missing required fields: title, content' 
      });
    }

    // Sanitize input
    const sanitizedTitle = sanitizeInput(title);
    const sanitizedContent = sanitizeInput(content);

    // Get username for non-anonymous posts or generate pseudonym
    let pseudonym = null;
    let username = null;
    
    if (anonymous) {
      const adjectives = ['Brave', 'Kind', 'Strong', 'Wise', 'Calm', 'Hopeful'];
      const nouns = ['Student', 'Learner', 'Friend', 'Warrior', 'Soul', 'Mind'];
      pseudonym = `${adjectives[Math.floor(Math.random() * adjectives.length)]} ${nouns[Math.floor(Math.random() * nouns.length)]}`;
    } else {
      try {
        const clerkUser = await clerkClient.users.getUser(userId);
        username = clerkUser.publicMetadata?.username || 'Student';
      } catch (error) {
        username = 'Student';
      }
    }

    const post = new ForumPost({
      authorId: anonymous ? null : userId,
      anonymous: anonymous || false,
      pseudonym,
      username,
      title: sanitizedTitle,
      content: sanitizedContent,
      category: category || 'general',
      tags: tags || [],
      isApproved: true // Auto-approve for now, can add moderation queue later
    });

    await post.save();

    res.status(201).json({
      message: 'Post created successfully',
      post
    });

  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/forum/posts/:id/comments
 * Add comment to post
 */
export const addComment = async (req, res, next) => {
  try {
    const { userId } = getAuth(req);
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id } = req.params;
    const { content, anonymous } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    // Check if post exists
    const post = await ForumPost.findById(id);

    if (!post || !post.isActive) {
      return res.status(404).json({ error: 'Post not found' });
    }

    if (post.isLocked) {
      return res.status(403).json({ error: 'Post is locked for comments' });
    }

    // Sanitize input
    const sanitizedContent = sanitizeInput(content);

    // Get username for non-anonymous comments or generate pseudonym
    let pseudonym = null;
    let username = null;
    
    if (anonymous) {
      const adjectives = ['Supportive', 'Caring', 'Understanding', 'Thoughtful', 'Helpful'];
      const nouns = ['Friend', 'Peer', 'Listener', 'Companion', 'Ally'];
      pseudonym = `${adjectives[Math.floor(Math.random() * adjectives.length)]} ${nouns[Math.floor(Math.random() * nouns.length)]}`;
    } else {
      try {
        const clerkUser = await clerkClient.users.getUser(userId);
        username = clerkUser.publicMetadata?.username || 'Student';
      } catch (error) {
        username = 'Student';
      }
    }

    const comment = new ForumComment({
      postId: id,
      authorId: anonymous ? null : userId,
      anonymous: anonymous || false,
      pseudonym,
      username,
      content: sanitizedContent,
      isApproved: true
    });

    await comment.save();

    // Update post's comment count
    post.commentsCount += 1;
    await post.save();

    res.status(201).json({
      message: 'Comment added successfully',
      comment
    });

  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/forum/posts/:id/like
 * Toggle like on post
 */
export const togglePostLike = async (req, res, next) => {
  try {
    const { userId } = getAuth(req);
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id } = req.params;

    const post = await ForumPost.findById(id);

    if (!post || !post.isActive) {
      return res.status(404).json({ error: 'Post not found' });
    }

    await post.toggleLike(userId);

    res.json({
      message: 'Like toggled',
      likes: post.likes,
      liked: post.likedBy.includes(userId)
    });

  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/forum/comments/:id/like
 * Toggle like on comment
 */
export const toggleCommentLike = async (req, res, next) => {
  try {
    const { userId } = getAuth(req);
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id } = req.params;

    const comment = await ForumComment.findById(id);

    if (!comment || !comment.isActive) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    await comment.toggleLike(userId);

    res.json({
      message: 'Like toggled',
      likes: comment.likes,
      liked: comment.likedBy.includes(userId)
    });

  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/forum/posts/:id/flag
 * Flag post for moderation
 */
export const flagPost = async (req, res, next) => {
  try {
    const { userId } = getAuth(req);
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id } = req.params;
    const { reason } = req.body;

    const post = await ForumPost.findById(id);

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Check if user already flagged this post
    const alreadyFlagged = post.flaggedBy.some(f => f.userId === userId);

    if (alreadyFlagged) {
      return res.status(400).json({ error: 'You have already flagged this post' });
    }

    await post.addFlag(userId, reason || 'No reason provided');

    res.json({
      message: 'Post flagged for review',
      flags: post.flags,
      reviewRequired: post.reviewRequired
    });

  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/v1/forum/posts/:id
 * Delete own post
 */
export const deletePost = async (req, res, next) => {
  try {
    const { userId } = getAuth(req);
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id } = req.params;

    const post = await ForumPost.findById(id);

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Check authorization
    const user = await User.findOne({ clerkId: userId });
    
    if (post.authorId !== userId && user.role !== 'admin' && user.role !== 'super_admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    // Soft delete
    post.isActive = false;
    await post.save();

    // Also soft delete all comments
    await ForumComment.updateMany(
      { postId: id },
      { $set: { isActive: false } }
    );

    res.json({ message: 'Post deleted successfully' });

  } catch (error) {
    next(error);
  }
};

export default {
  getPosts,
  getPostById,
  createPost,
  addComment,
  togglePostLike,
  toggleCommentLike,
  flagPost,
  deletePost
};
