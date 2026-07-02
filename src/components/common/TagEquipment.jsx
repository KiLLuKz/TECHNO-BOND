import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Tags, Save, CheckCircle2 } from 'lucide-react';
import { supabase } from '../../supabaseClient';
import { TAGS_CONFIG } from '../../config/tagsConfig';

const TagEquipment = ({ profile, onProfileUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  
  // Local state for currently selected tags before saving
  const [selectedTags, setSelectedTags] = useState(profile?.equipped_tags || []);
  const unlockedTags = profile?.unlocked_tags || [];

  const toggleTag = (tagId) => {
    setSelectedTags(prev => {
      if (prev.includes(tagId)) {
        return prev.filter(t => t !== tagId);
      } else {
        return [...prev, tagId];
      }
    });
    setSaved(false);
  };

  const saveTags = async () => {
    if (!profile?.id) return;
    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ equipped_tags: selectedTags })
        .eq('id', profile.id);

      if (error) throw error;
      
      setSaved(true);
      if (onProfileUpdate) {
        onProfileUpdate({ ...profile, equipped_tags: selectedTags });
      }
      
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Error saving tags:', error);
      alert('เกิดข้อผิดพลาดในการบันทึกป้าย: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#08050f]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 mt-6 shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 p-32 bg-[#99eedd]/5 blur-[100px] rounded-full pointer-events-none" />
      
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div className="flex items-start md:items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#99eedd]/20 to-transparent flex items-center justify-center border border-[#99eedd]/20 shrink-0 mt-1 md:mt-0">
            <Tags size={20} className="text-[#99eedd]" />
          </div>
          <div>
            <h3 className="text-xl font-['Orbitron'] font-bold text-white tracking-wide flex flex-col md:flex-row md:items-center gap-2">
              TAG EQUIPMENT ( IN-DEV )
              {(profile?.role?.toUpperCase() === 'ADMIN' || profile?.student_id === '99999' || profile?.student_id === '99998') && (
                <button 
                  onClick={async () => {
                    setLoading(true);
                    const mockTags = Object.keys(TAGS_CONFIG);
                    await supabase.from('profiles').update({ unlocked_tags: mockTags }).eq('id', profile.id);
                    if (onProfileUpdate) onProfileUpdate({ ...profile, unlocked_tags: mockTags });
                    setLoading(false);
                  }}
                  className="w-fit text-xs md:text-sm bg-red-500/20 text-red-400 border border-red-500/50 px-3 py-1 rounded cursor-pointer hover:bg-red-500/40 font-bold font-mono tracking-widest mt-2 md:mt-0 shadow-[0_0_10px_rgba(239,68,68,0.2)]"
                >
                  DEV: UNLOCK ALL TAGS
                </button>
              )}
            </h3>
            <p className="text-sm text-gray-400 font-mono mt-1">ระบบจัดการและสวมใส่ป้าย (Titles)</p>
          </div>
        </div>
        
        <button
          onClick={saveTags}
          disabled={loading || selectedTags.join() === (profile?.equipped_tags || []).join()}
          className="w-full md:w-auto flex justify-center items-center gap-2 px-6 py-2.5 bg-[#99eedd]/10 hover:bg-[#99eedd]/20 text-[#99eedd] border border-[#99eedd]/30 rounded-lg transition-colors font-bold text-sm tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-[#99eedd] border-t-transparent rounded-full animate-spin" />
          ) : saved ? (
            <CheckCircle2 size={16} className="text-green-400" />
          ) : (
            <Save size={16} />
          )}
          {saved ? 'SAVED' : 'SAVE CHANGES'}
        </button>
      </div>

      <div className="space-y-4 relative z-10">
        <div className="bg-[#0d091a] rounded-xl p-4 border border-white/5">
          <p className="text-xs text-gray-500 font-mono mb-3 uppercase tracking-widest">
            Equipped ({selectedTags.length})
          </p>
          <div className="flex flex-wrap gap-2 min-h-[40px] items-center">
            {selectedTags.length === 0 && (
              <span className="text-sm text-gray-600 font-mono italic">No tags equipped.</span>
            )}
            {selectedTags.map(tagId => {
              const config = TAGS_CONFIG[tagId] || { label: tagId, colorClass: 'bg-gray-500/20 text-gray-400 border-gray-500/50' };
              return (
                <div key={`equipped-${tagId}`} className={`px-3 py-1.5 rounded border text-xs font-mono tracking-widest flex items-center gap-2 ${config.colorClass}`}>
                  {config.label}
                  <button 
                    onClick={() => toggleTag(tagId)}
                    className="hover:text-white transition-colors"
                  >
                    &times;
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-[#0d091a] rounded-xl p-4 border border-white/5">
          <p className="text-xs text-gray-500 font-mono mb-3 uppercase tracking-widest">
            Unlocked Tags ({unlockedTags.length})
          </p>
          {unlockedTags.length === 0 ? (
            <div className="text-center py-6 border border-dashed border-white/10 rounded-lg">
              <p className="text-gray-500 text-sm">คุณยังไม่มีป้ายปลดล็อก (เคลียร์เงื่อนไขเพื่อรับป้ายใหม่)</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {unlockedTags.map(tagId => {
                const config = TAGS_CONFIG[tagId] || { label: tagId, colorClass: 'bg-gray-500/20 text-gray-400 border-gray-500/50', description: 'ป้ายปริศนา' };
                const isEquipped = selectedTags.includes(tagId);
                
                return (
                  <div 
                    key={`unlocked-${tagId}`}
                    onClick={() => toggleTag(tagId)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col gap-2 ${
                      isEquipped 
                        ? 'bg-[#99eedd]/10 border-[#99eedd]/50 shadow-[0_0_15px_rgba(153,238,221,0.1)]' 
                        : 'bg-white/5 border-white/10 hover:border-white/30 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono tracking-widest border ${config.colorClass}`}>
                        {config.label}
                      </span>
                      {isEquipped && <CheckCircle2 size={16} className="text-[#99eedd]" />}
                    </div>
                    <p className="text-xs text-gray-400 line-clamp-2">
                      {config.description}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TagEquipment;
