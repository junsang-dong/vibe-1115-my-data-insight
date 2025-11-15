import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { useDataStore } from '../store/dataStore';
import { useGPTAnalysis } from '../hooks/useGPTAnalysis';

export function DataSummary() {
  const { rawData, columns, summary, setSummary, setAnalyzing } = useDataStore();
  const { generateSummary, isLoading, error } = useGPTAnalysis();
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (rawData.length > 0 && columns.length > 0 && !summary) {
      handleGenerateSummary();
    }
  }, []);

  const handleGenerateSummary = async () => {
    setAnalyzing(true);
    setLocalError(null);
    
    try {
      const result = await generateSummary(rawData, columns);
      setSummary(result);
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : '요약 생성 중 오류가 발생했습니다.');
    } finally {
      setAnalyzing(false);
    }
  };

  const displayError = error || localError;

  return (
    <div className="p-6 h-full overflow-auto">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <span className="mr-2">💡</span>
            AI 분석 결과
          </h2>
          <button
            onClick={handleGenerateSummary}
            disabled={isLoading}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? '분석 중...' : '다시 분석'}
          </button>
        </div>

        {isLoading && (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
            <p className="text-gray-600">AI가 데이터를 분석하고 있습니다...</p>
          </div>
        )}

        {displayError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-600">{displayError}</p>
          </div>
        )}

        {!isLoading && summary && (
          <div className="bg-white rounded-lg shadow p-6 prose max-w-none data-summary-content">
            <ReactMarkdown>{summary}</ReactMarkdown>
          </div>
        )}

        {!isLoading && !summary && !displayError && (
          <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
            <p>분석 결과가 없습니다. "다시 분석" 버튼을 클릭하여 분석을 시작하세요.</p>
          </div>
        )}
      </div>
    </div>
  );
}

