# 智慧校园 4.0 · 项目规范

> 本文件是「智慧校园4.0」的设计与工程约定。新增页面、模块或卡片之前先读这里，避免视觉与交互各写一套。

---

## 一、技术形态

| 项目 | 约定 |
| --- | --- |
| 交付形态 | 多文件：`index.html` + `assets/styles.css` + `js/**/*.js`（classic script，按顺序加载），无构建步骤；静态资源统一带 `?v=YYYYMMDD` 版本号，**每次发布改一次**，避免 HTML 与脚本串版本 |
| 脚本拆分 | 四个目录：`core`（配置 / 工具数据层 / 登录）→ `pages`（每个页面一个文件）→ `ai`（配置 / 资料库 / 检索 / 本地问答 / 接口客户端 / 服务 / 面板）→ `app`（事件 / 启动 / 视觉交互）。编号即加载顺序，新增模块按目录取下一个号 |
| 在线能力 | WorkBuddy 云服务 LLM 接口（`cloud.llm.chat.completions.create`），免密钥、流式输出；未配置、断网、域名未授权或额度不足时自动退回本地规则引擎 |
| AI 计费 | 消耗**应用创建者**的 WorkBuddy LLM 额度；访问者无需账号、不消耗访问者个人积分；页面内的校园积分为本地演示数据，与 AI 调用无关。口径集中在 `AI_BILLING`（`js/ai/40-ai-config.js`） |
| 数据 | `localStorage`，键名 `limeCampusDB_v1`；`migrateDB()` 做旧数据平滑升级，不清空用户内容 |
| 图片 | 用户上传图片经 canvas 压缩后以 dataURL 存在同一条记录里 |
| 响应式断点 | 560 / 640 / 760 / 980 / 1080 / 1200 px |
| 图标 | `ICON` 字典（24×24 线性描边），`icon(name, size)` / `iconFill()` 输出 |
| 插画 | `ART` 字典（120×120 扁平插画），描边统一暖墨 `#43382C`，主填色沙 `#E7CBA9`，点缀陶土 `#C98A63` / 琥珀 `#E9A13B` |

```
.
├── index.html                # 结构 + 脚本引用
├── assets/styles.css         # 全部样式（第 16 节为 V3 主题层，末尾为 AI 计费披露）
└── js/
    ├── core/
    │   ├── 00-config.js      # 云服务 publicConfig（可公开）
    │   ├── 01-core.js        # 工具、插画、数据层、积分、状态、浮层
    │   └── 02-auth.js        # 登录 / 注册
    ├── pages/
    │   ├── 10-shell.js       # 页面容器与切换
    │   ├── 11-home.js        # 首页、周课表、校历卡
    │   ├── 12-schedule.js    # 课表增删改 / 智能导入
    │   ├── 20-services.js    # 校园服务入口
    │   ├── 21-freshman.js    # 新生必看
    │   ├── 22-market.js      # 跳蚤市场
    │   ├── 23-errands.js     # 校园跑腿
    │   ├── 24-shops.js       # 附近好店
    │   ├── 25-points.js      # 积分中心与推流
    │   ├── 30-wall.js        # 校园墙
    │   ├── 31-tools.js       # 工具箱
    │   └── 32-profile.js     # 个人中心
    ├── ai/
    │   ├── 40-ai-config.js   # 系统提示词、模型偏好、AI_RUNTIME、AI_BILLING
    │   ├── 41-ai-library.js  # 资料库快照 + 班级名额
    │   ├── 42-ai-retrieval.js# 意图匹配 / 结构化回答 / 兜底检索
    │   ├── 43-ai-local.js    # 校园数据问答
    │   ├── 44-ai-client.js   # WorkBuddy LLM 接口封装
    │   ├── 45-ai-service.js  # 路由 / 上下文 / 超时 / 降级
    │   └── 46-ai-panel.js    # 对话面板 / 资料库层 / 计费说明层
    └── app/
        ├── 50-events.js      # 事件分发 + 启动
        ├── 51-fx.js          # 光斑 / 立方体背景 / 磁性 / 3D 倾斜
        └── 52-welcome.js     # GDIP 蒙赛克 / 欢迎页与登录页切换
```

