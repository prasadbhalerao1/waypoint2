import React from 'react';

interface MarkdownMessageProps {
  content: string;
  className?: string;
}

/**
 * Simple Markdown Renderer for Chat Messages
 * Supports: bold, italic, code blocks, inline code, lists, links
 */
const MarkdownMessage: React.FC<MarkdownMessageProps> = ({ content, className = '' }) => {
  const renderContent = (text: string) => {
    // Handle undefined or null content
    if (!text) {
      return <p className="text-gray-500 italic">No content available</p>;
    }
    
    const lines = text.split('\n');
    const elements: JSX.Element[] = [];
    let inCodeBlock = false;
    let codeBlockContent: string[] = [];

    lines.forEach((line, index) => {
      // Code block detection
      if (line.trim().startsWith('```')) {
        if (!inCodeBlock) {
          inCodeBlock = true;
          codeBlockContent = [];
        } else {
          inCodeBlock = false;
          elements.push(
            <pre key={`code-${index}`} className="bg-gray-100 rounded-lg p-3 my-2 overflow-x-auto">
              <code className="text-sm font-mono text-gray-800">
                {codeBlockContent.join('\n')}
              </code>
            </pre>
          );
          codeBlockContent = [];
        }
        return;
      }

      if (inCodeBlock) {
        codeBlockContent.push(line);
        return;
      }

      // Empty line
      if (!line.trim()) {
        elements.push(<br key={`br-${index}`} />);
        return;
      }

      // Headers
      if (line.startsWith('### ')) {
        elements.push(
          <h3 key={`h3-${index}`} className="text-lg font-semibold mt-3 mb-2">
            {processInlineFormatting(line.slice(4))}
          </h3>
        );
        return;
      }
      if (line.startsWith('## ')) {
        elements.push(
          <h2 key={`h2-${index}`} className="text-xl font-semibold mt-3 mb-2">
            {processInlineFormatting(line.slice(3))}
          </h2>
        );
        return;
      }
      if (line.startsWith('# ')) {
        elements.push(
          <h1 key={`h1-${index}`} className="text-2xl font-bold mt-3 mb-2">
            {processInlineFormatting(line.slice(2))}
          </h1>
        );
        return;
      }

      // Unordered list
      if (line.trim().match(/^[-*]\s/)) {
        elements.push(
          <li key={`li-${index}`} className="ml-4 my-1">
            {processInlineFormatting(line.trim().slice(2))}
          </li>
        );
        return;
      }

      // Ordered list
      if (line.trim().match(/^\d+\.\s/)) {
        const match = line.trim().match(/^\d+\.\s(.*)$/);
        if (match) {
          elements.push(
            <li key={`oli-${index}`} className="ml-4 my-1 list-decimal">
              {processInlineFormatting(match[1])}
            </li>
          );
        }
        return;
      }

      // Blockquote
      if (line.trim().startsWith('>')) {
        elements.push(
          <blockquote key={`quote-${index}`} className="border-l-4 border-gray-300 pl-4 my-2 italic text-gray-600">
            {processInlineFormatting(line.trim().slice(1).trim())}
          </blockquote>
        );
        return;
      }

      // Regular paragraph
      elements.push(
        <p key={`p-${index}`} className="my-1 leading-relaxed">
          {processInlineFormatting(line)}
        </p>
      );
    });

    return elements;
  };

  const processInlineFormatting = (text: string): React.ReactNode => {
    const parts: React.ReactNode[] = [];
    let key = 0;

    // Process inline code first (to avoid conflicts with bold/italic)
    const codeRegex = /`([^`]+)`/g;
    let lastIndex = 0;
    let match;

    while ((match = codeRegex.exec(text)) !== null) {
      // Add text before code
      if (match.index > lastIndex) {
        const beforeText = text.slice(lastIndex, match.index);
        parts.push(...processTextFormatting(beforeText, key++));
      }

      // Add code
      parts.push(
        <code key={`code-${key++}`} className="bg-gray-200 px-1.5 py-0.5 rounded text-sm font-mono">
          {match[1]}
        </code>
      );

      lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < text.length) {
      const remainingText = text.slice(lastIndex);
      parts.push(...processTextFormatting(remainingText, key++));
    }

    return parts.length > 0 ? parts : text;
  };

  const processTextFormatting = (text: string, startKey: number): React.ReactNode[] => {
    const parts: React.ReactNode[] = [];
    let key = startKey;

    // Bold: **text** or __text__
    const boldRegex = /(\*\*|__)(.+?)\1/g;
    // Italic: *text* or _text_
    const italicRegex = /(\*|_)(.+?)\1/g;
    // Links: [text](url)
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;

    let lastIndex = 0;
    const allMatches: Array<{ index: number; length: number; element: React.ReactNode }> = [];

    // Find all bold matches
    let match;
    while ((match = boldRegex.exec(text)) !== null) {
      allMatches.push({
        index: match.index,
        length: match[0].length,
        element: <strong key={`bold-${key++}`}>{match[2]}</strong>
      });
    }

    // Find all italic matches (avoid overlap with bold)
    while ((match = italicRegex.exec(text)) !== null) {
      // Check if this is not part of a bold marker
      if (!text.slice(Math.max(0, match.index - 1), match.index + match[0].length + 1).match(/\*\*|\__/)) {
        allMatches.push({
          index: match.index,
          length: match[0].length,
          element: <em key={`italic-${key++}`}>{match[2]}</em>
        });
      }
    }

    // Find all link matches
    while ((match = linkRegex.exec(text)) !== null) {
      allMatches.push({
        index: match.index,
        length: match[0].length,
        element: (
          <a
            key={`link-${key++}`}
            href={match[2]}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            {match[1]}
          </a>
        )
      });
    }

    // Sort matches by index
    allMatches.sort((a, b) => a.index - b.index);

    // Build final parts array
    allMatches.forEach((item) => {
      if (item.index > lastIndex) {
        parts.push(text.slice(lastIndex, item.index));
      }
      parts.push(item.element);
      lastIndex = item.index + item.length;
    });

    if (lastIndex < text.length) {
      parts.push(text.slice(lastIndex));
    }

    return parts.length > 0 ? parts : [text];
  };

  return (
    <div className={`markdown-content ${className}`}>
      {renderContent(content)}
    </div>
  );
};

export default MarkdownMessage;
