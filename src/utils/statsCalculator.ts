import _ from 'lodash';
import { CSVRow } from '../types';

/**
 * 숫자형 컬럼 통계 계산
 */
export function calculateNumericStats(data: CSVRow[], column: string) {
  const values = data
    .map(row => row[column])
    .filter(v => v != null && v !== '')
    .map(v => Number(v))
    .filter(v => !isNaN(v) && isFinite(v));
  
  if (values.length === 0) {
    return {
      mean: 0,
      median: 0,
      min: 0,
      max: 0,
      std: 0,
      count: 0,
    };
  }
  
  const mean = _.mean(values);
  const sorted = [...values].sort((a, b) => a - b);
  const median = sorted.length % 2 === 0
    ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
    : sorted[Math.floor(sorted.length / 2)];
  
  const variance = _.mean(values.map(v => Math.pow(v - mean, 2)));
  const std = Math.sqrt(variance);
  
  return {
    mean: Number(mean.toFixed(2)),
    median: Number(median.toFixed(2)),
    min: Number(_.min(values)?.toFixed(2) || 0),
    max: Number(_.max(values)?.toFixed(2) || 0),
    std: Number(std.toFixed(2)),
    count: values.length,
  };
}

/**
 * 텍스트형 컬럼 통계 계산
 */
export function calculateTextStats(data: CSVRow[], column: string) {
  const values = data
    .map(row => row[column])
    .filter(v => v != null && v !== '')
    .map(v => String(v));
  
  const unique = _.uniq(values);
  const counts = _.countBy(values);
  const sortedCounts = _.sortBy(_.entries(counts), 1).reverse();
  const mode = sortedCounts.length > 0 ? sortedCounts[0][0] : null;
  
  return {
    unique: unique.length,
    mode,
    count: values.length,
  };
}

/**
 * 컬럼 통계 계산 (타입에 따라 자동 선택)
 */
export function calculateStats(data: CSVRow[], column: string, type: 'number' | 'string' | 'date') {
  if (type === 'number') {
    return calculateNumericStats(data, column);
  } else {
    return calculateTextStats(data, column);
  }
}

