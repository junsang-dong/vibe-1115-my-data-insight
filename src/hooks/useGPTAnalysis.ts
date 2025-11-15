import { useState } from 'react';
import { CSVRow, Column } from '../types';
import { getNumericColumns } from '../utils/chartMapper';

interface ChartRecommendation {
  type: 'bar' | 'line' | 'pie' | 'scatter' | 'area' | 'bubble';
  xAxis: string;
  yAxis: string;
  title: string;
  description: string;
}

interface UseGPTAnalysisReturn {
  generateSummary: (data: CSVRow[], columns: Column[]) => Promise<string>;
  askQuestion: (question: string, data: CSVRow[], columns: Column[]) => Promise<string>;
  recommendCharts: (data: CSVRow[], columns: Column[]) => Promise<ChartRecommendation[]>;
  recommendQuestions: (data: CSVRow[], columns: Column[]) => Promise<string[]>;
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

  const recommendCharts = async (data: CSVRow[], columns: Column[]): Promise<ChartRecommendation[]> => {
    setIsLoading(true);
    setError(null);

    try {
      const numericColumns = getNumericColumns(columns);
      const sampleData = data.slice(0, 10);
      
      const prompt = `다음 CSV 데이터를 분석하고, 데이터를 시각화하기에 적합한 차트 3~6개를 추천해주세요.

**컬럼 정보:**
${columns.map(col => `- ${col.name} (${col.type})`).join('\n')}

**데이터 샘플 (처음 10행):**
\`\`\`json
${JSON.stringify(sampleData, null, 2)}
\`\`\`

**전체 데이터 통계:**
- 전체 행 수: ${data.length}
- 전체 열 수: ${columns.length}
- 숫자형 컬럼: ${numericColumns.join(', ')}

다음 JSON 형식으로 응답해주세요. 각 차트는 데이터의 다른 인사이트를 보여주어야 합니다:
\`\`\`json
[
  {
    "type": "bar" | "line" | "pie" | "scatter" | "area" | "bubble",
    "xAxis": "컬럼명",
    "yAxis": "컬럼명",
    "title": "차트 제목",
    "description": "이 차트가 보여주는 인사이트 설명"
  }
]
\`\`\`

중요:
- 반드시 유효한 JSON 형식으로만 응답하세요
- xAxis는 카테고리 컬럼, yAxis는 숫자형 컬럼이어야 합니다
- 각 차트는 서로 다른 관점을 보여주어야 합니다
- 3~6개의 차트를 추천해주세요`;

      const response = await callGPT(prompt);
      
      // JSON 추출 (마크다운 코드 블록 제거)
      let jsonStr = response.trim();
      if (jsonStr.includes('```json')) {
        jsonStr = jsonStr.split('```json')[1].split('```')[0].trim();
      } else if (jsonStr.includes('```')) {
        jsonStr = jsonStr.split('```')[1].split('```')[0].trim();
      }
      
      const recommendations: ChartRecommendation[] = JSON.parse(jsonStr);
      
      // 유효성 검사
      const validRecommendations = recommendations.filter(rec => 
        rec.type && 
        rec.xAxis && 
        rec.yAxis && 
        columns.some(col => col.name === rec.xAxis) &&
        numericColumns.includes(rec.yAxis)
      );
      
      setIsLoading(false);
      return validRecommendations.slice(0, 6); // 최대 6개
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.';
      setError(errorMessage);
      setIsLoading(false);
      throw err;
    }
  };

  const recommendQuestions = async (data: CSVRow[], columns: Column[]): Promise<string[]> => {
    setIsLoading(true);
    setError(null);

    try {
      const numericColumns = getNumericColumns(columns);
      const sampleData = data.slice(0, 10);
      
      const prompt = `다음 CSV 데이터를 분석하고, 사용자가 데이터에 대해 물어볼 수 있는 유용한 질문 6개를 추천해주세요.

**컬럼 정보:**
${columns.map(col => `- ${col.name} (${col.type})`).join('\n')}

**데이터 샘플 (처음 10행):**
\`\`\`json
${JSON.stringify(sampleData, null, 2)}
\`\`\`

**전체 데이터 통계:**
- 전체 행 수: ${data.length}
- 전체 열 수: ${columns.length}
- 숫자형 컬럼: ${numericColumns.join(', ')}

다음 JSON 형식으로 응답해주세요. 각 질문은 데이터의 다른 측면을 탐색하는 것이어야 합니다:
\`\`\`json
[
  "질문 1",
  "질문 2",
  "질문 3",
  "질문 4",
  "질문 5",
  "질문 6"
]
\`\`\`

중요:
- 반드시 유효한 JSON 배열 형식으로만 응답하세요
- 각 질문은 한국어로 작성해주세요
- 질문은 구체적이고 데이터 분석에 유용해야 합니다
- 통계, 트렌드, 비교, 패턴 등 다양한 관점의 질문을 포함해주세요
- 정확히 6개의 질문을 제공해주세요`;

      const response = await callGPT(prompt);
      
      // JSON 추출 (마크다운 코드 블록 제거)
      let jsonStr = response.trim();
      if (jsonStr.includes('```json')) {
        jsonStr = jsonStr.split('```json')[1].split('```')[0].trim();
      } else if (jsonStr.includes('```')) {
        jsonStr = jsonStr.split('```')[1].split('```')[0].trim();
      }
      
      const questions: string[] = JSON.parse(jsonStr);
      
      // 유효성 검사 및 최대 6개 제한
      const validQuestions = questions
        .filter((q: any) => typeof q === 'string' && q.trim().length > 0)
        .slice(0, 6);
      
      setIsLoading(false);
      return validQuestions;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.';
      setError(errorMessage);
      setIsLoading(false);
      throw err;
    }
  };

  return { generateSummary, askQuestion, recommendCharts, recommendQuestions, isLoading, error };
}

