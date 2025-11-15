import { CSVRow, Column, ChartConfig, ChatMessage } from '../types';

const STORAGE_KEY = 'mydatainsight_data';

export interface StoredData {
  fileName: string;
  rawData: CSVRow[];
  columns: Column[];
  columnTypes: Record<string, 'number' | 'string' | 'date'>;
  summary: string;
  chatHistory: ChatMessage[];
  charts: ChartConfig[];
}

/**
 * 로컬 스토리지에 데이터 저장
 */
export function saveToLocalStorage(data: Partial<StoredData>) {
  try {
    const existingData = loadFromLocalStorage();
    const mergedData = { ...existingData, ...data };
    
    // ChatMessage의 timestamp를 문자열로 변환
    const serializedData = {
      ...mergedData,
      chatHistory: mergedData.chatHistory ? mergedData.chatHistory.map(msg => ({
        ...msg,
        timestamp: msg.timestamp.toISOString(),
      })) : [],
    };
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(serializedData));
    return true;
  } catch (error) {
    console.error('로컬 스토리지 저장 실패:', error);
    return false;
  }
}

/**
 * 로컬 스토리지에서 데이터 로드
 */
export function loadFromLocalStorage(): Partial<StoredData> {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return {};
    
    const data = JSON.parse(stored);
    
    // ChatMessage의 timestamp를 Date 객체로 변환
    if (data.chatHistory) {
      data.chatHistory = data.chatHistory.map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp),
      }));
    }
    
    return data;
  } catch (error) {
    console.error('로컬 스토리지 로드 실패:', error);
    return {};
  }
}

/**
 * 로컬 스토리지 비우기
 */
export function clearLocalStorage() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (error) {
    console.error('로컬 스토리지 삭제 실패:', error);
    return false;
  }
}

/**
 * 로컬 스토리지 사용 용량 계산 (바이트)
 */
export function getLocalStorageSize(): number {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return 0;
    
    // UTF-16 인코딩 기준으로 계산 (각 문자 2바이트)
    return new Blob([data]).size;
  } catch (error) {
    console.error('로컬 스토리지 용량 계산 실패:', error);
    return 0;
  }
}

/**
 * 로컬 스토리지 사용 용량을 읽기 쉬운 형식으로 변환
 */
export function formatStorageSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}

/**
 * 전체 로컬 스토리지 사용 용량 계산
 */
export function getTotalLocalStorageSize(): number {
  try {
    let total = 0;
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        const value = localStorage.getItem(key);
        if (value) {
          total += new Blob([value]).size;
        }
      }
    }
    return total;
  } catch (error) {
    console.error('전체 로컬 스토리지 용량 계산 실패:', error);
    return 0;
  }
}

