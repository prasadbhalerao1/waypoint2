/**
 * Resource Controller
 * Manages mental health resources
 */

import Resource from '../models/Resource.js';
import User from '../models/User.js';
import { getAuth } from '@clerk/express';

/**
 * GET /api/v1/resources
 * Get resources with filtering and pagination
 */
export const getResources = async (req, res, next) => {
  try {
    const { 
      q, 
      type, 
      category, 
      language, 
      theme,
      tags,
      page = 1, 
      limit = 20 
    } = req.query;

    const query = { isPublished: true };

    // Text search
    if (q) {
      query.$text = { $search: q };
    }

    // Filters
    if (type) query.type = type;
    if (category) query.category = category;
    if (language) query.language = language;
    if (theme) query.themes = theme;
    if (tags) {
      const tagArray = tags.split(',').map(t => t.trim().toLowerCase());
      query.tags = { $in: tagArray };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const resources = await Resource.find(query)
      .sort({ isFeatured: -1, createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip)
      .select('-__v');

    const total = await Resource.countDocuments(query);

    res.json({
      resources,
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
 * GET /api/v1/resources/:id
 * Get single resource
 */
export const getResourceById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const resource = await Resource.findById(id);

    if (!resource) {
      return res.status(404).json({ error: 'Resource not found' });
    }

    if (!resource.isPublished) {
      return res.status(403).json({ error: 'Resource not available' });
    }

    // Increment view count
    await resource.incrementViews();

    res.json({ resource });

  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/resources
 * Create new resource (admin only)
 */
export const createResource = async (req, res, next) => {
  try {
    const { userId } = getAuth(req);
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Check if user is admin
    const user = await User.findOne({ clerkId: userId });
    
    if (!user || (user.role !== 'admin' && user.role !== 'super_admin' && user.email !== process.env.ADMIN_EMAIL)) {
      return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }

    const {
      title,
      description,
      type,
      url,
      thumbnail,
      language,
      tags,
      themes,
      category,
      level,
      duration,
      xpReward,
      author,
      source
    } = req.body;

    // Validate required fields
    if (!title || !type || !url) {
      return res.status(400).json({ 
        error: 'Missing required fields: title, type, url' 
      });
    }

    const resource = new Resource({
      title,
      description,
      type,
      url,
      thumbnail,
      language: language || 'en',
      tags: tags || [],
      themes: themes || ['all'],
      category,
      level: level || 'beginner',
      duration,
      xpReward: xpReward || 0,
      author,
      source,
      createdBy: userId,
      isPublished: true,
      publishedAt: new Date()
    });

    await resource.save();

    res.status(201).json({
      message: 'Resource created successfully',
      resource
    });

  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/v1/resources/:id
 * Update resource (admin only)
 */
export const updateResource = async (req, res, next) => {
  try {
    const { userId } = getAuth(req);
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const user = await User.findOne({ clerkId: userId });
    
    if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const { id } = req.params;
    const updates = req.body;

    const resource = await Resource.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!resource) {
      return res.status(404).json({ error: 'Resource not found' });
    }

    res.json({
      message: 'Resource updated successfully',
      resource
    });

  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/v1/resources/:id
 * Delete resource (admin only)
 */
export const deleteResource = async (req, res, next) => {
  try {
    const { userId } = getAuth(req);
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const user = await User.findOne({ clerkId: userId });
    
    if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const { id } = req.params;

    const resource = await Resource.findByIdAndDelete(id);

    if (!resource) {
      return res.status(404).json({ error: 'Resource not found' });
    }

    res.json({ message: 'Resource deleted successfully' });

  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/resources/:id/complete
 * Mark resource as completed (awards XP)
 */
export const completeResource = async (req, res, next) => {
  try {
    const { userId } = getAuth(req);
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id } = req.params;

    const resource = await Resource.findById(id);

    if (!resource) {
      return res.status(404).json({ error: 'Resource not found' });
    }

    // Increment completion count
    resource.completions += 1;
    await resource.save();

    // Award XP to user
    const user = await User.findOne({ clerkId: userId });
    
    if (user && resource.xpReward > 0) {
      await user.addXP(resource.xpReward);
    }

    res.json({
      message: 'Resource completed',
      xpAwarded: resource.xpReward,
      newXP: user?.xp,
      newLevel: user?.level
    });

  } catch (error) {
    next(error);
  }
};

export default {
  getResources,
  getResourceById,
  createResource,
  updateResource,
  deleteResource,
  completeResource
};