## 二、视觉系统

> **V3「Paper & Clay」**：暖纸面 + 墨 + 陶土。参考 Claude 的暖纸与衬线标题、ChatGPT 的克制留白、Aceternity 的聚光与点阵，主题色不沿用参考站点的蓝/灰。
> 全部样式集中在 `assets/styles.css` 末段 **第 16 节（`/* >>> V3-START */` 标记内）**，改配色优先改这一层与 `:root`，不要再往第 0/12/14 节里加规则。

- **配色**：`--paper #F4F1EA` 纸面；`--ink #1C1A17` 墨；`--clay #C0563B` 陶土（主行动、强调、价格）；`--sand #EDE0CB` 沙（选中、标签底）；`--sage #5F7A63` 鼠尾草（成功/正数）；深色块统一 `--ink-block #201D19`（登录左侧、市场主卡、个人中心、积分卡）。
- **字体**：正文系统无衬线；**大数字与拉丁标题用衬线** `--serif`（课表日期、价格、积分、统计、日历月份）；小标签用等宽 `--mono` 加大写英文；登录页主标题是唯一的中文衬线标题。
- **圆角**：卡片 16–22px、输入框 14px、胶囊只给主行动与筛选 chip；底部导航是**悬浮圆角 dock**（移动端 24px 圆角、桌面 999px 胶囊）。
- **分隔**：只靠 1px 发丝线（`--line` / `--line-2`）与留白，阴影仅用于浮层、悬浮态、详情层；卡片默认 `--shadow-sm`。
- **留白**：区块标题带编号（`01`、`02`…，编号用陶土色）与英文副标，标题上方一条发丝线。
- **质感**：页面顶部一层极淡点阵（`.app::after`，Aceternity dotted glow）+ 两枚暖色柔光，柔光带 26s 缓慢漂移；另有一层跟随指针的径向暖光（JS 写 `--gx/--gy`）。
- **登录页背景**：全屏 Canvas 等距立方体网格（`.auth-bg > #authCubes`，模块见 `js/app/51-fx.js`）——高度由两组正弦波驱动起伏、指针附近抬升、叠一枚暖色聚光；Canvas 用径向 `mask-image` 淡出，登录页隐藏时停帧，`prefers-reduced-motion` 下只画一帧。
- **光斑交互**：卡片带 `.spot` 类时，`::after` 用 `--mx/--my` 画跟随指针的径向暖光；`#pageHost` / `#sheetRoot` 的 DOM 变化由 MutationObserver 补类名，触屏与 `prefers-reduced-motion` 下不生效。
- **流光描边**：`.svc-card` / `.m-card` / `.w-card` / `.g-card` 悬停时 `::before` 用遮罩画 1px 流光边（`ringSweep` 2.6s）。
- **3D 倾斜**：服务卡在精细指针下按指针位置产生 ≤4.5° 的 `rotateX/rotateY` + `scale(1.008)`（`js/app/51-fx.js`），触屏不生效。
- **磁性入口**：AI 悬浮球在指针 170px 内被吸引（`--fx/--fy`），登录主按钮带 4.6s 呼吸光。
- **插图**：`ART` 用暖墨描边 + 沙/陶土填色，`ART_BG` 为同色系浅底；新增插画只能从这套色里取，不要引入冷蓝。
- **欢迎页例外**：入口页以 GDIP 照片蒙赛克为主体，使用纸白 / 黑 / 红与细线结构标注；桌面单排 GDIP、窄屏两列。每个字母是独立轮播区域，悬停时交错淡入切换，触屏点击切换；离开、隐藏或 `prefers-reduced-motion` 时停止自动轮播。底部登录按钮是唯一进入登录页的入口。


## 三、动画规范（强制）

