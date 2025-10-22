import React from 'react';
import ResourceCard from '../components/ResourceCard';
import resourcesData from '../data/resources.json';

const Resources: React.FC = () => {
  // Load resources from JSON data
  const resources = resourcesData;

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
          {resources.map((resource) => (
            <ResourceCard
              key={resource.id}
              id={resource.id}
              title={resource.title}
              description={resource.description}
              type={resource.type}
              duration={resource.duration}
              tags={resource.tags}
              color={resource.color}
            />
          ))}
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