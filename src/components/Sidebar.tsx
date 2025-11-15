import { Column } from '../types';

interface SidebarProps {
  columns: Column[];
  visibleColumns: Set<string>;
  onToggleColumn: (columnName: string) => void;
}

export function Sidebar({ columns, visibleColumns, onToggleColumn }: SidebarProps) {
  return (
    <div className="w-64 bg-white border-r border-gray-200 p-4 overflow-y-auto">
      <h3 className="font-semibold text-gray-900 mb-4">컬럼 선택</h3>
      <div className="space-y-2">
        {columns.map((column) => (
          <label
            key={column.name}
            className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
          >
            <input
              type="checkbox"
              checked={visibleColumns.has(column.name)}
              onChange={() => onToggleColumn(column.name)}
              className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
            />
            <span className="text-sm text-gray-700 flex-1">{column.name}</span>
            <span className="text-xs text-gray-500 px-2 py-1 bg-gray-100 rounded">
              {column.type}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}

