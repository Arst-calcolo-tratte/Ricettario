import { useState, useEffect, useRef } from "react"; 
import { supabase } from "./supabaseClient.js";

const ONESIGNAL_APP_ID = "ef0dde25-440e-4a00-b86b-7f686aa31c4c";
const DEVICE_ID_KEY = "ricettario_device_id";

function getDeviceId() {
  let id = localStorage.getItem(DEVICE_ID_KEY);
  if (!id) {
    id = (crypto.randomUUID && crypto.randomUUID()) || `dev_${Date.now()}_${Math.random().toString(16).slice(2)}`;
    localStorage.setItem(DEVICE_ID_KEY, id);
  }
  return id;
}

const FONTS = (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
    .rc-display { font-family: 'Baloo 2', sans-serif; }
    .rc-display-i { font-family: 'Baloo 2', sans-serif; font-style: italic; }
    .rc-sans { font-family: 'Plus Jakarta Sans', sans-serif; }

    @keyframes fadeUp { from { opacity: 0; transform: translateY(18px) scale(.96); } to { opacity: 1; transform: translateY(0) scale(1); } }
    @keyframes floatBlob { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(6px,-8px) scale(1.05); } }
    @keyframes floatDoodle { 0%,100% { transform: translateY(0) rotate(var(--r,0deg)); } 50% { transform: translateY(-8px) rotate(calc(var(--r,0deg) + 6deg)); } }
    @keyframes steamRise { 0% { transform: translateY(2px) scaleX(1); opacity: .5; } 50% { transform: translateY(-8px) scaleX(1.2); opacity: .95; } 100% { transform: translateY(2px) scaleX(1); opacity: .5; } }
    @keyframes bubbleUp { 0% { transform: translateY(0) scale(.6); opacity: 0; } 30% { opacity: .9; } 100% { transform: translateY(-16px) scale(1); opacity: 0; } }
    @keyframes dripFall { 0% { transform: translateY(0) scaleY(1); opacity: .95; } 70% { transform: translateY(11px) scaleY(1.5); opacity: .6; } 100% { transform: translateY(15px) scaleY(1.6); opacity: 0; } }
    @keyframes wiggle { 0%,100% { transform: rotate(-4deg); } 50% { transform: rotate(4deg); } }
    @keyframes pulseRing { 0% { box-shadow: 0 0 0 0 rgba(230,62,46,0.5); } 100% { box-shadow: 0 0 0 16px rgba(230,62,46,0); } }
    @keyframes wiggleIn { from { opacity: 0; transform: rotate(0deg) translateY(10px) scale(.9); } to { opacity: 1; transform: rotate(var(--rot,0deg)) translateY(0) scale(1); } }
    @keyframes twinkle { 0%,100% { opacity: .2; transform: scale(.7); } 50% { opacity: 1; transform: scale(1.1); } }
    @keyframes sizzle { 0%,100% { opacity: .3; } 50% { opacity: .8; } }
    @keyframes pearlShift { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
    @keyframes btnPress { 0%,100% { transform: scale(1); } 50% { transform: scale(0.94); } }
    @keyframes popTomato { 0%,100% { transform: translate(0,0) rotate(0deg); } 50% { transform: translate(2px,-4px) rotate(-6deg); } }

    .rc-pearl-bg { background: linear-gradient(120deg, #FF3CAC, #7B3FE4, #2B86C5, #00C9A7, #FFD24D, #FF5A4E, #FF3CAC); background-size: 300% 300%; animation: pearlShift 10s ease-in-out infinite; }
    .rc-open-btn { animation: btnPress 3s ease-in-out infinite; }
    .rc-pop-tomato { animation: popTomato 2.8s ease-in-out infinite; transform-origin: center; }

    .rc-fadeup { animation: fadeUp .55s cubic-bezier(.22,.85,.3,1) both; }
    .rc-card { transition: transform .18s ease, box-shadow .18s ease; }
    .rc-card:active { transform: scale(.96) !important; }
    .rc-btn { transition: transform .12s ease; }
    .rc-btn:active { transform: scale(.9); }
    .rc-pulse { animation: pulseRing 1.8s infinite; }
    .rc-steam { animation: steamRise 2.2s ease-in-out infinite; transform-origin: bottom; }
    .rc-bubble { animation: bubbleUp 2.4s ease-in infinite; }
    .rc-drip { animation: dripFall 2.1s ease-in infinite; }
    .rc-blob { animation: floatBlob 6s ease-in-out infinite; }
    .rc-doodle { animation: floatDoodle 5s ease-in-out infinite; }
    .rc-wiggle { animation: wiggle 1.6s ease-in-out infinite; transform-origin: center; }
    .rc-photo { animation: wiggleIn .5s cubic-bezier(.3,1.4,.4,1) both; }
    .rc-twinkle { animation: twinkle 1.8s ease-in-out infinite; }
    .rc-sizzle { animation: sizzle 1.4s ease-in-out infinite; }
  `}</style>
);

const PALETTE = {
  bg: "#FFF6E6", card: "#FFFFFF", ink: "#2A1D10", inkSoft: "#7A6E5C",
  tomato: "#EA4530", tomatoDeep: "#A82415", tomatoSoft: "#FCE0D8",
  basil: "#2E8B4E", basilDeep: "#1F5F36", basilSoft: "#DDF0E1",
  saffron: "#F3A61E", saffronDeep: "#B5730A", saffronSoft: "#FCEACB",
  plum: "#8B3F9E", plumDeep: "#5E2A70", plumSoft: "#F0DFF4",
  border: "#F0DFC4", cream: "#FFF1D6", dough: "#EFCB84", doughDeep: "#C99A48",
  choc: "#5A3826", chocDeep: "#3A2116", steak: "#8B4A3A", steakDeep: "#5E2E22",
};

const CATEGORIES = [
  { id: "antipasti", label: "Antipasti", color: PALETTE.plum },
  { id: "primi", label: "Primi", color: PALETTE.tomato },
  { id: "secondi", label: "Secondi", color: PALETTE.basil },
  { id: "dolci", label: "Dolci", color: PALETTE.saffron },
];

function Icon({ name, size = 18, color = "currentColor", sw = 2.2 }) {
  const p = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: sw, strokeLinecap: "round", strokeLinejoin: "round" };
  switch (name) {
    case "plus": return <svg {...p}><path d="M12 5v14M5 12h14" /></svg>;
    case "x": return <svg {...p}><path d="M6 6l12 12M18 6L6 18" /></svg>;
    case "arrowLeft": return <svg {...p}><path d="M19 12H5M12 19l-7-7 7-7" /></svg>;
    case "arrowUp": return <svg {...p}><path d="M12 19V5M5 12l7-7 7 7" /></svg>;
    case "chevronRight": return <svg {...p}><path d="M9 6l6 6-6 6" /></svg>;
    case "camera": return <svg {...p}><path d="M4 8h3l2-3h6l2 3h3v11H4z" /><circle cx="12" cy="14" r="3.3" /></svg>;
    case "lock": return <svg {...p}><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></svg>;
    case "lockOpen": return <svg {...p}><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V8a4 4 0 0 1 7.3-1.8" /></svg>;
    case "users": return <svg {...p}><circle cx="9" cy="8" r="3" /><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" /><circle cx="17.5" cy="9.5" r="2.3" /><path d="M15.3 20c.2-2.3 1.9-4.1 3.8-4.6" /></svg>;
    case "clock": return <svg {...p}><circle cx="12" cy="12" r="8" /><path d="M12 8v4l3 2" /></svg>;
    case "message": return <svg {...p}><path d="M4 5.5h16v10.5H9l-5 4z" /></svg>;
    case "book": return <svg {...p}><path d="M4 5.5c2-1 5-1 7 0v13c-2-1-5-1-7 0z" /><path d="M20 5.5c-2-1-5-1-7 0v13c2-1 5-1 7 0z" /></svg>;
    case "refresh": return <svg {...p}><path d="M3.5 12a8.5 8.5 0 1 1 2.5 6" /><path d="M3.5 8v4.2h4.2" /></svg>;
    case "check": return <svg {...p}><path d="M5 13l4 4L19 7" /></svg>;
    case "pencil": return <svg {...p}><path d="M4 20l1-4 11-11 3 3-11 11-4 1z" /></svg>;
    case "search": return <svg {...p}><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></svg>;
    case "folder": return <svg {...p}><path d="M4 6h6l2 2h8v11H4z" /></svg>;
    default: return null;
  }
}

function ChefHatDoodle({ top, left, color, rot, delay }) {
  return <svg viewBox="0 0 40 40" width="30" height="30" className="rc-doodle" style={{ position: "absolute", top, left, "--r": `${rot}deg`, opacity: 0.5, animationDelay: delay, pointerEvents: "none" }}><path d="M10 20 Q6 20 6 15 Q6 10 11 10 Q11 5 17 5 Q20 2 23 5 Q29 5 29 10 Q34 10 34 15 Q34 20 30 20 L30 28 L10 28 Z" fill={color} stroke={PALETTE.ink} strokeWidth="2" strokeLinejoin="round" /><line x1="10" y1="24" x2="30" y2="24" stroke={PALETTE.ink} strokeWidth="1.6" /></svg>;
}
function WhiskDoodle({ top, left, color, rot, delay }) {
  return <svg viewBox="0 0 40 40" width="26" height="26" className="rc-doodle" style={{ position: "absolute", top, left, "--r": `${rot}deg`, opacity: 0.45, animationDelay: delay, pointerEvents: "none" }}><path d="M20 6 L20 20" stroke={PALETTE.ink} strokeWidth="2.2" strokeLinecap="round" /><path d="M20 20 Q10 24 12 32 Q14 37 20 34 Q26 37 28 32 Q30 24 20 20" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" /></svg>;
}
function Blob({ color, size, top, left, delay }) {
  return <div className="rc-blob" style={{ position: "absolute", width: size, height: size, top, left, background: color, borderRadius: "50%", filter: "blur(20px)", opacity: 0.45, animationDelay: delay, pointerEvents: "none" }} />;
}
function Sparkle({ x, y, size, delay }) {
  return <svg viewBox="0 0 20 20" width={size} height={size} className="rc-twinkle" style={{ position: "absolute", left: x, top: y, animationDelay: delay, pointerEvents: "none" }}><path d="M10 1 L12 8 L19 10 L12 12 L10 19 L8 12 L1 10 L8 8 Z" fill="#fff" /></svg>;
}
function NapkinCorner({ color }) { return <path d="M0 100 L0 78 L22 100 Z" fill={color} opacity="0.5" />; }
function Plate({ fill = "#EFE8D8", tint = "#C9A6E8" }) {
  return (
    <>
      <ellipse cx="70" cy="70" rx="50" ry="21" fill={PALETTE.ink} opacity="0.18" />
      <ellipse cx="70" cy="66" rx="50" ry="21" fill={tint} />
      <ellipse cx="70" cy="64" rx="48" ry="20" fill={fill} stroke={PALETTE.ink} strokeWidth="3" />
      <path d="M22 56 Q32 36 52 34" stroke="#fff" strokeWidth="3.5" fill="none" strokeLinecap="round" opacity="0.65" />
    </>
  );
}

/* ---- Primi ---- */
function PastaArt() {
  return (
    <svg viewBox="0 0 140 100" width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
      <defs>
        <radialGradient id="pa-tomato" cx="50%" cy="50%" r="65%" fx="32%" fy="24%">
          <stop offset="0%" stopColor="#FFDCE4" /><stop offset="22%" stopColor="#FF8FAE" /><stop offset="55%" stopColor="#F0104A" /><stop offset="85%" stopColor="#93072F" /><stop offset="100%" stopColor="#5C0420" />
        </radialGradient>
      </defs>
      <rect width="140" height="100" fill={PALETTE.tomato} />
      <NapkinCorner color={PALETTE.saffron} />
      <Plate fill={PALETTE.card} />
      <ellipse cx="48" cy="56" rx="28" ry="10" fill="#C99A5B" opacity="0.35" />
      <path d="M40 58 Q46 48 58 50 Q64 42 74 48 Q68 56 58 58 Q50 62 40 58 Z" fill={PALETTE.dough} stroke={PALETTE.ink} strokeWidth="2.4" strokeLinejoin="round" />
      <g transform="translate(28,8)"><path d="M40 58 Q46 48 58 50 Q64 42 74 48 Q68 56 58 58 Q50 62 40 58 Z" fill={PALETTE.dough} stroke={PALETTE.ink} strokeWidth="2.4" strokeLinejoin="round" /></g>
      <g transform="translate(-16,18)"><path d="M40 58 Q46 48 58 50 Q64 42 74 48 Q68 56 58 58 Q50 62 40 58 Z" fill={PALETTE.dough} stroke={PALETTE.ink} strokeWidth="2.4" strokeLinejoin="round" /></g>
      <rect className="rc-steam" x="55" y="6" width="5" height="20" rx="2.5" fill="#fff" opacity="0.7" />
      <g className="rc-pop-tomato" style={{ transformOrigin: "24px 78px" }}>
        <ellipse cx="24" cy="86" rx="9" ry="2.6" fill="#000" opacity="0.18" />
        <circle cx="24" cy="78" r="11" fill="url(#pa-tomato)" stroke={PALETTE.ink} strokeWidth="1.6" />
        <path d="M21 68 Q24 64 27 68" stroke="#2ED27A" strokeWidth="2" fill="none" strokeLinecap="round" />
        <ellipse cx="20" cy="74" rx="3" ry="2" fill="#fff" opacity="0.75" />
      </g>
    </svg>
  );
}
function SeafoodArt() {
  return (<svg viewBox="0 0 140 100" width="100%" height="100%" preserveAspectRatio="xMidYMid slice"><rect width="140" height="100" fill={PALETTE.basil} /><NapkinCorner color={PALETTE.basilDeep} /><Plate /><ellipse cx="66" cy="62" rx="42" ry="17" fill="#1B1712" stroke={PALETTE.ink} strokeWidth="2" /><ellipse cx="56" cy="58" rx="9" ry="9" fill="none" stroke="#fff" strokeWidth="2.6" /><ellipse cx="82" cy="66" rx="7" ry="7" fill="none" stroke="#fff" strokeWidth="2.2" /><circle className="rc-bubble" cx="30" cy="74" r="3.2" fill="#fff" opacity="0.8" /></svg>);
}
function SpaghettiArt() {
  return (<svg viewBox="0 0 140 100" width="100%" height="100%" preserveAspectRatio="xMidYMid slice"><rect width="140" height="100" fill={PALETTE.tomatoDeep} /><NapkinCorner color={PALETTE.tomato} /><Plate fill={PALETTE.card} /><path d="M68 64 m-24,0 a24,10 0 1,0 48,0 a24,10 0 1,0 -48,0" fill="none" stroke={PALETTE.saffron} strokeWidth="3" /><path d="M68 64 m-14,0 a14,6 0 1,0 28,0 a14,6 0 1,0 -28,0" fill="none" stroke={PALETTE.saffronDeep} strokeWidth="3" /><circle cx="50" cy="56" r="2.2" fill={PALETTE.tomato} /><circle cx="84" cy="58" r="2.2" fill={PALETTE.tomato} /></svg>);
}
function BakedPastaArt() {
  return (<svg viewBox="0 0 140 100" width="100%" height="100%" preserveAspectRatio="xMidYMid slice"><rect width="140" height="100" fill={PALETTE.saffronDeep} /><NapkinCorner color={PALETTE.tomato} /><path d="M28 30 L112 30 L108 76 L32 76 Z" fill={PALETTE.dough} stroke={PALETTE.ink} strokeWidth="3" strokeLinejoin="round" /><path d="M34 40 L106 40 M33 50 L107 50 M32 60 L108 60 M32 70 L108 70" stroke={PALETTE.saffron} strokeWidth="2" opacity="0.55" /><circle cx="50" cy="45" r="2.4" fill={PALETTE.tomato} opacity="0.8" /><circle cx="76" cy="55" r="2.4" fill={PALETTE.tomato} opacity="0.8" /><rect className="rc-steam" x="65" y="8" width="5" height="18" rx="2.5" fill="#fff" opacity="0.6" /></svg>);
}
function GnocchiArt() {
  return (<svg viewBox="0 0 140 100" width="100%" height="100%" preserveAspectRatio="xMidYMid slice"><rect width="140" height="100" fill={PALETTE.tomato} /><NapkinCorner color={PALETTE.saffron} /><Plate fill={PALETTE.card} /><ellipse cx="60" cy="60" rx="46" ry="16" fill={PALETTE.tomatoDeep} opacity="0.85" />{[[46,54],[58,60],[70,52],[80,62],[54,66],[68,68]].map(([x,y],i)=>(<ellipse key={i} cx={x} cy={y} rx="7" ry="5" fill={PALETTE.dough} stroke={PALETTE.ink} strokeWidth="1.6" />))}<circle cx="90" cy="48" r="1.8" fill={PALETTE.basilSoft} /><circle cx="40" cy="46" r="1.8" fill={PALETTE.basilSoft} /></svg>);
}
function RavioliArt() {
  return (<svg viewBox="0 0 140 100" width="100%" height="100%" preserveAspectRatio="xMidYMid slice"><rect width="140" height="100" fill={PALETTE.saffronSoft} /><NapkinCorner color={PALETTE.saffronDeep} /><Plate fill={PALETTE.card} />{[[48,52],[70,48],[92,54],[58,66],[82,68]].map(([x,y],i)=>(<rect key={i} x={x-11} y={y-8} width="22" height="16" rx="3" fill={PALETTE.dough} stroke={PALETTE.ink} strokeWidth="2" transform={`rotate(${(i%2?6:-6)} ${x} ${y})`} />))}<circle cx="66" cy="58" r="1.6" fill={PALETTE.basil} /><circle cx="80" cy="50" r="1.6" fill={PALETTE.basil} /></svg>);
}
function MinestroneArt() {
  return (<svg viewBox="0 0 140 100" width="100%" height="100%" preserveAspectRatio="xMidYMid slice"><rect width="140" height="100" fill={PALETTE.basilDeep} /><NapkinCorner color={PALETTE.basil} /><Plate fill={PALETTE.card} /><ellipse cx="70" cy="62" rx="42" ry="16" fill="#C9713C" stroke={PALETTE.ink} strokeWidth="2" /><path d="M54 58 a6 6 0 1 1 0.1 0" fill={PALETTE.saffron} stroke={PALETTE.ink} strokeWidth="1.4" /><rect x="78" y="56" width="10" height="5" rx="1.5" fill={PALETTE.basil} stroke={PALETTE.ink} strokeWidth="1.2" /><ellipse cx="64" cy="68" rx="5" ry="3.4" fill={PALETTE.tomato} stroke={PALETTE.ink} strokeWidth="1.2" /><rect className="rc-steam" x="62" y="30" width="5" height="20" rx="2.5" fill="#fff" opacity="0.7" /><rect className="rc-steam" x="76" y="26" width="5" height="24" rx="2.5" fill="#fff" opacity="0.7" style={{ animationDelay: "0.5s" }} /></svg>);
}

/* ---- Secondi ---- */
function PolloArrostoArt() {
  return (<svg viewBox="0 0 140 100" width="100%" height="100%" preserveAspectRatio="xMidYMid slice"><rect width="140" height="100" fill={PALETTE.basil} /><NapkinCorner color={PALETTE.basilDeep} /><Plate fill={PALETTE.cream} /><ellipse cx="66" cy="56" rx="28" ry="20" fill="#C97A2E" stroke={PALETTE.ink} strokeWidth="3" /><path d="M40 62 Q30 60 26 70 Q32 76 42 70 Z" fill="#C97A2E" stroke={PALETTE.ink} strokeWidth="2.4" /><path d="M92 62 Q102 60 106 70 Q100 76 90 70 Z" fill="#C97A2E" stroke={PALETTE.ink} strokeWidth="2.4" /><path d="M50 44 Q66 38 82 44" stroke="#A85D1E" strokeWidth="2" fill="none" opacity="0.6" /><path d="M56 88 Q60 82 66 88" stroke={PALETTE.basil} strokeWidth="2" fill="none" strokeLinecap="round" /></svg>);
}
function PesceAlFornoArt() {
  return (<svg viewBox="0 0 140 100" width="100%" height="100%" preserveAspectRatio="xMidYMid slice"><rect width="140" height="100" fill={PALETTE.basilSoft} /><NapkinCorner color={PALETTE.basil} /><Plate fill={PALETTE.card} /><ellipse cx="62" cy="60" rx="34" ry="14" fill="#E2A857" stroke={PALETTE.ink} strokeWidth="3" /><path d="M96 60 L112 50 L108 60 L112 70 Z" fill="#E2A857" stroke={PALETTE.ink} strokeWidth="2.4" strokeLinejoin="round" /><path d="M42 54 Q62 50 82 54 M42 66 Q62 70 82 66" stroke="#B87F35" strokeWidth="1.6" fill="none" opacity="0.6" /><circle cx="46" cy="56" r="1.6" fill={PALETTE.ink} /><circle cx="30" cy="40" r="8" fill={PALETTE.saffron} stroke={PALETTE.ink} strokeWidth="2" /><path d="M25 40 L35 40 M30 35 L30 45" stroke="#fff" strokeWidth="1.2" opacity="0.7" /></svg>);
}
function BisteccaArt() {
  return (<svg viewBox="0 0 140 100" width="100%" height="100%" preserveAspectRatio="xMidYMid slice"><rect width="140" height="100" fill={PALETTE.steak} /><NapkinCorner color={PALETTE.steakDeep} /><Plate fill={PALETTE.cream} /><path d="M38 48 Q34 62 42 74 Q58 82 78 76 Q98 70 100 54 Q98 42 82 40 Q58 36 38 48 Z" fill="#9C5A3E" stroke={PALETTE.ink} strokeWidth="3" strokeLinejoin="round" /><path d="M48 48 L92 62 M52 62 L94 50 M46 60 L86 70" stroke={PALETTE.ink} strokeWidth="2" opacity="0.5" /><path className="rc-sizzle" d="M58 34 Q56 28 60 24" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" /><path className="rc-sizzle" d="M74 32 Q72 26 76 22" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" style={{ animationDelay: "0.4s" }} /></svg>);
}
function PolpetteArt() {
  return (<svg viewBox="0 0 140 100" width="100%" height="100%" preserveAspectRatio="xMidYMid slice"><rect width="140" height="100" fill={PALETTE.tomatoDeep} /><NapkinCorner color={PALETTE.tomato} /><Plate fill={PALETTE.card} /><ellipse cx="68" cy="62" rx="44" ry="16" fill={PALETTE.tomato} opacity="0.85" />{[[50,56],[68,50],[86,58],[60,68],[78,66]].map(([x,y],i)=>(<circle key={i} cx={x} cy={y} r="9" fill="#7A4630" stroke={PALETTE.ink} strokeWidth="2" />))}<circle cx="94" cy="48" r="1.8" fill={PALETTE.basilSoft} /><circle cx="42" cy="46" r="1.8" fill={PALETTE.basilSoft} /></svg>);
}
function FrittataArt() {
  return (<svg viewBox="0 0 140 100" width="100%" height="100%" preserveAspectRatio="xMidYMid slice"><rect width="140" height="100" fill={PALETTE.saffron} /><NapkinCorner color={PALETTE.saffronDeep} /><Plate fill={PALETTE.card} /><path d="M70 42 L100 76 L40 76 Z" fill="#F6D157" stroke={PALETTE.ink} strokeWidth="3" strokeLinejoin="round" /><circle cx="62" cy="60" r="4" fill={PALETTE.tomato} opacity="0.8" /><circle cx="78" cy="66" r="4" fill={PALETTE.basil} opacity="0.8" /><circle cx="70" cy="52" r="3" fill={PALETTE.tomato} opacity="0.8" /></svg>);
}

/* ---- Dolci ---- */
function SeadasArt() {
  return (<svg viewBox="0 0 140 100" width="100%" height="100%" preserveAspectRatio="xMidYMid slice"><rect width="140" height="100" fill={PALETTE.saffron} /><NapkinCorner color={PALETTE.tomato} /><ellipse cx="70" cy="72" rx="42" ry="16" fill={PALETTE.ink} opacity="0.15" /><circle cx="70" cy="52" r="34" fill={PALETTE.dough} stroke={PALETTE.ink} strokeWidth="3" /><circle cx="70" cy="52" r="17" fill={PALETTE.cream} stroke={PALETTE.saffronDeep} strokeWidth="2" /><ellipse className="rc-drip" cx="58" cy="88" rx="2.6" ry="4.4" fill={PALETTE.saffronDeep} /><ellipse className="rc-drip" cx="82" cy="88" rx="2.6" ry="4.4" fill={PALETTE.saffronDeep} style={{ animationDelay: "0.8s" }} /></svg>);
}
function CakeArt() {
  return (<svg viewBox="0 0 140 100" width="100%" height="100%" preserveAspectRatio="xMidYMid slice"><rect width="140" height="100" fill={PALETTE.plum} /><NapkinCorner color={PALETTE.plumDeep} /><ellipse cx="70" cy="82" rx="46" ry="10" fill={PALETTE.ink} opacity="0.15" /><rect x="36" y="60" width="68" height="20" rx="3" fill="#FBEFD8" stroke={PALETTE.ink} strokeWidth="3" /><rect x="40" y="42" width="60" height="20" rx="3" fill="#FDF6E7" stroke={PALETTE.ink} strokeWidth="3" /><rect x="44" y="26" width="52" height="18" rx="3" fill="#FBEFD8" stroke={PALETTE.ink} strokeWidth="3" /><circle cx="70" cy="20" r="6" fill={PALETTE.tomato} stroke={PALETTE.ink} strokeWidth="2" /></svg>);
}
function ChocCakeArt() {
  return (<svg viewBox="0 0 140 100" width="100%" height="100%" preserveAspectRatio="xMidYMid slice"><rect width="140" height="100" fill={PALETTE.choc} /><NapkinCorner color={PALETTE.chocDeep} /><ellipse cx="70" cy="82" rx="46" ry="10" fill="#000" opacity="0.2" /><rect x="34" y="36" width="72" height="44" rx="4" fill="#7A4B2E" stroke={PALETTE.ink} strokeWidth="3" /><path className="rc-drip" d="M40 38 Q42 46 40 54" stroke={PALETTE.chocDeep} strokeWidth="5" fill="none" strokeLinecap="round" /><path className="rc-drip" d="M78 38 Q80 44 78 50" stroke={PALETTE.chocDeep} strokeWidth="5" fill="none" strokeLinecap="round" style={{ animationDelay: "0.6s" }} /></svg>);
}
function TartArt() {
  return (<svg viewBox="0 0 140 100" width="100%" height="100%" preserveAspectRatio="xMidYMid slice"><rect width="140" height="100" fill={PALETTE.saffronSoft} /><NapkinCorner color={PALETTE.saffronDeep} /><ellipse cx="70" cy="80" rx="46" ry="10" fill={PALETTE.ink} opacity="0.12" /><circle cx="70" cy="54" r="36" fill={PALETTE.dough} stroke={PALETTE.ink} strokeWidth="3" /><circle cx="70" cy="54" r="27" fill={PALETTE.tomato} stroke={PALETTE.tomatoDeep} strokeWidth="2" /><path d="M44 54 L96 54 M70 28 L70 80 M50 34 L90 74 M50 74 L90 34" stroke={PALETTE.dough} strokeWidth="6" opacity="0.95" /></svg>);
}
function TiramisuArt() {
  return (<svg viewBox="0 0 140 100" width="100%" height="100%" preserveAspectRatio="xMidYMid slice"><rect width="140" height="100" fill={PALETTE.choc} /><NapkinCorner color={PALETTE.chocDeep} /><path d="M52 26 L88 26 L92 82 L48 82 Z" fill="#F3E6C8" stroke={PALETTE.ink} strokeWidth="3" strokeLinejoin="round" /><rect x="49" y="60" width="42" height="10" fill="#8A5A34" opacity="0.85" /><rect x="50" y="42" width="41" height="10" fill="#8A5A34" opacity="0.85" /><circle cx="60" cy="34" r="1.3" fill={PALETTE.chocDeep} /><circle cx="70" cy="32" r="1.3" fill={PALETTE.chocDeep} /><circle cx="80" cy="35" r="1.3" fill={PALETTE.chocDeep} /><circle cx="65" cy="38" r="1.3" fill={PALETTE.chocDeep} /><circle cx="75" cy="30" r="1.3" fill={PALETTE.chocDeep} /></svg>);
}
function GelatoArt() {
  return (<svg viewBox="0 0 140 100" width="100%" height="100%" preserveAspectRatio="xMidYMid slice"><rect width="140" height="100" fill={PALETTE.tomatoSoft} /><NapkinCorner color={PALETTE.tomato} /><path d="M60 60 L70 90 L80 60 Z" fill={PALETTE.dough} stroke={PALETTE.ink} strokeWidth="3" strokeLinejoin="round" /><path d="M62 66 L78 66 M63 74 L77 74 M65 82 L75 82" stroke={PALETTE.doughDeep} strokeWidth="1.4" /><circle cx="70" cy="48" r="18" fill="#F5C6D6" stroke={PALETTE.ink} strokeWidth="3" /><circle cx="70" cy="28" r="15" fill="#FFF3D6" stroke={PALETTE.ink} strokeWidth="3" /><Sparkle x="94px" y="18px" size={12} delay="0.2s" /><Sparkle x="40px" y="34px" size={9} delay="0.9s" /></svg>);
}
function BiscottiArt() {
  return (<svg viewBox="0 0 140 100" width="100%" height="100%" preserveAspectRatio="xMidYMid slice"><rect width="140" height="100" fill={PALETTE.saffronDeep} /><NapkinCorner color={PALETTE.saffron} />{[[46,64],[68,68],[90,62],[58,52],[80,50]].map(([x,y],i)=>(<g key={i}><circle cx={x} cy={y} r="14" fill={PALETTE.dough} stroke={PALETTE.ink} strokeWidth="2.6" /><circle cx={x-4} cy={y-3} r="1.6" fill={PALETTE.chocDeep} /><circle cx={x+3} cy={y+4} r="1.6" fill={PALETTE.chocDeep} /><circle cx={x+5} cy={y-4} r="1.4" fill={PALETTE.chocDeep} /></g>))}</svg>);
}
function PannaCottaArt() {
  return (<svg viewBox="0 0 140 100" width="100%" height="100%" preserveAspectRatio="xMidYMid slice"><rect width="140" height="100" fill={PALETTE.plumSoft} /><NapkinCorner color={PALETTE.plum} /><Plate fill={PALETTE.card} /><path d="M50 40 Q50 66 70 68 Q90 66 90 40 Z" fill="#FBF6E9" stroke={PALETTE.ink} strokeWidth="3" /><path d="M50 40 Q70 46 90 40" fill="none" stroke={PALETTE.plumSoft} strokeWidth="2" opacity="0.7" /><path className="rc-drip" d="M70 66 Q74 72 70 78" stroke={PALETTE.tomato} strokeWidth="4" fill="none" strokeLinecap="round" /><circle cx="60" cy="72" r="3" fill={PALETTE.tomato} stroke={PALETTE.ink} strokeWidth="1" /><circle cx="80" cy="74" r="3" fill={PALETTE.tomato} stroke={PALETTE.ink} strokeWidth="1" /></svg>);
}

/* ---- Antipasti ---- */
function TaglierArt() {
  return (<svg viewBox="0 0 140 100" width="100%" height="100%" preserveAspectRatio="xMidYMid slice"><rect width="140" height="100" fill={PALETTE.plum} /><NapkinCorner color={PALETTE.plumDeep} /><rect x="24" y="46" width="92" height="34" rx="8" fill="#C99A5B" stroke={PALETTE.ink} strokeWidth="3" /><path d="M46 46 L58 76 L34 76 Z" fill="#F6E4A0" stroke={PALETTE.ink} strokeWidth="2.4" strokeLinejoin="round" /><circle cx="42" cy="60" r="1.6" fill={PALETTE.saffronDeep} /><circle cx="50" cy="66" r="1.6" fill={PALETTE.saffronDeep} />{[[70,54],[78,58],[86,54],[94,60]].map(([x,y],i)=>(<circle key={i} cx={x} cy={y} r="6" fill="#C0392B" stroke={PALETTE.ink} strokeWidth="1.6" />))}{[[68,70],[74,72],[80,70]].map(([x,y],i)=>(<circle key={i} cx={x} cy={y} r="3.4" fill={PALETTE.plumSoft} stroke={PALETTE.ink} strokeWidth="1.2" />))}</svg>);
}
function BruschetteArt() {
  return (<svg viewBox="0 0 140 100" width="100%" height="100%" preserveAspectRatio="xMidYMid slice"><rect width="140" height="100" fill={PALETTE.tomatoSoft} /><NapkinCorner color={PALETTE.tomato} /><Plate fill={PALETTE.card} /><rect x="34" y="46" width="34" height="18" rx="4" fill={PALETTE.dough} stroke={PALETTE.ink} strokeWidth="2.6" /><rect x="72" y="50" width="34" height="18" rx="4" fill={PALETTE.dough} stroke={PALETTE.ink} strokeWidth="2.6" transform="rotate(4 89 59)" /><circle cx="44" cy="50" r="2.4" fill={PALETTE.tomato} /><circle cx="54" cy="52" r="2.4" fill={PALETTE.tomato} /><circle cx="82" cy="54" r="2.4" fill={PALETTE.tomato} /><circle cx="94" cy="52" r="2.4" fill={PALETTE.tomato} /><path d="M40 48 L60 48" stroke={PALETTE.basil} strokeWidth="1.4" /></svg>);
}
function CapreseArt() {
  return (<svg viewBox="0 0 140 100" width="100%" height="100%" preserveAspectRatio="xMidYMid slice"><rect width="140" height="100" fill={PALETTE.basilSoft} /><NapkinCorner color={PALETTE.basil} /><Plate fill={PALETTE.card} /><g>{[46,70,94].map((x,i)=>(<g key={i}><circle cx={x} cy="50" r="9" fill={PALETTE.tomato} stroke={PALETTE.ink} strokeWidth="2" /><circle cx={x} cy="62" r="9" fill="#fff" stroke={PALETTE.ink} strokeWidth="2" /><ellipse cx={x} cy="72" rx="6" ry="3.4" fill={PALETTE.basil} stroke={PALETTE.ink} strokeWidth="1.4" /></g>))}</g><path d="M40 44 L100 44" stroke={PALETTE.ink} strokeWidth="1.6" opacity="0.4" /></svg>);
}
function OliveArt() {
  return (<svg viewBox="0 0 140 100" width="100%" height="100%" preserveAspectRatio="xMidYMid slice"><rect width="140" height="100" fill={PALETTE.saffronSoft} /><NapkinCorner color={PALETTE.basil} /><path d="M46 40 L94 40 L90 82 L50 82 Z" fill="#DCEAD8" opacity="0.8" stroke={PALETTE.ink} strokeWidth="3" strokeLinejoin="round" />{[[58,54],[70,50],[82,56],[62,66],[76,68],[68,74]].map(([x,y],i)=>(<ellipse key={i} cx={x} cy={y} rx="6" ry="7" fill={i%2?PALETTE.basilDeep:"#5C6B39"} stroke={PALETTE.ink} strokeWidth="1.4" />))}<path d="M46 40 L94 40" stroke={PALETTE.ink} strokeWidth="2" /></svg>);
}

const COVER_ART = {
  culurgiones: PastaArt, seppia: SeafoodArt, spaghetti: SpaghettiArt, pastaAlForno: BakedPastaArt, gnocchi: GnocchiArt, ravioli: RavioliArt, minestrone: MinestroneArt,
  polloArrosto: PolloArrostoArt, pesceAlForno: PesceAlFornoArt, bistecca: BisteccaArt, polpette: PolpetteArt, frittata: FrittataArt,
  seadas: SeadasArt, torta: CakeArt, tortaCioccolato: ChocCakeArt, crostata: TartArt, tiramisu: TiramisuArt, gelato: GelatoArt, biscotti: BiscottiArt, pannaCotta: PannaCottaArt,
  tagliere: TaglierArt, bruschette: BruschetteArt, caprese: CapreseArt, olive: OliveArt,
};
const COVER_COLOR = {
  culurgiones: PALETTE.tomato, seppia: PALETTE.basil, spaghetti: PALETTE.tomatoDeep, pastaAlForno: PALETTE.saffronDeep, gnocchi: PALETTE.tomato, ravioli: PALETTE.saffronDeep, minestrone: PALETTE.basilDeep,
  polloArrosto: PALETTE.basil, pesceAlForno: PALETTE.basilSoft, bistecca: PALETTE.steak, polpette: PALETTE.tomatoDeep, frittata: PALETTE.saffron,
  seadas: PALETTE.saffron, torta: PALETTE.plum, tortaCioccolato: PALETTE.choc, crostata: PALETTE.saffronDeep, tiramisu: PALETTE.choc, gelato: PALETTE.tomatoSoft, biscotti: PALETTE.saffronDeep, pannaCotta: PALETTE.plumSoft,
  tagliere: PALETTE.plum, bruschette: PALETTE.tomatoSoft, caprese: PALETTE.basilSoft, olive: PALETTE.saffronSoft,
};
const COVER_LABELS = {
  culurgiones: "Pasta ripiena", seppia: "Riso o pesce", spaghetti: "Spaghetti / pasta asciutta", pastaAlForno: "Pasta o lasagna al forno", gnocchi: "Gnocchi", ravioli: "Ravioli", minestrone: "Minestrone / zuppa",
  polloArrosto: "Pollo arrosto", pesceAlForno: "Pesce al forno", bistecca: "Bistecca alla griglia", polpette: "Polpette al sugo", frittata: "Frittata",
  seadas: "Frittella dolce", torta: "Torta alla crema", tortaCioccolato: "Torta al cioccolato", crostata: "Crostata", tiramisu: "Tiramisù", gelato: "Gelato", biscotti: "Biscotti", pannaCotta: "Panna cotta",
  tagliere: "Tagliere salumi e formaggi", bruschette: "Bruschette", caprese: "Caprese", olive: "Olive e sottaceti",
};

const INITIAL_RECIPES = [
  {
    id: 1, title: "Culurgiones della nonna", subtitle: "Pasta ripiena di patate e menta", time: "1 h 30", baseServings: 4, tags: ["sardo"], category: "primi", cover: "culurgiones",
    ingredients: [
      { id: "a1", name: "Patate", amount: 800, unit: "g", locked: false },
      { id: "a2", name: "Pecorino grattugiato", amount: 150, unit: "g", locked: false },
      { id: "a3", name: "Farina 00", amount: 400, unit: "g", locked: false },
      { id: "a4", name: "Menta fresca", amount: 1, unit: null, locked: true },
      { id: "a5", name: "Sale fino", amount: 1, unit: "tsp", locked: true },
      { id: "a6", name: "Aglio", amount: 2, unit: null, locked: false },
    ],
    steps: [
      { text: "Lessa le patate finché sono morbide", seconds: 1200 },
      { text: "Schiaccia le patate e unisci pecorino, aglio e menta", seconds: null },
      { text: "Impasta farina e acqua fino a un impasto liscio", seconds: 600 },
      { text: "Lascia riposare l'impasto coperto", seconds: 1800 },
      { text: "Forma i culurgiones e chiudili a spiga", seconds: null },
      { text: "Cuoci in acqua bollente salata", seconds: 300 },
    ],
    photos: [],
  },
  {
    id: 2, title: "Risotto al nero di seppia", subtitle: "Con seppioline e prezzemolo", time: "45 min", baseServings: 2, tags: ["pesce"], category: "primi", cover: "seppia",
    ingredients: [
      { id: "b1", name: "Riso carnaroli", amount: 320, unit: "g", locked: false },
      { id: "b2", name: "Seppie con nero", amount: 400, unit: "g", locked: false },
      { id: "b3", name: "Brodo di pesce", amount: 1, unit: "l", locked: false },
      { id: "b4", name: "Vino bianco", amount: 100, unit: "ml", locked: false },
      { id: "b5", name: "Sale fino", amount: 1, unit: "tsp", locked: true },
    ],
    steps: [
      { text: "Pulisci le seppie e taglia ad anelli, conserva il nero", seconds: null },
      { text: "Tosta il riso a secco", seconds: 120 },
      { text: "Sfuma con il vino bianco", seconds: null },
      { text: "Aggiungi il brodo un mestolo alla volta, mescolando", seconds: 1080 },
      { text: "Unisci seppie e nero, manteca e servi", seconds: null },
    ],
    photos: [],
  },
  {
    id: 3, title: "Seadas al miele", subtitle: "Formaggio fresco e miele amaro", time: "50 min", baseServings: 6, tags: ["sardo"], category: "dolci", cover: "seadas",
    ingredients: [
      { id: "c1", name: "Formaggio fresco acido", amount: 500, unit: "g", locked: false },
      { id: "c2", name: "Semola rimacinata", amount: 300, unit: "g", locked: false },
      { id: "c3", name: "Strutto", amount: 60, unit: "g", locked: false },
      { id: "c4", name: "Miele amaro", amount: 4, unit: "tbsp", locked: false },
      { id: "c5", name: "Scorza di limone", amount: 1, unit: null, locked: true },
    ],
    steps: [
      { text: "Impasta semola, strutto e acqua fino a un panetto liscio", seconds: 600 },
      { text: "Lascia riposare l'impasto coperto", seconds: 1200 },
      { text: "Stendi la sfoglia sottile e farcisci con il formaggio", seconds: null },
      { text: "Friggi in olio caldo finché dorate", seconds: 240 },
      { text: "Servi calde con miele amaro a filo", seconds: null },
    ],
    photos: [],
  },
];

const CHAT_SEED = [
  { from: "them", text: "Ho provato i culurgiones ma con meno pecorino, buonissimi comunque", time: "ieri 20:14" },
  { from: "me", text: "Bravo! Io stasera faccio il risotto, ti mando una foto", time: "ieri 20:20" },
];

function round(n) { return Math.round(n * 100) / 100; }
function fmt(seconds) {
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = Math.floor(seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

function TagPill({ tag, i }) {
  const pairs = [[PALETTE.tomato, PALETTE.tomatoDeep], [PALETTE.basil, PALETTE.basilDeep], [PALETTE.saffron, PALETTE.saffronDeep], [PALETTE.plum, PALETTE.plumDeep]];
  const [from, to] = pairs[i % pairs.length];
  return (
    <span className="rc-sans" style={{
      fontSize: 10.5, fontWeight: 800, color: "#fff", padding: "4px 11px", borderRadius: 20,
      background: `linear-gradient(155deg, ${from}, ${to})`,
      boxShadow: `inset 0 1.5px 2px rgba(255,255,255,0.6), inset 0 -3px 5px rgba(0,0,0,0.22), 0 3px 6px -2px ${to}99`,
      textShadow: "0 1px 1px rgba(0,0,0,0.2)",
      display: "inline-block",
    }}>
      {tag}
    </span>
  );
}

function FeaturedCard({ recipe, onOpen }) {
  const Art = COVER_ART[recipe.cover];
  const color = COVER_COLOR[recipe.cover];
  return (
    <div className="rc-pearl-bg" style={{ borderRadius: 24, padding: "10px", marginBottom: 26 }}>
      <button onClick={() => onOpen(recipe)} className="rc-sans rc-card rc-fadeup" style={{ width: "100%", textAlign: "left", background: PALETTE.card, border: `3px solid ${PALETTE.ink}`, borderRadius: 18, overflow: "hidden", cursor: "pointer", padding: 0, boxShadow: `0 14px 26px -10px rgba(50,10,50,0.55)`, transform: "rotate(-0.4deg)" }}>
        <div style={{ height: 150, position: "relative" }}>
          <Art />
          <Sparkle x="14px" y="14px" size={14} delay="0s" />
          <span className="rc-sans" style={{ position: "absolute", top: 12, right: -6, fontSize: 11, fontWeight: 700, letterSpacing: 0.3, color: "#fff", background: PALETTE.ink, padding: "5px 16px", transform: "rotate(4deg)" }}>IN EVIDENZA</span>
        </div>
        <div style={{ padding: "16px 20px 20px" }}>
          <span className="rc-display" style={{ fontSize: 23, fontWeight: 700, color: PALETTE.ink, display: "block" }}>{recipe.title}</span>
          <span className="rc-display-i" style={{ fontSize: 14, color: PALETTE.inkSoft, display: "block", margin: "3px 0 12px" }}>{recipe.subtitle}</span>
        <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginBottom: 10 }}>{recipe.tags.map((t, i) => <TagPill key={t} tag={t} i={i} />)}</div>
        <div style={{ display: "flex", gap: 14, fontSize: 12, color: PALETTE.inkSoft, fontWeight: 600, alignItems: "center" }}>
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Icon name="clock" size={13} color={PALETTE.tomato} />{recipe.time}</span>
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Icon name="users" size={13} color={PALETTE.tomato} />{recipe.baseServings} persone</span>
        </div>
      </div>
    </button>
    </div>
  );
}

function RecipeCard({ recipe, onOpen, idx }) {
  const Art = COVER_ART[recipe.cover];
  const color = COVER_COLOR[recipe.cover];
  const rot = idx % 2 === 0 ? -0.8 : 0.8;
  return (
    <button onClick={() => onOpen(recipe)} className="rc-sans rc-card rc-fadeup" style={{ display: "flex", alignItems: "stretch", width: "100%", textAlign: "left", background: PALETTE.card, border: `2.5px solid ${PALETTE.ink}`, borderRadius: 16, overflow: "hidden", cursor: "pointer", padding: 0, boxShadow: `4px 4px 0 ${color}`, transform: `rotate(${rot}deg)`, animationDelay: `${idx * 0.06 + 0.1}s` }}>
      <div style={{ width: 90, flexShrink: 0, borderRight: `2.5px solid ${PALETTE.ink}` }}><Art /></div>
      <div style={{ padding: "12px 14px", display: "flex", flexDirection: "column", gap: 5, flex: 1, minWidth: 0 }}>
        <span className="rc-display" style={{ fontSize: 16, fontWeight: 700, color: PALETTE.ink }}>{recipe.title}</span>
        <span style={{ fontSize: 12, color: PALETTE.inkSoft }}>{recipe.subtitle}</span>
        <div style={{ display: "flex", gap: 6, marginTop: 2, flexWrap: "wrap" }}>{recipe.tags.map((t, i) => <TagPill key={t} tag={t} i={i} />)}</div>
      </div>
      <div style={{ display: "flex", alignItems: "center", paddingRight: 12 }}>
        <div className="rc-open-btn" style={{
          width: 32, height: 32, borderRadius: "50%",
          background: `radial-gradient(circle at 32% 26%, #fff, ${color} 55%, ${PALETTE.ink} 130%)`,
          boxShadow: "inset 0 1.5px 3px rgba(255,255,255,0.7), inset 0 -3px 4px rgba(0,0,0,0.3), 0 3px 6px -2px rgba(0,0,0,0.4)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round"><path d="M9 6l6 6-6 6" /></svg>
        </div>
      </div>
    </button>
  );
}

function CategoryIcon({ id }) {
  const p = { width: 34, height: 34, viewBox: "0 0 34 34" };
  if (id === "antipasti") {
    return (
      <svg {...p}>
        <path d="M6 20 L16 14 L20 22 L10 28 Z" fill="#F6E4A0" stroke="#fff" strokeWidth="2" strokeLinejoin="round" />
        <circle cx="12" cy="21" r="1.2" fill="#B5730A" />
        <circle cx="15" cy="24" r="1.2" fill="#B5730A" />
        <g className="rc-wiggle" style={{ transformOrigin: "26px 12px" }}>
          <circle cx="24" cy="10" r="2.6" fill="#8B3F9E" stroke="#fff" strokeWidth="1.4" />
          <circle cx="28" cy="12" r="2.6" fill="#8B3F9E" stroke="#fff" strokeWidth="1.4" />
          <circle cx="25" cy="15" r="2.6" fill="#8B3F9E" stroke="#fff" strokeWidth="1.4" />
        </g>
      </svg>
    );
  }
  if (id === "primi") {
    return (
      <svg {...p}>
        <ellipse cx="17" cy="21" rx="13" ry="6" fill="#1B1712" opacity="0.25" />
        <ellipse cx="17" cy="19" rx="12" ry="5.5" fill="#FFFDF7" stroke="#fff" strokeWidth="2" />
        <path d="M17 19 m-8,0 a8,3.4 0 1,0 16,0 a8,3.4 0 1,0 -16,0" fill="none" stroke="#EA4530" strokeWidth="2.2" />
        <rect className="rc-steam" x="15" y="4" width="3.5" height="12" rx="1.7" fill="#fff" opacity="0.8" />
        <rect className="rc-steam" x="21" y="6" width="3.5" height="10" rx="1.7" fill="#fff" opacity="0.8" style={{ animationDelay: "0.5s" }} />
      </svg>
    );
  }
  if (id === "secondi") {
    return (
      <svg {...p}>
        <ellipse cx="17" cy="26" rx="9" ry="2.6" fill="#1B1712" opacity="0.25" />
        <ellipse cx="17" cy="15" rx="9" ry="7" fill="#C97A2E" stroke="#fff" strokeWidth="2.2" />
        <path d="M9 20 Q5 19 4 24 Q8 27 12 23 Z" fill="#C97A2E" stroke="#fff" strokeWidth="1.8" />
        <path className="rc-sizzle" d="M14 6 Q13 3 15 1" stroke="#fff" strokeWidth="1.6" fill="none" strokeLinecap="round" />
        <path className="rc-sizzle" d="M20 6 Q19 3 21 1" stroke="#fff" strokeWidth="1.6" fill="none" strokeLinecap="round" style={{ animationDelay: "0.4s" }} />
      </svg>
    );
  }
  return (
    <svg {...p}>
      <path d="M11 30 L9 18 L25 18 L23 30 Z" fill="#8A5A34" stroke="#fff" strokeWidth="2" strokeLinejoin="round" />
      <path d="M8 18 Q17 8 26 18 Q17 22 8 18 Z" fill="#FBEFD8" stroke="#fff" strokeWidth="2.2" strokeLinejoin="round" />
      <circle cx="17" cy="9" r="2.4" fill="#EA4530" stroke="#fff" strokeWidth="1.4" />
      <g className="rc-twinkle" style={{ animationDelay: "0.3s" }}>
        <path d="M27 8 L28 11 L31 12 L28 13 L27 16 L26 13 L23 12 L26 11 Z" fill="#fff" />
      </g>
    </svg>
  );
}

function FolderCard({ cat, count, onOpen }) {
  return (
    <button onClick={onOpen} className="rc-btn rc-card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", textAlign: "left", height: 108, padding: "14px 16px", borderRadius: 16, border: `2.5px solid ${PALETTE.ink}`, background: cat.color, cursor: "pointer", boxShadow: `4px 4px 0 ${PALETTE.ink}` }}>
      <CategoryIcon id={cat.id} />
      <div>
        <span className="rc-display" style={{ fontSize: 16, fontWeight: 700, color: "#fff", display: "block" }}>{cat.label}</span>
        <span className="rc-sans" style={{ fontSize: 11, color: "rgba(255,255,255,0.85)" }}>{count} {count === 1 ? "ricetta" : "ricette"}</span>
      </div>
    </button>
  );
}

