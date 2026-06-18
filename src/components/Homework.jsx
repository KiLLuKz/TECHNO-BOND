import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient'; 
import { useNavigate } from 'react-router-dom';
import { BookOpen, Calendar, FileText, Image as ImageIcon, Trash2, Send, Loader2, ShieldAlert } from 'lucide-react';

export default function HomeworkHub({ userRole, isAdmin }) {
  const navigate = useNavigate();
  const [homeworks, setHomeworks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({ subject: '', due_date: '', description: '', note: '' });
  const [file, setFile] = useState(null);

  // 🛡️ เช็คสิทธิ์การเข้าถึงระบบ (Senior หรือ Admin เท่านั้น)
  const isAllowed = userRole === 'senior' || isAdmin;

  useEffect(() => {
    if (isAllowed) {
      fetchHomework();
    }
  }, [isAllowed]);

  const fetchHomework = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('homework')
      .select('*')
      .order('id', { ascending: false });

    if (!error && data) setHomeworks(data);
    setIsLoading(false);
  };

  if (!isAllowed) {
    return (
      <div className="min-h-screen bg-[#060412] text-white flex flex-col items-center justify-center p-6 font-['Orbitron']">
        <div className="bg-white/5 border border-red-500/20 backdrop-blur-xl p-10 rounded-[35px] text-center shadow-2xl max-w-md w-full flex flex-col items-center">
          <ShieldAlert size={64} className="text-red-500 mb-4 animate-bounce" />
          <h2 className="text-2xl font-bold text-red-500 tracking-widest mb-3">ACCESS DENIED</h2>
          <p className="text-gray-400 font-['Inter'] text-sm leading-relaxed mb-8">
            ขออภัย ระบบจัดการการบ้านนี้จำกัดสิทธิ์ให้เข้าใช้งานได้เฉพาะนักเรียนระดับ Senior หรือสิทธิ์ Admin เท่านั้นครับ
          </p>
          <button onClick={() => navigate('/')} className="w-full bg-white/10 hover:bg-white/20 border border-white/10 py-3 rounded-xl font-bold tracking-wider transition-all text-sm">
            BACK TO HOME
          </button>
        </div>
      </div>
    );
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    let imageUrl = null;

    if (file) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `images/${fileName}`;

      const { error: uploadError } = await supabase.storage.from('homeworks').upload(filePath, file);
      if (uploadError) {
        alert('เกิดข้อผิดพลาดในการอัปโหลดรูปภาพ');
        setIsSubmitting(false);
        return;
      }
      const { data: { publicUrl } } = supabase.storage.from('homeworks').getPublicUrl(filePath);
      imageUrl = publicUrl;
    }

    const { error: insertError } = await supabase.from('homework').insert([{ ...formData, image_url: imageUrl }]);
    if (insertError) {
      alert('บันทึกข้อมูลไม่สำเร็จ: ' + insertError.message);
    } else {
      setFormData({ subject: '', due_date: '', description: '', note: '' });
      setFile(null);
      fetchHomework();
    }
    setIsSubmitting(false);
  };

  const handleDelete = async (id, imageUrl) => {
    if (!window.confirm('คุณแน่ใจหรือไม่ที่จะลบการบ้านนี้?')) return;
    if (imageUrl) {
      const filePath = imageUrl.split('/homeworks/')[1];
      if (filePath) await supabase.storage.from('homeworks').remove([filePath]);
    }
    const { error } = await supabase.from('homework').delete().eq('id', id);
    if (!error) fetchHomework();
  };

  return (
    <div className="min-h-screen bg-[#060412] text-white font-['Inter',sans-serif] p-6 md:p-12 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-[#a855f7]/10 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="max-w-4xl mx-auto relative z-10">
        
        <header className="mb-10 text-center md:text-left">
          <h1 className="text-4xl md:text-5xl font-['Orbitron'] font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#c084fc] to-[#a855f7] mb-2 drop-shadow-[0_0_15px_rgba(168,85,247,0.4)]">
            HOMEWORK HUB
          </h1>
          <p className="text-gray-400 tracking-widest uppercase text-sm">ม.5/8 Task Management System</p>
        </header>

        <section className="bg-white/5 backdrop-blur-xl border border-[#a855f7]/30 rounded-3xl p-6 md:p-8 mb-10 shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-[#c084fc]">
            <BookOpen size={20} /> เพิ่มงานใหม่
          </h2>
          
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1">
              <label className="text-sm text-gray-300 font-semibold tracking-wide">ชื่อวิชา</label>
              <div className="relative">
                <BookOpen size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                <input required type="text" name="subject" value={formData.subject} onChange={handleInputChange} placeholder="ex. Computer Science"
                  className="w-full bg-[#0b0114]/80 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-[#a855f7] transition-all" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm text-gray-300 font-semibold tracking-wide">กำหนดส่ง</label>
              <div className="relative">
                <Calendar size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                <input required type="text" name="due_date" value={formData.due_date} onChange={handleInputChange} placeholder="ex. 09/03/2026"
                  className="w-full bg-[#0b0114]/80 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-[#a855f7] transition-all" />
              </div>
            </div>

            <div className="md:col-span-2 space-y-1">
              <label className="text-sm text-gray-300 font-semibold tracking-wide">รายละเอียดงาน</label>
              <textarea required rows="2" name="description" value={formData.description} onChange={handleInputChange} placeholder="รายละเอียด..."
                className="w-full bg-[#0b0114]/80 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-gray-600 focus:outline-none focus:border-[#a855f7] transition-all"></textarea>
            </div>

            <div className="space-y-1">
              <label className="text-sm text-gray-300 font-semibold tracking-wide">หมายเหตุ</label>
              <div className="relative">
                <FileText size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                <input type="text" name="note" value={formData.note} onChange={handleInputChange} placeholder="ส่งใน GitHub"
                  className="w-full bg-[#0b0114]/80 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-[#a855f7] transition-all" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm text-gray-300 font-semibold tracking-wide">แนบรูปภาพ (ถ้ามี)</label>
              <div className="relative flex items-center bg-[#0b0114]/80 border border-white/10 rounded-xl py-2 px-3 hover:border-[#a855f7]/50 transition-all cursor-pointer">
                <ImageIcon size={18} className="text-[#a855f7] mr-3" />
                <input type="file" accept="image/*" onChange={handleFileChange} className="w-full text-sm text-gray-400 file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-[#a855f7]/20 file:text-[#c084fc] hover:file:bg-[#a855f7]/30" />
              </div>
            </div>

            <div className="md:col-span-2 mt-4">
              <button disabled={isSubmitting} type="submit" 
                className="w-full flex items-center justify-center gap-2 bg-[#a855f7] hover:bg-[#9333ea] disabled:bg-[#a855f7]/50 text-white font-['Orbitron'] font-bold tracking-widest py-4 rounded-xl transition duration-300 shadow-[0_0_20px_rgba(168,85,247,0.4)] active:scale-95">
                {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                {isSubmitting ? 'UPLOADING...' : 'DEPLOY TASK'}
              </button>
            </div>
          </form>
        </section>

        {/* List Section */}
        <section>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold font-['Orbitron'] tracking-widest text-white">CURRENT TASKS</h2>
            <button onClick={fetchHomework} className="bg-white/5 border border-white/10 hover:bg-white/10 px-4 py-2 rounded-lg text-sm transition font-['Orbitron'] tracking-wider">
              REFRESH
            </button>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-20 opacity-50">
              <Loader2 className="animate-spin text-[#a855f7]" size={40} />
            </div>
          ) : homeworks.length === 0 ? (
            <div className="bg-white/5 border border-white/10 p-10 rounded-2xl text-center text-gray-500 font-['Orbitron'] tracking-widest">
              NO PENDING TASKS
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5">
              {homeworks.map(hw => (
                <div key={hw.id} className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 group hover:border-[#a855f7]/50 transition-all duration-300 hover:shadow-[0_0_30px_rgba(168,85,247,0.15)]">
                  <div className="flex-1 w-full">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="bg-[#a855f7]/20 border border-[#a855f7]/50 text-[#c084fc] text-xs uppercase tracking-wider font-bold px-3 py-1 rounded-md font-['Orbitron']">
                        {hw.subject}
                      </span>
                      <span className="text-gray-400 text-xs font-mono">DUE: {hw.due_date}</span>
                    </div>
                    <h3 className="text-lg font-semibold mb-2 text-gray-100">{hw.description}</h3>
                    {hw.note && <p className="text-sm text-gray-400 flex items-center gap-2"><FileText size={14} className="text-[#a855f7]"/> {hw.note}</p>}
                  </div>

                  {hw.image_url && (
                    <div className="w-full md:w-32 h-24 rounded-lg overflow-hidden border border-white/10 flex-shrink-0">
                      <a href={hw.image_url} target="_blank" rel="noreferrer">
                        <img src={hw.image_url} alt="homework attach" className="w-full h-full object-cover hover:scale-110 transition-transform duration-300" />
                      </a>
                    </div>
                  )}

                  <button onClick={() => handleDelete(hw.id, hw.image_url)} className="md:opacity-0 md:group-hover:opacity-100 p-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl hover:bg-red-500/20 transition-all duration-300">
                    <Trash2 size={20} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}