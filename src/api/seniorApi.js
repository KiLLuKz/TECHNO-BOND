import { supabase } from '../supabaseClient';

export const fetchSeniorProfile = async (userId, email) => {
    const { data: prof, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
    if (error && error.code !== 'PGRST116') throw error;
    return prof || { username: email.split('@')[0], avatar_url: '' };
};

export const fetchSeniorClues = async (email) => {
    const studentId = email.split('@')[0];
    const { data: clues, error } = await supabase
        .from('pairing_data')
        .select('*')
        .eq('senior_student_id', studentId);
    if (error) throw error;
    return clues || []; 
};

// ดึงรายชื่อน้องทุกคน (สำหรับ Database หน้า Directory)
export const fetchAllJuniors = async () => {
    const { data: allJuniors, error } = await supabase.from('pairing_data').select('*');
    if (error) throw error;
    const { data: allProfiles } = await supabase.from('profiles').select('*');

    return allJuniors.map(jr => {
        const p = allProfiles?.find(prof => prof.student_id === jr.junior_student_id);
        return { 
            ...jr, 
            avatar_url: p?.avatar_url || null, 
            banner_url: p?.banner_url || null,
            username: p?.username || 'Not Registered',
            role: p?.role || 'JUNIOR',
            equipped_tags: p?.equipped_tags || []
        };
    });
};

export const fetchInboxMessages = async (email, allJuniorsArray) => {
    const studentId = email.split('@')[0];
    const { data: msgs, error } = await supabase
        .from('messages')
        .select('*')
        .eq('receiver_email', studentId)
        .order('created_at', { ascending: false });
    if (error) throw error;
    if (!msgs) return [];

    const { data: allProfiles } = await supabase.from('profiles').select('*');

    return msgs.map(msg => {
        const p = allProfiles?.find(prof => prof.student_id === msg.sender_id);
        return {
            ...msg,
            avatar_url: p?.avatar_url,
            display_name: p?.username || msg.sender_id
        };
    });
};

export const uploadAvatar = async (userId, file) => {
    const fileName = `avatar_${userId}_${Date.now()}.${file.name.split('.').pop()}`;
    const { error: uploadError } = await supabase.storage.from('avatars').upload(fileName, file, { upsert: true });
    if (uploadError) throw uploadError;
    const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(fileName);
    return publicUrl;
};

export const uploadBanner = async (userId, file) => {
    const fileName = `banner_${userId}_${Date.now()}.${file.name.split('.').pop()}`;
    const { error: uploadError } = await supabase.storage.from('banners').upload(fileName, file, { upsert: true });
    if (uploadError) throw uploadError;
    const { data: { publicUrl } } = supabase.storage.from('banners').getPublicUrl(fileName);
    return publicUrl;
};

export const updateProfile = async (userId, profileData) => {
    const { error } = await supabase.from('profiles').upsert({ id: userId, user_id: userId, ...profileData });
    if (error) throw error;
};

// อัปเดตคำใบ้ (เช็ค senior_student_id)
export const updateClue = async (email, clueField, clueValue, juniorStudentId) => {
    const studentId = email.split('@')[0];
    const { error } = await supabase
        .from('pairing_data')
        .update({ [clueField]: clueValue })
        .eq('senior_student_id', studentId)
        .eq('junior_student_id', juniorStudentId);
        
    if (error) throw error;
};

export const resetClue = async (email, clueField, dbColumn, newCount, juniorStudentId) => {
    const studentId = email.split('@')[0];
    const { error } = await supabase
        .from('pairing_data')
        .update({ 
            [clueField]: null,
            [dbColumn]: newCount
        })
        .eq('senior_student_id', studentId)
        .eq('junior_student_id', juniorStudentId);
        
    if (error) throw error;
};