function IngredientRow({ ing, idx, onChange, onToggleLock }) {
  return (
    <div className="rc-sans" style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 12px", background: idx % 2 === 0 ? PALETTE.basilSoft : "transparent", borderRadius: 10, marginBottom: 3 }}>
      <button onClick={() => onToggleLock(ing.id)} className="rc-btn" aria-label={ing.locked ? "Sblocca ingrediente" : "Blocca ingrediente"} style={{ width: 32, height: 32, flexShrink: 0, borderRadius: 9, border: `2px solid ${PALETTE.ink}`, background: ing.locked ? PALETTE.saffron : PALETTE.card, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
        <Icon name={ing.locked ? "lock" : "lockOpen"} size={15} color={ing.locked ? PALETTE.ink : PALETTE.inkSoft} />
      </button>
      <span style={{ flex: 1, fontSize: 14, color: PALETTE.ink, fontWeight: 500 }}>{ing.name}</span>
      <input type="number" value={ing.amount} onChange={(e) => onChange(ing.id, e.target.value)} style={{ width: 62, height: 34, textAlign: "right", border: `2px solid ${PALETTE.ink}`, borderRadius: 9, background: PALETTE.card, fontSize: 14, fontWeight: 700, color: PALETTE.tomatoDeep, padding: "0 8px" }} />
      <span style={{ fontSize: 12, color: PALETTE.inkSoft, width: 26 }}>{ing.unit || ""}</span>
    </div>
  );
}

function StepTimer({ seconds }) {
  const [remaining, setRemaining] = useState(seconds);
  const [running, setRunning] = useState(false);
  const r = 20;
  const circ = 2 * Math.PI * r;
  const ratio = remaining / seconds;
  const color = ratio < 0.2 ? PALETTE.tomato : ratio < 0.5 ? PALETTE.saffron : PALETTE.basil;
  useEffect(() => {
    if (!running || remaining <= 0) return;
    const t = setTimeout(() => setRemaining((v) => v - 1), 1000);
    return () => clearTimeout(t);
  }, [running, remaining]);
  useEffect(() => { if (remaining === 0) setRunning(false); }, [remaining]);
  return (
    <div className="rc-sans" style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 10 }}>
      <svg width="48" height="48" viewBox="0 0 48 48" style={{ flexShrink: 0 }}>
        <circle cx="24" cy="24" r={r} fill="none" stroke={PALETTE.border} strokeWidth="4" />
        <circle cx="24" cy="24" r={r} fill="none" stroke={color} strokeWidth="4" strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={circ * (1 - ratio)} transform="rotate(-90 24 24)" style={{ transition: "stroke-dashoffset 1s linear, stroke .4s ease" }} />
      </svg>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <span className="rc-display" style={{ fontSize: 16, fontWeight: 700, color }}>{fmt(remaining)}</span>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button onClick={() => setRunning((r2) => !r2)} className="rc-btn" disabled={remaining === 0} style={{ fontSize: 12, padding: "5px 13px", borderRadius: 20, border: "none", background: running ? PALETTE.tomatoSoft : PALETTE.basil, color: running ? PALETTE.tomatoDeep : "#fff", cursor: remaining === 0 ? "default" : "pointer", opacity: remaining === 0 ? 0.5 : 1, fontWeight: 700 }}>
            {running ? "Pausa" : remaining === seconds ? "Avvia" : "Riprendi"}
          </button>
          {remaining !== seconds && (
            <button onClick={() => { setRunning(false); setRemaining(seconds); }} className="rc-btn" aria-label="Azzera timer" style={{ background: "transparent", border: "none", color: PALETTE.inkSoft, cursor: "pointer", display: "flex" }}>
              <Icon name="refresh" size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function StepsView({ steps }) {
  const dotColors = [PALETTE.tomato, PALETTE.basil, PALETTE.saffron, PALETTE.plum];
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {steps.map((s, i) => (
        <div key={i} className="rc-sans rc-fadeup" style={{ display: "flex", gap: 13, padding: "13px 0", borderBottom: i < steps.length - 1 ? `2px dotted ${PALETTE.border}` : "none", animationDelay: `${i * 0.06}s` }}>
          <div className="rc-display" style={{ width: 28, height: 28, borderRadius: "50%", background: dotColors[i % 4], color: "#fff", fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, border: `2px solid ${PALETTE.ink}` }}>{i + 1}</div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 14, color: PALETTE.ink, margin: 0, lineHeight: 1.55, fontWeight: 500 }}>{s.text}</p>
            {s.seconds && <StepTimer seconds={s.seconds} />}
          </div>
        </div>
      ))}
    </div>
  );
}

function PhotosView({ photos, onAdd }) {
  const inputRef = useRef(null);
  const rotations = [-6, 4, -3, 5, -4, 3];
  function handleFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => onAdd(reader.result);
    reader.readAsDataURL(file);
    e.target.value = "";
  }
  return (
    <div className="rc-sans">
      <button onClick={() => inputRef.current && inputRef.current.click()} className="rc-btn" style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#fff", background: PALETTE.tomato, border: `2.5px solid ${PALETTE.ink}`, borderRadius: 12, padding: "11px 16px", cursor: "pointer", marginBottom: 18, fontWeight: 700, boxShadow: `3px 3px 0 ${PALETTE.ink}` }}>
        <Icon name="camera" size={16} />
        Aggiungi foto del piatto
      </button>
      <input ref={inputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFile} />
      {photos.length === 0 ? (
        <p style={{ fontSize: 13, color: PALETTE.inkSoft }}>Nessuna foto ancora. La prima che aggiungi diventa la copertina della ricetta.</p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 18, padding: "4px 4px 8px" }}>
          {photos.map((p, i) => (
            <div key={i} className="rc-photo" style={{ background: "#fff", padding: "8px 8px 20px", boxShadow: "0 8px 16px -6px rgba(42,29,16,0.35)", "--rot": `${rotations[i % 6]}deg`, transform: `rotate(${rotations[i % 6]}deg)`, borderRadius: 3, border: `2px solid ${PALETTE.ink}` }}>
              <img src={p} alt="Foto del piatto" style={{ width: "100%", aspectRatio: "1", objectFit: "cover", display: "block" }} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function RecipeDetail({ recipe, onBack, onAddPhoto }) {
  const [tab, setTab] = useState("ingredienti");
  const [servings, setServings] = useState(recipe.baseServings);
  const [ingredients, setIngredients] = useState(recipe.ingredients);
  const Art = COVER_ART[recipe.cover];
  const color = COVER_COLOR[recipe.cover];

  function scaleServings(delta) {
    const next = Math.max(1, servings + delta);
    const factor = next / servings;
    setIngredients((prev) => prev.map((ing) => (ing.locked ? ing : { ...ing, amount: round(ing.amount * factor) })));
    setServings(next);
  }
  function handleAmountChange(id, value) {
    const num = parseFloat(value);
    if (isNaN(num) || num <= 0) return;
    const current = ingredients.find((i) => i.id === id);
    if (!current || current.amount === 0) return;
    const factor = num / current.amount;
    setIngredients((prev) => prev.map((ing) => (ing.id === id ? { ...ing, amount: num } : ing.locked ? ing : { ...ing, amount: round(ing.amount * factor) })));
  }
  function toggleLock(id) { setIngredients((prev) => prev.map((ing) => (ing.id === id ? { ...ing, locked: !ing.locked } : ing))); }

  const tabs = [{ id: "ingredienti", label: "Ingredienti" }, { id: "passaggi", label: "Passaggi" }, { id: "foto", label: "Foto" }];
  const tabIdx = tabs.findIndex((t) => t.id === tab);

  return (
    <div className="rc-sans rc-fadeup">
      <div style={{ height: 112, borderRadius: 20, overflow: "hidden", position: "relative", marginBottom: 16, border: `3px solid ${PALETTE.ink}` }}>
        {recipe.photos.length > 0 ? <img src={recipe.photos[0]} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <Art />}
        <button onClick={onBack} className="rc-btn" aria-label="Torna alle ricette" style={{ position: "absolute", top: 10, left: 10, width: 32, height: 32, borderRadius: "50%", border: `2px solid ${PALETTE.ink}`, background: "#fff", color: PALETTE.ink, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
          <Icon name="arrowLeft" size={16} />
        </button>
      </div>

      <h2 className="rc-display" style={{ fontSize: 24, fontWeight: 700, color: PALETTE.ink, margin: "0 0 3px" }}>{recipe.title}</h2>
      <p className="rc-display-i" style={{ fontSize: 14, color: PALETTE.inkSoft, margin: "0 0 18px" }}>{recipe.subtitle}</p>

      <div style={{ position: "relative", display: "flex", background: PALETTE.card, borderRadius: 24, padding: 4, marginBottom: 20, border: `2px solid ${PALETTE.ink}` }}>
        <div style={{ position: "absolute", top: 4, bottom: 4, left: 4, width: `calc((100% - 8px) / 3)`, borderRadius: 20, background: color, transform: `translateX(${tabIdx * 100}%)`, transition: "transform .3s cubic-bezier(.3,1,.4,1)" }} />
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ position: "relative", flex: 1, fontSize: 13, padding: "8px 6px", borderRadius: 20, border: "none", background: "transparent", color: tab === t.id ? "#fff" : PALETTE.inkSoft, cursor: "pointer", fontWeight: 700, zIndex: 1, transition: "color .2s ease" }}>{t.label}</button>
        ))}
      </div>

      {tab === "ingredienti" && (
        <>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: PALETTE.basilSoft, borderRadius: 14, padding: "11px 16px", marginBottom: 18, border: `2px solid ${PALETTE.ink}` }}>
            <span style={{ fontSize: 13, color: PALETTE.basilDeep, fontWeight: 700 }}>Persone</span>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <button onClick={() => scaleServings(-1)} className="rc-btn" aria-label="Diminuisci porzioni" style={{ width: 28, height: 28, borderRadius: "50%", border: `2px solid ${PALETTE.ink}`, background: PALETTE.card, color: PALETTE.basilDeep, cursor: "pointer", fontWeight: 700 }}>−</button>
              <span className="rc-display" style={{ fontSize: 17, fontWeight: 700, color: PALETTE.ink, minWidth: 16, textAlign: "center" }}>{servings}</span>
              <button onClick={() => scaleServings(1)} className="rc-btn" aria-label="Aumenta porzioni" style={{ width: 28, height: 28, borderRadius: "50%", border: `2px solid ${PALETTE.ink}`, background: PALETTE.card, color: PALETTE.basilDeep, cursor: "pointer", fontWeight: 700 }}>+</button>
            </div>
          </div>
          <p style={{ fontSize: 12, color: PALETTE.inkSoft, margin: "0 0 8px" }}>Modifica un ingrediente e gli altri si aggiornano da soli. Blocca quelli che non vuoi scalare.</p>
          <div>{ingredients.map((ing, idx) => <IngredientRow key={ing.id} ing={ing} idx={idx} onChange={handleAmountChange} onToggleLock={toggleLock} />)}</div>
        </>
      )}
      {tab === "passaggi" && <StepsView steps={recipe.steps} />}
      {tab === "foto" && <PhotosView photos={recipe.photos} onAdd={(url) => onAddPhoto(recipe.id, url)} />}
    </div>
  );
}