### 3.1 卡片出场动画必须统一

> **所有卡片类型展示方式的动画都必须与已有校园墙展示动画保持一致。**

任何列表卡片——校园墙、跳蚤市场、校园跑腿、附近好店，以及后续新增的任何卡片流——都不得单独设计入场动画。

唯一实现：

```css
.card-flow > *{animation:cardIn .52s var(--ease-out) backwards;animation-delay:calc(var(--i,0) * 26ms)}
@keyframes cardIn{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
```

| 参数 | 取值 | 说明 |
| --- | --- | --- |
| 时长 | `0.52s` | 四个列表完全一致 |
| 缓动 | `cubic-bezier(.2,.9,.2,1)`（`--ease-out`） | 不允许使用 ease / linear |
| 位移 | `translateY(14px) → 0` | 不允许改成缩放或横移 |
| 透明度 | `0 → 1` | — |
| 错峰 | 每张 `26ms`，序号封顶 8 | 超出 8 的卡片不再累加延迟 |
| 填充 | `backwards` | **不能用 `both` / `forwards`**：动画结束后会覆盖 hover 的 `transform`，导致悬浮失效 |

### 3.2 已接入的列表

| 模块 | 容器 | 卡片 |
| --- | --- | --- |
| 校园墙 | `.wall-wrap.card-flow` | `.w-card` |
| 跳蚤市场 | `.masonry.card-flow` | `.m-card` |
| 校园跑腿 | `.masonry.card-flow` | `.m-card` |
| 附近好店 | `.masonry.card-flow` | `.m-card` |

### 3.3 新增卡片类型的接入步骤

1. 容器加 `card-flow` 类；
2. 每张卡片内联 `style="--i:${Math.min(index, 8)}"`；
3. 卡片本体只写 `hover` / `active`，**不写 `animation`**；
4. 复用 `.m-card` / `.w-card` 的悬浮反馈：`translateY(-2px)` + `var(--shadow-sm)`，不做缩放；
5. `prefers-reduced-motion` 下交由全局规则压到 `0.001ms`，无需单独处理。

### 3.4 卡片 → 详情转场

- **四类卡片（校园墙 / 跳蚤市场 / 校园跑腿 / 附近好店）点击后一律进入全屏详情层**，不允许再用底部弹层承载卡片详情——弹层只能用于表单、筛选、积分等辅助操作。
- 卡片封面克隆为 `.hero-fly`，用 WAAPI 做 FLIP：`left/top/width/height/borderRadius` 从卡片矩形飞到详情封面矩形；
- 进入 `460ms cubic-bezier(.3,.72,.2,1)`，返回 `400ms`，时长全站一致；
- 详情层 `420ms` 淡入，内容在 `300ms` 后错峰上浮；
- 支持下拉 96px 关闭；
- 实现统一走 `openDetailLayer({ kind, id, html, bg, heroHTML, from, bind })` → `startDetail()` → `closeDetail()`，四个模块共用，不得各写一套；
- 关闭时按 `kind` 找回对应卡片（`open-post` / `open-item` / `open-errand` / `open-shop`）飞回原位置；找不到卡片（如从「我的发布」弹层打开）则退化为淡出；
- 详情底部操作统一用 `.detail__bar.detail__bar--actions`；详情内再打开浮层时，`#sheetRoot` 会自动加 `is-over-detail` 抬到最上层。
- 详情层的顶部返回栏与底部操作栏都是 `position:fixed`，锚定视口、不随内容滚动。**`.detail` 不能使用 `will-change: transform`（或任何 transform / filter）**——那会让它变成 fixed 子元素的包含块，导致两条栏跟着内容滚走；需要合成提示时用 `will-change: opacity`。

### 3.5 页面与浮层

- 页面切换：`pageEnter .46s`，离开 `150ms` 上移淡出；
- 底部浮层：`translateY(102%) → 0`，`340ms`；
- 桌面弹窗：`scale(.97) → 1` + 淡入，`280ms`；
- 所有动效必须响应 `prefers-reduced-motion`。

