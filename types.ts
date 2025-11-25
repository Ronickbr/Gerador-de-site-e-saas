export enum DeviceType {
  DESKTOP = 'DESKTOP',
  TABLET = 'TABLET',
  MOBILE = 'MOBILE'
}

export interface GeneratedPage {
  html: string;
  summary: string;
  timestamp: number;
}

export interface GenerationResponse {
  html: string;
  summary: string;
}

export interface SavedComponent {
  id: string;
  name: string;
  code: string;
  createdAt: number;
  preview?: string; // Optional short description or text preview
}

export type ViewMode = 'editor' | 'preview';