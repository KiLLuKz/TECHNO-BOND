import { supabase } from '../supabaseClient';

// 1. ดึงข้อมูล Profile ของรุ่นพี่
export const fetchSeniorProfile = async (userId, email) => {
    const { data: prof, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
        
    if (error && error.code !== 'PGRST116') throw error; // PGRST116 คือหาไม่เจอ ไม่ต้องโยน Error
    
    return prof || { username: email.split('@')[0], avatar_url: '' };
};

// 2. ดึงข้อมูลคำใบ้ที่รุ่นพี่รับผิดชอบ (จากอีเมลของรุ่นพี่)
export const fetchSeniorClues = async (email) => {
    // รุ่นพี่ 1 คน อาจจะดูแลน้องหลายคน (ดึงมาให้หมด)
    const { data: clues, error } = await supabase
        .from('junior_clues')
        .select('*')
        .eq('senior_email', email);
        
    if (error) throw error;
    
    // คืนค่ารายการแรกมาเป็นตัวแทนคำใบ้หลัก (เนื่องจากคำใบ้ชุดเดียวกัน)
    return clues && clues.length > 0 ? clues[0] : null; 
};

// 3. ดึงรายชื่อน้องรหัสในสาย (และข้อมูล Profile ของพวกเขา)
export const fetchJuniorDirectory = async (seniorEmail) => {
    // 1. ดึงน้องทุกคนออกมาทั้งหมด (ไม่ต้องใช้ .eq)
    const { data: allJuniors, error: jrError } = await supabase
        .from('junior_clues')
        .select('*');
        
    if (jrError) throw jrError;
    if (!allJuniors) return [];

    // 2. ดึง Profile ทั้งหมดมา
    const { data: allProfiles } = await supabase.from('profiles').select('*');

    // 3. Map ข้อมูลทั้งหมด
    return allJuniors.map(jr => {
        const p = allProfiles?.find(prof => prof.student_id === jr.student_id);
        
        return { 
            ...jr, 
            avatar_url: p?.avatar_url || null, 
            // ถ้ารหัสพี่ในฐานข้อมูลตรงกับอีเมลที่ส่งเข้ามา ให้โชว์ชื่อน้องปกติ 
            // ถ้าไม่ใช่พี่ของน้องคนนี้ อาจจะให้โชว์สถานะหรือชื่อน้องได้ตามใจชอบครับ
            username: p?.username || 'Not Registered' 
        };
    });
};

// 4. ดึงข้อความ (Inbox) ที่ถูกส่งมาหาพี่รหัสคนนี้
export const fetchInboxMessages = async (seniorEmail, juniorsArray) => {
    const { data: msgs, error: msgError } = await supabase
        .from('messages')
        .select('*')
        .eq('receiver_email', seniorEmail)
        .order('created_at', { ascending: false });
        
    if (msgError) throw msgError;
    if (!msgs || msgs.length === 0) return [];

    const { data: allProfiles } = await supabase.from('profiles').select('*');

    // จับคู่คนส่งข้อความให้ถูกต้อง
    return msgs.map(msg => {
        const jr = juniorsArray.find(j => j.student_id === msg.sender_id);
        const p = allProfiles?.find(prof => prof.student_id === msg.sender_id);
        return {
            ...msg,
            avatar_url: p?.avatar_url,
            display_name: p?.username || msg.sender_id,
            junior_id: jr?.id
        };
    });
};

// 5. อัปโหลดรูปภาพ Profile (เหมือนฝั่ง Junior)
export const uploadAvatar = async (userId, file) => {
    const fileName = `${userId}.${file.name.split('.').pop()}`;
    const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });
        
    if (uploadError) throw uploadError;
    
    const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(fileName);
    return publicUrl;
};

// 6. อัปเดต Profile (Username, Avatar)
export const updateProfile = async (userId, profileData) => {
    const { error } = await supabase
        .from('profiles')
        .upsert({ id: userId, ...profileData });
    if (error) throw error;
};

// 7. อัปเดตคำใบ้ (Clue 1, 2, 3) ลงในตาราง junior_clues
export const updateClue = async (seniorEmail, clueField, clueValue) => {
    // ต้อง update ให้ครบทุก record ที่พี่คนนี้ดูแลอยู่ (กรณีสายรหัส 1 พี่ 2 น้อง)
    const { error } = await supabase
        .from('junior_clues')
        .update({ [clueField]: clueValue })
        .eq('senior_email', seniorEmail);
        
    if (error) throw error;
};