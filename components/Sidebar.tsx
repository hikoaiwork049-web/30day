
import React from 'react';
import { Type, LayoutGrid, Calendar, Trash2, Upload, Download, Clock, Info, FontCursor } from 'lucide-react';
import { ChallengeConfig } from '../types';

interface SidebarProps {
  config: ChallengeConfig;
  setConfig: React.Dispatch<React.SetStateAction<ChallengeConfig>>;
  imagesCount: number;
  onClear: () => void;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onExport: () => void;
  isExporting: boolean;
  fileInputRef: React.RefObject<HTMLInputElement>;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  config, 
  setConfig, 
  imagesCount, 
  onClear, 
  onUpload, 
  onExport,
  isExporting,
  fileInputRef
}) => {
  const hasContent = imagesCount > 0 || config.skippedDays.length > 0;

  const fontOptions = [
    { id: 'serif', label: '襯線體', class: 'font-serif-title' },
    { id: 'script', label: '手寫體', class: 'font-script' },
    { id: 'sans', label: '簡約黑體', class: 'font-sans font-black' },
  ];

  return (
    <aside className="hidden md:flex flex-col w-80 bg-white border-r border-slate-200 h-screen sticky top-0 overflow-y-auto">
      <div className="p-6 border-b border-slate-100 bg-indigo-50/30">
        <h1 className="text-xl font-black text-indigo-900 flex items-center gap-2">
          <div className="p-1.5 bg-indigo-600 rounded-lg text-white">
            <LayoutGrid className="w-5 h-5" />
          </div>
          挑戰生成器
        </h1>
        <p className="text-xs text-indigo-600 mt-1 font-bold tracking-widest uppercase opacity-70">視覺成長日誌</p>
      </div>

      <div className="p-6 space-y-8 flex-1">
        {/* Date & Layout Settings */}
        <div className="space-y-4">
          <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
            <Clock className="w-4 h-4 text-indigo-500" />
            日期與版面設定
          </label>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">年份</span>
              <input 
                type="text"
                value={config.year}
                onChange={(e) => setConfig({ ...config, year: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            <div className="space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">月份</span>
              <input 
                type="text"
                value={config.month}
                onChange={(e) => setConfig({ ...config, month: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            <div className="space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">起始空格</span>
              <input 
                type="number"
                min="0"
                max="6"
                value={config.startOffset}
                onChange={(e) => setConfig({ ...config, startOffset: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            <div className="space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">網格欄數</span>
              <select 
                value={config.columns}
                onChange={(e) => setConfig({ ...config, columns: parseInt(e.target.value) || 5 })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                {[4, 5, 6, 7].map(c => <option key={c} value={c}>{c} 欄</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Plan Days Selector */}
        <div className="space-y-4">
          <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
            <Calendar className="w-4 h-4 text-indigo-500" />
            計畫天數
          </label>
          <div className="flex gap-2 p-1 bg-slate-100 rounded-xl">
            {[30, 31].map((days) => (
              <button
                key={days}
                onClick={() => setConfig({ ...config, totalDays: days as 30 | 31 })}
                className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
                  config.totalDays === days 
                    ? 'bg-white shadow-md text-indigo-600' 
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {days} 天
              </button>
            ))}
          </div>
        </div>

        {/* Title Configuration */}
        <div className="space-y-4">
          <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
            <Type className="w-4 h-4 text-indigo-500" />
            標題設定
          </label>
          <div className="space-y-3">
            <input 
              type="text"
              value={config.title}
              placeholder="輸入挑戰名稱..."
              onChange={(e) => setConfig({ ...config, title: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            />
            
            <div className="flex flex-col gap-2">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">字型風格</span>
              <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 rounded-lg">
                {fontOptions.map((font) => (
                  <button
                    key={font.id}
                    onClick={() => setConfig({ ...config, titleFont: font.id as any })}
                    className={`py-1.5 rounded text-[10px] font-bold transition-all ${
                      config.titleFont === font.id 
                        ? 'bg-white shadow-sm text-indigo-600' 
                        : 'text-slate-400 hover:text-slate-500'
                    }`}
                  >
                    {font.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Upload Button */}
        <div className="space-y-4">
          <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
            <Upload className="w-4 h-4 text-indigo-500" />
            上傳圖片
          </label>
          <div className="relative group">
            <input 
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={onUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              disabled={imagesCount >= config.totalDays}
            />
            <div className={`p-8 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center text-center transition-all ${
              imagesCount >= config.totalDays
                ? 'bg-slate-50 border-slate-200 opacity-50 cursor-not-allowed'
                : 'bg-white border-slate-300 group-hover:border-indigo-400 group-hover:bg-indigo-50'
            }`}>
              <Upload className={`w-8 h-8 mb-2 ${imagesCount >= config.totalDays ? 'text-slate-300' : 'text-indigo-500'}`} />
              <span className="text-xs font-bold text-slate-500">
                {imagesCount >= config.totalDays ? '網格已滿' : '上傳多張圖片'}
              </span>
            </div>
          </div>
          
          {hasContent && (
            <button 
              onClick={onClear}
              className="w-full py-2 flex items-center justify-center gap-2 text-sm text-red-500 font-bold hover:bg-red-50 rounded-lg transition-colors border border-red-100"
            >
              <Trash2 className="w-4 h-4" />
              清空內容
            </button>
          )}
        </div>
      </div>

      <div className="p-6 border-t border-slate-100 space-y-3">
        <button 
          onClick={onExport}
          disabled={!hasContent || isExporting}
          className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-200 transition-all transform active:scale-95"
        >
          {isExporting ? '處理中...' : '下載 IG 4:5 圖片'}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
