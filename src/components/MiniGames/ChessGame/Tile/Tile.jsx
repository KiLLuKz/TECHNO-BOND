import React from 'react';

export default function Tile({ number, image, highlight }) {
  // สลับสีตารางหมากรุก (เขียว-ครีม สไตล์คลาสสิก)
  const isDark = number % 2 === 0;

  return (
    <div className={`relative w-[100px] h-[100px] flex items-center justify-center ${isDark ? 'bg-[#779556]' : 'bg-[#ebecd0]'}`}>
      
      {/* จุดวงกลมไฮไลท์ตาเดิน */}
      {highlight && (
        <div className="absolute w-[30px] h-[30px] bg-black/30 rounded-full pointer-events-none z-0"></div>
      )}

      {/* รูปตัวหมาก */}
      {image && (
        <div 
          className="w-[80px] h-[80px] bg-no-repeat bg-center bg-contain hover:cursor-grab active:cursor-grabbing chess-piece z-10"
          style={{ backgroundImage: `url(${image})` }}
        ></div>
      )}
    </div>
  );
}