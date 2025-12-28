export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: number;
  images?: string[]; // Array of base64 image strings
}

export interface ParsedData {
  fileName: string;
  headers: string[];
  rows: any[]; // Using any[] because Excel row structure is dynamic
}

export enum AppState {
  IDLE = 'IDLE',
  PROCESSING_FILE = 'PROCESSING_FILE',
  READY = 'READY',
  ERROR = 'ERROR'
}