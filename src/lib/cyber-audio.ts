// 赛博玄学音效：全部用 Web Audio 合成，无需任何音频资源文件。

let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    const AC =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!AC) return null;
    if (!ctx) ctx = new AC();
    if (ctx.state === "suspended") void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

export type FishSound = "wood" | "cat" | "retro";

/** 敲木鱼：支持木鱼/猫咪/电子三种音色，pitch 随连击升高，crit 时更响。 */
export function playWoodenFish(
  opts: { sound?: FishSound; pitch?: number; crit?: boolean } = {}
) {
  const c = getCtx();
  if (!c) return;
  const now = c.currentTime;
  const pitch = opts.pitch ?? 1;
  const sound = opts.sound ?? "wood";
  const vol = opts.crit ? 0.62 : 0.42;

  if (sound === "cat") {
    // 猫咪「喵呜」：双音滑音 + 轻微颤音
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(640 * pitch, now);
    osc.frequency.exponentialRampToValueAtTime(360 * pitch, now + 0.18);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(vol * 0.7, now + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);
    osc.connect(gain).connect(c.destination);
    osc.start(now);
    osc.stop(now + 0.24);

    const lfo = c.createOscillator();
    const lfoGain = c.createGain();
    lfo.frequency.value = 26;
    lfoGain.gain.value = 35;
    lfo.connect(lfoGain).connect(osc.frequency);
    lfo.start(now);
    lfo.stop(now + 0.22);
    return;
  }

  if (sound === "retro") {
    // 8-bit 电子「滴」
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = "square";
    osc.frequency.setValueAtTime(880 * pitch, now);
    osc.frequency.exponentialRampToValueAtTime(420 * pitch, now + 0.06);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(vol * 0.4, now + 0.004);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.11);
    osc.connect(gain).connect(c.destination);
    osc.start(now);
    osc.stop(now + 0.13);
    return;
  }

  // 默认木鱼「咚」
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(210 * pitch, now);
  osc.frequency.exponentialRampToValueAtTime(92 * pitch, now + 0.09);
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(vol, now + 0.004);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);
  osc.connect(gain).connect(c.destination);
  osc.start(now);
  osc.stop(now + 0.22);

  const click = c.createOscillator();
  const cg = c.createGain();
  click.type = "triangle";
  click.frequency.setValueAtTime(1400 * pitch, now);
  cg.gain.setValueAtTime(opts.crit ? 0.24 : 0.16, now);
  cg.gain.exponentialRampToValueAtTime(0.0001, now + 0.03);
  click.connect(cg).connect(c.destination);
  click.start(now);
  click.stop(now + 0.04);
}

/** 摇卦 / 解锁成就的「铛」——金石余韵，长衰减。 */
export function playGong() {
  const c = getCtx();
  if (!c) return;
  const now = c.currentTime;
  [196, 294, 392, 587].forEach((freq, i) => {
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    const peak = 0.2 / (i + 1);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(peak, now + 0.02 + i * 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.5 + i * 0.3);
    osc.connect(gain).connect(c.destination);
    osc.start(now);
    osc.stop(now + 2.2);
  });
}

/** 抽签 / 许愿的「叮」——清脆的上行铃音。 */
export function playChime() {
  const c = getCtx();
  if (!c) return;
  const now = c.currentTime;
  [784, 1046, 1318].forEach((freq, i) => {
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    const start = now + i * 0.08;
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(0.14, start + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.7);
    osc.connect(gain).connect(c.destination);
    osc.start(start);
    osc.stop(start + 0.8);
  });
}
