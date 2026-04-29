import { NextRequest, NextResponse } from "next/server";

// ==================== 玄学命理计算核心 ====================

const 天干 = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];
const 地支 = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];
const 生肖 = ["鼠", "牛", "虎", "兔", "龙", "蛇", "马", "羊", "猴", "鸡", "狗", "猪"];
const 八卦名 = ["坎", "坤", "震", "巽", "中", "乾", "兑", "艮", "离"];
const 五行 = ["金", "木", "水", "火", "土"];

// 八卦映射: 1=坎(水), 2=坤(土), 3=震(木), 4=巽(木), 5=坤(土), 6=乾(金), 7=兑(金), 8=艮(土), 9=离(火)
const 八卦五行映射: Record<number, { name: string; element: string }> = {
  1: { name: "坎", element: "水" },
  2: { name: "坤", element: "土" },
  3: { name: "震", element: "木" },
  4: { name: "巽", element: "木" },
  5: { name: "坤", element: "土" },
  6: { name: "乾", element: "金" },
  7: { name: "兑", element: "金" },
  8: { name: "艮", element: "土" },
  9: { name: "离", element: "火" },
};

const 八卦描述: Record<string, string> = {
  乾: "乾卦为天，刚健中正。乾者，万物之始也。得乾卦者，性格刚毅果敢，胸怀大志，有领导才能，适合从事管理、政治等事业。运势亨通，但需防过于刚强而招致挫折。",
  坤: "坤卦为地，厚德载物。坤者，万物之母也。得坤卦者，性情温厚包容，善于持家理财，人缘极佳。事业发展稳健，宜守不宜攻，以柔克刚乃上策。",
  震: "震卦为雷，动而有声。震者，奋起之象也。得震卦者，行动力极强，勇于开拓创新，但容易冲动行事。运势起伏较大，宜沉着冷静，蓄势待发。",
  巽: "巽卦为风，无孔不入。巽者，柔顺通达之象也。得巽卦者，头脑灵活，善于沟通交际，贵人运极佳。适合从事文化、教育、商业等领域，随风而动，顺势而为。",
  坎: "坎卦为水，流动不息。坎者，险中求通之象也。得坎卦者，智慧深沉，思维缜密，但人生多有波折考验。度过艰难即见光明，水滴石穿，终成大器。",
  离: "离卦为火，光明照耀。离者，文明美丽之象也。得离卦者，才华出众，热情洋溢，有艺术天赋。事业发展宜向外拓展，不宜固守一隅，需防过于张扬。",
  艮: "艮卦为山，稳固不动。艮者，止而后得之象也。得艮卦者，性格沉稳坚毅，做事有始有终。适合从事房地产、建筑、金融等需要耐心的行业。静待时机，厚积薄发。",
  兑: "兑卦为泽，润泽万物。兑者，喜悦和乐之象也。得兑卦者，口才出众，善于表达，人际关系和谐。适合从事演艺、销售、外交等领域。以和为贵，广结善缘。",
};

// 天干五行映射
const 天干五行: Record<string, string> = {
  甲: "木", 乙: "木", 丙: "火", 丁: "火",
  戊: "土", 己: "土", 庚: "金", 辛: "金",
  壬: "水", 癸: "水",
};

// 地支五行映射
const 地支五行: Record<string, string> = {
  子: "水", 丑: "土", 寅: "木", 卯: "木",
  辰: "土", 巳: "火", 午: "火", 未: "土",
  申: "金", 酉: "金", 戌: "土", 亥: "水",
};

// 五行相生
const 五行相生: Record<string, string> = {
  木: "火", 火: "土", 土: "金", 金: "水", 水: "木",
};

// 五行相克
const 五行相克: Record<string, string> = {
  木: "土", 土: "水", 水: "火", 火: "金", 金: "木",
};

// 时辰名称映射
const 时辰名称: Record<string, string> = {
  子: "子时 (23:00-01:00)",
  丑: "丑时 (01:00-03:00)",
  寅: "寅时 (03:00-05:00)",
  卯: "卯时 (05:00-07:00)",
  辰: "辰时 (07:00-09:00)",
  巳: "巳时 (09:00-11:00)",
  午: "午时 (11:00-13:00)",
  未: "未时 (13:00-15:00)",
  申: "申时 (15:00-17:00)",
  酉: "酉时 (17:00-19:00)",
  戌: "戌时 (19:00-21:00)",
  亥: "亥时 (21:00-23:00)",
};

// 确定性哈希函数
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

