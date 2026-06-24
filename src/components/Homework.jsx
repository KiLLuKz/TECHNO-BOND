import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient'; 
import { useNavigate } from 'react-router-dom';
import { BookOpen, Calendar, FileText, Image as ImageIcon, Trash2, Send, Loader2, ShieldAlert, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import SystemAlert from './SystemAlert';

export default function HomeworkHub({ userRole, isAdmin, readOnly = false }) {
  const navigate = useNavigate();
  const [homeworks, setHomeworks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({ subject: '', due_date: '', description: '', note: '' });
  const [file, setFile] = useState(null);

  // Expanded Image State
  const [expandedImage, setExpandedImage] = useState(null);

  // Alert State
  const [alert, setAlert] = useState({ isOpen: false, title: '', message: '', type: 'info', onConfirm: null, confirmText: '' });

  // เช็คสิทธิ์การเข้าถึงระบบ (Senior หรือ Admin เท่านั้น)
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

    // แปลงวันที่จาก YYYY-MM-DD ให้เป็น DD/MM/YYYY เพื่อให้ตรงกับ format ที่ Webhook ใช้งาน
    let finalDueDate = formData.due_date;
    if (finalDueDate.includes('-')) {
      const [year, month, day] = finalDueDate.split('-');
      finalDueDate = `${day}/${month}/${year}`;
    }

    const { error: insertError } = await supabase.from('homework').insert([{ ...formData, due_date: finalDueDate, image_url: imageUrl }]);
    if (insertError) {
      alert('บันทึกข้อมูลไม่สำเร็จ: ' + insertError.message);
    } else {
      setFormData({ subject: '', due_date: '', description: '', note: '' });
      setFile(null);
      fetchHomework();
    }
    setIsSubmitting(false);
  };

  const handleDeleteClick = (id, imageUrl) => {
    setAlert({
      isOpen: true,
      title: 'CONFIRM DELETION',
      message: 'คุณแน่ใจหรือไม่ที่จะลบภารกิจนี้? ข้อมูลจะไม่สามารถกู้คืนได้',
      type: 'error',
      confirmText: 'DELETE',
      onConfirm: () => executeDelete(id, imageUrl)
    });
  };

  const executeDelete = async (id, imageUrl) => {
    setAlert({ ...alert, isOpen: false });
    if (imageUrl) {
      const filePath = imageUrl.split('/homeworks/')[1];
      if (filePath) await supabase.storage.from('homeworks').remove([filePath]);
    }
    const { error } = await supabase.from('homework').delete().eq('id', id);
    if (!error) fetchHomework();
  };

  return (
    <div className={`text-white font-['Inter',sans-serif] relative overflow-hidden ${!readOnly ? 'min-h-screen p-6 md:p-12' : ''}`}>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] blur-[120px] rounded-full pointer-events-none"></div>
      <div className="max-w-4xl mx-auto relative z-10">
        
        {!readOnly && (
          <header className="mb-10 text-center md:text-left">
            <h1 className="text-4xl md:text-5xl font-['Orbitron'] font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#ff7ec8] to-[#d966ff] mb-2 drop-shadow-[0_0_15px_rgba(217,102,255,0.4)]">
              ADMIN CONTROL PANEL
            </h1>
            <p className="text-[#99eedd] tracking-widest uppercase text-sm">Homework Database Management</p>
          </header>
        )}

        {/* Form Section - Hidden if readOnly */}
        {!readOnly && (
          <section className="bg-[#08050f]/80 backdrop-blur-xl border border-[#d966ff]/30 rounded-3xl p-6 md:p-8 mb-10 shadow-[0_10px_40px_rgba(217,102,255,0.15)] relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-[#d966ff]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <h2 className="text-xl font-bold mb-6 flex items-center gap-3 text-[#ff7ec8] font-['Orbitron'] tracking-widest relative z-10">
              <BookOpen size={24} className="text-[#d966ff] drop-shadow-[0_0_10px_rgba(217,102,255,0.8)]" /> INITIATE NEW TASK
            </h2>
            
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5 relative z-10">
              <div className="space-y-1">
                <label className="text-sm text-[#99eedd] font-['Orbitron'] tracking-widest">SUBJECT</label>
                <div className="relative group">
                  <BookOpen size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#d966ff]/50 group-hover:text-[#d966ff] transition-colors" />
                  <input required type="text" name="subject" value={formData.subject} onChange={handleInputChange} placeholder="ex. Computer Science"
                    className="w-full bg-[#0b0114]/80 border border-[#d966ff]/20 rounded-xl py-3 pl-10 pr-4 text-[#f0eaff] placeholder-gray-600 focus:outline-none focus:border-[#d966ff] focus:ring-1 focus:ring-[#d966ff]/50 transition-all shadow-inner" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm text-[#99eedd] font-['Orbitron'] tracking-widest">DUE DATE (Ex.01/07/2026)</label>
                <div className="relative group">
                  <Calendar size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#d966ff]/50 group-hover:text-[#d966ff] transition-colors" />
                  <input required type="date" name="due_date" value={formData.due_date} onChange={handleInputChange} 
                    className="w-full bg-[#0b0114]/80 border border-[#d966ff]/20 rounded-xl py-3 pl-10 pr-4 text-[#f0eaff] placeholder-gray-600 focus:outline-none focus:border-[#d966ff] focus:ring-1 focus:ring-[#d966ff]/50 transition-all shadow-inner [color-scheme:dark]" />
                </div>
              </div>

              <div className="md:col-span-2 space-y-1">
                <label className="text-sm text-[#99eedd] font-['Orbitron'] tracking-widest">DESCRIPTION</label>
                <textarea required rows="2" name="description" value={formData.description} onChange={handleInputChange} placeholder="Task details..."
                  className="w-full bg-[#0b0114]/80 border border-[#d966ff]/20 rounded-xl py-3 px-4 text-[#f0eaff] placeholder-gray-600 focus:outline-none focus:border-[#d966ff] focus:ring-1 focus:ring-[#d966ff]/50 transition-all shadow-inner"></textarea>
              </div>

              <div className="space-y-1">
                <label className="text-sm text-[#99eedd] font-['Orbitron'] tracking-widest">NOTES (OPTIONAL)</label>
                <div className="relative group">
                  <FileText size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#d966ff]/50 group-hover:text-[#d966ff] transition-colors" />
                  <input type="text" name="note" value={formData.note} onChange={handleInputChange} placeholder="e.g. Submit via GitHub"
                    className="w-full bg-[#0b0114]/80 border border-[#d966ff]/20 rounded-xl py-3 pl-10 pr-4 text-[#f0eaff] placeholder-gray-600 focus:outline-none focus:border-[#d966ff] focus:ring-1 focus:ring-[#d966ff]/50 transition-all shadow-inner" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm text-[#99eedd] font-['Orbitron'] tracking-widest">ATTACHMENT (IMAGE)</label>
                <div className="relative flex items-center bg-[#0b0114]/80 border border-[#d966ff]/20 rounded-xl py-2 px-3 hover:border-[#d966ff]/50 transition-all cursor-pointer">
                  <ImageIcon size={18} className="text-[#ff7ec8] mr-3" />
                  <input type="file" accept="image/*" onChange={handleFileChange} className="w-full text-sm text-[#f0eaff] file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-[#d966ff]/20 file:text-[#ff7ec8] hover:file:bg-[#d966ff]/40 transition-colors" />
                </div>
              </div>

              <div className="md:col-span-2 mt-4">
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={isSubmitting} type="submit" 
                  className="w-full flex items-center justify-center gap-3 bg-[#d966ff]/20 hover:bg-[#d966ff]/40 border border-[#d966ff] disabled:opacity-50 text-[#f0eaff] font-['Orbitron'] font-bold tracking-widest py-4 rounded-xl transition duration-300 shadow-[0_0_15px_rgba(217,102,255,0.3)]">
                  {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} className="text-[#ff7ec8]" />}
                  {isSubmitting ? 'UPLOADING...' : 'DEPLOY TASK'}
                </motion.button>
              </div>
            </form>
          </section>
        )}

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
              <AnimatePresence>
              {homeworks.map((hw, index) => (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.05 }}
                  key={hw.id} className="bg-[#08050f]/80 backdrop-blur-md border border-[#d966ff]/20 p-6 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 group hover:border-[#d966ff]/60 transition-all duration-300 hover:shadow-[0_0_20px_rgba(217,102,255,0.2)]">
                  <div className="flex-1 w-full">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="bg-[#d966ff]/20 border border-[#d966ff]/50 text-[#ff7ec8] text-xs uppercase tracking-widest font-bold px-3 py-1 rounded-md font-['Orbitron'] shadow-[0_0_10px_rgba(217,102,255,0.3)]">
                        {hw.subject}
                      </span>
                      <span className="text-[#99eedd] text-xs font-['Orbitron'] tracking-wider">DUE: {hw.due_date}</span>
                    </div>
                    <h3 className="text-lg font-semibold mb-2 text-[#f0eaff]">{hw.description}</h3>
                    {hw.note && <p className="text-sm text-gray-400 flex items-center gap-2"><FileText size={14} className="text-[#d966ff]"/> {hw.note}</p>}
                  </div>

                  {hw.image_url && (
                    <div className="w-full md:w-32 h-24 rounded-lg overflow-hidden border border-[#d966ff]/20 flex-shrink-0 relative group-hover:border-[#d966ff]/50 transition-colors cursor-pointer"
                         onClick={() => setExpandedImage(hw.image_url)}>
                      <img src={hw.image_url} alt="homework attach" className="w-full h-full object-cover hover:scale-110 transition-transform duration-500" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="text-xs font-bold text-white tracking-widest bg-black/50 px-2 py-1 rounded-md">EXPAND</span>
                      </div>
                    </div>
                  )}

                  {!readOnly && (
                    <button onClick={() => handleDeleteClick(hw.id, hw.image_url)} className="md:opacity-0 md:group-hover:opacity-100 p-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl hover:bg-red-500/30 hover:shadow-[0_0_15px_rgba(239,68,68,0.4)] transition-all duration-300">
                      <Trash2 size={20} />
                    </button>
                  )}
                </motion.div>
              ))}
              </AnimatePresence>
            </div>
          )}
        </section>
      </div>

      <SystemAlert 
        isOpen={alert.isOpen}
        onClose={() => setAlert({ ...alert, isOpen: false })}
        title={alert.title}
        message={alert.message}
        type={alert.type}
        onConfirm={alert.onConfirm}
        confirmText={alert.confirmText}
      />

      <AnimatePresence>
        {expandedImage && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[10000] bg-[#060412]/90 backdrop-blur-xl flex items-center justify-center p-4 cursor-pointer"
            onClick={() => setExpandedImage(null)}
          >
            <button className="absolute top-6 right-6 md:top-10 md:right-10 text-white bg-white/10 p-3 rounded-full hover:bg-[#ff7ec8]/30 hover:text-[#ff7ec8] transition-colors border border-white/10">
              <X size={24} />
            </button>
            <motion.img 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              transition={{ type: "spring", bounce: 0.4 }}
              src={expandedImage} 
              alt="expanded homework" 
              className="max-w-full max-h-[90vh] rounded-2xl border border-[#d966ff]/30 shadow-[0_0_50px_rgba(217,102,255,0.2)] object-contain" 
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}