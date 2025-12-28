import * as XLSX from 'xlsx';
import { ParsedData } from '../types';

export const parseExcelFile = (file: File): Promise<ParsedData> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        if (!data) {
          throw new Error("Dosya okunamadı.");
        }

        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        // Convert sheet to JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        if (jsonData.length === 0) {
          throw new Error("Excel dosyası boş.");
        }

        // Extract headers and rows
        const headers = jsonData[0] as string[];
        const rawRows = jsonData.slice(1);
        
        // Map rows to objects based on headers for better AI context
        const rows = rawRows.map((row: any) => {
          const rowObj: any = {};
          headers.forEach((header, index) => {
            rowObj[header] = row[index];
          });
          return rowObj;
        });

        resolve({
          fileName: file.name,
          headers,
          rows
        });
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = (error) => reject(error);
    reader.readAsBinaryString(file);
  });
};

export const formatDataForAI = (data: ParsedData): string => {
  // Convert rows to CSV format string for efficient injection into the prompt
  // This allows the model to treat it as a CSV file content in its reasoning.
  
  const headers = data.headers.join(',');
  
  // Limit to ~1500 rows to ensure we stay within context window while giving enough data for accurate analysis
  // Most "summary" questions don't need millions of rows, but need a good representative sample or the full set if small.
  const limitedRows = data.rows.slice(0, 1500); 
  
  const csvRows = limitedRows.map(row => {
    return data.headers.map(header => {
      const cell = row[header];
      // Basic CSV escaping
      if (typeof cell === 'string' && (cell.includes(',') || cell.includes('"') || cell.includes('\n'))) {
        return `"${cell.replace(/"/g, '""')}"`;
      }
      return cell;
    }).join(',');
  });

  return `
Data Headers: ${headers}
Data Content (CSV Format):
${headers}
${csvRows.join('\n')}
`;
};