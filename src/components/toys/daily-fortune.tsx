"use client";

import { useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { playChime } from "@/lib/cyber-audio";

// 每日签库：国潮 + 沙雕整活
interface FortuneSlip {
  级别: "上上" | "上" | "中" | "下";
  签名: string;
  签诗: string[];
  解签: string;
  宜: string;
  忌: string;
}

const 签库: FortuneSlip[] = [
  { 级别: "上上", 签名: "紫气东来", 签诗: ["云开月出照乾坤", "一步登天莫等闲", "此心若向光明处", "万水千山只等闲"], 解签: "今日的你自带主角光环，做什么都不容易翻车。趁热打铁，别谦虚。", 宜: "表白 / 投简历 / 官宣", 忌: "犹豫 / 内耗 / 深夜 emo" },
  { 级别: "上上", 签名: "锦鲤附体", 签诗: ["池中锦鲤跃龙门", "好事成双福自临", "今日不求天也助", "出门记得看黄历"], 解签: "运气好到离谱，抽卡、抢票、约饭成功率暴涨。但别骚操作。", 宜: "抽卡 / 抢票 / 谈钱", 忌: "凡尔赛 / 得意忘形" },
  { 级别: "上", 签名: "春风得意", 签诗: ["春风得意马蹄疾", "一日看尽长安花", "贵人就在转角处", "抬头挺胸往前爬"], 解签: "事业和社交双通道绿灯，多出门多说话，贵人今天听得见你。", 宜: "社交 / 求人帮忙 / 线下活动", 忌: "已读不回 / 宅家一整天" },
  { 级别: "上", 签名: "桃花初绽", 签诗: ["忽如一夜春风来", "桃花依旧笑春风", "有缘千里能相会", "别总盯着手机屏"], 解签: "桃花运在线，但桃花不会自己敲门。今天请主动一点，勇敢一点。", 宜: "搭讪 / 约饭 / 更新头像", 忌: "照骗 / 装高冷" },
  { 级别: "中", 签名: "静水流深", 签诗: ["静水流深藏大器", "不争朝夕争长远", "今日宜守不宜攻", "养精蓄锐待来年"], 解签: "平稳的一天，没有惊喜也没有惊吓。适合把欠的事情一点点补上。", 宜: "复盘 / 早睡 / 喝热水", 忌: "梭哈 / 裸辞 / 立 flag" },
  { 级别: "中", 签名: "苦尽甘来", 签诗: ["山重水复疑无路", "柳暗花明又一村", "熬过今日这道坎", "明天就是新一天"], 解签: "今天会有点小波折，但都是纸老虎。咬牙顶住，拐点就在前面。", 宜: "坚持 / 备份文件 / 深呼吸", 忌: "硬刚 / 钻牛角尖" },
  { 级别: "中", 签名: "守株待兔", 签诗: ["守株待兔非上策", "机会来时须出手", "今日闲事莫多管", "专注自家三分田"], 解签: "机会在酝酿，别急着出手；把手头的事做完，比什么都强。", 宜: "专注 / 断舍离 / 整理房间", 忌: "多管闲事 / 刷短视频到天亮" },
  { 级别: "中", 签名: "小富即安", 签诗: ["不求大富与大贵", "只愿平安喜乐多", "今日财运尚可也", "理性消费莫上头"], 解签: "钱包有进有出，总体不吃亏。剁手前请三思，购物车不是许愿池。", 宜: "记账 / 砍价 / 喝奶茶", 忌: "冲动消费 / 分期上瘾" },
  { 级别: "下", 签名: "水深火热", 签诗: ["今日诸事多不顺", "出门记得带把伞", "遇事冷静莫争吵", "退一步海阔天空"], 解签: "今日易踩坑，遇事别上头。少吃瓜、少争论、早点回家最安全。", 宜: "低调 / 早退 / 点外卖", 忌: "吵架 / 发长文 / 裸辞" },
  { 级别: "下", 签名: "水逆预警", 签诗: ["水星逆行多波折", "电子设备易罢工", "重要文件先备份", "少说多做保平安"], 解签: "水逆警告！话别乱说、文件别忘存、消息别乱发，平安就是胜利。", 宜: "备份 / 沉默 / 早睡", 忌: "群发 / 手滑 / 深夜发消息" },
  { 级别: "上", 签名: "否极泰来", 签诗: ["否极泰来终有日", "守得云开见月明", "今日虽有小坎坷", "来日方长莫心急"], 解签: "低谷的尾巴了，再扛一扛。今天的耐心，是明天的运气。", 宜: "坚持 / 存钱 / 锻炼", 忌: "放弃 / 破罐子破摔" },
  { 级别: "上上", 签名: "心想事成", 签诗: ["心之所向皆如愿", "念之所及俱成真", "今日宜把想做的", "立刻动手别拖延"], 解签: "想做的事今天就去做了它，宇宙都在帮你按加速键。", 宜: "立刻行动 / 开口 / 下单", 忌: "再刷五分钟手机" },
];

const 级别配色: Record<FortuneSlip["级别"], { color: string; bg: string; border: string }> = {
  上上: { color: "#f0d48a", bg: "rgba(212,168,83,0.14)", border: "rgba(212,168,83,0.45)" },
  上: { color: "#d4a853", bg: "rgba(212,168,83,0.1)", border: "rgba(212,168,83,0.3)" },
  中: { color: "#c9b896", bg: "rgba(201,184,150,0.08)", border: "rgba(201,184,150,0.25)" },
  下: { color: "#9a8b72", bg: "rgba(154,139,114,0.08)", border: "rgba(154,139,114,0.25)" },
};

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash = hash & hash;
  }
  return Math.abs(hash);
}

