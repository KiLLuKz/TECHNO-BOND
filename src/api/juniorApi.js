import { supabase } from '../supabaseClient';

// ดึงข้อมูล Clue และ Profile
export const fetchDashboardData = async (studentId, userId) => {
    // ใช้ pairing_data และ junior_student_id
    const { data: clue } = await supabase
        .from('pairing_data')
        .select('*')
        .eq('junior_student_id', studentId)
        .single();

    const { data: prof } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
        
    return { clue, prof };
};

export const fetchQuizQuestions = async () => {
    const { data } = await supabase.from('quiz_questions').select('*').eq('is_active', true);
    return data;
};

export const updateProfile = async (id, profileData) => {
    const { error } = await supabase.from('profiles').upsert({ id, user_id: id, ...profileData });
    if (error) throw error;
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

// ส่งข้อความ (เปลี่ยน receiver_email เป็น senior_student_id)
export const sendJuniorMessage = async (senderStudentId, receiverStudentId, message) => {
    const { error } = await supabase.from('messages').insert({ 
        sender_id: senderStudentId, 
        receiver_email: receiverStudentId, // ตอนนี้คือรหัสพี่
        message: message 
    });
    if (error) throw error;
};

export const uploadSeniorPhoto = async (seniorStudentId, file) => {
    const fileName = `official_${seniorStudentId}_${Date.now()}.${file.name.split('.').pop()}`;
    const { error: uploadError } = await supabase.storage.from('avatars').upload(fileName, file, { upsert: true });
    if (uploadError) throw uploadError;
    const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(fileName);
    return publicUrl;
};

export const updateSeniorPhotoUrl = async (seniorStudentId, photoUrl) => {
    // Update all pairing rows for this senior
    const { error } = await supabase.from('pairing_data')
        .update({ senior_photo_url: photoUrl })
        .eq('senior_student_id', seniorStudentId);
    if (error) throw error;
};

export const fetchAllSeniors = async () => {
    // 1. ดึงรายการ pairing_data ทั้งหมด
    const { data: allPairs, error } = await supabase.from('pairing_data').select('*');
    if (error) throw error;
    
    // 2. ดึงโปรไฟล์ทั้งหมด
    const { data: allProfiles } = await supabase.from('profiles').select('*');

    // 3. กรองเอาเฉพาะรายชื่อพี่ที่ไม่ซ้ำกัน
    const uniqueSeniorsMap = new Map();
    
    allPairs.forEach(pair => {
        if (pair.senior_id && !uniqueSeniorsMap.has(pair.senior_id)) {
            const p = allProfiles?.find(prof => prof.student_id === pair.senior_student_id);
            uniqueSeniorsMap.set(pair.senior_id, {
                ...pair,
                avatar_url: p?.avatar_url || null,
                banner_url: p?.banner_url || null,
                senior_photo_url: pair.senior_photo_url || null, // New field from DB
                username: p?.username || 'Not Registered',
                role: p?.role || 'SENIOR',
                equipped_tags: p?.equipped_tags || []
            });
        }
    });

    return Array.from(uniqueSeniorsMap.values());
};