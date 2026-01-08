import React from 'react';

interface TableProps<T> {
  data: T[];
  columns: {
    key: keyof T;
    label: string;
    width?: string;
    render?: (value: T[keyof T], row: T) => React.ReactNode;
  }[];
  onRowClick?: (row: T) => void;
  sortField?: keyof T;
  sortDirection?: 'asc' | 'desc';
  onSort?: (field: keyof T) => void;
}

export function Table<T>({
  data,
  columns,
  onRowClick,
  sortField,
  sortDirection,
  onSort
}: TableProps<T>) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-secondary-bg">
        <thead className="bg-secondary-bg">
          <tr>
            {columns.map(({ key, label, width }) => (
              <th
                key={String(key)}
                scope="col"
                style={{ width }}
                className="px-6 py-3 text-left text-xs font-medium text-secondary-text uppercase tracking-wider"
              >
                {onSort ? (
                  <button
                    onClick={() => onSort(key)}
                    className="flex items-center space-x-1 hover:text-primary-text"
                  >
                    <span>{label}</span>
                    {sortField === key && (
                      <span className="text-secondary-text">
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </button>
                ) : (
                  label
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-primary-bg divide-y divide-secondary-bg">
          {data.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              onClick={() => onRowClick?.(row)}
              className={onRowClick ? 'cursor-pointer hover:bg-secondary-bg' : ''}
            >
              {columns.map(({ key, render }) => (
                <td
                  key={String(key)}
                  className="px-6 py-4 whitespace-nowrap text-sm text-secondary-text"
                >
                  {render ? render(row[key], row) : String(row[key])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}