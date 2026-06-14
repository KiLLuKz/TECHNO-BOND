import { supabase } from '../supabaseClient';

export const fetchUserActivity = async (userId) => {
  const today = new Date().toISOString().split('T')[0]; 

  // ใช้ maybeSingle() แทน single() เพื่อป้องกัน Error 406
  let { data: state, error } = await supabase
    .from('user_activity_states')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw error;

  // ถ้าไม่มีข้อมูล ให้สร้างแถวใหม่
  if (!state) {
    const { data: newData, error: insertError } = await supabase
      .from('user_activity_states')
      .insert({ user_id: userId })
      .select()
      .maybeSingle();
      
    // กันกรณี insert ซ้อน (เช่นกดพร้อมกัน 2 ครั้ง)
    if (insertError && insertError.code !== '23505') throw insertError;
    
    // ถ้าติด 23505 (ซ้ำ) ให้ลองดึงใหม่อีกรอบ
    if (insertError?.code === '23505') {
        const { data: retryData } = await supabase.from('user_activity_states').select().eq('user_id', userId).single();
        state = retryData;
    } else {
        state = newData;
    }
  }

  // --- LOGIC DAILY RESET (เหมือนเดิม) ---
  let updates = {};
  let needsUpdate = false;

  if (state.last_message_reset_date !== today) {
    updates.daily_messages_count = 0;
    updates.last_message_reset_date = today;
    needsUpdate = true;
  }

  if (state.last_clue_reset_date !== today) {
    updates.last_clue_reset_date = today;
    needsUpdate = true;
  }

  if (needsUpdate) {
    const { data: updatedState } = await supabase
      .from('user_activity_states')
      .update(updates)
      .eq('user_id', userId)
      .select()
      .single();
    return updatedState;
  }

  return state;
};

export const updateActivity = async (userId, updates) => {
  const { data, error } = await supabase
    .from('user_activity_states')
    .update(updates)
    .eq('user_id', userId)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};