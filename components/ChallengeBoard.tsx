
import React, { forwardRef } from 'react';
import { ChallengeImage, ChallengeConfig } from '../types';
import { Trash2, X } from 'lucide-react';

interface BoardProps {
  config: ChallengeConfig;
  images: ChallengeImage[];
  onRemoveImage: (id: string) => void;
  onToggleSkip: (day: number) => void;
}

const ChallengeBoard = forwardRef<HTMLDivElement, BoardProps>(({ config, images, onRemoveImage, onToggleSkip }, ref) => {
  const totalDays = config.totalDays;
  const offset = config.startOffset || 0;
  const cols = config.columns || 5;
  const skippedDays = config.skippedDays || [];
  
  const fontClass = {
    serif: 'font-serif-title',
    script: 'font-script',
    sans: 'font-sans font-black'
  }[config.titleFont];

  const gridItems = Array.from({ length: totalDays + offset }).map((_, idx) => {
    if (idx < offset) {
      return { type: 'offset' as const, day: null };
    }
    const day = idx - offset + 1;
    const isSkipped = skippedDays.includes(day);
    const image = isSkipped ? null : images.find(img => img.day === day);
    return { type: 'challenge' as const, day, image, isSkipped };
  });

  const rowCount = Math.ceil(gridItems.length / cols);

  return (
    <div 
      ref={ref}
      id="challenge-board-canvas"
      className="bg-white p-16 grid overflow-hidden"
      style={{ 
        width: '2160px', 
        height: '2700px', // 嚴格固定畫布高度，IG 4:5 比例
        gridTemplateRows: 'auto 1fr auto', // 頭、身、尾。身（Grid）會自動壓縮以確保下半部不被截走
        boxSizing: 'border-box',
        color: '#333'
      }}
    >
      {/* Header Area */}
      <div className={`pt-4 pb-12 flex justify-between items-end border-b-2 border-slate-100 mb-8 ${fontClass}`}>
        <div className="flex items-center gap-8">
          <span className="tracking-[0.4em] text-slate-400 font-light italic" style={{ fontSize: '5.5rem' }}>
            {config.year}
          </span>
          <div className="w-16 h-[2px] bg-slate-200" />
          <span className="tracking-[0.4em] text-slate-400 font-light italic" style={{ fontSize: '5.5rem' }}>
            {config.month.padStart(2, '0')}
          </span>
        </div>
        
        <h1 className="text-[100px] text-slate-700 leading-none font-normal tracking-wide">
          {config.title}
        </h1>
      </div>

      {/* Grid Area: 使用 1fr 配合 min-h-0 確保在畫布高度內縮放 */}
      <div 
        className="grid gap-6 px-2 min-h-0" 
        style={{ 
          gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${rowCount}, minmax(0, 1fr))`,
          alignContent: 'stretch'
        }}
      >
        {gridItems.map((item, index) => (
          <div 
            key={index}
            className={`relative rounded-sm overflow-hidden group/item border border-slate-100 flex items-center justify-center transition-all ${
              item.type === 'offset' 
                ? 'bg-transparent border-none' 
                : item.isSkipped 
                  ? 'bg-slate-50' 
                  : 'bg-[#fcfcfc]'
            }`}
          >
            {item.type === 'challenge' && (
              <>
                {/* 日期數字 */}
                <div className="absolute top-4 left-4 z-10 pointer-events-none">
                   <span className="text-slate-400 text-2xl font-semibold opacity-80">{item.day}</span>
                </div>

                {/* 互動按鈕 */}
                <button 
                  onClick={() => onToggleSkip(item.day!)}
                  className="absolute inset-0 z-20 opacity-0 cursor-pointer"
                  data-html2canvas-ignore="true"
                />

                {item.isSkipped ? (
                  <div className="w-full h-full flex items-center justify-center bg-slate-50">
                    <X className="w-1/3 h-1/3 text-slate-200" strokeWidth={1} />
                  </div>
                ) : item.image ? (
                  <>
                    <img 
                      src={item.image.url} 
                      alt={`Day ${item.day}`}
                      className="w-full h-full object-cover object-center" // 改回 object-cover，實現中心裁切填滿
                    />
                    <button 
                      onClick={(e) => { e.stopPropagation(); onRemoveImage(item.image!.id); }}
                      className="absolute top-4 right-4 p-4 bg-red-500/80 text-white rounded-lg opacity-0 group-hover/item:opacity-100 transition-opacity z-30"
                      data-html2canvas-ignore="true"
                    >
                      <Trash2 className="w-8 h-8" />
                    </button>
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center opacity-[0.015] select-none pointer-events-none">
                     <span className="text-9xl font-bold">{item.day}</span>
                  </div>
                )}
              </>
            )}
          </div>
        ))}
      </div>

      {/* Footer Area */}
      <div className="mt-12 pb-8 px-4 flex justify-between items-center text-xl text-slate-200 font-medium uppercase tracking-[0.5em]">
        <span>Visual Daily Growth</span>
        <div className="flex-1 mx-12 h-[1px] bg-slate-100" />
        <span>Achieve Your Best</span>
      </div>
    </div>
  );
});

export default ChallengeBoard;
