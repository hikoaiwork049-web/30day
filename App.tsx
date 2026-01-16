
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

  // 動態計算預覽比例
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

    setImages(prev => {
      const currentImages = [...prev];
      
      files.forEach(file => {
        // 從檔名提取數字 (例如 "01.jpg" -> 1)
        const nameMatch = file.name.match(/(\d+)/);
        let targetDay = nameMatch ? parseInt(nameMatch[0], 10) : null;

        // 檢查該日期是否有效且未被佔用
        const isOccupied = (day: number) => currentImages.some(img => img.day === day);
        
        if (targetDay && targetDay >= 1 && targetDay <= config.totalDays && !isOccupied(targetDay)) {
          // 檔名匹配成功且位置有空
          currentImages.push({
            id: Math.random().toString(36).substr(2, 9),
            url: URL.createObjectURL(file),
            day: targetDay
          });
        } else {
          // 檔名無數字或位置已滿，尋找第一個空位
          for (let d = 1; d <= config.totalDays; d++) {
            if (!isOccupied(d)) {
              currentImages.push({
                id: Math.random().toString(36).substr(2, 9),
                url: URL.createObjectURL(file),
                day: d
              });
              break;
            }
          }
        }
      });
      
      return currentImages;
    });

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleReorder = (draggedDay: number, targetDay: number) => {
    if (draggedDay === targetDay) return;

    setImages(prev => {
      const newImages = [...prev];
      const sourceIdx = newImages.findIndex(img => img.day === draggedDay);
      const targetIdx = newImages.findIndex(img => img.day === targetDay);

      if (sourceIdx !== -1 && targetIdx !== -1) {
        // 交換位置
        const tempDay = newImages[sourceIdx].day;
        newImages[sourceIdx].day = newImages[targetIdx].day;
        newImages[targetIdx].day = tempDay;
      } else if (sourceIdx !== -1) {
        // 移動到空日期槽位
        newImages[sourceIdx].day = targetDay;
      }
      return [...newImages];
    });
  };

  const removeImage = (id: string) => {
    setImages(prev => {
      const imgToRemove = prev.find(img => img.id === id);
      if (imgToRemove) URL.revokeObjectURL(imgToRemove.url);
      return prev.filter(img => img.id !== id);
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
    images.forEach(img => URL.revokeObjectURL(img.url));
    setImages([]);
    setConfig(prev => ({ ...prev, skippedDays: [] }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
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
      });
      
      const link = document.createElement('a');
      link.download = `${config.title || 'challenge'}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Export failed', err);
      alert('圖片生成失敗，請重試。');
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
              <h2 className="text-2xl font-bold text-slate-800">挑戰畫布</h2>
              <p className="text-slate-500 text-sm">支援檔名 (01-31) 自動對齊日期，拖拽可交換順序</p>
            </div>
            <div className="text-xs font-bold text-slate-400 bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-sm">
              預覽比例: {(previewScale * 100).toFixed(0)}%
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
              className="shadow-2xl bg-white"
            >
               <ChallengeBoard 
                ref={boardRef}
                config={config}
                images={images}
                onRemoveImage={removeImage}
                onToggleSkip={toggleSkippedDay}
                onReorder={handleReorder}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
