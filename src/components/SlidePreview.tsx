import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Slide, LayoutType } from '@/types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface SlidePreviewProps {
  slide: Slide;
  className?: string;
  scale?: number;
}

const SlidePreview: React.FC<SlidePreviewProps> = ({ slide, className, scale = 1 }) => {
  const getLayoutStyles = (layout: LayoutType) => {
    switch (layout) {
      case 'title':
        return 'bg-gradient-to-br from-slate-800 to-blue-600 text-white flex flex-col items-center justify-center text-center';
      case 'content':
        return 'bg-white text-slate-800 flex flex-col justify-center';
      case 'two-column':
        return 'bg-white text-slate-800';
      case 'image':
        return 'bg-gradient-to-br from-slate-50 to-slate-200 text-slate-800 flex flex-col justify-center';
      default:
        return 'bg-white text-slate-800';
    }
  };

  const getTextStyles = (layout: LayoutType) => {
    switch (layout) {
      case 'title':
        return 'space-y-4';
      case 'content':
        return 'space-y-3';
      case 'two-column':
        return 'space-y-2';
      case 'image':
        return 'space-y-3';
      default:
        return 'space-y-2';
    }
  };

  return (
    <div
      className={cn(
        'relative w-full aspect-video rounded-lg shadow-lg overflow-hidden border border-slate-200',
        getLayoutStyles(slide.layout),
        className
      )}
      style={{ transform: `scale(${scale})`, transformOrigin: 'center' }}
    >
      <div className={cn('w-full h-full p-6 md:p-10', getTextStyles(slide.layout))}>
        <ReactMarkdown
          components={{
            h1: ({ ...props }) => (
              <h1
                className={cn(
                  'font-bold leading-tight',
                  slide.layout === 'title' ? 'text-4xl md:text-6xl mb-4' : 'text-3xl md:text-4xl mb-3'
                )}
                {...props}
              />
            ),
            h2: ({ ...props }) => (
              <h2 className="text-2xl md:text-3xl font-semibold mb-3" {...props} />
            ),
            h3: ({ ...props }) => (
              <h3 className="text-xl md:text-2xl font-semibold mb-2" {...props} />
            ),
            p: ({ ...props }) => (
              <p
                className={cn(
                  'leading-relaxed',
                  slide.layout === 'title' ? 'text-xl md:text-2xl opacity-90' : 'text-base md:text-lg'
                )}
                {...props}
              />
            ),
            ul: ({ ...props }) => (
              <ul className="list-disc list-inside space-y-2 text-base md:text-lg" {...props} />
            ),
            ol: ({ ...props }) => (
              <ol className="list-decimal list-inside space-y-2 text-base md:text-lg" {...props} />
            ),
            li: ({ ...props }) => <li className="leading-relaxed" {...props} />,
            strong: ({ ...props }) => <strong className="font-semibold" {...props} />,
            em: ({ ...props }) => <em className="italic" {...props} />,
            blockquote: ({ ...props }) => (
              <blockquote
                className="border-l-4 border-blue-500 pl-4 italic text-slate-600"
                {...props}
              />
            ),
          }}
        >
          {slide.content}
        </ReactMarkdown>
      </div>
    </div>
  );
};

export default SlidePreview;
