import { ReactNode } from 'react';

export interface ChatMessage {
  id: string;
  role: 'ai' | 'user';
  content: string | ReactNode;
  timestamp: Date;
}

export type QuickButtonType = 'schedule' | 'todo' | 'recent' | 'weather';

export interface BottomSheetState {
  open: boolean;
  type: QuickButtonType | null;
}