function ChatBubble({ m, i }) {
  const mine = m.from === "me";
  return (
    <div className="rc-fadeup" style={{ alignSelf: mine ? "flex-end" : "flex-start", maxWidth: "78%", background: mine ? PALETTE.tomato : PALETTE.card, border: `2px solid ${PALETTE.ink}`, borderRadius: mine ? "16px 16px 4px 16px" : "16px 16px 16px 4px", padding: "10px 14px", animationDelay: `${i * 0.05}s` }}>
      <p style={{ fontSize: 14, color: mine ? "#fff" : PALETTE.ink, margin: 0, fontWeight: 500 }}>{m.text}</p>
      <p style={{ fontSize: 10, color: mine ? "rgba(255,255,255,0.85)" : PALETTE.inkSoft, margin: "4px 0 0" }}>{m.time}</p>
    </div>
  );
}

function ChatPanel({ messages, onSend }) {
  const [draft, setDraft] = useState("");
  function send() {
    const text = draft.trim();
    if (!text) return;
    onSend(text);
    setDraft("");
  }
  return (
    <div className="rc-sans" style={{ display: "flex", flexDirection: "column", gap: 10, padding: "4px 0 8px" }}>
      {messages.map((m, i) => <ChatBubble key={i} m={m} i={i} />)}
      <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
        <input value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} placeholder="Scrivi un messaggio" style={{ flex: 1, height: 42, borderRadius: 21, border: `2px solid ${PALETTE.ink}`, background: PALETTE.card, padding: "0 16px", fontSize: 14, color: PALETTE.ink }} />
        <button onClick={send} className="rc-btn" aria-label="Invia messaggio" style={{ width: 42, height: 42, borderRadius: "50%", border: `2px solid ${PALETTE.ink}`, background: PALETTE.tomato, color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Icon name="arrowUp" size={17} />
        </button>
      </div>
    </div>
  );
}

function CoverPicker({ value, onChange }) {
  return (
    <div>
      <span className="rc-sans" style={{ fontSize: 12, fontWeight: 700, color: PALETTE.inkSoft }}>Copertina</span>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginTop: 8, maxHeight: 220, overflowY: "auto" }}>
        {Object.keys(COVER_ART).map((key) => {
          const Art = COVER_ART[key];
          const selected = value === key;
          return (
            <button key={key} onClick={() => onChange(key)} className="rc-btn" aria-label={COVER_LABELS[key]} style={{ height: 46, borderRadius: 10, overflow: "hidden", border: selected ? `3px solid ${PALETTE.ink}` : `2px solid ${PALETTE.border}`, padding: 0, cursor: "pointer", opacity: selected ? 1 : 0.75 }}>
              <Art />
            </button>
          );
        })}
      </div>
      <p style={{ fontSize: 11, color: PALETTE.inkSoft, margin: "6px 0 0" }}>{COVER_LABELS[value]}</p>
    </div>
  );
}

