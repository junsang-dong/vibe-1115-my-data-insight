import { useState } from 'react';
import { CSVRow, Column } from '../types';
import { getNumericColumns } from '../utils/chartMapper';

interface UseGPTAnalysisReturn {
  generateSummary: (data: CSVRow[], columns: Column[]) => Promise<string>;
  askQuestion: (question: string, data: CSVRow[], columns: Column[]) => Promise<string>;
  isLoading: boolean;
  error: string | null;
}

export function useGPTAnalysis(): UseGPTAnalysisReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const callGPT = async (prompt: string): Promise<string> => {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    
    if (!apiKey) {
      throw new Error('OpenAI API 키가 설정되지 않았습니다. .env.local 파일을 확인해주세요.');
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 2000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `API 오류: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || '응답을 생성할 수 없습니다.';
  };

  const generateSummary = async (data: CSVRow[], columns: Column[]): Promise<string> => {
    setIsLoading(true);
    setError(null);

    try {
      const numericColumns = getNumericColumns(columns);
      const sampleData = data.slice(0, 5);
      
      const prompt = `다음 CSV 데이터를 분석하고 한국어로 요약해주세요:

**컬럼 정보:**
${columns.map(col => `- ${col.name} (${col.type})`).join('\n')}

**샘플 데이터 (처음 5행):**
\`\`\`json
${JSON.stringify(sampleData, null, 2)}
\`\`\`

**통계 정보:**
- 전체 행 수: ${data.length}
- 전체 열 수: ${columns.length}
- 숫자형 컬럼: ${numericColumns.length > 0 ? numericColumns.join(', ') : '없음'}

다음 항목을 포함하여 마크다운 형식으로 분석 결과를 작성해주세요:
1. 데이터 개요
2. 주요 인사이트
3. 발견된 패턴
4. 추천 분석 방향

간결하고 실용적인 내용으로 작성해주세요.`;

      const summary = await callGPT(prompt);
      setIsLoading(false);
      return summary;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.';
      setError(errorMessage);
      setIsLoading(false);
      throw err;
    }
  };

  const askQuestion = async (question: string, data: CSVRow[], columns: Column[]): Promise<string> => {
    setIsLoading(true);
    setError(null);

    try {
      // 관련 데이터 샘플링 (토큰 절약)
      const sampleData = data.slice(0, 10);
      
      const prompt = `다음 CSV 데이터에 대한 질문에 답변해주세요. 한국어로 답변해주세요.

**질문:** ${question}

**컬럼 정보:**
${columns.map(col => `- ${col.name} (${col.type})`).join('\n')}

**데이터 샘플 (처음 10행):**
\`\`\`json
${JSON.stringify(sampleData, null, 2)}
\`\`\`

**전체 데이터 통계:**
- 전체 행 수: ${data.length}
- 전체 열 수: ${columns.length}

질문에 답변하고, 필요하다면 데이터를 기반으로 구체적인 수치나 패턴을 설명해주세요.`;

      const answer = await callGPT(prompt);
      setIsLoading(false);
      return answer;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.';
      setError(errorMessage);
      setIsLoading(false);
      throw err;
    }
  };

  return { generateSummary, askQuestion, isLoading, error };
}

