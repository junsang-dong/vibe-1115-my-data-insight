import { useState } from 'react';
import Papa from 'papaparse';
import { CSVRow } from '../types';
import { extractColumns } from '../utils/csvHelper';

interface UseCSVParserReturn {
  parseCSV: (file: File, onComplete: (data: CSVRow[], columns: ReturnType<typeof extractColumns>) => void) => void;
  isLoading: boolean;
  error: string | null;
}

export function useCSVParser(): UseCSVParserReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const parseCSV = (file: File, onComplete: (data: CSVRow[], columns: ReturnType<typeof extractColumns>) => void) => {
    setIsLoading(true);
    setError(null);

    // 파일 크기 제한 (10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('파일 크기는 10MB를 초과할 수 없습니다.');
      setIsLoading(false);
      return;
    }

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const data = results.data as CSVRow[];
          const columns = extractColumns(data);
          
          setIsLoading(false);
          onComplete(data, columns);
        } catch (err) {
          setError('CSV 파싱 중 오류가 발생했습니다.');
          setIsLoading(false);
        }
      },
      error: (error) => {
        setError(`CSV 파싱 오류: ${error.message}`);
        setIsLoading(false);
      },
    });
  };

  return { parseCSV, isLoading, error };
}

