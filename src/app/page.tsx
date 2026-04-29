"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// ==================== 类型定义 ====================
interface FortuneResult {
  name: string;
  gender: string;
  age: number;
  生肖: string;
  天干地支: string;
  四柱八字: { 年柱: string; 月柱: string; 日柱: string; 时柱: string };
  命卦: { name: string; element: string; number: number; description: string };
  五行分布: Record<string, number>;
  五行建议: string;
  总运势: number;
  运势等级: { level: string; desc: string };
  流年运势: {
    事业运: { score: number; description: string };
    财富运: { score: number; description: string };
    感情运: { score: number; description: string };
    健康运: { score: number; description: string };
    学业运: { score: number; description: string };
  };
  每日宜忌: { 宜: string[]; 忌: string[] };
}

// ==================== 常量 ====================
const 时辰列表 = [
  { value: "子", label: "子时 (23:00-01:00)" },
  { value: "丑", label: "丑时 (01:00-03:00)" },
  { value: "寅", label: "寅时 (03:00-05:00)" },
  { value: "卯", label: "卯时 (05:00-07:00)" },
  { value: "辰", label: "辰时 (07:00-09:00)" },
  { value: "巳", label: "巳时 (09:00-11:00)" },
  { value: "午", label: "午时 (11:00-13:00)" },
  { value: "未", label: "未时 (13:00-15:00)" },
  { value: "申", label: "申时 (15:00-17:00)" },
  { value: "酉", label: "酉时 (17:00-19:00)" },
  { value: "戌", label: "戌时 (19:00-21:00)" },
  { value: "亥", label: "亥时 (21:00-23:00)" },
];

const 占卜短语 = [
  "天机正在运转...",
  "八字排盘中...",
  "推演五行生克...",
  "卦象显现中...",
  "紫微斗数推演...",
  "天命已定...",
];

const 八卦符文 = ["乾", "坤", "震", "巽", "坎", "离", "艮", "兑"];

const 五行配置: Record<string, { color: string; gradient: string; bg: string }> = {
  金: { color: "#f0d48a", gradient: "from-yellow-500 to-amber-600", bg: "bg-amber-500/20" },
  木: { color: "#4ade80", gradient: "from-green-500 to-emerald-600", bg: "bg-green-500/20" },
  水: { color: "#60a5fa", gradient: "from-cyan-400 to-teal-600", bg: "bg-cyan-500/20" },
  火: { color: "#f87171", gradient: "from-red-500 to-orange-600", bg: "bg-red-500/20" },
  土: { color: "#d4a853", gradient: "from-amber-600 to-yellow-800", bg: "bg-amber-700/20" },
};

const 运势图标: Record<string, string> = {
  事业运: "💼",
  财富运: "💰",
  感情运: "💕",
  健康运: "🏥",
  学业运: "📚",
};

