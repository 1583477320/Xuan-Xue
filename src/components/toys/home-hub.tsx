"use client";

import { motion } from "framer-motion";

export type ToyMode = "fortune" | "fish" | "daily";

interface HubCard {
  mode: ToyMode;
  emoji: string;
  title: string;
  subtitle: string;
  desc: string;
  tag: string;
  primary?: boolean;
}

const 卡片: HubCard[] = [
  {
    mode: "fortune",
    emoji: "☯",
    title: "命 盘 推 演",
    subtitle: "八字 · 五行 · 命卦",
    desc: "输入生辰，推演你的专属命盘与今日运势，看看天机怎么说。",
    tag: "主打",
    primary: true,
  },
  {
    mode: "fish",
    emoji: "🪘",
    title: "赛 博 木 鱼",
    subtitle: "敲功德 · 摇一卦",
    desc: "敲一敲功德涨一涨，玄学解压；摇一卦，看看此刻的天机吐槽。",
    tag: "解压",
  },
  {
    mode: "daily",
    emoji: "🎋",
    title: "每 日 一 签",
    subtitle: "一天一抽 · 转运",
    desc: "每天一签，上上签锦鲤附体，下下签明天再来，抽完即止。",
    tag: "日常",
  },
];

function HeroBagua() {
  return (
    <svg viewBox="0 0 200 200" className="w-40 h-40 md:w-52 md:h-52 opacity-90">
      <defs>
        <linearGradient id="hub-gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f0d48a" />
          <stop offset="100%" stopColor="#b8860b" />
        </linearGradient>
      </defs>
      <circle cx="100" cy="100" r="88" fill="none" stroke="rgba(212,168,83,0.25)" strokeWidth="1" strokeDasharray="4 6" />
      <circle cx="100" cy="100" r="72" fill="none" stroke="rgba(212,168,83,0.35)" strokeWidth="1.5" />
      {Array.from({ length: 8 }).map((_, i) => {
        const angle = (i * 45 * Math.PI) / 180;
        const x = 100 + Math.cos(angle) * 60;
        const y = 100 + Math.sin(angle) * 60;
        return (
          <g key={i} transform={`translate(${x} ${y}) rotate(${i * 45})`}>
            <line x1="-10" y1="-4" x2="10" y2="-4" stroke="url(#hub-gold)" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="-10" y1="0" x2="10" y2="0" stroke="url(#hub-gold)" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="-10" y1="4" x2={i % 2 === 0 ? "10" : "0"} y2="4" stroke="url(#hub-gold)" strokeWidth="2.5" strokeLinecap="round" />
          </g>
        );
      })}
      <circle cx="100" cy="100" r="46" fill="none" stroke="rgba(212,168,83,0.3)" strokeWidth="1" />
      <path d="M100 54 a23 23 0 0 1 0 46 a23 23 0 0 0 0 46 a23 23 0 0 0 0 -46" fill="url(#hub-gold)" opacity="0.85" />
      <circle cx="100" cy="77" r="6.5" fill="#0a0612" />
      <circle cx="100" cy="123" r="6.5" fill="#f0d48a" />
    </svg>
  );
}

export default function HomeHub({ onSelect }: { onSelect: (mode: ToyMode) => void }) {
  return (
    <motion.div
      className="min-h-screen px-4 py-10 md:py-16 relative z-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, y: -30 }}
      transition={{ duration: 0.6 }}
    >
      <div className="max-w-3xl mx-auto">
        {/* Hero */}
        <div className="text-center mb-12">
          <motion.div
            className="flex justify-center mb-6"
            initial={{ opacity: 0, scale: 0.8, rotate: -20 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            <div className="hero-bagua-ring">
              <HeroBagua />
            </div>
          </motion.div>
          <motion.h1
            className="text-4xl md:text-5xl font-bold golden-text mb-3"
            style={{ letterSpacing: "0.24em" }}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            天 机 阁
          </motion.h1>
          <motion.div
            className="mystical-divider w-40 mx-auto mb-4"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          />
          <motion.p
            className="text-sm md:text-base"
            style={{ color: "rgba(201,184,150,0.6)", letterSpacing: "0.08em" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            传承千年玄学 · 但这次只想让你开心一下
          </motion.p>
        </div>

        {/* 卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {卡片.map((card, i) => (
            <motion.button
              key={card.mode}
              onClick={() => onSelect(card.mode)}
              className={`hub-card text-left ${card.primary ? "hub-card-primary" : ""}`}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.12 }}
              whileHover={{ y: -6 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-start justify-between mb-4">
                <span className="text-4xl">{card.emoji}</span>
                <span
                  className="text-xs px-2 py-0.5 rounded-full"
                  style={{
                    background: card.primary ? "rgba(212,168,83,0.16)" : "rgba(212,168,83,0.08)",
                    border: "1px solid rgba(212,168,83,0.25)",
                    color: "rgba(212,168,83,0.85)",
                  }}
                >
                  {card.tag}
                </span>
              </div>
              <h2 className="text-lg font-bold mb-1" style={{ color: "#f0e6d3", letterSpacing: "0.08em" }}>
                {card.title}
              </h2>
              <p className="text-xs mb-3" style={{ color: "rgba(212,168,83,0.7)", letterSpacing: "0.05em" }}>
                {card.subtitle}
              </p>
              <p className="text-xs leading-relaxed mb-5" style={{ color: "rgba(201,184,150,0.5)" }}>
                {card.desc}
              </p>
              <span className="text-xs font-bold" style={{ color: "#d4a853", letterSpacing: "0.1em" }}>
                进入 →
              </span>
            </motion.button>
          ))}
        </div>

        <motion.p
          className="text-center text-xs mt-10"
          style={{ color: "rgba(154,139,114,0.35)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
        >
          天机阁 · 所有推演仅供娱乐参考，请勿当真
        </motion.p>
      </div>
    </motion.div>
  );
}
