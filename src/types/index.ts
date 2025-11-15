export interface CSVRow {
  [key: string]: string | number | null;
}

export interface Column {
  name: string;
  type: 'number' | 'string' | 'date';
}

export interface ChartConfig {
  id: string;
  type: 'bar' | 'line' | 'pie' | 'scatter';
  xAxis: string;
  yAxis: string;
  data: any[];
  title?: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface DataState {
  file: File | null;
  fileName: string;
  rawData: CSVRow[];
  columns: Column[];
  columnTypes: Record<string, 'number' | 'string' | 'date'>;
  summary: string;
  chatHistory: ChatMessage[];
  charts: ChartConfig[];
  isAnalyzing: boolean;
}

