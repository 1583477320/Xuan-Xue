"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { playWoodenFish, playGong, playChime, type FishSound } from "@/lib/cyber-audio";

// ==================== 境界 ====================
const 境界列表: { min: number; name: string; desc: string }[] = [
  { min: 0, name: "凡人", desc: "初来乍到，功德未满" },
  { min: 66, name: "初入道门", desc: "手起木落，已入门径" },
  { min: 188, name: "善信", desc: "心诚则灵，功德渐长" },
  { min: 520, name: "居士", desc: "晨钟暮鼓，日课不辍" },
  { min: 1314, name: "道友", desc: "敲得有模有样，仙缘已至" },
  { min: 5200, name: "真人", desc: "一生一世，木鱼不离心" },
  { min: 20000, name: "半仙", desc: "功德加身，半只脚踏入仙界" },
  { min: 100000, name: "大罗金仙", desc: "木鱼敲穿，位列仙班" },
  { min: 1000000, name: "天道本道", desc: "你就是天机阁的服务器" },
];

// ==================== 皮肤商店 ====================
interface Skin {
  id: string;
  name: string;
  price: number;
  desc: string;
  grad: [string, string, string];
  rim: string;
  emoji: string;
}

const 皮肤列表: Skin[] = [
  { id: "wood", name: "原木木鱼", price: 0, desc: "朴实无华，返璞归真", grad: ["#a9662f", "#7c451c", "#4a2710"], rim: "rgba(212,168,83,0.55)", emoji: "" },
  { id: "gold", name: "金玉木鱼", price: 520, desc: "土豪专属，敲的都是钱", grad: ["#f7e3a1", "#d4a853", "#8b6914"], rim: "rgba(240,212,138,0.85)", emoji: "✨" },
  { id: "cat", name: "喵喵木鱼", price: 1314, desc: "敲一下，喵一下", grad: ["#e8c39a", "#c99a6a", "#8a5f3a"], rim: "rgba(240,212,138,0.6)", emoji: "🐱" },
  { id: "neon", name: "赛博木鱼", price: 2888, desc: "RGB 拉满，敲的是代码", grad: ["#6ee7ff", "#a855f7", "#1e1b4b"], rim: "rgba(110,231,255,0.85)", emoji: "🤖" },
  { id: "chaos", name: "混沌木鱼", price: 8888, desc: "敲它，会被天道记住", grad: ["#f87171", "#7c3aed", "#111827"], rim: "rgba(248,113,113,0.8)", emoji: "🌀" },
];

// ==================== 音色商店 ====================
const 音色列表: { id: FishSound; name: string; price: number; desc: string }[] = [
  { id: "wood", name: "原声木鱼", price: 0, desc: "咚——原汁原味" },
  { id: "cat", name: "猫咪咕噜", price: 300, desc: "喵呜～解压加倍" },
  { id: "retro", name: "电子 8-bit", price: 800, desc: "滴滴滴，赛博一下" },
];

// ==================== 成就 ====================
interface Achievement {
  id: string;
  name: string;
  emoji: string;
  desc: string;
  check: (s: FishState) => boolean;
}

const 成就列表: Achievement[] = [
  { id: "first", name: "初尝木鱼", emoji: "🪘", desc: "敲下第一下", check: (s) => s.hits >= 1 },
  { id: "hundred", name: "持之以恒", emoji: "⏳", desc: "累计敲击 100 次", check: (s) => s.hits >= 100 },
  { id: "hand", name: "手速单身二十年", emoji: "⚡", desc: "连击达到 20", check: (s) => s.maxCombo >= 20 },
  { id: "comboGod", name: "连击之神", emoji: "🔥", desc: "连击达到 50", check: (s) => s.maxCombo >= 50 },
  { id: "crit", name: "一夜暴富", emoji: "💰", desc: "触发一次功德暴击", check: (s) => s.crits >= 1 },
  { id: "crit10", name: "暴击十连", emoji: "💥", desc: "累计暴击 10 次", check: (s) => s.crits >= 10 },
  { id: "night", name: "午夜木鱼", emoji: "🌙", desc: "凌晨 0-5 点还在敲", check: (s) => s.nightHits >= 1 },
  { id: "merit1k", name: "功德无量", emoji: "🏆", desc: "累计功德 1000", check: (s) => s.merit >= 1000 },
  { id: "collector", name: "木鱼收藏家", emoji: "🎁", desc: "拥有 3 款木鱼皮肤", check: (s) => s.ownedSkins.length >= 3 },
  { id: "wish", name: "许愿成真", emoji: "🌠", desc: "在许愿池许下一个愿望", check: (s) => s.wishes.length >= 1 },
  { id: "rich", name: "富可敌国", emoji: "👑", desc: "累计功德 10000", check: (s) => s.merit >= 10000 },
];

