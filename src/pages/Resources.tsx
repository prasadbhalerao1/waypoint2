import React from 'react';
import { BookOpen, Play, Download, ExternalLink, Clock, Tag } from 'lucide-react';

const Resources: React.FC = () => {
  const resources = [
    {
      id: 1,
      title: "Managing Academic Stress: A Student's Guide",
      description: "Learn effective strategies to handle academic pressure, exam anxiety, and study burnout. Includes practical tips for time management and stress relief.",
      type: 'Article',
      duration: '8 min read',
      tags: ['Stress', 'Academic'],
      color: 'themed-surface themed-text',
    },
    {
      id: 2,
      title: 'Mindfulness Meditation for Beginners',
      description: 'Guided audio session to help you practice mindfulness and reduce anxiety. Perfect for quick stress relief between classes.',
      type: 'Audio',
      duration: '15 min',
      tags: ['Meditation', 'Anxiety'],
      color: 'themed-surface themed-primary',
    },
    {
      id: 3,
      title: 'Building Healthy Sleep Habits in College',
      description: 'Discover the importance of sleep hygiene and practical steps to improve your sleep quality despite busy college schedules.',
      type: 'Video',
      duration: '12 min',
      tags: ['Sleep', 'Wellness'],
      color: 'themed-surface themed-primary',
    },
    {
      id: 4,
      title: 'Coping with Social Anxiety on Campus',
      description: 'Understand social anxiety and learn techniques to feel more comfortable in social situations, group projects, and presentations.',
      type: 'Article',
      duration: '6 min read',
      tags: ['Social', 'Anxiety'],
      color: 'themed-surface themed-primary',
    },
    {
      id: 5,
      title: 'Building Resilience: Overcoming Setbacks',
      description: 'Develop emotional resilience and learn how to bounce back from failures, rejections, and challenging life events.',
      type: 'Interactive',
      duration: '20 min',
      tags: ['Resilience', 'Growth'],
      color: 'themed-surface themed-primary',
    },
    {
      id: 6,
      title: 'Mental Health Resources in Hindi',
      description: 'मानसिक स्वास्थ्य के लिए हिंदी में संसाधन। तनाव प्रबंधन और भावनात्मक कल्याण के लिए व्यावहारिक सुझाव।',
      type: 'Article',
      duration: '10 min read',
      tags: ['Hindi', 'Regional'],
      color: 'bg-teal-100 text-teal-800',
    },
  ];

  const getIcon = (type: string) => {
    switch (type) {
      case 'Video':
        return Play;
      case 'Audio':
        return Download;
      default:
        return BookOpen;
    }
  };

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold themed-text mb-4">Resource Hub</h1>
          <p className="text-xl themed-muted max-w-3xl mx-auto">
            Comprehensive mental health resources designed specifically for college students. 
            Access guides, videos, and tools in multiple regional languages.
          </p>
        </div>

        {/* Filter Tags */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {['All', 'Stress', 'Anxiety', 'Sleep', 'Academic', 'Social', 'Wellness'].map((tag) => (
            <button
              key={tag}
              className={`px-4 py-2 themed-surface border themed-border rounded-full themed-text hover:themed-primary-bg hover:bg-opacity-10 transition-colors duration-200`}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Resources Grid */}
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8">
          {resources.map((resource) => {
            const IconComponent = getIcon(resource.type);
            
            return (
              <div
                key={resource.id}
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden group"
              >
                <div className="p-6">
                  {/* Resource Type & Duration */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <IconComponent className="w-5 h-5 text-teal-600" />
                      <span className="text-sm font-medium text-teal-600">{resource.type}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-gray-500">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm">{resource.duration}</span>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold text-gray-800 mb-3 group-hover:text-teal-600 transition-colors duration-200">
                    {resource.title}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-600 mb-4 leading-relaxed">
                    {resource.description}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {resource.tags.map((tag, index) => (
                      <span
                        key={index}
                        className={`px-3 py-1 rounded-full text-xs font-medium ${resource.color}`}
                      >
                        <Tag className="w-3 h-3 inline mr-1" />
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Action Button */}
                  <button className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-colors duration-200 group-hover:shadow-md">
                    <span>Access Resource</span>
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Load More Button */}
        <div className="text-center mt-12">
          <button className="px-8 py-3 bg-white border-2 border-teal-600 text-teal-600 rounded-xl hover:bg-teal-50 transition-colors duration-200 font-medium">
            Load More Resources
          </button>
        </div>
      </div>
    </div>
  );
};

export default Resources;