import React from 'react';
import { BookOpen, Play, Download, ExternalLink, Clock, Tag } from 'lucide-react';

interface ResourceCardProps {
  id: number;
  title: string;
  description: string;
  type: string;
  duration: string;
  tags: string[];
  color: string;
}

const ResourceCard: React.FC<ResourceCardProps> = ({
  title,
  description,
  type,
  duration,
  tags,
  color
}) => {
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

  const IconComponent = getIcon(type);

  return (
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden group">
      <div className="p-6">
        {/* Resource Type & Duration */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <IconComponent className="w-5 h-5 text-teal-600" />
            <span className="text-sm font-medium text-teal-600">{type}</span>
          </div>
          <div className="flex items-center space-x-1 text-gray-500">
            <Clock className="w-4 h-4" />
            <span className="text-sm">{duration}</span>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-gray-800 mb-3 group-hover:text-teal-600 transition-colors duration-200">
          {title}
        </h3>

        {/* Description */}
        <p className="text-gray-600 mb-4 leading-relaxed">
          {description}
        </p>

        {/* Tags */}
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

        {/* Action Button */}
        <button className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-colors duration-200 group-hover:shadow-md">
          <span>Access Resource</span>
          <ExternalLink className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default ResourceCard;