// ==================== 木鱼吐槽 ====================
const 吐槽话 = [
  "施主，敲木鱼不能解决 KPI。",
  "你已连续敲了很久，该去看看你的周报了。",
  "功德 +1，烦恼 -1，房租 +0。",
  "再敲下去，木鱼要打电话报警了。",
  "今天也要元气满满地当咸鱼哦～",
  "心诚则灵，心不诚也可以随便敲敲。",
  "检测到你手很闲，但心很乱。",
  "敲木鱼一时爽，一直敲一直爽。",
  "施主，你的手机还有 3% 的电。",
  "这一刻的宁静，明天还要还给老板。",
  "木鱼说：别敲了，我也想静静。",
  "功德到账，请注意查收（并不会）。",
  "你在敲木鱼，木鱼也在敲你。",
  "别人卷生卷死，你在这里敲木头。",
  "今日宜：摆烂。忌：假装努力。",
  "敲得这么用力，是有什么放不下的吗？",
  "施主，这已经是第 N 次了，天机都记着呢。",
  "据说敲满一万下，能召唤神龙一颗。",
];

// ==================== 摇卦 ====================
const 卦池: { 卦: string; 象: string; 解: string; 宜: string; 忌: string }[] = [
  { 卦: "乾", 象: "飞龙在天", 解: "大吉之象，今日的你气场两米八，说什么都有人听。", 宜: "表白、投简历、发朋友圈", 忌: "谦虚过头、嘴硬" },
  { 卦: "坤", 象: "厚德载物", 解: "稳如老狗，宜守不宜攻。今天适合佛系，不适合 battle。", 宜: "躺平、点外卖、看剧", 忌: "冲动消费、跟人抬杠" },
  { 卦: "震", 象: "雷声大作", 解: "行动力拉满，但容易三分钟热度。先做完一件再说。", 宜: "开始健身第一天", 忌: "立十条 flag" },
  { 卦: "巽", 象: "顺风而行", 解: "贵人运在线，你随口一句话可能就办成事了。", 宜: "社交、求人帮忙、线下活动", 忌: "已读不回" },
  { 卦: "坎", 象: "水滴石穿", 解: "今日有点波折，但都是纸老虎，熬过去就是真香。", 宜: "复盘、早睡、喝热水", 忌: "硬刚、钻牛角尖" },
  { 卦: "离", 象: "光彩照人", 解: "桃花与人气双旺，今天你自带打光板。", 宜: "拍照、约会、直播", 忌: "素颜出门的后悔" },
  { 卦: "艮", 象: "稳如泰山", 解: "宜静不宜动，今天最好的投资是睡个好觉。", 宜: "冥想、整理房间", 忌: "搬家、退群" },
  { 卦: "兑", 象: "喜上眉梢", 解: "开口即有喜，今天你说的话格外好听，谈判胜率极高。", 宜: "谈钱、砍价、表白", 忌: "沉默是金" },
  { 卦: "泰", 象: "三阳开泰", 解: "上上大吉，天地交而万物通，今天做什么都顺。", 宜: "开局、签约、官宣", 忌: "犹犹豫豫" },
  { 卦: "否", 象: "否极泰来", 解: "暂时低迷，但拐点就在前方，再坚持一下下。", 宜: "保存体力、囤零食", 忌: "梭哈、裸辞" },
];

// ==================== 许愿回应 ====================
const 许愿回应池 = [
  "天机收到。此事「有望」，但前提是你今天别摸鱼。",
  "许愿已上达天听。回复：已读，正在冷处理。",
  "卦象显示：可以成，但要等。等到什么时候？等到你行。",
  "此愿过于离谱，天道建议改天再许。",
  "天机翻了个白眼，然后默默记下了。",
  "收到。正在为你调动八方贵人与三杯奶茶的运气。",
  "心愿已登记。温馨提示：许愿不能代替行动。",
  "天机沉吟三秒：这事，有戏，但剧本得你自己写。",
  "许愿成功。温馨提示：本服务不提供退款服务。",
  "天道说：别急，好的都在路上，岔路口记得别走错。",
];

// ==================== 封神榜 NPC ====================
const 封神榜NPC = [
  { name: "扫地僧", merit: 999999 },
  { name: "键盘侠本侠", merit: 88888 },
  { name: "996福报哥", merit: 52000 },
  { name: "外卖诗人", merit: 20000 },
  { name: "地铁哲学家", merit: 8888 },
  { name: "深夜emo怪", merit: 5200 },
  { name: "摸鱼大师", merit: 1314 },
  { name: "实习生小王", merit: 520 },
  { name: "刚下山的道士", merit: 188 },
  { name: "小区楼下大爷", merit: 66 },
];