// 基于哈希生成 0-100 的分数
function generateScore(hash: number, offset: number): number {
  const score = ((hash * 2654435761 + offset * 2246822519) >>> 0) % 101;
  // 确保分数在合理范围内（40-98），避免极端值
  return Math.floor(score * 0.6 + 35);
}

// 计算天干地支
function get干支(year: number): { 天干: string; 地支: string; 生肖: string } {
  const 天干Index = (year - 4) % 10;
  const 地支Index = (year - 4) % 12;
  const 天干Char = 天干[天干Index >= 0 ? 天干Index : 天干Index + 10];
  const 地支Char = 地支[地支Index >= 0 ? 地支Index : 地支Index + 12];
  const 生肖Char = 生肖[地支Index >= 0 ? 地支Index : 地支Index + 12];
  return { 天干: 天干Char, 地支: 地支Char, 生肖: 生肖Char };
}

// 计算命卦
function get命卦(year: number, gender: string): { name: string; element: string; number: number } {
  let num: number;
  if (gender === "男") {
    num = (100 - year) % 9;
    if (num === 0) num = 9;
  } else {
    num = (year - 4) % 9;
    if (num === 0) num = 9;
  }
  const gua = 八卦五行映射[num] || { name: "坤", element: "土" };
  return { ...gua, number: num };
}

// 计算五行分布
function get五行分布(
  yearGan: string,
  yearZhi: string,
  monthGan: string,
  monthZhi: string,
  dayGan: string,
  dayZhi: string,
  hourZhi: string
): Record<string, number> {
  const distribution: Record<string, number> = { 金: 0, 木: 0, 水: 0, 火: 0, 土: 0 };
  const elements = [yearGan, yearZhi, monthGan, monthZhi, dayGan, dayZhi, hourZhi];
  for (const el of elements) {
    const wuxing = 天干五行[el] || 地支五行[el];
    if (wuxing) {
      distribution[wuxing] += 1;
    }
  }
  // 归一化到 0-100
  const total = Object.values(distribution).reduce((a, b) => a + b, 0);
  if (total > 0) {
    for (const key of 五行) {
      distribution[key] = Math.round((distribution[key] / total) * 100);
    }
  }
  // 确保总和为 100
  const sum = Object.values(distribution).reduce((a, b) => a + b, 0);
  if (sum !== 100) {
    distribution["土"] += 100 - sum;
  }
  return distribution;
}

// 根据月日推算月柱天干地支
function get月柱年干月支(yearGan: string, month: number): { 天干: string; 地支: string } {
  // 年上起月法：甲己之年丙作首，乙庚之岁戊为头，丙辛岁首寻庚上，丁壬壬寅顺水流，戊癸之年甲寅首
  const 个月起始天干: Record<string, number> = {
    甲: 2, 己: 2, 乙: 4, 庚: 4, 丙: 6, 辛: 6, 丁: 8, 壬: 8, 戊: 0, 癸: 0,
  };
  const startGan = 个月起始天干[yearGan] ?? 0;
  const 天干Idx = (startGan + month - 1) % 10;
  const 地支Idx = (month + 1) % 12; // 正月=寅(2), 二月=卯(3)...
  return {
    天干: 天干[天干Idx],
    地支: 地支[地支Idx],
  };
}

// 简化日柱天干地支推算
function get日柱(year: number, month: number, day: number): { 天干: string; 地支: string } {
  // 简化算法：使用距离某个已知基准日的偏移量
  const base = new Date(2000, 0, 7); // 2000年1月7日 庚子日
  const target = new Date(year, month - 1, day);
  const diff = Math.floor((target.getTime() - base.getTime()) / (86400 * 1000));
  const 天干Idx = ((diff % 10) + 10) % 10;
  const 地支Idx = ((diff % 12) + 12) % 12;
  return { 天干: 天干[天干Idx], 地支: 地支[地支Idx] };
}

// 事业运描述
const 事业运描述 = [
  "今年事业运势旺盛，有望获得晋升或重要项目机会。贵人相助，领导赏识你的才能。",
  "事业稳步上升，虽无大起，但根基扎实。适合踏实积累，不宜冒进。",
  "事业面临挑战与机遇并存，需要灵活应对。中旬后有转机，宜耐心等待。",
  "事业运势平平，需要更加努力才能取得突破。保持学习，为未来蓄力。",
  "事业运势大吉！有望开创全新局面，适合创业或跳槽。把握时机，大胆行动。",
];

