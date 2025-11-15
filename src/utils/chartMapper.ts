import { Column } from '../types';

/**
 * 컬럼 타입에 따라 적절한 차트 타입 추천
 */
export function suggestChartType(xType: string, yType: string): 'bar' | 'line' | 'pie' | 'scatter' | 'area' | 'bubble' {
  if (xType === 'date' && yType === 'number') return 'line';
  if (xType === 'string' && yType === 'number') return 'bar';
  if (xType === 'number' && yType === 'number') return 'scatter';
  if (xType === 'string' && yType === 'string') return 'pie';
  return 'bar'; // default
}

/**
 * 숫자형 컬럼 목록 추출
 */
export function getNumericColumns(columns: Column[]): string[] {
  return columns.filter(col => col.type === 'number').map(col => col.name);
}