function todayKey(): string {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export default function DailyFortuneToy({ onBack }: { onBack: () => void }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [dateKey] = useState(() => todayKey());
  // 恢复今日已抽的签（仅在客户端导航进入本页时初始化）
  const [slip, setSlip] = useState<FortuneSlip | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      const saved = localStorage.getItem(`tianji_daily_${todayKey()}`);
      return saved ? (JSON.parse(saved) as FortuneSlip) : null;
    } catch {
      return null;
    }
  });

  const 抽签 = useCallback(() => {
    if (open) return;
    playChime();
    setOpen(true);
    window.setTimeout(() => {
      const key = todayKey();
      const idx = hashString(`tianji-${key}`) % 签库.length;
      const picked = 签库[idx];
      setSlip(picked);
      try {
        localStorage.setItem(`tianji_daily_${key}`, JSON.stringify(picked));
      } catch {
        /* ignore */
      }
    }, 700);
  }, [open]);

  const 分享 = useCallback(async () => {
    if (!slip) return;
    const text = `【天机阁 · 每日一签】${dateKey}\n${slip.级别}签《${slip.签名}》\n${slip.签诗.join("\n")}\n宜：${slip.宜}\n忌：${slip.忌}\n—— 仅供参考，娱乐为主，转发得好运`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  }, [slip, dateKey]);

  const 色 = slip ? 级别配色[slip.级别] : 级别配色.中;

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

        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold golden-text mb-2" style={{ letterSpacing: "0.14em" }}>
            每 日 一 签
          </h2>
          <div className="mystical-divider w-32 mx-auto mb-3" />
          <p className="text-xs" style={{ color: "rgba(201,184,150,0.5)" }}>
            每日一签 · 一天一抽 · 心诚则灵
          </p>
          <p className="text-xs mt-2" style={{ color: "rgba(154,139,114,0.4)" }}>
            {dateKey}
          </p>
        </div>

        <div className="mystical-card glow-card p-6 md:p-8">
          <div className="min-h-[320px] flex items-center justify-center">
            <AnimatePresence mode="wait">
              {!slip && !open && (
                <motion.div
                  key="ready"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.05 }}
                  className="text-center"
                >
                  <motion.div
                    className="text-6xl mb-6 select-none"
                    style={{ color: "#d4a853" }}
                    animate={{ rotate: [0, -6, 6, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  >
                    🎋
                  </motion.div>
                  <button onClick={抽签} className="mystical-button-hero">
                    抽 一 签
                  </button>
                  <p className="text-xs mt-4" style={{ color: "rgba(154,139,114,0.45)" }}>
                    每天一签，抽完即止
                  </p>
                </motion.div>
              )}

              {open && !slip && (
                <motion.div
                  key="shaking"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center"
                >
                  <motion.div
                    className="text-5xl mb-4"
                    style={{ color: "#d4a853" }}
                    animate={{ rotate: [0, -20, 20, -14, 14, 0], y: [0, -6, 0, -4, 0] }}
                    transition={{ duration: 0.7 }}
                  >
                    🎋
                  </motion.div>
                  <p className="text-sm" style={{ color: "rgba(201,184,150,0.6)" }}>
                    签筒摇动中…
                  </p>
                </motion.div>
              )}

              {slip && (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, y: 24, scale: 0.94 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ type: "spring", stiffness: 260, damping: 22 }}
                  className="w-full text-center"
                >
                  <span
                    className="inline-block px-4 py-1 rounded-full text-sm font-bold mb-4"
                    style={{ background: 色.bg, border: `1px solid ${色.border}`, color: 色.color, letterSpacing: "0.1em" }}
                  >
                    {slip.级别} 签
                  </span>

                  <h3 className="text-2xl font-bold mb-4" style={{ color: 色.color, letterSpacing: "0.12em" }}>
                    《{slip.签名}》
                  </h3>

                  <div className="mb-5 space-y-2">
                    {slip.签诗.map((line, i) => (
                      <motion.p
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 + i * 0.12 }}
                        className="text-sm"
                        style={{ color: "rgba(240,230,211,0.85)", letterSpacing: "0.08em" }}
                      >
                        {line}
                      </motion.p>
                    ))}
                  </div>

                  <div className="mystical-divider w-40 mx-auto mb-4" />

                  <p className="text-sm leading-relaxed mb-5" style={{ color: "rgba(201,184,150,0.7)" }}>
                    {slip.解签}
                  </p>

                  <div className="grid grid-cols-2 gap-3 mb-5">
                    <div className="p-3 rounded-lg text-left" style={{ background: "rgba(74,222,128,0.06)", border: "1px solid rgba(74,222,128,0.12)" }}>
                      <p className="text-xs mb-1 font-bold" style={{ color: "rgba(74,222,128,0.7)" }}>宜</p>
                      <p className="text-xs" style={{ color: "rgba(201,184,150,0.75)" }}>{slip.宜}</p>
                    </div>
                    <div className="p-3 rounded-lg text-left" style={{ background: "rgba(248,113,113,0.06)", border: "1px solid rgba(248,113,113,0.12)" }}>
                      <p className="text-xs mb-1 font-bold" style={{ color: "rgba(248,113,113,0.7)" }}>忌</p>
                      <p className="text-xs" style={{ color: "rgba(201,184,150,0.75)" }}>{slip.忌}</p>
                    </div>
                  </div>

                  <button onClick={分享} className="toy-pill toy-pill-active">
                    {copied ? "✓ 已复制，快去分享" : "复制签文分享"}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="text-center mt-8 pb-6">
          <div className="mystical-divider w-24 mx-auto mb-3" />
          <p className="text-xs" style={{ color: "rgba(154,139,114,0.3)" }}>
            天机阁 · 每日一签仅供娱乐，不构成任何决策建议
          </p>
        </div>
      </div>
    </motion.div>
  );
}
