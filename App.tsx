
import React, { useState, useRef, useEffect } from 'react';
import { ChallengeImage, ChallengeConfig } from './types';
import ChallengeBoard from './components/ChallengeBoard';
import Sidebar from './components/Sidebar';
import * as htmlToImage from 'html-to-image';

const App: React.FC = () => {
  const [images, setImages] = useState<ChallengeImage[]>([]);
  const [config, setConfig] = useState<ChallengeConfig>({
    title: '30 Day Challenge',
    totalDays: 30,
    titleFont: 'script',
    themeColor: '#334155',
    year: new Date().getFullYear().toString(),
    month: (new Date().getMonth() + 1).toString(),
    startOffset: 0,
    columns: 5,
    skippedDays: [],
  });
  const [isExporting, setIsExporting] = useState(false);
  const boardRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewScale, setPreviewScale] = useState(0.25);

  // 動態計算預覽比例，確保畫布始終完整顯示在螢幕內
  useEffect(() => {
    const updateScale = () => {
      const container = document.getElementById('preview-container');
      if (container) {
        const hScale = (container.clientHeight - 60) / 2700;
        const wScale = (container.clientWidth - 60) / 2160;
        setPreviewScale(Math.min(hScale, wScale));
      }
    };
    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []) as File[];
    if (files.length === 0) return;

    const currentMaxDay = images.length > 0 ? Math.max(...images.map(img => img.day)) : 0;
    
    const newImages = files.map((file, index) => ({
      id: Math.random().toString(36).substr(2, 9),
      url: URL.createObjectURL(file),
      day: currentMaxDay + index + 1
    })).filter(img => img.day <= config.totalDays);

    setImages(prev => [...prev, ...newImages].slice(0, config.totalDays));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeImage = (id: string) => {
    setImages(prev => {
      const filtered = prev.filter(img => img.id !== id);
      return filtered.map((img, idx) => ({ ...img, day: idx + 1 }));
    });
  };

  const toggleSkippedDay = (day: number) => {
    setConfig(prev => ({
      ...prev,
      skippedDays: prev.skippedDays.includes(day)
        ? prev.skippedDays.filter(d => d !== day)
        : [...prev.skippedDays, day]
    }));
  };

  const clearAll = () => {
    if (confirm('確定要清除所有圖片與標記嗎？')) {
      images.forEach(img => URL.revokeObjectURL(img.url));
      setImages([]);
      setConfig(prev => ({ ...prev, skippedDays: [] }));
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const downloadImage = async () => {
    if (!boardRef.current) return;
    setIsExporting(true);
    try {
      const dataUrl = await htmlToImage.toPng(boardRef.current, {
        width: 2160,
        height: 2700,
        pixelRatio: 1,
        backgroundColor: '#ffffff',
        style: {
          transform: 'none',
        },
        filter: (node) => node.tagName !== 'SCRIPT',
      });
      
      const link = document.createElement('a');
      link.download = `${config.title.toLowerCase().replace(/\s+/g, '-')}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Export failed', err);
      alert('導出失敗，請確保圖片已完整加載。');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row h-screen overflow-hidden">
      <Sidebar 
        config={config}
        setConfig={setConfig}
        imagesCount={images.length}
        onClear={clearAll}
        onUpload={handleImageUpload}
        onExport={downloadImage}
        isExporting={isExporting}
        fileInputRef={fileInputRef}
      />

      <main className="flex-1 p-4 md:p-12 flex flex-col items-center h-full overflow-hidden">
        <div className="w-full h-full flex flex-col">
          <div className="mb-6 flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-800">全圖預覽</h2>
              <p className="text-slate-500 text-sm">整張畫布將完整導出為 2160x2700 (IG 4:5)</p>
            </div>
            <div className="text-xs font-bold text-slate-400 bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-sm">
              預覽縮放: {(previewScale * 100).toFixed(0)}%
            </div>
          </div>

          <div 
            id="preview-container" 
            className="flex-1 relative w-full flex justify-center items-center bg-slate-300/50 rounded-3xl border-4 border-dashed border-slate-300 overflow-hidden"
          >
            <div 
              style={{ 
                transform: `scale(${previewScale})`, 
                transformOrigin: 'center center',
                width: '2160px',
                height: '2700px',
                flexShrink: 0
              }}
              className="shadow-[0_40px_100px_rgba(0,0,0,0.2)] bg-white"
            >
               <ChallengeBoard 
                ref={boardRef}
                config={config}
                images={images}
                onRemoveImage={removeImage}
                onToggleSkip={toggleSkippedDay}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
