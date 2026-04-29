# 天机阁 · 玄学气运预测网站 - 工作日志

## 2026-04-29 初始开发

### 概述
构建了一个完整的中文玄学命理预测网站（天机阁），包含三阶段单页应用：信息输入、占卜动画、命盘结果展示。

### 文件修改清单

1. **`src/app/api/fortune/route.ts`** (新建)
   - POST API 端点，接收用户表单数据
   - 实现了完整的天干地支、四柱八字、五行分布计算
   - 命卦计算算法（男: (100-Y)%9, 女: (Y-4)%9）
   - 确定性哈希函数生成一致的运势分数
   - 包含五运（事业、财富、感情、健康、学业）描述库
   - 每日宜忌生成逻辑

2. **`src/app/globals.css`** (重写)
   - 深紫色/黑色为主的暗色神秘主题
   - 金色（#d4a853）作为主强调色
   - 自定义 CSS 动画：rotate-bagua、float-particle、pulse-glow、fadeInUp、golden-shimmer、rune-orbit、text-glow 等
   - 自定义滚动条样式
   - 神秘主题卡片样式（mystical-card、glow-card）
   - 自定义输入框/按钮/进度条样式

3. **`src/app/layout.tsx`** (重写)
   - 中文语言标签（zh-CN）
   - 玄学主题元数据
   - ☯ emoji favicon
   - serif 字体优先 + Geist fallback

4. **`src/app/page.tsx`** (重写)
   - **Phase 1 - InputPhase**: 表单含姓名、性别（Radio）、出生日期（Date）、出生时辰（Select 12地支）、入学时间（年份Select）、当前职业
   - **Phase 2 - DivinationPhase**: 旋转八卦 SVG（含太极阴阳图 + 八卦卦象）、浮动符文动画、金色粒子、循环占卜短语、5秒后调用 API
   - **Phase 3 - ResultPhase**: 圆形进度总运势评分、四柱八字展示、命卦卡片、五行分布条形图、五运运势卡片（含进度条+描述）、每日宜忌标签
   - FloatingParticles 背景粒子组件
   - BaguaSymbol 八卦 SVG 图案组件
   - CircularProgress 圆形进度指示器
   - FiveElementsChart 五行柱状图组件
   - framer-motion AnimatePresence 管理三阶段切换

### 技术亮点
- 所有运势计算基于确定性哈希，相同输入始终产生相同结果
- framer-motion 实现流畅的页面过渡和元素动画
- 使用 shadcn/ui 组件（Input、Select、RadioGroup、Label、Button）
- 完整的表单验证
- 响应式设计适配移动端和桌面端
- 自定义 SVG 八卦图案包含完整的太极阴阳和八卦卦象

## 2026-04-29 增强功能更新

### 概述
新增"事情预测"特色功能、扩展用户输入字段、优化标签命名，增强用户互动体验。

### 文件修改清单

1. **`src/app/page.tsx`** (修改)
   - 重命名 `schoolYear` → `graduationYear`，标签从"入学/毕业年份"改为"毕业年份"，placeholder改为"如：2020"
   - `FortuneResult` 接口新增 `事情预测` 可选字段（task、category、timeframe、successRate、level、analysis、advice、luckyTime、luckyDirection、keyFactor）
   - `CircularProgress` 组件新增 `label` prop，默认值"综合运势"，事情预测中使用"成功率"
   - **InputPhase 新增输入字段**：
     - 更多信息区：现居地、手机尾号(后4位)、梦想职业、近期状态(Select)
     - 事情预测区（紫色主题，始终可见）：您想做的事(textarea)、事情类别(Select)、计划时间(Select)
   - **InputPhase handleSubmit** 新增所有新字段的 FormData 提交逻辑
   - **ResultPhase** 新增"事情预测结果"卡片：展示成功率圆形进度、预测事项、命理分析、关键因素/吉祥时辰/吉利方位三栏、天机建议

2. **`src/app/api/fortune/route.ts`** (修改)
   - 新增 `FortuneResult` 接口定义（用于类型标注）
   - POST 参数解构新增：`graduationYear, residence, phoneLastDigits, dreamCareer, recentMood, taskDescription, taskCategory, taskTimeframe`
   - `hashBase` 更新包含新字段
   - 新增事情预测计算逻辑：
     - 基于任务特定哈希生成原始成功率
     - 结合对应运势分数（40%）与任务哈希（60%）混合计算最终成功率
     - 事情类别→运势维度映射（学业考试→学业运、创业投资→财富运等）
     - 五级运势等级判定（大吉/上吉/中吉/小凶/凶）
     - 命理分析模板基于四柱八字、五行、命卦动态生成
     - 吉祥时辰、吉利方位、关键因素、天机建议

3. **`src/app/globals.css`** (修改)
   - 新增 `textarea.mystical-input` 系列样式（background、border、color、focus、placeholder）

### 技术亮点
- 事情预测成功率计算融合命盘运势与任务特定因素，结果更具个性化
- 紫色主题区分预测功能区与其他表单区域
- CircularProgress 组件 label prop 复用，支持不同场景显示不同标签
