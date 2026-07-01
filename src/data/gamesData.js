import { Gamepad2, Users, Crown, Rocket, Anchor, X, Toolbox, Plane, Crosshair } from 'lucide-react';

export const gamesData = [
  {
    id: 'block-blast',
    title: 'BLOCK BLAST',
    desc: 'เกมต่อบล็อกสุดคลาสสิก ลากบล็อกลงตารางเพื่อเคลียร์แถว ทำคอมโบเพื่อรับคะแนนทวีคูณ!',
    image: null,
    IconComponent: Gamepad2, 
    tag: 'HOT GAME',
    colorTheme: '#aa0dff', 
    textColor: '#99eedd',
    tagGradient: 'from-[#d966ff] to-[#99eedd]',
    tagTextColor: '#000000', // สีดำ ตัดกับพื้นหลังสว่าง
    players: 'Score System'
  },
  {
    id: 'connect-four',
    title: 'CONNECT FOUR',
    desc: 'เกมหยอดเหรียญ 4 แถว ประลองปัญญาเรียงเหรียญสีเดียวกันให้ครบ 4 ช่องก่อนใคร!',
    image: null,
    IconComponent: Users,
    tag: 'HOT PvP',
    colorTheme: '#4ECDC4',
    textColor: '#4ECDC4',
    tagGradient: 'from-[#4ECDC4] to-[#2EC4B6]',
    tagTextColor: '#000000', // สีดำ ตัดกับพื้นหลังสว่าง
    players: '2 Players / PvP'
  },
  {
    id: 'tic-tac-toe',
    title: 'TIC TAC TOE',
    desc: 'เกมสุดคลาสสิก X/O ประลองปัญญาบนตาราง 3x3 ใครเรียงครบ 3 ก่อนชนะ!',
    image: null,
    IconComponent: X,
    tag: 'Intense',
    colorTheme: '#779556',
    textColor: '#a8d08d',
    tagGradient: 'from-[#451A70] to-[#6D26B5]',
    tagTextColor: '#ffffff', // สีขาว ตัดกับพื้นหลังมืด
    players: '2 Players'
  },
  {
    id: 'thai-checkers',
    title: 'THAI CHECKERS',
    desc: 'หมากฮอสไทย กฎกติกาแบบไทยแท้ วางแผนกินหน้า กินหลัง สู่ความเป็นจ้าวแห่งกระดาน',
    image: null,
    IconComponent: Crown,
    tag: 'Thailand',
    colorTheme: '#fa5cc8',
    textColor: '#fa5cc8',
    tagGradient: 'from-[#223EC9] to-[#B91C1C]',
    tagTextColor: '#ffffff', // สีขาว ตัดกับพื้นหลังมืด
    players: '2 Players'
  },
  {
    id: 'battleship',
    title: 'BATTLESHIP',
    desc: 'สงครามเรือรบ วางแผนจัดกองทัพเรือของคุณ และเดาที่ตั้งเรือศัตรูเพื่อถล่มให้ราบคาบ!',
    image: null,
    IconComponent: Anchor,
    tag: 'NEW',
    colorTheme: '#1a63e2',
    textColor: '#e5e7eb',
    tagGradient: 'from-[#2200FF] to-[#A104CC]',
    tagTextColor: '#ffffff', // สีดำ ตัดกับพื้นหลังเหลืองเขียว
    players: '2 Players'
  },
  {
    id: 'shoot-em-up',
    title: "SHOOT'EM UP",
    desc: 'กำลังพัฒนา...',
    image: null,
    IconComponent: Rocket,
    tag: 'ALPHA-TEST',
    colorTheme: '#00f7ff',
    textColor: '#e5e7eb',
    tagGradient: 'from-[#86ACFF] to-[#2200FF]',
    tagTextColor: '#ffffff', // สีขาว ตัดกับพื้นหลังแดงเข้ม
    players: 'Single player & Classic'
  },
  {
    id: 'flappy-drone',
    title: 'FLAPPY DRONE',
    desc: 'บังคับโดรนหลบสิ่งกีดขวางในโลก Cyberpunk ท้าทายความเร็วและสะสมคะแนนไต่อันดับ!',
    image: null,
    IconComponent: Plane,
    tag: 'WIP',
    colorTheme: '#4ECDC4',
    textColor: '#e5e7eb',
    tagGradient: 'from-[#86ACFF] to-[#2200FF]',
    tagTextColor: '#ffffff',
    players: 'Single Player'
  },
  {
    id: 'system-defender',
    title: 'SYSTEM DEFENDER',
    desc: 'สวมบทบาทเป็นป้อมปืนปกป้องระบบจากมัลแวร์ที่บุกเข้ามาทุกทิศทาง ยิงให้แหลก!',
    image: null,
    IconComponent: Crosshair,
    tag: 'WIP',
    colorTheme: '#ff3366',
    textColor: '#e5e7eb',
    tagGradient: 'from-[#EF4444] to-[#B91C1C]',
    tagTextColor: '#ffffff',
    players: 'Single Player'
  },
  {
    id: 'cozy-rpg',
    title: "COZY RPG",
    desc: 'กำลังพัฒนา... ด้วย Unity',
    image: null,
    IconComponent: Toolbox,
    tag: 'WIP',
    colorTheme: '#ff0000',
    textColor: '#e5e7eb',
    tagGradient: 'from-[#EF4444] to-[#B91C1C]',
    tagTextColor: '#ffffff', // สีขาว ตัดกับพื้นหลังแดงเข้ม
    players: 'Multiplayer - Farming & PVE'
  },
  {
    id: 'chess',
    title: 'CLASSIC CHESS',
    desc: 'กำลังพัฒนา...',
    image: null,
    IconComponent: Crown,
    tag: 'WIP',
    colorTheme: '#ff0000',
    textColor: '#e5e7eb',
    tagGradient: 'from-[#EF4444] to-[#B91C1C]',
    tagTextColor: '#ffffff', // สีขาว ตัดกับพื้นหลังแดงเข้ม
    players: '2 Players / PvP'
  },
];