function parseRicetteFile(testo) {
  const blocchi = testo.split(/^\s*===\s*$/m).map((b) => b.trim()).filter(Boolean);
  const ricette = [];

  for (const blocco of blocchi) {
    const righe = blocco.split("\n").map((r) => r.trim());
    const r = { title: "", subtitle: "", time: "", baseServings: 4, category: "primi", cover: "culurgiones", tags: [], ingredients: [], steps: [] };
    let sezione = null;

    for (const riga of righe) {
      if (!riga) continue;
      const basso = riga.toLowerCase();

      if (basso.startsWith("titolo:")) { r.title = riga.slice(7).trim(); sezione = null; continue; }
      if (basso.startsWith("sottotitolo:")) { r.subtitle = riga.slice(12).trim(); sezione = null; continue; }
      if (basso.startsWith("categoria:")) { r.category = riga.slice(10).trim().toLowerCase(); sezione = null; continue; }
      if (basso.startsWith("tempo:")) { r.time = riga.slice(6).trim(); sezione = null; continue; }
      if (basso.startsWith("persone:")) { r.baseServings = parseInt(riga.slice(8).trim(), 10) || 4; sezione = null; continue; }
      if (basso.startsWith("tag:")) { r.tags = riga.slice(4).split(",").map((t) => t.trim()).filter(Boolean); sezione = null; continue; }
      if (basso.startsWith("ingredienti")) { sezione = "ing"; continue; }
      if (basso.startsWith("passaggi")) { sezione = "pas"; continue; }

      if (sezione === "ing" && riga.startsWith("-")) {
        const corpo = riga.slice(1).trim();
        const due = corpo.split(":");
        const nome = (due[0] || "").trim();
        if (!nome) continue;
        const resto = (due[1] || "").trim();
        const m = resto.match(/^([\d.,]+)\s*(.*)$/);
        r.ingredients.push({
          name: nome,
          amount: m ? parseFloat(m[1].replace(",", ".")) || 0 : 0,
          unit: m && m[2] ? m[2].trim() : null,
        });
        continue;
      }

      if (sezione === "pas" && /^\d+[.)]/.test(riga)) {
        const testoPasso = riga.replace(/^\d+[.)]\s*/, "");
        const tm = testoPasso.match(/\(([\d]+)\s*min\)/i);
        r.steps.push({
          text: testoPasso.replace(/\s*\([\d]+\s*min\)/i, "").trim(),
          seconds: tm ? parseInt(tm[1], 10) * 60 : null,
        });
        continue;
      }
    }

    const categorieValide = ["antipasti", "primi", "secondi", "dolci"];
    if (!categorieValide.includes(r.category)) r.category = "primi";
    if (r.title && r.ingredients.length > 0 && r.steps.length > 0) ricette.push(r);
  }

  return ricette;
}

