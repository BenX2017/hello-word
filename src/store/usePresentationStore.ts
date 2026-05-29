import { create } from 'zustand';
import { Slide, LayoutType, Presentation } from '@/types';

interface PresentationStore {
  presentation: Presentation;
  setTitle: (title: string) => void;
  addSlide: (slide: Slide) => void;
  updateSlide: (id: string, updates: Partial<Slide>) => void;
  removeSlide: (id: string) => void;
  reorderSlides: (newOrder: Slide[]) => void;
  setSlides: (slides: Slide[]) => void;
  setPresentation: (presentation: Presentation) => void;
  exportToHTML: () => string;
}

const initialPresentation: Presentation = {
  id: Date.now().toString(),
  title: '我的汇报',
  slides: [
    {
      id: '1',
      content: '# 欢迎使用\n轻量在线汇报工具\n\n让汇报变得更简单',
      layout: 'title',
      order: 0,
    },
    {
      id: '2',
      content: '## 主要功能\n\n- 快速输入和粘贴文本\n- 智能自动分页\n- 多种版式模板\n- 一键导出HTML',
      layout: 'content',
      order: 1,
    },
  ],
  createdAt: new Date(),
  updatedAt: new Date(),
};

const generateId = () => Math.random().toString(36).substr(2, 9);

export const usePresentationStore = create<PresentationStore>((set, get) => ({
  presentation: initialPresentation,

  setTitle: (title) =>
    set((state) => ({
      presentation: {
        ...state.presentation,
        title,
        updatedAt: new Date(),
      },
    })),

  addSlide: (slide) =>
    set((state) => ({
      presentation: {
        ...state.presentation,
        slides: [...state.presentation.slides, slide],
        updatedAt: new Date(),
      },
    })),

  updateSlide: (id, updates) =>
    set((state) => ({
      presentation: {
        ...state.presentation,
        slides: state.presentation.slides.map((slide) =>
          slide.id === id ? { ...slide, ...updates } : slide
        ),
        updatedAt: new Date(),
      },
    })),

  removeSlide: (id) =>
    set((state) => ({
      presentation: {
        ...state.presentation,
        slides: state.presentation.slides
          .filter((slide) => slide.id !== id)
          .map((slide, index) => ({ ...slide, order: index })),
        updatedAt: new Date(),
      },
    })),

  reorderSlides: (newOrder) =>
    set((state) => ({
      presentation: {
        ...state.presentation,
        slides: newOrder.map((slide, index) => ({ ...slide, order: index })),
        updatedAt: new Date(),
      },
    })),

  setSlides: (slides) =>
    set((state) => ({
      presentation: {
        ...state.presentation,
        slides,
        updatedAt: new Date(),
      },
    })),

  setPresentation: (presentation) => set({ presentation }),

  exportToHTML: () => {
    const { presentation } = get();
    const slidesHTML = presentation.slides
      .map(
        (slide, index) => `
        <div class="slide ${slide.layout}" data-slide="${index}">
          <div class="slide-content">${slide.content.replace(/\n/g, '<br>')}</div>
        </div>
      `
      )
      .join('');

    return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${presentation.title}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Inter', -apple-system, sans-serif; background: #0f172a; }
    .presentation { height: 100vh; display: flex; align-items: center; justify-content: center; }
    .slide-container { width: 90vw; height: 90vh; max-width: 1200px; background: white; border-radius: 16px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5); overflow: hidden; position: relative; }
    .slide { width: 100%; height: 100%; display: none; padding: 4rem; }
    .slide.active { display: flex; flex-direction: column; justify-content: center; }
    .slide.title { background: linear-gradient(135deg, #2D3748 0%, #3182CE 100%); color: white; text-align: center; }
    .slide.title .slide-content h1 { font-size: 3.5rem; margin-bottom: 1rem; }
    .slide.content { background: white; color: #1a202c; }
    .slide.content .slide-content { font-size: 1.5rem; line-height: 1.8; }
    .slide.two-column { background: white; color: #1a202c; }
    .slide.image { background: linear-gradient(135deg, #f7fafc 0%, #e2e8f0 100%); }
    .slide-content h1, .slide-content h2, .slide-content h3 { margin-bottom: 1.5rem; }
    .slide-content ul { margin-left: 2rem; }
    .slide-content li { margin: 0.5rem 0; }
    .controls { position: absolute; bottom: 2rem; right: 2rem; display: flex; gap: 1rem; }
    .controls button { background: #3182CE; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 8px; cursor: pointer; font-size: 1rem; transition: transform 0.2s; }
    .controls button:hover { transform: scale(1.05); }
    .page-indicator { position: absolute; bottom: 2rem; left: 50%; transform: translateX(-50%); display: flex; gap: 0.5rem; }
    .dot { width: 12px; height: 12px; border-radius: 50%; background: rgba(255, 255, 255, 0.3); border: 2px solid white; cursor: pointer; }
    .dot.active { background: white; }
  </style>
</head>
<body>
  <div class="presentation">
    <div class="slide-container">
      ${slidesHTML}
      <div class="controls">
        <button onclick="prevSlide()">上一页</button>
        <button onclick="nextSlide()">下一页</button>
      </div>
      <div class="page-indicator" id="page-indicator"></div>
    </div>
  </div>
  <script>
    let currentSlide = 0;
    const slides = document.querySelectorAll('.slide');
    const indicator = document.getElementById('page-indicator');
    
    function updateIndicator() {
      indicator.innerHTML = '';
      slides.forEach((_, i) => {
        const dot = document.createElement('div');
        dot.className = 'dot' + (i === currentSlide ? ' active' : '');
        dot.onclick = () => goToSlide(i);
        indicator.appendChild(dot);
      });
    }
    
    function goToSlide(n) {
      slides[currentSlide].classList.remove('active');
      currentSlide = (n + slides.length) % slides.length;
      slides[currentSlide].classList.add('active');
      updateIndicator();
    }
    
    function nextSlide() { goToSlide(currentSlide + 1); }
    function prevSlide() { goToSlide(currentSlide - 1); }
    
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); nextSlide(); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); prevSlide(); }
    });
    
    slides[0].classList.add('active');
    updateIndicator();
  </script>
</body>
</html>
    `;
  },
}));
