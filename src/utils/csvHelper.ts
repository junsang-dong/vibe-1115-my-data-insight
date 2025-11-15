import { CSVRow, Column } from '../types';

/**
 * 컬럼 타입 자동 감지
 */
export function detectColumnType(values: any[]): 'number' | 'string' | 'date' {
  const sample = values.slice(0, 100).filter(v => v != null && v !== '');
  
  if (sample.length === 0) return 'string';
  
  // 숫자형 체크
  const numericCount = sample.filter(v => {
    const num = Number(v);
    return !isNaN(num) && isFinite(num);
  }).length;
  
  if (numericCount / sample.length > 0.8) {
    return 'number';
  }
  
  // 날짜형 체크
  const dateCount = sample.filter(v => {
    const date = new Date(v as string);
    return !isNaN(date.getTime()) && v.toString().match(/^\d{4}-\d{2}-\d{2}/);
  }).length;
  
  if (dateCount / sample.length > 0.8) {
    return 'date';
  }
  
  return 'string';
}

/**
 * 결측치 개수 계산
 */
export function countMissingValues(data: CSVRow[], column: string): number {
  return data.filter(row => row[column] == null || row[column] === '').length;
}

/**
 * 컬럼 목록 추출 및 타입 감지
 */
export function extractColumns(data: CSVRow[]): Column[] {
  if (data.length === 0) return [];
  
  const columnNames = Object.keys(data[0]);
  const columns: Column[] = [];
  
  columnNames.forEach(name => {
    const values = data.map(row => row[name]);
    const type = detectColumnType(values);
    columns.push({ name, type });
  });
  
  return columns;
}

