import React from 'react';

interface Props {
  onStartAction: (action: string, fn: () => void, delay1: number, delay2: number) => void;
  onStopAction: (action: string) => void;
  onMove: (dx: number) => void;
  onDrop: () => void;
  onHardDrop: () => void;
  onRotate: () => void;
  className?: string;
}

export default function ControlsOverlay({ onStartAction, onStopAction, onMove, onDrop, onHardDrop, onRotate, className = '' }: Props) {
  const DBtn = ({ action, actionFn, initialDelay, repeatDelay, children, extraClass = '' }: any) => (
    <button
      className={`w-[76px] h-[76px] md:w-[84px] md:h-[84px] bg-[#4a4a4a] border-[6px] border-[#222222] flex items-center justify-center text-[#888] shadow-[6px_6px_0px_#1a1a1a] active:translate-x-[3px] active:translate-y-[3px] active:shadow-[3px_3px_0px_#1a1a1a] touch-none select-none ${extraClass}`}
      onPointerDown={(e) => {
        e.preventDefault();
        e.currentTarget.setPointerCapture(e.pointerId);
        onStartAction(action, actionFn, initialDelay, repeatDelay);
      }}
      onPointerUp={(e) => {
        e.preventDefault();
        e.currentTarget.releasePointerCapture(e.pointerId);
        onStopAction(action);
      }}
      onPointerCancel={(e) => {
        e.preventDefault();
        onStopAction(action);
      }}
      onPointerOut={(e) => {
        e.preventDefault();
        onStopAction(action);
      }}
      onContextMenu={(e) => e.preventDefault()}
    >
      {children}
    </button>
  );

  return (
    <div className={`flex w-full justify-between items-end px-4 md:px-0 gap-6 ${className}`}>
      
      {/* D-Pad cluster */}
      <div className="grid grid-cols-3 gap-3 select-none w-max">
        <div className="w-[76px] h-[76px] md:w-[84px] md:h-[84px]"></div>
        <DBtn action="rotate" actionFn={onRotate} initialDelay={300} repeatDelay={300}>
          <span className="mt-[-4px] text-4xl">▲</span>
        </DBtn>
        <div className="w-[76px] h-[76px] md:w-[84px] md:h-[84px]"></div>

        <DBtn action="left" actionFn={() => onMove(-1)} initialDelay={267} repeatDelay={100}>
          <span className="text-4xl">◄</span>
        </DBtn>
        <DBtn action="down" actionFn={onDrop} initialDelay={50} repeatDelay={33}>
          <span className="text-4xl">▼</span>
        </DBtn>
        <DBtn action="right" actionFn={() => onMove(1)} initialDelay={267} repeatDelay={100}>
          <span className="text-4xl">►</span>
        </DBtn>
      </div>

      {/* Action Button (A / Rotate) */}
      <div className="flex flex-col items-center select-none pb-4 md:pb-8">
        <button 
          className="w-[120px] h-[120px] md:w-[140px] md:h-[140px] bg-[#c00] border-[8px] border-[#800] rounded-full flex items-center justify-center text-white shadow-[8px_8px_0px_rgba(0,0,0,0.5)] active:translate-x-[3px] active:translate-y-[3px] active:shadow-[5px_5px_0px_rgba(0,0,0,0.5)] text-xl md:text-2xl touch-none select-none tracking-wider font-bold mb-8"
          onPointerDown={(e) => {
            e.preventDefault();
            e.currentTarget.setPointerCapture(e.pointerId);
            onStartAction('harddrop', onHardDrop, 500, 500);
          }}
          onPointerUp={(e) => {
            e.preventDefault();
            e.currentTarget.releasePointerCapture(e.pointerId);
            onStopAction('harddrop');
          }}
          onPointerCancel={(e) => {
            e.preventDefault();
            onStopAction('harddrop');
          }}
          onPointerOut={(e) => {
            e.preventDefault();
            onStopAction('harddrop');
          }}
          onContextMenu={(e) => e.preventDefault()}
        >
          DROP
        </button>
      </div>
    </div>
  );
}
