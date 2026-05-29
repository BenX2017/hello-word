import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, ChevronLeft, ChevronRight, Maximize2, Monitor } from 'lucide-react';
import { usePresentationStore } from '@/store/usePresentationStore';
import SlidePreview from '@/components/SlidePreview';

const Present: React.FC = () => {
  const navigate = useNavigate();
  const { presentation } = usePresentationStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const slides = presentation.slides.sort((a, b) => a.order - b.order);
  const currentSlide = slides[currentIndex];

  const goToSlide = useCallback(
    (index: number) => {
      const newIndex = Math.max(0, Math.min(slides.length - 1, index));
      setCurrentIndex(newIndex);
    },
    [slides.length]
  );

  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      await document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
        e.preventDefault();
        goToSlide(currentIndex + 1);
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        goToSlide(currentIndex - 1);
      } else if (e.key === 'Escape') {
        navigate('/');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, goToSlide, navigate]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  return (
    <div className="fixed inset-0 bg-slate-950 z-50 flex flex-col items-center justify-center overflow-hidden font-sans">
      {/* Top Controls */}
      <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center opacity-0 hover:opacity-100 transition-opacity duration-300 z-10">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white rounded-full transition-all"
        >
          <X size={20} />
          <span>退出</span>
        </button>
        <button
          onClick={toggleFullscreen}
          className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white rounded-full transition-all"
        >
          <Maximize2 size={20} />
          <span className="hidden sm:inline">全屏</span>
        </button>
      </div>

      {/* Main Slide Area */}
      <div className="w-[90vw] h-[90vh] max-w-7xl max-h-[900px] relative">
        <div className="absolute inset-0 flex items-center justify-center">
          {currentSlide && (
            <div className="w-full h-full transition-all duration-500 transform scale-100">
              <SlidePreview slide={currentSlide} className="w-full h-full shadow-2xl" />
            </div>
          )}
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-6 opacity-0 hover:opacity-100 transition-opacity duration-300">
        <button
          onClick={() => goToSlide(currentIndex - 1)}
          disabled={currentIndex === 0}
          className="p-3 bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed backdrop-blur-md text-white rounded-full transition-all hover:scale-110"
        >
          <ChevronLeft size={28} />
        </button>

        {/* Slide Dots */}
        <div className="flex items-center gap-2">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => goToSlide(idx)}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                idx === currentIndex ? 'bg-white w-8 rounded-lg' : 'bg-white/40 hover:bg-white/70'
              }`}
              aria-label={`跳转到第 ${idx + 1} 页`}
            />
          ))}
        </div>

        <button
          onClick={() => goToSlide(currentIndex + 1)}
          disabled={currentIndex === slides.length - 1}
          className="p-3 bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed backdrop-blur-md text-white rounded-full transition-all hover:scale-110"
        >
          <ChevronRight size={28} />
        </button>
      </div>

      {/* Slide Number */}
      <div className="absolute bottom-10 right-10 px-3 py-1 bg-black/40 backdrop-blur-md text-white/80 text-sm rounded-full opacity-0 hover:opacity-100 transition-opacity">
        {currentIndex + 1} / {slides.length}
      </div>

      {/* Presenter Note Hint */}
      <div className="absolute bottom-10 left-10 text-white/30 text-sm opacity-0 hover:opacity-100 transition-opacity hidden md:block">
        <div className="flex items-center gap-2">
          <Monitor size={16} />
          <span>使用 ← → 或空格键导航</span>
        </div>
      </div>
    </div>
  );
};

export default Present;
