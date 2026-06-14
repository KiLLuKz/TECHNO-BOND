import { supabase } from '../supabaseClient';

// ดึงข้อมูล Clue และ Profile
export const fetchDashboardData = async (studentId, userId) => {
    const { data: clue } = await supabase.from('junior_clues').select('*').eq('student_id', studentId).single();
    const { data: prof } = await supabase.from('profiles').select('*').eq('id', userId).single();
    return { clue, prof };
};

// ดึงโจทย์ Quiz
export const fetchQuizQuestions = async () => {
    const { data } = await supabase.from('quiz_questions').select('*').eq('is_active', true);
    return data;
};

// อัปเดตโปรไฟล์
export const updateProfile = async (id, profileData) => {
    const { error } = await supabase.from('profiles').upsert({ id, ...profileData });
    if (error) throw error;
};

// อัปโหลดรูป (รวม Logic อัปโหลด + ดึง URL)
export const uploadAvatar = async (userId, file) => {
    const fileName = `${userId}.${file.name.split('.').pop()}`;
    const { error: uploadError } = await supabase.storage.from('avatars').upload(fileName, file, { upsert: true });
    if (uploadError) throw uploadError;
    const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(fileName);
    return publicUrl;
};

// ส่งข้อความ
export const sendJuniorMessage = async (senderId, receiverEmail, message) => {
    const { error } = await supabase.from('messages').insert({ 
        sender_id: senderId, 
        receiver_email: receiverEmail, 
        message: message 
    });
    if (error) throw error;
};