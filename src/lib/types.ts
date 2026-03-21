export interface BaseRecord {
  id: string;
  createdAt: string;
  updatedAt: string;
  imageBase64?: string;
}

export interface DiaryEntry extends BaseRecord {
  type: 'diary';
  date: string; // 'YYYY-MM-DD'
  title: string;
  content: string;
  tags?: string[];
}

export interface LinkPreview {
  url: string;
  title: string;
  thumbnail?: string;
  type: 'youtube' | 'link';
}

export interface Moment extends BaseRecord {
  type: 'moment';
  date: string; // 'YYYY-MM-DD'
  text: string;
  tags?: string[];
  linkPreview?: LinkPreview;
}

export interface Idea extends BaseRecord {
  type: 'idea';
  date: string; // 'YYYY-MM-DD'
  title: string;
  content: string;
  tags?: string[];
}
