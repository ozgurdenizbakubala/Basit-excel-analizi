import React, { useRef } from 'react';
import { UploadCloud, Loader2, FileType } from 'lucide-react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  isProcessing: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, isProcessing }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileSelect(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileSelect(e.dataTransfer.files[0]);
    }
  };

  return (
    <div 
      className={`relative group border-2 border-dashed rounded-2xl p-10 transition-all duration-300 text-center overflow-hidden
        ${isProcessing 
          ? 'border-blue-500/50 bg-blue-500/5 cursor-wait' 
          : 'border-slate-700 hover:border-blue-500 hover:bg-slate-800/50 cursor-pointer'
        }`}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={() => !isProcessing && fileInputRef.current?.click()}
    >
      <input 
        type="file" 
        accept=".xlsx, .xls, .csv" 
        ref={fileInputRef} 
        className="hidden" 
        onChange={handleFileChange}
        disabled={isProcessing}
      />
      
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="relative flex flex-col items-center justify-center gap-4 z-10">
        {isProcessing ? (
          <>
            <div className="relative">
               <div className="absolute inset-0 bg-blue-500 blur-xl opacity-20 animate-pulse"></div>
               <Loader2 className="h-12 w-12 text-blue-500 animate-spin relative z-10" />
            </div>
            <div className="space-y-1">
              <div className="text-blue-400 font-medium text-lg">Veriler İnceleniyor</div>
              <p className="text-slate-500 text-sm">Yapay zeka verilerinizi analiz ediyor...</p>
            </div>
          </>
        ) : (
          <>
            <div className="h-16 w-16 bg-slate-800 text-blue-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 group-hover:bg-slate-700 group-hover:text-blue-400">
              <UploadCloud size={32} />
            </div>
            <div>
              <h3 className="text-slate-200 font-semibold text-xl mb-2">Excel Dosyanı Yükle</h3>
              <p className="text-slate-400 text-sm">Sürükle bırak veya seçmek için tıkla</p>
            </div>
            <div className="flex gap-2 mt-2">
              <span className="px-2 py-1 bg-slate-800 rounded text-xs text-slate-500 border border-slate-700">.XLSX</span>
              <span className="px-2 py-1 bg-slate-800 rounded text-xs text-slate-500 border border-slate-700">.CSV</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};