## 四、模块地图

| 页面 | 状态 | 渲染入口 |
| --- | --- | --- |
| 欢迎页 | 未登录初始视图 | `52-welcome.js` → GDIP 字模与照片格；`showLogin()` / `showWelcome()` |
| 首页 | `tab=home` | `homeHTML()` → `scheduleHTML()` + `homeCalendarHTML()` |
| 校园服务 | `tab=services, page=null` | `servicesHTML()` |
| 跳蚤市场 | `page=market` | `marketHTML()` + `refreshMarket()` |
| 校园跑腿 | `page=errands` | `errandsHTML()` + `refreshErrands()` |
| 校园墙 | `page=wall` | `wallHTML()` + `refreshWall()` |
| 附近好店 | `page=shops` | `shopsHTML()` + `refreshShops()` |
| 个人中心 | `tab=profile` | `profileHTML()` |
| 小轻 AI（含资料库问答） | 浮层 | `aiAnswer()` → `libAnswer()`；`openLibrary()` |
| 新生必看（校园服务页内） | — | `freshmanSectionHTML()` → `openGuide()` / `openQA()` |

> 新生必看的指南卡属于「卡片」，点击走全屏详情层（`kind: 'guide'`）；新生问答属于列表 + 表单，用弹层承载，不参与卡片入场动画。

浮层与工具：`openSheet()` / `closeSheet()`、`openCourseForm()`、`openImportSheet()`、`openTool('room|lost|phone|calendar')`、`openCalendar()`、`openPoints()`、`openBoostHub()`、`openBoostSheet()`。

## 五、积分与推流

- **获取**：新人注册 +100；发布闲置 / 跑腿 +10；发帖 +5；完成交易 +20；完成跑腿 +15；解答新生提问 +5；邀请新同学 +30。
- **消耗**：推流档位 `30 积分 / 6 小时`、`80 积分 / 24 小时`、`200 积分 / 3 天`。
- **排序**：列表先按「推流中」置顶，再按原有排序（最新 / 价格 / 悬赏 / 热门）；已完成的跑腿沉底。
- **字段**：`user.points`、`user.pointLog[]`、`record.boostUntil`（时间戳，过期自动失效）、`record.photos[]`。
- **文案**：推流统一叫「积分推流 / 推流曝光」，不出现「置顶购买」「付费推广」等表述。

## 六、照片导入

- 入口：跳蚤市场发布、校园跑腿发布；最多 4 张，首图作封面。
- 处理：`compressImage()` 用 canvas 缩放到长边 1000px、JPEG 质量 0.72、白底填充（避免透明 PNG 变黑）。
- 展示：卡片 `.m-cover.has-photo` 用 `img.photo` 绝对定位铺满；详情用 `.item-cover` + `.item-thumbs` 缩略图切换。
- 兜底：`localStorage` 写满时 `saveDB()` 提示「本机存储空间不足，可减少图片数量后重试」。

## 七、校历

- 数据：`CAL_EVENTS` 用 ISO 日期区间（`start` / `end`），`start === end` 表示单日活动。
- 布局：周一为第一列；日期格内最多 2 个事项标签，超出折叠为 `+N`；格下展开选中日详情与本月安排列表。
- 颜色：假期 / 学期 `green`，考试 `red`，活动 `amber`，其他 `blue`。
- 交互：切换月份时，若当前选中日期不在该月，自动选中该月首个事件日期；「回到本月」以系统时间为准。
- **两处入口，共用一套数据与渲染规则**：
  - 首页课表下方 `homeCalendarHTML()`：与课表卡同款报头（月份数字 + 教学周区间 + 本月事项数），月历格内只显示 1 个短标签，下方列本月最多 3 条安排；月份状态存在 `state.monthOffset`，切换时保留滚动位置。
  - 完整校历浮层 `openCalendar(focus)`：格内 2 个标签 + 选中日详情 + 本月安排列表，可被首页任意日期或「完整校历」按钮定位打开。
