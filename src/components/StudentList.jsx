import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { fetchAllSeniors } from '../api/juniorApi';
import Loader from './Loader';

const StudentList = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const loadStudents = async () => {
      try {
        const seniors = await fetchAllSeniors();

        // --- Hardcode Student No. 3 ---
        const hardcodedStudent = {
          senior_id: '3',
          senior_student_id: '37213',
          senior_nickname: 'พรพิพัฒน์', 
          senior_full_name: 'นาย พรพิพัฒน์ ตั้งวิโรจน์กุล',
          username: '37213',
          avatar_url: null,
          senior_photo_url: '/assets/student_3.jpg' // Hardcoded Image Path
        };
        
        if (!seniors.some(s => String(s.senior_id) === '3')) {
          seniors.push(hardcodedStudent);
        }
        // ------------------------------

        // Sort by student ID (เลขที่)
        seniors.sort((a, b) => {
          const numA = parseInt(a.senior_id) || 0;
          const numB = parseInt(b.senior_id) || 0;
          return numA - numB;
        });

        setStudents(seniors);
      } catch (error) {
        console.error("Error fetching students:", error);
      }
      setLoading(false);
    };

    loadStudents();
  }, []);

  // Filter students based on Search Query
  const filteredStudents = students.filter(student => {
    const q = searchQuery.toLowerCase();
    const idMatch = String(student.senior_id || '').toLowerCase().includes(q);
    const nicknameMatch = String(student.senior_nickname || '').toLowerCase().includes(q);
    const fullnameMatch = String(student.senior_full_name || '').toLowerCase().includes(q);
    return idMatch || nicknameMatch || fullnameMatch;
  });

  if (loading) return <Loader text="LOADING ROSTER" />;

  return (
    <div className="min-h-screen  text-white pt-24 pb-12 px-2 md:px-6 font-['Orbitron'] selection:bg-[#7ecfff] selection:text-[#060412]">
      <div className="w-full mx-auto">
          <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#7ecfff] to-[#d966ff] mb-4 drop-shadow-[0_0_15px_rgba(126,207,255,0.5)]">
            M.6/8 ROSTER
          </h1>
          <p className="text-[#99eedd] text-lg font-['Chakra_Petch']">ทำเนียบรุ่นนักเรียนชั้นมัธยมศึกษาปีที่ 6/8</p>
        </motion.div>

        {/* Search Bar */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex justify-center mb-8 px-4"
        >
          <div className="relative w-full max-w-xl">
            <input 
              type="text" 
              placeholder="ค้นหาชื่อเล่น, ชื่อจริง หรือ เลขที่..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#08050f]/80 backdrop-blur-md border border-[#7ecfff]/50 rounded-full py-3 px-6 text-white font-['Chakra_Petch'] placeholder-[#7ecfff]/40 focus:outline-none focus:border-[#d966ff] focus:shadow-[0_0_15px_rgba(217,102,255,0.4)] transition-all"
            />
            {/* Search Icon / Clear Button */}
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#7ecfff] hover:text-[#d966ff] transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            )}
          </div>
        </motion.div>

        {filteredStudents.length === 0 && !loading ? (
          <div className="text-center text-gray-400 font-['Chakra_Petch'] py-20">
            ไม่พบรายชื่อนักเรียนที่ค้นหา
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
            {filteredStudents.map((student, idx) => (
            <motion.div
              key={student.senior_id || idx}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.02 }}
              whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(126, 207, 255, 0.4)" }}
              className="relative aspect-[3/4] rounded-xl overflow-hidden group cursor-pointer border border-[#7ecfff]/30 shadow-lg"
            >
              {/* Background Image or Placeholder */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#060412] to-[#1a1a2e] flex items-center justify-center transition-transform duration-500 group-hover:scale-110">
                 {student.senior_photo_url ? (
                   <img 
                     src={student.senior_photo_url} 
                     alt={student.senior_nickname} 
                     className="w-full h-full object-cover"
                   />
                 ) : (
                   <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-[#7ecfff]/50 mb-10">
                      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                   </svg>
                 )}
              </div>

              {/* Dark Gradient Overlay (Bottom-up for text readability) */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#060412] via-[#060412]/60 to-transparent opacity-90 group-hover:opacity-100 transition-opacity duration-300" />
              
              {/* Neon Glow Effect on Hover */}
              <div className="absolute inset-0 bg-gradient-to-b from-[#7ecfff]/0 to-[#d966ff]/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              
              {/* Number Badge */}
              <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md border border-[#99eedd]/50 text-[#99eedd] text-xs font-bold px-2 py-1 rounded shadow-[0_0_10px_rgba(153,238,221,0.3)] z-10">
                No. {student.senior_id}
              </div>

              {/* Student Info (Positioned at bottom) */}
              <div className="absolute bottom-0 left-0 w-full p-4 md:p-5 flex flex-col justify-end z-10 font-['Chakra_Petch']">
                <h3 className="text-xl md:text-2xl font-bold text-white mb-1 truncate drop-shadow-md">
                  {student.senior_nickname || student.username || 'Unknown'}
                </h3>
                <p className="text-xs md:text-sm text-gray-300 truncate drop-shadow-md">
                  {student.senior_full_name || 'No Name Provided'}
                </p>
                
                {/* Future Feature Placeholder */}
                <div className="mt-3 text-[10px] md:text-xs bg-[#4f2ec3]/40 border border-[#4f2ec3]/50 text-[#e0b3ff] rounded px-2 py-1 backdrop-blur-sm self-start uppercase tracking-wider">
                  [ Univ. Status: TBD ]
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        )}
      </div>
    </div>
  );
};

export default StudentList;
