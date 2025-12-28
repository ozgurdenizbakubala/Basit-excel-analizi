import React from 'react';
import { ParsedData } from '../types';
import { FileSpreadsheet } from 'lucide-react';

interface DataPreviewProps {
  data: ParsedData | null;
}

export const DataPreview: React.FC<DataPreviewProps> = ({ data }) => {
  if (!data) return null;

  // Only show first 5 columns and first 10 rows for preview to keep UI clean
  const previewHeaders = data.headers.slice(0, 6);
  const previewRows = data.rows.slice(0, 10);

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-xl overflow-hidden flex flex-col h-full">
      <div className="bg-slate-900 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2 text-slate-200 font-medium">
          <FileSpreadsheet size={18} className="text-blue-500" />
          <span>Veri Önizlemesi</span>
        </div>
        <span className="text-xs text-slate-400 bg-slate-800 px-2 py-1 rounded-full border border-slate-700">
          {data.rows.length} Satır
        </span>
      </div>
      
      <div className="overflow-auto flex-1 p-0 scrollbar-hide">
        <table className="min-w-full divide-y divide-slate-800 text-sm">
          <thead className="bg-slate-950 sticky top-0 z-10">
            <tr>
              {previewHeaders.map((header, idx) => (
                <th key={idx} className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap bg-slate-950">
                  {header}
                </th>
              ))}
              {data.headers.length > 6 && (
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider bg-slate-950">
                  ...
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-slate-900 divide-y divide-slate-800">
            {previewRows.map((row, rowIdx) => (
              <tr key={rowIdx} className="hover:bg-slate-800/50 transition-colors">
                {previewHeaders.map((header, colIdx) => (
                  <td key={colIdx} className="px-4 py-3 whitespace-nowrap text-slate-300">
                    {row[header]?.toString() || '-'}
                  </td>
                ))}
                {data.headers.length > 6 && (
                  <td className="px-4 py-3 whitespace-nowrap text-slate-600">...</td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="bg-slate-900 px-4 py-2 border-t border-slate-800 text-[10px] text-center text-slate-500">
        Analiz için sadece ilk 1500 satır kullanılmaktadır.
      </div>
    </div>
  );
};