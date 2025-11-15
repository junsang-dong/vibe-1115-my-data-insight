import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDataStore } from '../store/dataStore';
import { DataTable } from '../components/DataTable';
import { DataSummary } from '../components/DataSummary';
import { ChartView } from '../components/ChartView';
import { ChatInterface } from '../components/ChatInterface';
import { getLocalStorageSize, formatStorageSize } from '../utils/localStorage';

type Tab = 'table' | 'summary' | 'chart' | 'chat';

export function DashboardPage() {
  const navigate = useNavigate();
  const { fileName, rawData, columns, reset, clearStorage } = useDataStore();
  const [activeTab, setActiveTab] = useState<Tab>('table');
  const [storageSize, setStorageSize] = useState<string>('0 B');

  // 스토리지 용량 업데이트
  useEffect(() => {
    const updateStorageSize = () => {
      const size = getLocalStorageSize();
      setStorageSize(formatStorageSize(size));
    };
    
    updateStorageSize();
    // 스토리지 변경 감지를 위한 인터벌
    const interval = setInterval(updateStorageSize, 1000);
    
    return () => clearInterval(interval);
  }, [rawData, columns]);

  const handleNewFile = () => {
    reset();
    navigate('/');
  };

  const handleClearStorage = () => {
    if (window.confirm('로컬 스토리지의 모든 데이터를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      clearStorage();
      setStorageSize('0 B');
      navigate('/');
    }
  };

  if (rawData.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">데이터가 없습니다.</p>
          <button
            onClick={handleNewFile}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-600"
          >
            새 파일 업로드
          </button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'table' as Tab, label: '📊 테이블', component: <DataTable data={rawData} columns={columns} /> },
    { id: 'summary' as Tab, label: '💡 요약', component: <DataSummary /> },
    { id: 'chart' as Tab, label: '📈 차트', component: <ChartView /> },
    { id: 'chat' as Tab, label: '💬 질문하기', component: <ChatInterface /> },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* 헤더 */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h1 className="text-xl font-bold text-gray-900">MyDataInsight</h1>
            <div className="mt-2 flex items-center space-x-4 text-sm text-gray-600">
              <div>
                <span className="font-medium">현재 데이터:</span> {fileName || '없음'}
              </div>
              <div>
                <span className="font-medium">저장 용량:</span> {storageSize}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleClearStorage}
              className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 text-sm"
            >
              로컬 스토리지 비우기
            </button>
            <button
              onClick={handleNewFile}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              새 파일 업로드
            </button>
          </div>
        </div>
      </header>

      {/* 탭 네비게이션 */}
      <div className="bg-white border-b border-gray-200 px-6">
        <div className="flex space-x-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 컨텐츠 영역 */}
      <main className="flex-1 overflow-hidden">
        {tabs.find(tab => tab.id === activeTab)?.component}
      </main>
    </div>
  );
}

