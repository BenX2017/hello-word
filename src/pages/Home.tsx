import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Download, Plus, Trash2, Type, Layout, Image as ImageIcon } from 'lucide-react';
import { usePresentationStore } from '@/store/usePresentationStore';
import { Slide, LayoutType } from '@/types';
import SlidePreview from '@/components/SlidePreview';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: any[]) {
  return twMerge(clsx(inputs));
}

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { presentation, updateSlide, removeSlide, addSlide, setTitle, exportToHTML } =
    usePresentationStore();
  const [selectedSlideId, setSelectedSlideId] = useState<string>(
    presentation.slides[0]?.id || ''
  );
  const [rawText, setRawText] = useState<string>('');

  const selectedSlide = presentation.slides.find((s) => s.id === selectedSlideId);

  const handleSmartSplit = useCallback(() => {
    if (!rawText.trim()) return;

    const sections = rawText
      .split(/\n\s*\n/)
      .map((section) => section.trim())
      .filter(Boolean);

    const newSlides: Slide[] = sections.map((content, index) => ({
      id: `gen-${Date.now()}-${index}`,
      content,
      layout: content.startsWith('#') ? 'title' : 'content',
      order: index,
    }));

    if (newSlides.length > 0) {
      setSelectedSlideId(newSlides[0].id);
      usePresentationStore.setState({
        presentation: {
          ...presentation,
          slides: newSlides,
          updatedAt: new Date(),
        },
      });
    }
  }, [rawText, presentation]);

  const handleDownload = () => {
    const html = exportToHTML();
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${presentation.title || 'presentation'}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const layouts: { type: LayoutType; label: string; icon: React.ReactNode }[] = [
    { type: 'title', label: '标题页', icon: <Type size={16} /> },
    { type: 'content', label: '内容页', icon: <Layout size={16} /> },
    { type: 'two-column', label: '双列', icon: <Layout size={16} /> },
    { type: 'image', label: '图文', icon: <ImageIcon size={16} /> },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-slate-800 rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-lg">P</span>
          </div>
          <div className="flex flex-col">
            <h1 className="text-xl font-bold text-slate-800">轻量汇报</h1>
            <input
              type="text"
              value={presentation.title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-sm text-slate-500 bg-transparent border-none focus:ring-0 p-0 hover:text-slate-700"
              placeholder="汇报标题..."
            />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <Download size={18} />
            <span className="hidden md:inline">导出 HTML</span>
          </button>
          <button
            onClick={() => navigate('/present')}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm transition-all active:scale-95"
          >
            <Play size={18} fill="currentColor" />
            <span>开始演示</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Slide List */}
        <aside className="w-64 bg-white border-r border-slate-200 flex flex-col">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <span className="font-semibold text-slate-700">幻灯片</span>
            <button
              onClick={() => {
                const newSlide: Slide = {
                  id: `new-${Date.now()}`,
                  content: '# 新页面\n\n在这里添加内容...',
                  layout: 'content',
                  order: presentation.slides.length,
                };
                addSlide(newSlide);
                setSelectedSlideId(newSlide.id);
              }}
              className="p-1.5 hover:bg-slate-100 rounded-md text-slate-500 hover:text-blue-600 transition-colors"
            >
              <Plus size={18} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {presentation.slides
              .sort((a, b) => a.order - b.order)
              .map((slide, index) => (
                <div
                  key={slide.id}
                  onClick={() => setSelectedSlideId(slide.id)}
                  className={cn(
                    'relative group cursor-pointer rounded-lg overflow-hidden border-2 transition-all',
                    selectedSlideId === slide.id
                      ? 'border-blue-500 shadow-md ring-1 ring-blue-500'
                      : 'border-transparent hover:border-slate-300'
                  )}
                >
                  <div className="absolute top-2 left-2 bg-black/50 text-white text-xs px-1.5 py-0.5 rounded z-10">
                    {index + 1}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (presentation.slides.length > 1) {
                        removeSlide(slide.id);
                        if (selectedSlideId === slide.id) {
                          setSelectedSlideId(presentation.slides[0]?.id || '');
                        }
                      }
                    }}
                    className="absolute top-2 right-2 p-1 bg-white/80 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded opacity-0 group-hover:opacity-100 transition-all z-20"
                  >
                    <Trash2 size={14} />
                  </button>
                  <SlidePreview slide={slide} scale={0.8} />
                </div>
              ))}
          </div>
        </aside>

        {/* Editor & Preview Split */}
        <main className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {/* Text Input Area */}
          <div className="lg:w-1/2 flex flex-col border-r border-slate-200 bg-slate-50">
            <div className="p-4 bg-white border-b border-slate-200 flex items-center gap-2">
              <span className="font-medium text-slate-700">智能输入</span>
              <div className="h-4 w-px bg-slate-300 mx-2" />
              <button
                onClick={handleSmartSplit}
                className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200 transition-colors"
              >
                ✨ 智能分页
              </button>
              <span className="text-xs text-slate-400 ml-auto">支持 Markdown</span>
            </div>
            <textarea
              value={selectedSlide ? selectedSlide.content : rawText}
              onChange={(e) => {
                if (selectedSlide) {
                  updateSlide(selectedSlide.id, { content: e.target.value });
                } else {
                  setRawText(e.target.value);
                }
              }}
              className="flex-1 w-full p-6 resize-none bg-transparent text-slate-800 text-lg leading-relaxed placeholder:text-slate-300 focus:outline-none font-mono"
              placeholder={
                selectedSlide
                  ? '在此处输入内容...'
                  : '将你的汇报内容粘贴在这里，系统将自动智能分页...'
              }
            />

            {/* Layout Selector */}
            {selectedSlide && (
              <div className="p-4 bg-white border-t border-slate-200">
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  版式选择
                </div>
                <div className="flex gap-2">
                  {layouts.map((layout) => (
                    <button
                      key={layout.type}
                      onClick={() => updateSlide(selectedSlide.id, { layout: layout.type })}
                      className={cn(
                        'flex-1 py-2 px-3 rounded-lg border flex items-center justify-center gap-2 text-sm transition-all',
                        selectedSlide.layout === layout.type
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                      )}
                    >
                      {layout.icon}
                      <span>{layout.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Live Preview */}
          <div className="lg:w-1/2 bg-slate-100 p-8 flex items-center justify-center overflow-y-auto">
            <div className="w-full max-w-4xl">
              {selectedSlide ? (
                <SlidePreview slide={selectedSlide} />
              ) : (
                <div className="text-center text-slate-400 py-20">
                  <p>选择左侧幻灯片进行编辑</p>
                  <p className="text-sm mt-2">或使用智能输入区域创建新内容</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Home;