function AddRecipePanel({ onClose, onSave, onSaveMany }) {
  const [mode, setMode] = useState("manuale");
  const [fileText, setFileText] = useState("");
  const [importMsg, setImportMsg] = useState("");
  const fileRef = useRef(null);
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [time, setTime] = useState("");
  const [baseServings, setBaseServings] = useState(4);
  const [category, setCategory] = useState("primi");
  const [tagsText, setTagsText] = useState("");
  const [cover, setCover] = useState("culurgiones");
  const [ingredients, setIngredients] = useState([{ name: "", amount: "", unit: "" }]);
  const [steps, setSteps] = useState([{ text: "", minutes: "" }]);
  const [error, setError] = useState("");

  function updateIng(i, field, value) { setIngredients((prev) => prev.map((row, idx) => (idx === i ? { ...row, [field]: value } : row))); }
  function addIng() { setIngredients((prev) => [...prev, { name: "", amount: "", unit: "" }]); }
  function removeIng(i) { setIngredients((prev) => prev.filter((_, idx) => idx !== i)); }
  function updateStep(i, field, value) { setSteps((prev) => prev.map((row, idx) => (idx === i ? { ...row, [field]: value } : row))); }
  function addStep() { setSteps((prev) => [...prev, { text: "", minutes: "" }]); }
  function removeStep(i) { setSteps((prev) => prev.filter((_, idx) => idx !== i)); }

  function save() {
    if (!title.trim()) { setError("Dai un titolo alla ricetta."); return; }
    const cleanIngredients = ingredients.filter((r) => r.name.trim());
    const cleanSteps = steps.filter((r) => r.text.trim());
    if (cleanIngredients.length === 0) { setError("Aggiungi almeno un ingrediente."); return; }
    if (cleanSteps.length === 0) { setError("Aggiungi almeno un passaggio."); return; }
    setError("");
    onSave({
      title: title.trim(), subtitle: subtitle.trim(), time: time.trim(), baseServings: parseInt(baseServings, 10) || 4, category, cover,
      tags: tagsText.split(",").map((t) => t.trim()).filter(Boolean),
      ingredients: cleanIngredients.map((r) => ({ name: r.name.trim(), amount: parseFloat(r.amount) || 0, unit: r.unit.trim() || null })),
      steps: cleanSteps.map((r) => ({ text: r.text.trim(), seconds: r.minutes ? parseInt(r.minutes, 10) * 60 : null })),
    });
  }

  const inputStyle = { width: "100%", height: 38, border: `2px solid ${PALETTE.ink}`, borderRadius: 10, background: PALETTE.card, padding: "0 12px", fontSize: 13, color: PALETTE.ink, boxSizing: "border-box" };

  function leggiFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setFileText(String(reader.result || ""));
      setImportMsg("");
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  async function importa() {
    const ricette = parseRicetteFile(fileText);
    if (ricette.length === 0) {
      setImportMsg("Non ho trovato ricette valide. Controlla che il file segua il modello (Titolo:, Ingredienti:, Passaggi:, e === tra una ricetta e l'altra).");
      return;
    }
    setImportMsg(`Importo ${ricette.length} ricett${ricette.length === 1 ? "a" : "e"}...`);
    await onSaveMany(ricette);
    onClose();
  }

  return (
    <div className="rc-sans rc-fadeup" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <button onClick={onClose} className="rc-btn" style={{ alignSelf: "flex-start", display: "flex", alignItems: "center", gap: 6, background: "transparent", border: "none", color: PALETTE.inkSoft, fontSize: 13, padding: "6px 0", cursor: "pointer" }}>
        <Icon name="arrowLeft" size={15} /> Ricette
      </button>
      <h2 className="rc-display" style={{ fontSize: 22, fontWeight: 700, color: PALETTE.ink, margin: 0 }}>Nuova ricetta</h2>

      <div style={{ display: "flex", gap: 8 }}>
        {[{ id: "manuale", label: "Scrivi a mano" }, { id: "file", label: "Importa da file" }].map((t) => (
          <button key={t.id} onClick={() => setMode(t.id)} className="rc-btn" style={{ flex: 1, fontSize: 13, padding: "9px 6px", borderRadius: 12, border: `2px solid ${PALETTE.ink}`, background: mode === t.id ? PALETTE.tomato : PALETTE.card, color: mode === t.id ? "#fff" : PALETTE.ink, cursor: "pointer", fontWeight: 700 }}>
            {t.label}
          </button>
        ))}
      </div>

      {mode === "file" && (
        <>
          <p style={{ fontSize: 13, color: PALETTE.inkSoft, margin: 0, lineHeight: 1.5 }}>
            Scegli il file di testo compilato con il modello, oppure incolla direttamente il contenuto qui sotto.
          </p>
          <button onClick={() => fileRef.current && fileRef.current.click()} className="rc-btn" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "11px 16px", borderRadius: 12, border: `2.5px solid ${PALETTE.ink}`, background: PALETTE.basil, color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", boxShadow: `3px 3px 0 ${PALETTE.ink}` }}>
            Scegli file
          </button>
          <input ref={fileRef} type="file" accept=".txt,text/plain" style={{ display: "none" }} onChange={leggiFile} />
          <textarea value={fileText} onChange={(e) => setFileText(e.target.value)} placeholder={"Titolo: ...\nCategoria: primi\n\nIngredienti:\n- Farina: 300 g\n\nPassaggi:\n1. ... (10 min)\n\n==="} rows={8} style={{ width: "100%", border: `2px solid ${PALETTE.ink}`, borderRadius: 12, background: PALETTE.card, padding: "12px 14px", fontSize: 12.5, color: PALETTE.ink, resize: "vertical", boxSizing: "border-box", fontFamily: "monospace" }} />
          {importMsg && <p style={{ fontSize: 12.5, color: PALETTE.tomatoDeep, margin: 0, fontWeight: 600 }}>{importMsg}</p>}
          <button onClick={importa} className="rc-btn" style={{ fontSize: 14, padding: "12px 16px", borderRadius: 14, border: `2.5px solid ${PALETTE.ink}`, background: PALETTE.tomato, color: "#fff", cursor: "pointer", fontWeight: 700, boxShadow: `3px 3px 0 ${PALETTE.ink}` }}>
            Importa ricette
          </button>
        </>
      )}

      {mode === "manuale" && (
        <>
      <CoverPicker value={cover} onChange={setCover} />

      <input placeholder="Titolo della ricetta" value={title} onChange={(e) => setTitle(e.target.value)} style={inputStyle} />
      <input placeholder="Sottotitolo (facoltativo)" value={subtitle} onChange={(e) => setSubtitle(e.target.value)} style={inputStyle} />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <input placeholder="Tempo (es. 45 min)" value={time} onChange={(e) => setTime(e.target.value)} style={inputStyle} />
        <input type="number" placeholder="Persone" value={baseServings} onChange={(e) => setBaseServings(e.target.value)} style={inputStyle} />
      </div>

      <div>
        <span style={{ fontSize: 12, fontWeight: 700, color: PALETTE.inkSoft }}>Categoria</span>
        <div style={{ display: "flex", gap: 6, marginTop: 6, flexWrap: "wrap" }}>
          {CATEGORIES.map((c) => (
            <button key={c.id} onClick={() => setCategory(c.id)} className="rc-btn" style={{ fontSize: 12, padding: "6px 12px", borderRadius: 20, border: `2px solid ${PALETTE.ink}`, background: category === c.id ? c.color : PALETTE.card, color: category === c.id ? "#fff" : PALETTE.ink, cursor: "pointer", fontWeight: 700 }}>{c.label}</button>
          ))}
        </div>
      </div>

      <input placeholder="Tag separati da virgola (es. sardo, veloce)" value={tagsText} onChange={(e) => setTagsText(e.target.value)} style={inputStyle} />

      <div>
        <span style={{ fontSize: 12, fontWeight: 700, color: PALETTE.inkSoft }}>Ingredienti</span>
        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 6 }}>
          {ingredients.map((row, i) => (
            <div key={i} style={{ display: "flex", gap: 6 }}>
              <input placeholder="Ingrediente" value={row.name} onChange={(e) => updateIng(i, "name", e.target.value)} style={{ ...inputStyle, flex: 2 }} />
              <input type="number" placeholder="Q.tà" value={row.amount} onChange={(e) => updateIng(i, "amount", e.target.value)} style={{ ...inputStyle, flex: 1 }} />
              <input placeholder="Unità" value={row.unit} onChange={(e) => updateIng(i, "unit", e.target.value)} style={{ ...inputStyle, flex: 1 }} />
              <button onClick={() => removeIng(i)} className="rc-btn" aria-label="Rimuovi ingrediente" style={{ width: 38, height: 38, borderRadius: 10, border: `2px solid ${PALETTE.border}`, background: PALETTE.card, color: PALETTE.inkSoft, cursor: "pointer", flexShrink: 0 }}><Icon name="x" size={14} /></button>
            </div>
          ))}
        </div>
        <button onClick={addIng} className="rc-btn" style={{ marginTop: 8, fontSize: 12, padding: "7px 12px", borderRadius: 10, border: `2px dashed ${PALETTE.border}`, background: "transparent", color: PALETTE.inkSoft, cursor: "pointer", fontWeight: 600 }}>+ Aggiungi ingrediente</button>
      </div>

      <div>
        <span style={{ fontSize: 12, fontWeight: 700, color: PALETTE.inkSoft }}>Passaggi</span>
        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 6 }}>
          {steps.map((row, i) => (
            <div key={i} style={{ display: "flex", gap: 6 }}>
              <input placeholder={`Passaggio ${i + 1}`} value={row.text} onChange={(e) => updateStep(i, "text", e.target.value)} style={{ ...inputStyle, flex: 3 }} />
              <input type="number" placeholder="Min" value={row.minutes} onChange={(e) => updateStep(i, "minutes", e.target.value)} style={{ ...inputStyle, flex: 1 }} />
              <button onClick={() => removeStep(i)} className="rc-btn" aria-label="Rimuovi passaggio" style={{ width: 38, height: 38, borderRadius: 10, border: `2px solid ${PALETTE.border}`, background: PALETTE.card, color: PALETTE.inkSoft, cursor: "pointer", flexShrink: 0 }}><Icon name="x" size={14} /></button>
            </div>
          ))}
        </div>
        <button onClick={addStep} className="rc-btn" style={{ marginTop: 8, fontSize: 12, padding: "7px 12px", borderRadius: 10, border: `2px dashed ${PALETTE.border}`, background: "transparent", color: PALETTE.inkSoft, cursor: "pointer", fontWeight: 600 }}>+ Aggiungi passaggio</button>
      </div>

      {error && <p style={{ fontSize: 12, color: PALETTE.tomato, margin: 0, fontWeight: 600 }}>{error}</p>}
      <button onClick={save} className="rc-btn" style={{ fontSize: 14, padding: "12px 16px", borderRadius: 14, border: `2.5px solid ${PALETTE.ink}`, background: PALETTE.tomato, color: "#fff", cursor: "pointer", fontWeight: 700, boxShadow: `3px 3px 0 ${PALETTE.ink}` }}>Salva nel ricettario</button>
        </>
      )}
    </div>
  );
}

