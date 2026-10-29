# 智慧校园 4.0 · 项目规范

> 本文件是「智慧校园4.0」的设计与工程约定。新增页面、模块或卡片之前先读这里，避免视觉与交互各写一套。

---

## 一、技术形态

| 项目 | 约定 |
| --- | --- |
| 交付形态 | 单文件 `index.html`，内联 CSS / JS，无外部依赖、无构建步骤，双击即可运行 |
| 数据 | `localStorage`，键名 `limeCampusDB_v1`；`migrateDB()` 做旧数据平滑升级，不清空用户内容 |
| 图片 | 用户上传图片经 canvas 压缩后以 dataURL 存在同一条记录里 |
| 响应式断点 | 560 / 640 / 760 / 980 / 1080 / 1200 px |
| 图标 | `ICON` 字典（24×24 线性描边），`icon(name, size)` / `iconFill()` 输出 |
| 插画 | `ART` 字典（120×120 扁平插画），描边统一 `#17385E`，点缀 `#7DD3FC` / `#E9A13B` |

## 二、视觉系统

- **配色**：以 `:root` 的 token 为准（第 14 节会覆盖第 0 节），主色 navy `#0B2545`，强调 `#7DD3FC`，纸面 `--bg #EDF1F6`。
- **字体**：正文系统无衬线；数字用衬线 `--serif`（价格、日期、积分、统计）；小标签用等宽 `--mono` 加大写英文。
- **圆角**：卡片 9–14px；胶囊形只留给「发布 / 发帖 / 商家入驻」这类主行动。
- **分隔**：优先 1px 发丝线（`--line` / `--line-2`），阴影只用于浮层、悬浮态和详情层。
- **留白**：区块标题带编号（`01`、`02`…）与英文副标，标题上方一条 `--line` 细线。

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

### 3.5 页面与浮层

- 页面切换：`pageEnter .46s`，离开 `150ms` 上移淡出；
- 底部浮层：`translateY(102%) → 0`，`340ms`；
- 桌面弹窗：`scale(.97) → 1` + 淡入，`280ms`；
- 所有动效必须响应 `prefers-reduced-motion`。

## 四、模块地图

| 页面 | 状态 | 渲染入口 |
| --- | --- | --- |
| 首页 | `tab=home` | `homeHTML()` → `scheduleHTML()` + `homeCalendarHTML()` |
| 校园服务 | `tab=services, page=null` | `servicesHTML()` |
| 跳蚤市场 | `page=market` | `marketHTML()` + `refreshMarket()` |
| 校园跑腿 | `page=errands` | `errandsHTML()` + `refreshErrands()` |
| 校园墙 | `page=wall` | `wallHTML()` + `refreshWall()` |
| 附近好店 | `page=shops` | `shopsHTML()` + `refreshShops()` |
| 个人中心 | `tab=profile` | `profileHTML()` |

浮层与工具：`openSheet()` / `closeSheet()`、`openCourseForm()`、`openImportSheet()`、`openTool('room|lost|phone|calendar')`、`openCalendar()`、`openPoints()`、`openBoostHub()`、`openBoostSheet()`。

## 五、积分与推流

- **获取**：新人注册 +100；发布闲置 / 跑腿 +10；发帖 +5；完成交易 +20；完成跑腿 +15；邀请新同学 +30。
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

## 九、变更记录

| 日期 | 内容 |
| --- | --- |
| 2026-10-29 | 校历改为月历网格；新增校园跑腿、附近好店；接入积分推流与照片导入；四类卡片统一 `card-flow` 出场动画并写入本规范 |
| 2026-10-29 | 修正跳蚤市场 / 校园跑腿的详情转场：由底部弹层改为与校园墙一致的全屏详情 + 封面飞入，抽 `openDetailLayer()` 统一四类卡片 |
| 2026-10-29 | 首页课表下方新增校历月历卡（`homeCalendarHTML()`），与课表卡共用报头语言，点日期直达完整校历；修复「回到本周」不生效 |