// 财富运描述
const 财富运描述 = [
  "财运亨通，正财稳定，偏财有意外收获。适合投资理财，但需注意分散风险。",
  "财运平稳，收入与支出相抵。适合稳健理财，不宜高风险投资。",
  "财运先抑后扬，前期可能有些压力，后期会逐渐好转。注意节约开支。",
  "财运旺盛，有大笔进账的可能。但切忌贪心，见好就收为上策。",
  "财运需要注意防守，避免不必要的开支和借贷。节俭是福，积少成多。",
];

// 感情运描述
const 感情运描述 = [
  "感情运势极佳，单身者有望遇到心仪对象。已有伴侣者感情更加甜蜜。",
  "感情运势平稳，已有的关系和谐相处。单身者可多参加社交活动。",
  "感情上可能有些小波折，需要多沟通理解。保持包容心态，问题自解。",
  "桃花运旺盛，异性缘佳。但需擦亮双眼，辨别真心，勿被表象迷惑。",
  "感情运势偏弱，不宜强求。先修炼自我，提升自身魅力，缘分自然来。",
];

// 健康运描述
const 健康运描述 = [
  "健康状况良好，精力充沛。适合加强锻炼，保持良好的生活作息。",
  "健康方面需注意劳逸结合，避免过度劳累。定期体检，防患未然。",
  "健康运势一般，容易感到疲劳。注意饮食调理，多食蔬果，少食辛辣。",
  "健康运势不错，但需注意季节交替时的身体变化。适当运动，增强体质。",
  "健康运势需要特别关注，某些旧疾可能复发。遵医嘱，按时服药。",
];

// 学业运描述
const 学业运描述 = [
  "学业运势大吉，思维敏捷，记忆力强。适合考试、面试、学习新技能。",
  "学业运势良好，虽然进步缓慢但稳中有升。坚持努力，必有收获。",
  "学业运势平平，容易分心走神。需要制定学习计划，集中精力攻克难关。",
  "学业运势旺盛，灵感涌现，创造力强。适合从事研究、写作等脑力工作。",
  "学业运势需要注意基础巩固，不要好高骛远。脚踏实地，一步一个脚印。",
];

// 每日宜忌
const 宜列表 = [
  "祭祀", "祈福", "开光", "出行", "嫁娶", "纳采", "入宅", "移徙",
  "安床", "修造", "动土", "开市", "交易", "立券", "求财", "栽种",
  "牧养", "纳畜", "入殓", "安葬", "启攒", "破土", "求嗣", "解除",
  "沐浴", "扫舍", "捕捉", "结网", "取渔", "入学", "上任", "会友",
];

const 忌列表 = [
  "祭祀", "祈福", "嫁娶", "开市", "入宅", "动土", "破土", "安床",
  "出行", "求财", "纳畜", "修造", "移徙", "安葬", "上梁", "开仓",
  "纳采", "交易", "立券", "栽种", "掘井", "开渠", "造桥", "造船",
];

function get宜忌(hash: number, count: number): { 宜: string[]; 忌: string[] } {
  const 宜: string[] = [];
  const 忌: string[] = [];
  const used = new Set<string>();
  for (let i = 0; i < count; i++) {
    const yIdx = (hash + i * 7) % 宜列表.length;
    const nIdx = (hash + i * 13 + 50) % 忌列表.length;
    if (!used.has(宜列表[yIdx])) {
      宜.push(宜列表[yIdx]);
      used.add(宜列表[yIdx]);
    }
    if (!used.has(忌列表[nIdx])) {
      忌.push(忌列表[nIdx]);
      used.add(忌列表[nIdx]);
    }
  }
  return { 宜: 宜.slice(0, count), 忌: 忌.slice(0, count) };
}

// 五行缺失建议
function get五行建议(distribution: Record<string, number>, 命卦Element: string): string {
  const sorted = Object.entries(distribution).sort((a, b) => a[1] - b[1]);
  const weakest = sorted[0][0];
  const suggestions: Record<string, string> = {
    金: "五行缺金，建议佩戴金银饰品，穿着白色系衣物，多接触西方方位。可从事金融、法律相关行业以补金气。",
    木: "五行缺木，建议多亲近自然，养植花草，穿着绿色系衣物。可从事教育、文化相关行业以补木气。",
    水: "五行缺水，建议多饮水，居住近水之地，穿着黑色或深蓝色衣物。可从事物流、旅游相关行业以补水气。",
    火: "五行缺火，建议多晒太阳，保持积极乐观心态，穿着红色系衣物。可从事餐饮、科技相关行业以补火气。",
    土: "五行缺土，建议亲近大地，登山踏青，穿着黄色或棕色衣物。可从事房地产、农业相关行业以补土气。",
  };
  return suggestions[weakest] || "五行均衡，命格极佳。保持现有状态，顺势而为，必有所成。";
}