function SharedWith({ name, onSave }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(name);
  if (editing) {
    return (
      <div className="rc-sans" style={{ display: "flex", alignItems: "center", gap: 6, margin: "2px 0 14px" }}>
        <input autoFocus value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (onSave(draft.trim()), setEditing(false))} placeholder="Nome della persona" style={{ height: 30, borderRadius: 8, border: `2px solid ${PALETTE.ink}`, padding: "0 10px", fontSize: 12, color: PALETTE.ink, width: 140 }} />
        <button onClick={() => { onSave(draft.trim()); setEditing(false); }} className="rc-btn" aria-label="Salva nome" style={{ width: 28, height: 28, borderRadius: "50%", border: `2px solid ${PALETTE.ink}`, background: PALETTE.basil, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}><Icon name="check" size={14} /></button>
      </div>
    );
  }
  return (
    <button onClick={() => { setDraft(name); setEditing(true); }} className="rc-sans rc-btn" style={{ display: "flex", alignItems: "center", gap: 5, margin: "2px 0 14px", background: "transparent", border: "none", cursor: "pointer", color: PALETTE.inkSoft, fontSize: 12, fontWeight: 500, padding: 0 }}>
      <Icon name="users" size={12} />{name ? `Condiviso con ${name}` : "Aggiungi chi condivide con te"}<Icon name="pencil" size={11} color={PALETTE.inkSoft} />
    </button>
  );
}

