export type LayoutType = 'title' | 'content' | 'two-column' | 'image';

export interface Slide {
  id: string;
  content: string;
  layout: LayoutType;
  order: number;
}

export interface Presentation {
  id: string;
  title: string;
  slides: Slide[];
  createdAt: Date;
  updatedAt: Date;
}
