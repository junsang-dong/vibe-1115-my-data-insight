import { useState } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import html2canvas from 'html2canvas';
import { useDataStore } from '../store/dataStore';
import { getNumericColumns, suggestChartType } from '../utils/chartMapper';
import { createChartConfig } from '../hooks/useChartGenerator';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

export function ChartView() {
  const { rawData, columns, columnTypes, charts, addChart } = useDataStore();
  const [chartType, setChartType] = useState<'bar' | 'line' | 'pie' | 'scatter'>('bar');
  const [xAxis, setXAxis] = useState<string>('');
  const [yAxis, setYAxis] = useState<string>('');
  const [currentChartId, setCurrentChartId] = useState<string | null>(null);

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

  const renderChart = () => {
    if (!currentChart || !currentChart.data.length) {
      return (
        <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg">
          <p className="text-gray-500">차트를 생성해주세요.</p>
        </div>
      );
    }

    const { type, data, xAxis: chartXAxis, yAxis: chartYAxis } = currentChart;

    switch (type) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey={chartYAxis} fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'line':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey={chartYAxis} stroke="#3B82F6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        );

      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );

      case 'scatter':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <ScatterChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={chartXAxis} type="number" />
              <YAxis dataKey={chartYAxis} type="number" />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} />
              <Legend />
              <Scatter dataKey={chartYAxis} fill="#3B82F6" />
            </ScatterChart>
          </ResponsiveContainer>
        );

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
                <option value="pie">파이 차트</option>
                <option value="scatter">산점도</option>
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
            <div id={`chart-${currentChart.id}`}>
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