- 首页点日期不再弹小层，而是直接打开完整校历并定位到那一天，避免出现两套详情。

## 八、内容与安全

- 所有账号、商品、跑腿单与店铺均为演示数据，不涉及真实个人信息。
- 交易与跑腿提示线下当面确认，平台不提供真实支付。
- 商家入驻为演示入口，提交后仅在本地生效。

## 九、小轻 AI 与学校资源库

### 9.1 数据来源

- 资料库：WorkBuddy「学校资源库」（人工智能学院），`https://www.workbuddy.cn/space/d/WhC01MzSeyU5gIxRuYLKwZ`。
- 资料库以只读快照内置在 `LIBRARY`（`js/ai/41-ai-library.js`）：4 组 / 19 份材料（奖学金 9、45 期积极分子 4、寒假社会实践 5、其他 1）；本地回答不联网。
- 每份文件保留 `id / t（全名）/ s（短名）/ k（格式）/ u（原链接）/ tag / brief`，`LIB_DOCS`、`LIB_BY_ID` 由 `groups` 自动展开。
- 快照日期写在 `LIBRARY.synced`；资料库更新后替换数据并改日期即可，不引入运行时网络请求。

### 9.2 检索与回答

| 层级 | 实现 | 说明 |
| --- | --- | --- |
| 意图 | `libAnswer()` | 按「社会实践」「奖学金 / 名额」「入党 / 积极分子 / 推优」「资料库总览」顺序匹配；总览只认「资料库 / 有哪些资料」这类问法，避免把「资料库里关于 X」劫持成目录 |
| 专项 | `libScholarship()` / `libActivist()` / `libPractice()` | 按通知、细则、模板重组成结构化回答，不整段抄原文 |
| 兜底 | `libFind()` | 中文二元组重合度 + 标签专有词加权检索 19 份文件，`score ≥ 3` 命中；命中但无要点时提示「只有这份文件，以发布单位通知为准」 |
| 名额 | `LIB_QUOTA` | 72 个班级的 `[人数, 一等, 二等, 三等]`，问题里出现班级名即命中 |

- 社会实践回答（`libPractice()`）覆盖：组队与指导教师、六类活动、材料清单（报告字数、视频时长/画幅、照片张数）、申报与总结时间节点、智慧校园 3.0 入口与保险要求。
- 预设提示词固定两条：`奖学金怎么申领`、`申请入党积极分子需要准备什么`，对应 `.ai-chip[data-aiq]`；社会实践等问题直接输入即可。
- 回答用 `.ai-doc` 结构：`ai-kicker` / `h5` / `ul` / `ai-quota` / `ai-tiers` / `ai-tick` / `ai-note`。
- `.ai-tick` 可点击勾选（仅本机视觉状态），用于材料清单自查。
- 来源统一走 `libSrc()` 渲染成 `.ai-src`，点击跳回资料库原文。
- 长回答的 `.ai-msg` 加 `ai-msg--wide`，气泡放开到 100%；短回答仍保持 82%。

### 9.3 资料库浏览层

- `openLibrary()` 复用 `sheet--ai` 外壳，从 AI 头部「资料库」进入，`data-action="open-library"` 分发。
- 顶部统计「19 份材料已接入小轻」，按 4 组列出全部文件，行内 `ftag` 标格式，点击打开资料库节点。
- 底部「在 WorkBuddy 资料库打开」回到根目录；左上返回键 `data-action="open-ai"` 回到对话，历史消息不丢。

### 9.4 在线模型（`js/ai/44-ai-client.js` + `js/ai/45-ai-service.js`）

**接口**：WorkBuddy 云服务的 LLM API —— `cloud.llm.chat.completions.create({ stream: true })`，走 SSE 流式返回；模型列表用 `cloud.llm.models.list()`。`js/core/00-config.js` 保存激活时返回的 `publicConfig`（endpoint / publishableKey / oauthRelayBaseUrl），SDK 从 jsDelivr 按需加载，打开 AI 面板时预热。

