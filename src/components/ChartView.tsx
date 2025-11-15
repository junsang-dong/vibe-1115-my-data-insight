import { useState, useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import {
  Bar,
  Line,
  Pie,
  Scatter,
  Bubble,
} from 'react-chartjs-2';
import html2canvas from 'html2canvas';
import { useDataStore } from '../store/dataStore';
import { getNumericColumns, suggestChartType } from '../utils/chartMapper';
import { createChartConfig } from '../hooks/useChartGenerator';

// Chart.js 등록
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const COLORS = [
  'rgba(59, 130, 246, 0.8)',   // blue
  'rgba(16, 185, 129, 0.8)',   // green
  'rgba(245, 158, 11, 0.8)',   // yellow
  'rgba(239, 68, 68, 0.8)',    // red
  'rgba(139, 92, 246, 0.8)',   // purple
  'rgba(236, 72, 153, 0.8)',    // pink
];

const BORDER_COLORS = [
  'rgb(59, 130, 246)',
  'rgb(16, 185, 129)',
  'rgb(245, 158, 11)',
  'rgb(239, 68, 68)',
  'rgb(139, 92, 246)',
  'rgb(236, 72, 153)',
];

export function ChartView() {
  const { rawData, columns, columnTypes, charts, addChart } = useDataStore();
  const [chartType, setChartType] = useState<'bar' | 'line' | 'pie' | 'scatter' | 'area' | 'bubble'>('bar');
  const [xAxis, setXAxis] = useState<string>('');
  const [yAxis, setYAxis] = useState<string>('');
  const [currentChartId, setCurrentChartId] = useState<string | null>(null);
  const chartRef = useRef<HTMLDivElement>(null);

  const numericColumns = getNumericColumns(columns);
  const allColumns = columns.map(col => col.name);

  // 초기값 설정
  if (!xAxis && allColumns.length > 0) {
    setXAxis(allColumns[0]);
  }
  if (!yAxis && numericColumns.length > 0) {
    setYAxis(numericColumns[0]);
  }

  const handleGenerateChart = () => {
    if (!xAxis || !yAxis) return;

    const xType = columnTypes[xAxis] || 'string';
    const yType = columnTypes[yAxis] || 'number';

    const suggestedType = suggestChartType(xType, yType);
    const finalType = chartType || suggestedType;

    const chartConfig = createChartConfig(rawData, xAxis, yAxis, finalType, xType, yType);
    addChart(chartConfig);
    setCurrentChartId(chartConfig.id);
  };

  const currentChart = charts.find(chart => chart.id === currentChartId) || charts[charts.length - 1];

  const handleDownloadChart = async (chartId: string) => {
    const element = document.getElementById(`chart-${chartId}`);
    if (!element) return;

    try {
      const canvas = await html2canvas(element);
      const link = document.createElement('a');
      link.download = `chart-${chartId}.png`;
      link.href = canvas.toDataURL();
      link.click();
    } catch (err) {
      alert('차트 다운로드 중 오류가 발생했습니다.');
    }
  };

  const prepareChartData = () => {
    if (!currentChart || !currentChart.data.length) return null;

    const { type, data, xAxis: chartXAxis, yAxis: chartYAxis } = currentChart;

    if (type === 'pie') {
      return {
        labels: data.map((item: any) => item.name),
        datasets: [
          {
            label: chartXAxis,
            data: data.map((item: any) => item.value),
            backgroundColor: COLORS.slice(0, data.length),
            borderColor: BORDER_COLORS.slice(0, data.length),
            borderWidth: 1,
          },
        ],
      };
    }

    if (type === 'scatter' || type === 'bubble') {
      return {
        datasets: [
          {
            label: `${chartXAxis} vs ${chartYAxis}`,
            data: data.map((item: any) => ({
              x: item[chartXAxis],
              y: item[chartYAxis],
              r: type === 'bubble' ? Math.abs(item[chartYAxis]) / 100 : undefined,
            })),
            backgroundColor: COLORS[0],
            borderColor: BORDER_COLORS[0],
            borderWidth: 1,
          },
        ],
      };
    }

    // Bar, Line, Area 차트
    return {
      labels: data.map((item: any) => item.name || item[chartXAxis]),
      datasets: [
        {
          label: chartYAxis,
          data: data.map((item: any) => item[chartYAxis] || item.value),
          backgroundColor: type === 'area' 
            ? COLORS[0].replace('0.8', '0.5')
            : COLORS[0],
          borderColor: BORDER_COLORS[0],
          borderWidth: 2,
          fill: type === 'area',
          tension: type === 'line' || type === 'area' ? 0.4 : 0,
        },
      ],
    };
  };

  const chartData = prepareChartData();
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: currentChart?.title || '차트',
      },
      tooltip: {
        enabled: true,
      },
    },
    scales: currentChart?.type === 'pie' ? undefined : {
      x: {
        display: true,
        title: {
          display: true,
          text: currentChart?.xAxis || 'X축',
        },
      },
      y: {
        display: true,
        title: {
          display: true,
          text: currentChart?.yAxis || 'Y축',
        },
      },
    },
  };

  const renderChart = () => {
    if (!currentChart || !chartData) {
      return (
        <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg">
          <p className="text-gray-500">차트를 생성해주세요.</p>
        </div>
      );
    }

    const { type } = currentChart;

    switch (type) {
      case 'bar':
        return <Bar data={chartData} options={chartOptions} />;
      case 'line':
        return <Line data={chartData} options={chartOptions} />;
      case 'area':
        return <Line data={chartData} options={chartOptions} />;
      case 'pie':
        return <Pie data={chartData} options={chartOptions} />;
      case 'scatter':
        return <Scatter data={chartData} options={chartOptions} />;
      case 'bubble':
        return <Bubble data={chartData} options={chartOptions} />;
      default:
        return null;
    }
  };

  return (
    <div className="p-6 h-full overflow-auto">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">📊 차트 생성</h2>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                차트 타입
              </label>
              <select
                value={chartType}
                onChange={(e) => setChartType(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
              >
                <option value="bar">막대 그래프</option>
                <option value="line">선 그래프</option>
                <option value="area">영역 그래프</option>
                <option value="pie">파이 차트</option>
                <option value="scatter">산점도</option>
                <option value="bubble">버블 차트</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                X축 (카테고리)
              </label>
              <select
                value={xAxis}
                onChange={(e) => setXAxis(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
              >
                {allColumns.map(col => (
                  <option key={col} value={col}>{col}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Y축 (값)
              </label>
              <select
                value={yAxis}
                onChange={(e) => setYAxis(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
              >
                {numericColumns.map(col => (
                  <option key={col} value={col}>{col}</option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={handleGenerateChart}
                className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-600"
              >
                차트 생성
              </button>
            </div>
          </div>
        </div>

        {currentChart && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {currentChart.title || '차트'}
              </h3>
              <button
                onClick={() => handleDownloadChart(currentChart.id)}
                className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-green-600"
              >
                PNG 다운로드
              </button>
            </div>
            <div 
              id={`chart-${currentChart.id}`}
              ref={chartRef}
              className="h-96"
            >
              {renderChart()}
            </div>
          </div>
        )}

        {charts.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">생성된 차트 목록</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {charts.map((chart) => (
                <div
                  key={chart.id}
                  onClick={() => setCurrentChartId(chart.id)}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    currentChartId === chart.id
                      ? 'border-primary bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <p className="font-medium text-gray-900">{chart.title}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {chart.type} • {chart.xAxis} vs {chart.yAxis}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