function SearchBar({ value, onChange }) {
  return (
    <div className="rc-sans" style={{ display: "flex", alignItems: "center", gap: 8, background: PALETTE.card, border: `2px solid ${PALETTE.ink}`, borderRadius: 14, padding: "0 12px", height: 42, marginBottom: 18 }}>
      <Icon name="search" size={16} color={PALETTE.inkSoft} />
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder="Cerca una ricetta..." style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontSize: 14, color: PALETTE.ink, height: "100%" }} />
      {value && <button onClick={() => onChange("")} aria-label="Cancella ricerca" style={{ background: "transparent", border: "none", color: PALETTE.inkSoft, cursor: "pointer", display: "flex" }}><Icon name="x" size={15} /></button>}
    </div>
  );
}

function rowToRecipe(row) {
  return {
    id: row.id,
    title: row.title,
    subtitle: row.subtitle || "",
    time: row.time || "",
    baseServings: row.base_servings || 4,
    category: row.category || "primi",
    cover: row.cover || "culurgiones",
    tags: row.tags || [],
    ingredients: (row.ingredients || []).map((ing, i) => ({ id: `${row.id}_${i}`, ...ing, locked: false })),
    steps: row.steps || [],
    photos: row.photos || [],
  };
}

export default function App() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [view, setView] = useState("list");
  const [tab, setTab] = useState("ricette");
  const [selectedId, setSelectedId] = useState(null);
  const [sharedWith, setSharedWith] = useState("");
  const [openCategory, setOpenCategory] = useState(null);
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState([]);
  const [notifStatus, setNotifStatus] = useState("unknown");
  const [notifDebug, setNotifDebug] = useState("");
  const deviceIdRef = useRef(getDeviceId());

  useEffect(() => {
    const deviceId = deviceIdRef.current;

    async function load() {
      const { data, error } = await supabase.from("recipes").select("*").order("created_at", { ascending: false });
      if (error) { setLoadError("Non riesco a caricare le ricette. Controlla la connessione."); setLoading(false); return; }
      setRecipes((data || []).map(rowToRecipe));
      setLoading(false);
    }
    load();

    async function loadMessages() {
      const { data } = await supabase.from("messages").select("*").order("created_at", { ascending: true });
      setMessages((data || []).map((m) => ({ id: m.id, from: m.device_id === deviceId ? "me" : "them", text: m.text, time: new Date(m.created_at).toLocaleString("it-IT", { hour: "2-digit", minute: "2-digit" }) })));
    }
    loadMessages();

    const channel = supabase
      .channel("messages-realtime")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, (payload) => {
        const m = payload.new;
        setMessages((prev) => (prev.some((x) => x.id === m.id) ? prev : [...prev, { id: m.id, from: m.device_id === deviceId ? "me" : "them", text: m.text, time: new Date(m.created_at).toLocaleString("it-IT", { hour: "2-digit", minute: "2-digit" }) }]));
      })
      .subscribe();

    window.OneSignalDeferred = window.OneSignalDeferred || [];
    window.OneSignalDeferred.push(async (OneSignal) => {
      try {
        await OneSignal.init({ appId: ONESIGNAL_APP_ID });
        await OneSignal.User.addTag("device_id", deviceId);
        const enabled = OneSignal.Notifications.permission;
        setNotifStatus(enabled ? "attive" : "da attivare");
        const regs = await (navigator.serviceWorker ? navigator.serviceWorker.getRegistrations() : []);
        setNotifDebug(`init ok — permesso: ${enabled} — service worker registrati: ${regs.length} — scope: ${regs.map((r) => r.scope).join(", ") || "nessuno"}`);
      } catch (e) {
        setNotifStatus("non disponibile");
        setNotifDebug("Errore init: " + (e && e.message ? e.message : String(e)));
      }
    });

    return () => { supabase.removeChannel(channel); };
  }, []);

  async function enableNotifications() {
    window.OneSignalDeferred = window.OneSignalDeferred || [];
    window.OneSignalDeferred.push(async (OneSignal) => {
      try {
        await OneSignal.Notifications.requestPermission();
        await OneSignal.User.addTag("device_id", deviceIdRef.current);
        setNotifStatus(OneSignal.Notifications.permission ? "attive" : "rifiutate");
        await new Promise((r) => setTimeout(r, 1500));
        const regs = await (navigator.serviceWorker ? navigator.serviceWorker.getRegistrations() : []);
        setNotifDebug((prev) => prev + " — DOPO attivazione: permesso=" + OneSignal.Notifications.permission + " — service worker ora registrati: " + regs.length + " — scope: " + (regs.map((r) => r.scope).join(", ") || "nessuno"));
      } catch (e) {
        setNotifDebug("Errore attivazione: " + (e && e.message ? e.message : String(e)));
      }
    });
  }

  const selected = recipes.find((r) => r.id === selectedId) || null;
  const featured = recipes[0];

  function openRecipe(r) { setSelectedId(r.id); setView("detail"); }
  function backToList() { setView("list"); setSelectedId(null); }

  async function addPhoto(recipeId, url) {
    const recipe = recipes.find((r) => r.id === recipeId);
    if (!recipe) return;
    const nextPhotos = [...recipe.photos, url];
    setRecipes((prev) => prev.map((r) => (r.id === recipeId ? { ...r, photos: nextPhotos } : r)));
    await supabase.from("recipes").update({ photos: nextPhotos }).eq("id", recipeId);
  }

  async function saveNewRecipe(data) {
    const { data: inserted, error } = await supabase
      .from("recipes")
      .insert({
        title: data.title, subtitle: data.subtitle, time: data.time, base_servings: data.baseServings,
        category: data.category, cover: data.cover, tags: data.tags, ingredients: data.ingredients, steps: data.steps, photos: [],
      })
      .select()
      .single();
    if (error || !inserted) return;
    setRecipes((prev) => [rowToRecipe(inserted), ...prev]);
    setView("list");
  }

  async function saveManyRecipes(lista) {
    const righe = lista.map((data) => ({
      title: data.title, subtitle: data.subtitle, time: data.time, base_servings: data.baseServings,
      category: data.category, cover: data.cover, tags: data.tags, ingredients: data.ingredients, steps: data.steps, photos: [],
    }));
    const { data: inserted, error } = await supabase.from("recipes").insert(righe).select();
    if (error || !inserted) return;
    setRecipes((prev) => [...inserted.map(rowToRecipe), ...prev]);
    setView("list");
  }

  async function sendMessage(text) {
    await supabase.from("messages").insert({ sender: "me", text, device_id: deviceIdRef.current });
  }

  const searchResults = query.trim() ? recipes.filter((r) => r.title.toLowerCase().includes(query.trim().toLowerCase())) : [];
  const openCat = CATEGORIES.find((c) => c.id === openCategory);
  const catRecipes = openCategory ? recipes.filter((r) => r.category === openCategory) : [];

  return (
    <div style={{ background: PALETTE.bg, minHeight: 500, borderRadius: 24, padding: "18px 18px 0", maxWidth: 380, margin: "0 auto", position: "relative", overflow: "hidden" }}>
      {FONTS}
      <Blob color={PALETTE.tomato} size={90} top="-20px" left="-20px" delay="0s" />
      <Blob color={PALETTE.saffron} size={70} top="150px" left="300px" delay="1.5s" />
      <Blob color={PALETTE.basil} size={60} top="420px" left="-10px" delay="3s" />
      <ChefHatDoodle top="4px" left="150px" color={PALETTE.saffron} rot={-8} delay="0s" />
      <WhiskDoodle top="180px" left="320px" color={PALETTE.tomato} rot={10} delay="0.6s" />

      <div style={{ position: "relative" }}>
        {view === "list" && tab === "ricette" && (
          <>
            <h1 className="rc-display" style={{ fontSize: 29, fontWeight: 700, color: PALETTE.ink, margin: "10px 0 4px" }}>Il nostro ricettario</h1>
            <SharedWith name={sharedWith} onSave={setSharedWith} />
            <SearchBar value={query} onChange={setQuery} />

            <button onClick={() => setView("add")} className="rc-btn rc-pulse" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%", padding: "13px 16px", borderRadius: 16, border: `2.5px solid ${PALETTE.ink}`, background: PALETTE.tomato, color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", marginBottom: 22, boxShadow: `4px 4px 0 ${PALETTE.saffron}` }}>
              <Icon name="plus" size={18} />
              Nuova ricetta
            </button>

            {loading && <p className="rc-sans" style={{ fontSize: 13, color: PALETTE.inkSoft }}>Carico le ricette...</p>}
            {loadError && <p className="rc-sans" style={{ fontSize: 13, color: PALETTE.tomato, fontWeight: 600 }}>{loadError}</p>}
            {!loading && !loadError && recipes.length === 0 && <p className="rc-sans" style={{ fontSize: 13, color: PALETTE.inkSoft }}>Nessuna ricetta ancora. Aggiungi la prima!</p>}
            {!loading && recipes.length > 0 && (query.trim() ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 12, paddingBottom: 24 }}>
                <span className="rc-sans" style={{ fontSize: 12, color: PALETTE.inkSoft, fontWeight: 600 }}>{searchResults.length} risultat{searchResults.length === 1 ? "o" : "i"}</span>
                {searchResults.map((r, i) => <RecipeCard key={r.id} recipe={r} onOpen={openRecipe} idx={i} />)}
              </div>
            ) : (
              <>
                <FeaturedCard recipe={featured} onOpen={openRecipe} />
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 12, paddingBottom: 24 }}>
                  {CATEGORIES.map((cat) => (
                    <FolderCard key={cat.id} cat={cat} count={recipes.filter((r) => r.category === cat.id).length} onOpen={() => { setOpenCategory(cat.id); setView("category"); }} />
                  ))}
                </div>
              </>
            ))}
          </>
        )}

        {view === "category" && openCat && (
          <div className="rc-fadeup">
            <button onClick={() => setView("list")} className="rc-btn" style={{ display: "flex", alignItems: "center", gap: 6, background: "transparent", border: "none", color: PALETTE.inkSoft, fontSize: 13, padding: "6px 0 14px", cursor: "pointer" }}>
              <Icon name="arrowLeft" size={15} /> Ricette
            </button>
            <h2 className="rc-display" style={{ fontSize: 24, fontWeight: 700, color: PALETTE.ink, margin: "0 0 16px", display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 12, height: 12, borderRadius: "50%", background: openCat.color, border: `2px solid ${PALETTE.ink}` }} />
              {openCat.label}
            </h2>
            {catRecipes.length === 0 ? (
              <p style={{ fontSize: 13, color: PALETTE.inkSoft }}>Ancora nessuna ricetta qui.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12, paddingBottom: 24 }}>
                {catRecipes.map((r, i) => <RecipeCard key={r.id} recipe={r} onOpen={openRecipe} idx={i} />)}
              </div>
            )}
          </div>
        )}

        {view === "add" && <AddRecipePanel onClose={() => setView("list")} onSave={saveNewRecipe} onSaveMany={saveManyRecipes} />}
        {view === "detail" && selected && <RecipeDetail recipe={selected} onBack={backToList} onAddPhoto={addPhoto} />}

        {tab === "chat" && view === "list" && (
          <>
            <h1 className="rc-display" style={{ fontSize: 27, fontWeight: 700, color: PALETTE.ink, margin: "10px 0 10px" }}>Chat</h1>
            {notifStatus !== "attive" && (
              <button
                onClick={enableNotifications}
                className="rc-sans"
                style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "10px 14px", borderRadius: 12, border: "none", background: PALETTE.basilSoft, color: PALETTE.basilDeep, fontSize: 13, fontWeight: 700, cursor: "pointer", marginBottom: 14 }}
              >
                🔔 Attiva notifiche per i nuovi messaggi
              </button>
            )}
            {notifDebug && (
              <div className="rc-sans" style={{ fontSize: 11, color: PALETTE.inkSoft, background: "#fff", border: `1px solid ${PALETTE.border}`, borderRadius: 10, padding: "8px 10px", marginBottom: 14, wordBreak: "break-word" }}>
                {notifDebug}
              </div>
            )}
            <ChatPanel messages={messages} onSend={sendMessage} />
          </>
        )}
      </div>

      <div className="rc-sans" style={{ position: "relative", display: "flex", borderTop: `2px solid ${PALETTE.ink}`, marginTop: 20, padding: "12px 0 16px", gap: 8 }}>
        {[{ id: "ricette", label: "Ricette", icon: "book" }, { id: "chat", label: "Chat", icon: "message" }].map((t) => (
          <button key={t.id} onClick={() => { setTab(t.id); setView("list"); setOpenCategory(null); setQuery(""); }} className="rc-btn" style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, background: "transparent", border: "none", cursor: "pointer", color: tab === t.id ? PALETTE.tomato : PALETTE.inkSoft }}>
            <Icon name={t.icon} size={21} />
            <span style={{ fontSize: 11, fontWeight: tab === t.id ? 700 : 500 }}>{t.label}</span>
            <div style={{ width: 5, height: 5, borderRadius: "50%", background: tab === t.id ? PALETTE.tomato : "transparent", transition: "background .2s ease" }} />
          </button>
        ))}
      </div>
    </div>
  );
}