// ==================== 背景粒子组件 ====================
function FloatingParticles() {
  const particles = useMemo(
    () =>
      Array.from({ length: 30 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        size: Math.random() * 3 + 1,
        duration: Math.random() * 15 + 10,
        delay: Math.random() * 15,
        opacity: Math.random() * 0.5 + 0.1,
      })),
    []
  );

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {particles.map((p) => (
        <div
          key={p.id}
          className="particle"
          style={{
            left: `${p.left}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            background: `radial-gradient(circle, rgba(212,168,83,${p.opacity}), transparent)`,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  );
}

// ==================== 八卦 SVG 图案 ====================
function BaguaSymbol({ size = 200, className = "" }: { size?: number; className?: string }) {
  const center = size / 2;
  const outerR = size * 0.45;
  const innerR = size * 0.08;

  // 八卦卦象线条（乾三连、坤六断等）
  const trigrams = [
    [1, 1, 1], // 乾
    [0, 0, 0], // 坤
    [0, 0, 1], // 震
    [1, 1, 0], // 巽
    [0, 1, 0], // 坎
    [1, 0, 1], // 离
    [1, 0, 0], // 艮
    [0, 1, 1], // 兑
  ];

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className={className}>
      {/* 外圈光环 */}
      <circle cx={center} cy={center} r={outerR} fill="none" stroke="rgba(212,168,83,0.3)" strokeWidth="1.5" />
      <circle cx={center} cy={center} r={outerR - 3} fill="none" stroke="rgba(212,168,83,0.15)" strokeWidth="0.5" />

      {/* 太极阴阳图 */}
      <g>
        <circle cx={center} cy={center} r={outerR * 0.38} fill="#1a0f2e" stroke="rgba(212,168,83,0.5)" strokeWidth="1" />
        {/* 白色（阳）半 */}
        <path
          d={`M ${center} ${center - outerR * 0.38} A ${outerR * 0.38} ${outerR * 0.38} 0 0 1 ${center} ${center + outerR * 0.38} A ${outerR * 0.19} ${outerR * 0.19} 0 0 1 ${center} ${center} A ${outerR * 0.19} ${outerR * 0.19} 0 0 0 ${center} ${center - outerR * 0.38}`}
          fill="rgba(212,168,83,0.2)"
        />
        {/* 小圆点 */}
        <circle cx={center} cy={center - outerR * 0.19} r={innerR * 0.6} fill="rgba(212,168,83,0.5)" />
        <circle cx={center} cy={center + outerR * 0.19} r={innerR * 0.6} fill="#1a0f2e" stroke="rgba(212,168,83,0.3)" strokeWidth="0.5" />
      </g>

      {/* 八卦符号 */}
      {trigrams.map((trigram, i) => {
        const angle = (i * 45 - 90) * (Math.PI / 180);
        const dist = outerR * 0.7;
        const tx = center + Math.cos(angle) * dist;
        const ty = center + Math.sin(angle) * dist;
        const lineW = 8;
        const lineH = 2;
        const gap = 5;

        return (
          <g key={i} transform={`translate(${tx}, ${ty}) rotate(${i * 45})`}>
            {trigram.map((line, j) => (
              <g key={j} transform={`translate(0, ${j * gap - gap})`}>
                {line === 1 ? (
                  <rect x={-lineW / 2} y={-lineH / 2} width={lineW} height={lineH} fill="rgba(212,168,83,0.7)" rx="0.5" />
                ) : (
                  <>
                    <rect x={-lineW / 2} y={-lineH / 2} width={lineW * 0.4} height={lineH} fill="rgba(212,168,83,0.7)" rx="0.5" />
                    <rect x={lineW * 0.1} y={-lineH / 2} width={lineW * 0.4} height={lineH} fill="rgba(212,168,83,0.7)" rx="0.5" />
                  </>
                )}
              </g>
            ))}
            {/* 卦名 */}
            <text
              x={0}
              y={gap * 2 + 4}
              textAnchor="middle"
              fill="rgba(212,168,83,0.6)"
              fontSize="9"
              transform={`rotate(-${i * 45})`}
              style={{ fontFamily: "serif" }}
            >
              {八卦符文[i]}
            </text>
          </g>
        );
      })}

      {/* 装饰圆环 */}
      <circle cx={center} cy={center} r={outerR * 0.55} fill="none" stroke="rgba(212,168,83,0.1)" strokeWidth="0.5" strokeDasharray="3 5" />
    </svg>
  );
}

// ==================== 圆形进度指示器 ====================
function CircularProgress({ value, size = 140, strokeWidth = 8 }: { value: number; size?: number; strokeWidth?: number }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  const getColor = (v: number) => {
    if (v >= 80) return "#d4a853";
    if (v >= 60) return "#c9956b";
    if (v >= 40) return "#9a8b72";
    return "#7a6b52";
  };

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        {/* 背景圆 */}
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(212,168,83,0.1)" strokeWidth={strokeWidth} />
        {/* 进度圆 */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={getColor(value)}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 2, ease: "easeOut" }}
          style={{ filter: `drop-shadow(0 0 6px ${getColor(value)}60)` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          className="golden-text text-4xl font-bold"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          {value}
        </motion.span>
        <span className="text-xs mt-1" style={{ color: "rgba(201,184,150,0.6)" }}>
          综合运势
        </span>
      </div>
    </div>
  );
}

// ==================== 五行柱状图 ====================
function FiveElementsChart({ distribution }: { distribution: Record<string, number> }) {
  return (
    <div className="space-y-3">
      {Object.entries(distribution).map(([element, value], i) => {
        const config = 五行配置[element];
        return (
          <motion.div
            key={element}
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8 + i * 0.15 }}
          >
            <span className="text-sm font-medium w-8 text-center" style={{ color: config.color }}>
              {element}
            </span>
            <div className="flex-1 h-5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.05)" }}>
              <motion.div
                className="h-full rounded-full fortune-bar-fill relative overflow-hidden"
                initial={{ width: 0 }}
                animate={{ width: `${value}%` }}
                transition={{ delay: 1 + i * 0.15, duration: 1.2, ease: "easeOut" }}
                style={{
                  background: `linear-gradient(90deg, ${config.color}40, ${config.color})`,
                }}
              >
                <div
                  className="absolute inset-0"
                  style={{
                    background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)",
                    animation: "shimmer-line 2s infinite",
                  }}
                />
              </motion.div>
            </div>
            <span className="text-xs w-10 text-right" style={{ color: "rgba(201,184,150,0.7)" }}>
              {value}%
            </span>
          </motion.div>
        );
      })}
    </div>
  );
}

// ==================== 星空背景 ====================
function StarField() {
  const stars = useMemo(
    () =>
      Array.from({ length: 60 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        top: Math.random() * 100,
        size: Math.random() * 2 + 1,
        duration: Math.random() * 4 + 2,
        delay: Math.random() * 5,
      })),
    []
  );
  return (
    <div className="star-field fixed inset-0 pointer-events-none z-0">
      {stars.map((s) => (
        <div
          key={s.id}
          className="star"
          style={{
            left: `${s.left}%`,
            top: `${s.top}%`,
            width: `${s.size}px`,
            height: `${s.size}px`,
            "--duration": `${s.duration}s`,
            "--delay": `${s.delay}s`,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}

// ==================== Hero 区八卦装饰 ====================
function HeroBaguaDecoration() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* 外圈 - 虚线圆环 */}
      <svg className="absolute hero-bagua-ring" style={{ width: "600px", height: "600px", top: "50%", left: "50%", marginTop: "-300px", marginLeft: "-300px", opacity: 0.06 }}>
        <circle cx="300" cy="300" r="280" fill="none" stroke="#d4a853" strokeWidth="0.5" strokeDasharray="4 8" />
      </svg>
      <svg className="absolute hero-bagua-ring-reverse" style={{ width: "450px", height: "450px", top: "50%", left: "50%", marginTop: "-225px", marginLeft: "-225px", opacity: 0.05 }}>
        <circle cx="225" cy="225" r="210" fill="none" stroke="#d4a853" strokeWidth="0.5" strokeDasharray="2 12" />
      </svg>

      {/* 背景大符文 */}
      {八卦符文.map((rune, i) => {
        const angle = (i * 45 - 90) * (Math.PI / 180);
        const dist = 32 + (i % 2) * 6;
        return (
          <motion.span
            key={rune}
            className="absolute hero-bg-rune"
            style={{
              fontSize: "1.6rem",
              fontFamily: "serif",
              color: "rgba(212,168,83,0.12)",
              top: `${50 + Math.sin(angle) * dist}%`,
              left: `${50 + Math.cos(angle) * dist}%`,
              animationDelay: `${i * 0.5}s`,
            }}
          >
            {rune}
          </motion.span>
        );
      })}
    </div>
  );
}

// ==================== 小型标签式输入组 ====================
function MiniInputField({ label, placeholder, value, onChange, error, type = "text" }: {
  label: string; placeholder: string; value: string; onChange: (v: string) => void; error?: string; type?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="mystical-label text-xs">{label}</Label>
      <Input
        type={type}
        className="mystical-input text-sm"
        style={{ padding: "8px 12px" }}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {error && <p className="text-xs" style={{ color: "#c0392b" }}>{error}</p>}
    </div>
  );
}

// ==================== Phase 1: 输入表单（增强版） ====================
function InputPhase({ onSubmit }: { onSubmit: (data: FormData) => void }) {
  const [name, setName] = useState("");
  const [gender, setGender] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [birthHour, setBirthHour] = useState("");
  const [birthPlace, setBirthPlace] = useState("");
  const [bloodType, setBloodType] = useState("");
  const [zodiacSign, setZodiacSign] = useState("");
  const [maritalStatus, setMaritalStatus] = useState("");
  const [education, setEducation] = useState("");
  const [schoolYear, setSchoolYear] = useState("");
  const [occupation, setOccupation] = useState("");
  const [hobby, setHobby] = useState("");
  const [luckyNumber, setLuckyNumber] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showOptional, setShowOptional] = useState(false);

  const validate = useCallback(() => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "请输入姓名";
    if (!gender) e.gender = "请选择性别";
    if (!birthDate) e.birthDate = "请选择出生日期";
    if (!birthHour) e.birthHour = "请选择出生时辰";
    setErrors(e);
    return Object.keys(e).length === 0;
  }, [name, gender, birthDate, birthHour]);

  const handleSubmit = () => {
    if (!validate()) return;
    const fd = new FormData();
    fd.append("name", name.trim());
    fd.append("gender", gender);
    fd.append("birthDate", birthDate);
    fd.append("birthHour", birthHour);
    if (birthPlace) fd.append("birthPlace", birthPlace.trim());
    if (bloodType) fd.append("bloodType", bloodType);
    if (zodiacSign) fd.append("zodiacSign", zodiacSign);
    if (maritalStatus) fd.append("maritalStatus", maritalStatus);
    if (education) fd.append("education", education);
    if (schoolYear) fd.append("schoolYear", schoolYear);
    if (occupation) fd.append("occupation", occupation.trim());
    if (hobby) fd.append("hobby", hobby.trim());
    if (luckyNumber) fd.append("luckyNumber", luckyNumber);
    onSubmit(fd);
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 80 }, (_, i) => currentYear - 60 + i);

  return (
    <motion.div
      className="min-h-screen flex flex-col items-center px-4 pt-6 pb-16 relative z-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, y: -30 }}
      transition={{ duration: 0.6 }}
    >
      <StarField />
      <HeroBaguaDecoration />

      {/* ===== Hero 区 ===== */}
      <motion.div
        className="text-center mb-8 relative"
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 1, ease: "easeOut" }}
      >
        {/* 太极八卦 Logo */}
        <motion.div
          className="mx-auto mb-5 relative"
          style={{ width: 100, height: 100 }}
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.3, duration: 1.2, ease: "easeOut" }}
        >
          <BaguaSymbol size={100} />
          {/* 光晕脉冲 */}
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{
              background: "radial-gradient(circle, rgba(212,168,83,0.15) 0%, transparent 70%)",
              margin: "-30px",
            }}
            animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.div>

        {/* 主标题 */}
        <motion.h1
          className="golden-text mb-2"
          style={{ fontSize: "clamp(2.2rem, 6vw, 3.5rem)", letterSpacing: "0.2em", lineHeight: 1.2 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          天 机 阁
        </motion.h1>

        <motion.div
          className="mystical-divider w-56 mx-auto mb-4"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.7, duration: 0.8 }}
        />

        <motion.p
          className="text-sm md:text-base"
          style={{ color: "rgba(201,184,150,0.55)", letterSpacing: "0.15em" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          八字命理 · 五行生克 · 紫微斗数 · 奇门遁甲
        </motion.p>

        <motion.p
          className="mt-3 text-xs"
          style={{ color: "rgba(201,184,150,0.35)", letterSpacing: "0.08em" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          传承千年玄学智慧，揭示命运隐藏的密码
        </motion.p>
      </motion.div>

      {/* ===== 表单卡片 ===== */}
      <motion.div
        className="oracle-card w-full max-w-xl p-6 md:p-8 relative"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.9, ease: "easeOut" }}
      >
        {/* 装饰角 */}
        <div className="corner-ornament corner-tl" />
        <div className="corner-ornament corner-tr" />
        <div className="corner-ornament corner-bl" />
        <div className="corner-ornament corner-br" />
        {/* 光束扫过 */}
        <div className="light-sweep" />

        {/* 必填区域 */}
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-5">
            <div className="form-section-title mb-0 border-b-0 pb-0">
              <span className="dot" />
              生辰八字
            </div>
            <span className="section-badge">必填</span>
          </div>

          <div className="space-y-4">
            {/* 姓名 + 性别 一行 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="mystical-label text-xs">姓名</Label>
                <Input
                  className="mystical-input text-sm"
                  style={{ padding: "9px 12px" }}
                  placeholder="请输入您的姓名"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                {errors.name && <p className="text-xs" style={{ color: "#c0392b" }}>{errors.name}</p>}
              </div>
              <div className="space-y-1.5">
                <Label className="mystical-label text-xs">性别</Label>
                <Select value={gender} onValueChange={setGender}>
                  <SelectTrigger className="mystical-input text-sm" style={{ padding: "9px 12px" }}>
                    <SelectValue placeholder="请选择性别" />
                  </SelectTrigger>
                  <SelectContent className="mystical-select">
                    <SelectItem value="男">男 (阳)</SelectItem>
                    <SelectItem value="女">女 (阴)</SelectItem>
                  </SelectContent>
                </Select>
                {errors.gender && <p className="text-xs" style={{ color: "#c0392b" }}>{errors.gender}</p>}
              </div>
            </div>

            {/* 出生日期 + 出生时辰 一行 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="mystical-label text-xs">出生日期</Label>
                <Input
                  type="date"
                  className="mystical-input text-sm"
                  style={{ padding: "9px 12px" }}
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  max={new Date().toISOString().split("T")[0]}
                />
                {errors.birthDate && <p className="text-xs" style={{ color: "#c0392b" }}>{errors.birthDate}</p>}
              </div>
              <div className="space-y-1.5">
                <Label className="mystical-label text-xs">出生时辰</Label>
                <Select value={birthHour} onValueChange={setBirthHour}>
                  <SelectTrigger className="mystical-input text-sm" style={{ padding: "9px 12px" }}>
                    <SelectValue placeholder="请选择时辰" />
                  </SelectTrigger>
                  <SelectContent className="mystical-select">
                    {时辰列表.map((sh) => (
                      <SelectItem key={sh.value} value={sh.value}>
                        {sh.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.birthHour && <p className="text-xs" style={{ color: "#c0392b" }}>{errors.birthHour}</p>}
              </div>
            </div>
          </div>
        </div>

        {/* 展开选填区按钮 */}
        <div className="relative z-10 my-5">
          <div className="mystical-divider" />
          <button
            className="mx-auto mt-4 flex items-center gap-2 text-xs cursor-pointer bg-transparent border-0"
            style={{ color: "rgba(212,168,83,0.6)", letterSpacing: "0.08em" }}
            onClick={() => setShowOptional(!showOptional)}
          >
            <motion.span animate={{ rotate: showOptional ? 180 : 0 }} transition={{ duration: 0.3 }}>
              ▼
            </motion.span>
            {showOptional ? "收起详细信息" : "展开更多详细信息"}
            <span style={{ color: "rgba(212,168,83,0.3)" }}>({showOptional ? "收起" : "可选填"})</span>
          </button>
        </div>

        {/* 选填区域（可展开） */}
        <AnimatePresence>
          {showOptional && (
            <motion.div
              className="relative z-10"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              style={{ overflow: "hidden" }}
            >
              <div className="optional-banner mb-5">
                以下信息可帮助更精准地推演您的命盘，填写越多，解读越详细
              </div>

              {/* 个人特征区 */}
              <div className="flex items-center gap-2 mb-4">
                <div className="form-section-title mb-0 border-b-0 pb-0">
                  <span className="dot" style={{ background: "#c9956b", boxShadow: "0 0 8px rgba(201,149,107,0.5)" }} />
                  个人特征
                </div>
                <span className="section-badge" style={{ borderColor: "rgba(201,149,107,0.2)", color: "rgba(201,149,107,0.7)", background: "rgba(201,149,107,0.08)" }}>
                  选填
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <MiniInputField label="出生地" placeholder="如：北京" value={birthPlace} onChange={setBirthPlace} />
                <div className="space-y-1.5">
                  <Label className="mystical-label text-xs">血型</Label>
                  <Select value={bloodType} onValueChange={setBloodType}>
                    <SelectTrigger className="mystical-input text-sm" style={{ padding: "9px 12px" }}>
                      <SelectValue placeholder="选择血型" />
                    </SelectTrigger>
                    <SelectContent className="mystical-select">
                      {"ABO".split("").map((t) => (
                        <SelectItem key={t} value={t}>{t}型</SelectItem>
                      ))}
                      <SelectItem value="AB">AB型</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="mystical-label text-xs">星座</Label>
                  <Select value={zodiacSign} onValueChange={setZodiacSign}>
                    <SelectTrigger className="mystical-input text-sm" style={{ padding: "9px 12px" }}>
                      <SelectValue placeholder="选择星座" />
                    </SelectTrigger>
                    <SelectContent className="mystical-select">
                      {["白羊座","金牛座","双子座","巨蟹座","狮子座","处女座","天秤座","天蝎座","射手座","摩羯座","水瓶座","双鱼座"].map((z) => (
                        <SelectItem key={z} value={z}>{z}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* 人生经历区 */}
              <div className="flex items-center gap-2 mb-4">
                <div className="form-section-title mb-0 border-b-0 pb-0">
                  <span className="dot" style={{ background: "#4ade80", boxShadow: "0 0 8px rgba(74,222,128,0.5)" }} />
                  人生经历
                </div>
                <span className="section-badge" style={{ borderColor: "rgba(74,222,128,0.2)", color: "rgba(74,222,128,0.7)", background: "rgba(74,222,128,0.08)" }}>
                  选填
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div className="space-y-1.5">
                  <Label className="mystical-label text-xs">婚姻状态</Label>
                  <Select value={maritalStatus} onValueChange={setMaritalStatus}>
                    <SelectTrigger className="mystical-input text-sm" style={{ padding: "9px 12px" }}>
                      <SelectValue placeholder="选择婚姻状态" />
                    </SelectTrigger>
                    <SelectContent className="mystical-select">
                      {["未婚","恋爱中","已婚","离异"].map((m) => (
                        <SelectItem key={m} value={m}>{m}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="mystical-label text-xs">学历</Label>
                  <Select value={education} onValueChange={setEducation}>
                    <SelectTrigger className="mystical-input text-sm" style={{ padding: "9px 12px" }}>
                      <SelectValue placeholder="选择最高学历" />
                    </SelectTrigger>
                    <SelectContent className="mystical-select">
                      {["高中及以下","大专","本科","硕士","博士"].map((e) => (
                        <SelectItem key={e} value={e}>{e}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <MiniInputField label="入学/毕业年份" placeholder="如：2018" value={schoolYear} onChange={setSchoolYear} />
                <MiniInputField label="当前职业" placeholder="如：软件工程师" value={occupation} onChange={setOccupation} />
              </div>

              {/* 兴趣偏好区 */}
              <div className="flex items-center gap-2 mb-4">
                <div className="form-section-title mb-0 border-b-0 pb-0">
                  <span className="dot" style={{ background: "#f87171", boxShadow: "0 0 8px rgba(248,113,113,0.5)" }} />
                  兴趣偏好
                </div>
                <span className="section-badge" style={{ borderColor: "rgba(248,113,113,0.2)", color: "rgba(248,113,113,0.7)", background: "rgba(248,113,113,0.08)" }}>
                  选填
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <MiniInputField label="兴趣爱好" placeholder="如：书法、冥想、旅行" value={hobby} onChange={setHobby} />
                <MiniInputField label="幸运数字" placeholder="如：3、7、9" value={luckyNumber} onChange={setLuckyNumber} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 提交按钮 */}
        <div className="relative z-10 mt-8 flex flex-col items-center gap-4">
          <motion.button
            onClick={handleSubmit}
            className="mystical-button-hero"
            whileTap={{ scale: 0.97 }}
          >
            启 动 天 机 推 演
          </motion.button>
          <p className="text-xs" style={{ color: "rgba(154,139,114,0.35)", letterSpacing: "0.05em" }}>
            仅供娱乐参考，不构成任何决策建议
          </p>
        </div>
      </motion.div>

      {/* 底部信任指标 */}
      <motion.div
        className="mt-8 flex flex-wrap justify-center gap-6 md:gap-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.8 }}
      >
        {[
          { icon: "☯", text: "八卦命理" },
          { icon: "卍", text: "五行生克" },
          { icon: "⚚", text: "紫微斗数" },
          { icon: "◈", text: "奇门遁甲" },
        ].map((item, i) => (
          <motion.div
            key={item.text}
            className="flex items-center gap-2"
            style={{ color: "rgba(201,184,150,0.3)", fontSize: "0.75rem", letterSpacing: "0.05em" }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.4 + i * 0.15 }}
          >
            <span style={{ fontSize: "1rem", color: "rgba(212,168,83,0.35)" }}>{item.icon}</span>
            <span>{item.text}</span>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}

// ==================== Phase 2: 占卜动画 ====================
function DivinationPhase({ onComplete, formData }: { onComplete: (result: FortuneResult) => void; formData: Record<string, string> }) {
  const [phraseIndex, setPhraseIndex] = useState(0);

  // 切换占卜短语
  useEffect(() => {
    const interval = setInterval(() => {
      setPhraseIndex((prev) => (prev + 1) % 占卜短语.length);
    }, 800);
    return () => clearInterval(interval);
  }, []);

  // 调用 API
  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const res = await fetch("/api/fortune", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
          signal: controller.signal,
        });
        if (res.ok) {
          const data = await res.json();
          setTimeout(() => onComplete(data), 800);
        }
      } catch {
        // silent
      }
    }, 4500);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [formData, onComplete]);

  // 浮动符文
  const floatingRunes = useMemo(
    () =>
      八卦符文.map((rune, i) => ({
        rune,
        delay: i * 0.8,
        duration: 4 + i * 0.5,
        distance: 140 + i * 15,
        direction: i % 2 === 0 ? 1 : -1,
      })),
    []
  );

  return (
    <motion.div
      className="min-h-screen flex flex-col items-center justify-center relative z-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* 中心占卜区域 */}
      <div className="relative flex items-center justify-center">
        {/* 光晕背景 */}
        <motion.div
          className="absolute rounded-full"
          style={{
            width: 350,
            height: 350,
            background: "radial-gradient(circle, rgba(212,168,83,0.08) 0%, transparent 70%)",
          }}
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 3, repeat: Infinity }}
        />

        {/* 旋转八卦 */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        >
          <BaguaSymbol size={240} />
        </motion.div>

        {/* 浮动符文 */}
        {floatingRunes.map((item) => (
          <motion.div
            key={item.rune}
            className="absolute text-lg md:text-xl font-bold"
            style={{
              color: "rgba(212,168,83,0.5)",
              textShadow: "0 0 10px rgba(212,168,83,0.3)",
              fontFamily: "serif",
            }}
            animate={{
              rotate: [0, 360 * item.direction],
              translateX: [0, item.distance, 0, -item.distance, 0],
              translateY: [0, -item.distance * 0.5, -item.distance, -item.distance * 0.5, 0],
            }}
            transition={{
              duration: item.duration * 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: item.delay,
            }}
          >
            {item.rune}
          </motion.div>
        ))}
      </div>

      {/* 占卜文字 */}
      <motion.div className="mt-12 text-center" style={{ minHeight: 80 }}>
        <AnimatePresence mode="wait">
          <motion.p
            key={phraseIndex}
            className="text-xl md:text-2xl font-medium golden-text"
            style={{ letterSpacing: "0.2em" }}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4 }}
          >
            {占卜短语[phraseIndex]}
          </motion.p>
        </AnimatePresence>

        <motion.div
          className="mt-6 flex justify-center gap-1.5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 rounded-full"
              style={{ background: "rgba(212,168,83,0.5)" }}
              animate={{ scale: [1, 1.5, 1], opacity: [0.4, 1, 0.4] }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                delay: i * 0.3,
              }}
            />
          ))}
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

// ==================== Phase 3: 命盘结果 ====================
function ResultPhase({ result, onReset }: { result: FortuneResult; onReset: () => void }) {
  const 运势列表 = Object.entries(result.流年运势) as [string, { score: number; description: string }][];

  return (
    <motion.div
      className="min-h-screen px-4 py-8 md:py-12 relative z-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, y: -30 }}
      transition={{ duration: 0.6 }}
    >
      <div className="max-w-3xl mx-auto space-y-6">
        {/* 头部 */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-2xl md:text-3xl font-bold golden-text mb-2" style={{ letterSpacing: "0.1em" }}>
            命 盘 揭 示
          </h2>
          <div className="mystical-divider w-32 mx-auto mb-3" />
          <p style={{ color: "rgba(201,184,150,0.5)", fontSize: "0.85rem" }}>
            {result.name} · {result.gender === "男" ? "男" : "女"} · {result.生肖}年 · {result.age}岁
          </p>
        </motion.div>

        {/* 总运势 */}
        <motion.div
          className="mystical-card glow-card p-6 flex flex-col items-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <CircularProgress value={result.总运势} size={150} strokeWidth={8} />
          <motion.div
            className="mt-4 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <span
              className="text-2xl font-bold"
              style={{
                color: result.总运势 >= 80 ? "#d4a853" : result.总运势 >= 60 ? "#c9956b" : "#9a8b72",
              }}
            >
              {result.运势等级.level}
            </span>
            <p className="text-sm mt-1" style={{ color: "rgba(201,184,150,0.6)" }}>
              {result.运势等级.desc}
            </p>
          </motion.div>
        </motion.div>

        {/* 八字 & 命卦 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 四柱八字 */}
          <motion.div
            className="mystical-card glow-card p-5"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h3 className="golden-text text-lg font-bold mb-4" style={{ letterSpacing: "0.1em" }}>
              四柱八字
            </h3>
            <div className="grid grid-cols-4 gap-3 text-center">
              {Object.entries(result.四柱八字).map(([label, value]) => (
                <div key={label}>
                  <p className="text-xs mb-1" style={{ color: "rgba(201,184,150,0.5)" }}>{label}</p>
                  <p className="text-lg font-bold" style={{ color: "#d4a853" }}>{value}</p>
                </div>
              ))}
            </div>
            <div className="mystical-divider my-3" />
            <div className="flex justify-between text-xs" style={{ color: "rgba(201,184,150,0.5)" }}>
              <span>天干地支: {result.天干地支}</span>
              <span>生肖: {result.生肖}</span>
            </div>
          </motion.div>

          {/* 命卦 */}
          <motion.div
            className="mystical-card glow-card p-5"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h3 className="golden-text text-lg font-bold mb-4" style={{ letterSpacing: "0.1em" }}>
              本 命 卦
            </h3>
            <div className="flex items-center gap-4">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold"
                style={{
                  background: "rgba(212,168,83,0.1)",
                  border: "2px solid rgba(212,168,83,0.3)",
                  color: "#d4a853",
                }}
              >
                {result.命卦.name}
              </div>
              <div>
                <p className="text-sm" style={{ color: "rgba(201,184,150,0.7)" }}>
                  第{result.命卦.number}卦 · {result.命卦.element}行
                </p>
                <p className="text-xs mt-1 leading-relaxed" style={{ color: "rgba(201,184,150,0.5)" }}>
                  {result.命卦.description.slice(0, 40)}...
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* 五行分析 */}
        <motion.div
          className="mystical-card glow-card p-5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h3 className="golden-text text-lg font-bold mb-4" style={{ letterSpacing: "0.1em" }}>
            五行分析
          </h3>
          <FiveElementsChart distribution={result.五行分布} />
          <motion.div
            className="mt-4 p-3 rounded-lg text-xs leading-relaxed"
            style={{ background: "rgba(212,168,83,0.05)", color: "rgba(201,184,150,0.6)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
          >
            💡 {result.五行建议}
          </motion.div>
        </motion.div>

        {/* 流年运势 */}
        <motion.div
          className="mystical-card glow-card p-5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <h3 className="golden-text text-lg font-bold mb-5" style={{ letterSpacing: "0.1em" }}>
            流年运势
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {运势列表.map(([key, data], i) => {
              const config = 五行配置[["", "金", "木", "水", "火", "土"][i] || "土"];
              const getBarColor = (score: number) => {
                if (score >= 80) return "#d4a853";
                if (score >= 60) return "#c9956b";
                return "#9a8b72";
              };

              return (
                <motion.div
                  key={key}
                  className="p-4 rounded-lg"
                  style={{ background: "rgba(15,8,25,0.6)", border: "1px solid rgba(212,168,83,0.1)" }}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 + i * 0.1 }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="flex items-center gap-2">
                      <span className="text-lg">{运势图标[key]}</span>
                      <span className="font-medium text-sm" style={{ color: "rgba(240,230,211,0.9)" }}>{key}</span>
                    </span>
                    <span
                      className="text-sm font-bold"
                      style={{ color: getBarColor(data.score) }}
                    >
                      {data.score}
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full mb-2" style={{ background: "rgba(255,255,255,0.05)" }}>
                    <motion.div
                      className="h-full rounded-full fortune-bar-fill"
                      initial={{ width: 0 }}
                      animate={{ width: `${data.score}%` }}
                      transition={{ delay: 1 + i * 0.1, duration: 1 }}
                      style={{ background: getBarColor(data.score) }}
                    />
                  </div>
                  <p className="text-xs leading-relaxed" style={{ color: "rgba(201,184,150,0.5)" }}>
                    {data.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* 每日宜忌 */}
        <motion.div
          className="mystical-card glow-card p-5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <h3 className="golden-text text-lg font-bold mb-4" style={{ letterSpacing: "0.1em" }}>
            每日宜忌
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* 宜 */}
            <motion.div
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1 }}
            >
              <div className="flex items-center gap-2 mb-3">
                <span
                  className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{ background: "rgba(74,222,128,0.15)", color: "#4ade80" }}
                >
                  宜
                </span>
                <span className="text-sm font-medium" style={{ color: "rgba(240,230,211,0.8)" }}>适宜做的事</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {result.每日宜忌.宜.map((item, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 rounded-full text-xs"
                    style={{
                      background: "rgba(74,222,128,0.08)",
                      border: "1px solid rgba(74,222,128,0.15)",
                      color: "rgba(74,222,128,0.8)",
                    }}
                  >
                    {item}
                  </span>
                ))}
              </div>
            </motion.div>

            {/* 忌 */}
            <motion.div
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.1 }}
            >
              <div className="flex items-center gap-2 mb-3">
                <span
                  className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{ background: "rgba(248,113,113,0.15)", color: "#f87171" }}
                >
                  忌
                </span>
                <span className="text-sm font-medium" style={{ color: "rgba(240,230,211,0.8)" }}>应避免的事</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {result.每日宜忌.忌.map((item, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 rounded-full text-xs"
                    style={{
                      background: "rgba(248,113,113,0.08)",
                      border: "1px solid rgba(248,113,113,0.15)",
                      color: "rgba(248,113,113,0.8)",
                    }}
                  >
                    {item}
                  </span>
                ))}
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* 重新占卜按钮 */}
        <motion.div
          className="flex justify-center pt-4 pb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
        >
          <button onClick={onReset} className="mystical-button">
            重 新 占 卜
          </button>
        </motion.div>

        {/* 页脚 */}
        <div className="text-center pb-4">
          <div className="mystical-divider w-24 mx-auto mb-3" />
          <p className="text-xs" style={{ color: "rgba(154,139,114,0.3)" }}>
            天机阁 · 命理推演仅供娱乐参考
          </p>
        </div>
      </div>
    </motion.div>
  );
}

// ==================== 主页面 ====================
export default function HomePage() {
  const [phase, setPhase] = useState<"input" | "divination" | "result">("input");
  const [fortuneResult, setFortuneResult] = useState<FortuneResult | null>(null);
  const [formJson, setFormJson] = useState<Record<string, string>>({});

  const handleSubmit = useCallback(
    (formData: FormData) => {
      const data: Record<string, string> = {};
      formData.forEach((val, key) => {
        data[key] = val as string;
      });
      setFormJson(data);
      setPhase("divination");
    },
    []
  );

  const handleDivinationComplete = useCallback((result: FortuneResult) => {
    setFortuneResult(result);
    setPhase("result");
  }, []);

  const handleReset = useCallback(() => {
    setFortuneResult(null);
    setFormJson({});
    setPhase("input");
  }, []);

  return (
    <main className="min-h-screen mystical-bg relative overflow-hidden">
      <FloatingParticles />

      <AnimatePresence mode="wait">
        {phase === "input" && (
          <InputPhase key="input" onSubmit={handleSubmit} />
        )}
        {phase === "divination" && (
          <DivinationPhase key="divination" onComplete={handleDivinationComplete} formData={formJson} />
        )}
        {phase === "result" && fortuneResult && (
          <ResultPhase key="result" result={fortuneResult} onReset={handleReset} />
        )}
      </AnimatePresence>
    </main>
  );
}
