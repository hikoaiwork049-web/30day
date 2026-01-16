
import React, { forwardRef, useState } from 'react';
import { ChallengeImage, ChallengeConfig } from '../types';
import { Trash2, X, Move } from 'lucide-react';

interface BoardProps {
  config: ChallengeConfig;
  images: ChallengeImage[];
  onRemoveImage: (id: string) => void;
  onToggleSkip: (day: number) => void;
  onReorder: (sourceDay: number, targetDay: number) => void;
}

const ChallengeBoard = forwardRef<HTMLDivElement, BoardProps>(({ config, images, onRemoveImage, onToggleSkip, onReorder }, ref) => {
  const [draggedDay, setDraggedDay] = useState<number | null>(null);
  const [dragOverDay, setDragOverDay] = useState<number | null>(null);

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

  // Drag handlers
  const handleDragStart = (e: React.DragEvent, day: number) => {
    setDraggedDay(day);
    e.dataTransfer.setData('text/plain', day.toString());
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, day: number) => {
    e.preventDefault();
    setDragOverDay(day);
  };

  const handleDrop = (e: React.DragEvent, targetDay: number) => {
    e.preventDefault();
    const sourceDay = parseInt(e.dataTransfer.getData('text/plain'));
    onReorder(sourceDay, targetDay);
    setDraggedDay(null);
    setDragOverDay(null);
  };

  return (
    <div 
      ref={ref}
      id="challenge-board-canvas"
      className="bg-white p-16 grid overflow-hidden select-none"
      style={{ 
        width: '2160px', 
        height: '2700px',
        gridTemplateRows: 'auto 1fr auto',
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

      {/* Grid Area */}
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
            onDragOver={(e) => item.day && handleDragOver(e, item.day)}
            onDragLeave={() => setDragOverDay(null)}
            onDrop={(e) => item.day && handleDrop(e, item.day)}
            className={`relative rounded-sm overflow-hidden group/item border transition-all flex items-center justify-center ${
              item.type === 'offset' 
                ? 'bg-transparent border-none' 
                : dragOverDay === item.day && draggedDay !== item.day
                  ? 'border-indigo-500 border-dashed border-4 bg-indigo-50/30 scale-[1.02] z-10'
                  : 'border-slate-100'
            } ${item.isSkipped ? 'bg-slate-50' : 'bg-[#fcfcfc]'}`}
          >
            {item.type === 'challenge' && (
              <>
                {/* 日期數字 */}
                <div className="absolute top-4 left-4 z-10 pointer-events-none">
                   <span className="text-slate-400 text-2xl font-semibold opacity-80">{item.day}</span>
                </div>

                {item.isSkipped ? (
                  <div 
                    className="w-full h-full flex items-center justify-center bg-slate-50 cursor-pointer"
                    onClick={() => onToggleSkip(item.day!)}
                  >
                    <X className="w-1/3 h-1/3 text-slate-200" strokeWidth={1} />
                  </div>
                ) : item.image ? (
                  <div 
                    className={`w-full h-full relative cursor-grab active:cursor-grabbing ${draggedDay === item.day ? 'opacity-30' : ''}`}
                    draggable
                    onDragStart={(e) => handleDragStart(e, item.day!)}
                  >
                    <img 
                      src={item.image.url} 
                      alt={`Day ${item.day}`}
                      className="w-full h-full object-cover object-center pointer-events-none"
                    />
                    
                    {/* 懸浮工具列 */}
                    <div className="absolute inset-0 bg-black/10 opacity-0 group-hover/item:opacity-100 transition-opacity flex items-center justify-center gap-4" data-html2canvas-ignore="true">
                       <button 
                        onClick={(e) => { e.stopPropagation(); onRemoveImage(item.image!.id); }}
                        className="p-4 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                      >
                        <Trash2 className="w-8 h-8" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div 
                    className="w-full h-full flex items-center justify-center cursor-pointer hover:bg-slate-50 transition-colors"
                    onClick={() => onToggleSkip(item.day!)}
                  >
                     <span className="text-9xl font-bold opacity-[0.015]">{item.day}</span>
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
