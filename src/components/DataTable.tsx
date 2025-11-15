import { useState, useMemo } from 'react';
import { CSVRow, Column } from '../types';
import { Sidebar } from './Sidebar';
import { StatsCard } from './StatsCard';

interface DataTableProps {
  data: CSVRow[];
  columns: Column[];
}

type SortConfig = {
  column: string | null;
  direction: 'asc' | 'desc';
};

export function DataTable({ data, columns }: DataTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<SortConfig>({ column: null, direction: 'asc' });
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(
    new Set(columns.map(col => col.name))
  );

  const rowsPerPage = 20;

  // 검색 필터링
  const filteredData = useMemo(() => {
    if (!searchTerm) return data;
    
    return data.filter(row =>
      Object.values(row).some(value =>
        String(value).toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [data, searchTerm]);

  // 정렬
  const sortedData = useMemo(() => {
    if (!sortConfig.column) return filteredData;
    
    return [...filteredData].sort((a, b) => {
      const aVal = a[sortConfig.column!];
      const bVal = b[sortConfig.column!];
      
      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return 1;
      if (bVal == null) return -1;
      
      let comparison = 0;
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        comparison = aVal - bVal;
      } else {
        comparison = String(aVal).localeCompare(String(bVal));
      }
      
      return sortConfig.direction === 'asc' ? comparison : -comparison;
    });
  }, [filteredData, sortConfig]);

  // 페이지네이션
  const totalPages = Math.ceil(sortedData.length / rowsPerPage);
  const paginatedData = sortedData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const handleSort = (column: string) => {
    setSortConfig(prev => ({
      column,
      direction: prev.column === column && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const handleToggleColumn = (columnName: string) => {
    setVisibleColumns(prev => {
      const next = new Set(prev);
      if (next.has(columnName)) {
        next.delete(columnName);
      } else {
        next.add(columnName);
      }
      return next;
    });
  };

  const visibleColumnList = columns.filter(col => visibleColumns.has(col.name));

  return (
    <div className="flex h-full">
      <Sidebar
        columns={columns}
        visibleColumns={visibleColumns}
        onToggleColumn={handleToggleColumn}
      />
      
      <div className="flex-1 overflow-auto p-6">
        <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatsCard title="전체 행" value={data.length} icon="📊" />
          <StatsCard title="전체 열" value={columns.length} icon="📋" />
          <StatsCard title="필터된 행" value={filteredData.length} icon="🔍" />
          <StatsCard title="현재 페이지" value={`${currentPage} / ${totalPages}`} icon="📄" />
        </div>

        <div className="mb-4">
          <input
            type="text"
            placeholder="검색..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {visibleColumnList.map((column) => (
                    <th
                      key={column.name}
                      onClick={() => handleSort(column.name)}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    >
                      <div className="flex items-center space-x-1">
                        <span>{column.name}</span>
                        {sortConfig.column === column.name && (
                          <span>{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    {visibleColumnList.map((column) => (
                      <td key={column.name} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {row[column.name] != null ? String(row[column.name]) : '-'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {paginatedData.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            데이터가 없습니다.
          </div>
        )}

        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            {sortedData.length > 0
              ? `${(currentPage - 1) * rowsPerPage + 1} - ${Math.min(currentPage * rowsPerPage, sortedData.length)} / ${sortedData.length}`
              : '0'}
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              이전
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              다음
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

