import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCSVParser } from '../hooks/useCSVParser';
import { useDataStore } from '../store/dataStore';

export function FileUpload() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { parseCSV, isLoading, error } = useCSVParser();
  const { setFileData } = useDataStore();
  const [isDragging, setIsDragging] = useState(false);

  const handleFileSelect = (file: File) => {
    if (!file.name.endsWith('.csv')) {
      alert('CSV 파일만 업로드 가능합니다.');
      return;
    }

    parseCSV(file, (data, columns) => {
      setFileData(file, data, columns);
      navigate('/dashboard');
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const loadSampleData = async () => {
    try {
      const response = await fetch('/sample-data.csv');
      const text = await response.text();
      const blob = new Blob([text], { type: 'text/csv' });
      const file = new File([blob], 'sample-data.csv', { type: 'text/csv' });
      handleFileSelect(file);
    } catch (err) {
      alert('샘플 데이터를 불러올 수 없습니다.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">MyDataInsight</h1>
          <p className="text-gray-600">CSV 파일을 업로드하고 AI로 데이터를 분석해보세요</p>
        </div>

        <div
          className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
            isDragging
              ? 'border-primary bg-blue-50'
              : 'border-gray-300 bg-white hover:border-primary'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="hidden"
          />

          <div className="mb-6">
            <svg
              className="mx-auto h-16 w-16 text-gray-400"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <p className="text-lg text-gray-700 mb-2">
            CSV 파일을 드래그 앤 드롭하거나
          </p>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="text-primary hover:text-primary-dark font-semibold mb-4"
          >
            클릭하여 파일 선택
          </button>

          {isLoading && (
            <div className="mt-4">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <p className="mt-2 text-gray-600">파일을 분석하는 중...</p>
            </div>
          )}

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          <div className="mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={loadSampleData}
              className="text-sm text-gray-600 hover:text-primary"
              disabled={isLoading}
            >
              샘플 데이터 불러오기 →
            </button>
          </div>
        </div>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>지원 형식: CSV 파일 (최대 10MB)</p>
        </div>
      </div>
    </div>
  );
}

