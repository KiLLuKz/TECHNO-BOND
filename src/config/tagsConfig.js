// ไฟล์นี้ใช้ตั้งค่า ป้าย (Tags) ต่างๆ ทั้งหมดในระบบ
// สามารถแก้ไขสี ข้อความ กรอบ และคำอธิบายได้ที่นี่
// - id: ชื่อ tag ที่จะถูกบันทึกลงใน database (ห้ามซ้ำ)
// - label: ข้อความที่แสดงผลบนหน้าจอ
// - colorClass: Tailwind class สำหรับแต่งสี (text, background, border, shadow)
// - description: คำอธิบายเงื่อนไขการได้ป้ายนี้มา (เอาไว้แสดงในหน้าระบบสวมใส่ป้าย)

export const TAGS_CONFIG = {
    // -------------------------
    // 🏆 ACHIEVEMENT TAGS
    // -------------------------
    "BETA_TESTER": {
        id: "BETA_TESTER",
        label: "BETA TESTER",
        colorClass: "bg-blue-500/20 text-blue-400 border-blue-500/50 shadow-[0_0_8px_rgba(59,130,246,0.4)]",
        description: "เข้าร่วมทดสอบระบบในช่วง Beta Launch"
    },
    "VETERAN": {
        id: "VETERAN",
        label: "VETERAN",
        colorClass: "bg-amber-600/20 text-amber-500 border-amber-600/50 shadow-[0_0_8px_rgba(217,119,6,0.4)]",
        description: "เข้าสู่ระบบติดต่อกันมากกว่า 30 วัน"
    },
    "HACKER": {
        id: "HACKER",
        label: "HACKER",
        colorClass: "bg-green-500/20 text-green-400 border-green-500/50 shadow-[0_0_8px_rgba(34,197,94,0.4)]",
        description: "ปลดล็อกความลับที่ซ่อนอยู่ในระบบ"
    },
    "GLITCH_HUNTER": {
        id: "GLITCH_HUNTER",
        label: "GLITCH HUNTER",
        colorClass: "bg-teal-500/20 text-teal-400 border-teal-500/50 shadow-[0_0_8px_rgba(20,184,166,0.4)]",
        description: "ค้นพบและรายงานบั๊กในระบบ"
    },
    "OVERCLOCKED": {
        id: "OVERCLOCKED",
        label: "OVERCLOCKED",
        colorClass: "bg-red-500/20 text-red-400 border-red-500/50 shadow-[0_0_8px_rgba(239,68,68,0.4)] animate-pulse",
        description: "เล่นมินิเกมติดต่อกันนานกว่า 2 ชั่วโมง"
    },
    
    // -------------------------
    // 🎮 MINIGAMES TAGS
    // -------------------------
    "SHARPSHOOTER": {
        id: "SHARPSHOOTER",
        label: "SHARPSHOOTER",
        colorClass: "bg-orange-500/20 text-orange-400 border-orange-500/50",
        description: "ทำคะแนนเกม Shoot 'Em Up เกิน 1,000,000 คะแนน"
    },
    "GRANDMASTER": {
        id: "GRANDMASTER",
        label: "GRANDMASTER",
        colorClass: "bg-purple-500/20 text-purple-400 border-purple-500/50",
        description: "ชนะการเล่น Chess ครบ 10 ครั้ง"
    },
    "UNSTOPPABLE": {
        id: "UNSTOPPABLE",
        label: "UNSTOPPABLE",
        colorClass: "bg-rose-500/20 text-rose-400 border-rose-500/50 shadow-[0_0_8px_rgba(244,63,94,0.4)]",
        description: "ติดอันดับ Top 3 ในกระดานผู้นำ (Leaderboard)"
    },
    "SPEEDRUNNER": {
        id: "SPEEDRUNNER",
        label: "SPEEDRUNNER",
        colorClass: "bg-yellow-300/20 text-yellow-300 border-yellow-300/50 italic",
        description: "เคลียร์เงื่อนไขเกมด้วยความเร็วสูงสุด"
    },
    "BLOCK_MASTER": {
        id: "BLOCK_MASTER",
        label: "BLOCK MASTER",
        colorClass: "bg-indigo-500/20 text-indigo-400 border-indigo-500/50",
        description: "ทำลายบล็อกมากกว่า 10,000 ชิ้นใน Block Blast"
    },

    // -------------------------
    // 🧩 CYBERPUNK / LORE TAGS
    // -------------------------
    "CYBER_NINJA": {
        id: "CYBER_NINJA",
        label: "CYBER NINJA",
        colorClass: "bg-gray-800 text-cyan-400 border-cyan-500/50 shadow-[0_0_10px_rgba(34,211,238,0.5)]",
        description: "ผ่านการทดสอบลอบเร้นในระดับสูงสุด"
    },
    "NEON_GHOST": {
        id: "NEON_GHOST",
        label: "NEON GHOST",
        colorClass: "bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/30 shadow-[0_0_15px_rgba(217,70,239,0.5)] border-dashed",
        description: "ผู้เล่นที่ไม่มีใครสังเกตเห็นตัวตน"
    },
    "CODE_WEAVER": {
        id: "CODE_WEAVER",
        label: "CODE WEAVER",
        colorClass: "bg-[#99eedd]/20 text-[#99eedd] border-[#99eedd]/50",
        description: "นักพัฒนาโค้ดระดับปรมาจารย์"
    },
    "NIGHT_CITY_LEGEND": {
        id: "NIGHT_CITY_LEGEND",
        label: "NIGHT CITY LEGEND",
        colorClass: "bg-gradient-to-r from-yellow-400/20 to-pink-500/20 text-yellow-300 border-yellow-400/50 font-bold",
        description: "ตำนานแห่งเมืองแสงสี"
    },
    "SYSTEM_LORD": {
        id: "SYSTEM_LORD",
        label: "SYSTEM LORD",
        colorClass: "bg-slate-900 text-white border-white/50 font-black tracking-widest",
        description: "ผู้ควบคุมระบบสูงสุด"
    },
    "DATA_BROKER": {
        id: "DATA_BROKER",
        label: "DATA BROKER",
        colorClass: "bg-emerald-500/20 text-emerald-400 border-emerald-500/50",
        description: "ผู้รวบรวมข้อมูลทั้งหมดของระบบ"
    },

    // -------------------------
    // 💎 EXCLUSIVE / SPECIAL TAGS
    // -------------------------
    "VIP": {
        id: "VIP",
        label: "VIP",
        colorClass: "bg-yellow-400/20 text-yellow-300 border-yellow-400/50 font-bold shadow-[0_0_10px_rgba(250,204,21,0.5)]",
        description: "ได้รับเชิญเข้าสู่โซนพิเศษของระบบ"
    },
    "FOUNDER": {
        id: "FOUNDER",
        label: "FOUNDER",
        colorClass: "bg-gradient-to-r from-red-500/30 to-purple-500/30 text-white border-pink-500/50 font-bold shadow-[0_0_15px_rgba(236,72,153,0.6)]",
        description: "หนึ่งในผู้ก่อตั้งและวางรากฐานระบบ"
    },
    "CHAMPION": {
        id: "CHAMPION",
        label: "CHAMPION",
        colorClass: "bg-yellow-500 text-black border-yellow-300 font-black shadow-[0_0_15px_rgba(234,179,8,0.8)]",
        description: "ผู้ชนะเลิศอันดับหนึ่งจากการแข่งขัน"
    }
};

// ฟังก์ชันสำหรับเอาค่า Tag กลับไปแสดงผล
export const getTagConfig = (tagId) => {
    return TAGS_CONFIG[tagId] || {
        id: tagId,
        label: tagId,
        colorClass: "bg-gray-500/20 text-gray-400 border-gray-500/50",
        description: "ป้ายปริศนา (Unknown Tag)"
    };
};
