import { CSVRow, ChartConfig } from '../types';
import { suggestChartType } from '../utils/chartMapper';

/**
 * 차트 데이터 생성
 */
export function generateChartData(
  data: CSVRow[],
  xAxis: string,
  yAxis: string,
  chartType: 'bar' | 'line' | 'pie' | 'scatter'
): any[] {
  if (chartType === 'pie') {
    // 파이 차트: x축 값별 개수 집계
    const counts: Record<string, number> = {};
    data.forEach(row => {
      const key = String(row[xAxis] || '');
      counts[key] = (counts[key] || 0) + 1;
    });
    
    return Object.entries(counts).map(([name, value]) => ({
      name,
      value,
    }));
  } else if (chartType === 'scatter') {
    // 산점도: 각 데이터 포인트를 그대로 표시
    return data
      .map(row => {
        const xValue = Number(row[xAxis]);
        const yValue = Number(row[yAxis]);
        
        if (!isNaN(xValue) && !isNaN(yValue) && isFinite(xValue) && isFinite(yValue)) {
          return {
            [xAxis]: xValue,
            [yAxis]: yValue,
          };
        }
        return null;
      })
      .filter((item): item is any => item !== null);
  } else {
    // 막대/선 차트: 그룹화된 데이터 생성
    const grouped: Record<string, number[]> = {};
    
    data.forEach(row => {
      const xValue = String(row[xAxis] || '');
      const yValue = Number(row[yAxis]);
      
      if (!isNaN(yValue) && isFinite(yValue)) {
        if (!grouped[xValue]) {
          grouped[xValue] = [];
        }
        grouped[xValue].push(yValue);
      }
    });
    
    // 그룹별 평균 계산
    return Object.entries(grouped).map(([name, values]) => {
      const avg = values.reduce((a, b) => a + b, 0) / values.length;
      return {
        name,
        [yAxis]: Number(avg.toFixed(2)),
      };
    }).sort((a, b) => {
      // 숫자면 숫자로, 아니면 문자열로 정렬
      const aNum = Number(a.name);
      const bNum = Number(b.name);
      if (!isNaN(aNum) && !isNaN(bNum)) {
        return aNum - bNum;
      }
      return a.name.localeCompare(b.name);
    });
  }
}

/**
 * 차트 설정 생성
 */
export function createChartConfig(
  data: CSVRow[],
  xAxis: string,
  yAxis: string,
  chartType: 'bar' | 'line' | 'pie' | 'scatter',
  xType: 'number' | 'string' | 'date',
  yType: 'number' | 'string' | 'date'
): ChartConfig {
  const suggestedType = suggestChartType(xType, yType);
  const finalType = chartType || suggestedType;
  
  const chartData = generateChartData(data, xAxis, yAxis, finalType);
  
  return {
    id: `chart-${Date.now()}`,
    type: finalType,
    xAxis,
    yAxis,
    data: chartData,
    title: `${xAxis} vs ${yAxis}`,
  };
}

