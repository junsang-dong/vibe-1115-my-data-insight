import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDataStore } from '../store/dataStore';
import { DataTable } from '../components/DataTable';
import { DataSummary } from '../components/DataSummary';
import { ChartView } from '../components/ChartView';
import { ChatInterface } from '../components/ChatInterface';

type Tab = 'table' | 'summary' | 'chart' | 'chat';

export function DashboardPage() {
  const navigate = useNavigate();
  const { fileName, rawData, columns, reset } = useDataStore();
  const [activeTab, setActiveTab] = useState<Tab>('table');

  const handleNewFile = () => {
    reset();
    navigate('/');
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
          <div>
            <h1 className="text-xl font-bold text-gray-900">MyDataInsight</h1>
            <p className="text-sm text-gray-600">{fileName}</p>
          </div>
          <button
            onClick={handleNewFile}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
          >
            새 파일 업로드
          </button>
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

