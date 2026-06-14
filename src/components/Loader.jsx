import React from 'react';

const Loader = ({ text = "CONNECTING", variant = "default" }) => {
  // ถ้า variant เป็น 'admin' ให้ใช้สีแดง (text-red-500)
  const colorClass = variant === 'admin' ? 'text-red-500' : 'text-white';
  
  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-[#08050f]/80 backdrop-blur-md transition-opacity duration-500 ${colorClass}`}>
      <div className="loader-wrapper font-['Orbitron'] font-bold tracking-[0.15em] text-sm md:text-base">
        {text.split('').map((char, index) => (
          <span key={index} className="loader-letter">{char}</span>
        ))}
        <div className={`loader-circle ${variant === 'admin' ? 'border-red-500' : 'border-white'}`}></div>
      </div>
    </div>
  );
};

export default Loader;