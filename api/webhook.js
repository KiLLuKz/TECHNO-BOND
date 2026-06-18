// ✅ เปลี่ยนโครงสร้างโมดูลเป็น CommonJS (require) ทั้งหมดเพื่อป้องกัน Supabase is not defined บน Vercel
const { createClient } = require('@supabase/supabase-js');

// 💡 ดึงค่าคอนฟิกจาก Vercel Environment Variables
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://phuinjzermedmtliybbn.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBodWluanplcm1lZG10bGl5YmJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI2MTU4MDIsImV4cCI6MjA4ODE5MTgwMn0.Ck2AK9Vxc0vHZEDZqMaLs8YvvgMn9Okt2vVf699X554';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Helper Function สำหรับส่งข้อความกลับไปหา Dialogflow (ครอบคลุม fulfillmentText และ fulfillmentMessages)
const sendDialogflowResponse = (res, text) => {
  return res.status(200).json({
    fulfillmentText: text,
    fulfillmentMessages: [{ text: { text: [text] } }]
  });
};

export default async function handler(req, res) {
  // 🛡️ เปิด CORS เพื่อป้องกันบล็อกสิทธิ์ Request ทะลุช่องทาง
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // รับเฉพาะ POST Request จาก Dialogflow เท่านั้น
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const body = req.body;

    // ดัก Error ตรวจสอบ Schema โครงสร้างข้อมูลเบื้องต้น
    if (!body || !body.queryResult || !body.queryResult.intent) {
      return res.status(400).json({ error: 'Bad Request: Missing Dialogflow payload' });
    }

    const intentName = body.queryResult.intent.displayName;
    const params = body.queryResult.parameters || {};

    // --- ฟังก์ชันช่วยแปลงวันที่ DD/MM/YYYY เป็นชื่อวันภาษาไทย ---
    const getThaiDay = (dateStr) => {
      try {
        const [d, m, y] = dateStr.split('/');
        const date = new Date(y, m - 1, d);
        const days = ["อาทิตย์", "จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์", "เสาร์"];
        return days[date.getDay()];
      } catch (e) { return ""; }
    };

    // --- 📝 1. เช็คการบ้าน (ทั้งหมด) ---
    if (intentName === "CheckHomework") {
      const { data, error } = await supabase.from('homework').select('*').order('id', { ascending: false });
      if (error) throw error;

      if (!data || data.length === 0) return sendDialogflowResponse(res, "✅ เย้! ตอนนี้ไม่มีการบ้านค้างครับ");

      let replyText = "📋 รายการการบ้านทั้งหมด\n" + "━━━━━━━━━━━━━━\n\n";
      replyText += data.map(hw => {
        const dayName = getThaiDay(hw.due_date);
        const imgText = hw.image_url ? `\n🖼️ ไฟล์แนบ: ${hw.image_url}` : '';
        return `📘 วิชา: ${hw.subject}\n📝 งาน: ${hw.description}\n📅 ส่ง: ${dayName} (${hw.due_date})${hw.note ? '\n💡 Note: ' + hw.note : ''}${imgText}`;
      }).join('\n\n──────────────\n\n');

      return sendDialogflowResponse(res, replyText);
    }

    // --- 📅 2. เช็คการบ้าน ตามวัน ---
    if (intentName === "CheckHomework-ByDay") {
      const dayQuery = params.Day || "";
      if (!dayQuery) return sendDialogflowResponse(res, "❓ ต้องการเช็ควันไหนครับ (เช่น วันจันทร์)");

      const { data, error } = await supabase.from('homework').select('*');
      if (error) throw error;

      const filtered = data.filter(hw => getThaiDay(hw.due_date).includes(dayQuery));

      if (filtered.length === 0) return sendDialogflowResponse(res, `✅ วัน${dayQuery} นี้ไม่มีงานต้องส่งครับ`);

      let replyText = `📅 งานที่ต้องส่งวัน${dayQuery}\n` + "━━━━━━━━━━━━━━\n\n";
      replyText += filtered.map(hw => {
        const imgText = hw.image_url ? `\n🖼️ ไฟล์แนบ: ${hw.image_url}` : '';
        return `📘 วิชา: ${hw.subject}\n📝 งาน: ${hw.description}\n📅 วันที่: ${hw.due_date}${hw.note ? '\n💡 Note: ' + hw.note : ''}${imgText}`;
      }).join('\n\n──────────────\n\n');

      return sendDialogflowResponse(res, replyText);
    }

    // --- 🆔 3. เช็คชื่อเลขที่ ---
    if (intentName === "CheckStudent-ByNumber") {
      const targetNo = params.Number ? params.Number.toString() : "";
      if (!targetNo) return sendDialogflowResponse(res, "❓ ต้องการหาเลขที่เท่าไหร่ครับ?");

      const students = { "1": "นาย ธนวินท์ ปัถวี", "2": "นาย ปภังกร ลาภาศุภวัฒน์", "3": "นาย พรพิพัฒน์ ตั้งวิโรจน์กุล", "4": "นาย ภูมิฉัตร ปานทุ่ง", "5": "นาย ไวภพ เพ็ญพันธ์นาค", "6": "นาย ไอศูรย์ อนุศักดิ์ชัยกุล", "7": "นาย วรท วงศ์คงสวัสดิ์", "8": "นาย บึงพิพัฒน์ บึงไกร", "9": "นาย พัทธนันท์ ประยูร", "10": "นาย รุจิภาส แสงอ่อง", "11": "นาย สรวิชญ์ ศรีลาออน", "12": "นาย บุณยกร เฉลิมพรวิทิต", "13": "นาย ชิษณุพงศ์ ถํ้าบุญรัฐเศรษฐ์", "14": "นาย สรยุทธ บุตรวงค์", "15": "นาย ฐตวรรณ พงษ์พยัคฆ์", "16": "นาย จีรัชญ์ ขวัญแก้ว", "17": "นาย ชยางกูร เชื้อเจริญ", "18": "นาย ไชยพศ จัดเจนนาวี", "19": "นาย ปองคุณ อนุกิตติรัตน์", "20": "นาย ศรัณยพงศ์ เอกอัครพรพล", "21": "นาย รวิพล ฤกษ์สมบูรณ์ดี", "22": "นาย วิธวินท์ หอมอ่อน", "23": "นาย ตรัยรัตน์ ประทีปคีรี", "24": "นาย ธาวิน ลาภสมบัติศิริ", "25": "นาย วีรภัฏ หุณฑะสิริ", "26": "นาย จิรายุ ชัยปรีชา", "27": "นาย เอกราช ลุนณี", "28": "นาย สิรวิชญ์ ว่องกีรติกุล", "29": "นาย ฐิติวัชร์ เลิศทักษิณานนท์", "30": "นาย เสฏพงศ์ สุวรรณวงศ์", "31": "นาย ภคินธ์ ไชยเดช", "32": "นางสาว ภณิตา พึ่งใจ", "33": "นางสาว กาญจนา คชศิลา", "34": "นางสาว พชรมน พลค้อ", "35": "นางสาว ณัฐวิภา วงศ์ทองเครือ", "36": "นางสาว ธิชานัน พลจอหอ", "37": "นางสาว นันทิชา มานํ้าเที่ยง", "38": "นางสาว อิษฎาอร โชคมงคลเสถียร", "39": "นางสาว พิมพ์มาดา เที่ยงสั้น", "40": "นางสาว สุวภัทร ปิงเมือง" };
      
      const name = students[targetNo];
      const reply = name ? `🆔 เลขที่ ${targetNo}\n👤 ${name}` : `⚠️ ไม่พบข้อมูลเลขที่ ${targetNo}`;
      return sendDialogflowResponse(res, reply);
    }

    // --- 🗓️ 4. เช็คตารางเรียน ---
    if (intentName === "CheckSchedule") {
      return res.status(200).json({
        fulfillmentText: "🗓️ ตารางเรียนล่าสุดจ้า",
        fulfillmentMessages: [
          { text: { text: ["🗓️ ตารางเรียนล่าสุดจ้า"] } },
          { image: { imageUri: "https://i.postimg.cc/tTwxWPvn/Screenshot-20251020-145228-Drive.jpg" } }
        ]
      });
    }

    return sendDialogflowResponse(res, "🤖 ลองพิมพ์ 'การบ้าน' หรือ 'เลขที่...' ดูนะ");

  } catch (error) {
    console.error("Webhook Error:", error);
    return res.status(200).json({
      fulfillmentText: `💥 ระบบมีปัญหา: ${error.message}`
    });
  }
}