// 综合运势等级
function get运势等级(score: number): { level: string; desc: string } {
  if (score >= 90) return { level: "大吉", desc: "天命所归，万事亨通" };
  if (score >= 80) return { level: "上吉", desc: "运势旺盛，前途光明" };
  if (score >= 70) return { level: "中吉", desc: "吉星高照，稳步前行" };
  if (score >= 60) return { level: "小吉", desc: "平稳中有惊喜" };
  if (score >= 50) return { level: "平", desc: "中规中矩，静待时机" };
  if (score >= 40) return { level: "小凶", desc: "需谨慎行事，韬光养晦" };
  return { level: "凶", desc: "运势低迷，需修身养德" };
}

// ==================== POST 请求处理 ====================
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, gender, birthDate, birthHour, schoolYear, occupation } = body;

    // 参数验证
    if (!name || !gender || !birthDate || !birthHour) {
      return NextResponse.json(
        { error: "请填写完整的占卜信息" },
        { status: 400 }
      );
    }

    const birthYear = new Date(birthDate).getFullYear();
    const birthMonth = new Date(birthDate).getMonth() + 1;
    const birthDay = new Date(birthDate).getDate();

    // 1. 计算年柱天干地支与生肖
    const 年柱 = get干支(birthYear);

    // 2. 计算月柱
    const 月柱 = get月柱年干月支(年柱.天干, birthMonth);

    // 3. 计算日柱
    const 日柱 = get日柱(birthYear, birthMonth, birthDay);

    // 4. 计算命卦
    const 命卦 = get命卦(birthYear, gender);

    // 5. 计算五行分布
    const 五行分布 = get五行分布(
      年柱.天干, 年柱.地支,
      月柱.天干, 月柱.地支,
      日柱.天干, 日柱.地支,
      birthHour
    );

    // 6. 生成确定性哈希用于分数计算
    const hashBase = `${name}${gender}${birthDate}${birthHour}${schoolYear || ""}${occupation || ""}`;
    const hash = hashString(hashBase);

    // 7. 计算各项运势分数
    const 事业运 = generateScore(hash, 1);
    const 财富运 = generateScore(hash, 2);
    const 感情运 = generateScore(hash, 3);
    const 健康运 = generateScore(hash, 4);
    const 学业运 = generateScore(hash, 5);

    // 8. 总运势 = 各项加权平均
    const 总运势 = Math.round(事业运 * 0.25 + 财富运 * 0.2 + 感情运 * 0.15 + 健康运 * 0.2 + 学业运 * 0.2);

    // 9. 运势等级
    const 运势等级 = get运势等级(总运势);

    // 10. 每日宜忌
    const 每日宜忌 = get宜忌(hash, 5);

    // 11. 五行建议
    const 五行建议 = get五行建议(五行分布, 命卦.element);

    // 12. 选择运势描述
    const selectDesc = (list: string[], offset: number) => {
      const idx = (hash + offset) % list.length;
      return list[idx];
    };

    // 构建返回结果
    const result = {
      // 基本信息
      name,
      gender,
      birthDate,
      birthHourName: 时辰名称[birthHour] || birthHour,
      schoolYear: schoolYear || "未提供",
      occupation: occupation || "未提供",
      age: new Date().getFullYear() - birthYear,

      // 八字信息
      四柱八字: {
        年柱: 年柱.天干 + 年柱.地支,
        月柱: 月柱.天干 + 月柱.地支,
        日柱: 日柱.天干 + 日柱.地支,
        时柱: birthHour + "时",
      },
      天干地支: 年柱.天干 + 年柱.地支 + "年",
      生肖: 年柱.生肖,

      // 命卦
      命卦: {
        name: 命卦.name,
        element: 命卦.element,
        number: 命卦.number,
        description: 八卦描述[命卦.name] || "命格特殊，需仔细推演。",
      },

      // 五行
      五行分布,
      五行建议,

      // 运势
      总运势,
      运势等级,
      流年运势: {
        事业运: {
          score: 事业运,
          description: selectDesc(事业运描述, 10),
        },
        财富运: {
          score: 财富运,
          description: selectDesc(财富运描述, 20),
        },
        感情运: {
          score: 感情运,
          description: selectDesc(感情运描述, 30),
        },
        健康运: {
          score: 健康运,
          description: selectDesc(健康运描述, 40),
        },
        学业运: {
          score: 学业运,
          description: selectDesc(学业运描述, 50),
        },
      },

      // 每日宜忌
      每日宜忌,
    };

    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { error: "占卜计算出现异常，请稍后重试" },
      { status: 500 }
    );
  }
}
