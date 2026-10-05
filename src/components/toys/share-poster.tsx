"use client";

import { useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export interface PosterData {
  name: string;
  gender: string;
  age: number;
  生肖: string;
  四柱八字: { 年柱: string; 月柱: string; 日柱: string; 时柱: string };
  命卦: { name: string; element: string; number: number };
  五行分布: Record<string, number>;
  总运势: number;
  运势等级: { level: string; desc: string };
  每日宜忌: { 宜: string[]; 忌: string[] };
  事情预测?: { task: string; successRate: number; level: string };
}

const SERIF = '"Noto Serif SC", "Songti SC", "SimSun", serif';
const 五行色: Record<string, string> = { 金: "#f0d48a", 木: "#4ade80", 水: "#60a5fa", 火: "#f87171", 土: "#d4a853" };
const 五行序 = ["金", "木", "水", "火", "土"];

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function centerText(
  ctx: CanvasRenderingContext2D,
  text: string,
  y: number,
  font: string,
  color: string,
  letterSpacing = 0
) {
  ctx.font = font;
  ctx.fillStyle = color;
  ctx.textBaseline = "middle";
  if (letterSpacing > 0) {
    const chars = [...text];
    const widths = chars.map((c) => ctx.measureText(c).width + letterSpacing);
    const total = widths.reduce((a, b) => a + b, 0) - letterSpacing;
    let x = (750 - total) / 2;
    chars.forEach((c, i) => {
      ctx.fillText(c, x, y);
      x += widths[i];
    });
  } else {
    ctx.textAlign = "center";
    ctx.fillText(text, 375, y);
    ctx.textAlign = "left";
  }
}

function drawPoster(data: PosterData): string {
  const W = 750;
  const H = 1334;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";

  // 背景
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, "#0a0612");
  bg.addColorStop(0.5, "#150a24");
  bg.addColorStop(1, "#0a0612");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // 光晕
  const glow = ctx.createRadialGradient(375, 420, 40, 375, 420, 420);
  glow.addColorStop(0, "rgba(212,168,83,0.13)");
  glow.addColorStop(1, "rgba(212,168,83,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);

  // 边框
  ctx.strokeStyle = "rgba(212,168,83,0.55)";
  ctx.lineWidth = 2;
  ctx.strokeRect(26, 26, W - 52, H - 52);
  ctx.strokeStyle = "rgba(212,168,83,0.18)";
  ctx.lineWidth = 1;
  ctx.strokeRect(40, 40, W - 80, H - 80);

  // 四角装饰
  ctx.strokeStyle = "rgba(212,168,83,0.7)";
  ctx.lineWidth = 3;
  const corner = (x: number, y: number, sx: number, sy: number) => {
    ctx.beginPath();
    ctx.moveTo(x, y + sy * 26);
    ctx.lineTo(x, y);
    ctx.lineTo(x + sx * 26, y);
    ctx.stroke();
  };
  corner(28, 28, 1, 1);
  corner(W - 28, 28, -1, 1);
  corner(28, H - 28, 1, -1);
  corner(W - 28, H - 28, -1, -1);

  // 标题
  centerText(ctx, "天 机 阁", 128, `bold 56px ${SERIF}`, "#d4a853", 0);
  centerText(ctx, "命 盘 揭 示", 190, `22px ${SERIF}`, "rgba(201,184,150,0.6)", 4);
  ctx.strokeStyle = "rgba(212,168,83,0.4)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(230, 225);
  ctx.lineTo(520, 225);
  ctx.stroke();

  // 基本信息
  centerText(ctx, `${data.name} · ${data.gender} · ${data.生肖}年 · ${data.age}岁`, 262, `24px ${SERIF}`, "rgba(240,230,211,0.85)", 1);

  // 四柱八字
  const pillars = [
    ["年柱", data.四柱八字.年柱],
    ["月柱", data.四柱八字.月柱],
    ["日柱", data.四柱八字.日柱],
    ["时柱", data.四柱八字.时柱],
  ] as const;
  roundRect(ctx, 60, 300, 630, 150, 16);
  ctx.fillStyle = "rgba(15,8,25,0.72)";
  ctx.fill();
  ctx.strokeStyle = "rgba(212,168,83,0.25)";
  ctx.lineWidth = 1;
  ctx.stroke();
  const colW = 630 / 4;
  pillars.forEach(([label, value], i) => {
    const cx = 60 + colW * i + colW / 2;
    ctx.font = `18px ${SERIF}`;
    ctx.fillStyle = "rgba(201,184,150,0.5)";
    ctx.textAlign = "center";
    ctx.fillText(label, cx, 340);
    ctx.font = `bold 40px ${SERIF}`;
    ctx.fillStyle = "#d4a853";
    ctx.fillText(value, cx, 395);
    ctx.textAlign = "left";
  });

  // 总运势
  centerText(ctx, "总 运 势", 510, `22px ${SERIF}`, "rgba(201,184,150,0.5)", 6);
  ctx.textAlign = "center";
  ctx.font = `bold 130px ${SERIF}`;
  ctx.fillStyle = data.总运势 >= 80 ? "#f0d48a" : data.总运势 >= 60 ? "#d4a853" : "#9a8b72";
  ctx.fillText(String(data.总运势), 340, 620);
  ctx.font = `28px ${SERIF}`;
  ctx.fillStyle = "rgba(201,184,150,0.55)";
  ctx.fillText("分", 470, 650);
  ctx.textAlign = "left";
  centerText(ctx, `「${data.运势等级.level}」 ${data.运势等级.desc}`, 706, `24px ${SERIF}`, "#c9b896", 2);

  // 五行分布
  const barsX = 90;
  const barsW = 570;
  const barH = 16;
  let by = 760;
  ctx.font = `20px ${SERIF}`;
  ctx.fillStyle = "rgba(201,184,150,0.6)";
  ctx.fillText("五 行 分 布", barsX, by - 14);
  by += 16;
  for (const el of 五行序) {
    const val = data.五行分布[el] ?? 0;
    ctx.font = `20px ${SERIF}`;
    ctx.fillStyle = "rgba(240,230,211,0.85)";
    ctx.fillText(el, barsX - 34, by + barH / 2);
    roundRect(ctx, barsX, by, barsW, barH, barH / 2);
    ctx.fillStyle = "rgba(255,255,255,0.06)";
    ctx.fill();
    roundRect(ctx, barsX, by, Math.max(barH, (barsW * val) / 100), barH, barH / 2);
    ctx.fillStyle = 五行色[el];
    ctx.fill();
    ctx.font = `18px ${SERIF}`;
    ctx.fillStyle = "rgba(201,184,150,0.7)";
    ctx.fillText(`${val}%`, barsX + barsW + 12, by + barH / 2);
    by += 40;
  }

  // 命卦
  centerText(ctx, `本命卦 · ${data.命卦.name}卦（第${data.命卦.number}宫 · ${data.命卦.element}行）`, by + 4, `24px ${SERIF}`, "#d4a853", 1);
  by += 44;

  // 宜忌
  const 宜 = data.每日宜忌.宜.slice(0, 4).join("  ");
  const 忌 = data.每日宜忌.忌.slice(0, 4).join("  ");
  roundRect(ctx, 60, by, 630, 76, 14);
  ctx.fillStyle = "rgba(74,222,128,0.06)";
  ctx.fill();
  ctx.font = `22px ${SERIF}`;
  ctx.textAlign = "left";
  ctx.fillStyle = "rgba(74,222,128,0.85)";
  ctx.fillText("宜", 86, by + 40);
  ctx.font = `20px ${SERIF}`;
  ctx.fillStyle = "rgba(201,184,150,0.8)";
  ctx.fillText(宜, 130, by + 40);
  by += 84;
  roundRect(ctx, 60, by, 630, 76, 14);
  ctx.fillStyle = "rgba(248,113,113,0.06)";
  ctx.fill();
  ctx.font = `22px ${SERIF}`;
  ctx.fillStyle = "rgba(248,113,113,0.85)";
  ctx.fillText("忌", 86, by + 40);
  ctx.font = `20px ${SERIF}`;
  ctx.fillStyle = "rgba(201,184,150,0.8)";
  ctx.fillText(忌, 130, by + 40);
  by += 92;

  // 事情预测
  if (data.事情预测) {
    centerText(ctx, "事 情 预 测", by + 10, `22px ${SERIF}`, "rgba(192,132,252,0.75)", 6);
    centerText(
      ctx,
      `「${data.事情预测.task}」 · 成功率 ${data.事情预测.successRate}% · ${data.事情预测.level}`,
      by + 50,
      `22px ${SERIF}`,
      "rgba(201,184,150,0.8)",
      1
    );
    by += 74;
  }

  // 页脚
  const dateStr = new Date().toLocaleDateString("zh-CN");
  centerText(ctx, `天机阁 · ${dateStr} 推演`, H - 96, `20px ${SERIF}`, "rgba(201,184,150,0.45)", 1);
  centerText(ctx, "仅供娱乐参考 · 请勿当真", H - 64, `18px ${SERIF}`, "rgba(154,139,114,0.4)", 1);

  return canvas.toDataURL("image/png");
}

export default function SharePoster({ data }: { data: PosterData }) {
  const [preview, setPreview] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const generate = useCallback(() => {
    try {
      const url = drawPoster(data);
      if (url) setPreview(url);
    } catch {
      /* ignore */
    }
  }, [data]);

  const download = useCallback(() => {
    if (!preview) return;
    const a = document.createElement("a");
    a.href = preview;
    a.download = `天机阁命盘-${data.name}.png`;
    a.click();
  }, [preview, data.name]);

  const copyText = useCallback(async () => {
    const text = `【天机阁 · 命盘推演】${data.name}\n生肖：${data.生肖}年 · ${data.age}岁\n四柱八字：${data.四柱八字.年柱} ${data.四柱八字.月柱} ${data.四柱八字.日柱} ${data.四柱八字.时柱}\n本命卦：${data.命卦.name}卦（${data.命卦.element}行）\n总运势：${data.总运势} 分 · ${data.运势等级.level}\n宜：${data.每日宜忌.宜.slice(0, 3).join("、")}\n忌：${data.每日宜忌.忌.slice(0, 3).join("、")}\n—— 天机阁，玄学娱乐，请勿当真`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  }, [data]);

  return (
    <>
      <div className="flex flex-wrap justify-center gap-3">
        <button onClick={generate} className="mystical-button">
          生成分享海报
        </button>
        <button onClick={copyText} className="toy-pill">
          {copied ? "✓ 已复制" : "复制命盘文字"}
        </button>
      </div>

      <AnimatePresence>
        {preview && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(5,2,10,0.85)", backdropFilter: "blur(6px)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setPreview(null)}
          >
            <motion.div
              className="relative max-h-[90vh] flex flex-col items-center"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={preview}
                alt="命盘海报"
                className="max-h-[74vh] w-auto rounded-lg"
                style={{ border: "1px solid rgba(212,168,83,0.3)", boxShadow: "0 0 40px rgba(212,168,83,0.15)" }}
              />
              <div className="flex gap-3 mt-4">
                <button onClick={download} className="mystical-button" style={{ padding: "10px 26px" }}>
                  保存图片
                </button>
                <button onClick={() => setPreview(null)} className="toy-pill">
                  关闭
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
