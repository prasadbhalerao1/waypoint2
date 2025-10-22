/**
 * Database Seed Script
 * Populates database with demo data
 * Run with: npm run seed
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Resource from '../models/Resource.js';
import ForumPost from '../models/ForumPost.js';
import Booking from '../models/Booking.js';
import connectDB from '../config/db.js';

dotenv.config();

// Demo data
const demoUsers = [
  {
    clerkId: 'user_demo_student_1',
    role: 'student',
    email: 'student1@example.edu',
    name: 'Demo Student',
    course: 'Computer Science',
    year: 2,
    language: 'en',
    theme: 'home_ground',
    xp: 150,
    level: 2,
    currentMood: 4,
    onboardingComplete: true,
    consents: {
      screenings: true,
      analytics: true,
      counsellorSharing: true,
      timestamp: new Date()
    }
  },
  {
    clerkId: 'user_demo_counsellor_1',
    role: 'counsellor',
    email: 'counsellor1@example.edu',
    name: 'Dr. Priya Sharma',
    counsellorProfile: {
      specializations: ['anxiety', 'stress', 'academic'],
      languages: ['en', 'hi'],
      credentials: 'PhD in Clinical Psychology',
      verified: true,
      verifiedAt: new Date(),
      bio: 'Experienced counsellor specializing in student mental health',
      experience: 8,
      availability: [
        {
          day: 'Mon',
          slots: [
            { start: '09:00', end: '10:00' },
            { start: '14:00', end: '15:00' }
          ]
        },
        {
          day: 'Wed',
          slots: [
            { start: '10:00', end: '11:00' },
            { start: '15:00', end: '16:00' }
          ]
        }
      ]
    },
    onboardingComplete: true
  },
  {
    clerkId: 'user_demo_counsellor_2',
    role: 'counsellor',
    email: 'counsellor2@example.edu',
    name: 'Dr. Rajesh Kumar',
    counsellorProfile: {
      specializations: ['depression', 'relationships', 'general'],
      languages: ['en', 'hi', 'ta'],
      credentials: 'MD Psychiatry',
      verified: true,
      verifiedAt: new Date(),
      bio: 'Compassionate psychiatrist with focus on holistic wellness',
      experience: 12,
      availability: [
        {
          day: 'Tue',
          slots: [
            { start: '11:00', end: '12:00' },
            { start: '16:00', end: '17:00' }
          ]
        },
        {
          day: 'Thu',
          slots: [
            { start: '09:00', end: '10:00' },
            { start: '14:00', end: '15:00' }
          ]
        }
      ]
    },
    onboardingComplete: true
  }
];

const demoResources = [
  {
    title: 'Managing Academic Stress: A Student\'s Guide',
    description: 'Comprehensive guide to handling exam pressure and academic challenges',
    type: 'article',
    url: 'https://example.com/resources/academic-stress',
    language: 'en',
    tags: ['stress', 'academic', 'exams'],
    themes: ['all'],
    category: 'academic',
    level: 'beginner',
    duration: 10,
    xpReward: 10,
    isPublished: true,
    publishedAt: new Date()
  },
  {
    title: 'Guided Meditation for Anxiety Relief',
    description: '15-minute guided meditation to calm anxiety and promote relaxation',
    type: 'audio',
    url: 'https://example.com/resources/meditation-anxiety',
    language: 'en',
    tags: ['anxiety', 'meditation', 'relaxation'],
    themes: ['calm', 'all'],
    category: 'anxiety',
    level: 'beginner',
    duration: 15,
    xpReward: 15,
    isPublished: true,
    publishedAt: new Date()
  },
  {
    title: 'Sleep Better: Hygiene Tips for Students',
    description: 'Evidence-based sleep hygiene practices for better rest and recovery',
    type: 'video',
    url: 'https://example.com/resources/sleep-hygiene',
    language: 'en',
    tags: ['sleep', 'wellness', 'health'],
    themes: ['sleep', 'all'],
    category: 'general',
    level: 'beginner',
    duration: 8,
    xpReward: 10,
    isPublished: true,
    publishedAt: new Date()
  },
  {
    title: 'तनाव प्रबंधन: छात्रों के लिए गाइड',
    description: 'तनाव को प्रबंधित करने के लिए व्यावहारिक सुझाव',
    type: 'article',
    url: 'https://example.com/resources/stress-management-hindi',
    language: 'hi',
    tags: ['stress', 'wellness'],
    themes: ['all'],
    category: 'stress',
    level: 'beginner',
    duration: 12,
    xpReward: 10,
    isPublished: true,
    publishedAt: new Date()
  },
  {
    title: 'Building Resilience Through CBT',
    description: 'Learn cognitive behavioral techniques to build mental resilience',
    type: 'module',
    url: 'https://example.com/resources/cbt-resilience',
    language: 'en',
    tags: ['cbt', 'resilience', 'mental-health'],
    themes: ['all'],
    category: 'general',
    level: 'intermediate',
    duration: 30,
    xpReward: 25,
    isPublished: true,
    publishedAt: new Date()
  },
  {
    title: 'Mindfulness for Exam Anxiety',
    description: 'Quick mindfulness exercises to manage pre-exam stress',
    type: 'exercise',
    url: 'https://example.com/resources/mindfulness-exams',
    language: 'en',
    tags: ['mindfulness', 'anxiety', 'exams'],
    themes: ['focus', 'all'],
    category: 'academic',
    level: 'beginner',
    duration: 5,
    xpReward: 5,
    isPublished: true,
    publishedAt: new Date()
  }
];

const demoForumPosts = [
  {
    authorId: 'user_demo_student_1',
    anonymous: false,
    title: 'How I overcame exam anxiety',
    content: 'I wanted to share my journey of dealing with severe exam anxiety. What helped me the most was breaking down my study into smaller chunks and practicing breathing exercises before each exam. The 4-7-8 technique from the resources section was a game-changer!',
    category: 'success_stories',
    tags: ['anxiety', 'exams', 'success'],
    likes: 12,
    views: 45,
    commentsCount: 3,
    isApproved: true
  },
  {
    authorId: null,
    anonymous: true,
    pseudonym: 'Hopeful Student',
    title: 'Struggling with motivation - any tips?',
    content: 'I\'ve been finding it really hard to stay motivated lately. Everything feels overwhelming and I can\'t seem to focus on my studies. Has anyone else felt this way? What helped you?',
    category: 'questions',
    tags: ['motivation', 'academic', 'support'],
    likes: 8,
    views: 32,
    commentsCount: 5,
    isApproved: true
  },
  {
    authorId: null,
    anonymous: true,
    pseudonym: 'Brave Warrior',
    title: 'The importance of talking about mental health',
    content: 'I just wanted to say how grateful I am for this platform. For the longest time, I felt like I couldn\'t talk about my struggles. But sharing here and talking to a counselor has made such a difference. Don\'t be afraid to reach out!',
    category: 'general',
    tags: ['mental-health', 'support', 'encouragement'],
    likes: 25,
    views: 78,
    commentsCount: 7,
    isPinned: true,
    isApproved: true
  }
];

// Seed function
async function seed() {
  try {
    console.log('🌱 Starting database seed...');

    // Connect to database
    await connectDB();

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await User.deleteMany({});
    await Resource.deleteMany({});
    await ForumPost.deleteMany({});
    await Booking.deleteMany({});

    // Insert users
    console.log('👥 Creating demo users...');
    const users = await User.insertMany(demoUsers);
    console.log(`✅ Created ${users.length} users`);

    // Insert resources
    console.log('📚 Creating demo resources...');
    const resources = await Resource.insertMany(demoResources);
    console.log(`✅ Created ${resources.length} resources`);

    // Insert forum posts
    console.log('💬 Creating demo forum posts...');
    const posts = await ForumPost.insertMany(demoForumPosts);
    console.log(`✅ Created ${posts.length} forum posts`);

    // Create sample bookings
    console.log('📅 Creating demo bookings...');
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0);

    const bookings = await Booking.insertMany([
      {
        studentId: 'user_demo_student_1',
        counsellorId: 'user_demo_counsellor_1',
        start: tomorrow,
        end: new Date(tomorrow.getTime() + 60 * 60 * 1000), // 1 hour later
        consentGiven: true,
        status: 'confirmed',
        reason: 'Exam stress management'
      }
    ]);
    console.log(`✅ Created ${bookings.length} bookings`);

    // Print summary
    console.log('\n✨ Seed completed successfully!\n');
    console.log('📊 Summary:');
    console.log(`   - Users: ${users.length} (${users.filter(u => u.role === 'student').length} students, ${users.filter(u => u.role === 'counsellor').length} counsellors)`);
    console.log(`   - Resources: ${resources.length}`);
    console.log(`   - Forum Posts: ${posts.length}`);
    console.log(`   - Bookings: ${bookings.length}`);
    
    console.log('\n🔗 Sample API endpoints to test:');
    console.log('   GET  http://localhost:4000/api/v1/resources');
    console.log('   GET  http://localhost:4000/api/v1/forum/posts');
    console.log('   GET  http://localhost:4000/api/v1/bookings/counsellors/available');
    console.log('   POST http://localhost:4000/api/v1/chat (requires auth)');
    console.log('   GET  http://localhost:4000/api/v1/admin/analytics (requires admin auth)');
    
    console.log('\n💡 Demo credentials:');
    console.log('   Student: student1@example.edu (Clerk ID: user_demo_student_1)');
    console.log('   Counsellor: counsellor1@example.edu (Clerk ID: user_demo_counsellor_1)');
    
    process.exit(0);

  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
}

// Run seed
seed();
