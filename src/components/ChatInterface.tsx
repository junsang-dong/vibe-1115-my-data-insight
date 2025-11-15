import { useState } from 'react';
import { useDataStore } from '../store/dataStore';
import { useGPTAnalysis } from '../hooks/useGPTAnalysis';

export function ChatInterface() {
  const { rawData, columns, chatHistory, addChatMessage } = useDataStore();
  const { askQuestion, isLoading, error } = useGPTAnalysis();
  const [input, setInput] = useState('');

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const question = input.trim();
    setInput('');
    addChatMessage('user', question);

    try {
      const answer = await askQuestion(question, rawData, columns);
      addChatMessage('assistant', answer);
    } catch (err) {
      addChatMessage('assistant', '질문에 답변하는 중 오류가 발생했습니다. 다시 시도해주세요.');
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900">💬 데이터 질문하기</h2>
        <p className="text-sm text-gray-600 mt-1">데이터에 대해 궁금한 것을 물어보세요</p>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {chatHistory.length === 0 && (
          <div className="text-center text-gray-500 py-12">
            <p className="mb-2">아직 대화가 없습니다.</p>
            <p className="text-sm">데이터에 대해 질문해보세요!</p>
          </div>
        )}

        {chatHistory.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-3xl rounded-lg p-4 ${
                msg.role === 'user'
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              <div className="whitespace-pre-wrap">{msg.content}</div>
              <div
                className={`text-xs mt-2 ${
                  msg.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                }`}
              >
                {msg.timestamp.toLocaleTimeString('ko-KR')}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                <span className="text-gray-600">답변을 생성하는 중...</span>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600">{error}</p>
          </div>
        )}
      </div>

      <div className="border-t border-gray-200 p-4 bg-white">
        <div className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="데이터에 대해 질문하세요..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            전송
          </button>
        </div>
      </div>
    </div>
  );
}