// ==================== 持久化状态 ====================
interface FishState {
  merit: number;
  hits: number;
  maxCombo: number;
  crits: number;
  nightHits: number;
  ownedSkins: string[];
  skin: string;
  ownedSounds: FishSound[];
  sound: FishSound;
  achievements: string[];
  wishes: { text: string; reply: string; at: number }[];
}

const STORAGE_KEY = "tianji_fish_v1";

const defaultState: FishState = {
  merit: 0,
  hits: 0,
  maxCombo: 0,
  crits: 0,
  nightHits: 0,
  ownedSkins: ["wood"],
  skin: "wood",
  ownedSounds: ["wood"],
  sound: "wood",
  achievements: [],
  wishes: [],
};

function loadState(): FishState {
  if (typeof window === "undefined") return defaultState;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState;
    const parsed = JSON.parse(raw) as Partial<FishState>;
    return { ...defaultState, ...parsed };
  } catch {
    return defaultState;
  }
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash = hash & hash;
  }
  return Math.abs(hash);
}

function 取境界(merit: number) {
  let current = 境界列表[0];
  for (const b of 境界列表) if (merit >= b.min) current = b;
  return current;
}

interface FloatingMerit {
  id: number;
  x: number;
  y: number;
  text: string;
  crit: boolean;
}

type Tab = "卦" | "成就" | "商店" | "许愿" | "封神榜";
const TABS: Tab[] = ["卦", "成就", "商店", "许愿", "封神榜"];

