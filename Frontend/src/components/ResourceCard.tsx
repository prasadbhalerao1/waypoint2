import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useApi } from '../hooks/useApi';
import { BookOpen, Play, Download, ExternalLink, Clock, Tag } from 'lucide-react';

interface ResourceCardProps {
  id: string | number;
  title: string;
  description: string;
  type: string;
  duration?: string;
  tags?: string[];
  color?: string;
  url?: string;
  onComplete?: () => void;
}

const ResourceCard: React.FC<ResourceCardProps> = ({
  id,
  title,
  description,
  type,
  duration = '5 mins',
  tags = [],
  color = 'bg-teal-50 text-teal-700',
  url,
  onComplete
}) => {
  const { currentTheme } = useTheme();
  const api = useApi();

  const getIcon = (typeStr: string) => {
    switch (typeStr?.toLowerCase()) {
      case 'video':
        return Play;
      case 'audio':
        return Download;
      default:
        return BookOpen;
    }
  };

  const IconComponent = getIcon(type);

  const handleAccess = async () => {
    try {
      if (typeof id === 'string' && id.length > 10) {
        await api.completeResource(id);
      }
    } catch {
      // ignore non-critical xp errors
    }
    if (onComplete) onComplete();
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    } else {
      alert(`Accessing "${title}". Full resource loaded.`);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden group flex flex-col justify-between">
      <div className="p-6">
        {/* Resource Type & Duration */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <IconComponent className="w-5 h-5" style={{ color: currentTheme.primary }} />
            <span className="text-sm font-medium" style={{ color: currentTheme.primary }}>{type}</span>
          </div>
          <div className="flex items-center space-x-1 text-gray-500">
            <Clock className="w-4 h-4" />
            <span className="text-xs">{duration}</span>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-gray-800 mb-3 group-hover:text-teal-600 transition-colors duration-200">
          {title}
        </h3>

        {/* Description */}
        <p className="text-gray-600 mb-4 text-sm leading-relaxed">
          {description}
        </p>

        {/* Tags */}
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {tags.map((tag, index) => (
              <span
                key={index}
                className={`px-3 py-1 rounded-full text-xs font-medium ${color}`}
              >
                <Tag className="w-3 h-3 inline mr-1" />
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="px-6 pb-6">
        {/* Action Button */}
        <button
          onClick={handleAccess}
          className="w-full flex items-center justify-center space-x-2 px-4 py-3 text-white rounded-xl transition-all duration-200 shadow-sm hover:shadow-md font-medium"
          style={{ backgroundColor: currentTheme.primary }}
        >
          <span>Access Resource</span>
          <ExternalLink className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default ResourceCard;
