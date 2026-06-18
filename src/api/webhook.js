import { createClient } from '@supabase/supabase-js';

// 💡 แนะนำให้นำ Key ไปใส่ใน Environment Variables ของ Vercel (Settings > Environment Variables)
// แต่ถ้าทดสอบชั่วคราว สามารถวางตรงนี้ได้เลย
const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_KEY

// Helper Function สำหรับส่งข้อความกลับไปหา Dialogflow
const sendTextResponse = (res, text) => {
  return res.status(200).json({
    fulfillmentMessages: [{ text: { text: [text] } }]
  });
};

export default async function handler(req, res) {
  // รับเฉพาะ POST Request จาก Dialogflow
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    // Vercel แปลง JSON ให้แล้ว เรียกใช้ได้เลย
    const body = req.body;
    const intentName = body.queryResult.intent.displayName;
    const params = body.queryResult.parameters;

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

      if (!data || data.length === 0) return sendTextResponse(res, "✅ เย้! ตอนนี้ไม่มีการบ้านค้างครับ");

      let replyText = "📋 รายการการบ้านทั้งหมด\n" + "━━━━━━━━━━━━━━\n\n";
      replyText += data.map(hw => {
        const dayName = getThaiDay(hw.due_date);
        // เพิ่มการโชว์ Link รูปภาพ ถ้ามีแนบมา
        const imgText = hw.image_url ? `\n🖼️ ไฟล์แนบ: ${hw.image_url}` : '';
        return `📘 วิชา: ${hw.subject}\n📝 งาน: ${hw.description}\n📅 ส่ง: ${dayName} (${hw.due_date})${hw.note ? '\n💡 Note: ' + hw.note : ''}${imgText}`;
      }).join('\n\n──────────────\n\n');

      return sendTextResponse(res, replyText);
    }

    // --- 📅 2. เช็คการบ้าน ตามวัน ---
    if (intentName === "CheckHomework-ByDay") {
      const dayQuery = params.Day; // เช่น "จันทร์"
      const { data, error } = await supabase.from('homework').select('*');
      if (error) throw error;

      // กรองเฉพาะงานที่คำนวณแล้วตรงกับชื่อวันที่เพื่อนถาม
      const filtered = data.filter(hw => getThaiDay(hw.due_date).includes(dayQuery));

      if (filtered.length === 0) return sendTextResponse(res, `✅ วัน${dayQuery} นี้ไม่มีงานต้องส่งครับ`);

      let replyText = `📅 งานที่ต้องส่งวัน${dayQuery}\n` + "━━━━━━━━━━━━━━\n\n";
      replyText += filtered.map(hw => {
        const imgText = hw.image_url ? `\n🖼️ ไฟล์แนบ: ${hw.image_url}` : '';
        return `📘 วิชา: ${hw.subject}\n📝 งาน: ${hw.description}\n📅 วันที่: ${hw.due_date}${hw.note ? '\n💡 Note: ' + hw.note : ''}${imgText}`;
      }).join('\n\n──────────────\n\n');

      return sendTextResponse(res, replyText);
    }

    // --- 🆔 3. เช็คชื่อเลขที่ ---
    if (intentName === "CheckStudent-ByNumber") {
      const targetNo = params.Number.toString();
      const students = { "1": "นาย ธนวินท์ ปัถวี", "2": "นาย ปภังกร ลาภาศุภวัฒน์", "3": "นาย พรพิพัฒน์ ตั้งวิโรจน์กุล", "4": "นาย ภูมิฉัตร ปานทุ่ง", "5": "นาย ไวภพ เพ็ญพันธ์นาค", "6": "นาย ไอศูรย์ อนุศักดิ์ชัยกุล", "7": "นาย วรท วงศ์คงสวัสดิ์", "8": "นาย บึงพิพัฒน์ บึงไกร", "9": "นาย พัทธนันท์ ประยูร", "10": "นาย รุจิภาส แสงอ่อง", "11": "นาย สรวิชญ์ ศรีลาออน", "12": "นาย บุณยกร เฉลิมพรวิทิต", "13": "นาย ชิษณุพงศ์ ถํ้าบุญรัฐเศรษฐ์", "14": "นาย สรยุทธ บุตรวงค์", "15": "นาย ฐตวรรณ พงษ์พยัคฆ์", "16": "นาย จีรัชญ์ ขวัญแก้ว", "17": "นาย ชยางกูร เชื้อเจริญ", "18": "นาย ไชยพศ จัดเจนนาวี", "19": "นาย ปองคุณ อนุกิตติรัตน์", "20": "นาย ศรัณยพงศ์ เอกอัครพรพล", "21": "นาย รวิพล ฤกษ์สมบูรณ์ดี", "22": "นาย วิธวินท์ หอมอ่อน", "23": "นาย ตรัยรัตน์ ประทีปคีรี", "24": "นาย ธาวิน ลาภสมบัติศิริ", "25": "นาย วีรภัฏ หุณฑะสิริ", "26": "นาย จิรายุ ชัยปรีชา", "27": "นาย เอกราช ลุนณี", "28": "นาย สิรวิชญ์ ว่องกีรติกุล", "29": "นาย ฐิติวัชร์ เลิศทักษิณานนท์", "30": "นาย เสฏพงศ์ สุวรรณวงศ์", "31": "นาย ภคินธ์ ไชยเดช", "32": "นางสาว ภณิตา พึ่งใจ", "33": "นางสาว กาญจนา คชศิลา", "34": "นางสาว พชรมน พลค้อ", "35": "นางสาว ณัฐวิภา วงศ์ทองเครือ", "36": "นางสาว ธิชานัน พลจอหอ", "37": "นางสาว นันทิชา มานํ้าเที่ยง", "38": "นางสาว อิษฎาอร โชคมงคลเสถียร", "39": "นางสาว พิมพ์มาดา เที่ยงสั้น", "40": "นางสาว สุวภัทร ปิงเมือง" };
      
      const name = students[targetNo];
      const reply = name ? `🆔 เลขที่ ${targetNo}\n👤 ${name}` : `⚠️ ไม่พบข้อมูลเลขที่ ${targetNo}`;
      return sendTextResponse(res, reply);
    }

    // --- 🗓️ 4. เช็คตารางเรียน ---
    if (intentName === "CheckSchedule") {
      return res.status(200).json({
        fulfillmentMessages: [
          { text: { text: ["🗓️ ตารางเรียนล่าสุดจ้า"] } },
          { image: { imageUri: "https://i.postimg.cc/tTwxWPvn/Screenshot-20251020-145228-Drive.jpg" } }
        ]
      });
    }

    // กรณี Intent ไม่ตรงกับด้านบนเลย
    return sendTextResponse(res, "🤖 ลองพิมพ์ 'การบ้าน' หรือ 'เลขที่...' ดูนะ");

  } catch (error) {
    console.error("Webhook Error:", error);
    return sendTextResponse(res, `💥 ระบบมีปัญหา: ${error.message}`);
  }
}