**在线链路涉及的四个文件**（资料库快照与本地问答见 9.1 / 9.2，改 AI 只改对应那一层）：

| 文件 | 职责 |
| --- | --- |
| `40-ai-config.js` | 系统提示词、模型偏好、`AI_RUNTIME`（超时 / 节流 / 摘要预算）、`AI_BILLING` |
| `44-ai-client.js` | SDK 加载、客户端与模型选择、流式调用、错误码归一（`WBAI`） |
| `45-ai-service.js` | 路由判定、资料库摘要装配、节流、45s 超时、降级文案（`AIService`） |
| `46-ai-panel.js` | 气泡、流式渲染、面板 / 资料库层 / 计费说明层 |

- 路由：课表、二手、跑腿、积分、奖学金、入党、社会实践等本地能答的继续走本地；只有本地兜底（资料库没有）或「帮我写 / 翻译 / 润色 / 总结」类问题才调用在线模型。
- 上下文：把 19 份材料的目录与 `libFind()` 命中要点压成受 `contextBudget`（3200 字）限制的摘要，放在 system 之后；system 明确「只能依据摘要、不要编造、220 字以内」，且必须是 `messages[0]`（SDK 不代填，缺失会直接报错）。
- 模型：优先 `deepseek-v4.1-flash` → `glm-5.3-flash` → `hunyuan-chat`，再退回非推理模型；`disabled: true` 的模型不参与兜底，空目录按 `no_model` 处理。
- 交互：`.ai-stream` 流式写入，等待期沿用 typing；完成后追加 `.ai-cloud-note`（模型名 · 以资料库原文为准）。
- 稳定性：客户端节流 1.5s、单次 45s 超时（`AbortController`）、中断时保留已生成文本并标注「生成中断」。
- 环境自检：`AIService.envIssue()` 在发请求**之前**判断 `file:` 协议与 `navigator.onLine`，命中就直接给结论，不浪费一次必然失败的网络往返；此时面板头部显示「本地模式 · 在线模型不可用」、底部提示条同步切换，说明层顶部给出原因与修复命令。
- 降级：未配置、SDK 加载失败、`file://`、离线、`auth_` / `quota_` / `gateway_`（含 `gateway_network_error`）/ `model_` / `request_` 错误、超时、空返回，都会退回本地答案并说明原因；写作类请求接不住时不再套用「资料库里没找到」，而是明确说明需要在线模型。

**计费（必须如实说明）**：

- 调用消耗**应用创建者**（部署者）的 WorkBuddy LLM 额度；`quota_` 前缀就是这个额度用完或被限流。
- 访问者不需要 WorkBuddy 账号、不需要 API Key，调用**不消耗访问者本人**的任何积分或额度。
- 页面里的「校园积分」是本地演示数据（`localStorage`），只用于发布 / 跑腿 / 推流；AI 问答不读不写 `pointLog`，问多少次都不扣分。
- 响应里的 `usage.credit` 只作诊断，不是账单也不是余额；额度在 WorkBuddy 控制台查看。
- 用量可见性：应用内只累计 `usage` 回传的 `total_tokens` 与 `credit`（每次调用 0.01–0.02 credits、约 1000 tokens，2026-10-30 实测），**不展示剩余额度**——接口没有这个字段，余额与账期一律指向 WorkBuddy 控制台。
- 口径只写在 `AI_BILLING`（`40-ai-config.js`）一处，面板底部提示条与「在线模型与积分」说明层都读它，禁止在别处另写一份文案。

**安全**：浏览器只带 `publishableKey`（本身不带权限，服务端做 Origin 校验）；不把账号密码、身份证、手机号拼进提示词；模型输出按纯文本渲染（流式用 `textContent`，历史用 `esc()`）。

### 9.5 隐私

