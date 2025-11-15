import { create } from 'zustand';
import { DataState, CSVRow, Column, ChartConfig } from '../types';
import { saveToLocalStorage, loadFromLocalStorage, clearLocalStorage } from '../utils/localStorage';

interface DataStore extends DataState {
  setFileData: (file: File, data: CSVRow[], columns: Column[]) => void;
  setSummary: (text: string) => void;
  addChatMessage: (role: 'user' | 'assistant', content: string) => void;
  addChart: (chartConfig: ChartConfig) => void;
  setAnalyzing: (isAnalyzing: boolean) => void;
  reset: () => void;
  clearStorage: () => void;
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

// 로컬 스토리지에서 초기 데이터 로드
const loadInitialState = (): DataState => {
  const stored = loadFromLocalStorage();
  if (Object.keys(stored).length === 0) {
    return initialState;
  }
  
  return {
    ...initialState,
    fileName: stored.fileName || '',
    rawData: stored.rawData || [],
    columns: stored.columns || [],
    columnTypes: stored.columnTypes || {},
    summary: stored.summary || '',
    chatHistory: stored.chatHistory || [],
    charts: stored.charts || [],
  };
};

export const useDataStore = create<DataStore>((set) => {
  // 초기 상태 로드
  const initialData = loadInitialState();
  
  return {
    ...initialData,
    
    setFileData: (file, data, columns) => {
      const columnTypes: Record<string, 'number' | 'string' | 'date'> = {};
      columns.forEach(col => {
        columnTypes[col.name] = col.type;
      });
      
      const newState = {
        file,
        fileName: file.name,
        rawData: data,
        columns,
        columnTypes,
      };
      
      set(newState);
      
      // 로컬 스토리지에 저장
      saveToLocalStorage({
        fileName: file.name,
        rawData: data,
        columns,
        columnTypes,
      });
    },
    
    setSummary: (text) => {
      set({ summary: text });
      saveToLocalStorage({ summary: text });
    },
    
    addChatMessage: (role, content) => {
      const newMessage = { role, content, timestamp: new Date() };
      set((state) => {
        const newHistory = [...state.chatHistory, newMessage];
        saveToLocalStorage({ chatHistory: newHistory });
        return { chatHistory: newHistory };
      });
    },
    
    addChart: (chartConfig) => {
      set((state) => {
        const newCharts = [...state.charts, chartConfig];
        saveToLocalStorage({ charts: newCharts });
        return { charts: newCharts };
      });
    },
    
    setAnalyzing: (isAnalyzing) => set({ isAnalyzing }),
    
    reset: () => {
      set(initialState);
      clearLocalStorage();
    },
    
    clearStorage: () => {
      set(initialState);
      clearLocalStorage();
    },
  };
});

