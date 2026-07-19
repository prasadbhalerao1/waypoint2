import React, { useState, useEffect, useCallback } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useApi } from '../hooks/useApi';
import ResourceCard from '../components/ResourceCard';
import resourcesData from '../data/resources.json';
import { Search } from 'lucide-react';

interface ResourceItem {
  id?: number | string;
  _id?: string;
  title: string;
  description: string;
  type: string;
  duration?: string;
  tags?: string[];
  color?: string;
  url?: string;
}

const Resources: React.FC = () => {
  const { currentTheme } = useTheme();
  const api = useApi();

  const [selectedTag, setSelectedTag] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [resources, setResources] = useState<ResourceItem[]>(resourcesData as ResourceItem[]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const tagsList = ['All', 'Stress', 'Anxiety', 'Sleep', 'Academic', 'Social', 'Wellness'];

  const loadResources = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.getResources({
        category: selectedTag !== 'All' ? selectedTag : undefined,
        search: searchQuery || undefined
      });
      if (res?.resources && res.resources.length > 0) {
        setResources(res.resources as ResourceItem[]);
      } else {
        // Fallback to local filtering
        let filtered = resourcesData as ResourceItem[];
        if (selectedTag !== 'All') {
          filtered = filtered.filter(r => r.tags?.some(t => t.toLowerCase() === selectedTag.toLowerCase()));
        }
        if (searchQuery) {
          filtered = filtered.filter(r => 
            r.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
            r.description.toLowerCase().includes(searchQuery.toLowerCase())
          );
        }
        setResources(filtered);
      }
    } catch {
      let filtered = resourcesData as ResourceItem[];
      if (selectedTag !== 'All') {
        filtered = filtered.filter(r => r.tags?.some(t => t.toLowerCase() === selectedTag.toLowerCase()));
      }
      setResources(filtered);
    } finally {
      setIsLoading(false);
    }
  }, [api, searchQuery, selectedTag]);

  useEffect(() => {
    loadResources();
  }, [loadResources]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadResources();
  };

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold themed-text mb-4">Resource Hub</h1>
          <p className="text-xl themed-muted max-w-3xl mx-auto">
            Comprehensive mental health resources designed specifically for college students. 
            Access guides, videos, and tools in multiple regional languages.
          </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="max-w-xl mx-auto mb-8 relative">
          <Search className="w-5 h-5 text-gray-400 absolute left-4 top-3.5" />
          <input
            type="text"
            placeholder="Search resources by keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:border-transparent shadow-sm text-gray-800"
          />
        </form>

        {/* Filter Tags */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {tagsList.map((tag) => {
            const isActive = selectedTag === tag;
            return (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 shadow-sm ${
                  isActive
                    ? 'text-white shadow-md'
                    : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                }`}
                style={{
                  backgroundColor: isActive ? currentTheme.primary : undefined
                }}
              >
                {tag}
              </button>
            );
          })}
        </div>

        {/* Resources Grid */}
        {isLoading ? (
          <div className="text-center py-12 text-gray-500">Loading resources...</div>
        ) : resources.length === 0 ? (
          <div className="text-center py-12 text-gray-500">No resources found matching your filter.</div>
        ) : (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8">
            {resources.map((resource, index) => (
              <ResourceCard
                key={resource._id || resource.id || index}
                id={resource._id || resource.id || index}
                title={resource.title}
                description={resource.description}
                type={resource.type}
                duration={resource.duration || '5 mins'}
                tags={resource.tags || []}
                color={resource.color || 'bg-teal-50 text-teal-700'}
                url={resource.url}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Resources;