- 资料库中的学生姓名、邮箱、成绩单等个人信息不进入快照，只保留制度、流程、名额与公开通知。
- AI 回答里不出现具体学生姓名，演示数据与真实文件分离。

## 十、变更记录

| 日期 | 内容 |
| --- | --- |
| 2026-11-01 | 新增 GDIP 照片蒙赛克欢迎页：38 张校园照片、按字母区域悬停 / 触屏轮播、响应式两列布局与底部登录入口；退出登录返回欢迎页 |
| 2026-10-30 | 说明层新增用量统计：累计调用次数、`total_tokens`、接口上报 `credit`，并给出单次实测（约 1000 tokens / 0.01–0.02 credits）；明确接口不暴露余额，额度只看控制台 |
| 2026-10-30 | 修复 `file://` 打开时在线模型静默失败：新增 `AIService.envIssue()` 环境自检（file 协议 / 离线），面板头部与提示条切「本地模式」，说明层给出原因与修复命令；写作类请求不再套用「资料库里没找到」，改为明确说明需要在线模型 |
| 2026-10-30 | **结构重构**：`js/` 按 `core / pages / ai / app` 分目录，页面大文件按功能拆成 12 个模块，AI 拆成 7 个（配置 / 资料库 / 检索 / 本地问答 / WorkBuddy 客户端 / 服务 / 面板）；AI 调用统一收敛到 `44-ai-client`，新增 `AI_BILLING` 计费声明、面板底部常驻提示与「在线模型与积分」说明层，明确不消耗访问者积分、不扣校园积分 |
| 2026-10-30 | 工程结构拆分为 `index.html` + `assets/styles.css` + `js/*.js`（9 个模块）；小轻接入 WorkBuddy 云服务在线模型，新增 `00-cloud-config` / `07-cloud-ai`，支持流式回答、模型选择、45s 超时与本地降级 |
| 2026-10-29 | 小轻 AI 接入「学校资源库」快照（4 组 / 19 份材料），新增奖学金、入党积极分子两条预设问法与结构化回答；新增资料库浏览层与班级名额查询 |
| 2026-10-29 | 校历改为月历网格；新增校园跑腿、附近好店；接入积分推流与照片导入；四类卡片统一 `card-flow` 出场动画并写入本规范 |
| 2026-10-29 | 修正跳蚤市场 / 校园跑腿的详情转场：由底部弹层改为与校园墙一致的全屏详情 + 封面飞入，抽 `openDetailLayer()` 统一四类卡片 |
| 2026-10-29 | 首页课表下方新增校历月历卡（`homeCalendarHTML()`），与课表卡共用报头语言，点日期直达完整校历；修复「回到本周」不生效 |
| 2026-10-29 | 校园服务新增「新生必看」：4 篇指南（全屏详情）+ 新生问答（提问 / 学长学姐解答，解答 +5 积分） |
| 2026-10-29 | **V3 视觉系统 Paper & Clay**：整体换成暖纸 / 墨 / 陶土配色，登录与个人中心改为深墨底 + 陶土聚光；课表、校历、服务卡、详情、浮层、AI 面板全部重绘；底部导航改悬浮 dock；插图与 3D 校园模型改用暖色系；新增卡片跟随光斑与顶部点阵。样式集中在第 16 节，功能与数据未改 |
| 2026-10-30 | **登录页换成 Aceternity「Background Cubes Grid」**：全屏 Canvas 等距立方体网格（起伏 / 指针抬升 / 暖色聚光），表单改玻璃卡；首页报头与页面标题放大并加暖色渐变；服务卡加 3D 倾斜与悬停流光描边，AI 入口改磁性吸附，指针暖光跟随；新增脚本模块 18–20，纯视觉、不影响任何业务逻辑 |
| 2026-10-30 | 小轻 AI 新增「寒假社会实践」专项回答（`libPractice()`）：组队 / 指导教师、六类活动、材料规格、申报与总结节点；修正「资料库里关于 X」被资料库总览劫持的问题；兜底检索增加标签专有词加权 |
