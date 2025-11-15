import { create } from 'zustand';
import { DataState, CSVRow, Column, ChartConfig, ChatMessage } from '../types';

interface DataStore extends DataState {
  setFileData: (file: File, data: CSVRow[], columns: Column[]) => void;
  setSummary: (text: string) => void;
  addChatMessage: (role: 'user' | 'assistant', content: string) => void;
  addChart: (chartConfig: ChartConfig) => void;
  setAnalyzing: (isAnalyzing: boolean) => void;
  reset: () => void;
}

const initialState: DataState = {
  file: null,
  fileName: '',
  rawData: [],
  columns: [],
  columnTypes: {},
  summary: '',
  chatHistory: [],
  charts: [],
  isAnalyzing: false,
};

export const useDataStore = create<DataStore>((set) => ({
  ...initialState,
  
  setFileData: (file, data, columns) => {
    const columnTypes: Record<string, 'number' | 'string' | 'date'> = {};
    columns.forEach(col => {
      columnTypes[col.name] = col.type;
    });
    
    set({
      file,
      fileName: file.name,
      rawData: data,
      columns,
      columnTypes,
    });
  },
  
  setSummary: (text) => set({ summary: text }),
  
  addChatMessage: (role, content) => set((state) => ({
    chatHistory: [...state.chatHistory, { role, content, timestamp: new Date() }],
  })),
  
  addChart: (chartConfig) => set((state) => ({
    charts: [...state.charts, chartConfig],
  })),
  
  setAnalyzing: (isAnalyzing) => set({ isAnalyzing }),
  
  reset: () => set(initialState),
}));