export default function WoodenFishToy({ onBack }: { onBack: () => void }) {
  const [state, setState] = useState<FishState>(loadState);
  const stateRef = useRef(state);

  const [floats, setFloats] = useState<FloatingMerit[]>([]);
  const [pressKey, setPressKey] = useState(0);
  const [auto, setAuto] = useState(false);
  const [combo, setCombo] = useState(0);
  const [speech, setSpeech] = useState<string | null>(null);
  const [toasts, setToasts] = useState<{ id: string; name: string; emoji: string }[]>([]);
  const [tab, setTab] = useState<Tab>("卦");
  const [notice, setNotice] = useState<string | null>(null);
  const [wishInput, setWishInput] = useState("");
  const [卦, set卦] = useState<(typeof 卦池)[number] | null>(null);
  const [摇卦中, set摇卦中] = useState(false);

  const comboRef = useRef(0);
  const lastHitRef = useRef(0);
  const liveRef = useRef(0);
  const speechTimer = useRef<number | null>(null);

  const skin = useMemo(() => 皮肤列表.find((s) => s.id === state.skin) ?? 皮肤列表[0], [state.skin]);
  const 境界 = useMemo(() => 取境界(state.merit), [state.merit]);
  const 下一境界 = useMemo(() => 境界列表.find((b) => b.min > state.merit) || null, [state.merit]);
  const 进度 = 下一境界
    ? Math.min(100, Math.round(((state.merit - 境界.min) / (下一境界.min - 境界.min)) * 100))
    : 100;

  // 持久化
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* ignore */
    }
  }, [state]);

  const addToasts = useCallback((items: { id: string; name: string; emoji: string }[]) => {
    setToasts((prev) => [...prev, ...items]);
    items.forEach((it) => {
      window.setTimeout(() => setToasts((prev) => prev.filter((x) => x.id !== it.id)), 3000);
    });
  }, []);

  const 提交 = useCallback(
    (next: FishState) => {
      const unlocked = 成就列表.filter((a) => !next.achievements.includes(a.id) && a.check(next));
      const finalNext =
        unlocked.length > 0
          ? { ...next, achievements: [...next.achievements, ...unlocked.map((a) => a.id)] }
          : next;
      stateRef.current = finalNext;
      setState(finalNext);
      if (unlocked.length > 0) {
        playGong();
        addToasts(unlocked.map((a) => ({ id: `${a.id}-${Date.now()}-${Math.random()}`, name: a.name, emoji: a.emoji })));
      }
    },
    [addToasts]
  );

  const say = useCallback((line: string) => {
    setSpeech(line);
    if (speechTimer.current) window.clearTimeout(speechTimer.current);
    speechTimer.current = window.setTimeout(() => setSpeech(null), 3200);
  }, []);

  const showNotice = useCallback((msg: string) => {
    setNotice(msg);
    window.setTimeout(() => setNotice(null), 2200);
  }, []);

  // 敲击
  const hit = useCallback(() => {
    const now = Date.now();
    const dt = now - lastHitRef.current;
    lastHitRef.current = now;
    const c = dt < 700 ? comboRef.current + 1 : 1;
    comboRef.current = c;
    setCombo(c);

    const mult = c >= 40 ? 10 : c >= 20 ? 5 : c >= 10 ? 3 : c >= 5 ? 2 : 1;
    const crit = Math.random() < Math.min(0.28, 0.05 + c * 0.005);
    const gain = crit ? mult * 10 : mult;

    const hour = new Date().getHours();
    const isNight = hour >= 0 && hour < 5;

    playWoodenFish({
      sound: stateRef.current.sound,
      pitch: 1 + Math.min(c, 30) * 0.03,
      crit,
    });
    if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(crit ? 40 : 12);

    setPressKey((k) => k + 1);
    const id = ++liveRef.current;
    setFloats((f) => [
      ...f.slice(-10),
      { id, x: 50 + (Math.random() * 34 - 17), y: 38 + Math.random() * 12, text: crit ? `暴击 +${gain}` : `+${gain}`, crit },
    ]);
    window.setTimeout(() => setFloats((f) => f.filter((it) => it.id !== id)), crit ? 1200 : 900);

    if (crit) {
      setSpeech(null);
      if (speechTimer.current) window.clearTimeout(speechTimer.current);
      setSpeech("💥 功德暴击！天机都震了一下");
      speechTimer.current = window.setTimeout(() => setSpeech(null), 2200);
    } else if (c > 1 && c % 15 === 0) {
      say(`连击 ${c}！施主手速惊人`);
    } else if (c === 1 && Math.random() < 0.06) {
      say(吐槽话[Math.floor(Math.random() * 吐槽话.length)]);
    } else if (stateRef.current.hits % 40 === 39) {
      say(吐槽话[Math.floor(Math.random() * 吐槽话.length)]);
    }

    const cur = stateRef.current;
    提交({
      ...cur,
      merit: cur.merit + gain,
      hits: cur.hits + 1,
      maxCombo: Math.max(cur.maxCombo, c),
      crits: cur.crits + (crit ? 1 : 0),
      nightHits: cur.nightHits + (isNight ? 1 : 0),
    });
  }, [提交, say]);

  // 自动敲击
  useEffect(() => {
    if (!auto) return;
    const timer = window.setInterval(() => hit(), 300);
    return () => window.clearInterval(timer);
  }, [auto, hit]);

  // 连击冷却
  useEffect(() => {
    if (combo < 2) return;
    const timer = window.setTimeout(() => {
      comboRef.current = 0;
      setCombo(0);
    }, 1500);
    return () => window.clearTimeout(timer);
  }, [combo]);

  // 摇卦
  const 摇卦 = useCallback(() => {
    if (摇卦中) return;
    playGong();
    set摇卦中(true);
    set卦(null);
    window.setTimeout(() => {
      set卦(卦池[Math.floor(Math.random() * 卦池.length)]);
      set摇卦中(false);
    }, 850);
  }, [摇卦中]);

  // 商店
  const buySkin = useCallback(
    (s: Skin) => {
      const cur = stateRef.current;
      if (cur.ownedSkins.includes(s.id)) {
        提交({ ...cur, skin: s.id });
        showNotice(`已装备「${s.name}」`);
        return;
      }
      if (cur.merit < s.price) {
        showNotice(`功德不足，还差 ${s.price - cur.merit}`);
        return;
      }
      playChime();
      提交({ ...cur, merit: cur.merit - s.price, ownedSkins: [...cur.ownedSkins, s.id], skin: s.id });
      showNotice(`解锁并装备「${s.name}」`);
    },
    [提交, showNotice]
  );

  const buySound = useCallback(
    (s: { id: FishSound; name: string; price: number }) => {
      const cur = stateRef.current;
      if (cur.ownedSounds.includes(s.id)) {
        提交({ ...cur, sound: s.id });
        showNotice(`已切换音色「${s.name}」`);
        playWoodenFish({ sound: s.id });
        return;
      }
      if (cur.merit < s.price) {
        showNotice(`功德不足，还差 ${s.price - cur.merit}`);
        return;
      }
      提交({ ...cur, merit: cur.merit - s.price, ownedSounds: [...cur.ownedSounds, s.id], sound: s.id });
      showNotice(`解锁音色「${s.name}」`);
      playWoodenFish({ sound: s.id });
    },
    [提交, showNotice]
  );

  // 许愿
  const makeWish = useCallback(() => {
    const text = wishInput.trim();
    if (!text) {
      showNotice("先写下你的愿望");
      return;
    }
    const cur = stateRef.current;
    const cost = 66;
    if (cur.merit < cost) {
      showNotice(`许愿需要 ${cost} 功德，先去敲一会儿`);
      return;
    }
    const reply = 许愿回应池[hashString(text) % 许愿回应池.length];
    playChime();
    say(reply);
    提交({ ...cur, merit: cur.merit - cost, wishes: [{ text, reply, at: Date.now() }, ...cur.wishes].slice(0, 30) });
    setWishInput("");
  }, [wishInput, 提交, say, showNotice]);

  const 重置 = () => {
    if (state.merit === 0 && state.hits === 0) return;
    if (window.confirm("确定清空全部功德与记录吗？罪过罪过。")) {
      const fresh = { ...defaultState, ownedSkins: state.ownedSkins, ownedSounds: state.ownedSounds, skin: state.skin, sound: state.sound, achievements: state.achievements };
      stateRef.current = fresh;
      setState(fresh);
    }
  };

  // 封神榜
  const 封神榜 = useMemo(() => {
    return [...封神榜NPC, { name: "你", merit: state.merit }]
      .sort((a, b) => b.merit - a.merit)
      .slice(0, 12);
  }, [state.merit]);
  const 我的排名 = 封神榜.findIndex((x) => x.name === "你") + 1;

  return (
    <motion.div
      className="min-h-screen px-4 py-8 md:py-12 relative z-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, y: -30 }}
      transition={{ duration: 0.6 }}
    >
      <div className="max-w-xl mx-auto">
        <button onClick={onBack} className="toy-back-btn mb-6">
          ← 回天机阁
        </button>

        <div className="text-center mb-6">
          <h2 className="text-2xl md:text-3xl font-bold golden-text mb-2" style={{ letterSpacing: "0.14em" }}>
            赛 博 木 鱼
          </h2>
          <div className="mystical-divider w-32 mx-auto mb-3" />
          <p className="text-xs" style={{ color: "rgba(201,184,150,0.5)" }}>
            连击暴击 · 成就 · 皮肤 · 许愿 · 封神榜
          </p>
        </div>

        {/* 功德面板 */}
        <div className="mystical-card glow-card p-5 mb-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs mb-1" style={{ color: "rgba(201,184,150,0.45)" }}>当前境界</p>
              <p className="text-lg font-bold" style={{ color: "#d4a853", letterSpacing: "0.08em" }}>{境界.name}</p>
            </div>
            <div className="text-right">
              <p className="text-xs mb-1" style={{ color: "rgba(201,184,150,0.45)" }}>可用功德</p>
              <p className="text-2xl font-bold golden-text tabular-nums">{state.merit}</p>
            </div>
          </div>
          <p className="text-xs mb-3" style={{ color: "rgba(201,184,150,0.5)" }}>{境界.desc}</p>
          <div className="h-1.5 rounded-full mb-3" style={{ background: "rgba(255,255,255,0.06)" }}>
            <motion.div
              className="h-full rounded-full"
              style={{ background: "linear-gradient(90deg,#b8860b,#f0d48a,#d4a853)" }}
              animate={{ width: `${进度}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            {[
              { k: "累计敲击", v: state.hits },
              { k: "最高连击", v: state.maxCombo },
              { k: "功德暴击", v: state.crits },
            ].map((s) => (
              <div key={s.k} className="p-2 rounded-lg" style={{ background: "rgba(212,168,83,0.05)", border: "1px solid rgba(212,168,83,0.1)" }}>
                <p className="text-xs" style={{ color: "rgba(201,184,150,0.45)" }}>{s.k}</p>
                <p className="text-sm font-bold tabular-nums" style={{ color: "#d4a853" }}>{s.v}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 木鱼区 */}
        <div className="relative flex flex-col items-center py-6 mb-4">
          {/* 吐槽气泡 */}
          <AnimatePresence>
            {speech && (
              <motion.div
                key={speech}
                initial={{ opacity: 0, y: 8, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.95 }}
                className="fish-bubble mb-4"
              >
                {speech}
              </motion.div>
            )}
          </AnimatePresence>

          {floats.map((f) => (
            <motion.span
              key={f.id}
              className="pointer-events-none absolute font-bold"
              style={{
                left: `${f.x}%`,
                top: `${f.y}%`,
                color: f.crit ? "#fff2c4" : "#f0d48a",
                fontSize: f.crit ? "1.15rem" : "0.85rem",
                textShadow: f.crit ? "0 0 18px rgba(248,113,113,0.8)" : "0 0 12px rgba(212,168,83,0.6)",
              }}
              initial={{ opacity: 0, y: 0, scale: f.crit ? 1.4 : 0.8 }}
              animate={{ opacity: 1, y: -80, scale: 1 }}
              exit={{ opacity: 0, y: -110 }}
              transition={{ duration: f.crit ? 1.15 : 0.85 }}
            >
              {f.text}
            </motion.span>
          ))}

          {/* 连击 */}
          <AnimatePresence>
            {combo >= 2 && (
              <motion.div
                key="combo"
                className="combo-badge mb-3"
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 + Math.min(combo, 40) * 0.012 }}
                exit={{ opacity: 0, scale: 0.7 }}
              >
                <span className="combo-x">连击 ×{combo}</span>
                <span className="combo-mult">功德 ×{combo >= 40 ? 10 : combo >= 20 ? 5 : combo >= 10 ? 3 : combo >= 5 ? 2 : 1}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <button onClick={hit} aria-label="敲木鱼" className="wf-fish">
            <motion.div
              key={pressKey}
              initial={{ scale: 0.9, rotate: -2 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 18 }}
              className="relative"
            >
              <svg viewBox="0 0 220 180" className="w-[210px] h-[170px] md:w-[250px] md:h-[205px]">
                <defs>
                  <radialGradient id={`wf-${skin.id}`} cx="38%" cy="32%" r="75%">
                    <stop offset="0%" stopColor={skin.grad[0]} />
                    <stop offset="55%" stopColor={skin.grad[1]} />
                    <stop offset="100%" stopColor={skin.grad[2]} />
                  </radialGradient>
                </defs>
                <ellipse cx="110" cy="158" rx="72" ry="12" fill="rgba(0,0,0,0.35)" />
                <path
                  d="M42 92 C42 44, 92 26, 132 36 C178 48, 202 78, 190 108 C180 134, 148 152, 108 152 C62 152, 42 130, 42 92 Z"
                  fill={`url(#wf-${skin.id})`}
                  stroke={skin.rim}
                  strokeWidth="3"
                />
                <path d="M62 100 Q 122 80, 176 100" stroke="#331d0b" strokeWidth="9" fill="none" strokeLinecap="round" />
                <circle cx="74" cy="78" r="6.5" fill="#331d0b" />
                <circle cx="72" cy="76" r="2" fill="rgba(240,212,138,0.7)" />
                <path d="M150 44 C168 52, 184 70, 184 92" stroke={skin.rim} strokeWidth="4" fill="none" strokeLinecap="round" opacity="0.6" />
              </svg>
              {skin.emoji && (
                <span className="absolute top-2 right-3 text-2xl select-none" style={{ filter: "drop-shadow(0 0 8px rgba(0,0,0,0.6))" }}>
                  {skin.emoji}
                </span>
              )}
            </motion.div>
          </button>
          <p className="text-xs mt-2" style={{ color: "rgba(154,139,114,0.45)" }}>
            点击木鱼 · 越敲越上头
          </p>

          <div className="flex items-center gap-3 mt-5">
            <button onClick={() => setAuto((a) => !a)} className={`toy-pill ${auto ? "toy-pill-active" : ""}`}>
              {auto ? "⏸ 停止自动" : "⚡ 自动敲击"}
            </button>
            <button onClick={重置} className="toy-pill">↺ 清空</button>
          </div>
        </div>

        {/* 通知 */}
        <AnimatePresence>
          {notice && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-center text-xs mb-3"
              style={{ color: "#f0d48a" }}
            >
              {notice}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 justify-center mb-4">
          {TABS.map((t) => (
            <button key={t} onClick={() => setTab(t)} className={`toy-tab ${tab === t ? "toy-tab-active" : ""}`}>
              {t}
            </button>
          ))}
        </div>

        {/* 面板 */}
        <div className="oracle-card p-5 md:p-6">
          <div className="corner-ornament corner-tl" />
          <div className="corner-ornament corner-tr" />
          <div className="corner-ornament corner-bl" />
          <div className="corner-ornament corner-br" />
          <div className="relative z-10">
            {/* 摇卦 */}
            {tab === "卦" && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="golden-text text-lg font-bold" style={{ letterSpacing: "0.1em" }}>摇 一 卦</h3>
                  <button onClick={摇卦} disabled={摇卦中} className="mystical-button text-sm disabled:opacity-50" style={{ padding: "8px 20px" }}>
                    {摇卦中 ? "摇卦中…" : "摇卦"}
                  </button>
                </div>
                <div className="min-h-[160px] flex items-center justify-center">
                  <AnimatePresence mode="wait">
                    {摇卦中 && (
                      <motion.div key="shaking" initial={{ opacity: 0 }} animate={{ opacity: 1, rotate: [0, -8, 8, -6, 6, 0] }} exit={{ opacity: 0 }} transition={{ duration: 0.7 }} className="text-5xl" style={{ color: "#d4a853" }}>
                        ☯
                      </motion.div>
                    )}
                    {!摇卦中 && !卦 && (
                      <motion.p key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-xs text-center" style={{ color: "rgba(201,184,150,0.45)" }}>
                        心中默念所问之事，点击「摇卦」<br />看看此刻的天机怎么吐槽
                      </motion.p>
                    )}
                    {!摇卦中 && 卦 && (
                      <motion.div key={卦.卦} initial={{ opacity: 0, y: 16, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0 }} className="w-full">
                        <div className="flex items-center gap-4 mb-3">
                          <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold shrink-0" style={{ background: "rgba(212,168,83,0.1)", border: "2px solid rgba(212,168,83,0.4)", color: "#d4a853" }}>
                            {卦.卦}
                          </div>
                          <div>
                            <p className="text-sm font-bold" style={{ color: "#f0e6d3" }}>{卦.象}</p>
                            <p className="text-xs mt-1 leading-relaxed" style={{ color: "rgba(201,184,150,0.6)" }}>{卦.解}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="p-3 rounded-lg" style={{ background: "rgba(74,222,128,0.06)", border: "1px solid rgba(74,222,128,0.12)" }}>
                            <p className="text-xs mb-1" style={{ color: "rgba(74,222,128,0.7)" }}>宜</p>
                            <p className="text-xs" style={{ color: "rgba(201,184,150,0.75)" }}>{卦.宜}</p>
                          </div>
                          <div className="p-3 rounded-lg" style={{ background: "rgba(248,113,113,0.06)", border: "1px solid rgba(248,113,113,0.12)" }}>
                            <p className="text-xs mb-1" style={{ color: "rgba(248,113,113,0.7)" }}>忌</p>
                            <p className="text-xs" style={{ color: "rgba(201,184,150,0.75)" }}>{卦.忌}</p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            )}

            {/* 成就 */}
            {tab === "成就" && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="golden-text text-lg font-bold" style={{ letterSpacing: "0.1em" }}>功 德 成 就</h3>
                  <span className="text-xs" style={{ color: "rgba(201,184,150,0.5)" }}>
                    {state.achievements.length}/{成就列表.length}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {成就列表.map((a) => {
                    const got = state.achievements.includes(a.id);
                    return (
                      <div
                        key={a.id}
                        className="p-3 rounded-xl text-center transition-all"
                        style={{
                          background: got ? "rgba(212,168,83,0.1)" : "rgba(255,255,255,0.02)",
                          border: `1px solid ${got ? "rgba(212,168,83,0.35)" : "rgba(255,255,255,0.06)"}`,
                          opacity: got ? 1 : 0.55,
                        }}
                      >
                        <div className="text-2xl mb-1" style={{ filter: got ? "none" : "grayscale(1)" }}>{a.emoji}</div>
                        <p className="text-xs font-bold mb-0.5" style={{ color: got ? "#d4a853" : "rgba(201,184,150,0.5)" }}>{a.name}</p>
                        <p className="text-[0.65rem]" style={{ color: "rgba(201,184,150,0.45)" }}>{a.desc}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 商店 */}
            {tab === "商店" && (
              <div>
                <h3 className="golden-text text-lg font-bold mb-4" style={{ letterSpacing: "0.1em" }}>木 鱼 商 店</h3>
                <p className="text-xs mb-2" style={{ color: "rgba(201,184,150,0.45)" }}>木鱼皮肤</p>
                <div className="space-y-2 mb-5">
                  {皮肤列表.map((s) => {
                    const owned = state.ownedSkins.includes(s.id);
                    const active = state.skin === s.id;
                    return (
                      <div key={s.id} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: "rgba(15,8,25,0.6)", border: `1px solid ${active ? "rgba(212,168,83,0.4)" : "rgba(212,168,83,0.12)"}` }}>
                        <div className="w-9 h-9 rounded-full shrink-0" style={{ background: `radial-gradient(circle at 35% 30%, ${s.grad[0]}, ${s.grad[1]} 55%, ${s.grad[2]})`, border: `2px solid ${s.rim}` }} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold" style={{ color: "#f0e6d3" }}>{s.name} {s.emoji}</p>
                          <p className="text-xs truncate" style={{ color: "rgba(201,184,150,0.5)" }}>{s.desc}</p>
                        </div>
                        <button onClick={() => buySkin(s)} className={`toy-pill shrink-0 ${active ? "toy-pill-active" : ""}`}>
                          {active ? "使用中" : owned ? "装备" : `${s.price} 功德`}
                        </button>
                      </div>
                    );
                  })}
                </div>
                <p className="text-xs mb-2" style={{ color: "rgba(201,184,150,0.45)" }}>木鱼音色</p>
                <div className="space-y-2">
                  {音色列表.map((s) => {
                    const owned = state.ownedSounds.includes(s.id);
                    const active = state.sound === s.id;
                    return (
                      <div key={s.id} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: "rgba(15,8,25,0.6)", border: `1px solid ${active ? "rgba(212,168,83,0.4)" : "rgba(212,168,83,0.12)"}` }}>
                        <div className="text-xl w-9 text-center shrink-0">🔊</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold" style={{ color: "#f0e6d3" }}>{s.name}</p>
                          <p className="text-xs truncate" style={{ color: "rgba(201,184,150,0.5)" }}>{s.desc}</p>
                        </div>
                        <button onClick={() => buySound(s)} className={`toy-pill shrink-0 ${active ? "toy-pill-active" : ""}`}>
                          {active ? "使用中" : owned ? "切换" : `${s.price} 功德`}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 许愿 */}
            {tab === "许愿" && (
              <div>
                <h3 className="golden-text text-lg font-bold mb-2" style={{ letterSpacing: "0.1em" }}>功 德 许 愿 池</h3>
                <p className="text-xs mb-4" style={{ color: "rgba(201,184,150,0.45)" }}>每次许愿消耗 66 功德，天机会给你一句回应</p>
                <textarea
                  className="mystical-input w-full p-3 text-sm mb-3 min-h-[80px]"
                  placeholder="写下你的愿望…例如：希望这周不用加班"
                  value={wishInput}
                  onChange={(e) => setWishInput(e.target.value)}
                />
                <div className="flex justify-end mb-5">
                  <button onClick={makeWish} className="mystical-button" style={{ padding: "9px 24px" }}>投币许愿</button>
                </div>
                {state.wishes.length > 0 && (
                  <div className="space-y-3">
                    <p className="text-xs" style={{ color: "rgba(201,184,150,0.45)" }}>许愿记录</p>
                    {state.wishes.map((w, i) => (
                      <div key={i} className="p-3 rounded-xl" style={{ background: "rgba(192,132,252,0.05)", border: "1px solid rgba(192,132,252,0.12)" }}>
                        <p className="text-sm mb-1" style={{ color: "rgba(240,230,211,0.9)" }}>🙏 {w.text}</p>
                        <p className="text-xs leading-relaxed" style={{ color: "rgba(201,184,150,0.6)" }}>天机：{w.reply}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 封神榜 */}
            {tab === "封神榜" && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="golden-text text-lg font-bold" style={{ letterSpacing: "0.1em" }}>功 德 封 神 榜</h3>
                  <span className="text-xs" style={{ color: "rgba(212,168,83,0.8)" }}>你的排名：第 {我的排名} 名</span>
                </div>
                <div className="space-y-2">
                  {封神榜.map((p, i) => {
                    const me = p.name === "你";
                    return (
                      <div key={p.name} className="flex items-center gap-3 px-3 py-2 rounded-lg" style={{ background: me ? "rgba(212,168,83,0.12)" : "rgba(255,255,255,0.02)", border: `1px solid ${me ? "rgba(212,168,83,0.4)" : "transparent"}` }}>
                        <span className="w-7 text-center text-sm font-bold" style={{ color: i < 3 ? "#f0d48a" : "rgba(201,184,150,0.5)" }}>
                          {i + 1}
                        </span>
                        <span className="flex-1 text-sm" style={{ color: me ? "#f0d48a" : "rgba(240,230,211,0.85)", fontWeight: me ? 700 : 400 }}>
                          {p.name} {me && "（你）"}
                        </span>
                        <span className="text-sm tabular-nums" style={{ color: "rgba(201,184,150,0.7)" }}>{p.merit.toLocaleString()}</span>
                      </div>
                    );
                  })}
                </div>
                <p className="text-xs mt-4 text-center" style={{ color: "rgba(154,139,114,0.4)" }}>
                  榜单纯属整活，NPC 不存在，你的排名是真的
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="text-center mt-8 pb-6">
          <div className="mystical-divider w-24 mx-auto mb-3" />
          <p className="text-xs" style={{ color: "rgba(154,139,114,0.3)" }}>
            天机阁 · 木鱼仅供解压娱乐，功德不带回现实
          </p>
        </div>
      </div>

      {/* 成就 toast */}
      <div className="fixed top-4 right-4 z-50 space-y-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: 40, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 40, scale: 0.9 }}
              className="achievement-toast"
            >
              <span className="text-xl">{t.emoji}</span>
              <div>
                <p className="text-xs" style={{ color: "rgba(201,184,150,0.6)" }}>解锁成就</p>
                <p className="text-sm font-bold" style={{ color: "#f0d48a" }}>{t.name}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
