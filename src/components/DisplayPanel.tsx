import React from 'react';

interface Props {
  score: number;
  lines: number;
  level: number;
  highScore: number;
}

export default function DisplayPanel({ score, lines, level, highScore }: Props) {
  const Box = ({ title, value, extraColor = '' }: { title: string, value: string | number, extraColor?: string }) => (
    <div className={`border-[6px] border-[#FFFFFF] bg-[#000000] p-6 flex flex-col items-center mb-10 w-full shadow-[8px_8px_0px_rgba(0,0,0,0.5)] ${extraColor}`}>
      <span className="text-white text-lg lg:text-xl opacity-60 mb-2">{title}</span>
      <span className="text-white text-5xl lg:text-6xl font-bold">{value}</span>
    </div>
  );

  return (
    <div className="flex flex-col w-full px-4 pt-10">
      <Box title="High Score" value={highScore.toString().padStart(6, '0')} extraColor="!border-[#FFD700] !shadow-[6px_6px_0px_rgba(255,215,0,0.3)]" />
      <Box title="Score" value={score.toString().padStart(6, '0')} />
      <Box title="Lines" value={lines.toString().padStart(3, '0')} />
      <Box title="Level" value={level.toString().padStart(2, '0')} />
    </div>
  );
}
