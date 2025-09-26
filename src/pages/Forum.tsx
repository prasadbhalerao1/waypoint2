import React, { useState } from 'react';
import { MessageCircle, Heart, Reply, Send, User, Clock, ThumbsUp } from 'lucide-react';

interface Comment {
  id: number;
  author: string;
  content: string;
  timestamp: string;
  likes: number;
}

interface Thread {
  id: number;
  title: string;
  author: string;
  timestamp: string;
  likes: number;
  replies: number;
  content: string;
  comments: Comment[];
}

const Forum: React.FC = () => {
  const [threads] = useState<Thread[]>([
    {
      id: 1,
      title: "Dealing with exam anxiety - need advice",
      author: "Anonymous Student",
      timestamp: "2 hours ago",
      likes: 12,
      replies: 8,
      content: "Hi everyone, I've been struggling with severe anxiety before exams. My heart races, I can't sleep, and I feel like I forget everything I studied. Has anyone experienced something similar? What techniques helped you cope?",
      comments: [
        {
          id: 1,
          author: "Supportive Peer",
          content: "I completely understand what you're going through. What really helped me was breaking study sessions into smaller chunks and practicing breathing exercises. The 4-7-8 technique worked wonders for me before exams.",
          timestamp: "1 hour ago",
          likes: 5,
        },
        {
          id: 2,
          author: "Study Buddy",
          content: "Try creating a pre-exam routine that you follow every time. Mine includes light exercise, a healthy meal, and reviewing notes calmly. Consistency helped reduce my anxiety significantly.",
          timestamp: "45 minutes ago",
          likes: 3,
        },
        {
          id: 3,
          author: "Wellness Advocate",
          content: "Don't hesitate to reach out to the campus counseling center too. They have great resources for exam anxiety and can teach you personalized coping strategies.",
          timestamp: "30 minutes ago",
          likes: 7,
        },
      ],
    },
    {
      id: 2,
      title: "Feeling isolated in college - anyone else?",
      author: "Lonely Freshman",
      timestamp: "5 hours ago",
      likes: 18,
      replies: 12,
      content: "I'm in my first semester and feeling really lonely. It's hard to make friends when everyone seems to already have their groups. Sometimes I eat meals alone and spend weekends in my room. How do you build meaningful connections in college?",
      comments: [
        {
          id: 4,
          author: "Senior Helper",
          content: "Your feelings are completely valid, and you're definitely not alone in this experience. I felt the same way my freshman year. Joining clubs related to your interests was a game-changer for me. Even volunteering opportunities can be great for meeting like-minded people.",
          timestamp: "4 hours ago",
          likes: 8,
        },
        {
          id: 5,
          author: "Social Butterfly",
          content: "Try saying yes to social invitations, even when you don't feel like it. Some of my best friendships started from random dorm activities or study groups. It gets easier with practice!",
          timestamp: "3 hours ago",
          likes: 6,
        },
      ],
    },
    {
      id: 3,
      title: "Balancing work and studies - tips needed",
      author: "Working Student",
      timestamp: "1 day ago",
      likes: 24,
      replies: 15,
      content: "I'm working part-time to support myself through college, but I'm struggling to keep up with coursework. I'm constantly tired and stressed. How do you manage work-life-study balance without burning out?",
      comments: [
        {
          id: 6,
          author: "Time Management Pro",
          content: "Time blocking saved my life! I dedicate specific hours to work, study, and rest. Using a planner and setting realistic goals for each day helps prevent overwhelm. Remember, it's okay to not be perfect.",
          timestamp: "20 hours ago",
          likes: 9,
        },
        {
          id: 7,
          author: "Fellow Worker",
          content: "Talk to your professors about your situation. Many are understanding and might offer extensions or alternative arrangements. Also, check if your college has emergency financial aid programs.",
          timestamp: "18 hours ago",
          likes: 12,
        },
        {
          id: 8,
          author: "Burnout Survivor",
          content: "Please prioritize self-care. I learned the hard way that burning out doesn't help anyone. Even 10 minutes of daily meditation or a short walk can make a huge difference in managing stress levels.",
          timestamp: "15 hours ago",
          likes: 7,
        },
      ],
    },
  ]);

  const [newComment, setNewComment] = useState<{ [key: number]: string }>({});

  const handleCommentSubmit = (threadId: number) => {
    if (newComment[threadId]?.trim()) {
      // In a real app, this would add the comment to the thread
      console.log(`New comment for thread ${threadId}:`, newComment[threadId]);
      setNewComment(prev => ({ ...prev, [threadId]: '' }));
    }
  };

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Peer Support Forum</h1>
          <p className="text-xl text-gray-600">
            A safe space for students to share experiences and support each other
          </p>
        </div>

        {/* Forum Guidelines */}
        <div className="bg-blue-50 rounded-2xl p-6 mb-8 border border-blue-200">
          <h3 className="text-lg font-semibold text-blue-800 mb-3">Community Guidelines</h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-blue-700">
            <div className="flex items-start space-x-2">
              <Heart className="w-4 h-4 mt-0.5 text-blue-600" />
              <span>Be kind and supportive to fellow students</span>
            </div>
            <div className="flex items-start space-x-2">
              <User className="w-4 h-4 mt-0.5 text-blue-600" />
              <span>Respect anonymity and privacy</span>
            </div>
            <div className="flex items-start space-x-2">
              <MessageCircle className="w-4 h-4 mt-0.5 text-blue-600" />
              <span>Share resources and coping strategies</span>
            </div>
            <div className="flex items-start space-x-2">
              <Reply className="w-4 h-4 mt-0.5 text-blue-600" />
              <span>All discussions are moderated for safety</span>
            </div>
          </div>
        </div>

        {/* Forum Threads */}
        <div className="space-y-8">
          {threads.map((thread) => (
            <div key={thread.id} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              {/* Thread Header */}
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-xl font-bold text-gray-800 mb-3">{thread.title}</h2>
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <div className="flex items-center space-x-4">
                    <span className="flex items-center space-x-1">
                      <User className="w-4 h-4" />
                      <span>{thread.author}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{thread.timestamp}</span>
                    </span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="flex items-center space-x-1 text-red-500">
                      <Heart className="w-4 h-4" />
                      <span>{thread.likes}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <MessageCircle className="w-4 h-4" />
                      <span>{thread.replies} replies</span>
                    </span>
                  </div>
                </div>
                <p className="text-gray-700 leading-relaxed">{thread.content}</p>
              </div>

              {/* Comments */}
              <div className="p-6 bg-gray-50">
                <h4 className="font-semibold text-gray-800 mb-4">Responses:</h4>
                <div className="space-y-4">
                  {thread.comments.map((comment) => (
                    <div key={comment.id} className="bg-white rounded-xl p-4 shadow-sm">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-teal-700">{comment.author}</span>
                        <div className="flex items-center space-x-3 text-sm text-gray-500">
                          <span className="flex items-center space-x-1">
                            <ThumbsUp className="w-3 h-3" />
                            <span>{comment.likes}</span>
                          </span>
                          <span>{comment.timestamp}</span>
                        </div>
                      </div>
                      <p className="text-gray-700 text-sm leading-relaxed">{comment.content}</p>
                    </div>
                  ))}
                </div>

                {/* Comment Input */}
                <div className="mt-6 p-4 bg-white rounded-xl shadow-sm">
                  <textarea
                    value={newComment[thread.id] || ''}
                    onChange={(e) => setNewComment(prev => ({ ...prev, [thread.id]: e.target.value }))}
                    placeholder="Share your thoughts or support..."
                    className="w-full p-3 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    rows={3}
                  />
                  <div className="flex justify-between items-center mt-3">
                    <span className="text-xs text-gray-500">Your response will be posted anonymously</span>
                    <button
                      onClick={() => handleCommentSubmit(thread.id)}
                      className="flex items-center space-x-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors duration-200"
                    >
                      <Send className="w-4 h-4" />
                      <span>Post Response</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Start New Discussion */}
        <div className="mt-12 text-center">
          <button className="px-8 py-4 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-colors duration-200 font-medium text-lg shadow-md hover:shadow-lg">
            Start New Discussion
          </button>
          <p className="text-sm text-gray-500 mt-3">
            All discussions are moderated by trained student volunteers and counselors
          </p>
        </div>
      </div>
    </div>
  );
};

export default Forum;