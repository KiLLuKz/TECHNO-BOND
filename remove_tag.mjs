import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envFile = fs.readFileSync('.env', 'utf-8');
const lines = envFile.split('\n');
let url = '', key = '';
lines.forEach(line => {
    if (line.startsWith('VITE_SUPABASE_URL=')) url = line.split('=')[1].trim();
    if (line.startsWith('VITE_SUPABASE_ANON_KEY=')) key = line.split('=')[1].trim();
});

const supabase = createClient(url, key);

// ----------------------------------------------------
// แก้ไขชื่อ TAG ที่คุณต้องการลบออกจากผู้เล่นทุกคนที่นี่!
const TAG_TO_REMOVE = 'VIP'; 
// ----------------------------------------------------

async function removeTagFromEveryone() {
    console.log(`กำลังค้นหาผู้เล่นที่มี TAG: ${TAG_TO_REMOVE}...`);
    
    // 1. ดึงข้อมูลทุกคนที่มีป้ายนี้
    const { data: profiles, error: fetchError } = await supabase
        .from('profiles')
        .select('id, unlocked_tags, equipped_tags')
        .or(`unlocked_tags.cs.{${TAG_TO_REMOVE}},equipped_tags.cs.{${TAG_TO_REMOVE}}`);
        
    if (fetchError) {
        console.error('Error fetching profiles:', fetchError);
        return;
    }

    if (!profiles || profiles.length === 0) {
        console.log(`ไม่พบผู้เล่นคนไหนที่มี TAG: ${TAG_TO_REMOVE}`);
        return;
    }

    console.log(`พบผู้เล่น ${profiles.length} คน กำลังลบป้าย...`);

    // 2. ลบออกจาก Array ของแต่ละคน
    for (const p of profiles) {
        const newUnlocked = (p.unlocked_tags || []).filter(t => t !== TAG_TO_REMOVE);
        const newEquipped = (p.equipped_tags || []).filter(t => t !== TAG_TO_REMOVE);

        const { error: updateError } = await supabase
            .from('profiles')
            .update({ 
                unlocked_tags: newUnlocked, 
                equipped_tags: newEquipped 
            })
            .eq('id', p.id);

        if (updateError) {
            console.error(`ลบป้ายของผู้เล่น ID ${p.id} ไม่สำเร็จ:`, updateError);
        } else {
            console.log(`- ลบป้ายของ ID: ${p.id} สำเร็จ`);
        }
    }
    console.log('✅ ลบป้ายเสร็จสมบูรณ์!');
}

removeTagFromEveryone();
