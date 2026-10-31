'use strict';

/* 本地检索与结构化回答：意图匹配 → 专项回答 → 二元组兜底检索。
   只负责「答案内容」，不涉及任何 DOM 操作。 */

function libSrc(ids) {
  const links = ids.map((id) => {
    const d = LIB_BY_ID[id];
    return d ? `<a href="${d.u}" target="_blank" rel="noopener" title="${esc(d.t)}">${esc(d.s)}</a>` : '';
  }).join('');
  return `<div class="ai-src"><span>来源 · 学校资源库</span>${links}</div>`;
}
function libScholarship(t) {
  const cls = Object.keys(LIB_QUOTA).find((k) => t.includes(k));
  const q = cls ? LIB_QUOTA[cls] : null;
  return `<div class="ai-doc">
    <div class="ai-kicker">学校资源库 · 2025-2026 学年</div>
    <p>奖学金一年评一次，10 月启动：班级按《学生奖学金评定细则》评选，学院审查、学校公示。你要做的就三步——报名、备料、交到班级。</p>
    <h5>申领流程</h5>
    <ul>
      <li><b>① 报名</b>：找班长或权益委员登记，确认申报哪一档</li>
      <li><b>② 备料</b>：按下面对照清单准备电子版与纸质版</li>
      <li><b>③ 审核公示</b>：班级组织 3–5 名未申报同学做资格审查，辅导员复核，班内公示后报学院</li>
    </ul>
    <h5>名额与奖金</h5>
    <div class="ai-quota">
      <div><span>特等奖学金 · 学院 0.5%</span><b>3500 元</b></div>
      <div><span>一等奖学金 · 班级 5%</span><b>2500 元</b></div>
      <div><span>二等奖学金 · 班级 8%</span><b>1500 元</b></div>
      <div><span>三等奖学金 · 班级 12%</span><b>500 元</b></div>
    </div>
    ${q ? `<p>${esc(cls)} 有 <b>${q[0]}</b> 人：一等 <b>${q[1]}</b> 个、二等 <b>${q[2]}</b> 个、三等 <b>${q[3]}</b> 个名额。特等全学院 17 个，占用一等奖名额。</p>`
      : `<p>全学院 3313 人，特等名额 17 个。报出班级名（比如「软工本254」），我可以直接查你们班的一二三等名额。</p>`}
    <h5>四档门槛</h5>
    <div class="ai-tiers">
      <div class="ai-tier"><b>特等</b><span>综合测评前 10% 且 ≥90；德育、智育前 10% 且 ≥90；各科 ≥85</span></div>
      <div class="ai-tier"><b>一等</b><span>智育前 15%；各科 ≥80、均分 ≥80；体育 ≥80；德育前 20% 且 ≥80</span></div>
      <div class="ai-tier"><b>二等</b><span>智育前 25%；各科 ≥75、均分 ≥75；体育 ≥75；德育前 30% 且 ≥75</span></div>
      <div class="ai-tier"><b>三等</b><span>智育前 35%；各科 ≥70；体育 ≥70；德育前 35% 且 ≥70</span></div>
    </div>
    <p>四档都要求：综合测评 ≥80、劳育 ≥80、无补考无违纪。同时够多档只按最高一档评，奖金不叠加。</p>
    <h5>材料清单（点一下可以勾掉）</h5>
    <div class="ai-ticks">
      <div class="ai-tick"><i>${icon('check', 10)}</i><span>附件1 评定表：表单一「打印表」交电子 + 纸质；表单二、三只交电子</span></div>
      <div class="ai-tick"><i>${icon('check', 10)}</i><span>附件2 综合测评成绩总表：纸质 + 电子</span></div>
      <div class="ai-tick"><i>${icon('check', 10)}</i><span>成绩单：大学生服务中心自助打印机打中文成绩单，拍照作电子版，一人一个文件夹写清班级姓名</span></div>
      <div class="ai-tick"><i>${icon('check', 10)}</i><span>附件3 审批表：纸质</span></div>
      <div class="ai-tick"><i>${icon('check', 10)}</i><span>附件4 拟推荐名单汇总表：电子版，班内公示后截图上传</span></div>
      <div class="ai-tick"><i>${icon('check', 10)}</i><span>邮件打包：主题写「班级 校内奖学金材料」，发到在线表格里本班对应的邮箱</span></div>
    </div>
    <h5>交到哪里 · 什么时候</h5>
    <ul>
      <li>纸质：<b>第四实训楼 D306 武梦梅老师</b></li>
      <li>电子：在线表格里本班对应的接收邮箱</li>
      <li>截止：<b>10 月 21 日 16:00</b>（通知原文时间，新一批以辅导员通知为准）</li>
    </ul>
    <p class="ai-note">注意：课程平均成绩统一按班级成绩单里的「平均成绩」填写，不要用个人成绩单自己算的分数。</p>
    ${libSrc(['notice', 'rule', 'a1', 'quota'])}
  </div>`;
}
function libActivist(t) {
  return `<div class="ai-doc">
    <div class="ai-kicker">学校资源库 · 第 45 期积极分子</div>
    <p>从递交入党申请书到成为入党积极分子，一共 5 份材料。资料库里除了入党申请书，其余 4 份都有模板，按这个顺序走。</p>
    <h5>按顺序准备（点一下可以勾掉）</h5>
    <div class="ai-ticks">
      <div class="ai-tick"><i>${icon('check', 10)}</i><span><b>① 入党申请书</b>：手写签名，交给辅导员或党支部，记好递交日期（后面每张表都要填）</span></div>
      <div class="ai-tick"><i>${icon('check', 10)}</i><span><b>② 入党申请人谈话记录表</b>：支部收到申请书一个月内派人谈话，谈话人一般填支部书记</span></div>
      <div class="ai-tick"><i>${icon('check', 10)}</i><span><b>③ 公示情况记录表（提交入党申请公示）</b>：公示 5 个工作日（模板示例 9/21–9/27），无异议结论填「同意」</span></div>
      <div class="ai-tick"><i>${icon('check', 10)}</i><span><b>④ 共青团推荐优秀团员成为入党积极分子登记表</b>：团支部开推优大会、无记名投票，赞成票须超应到会有表决权团员的半数；填大会情况、团支部 / 上级团组织 / 党支部意见，一式三份</span></div>
      <div class="ai-tick"><i>${icon('check', 10)}</i><span><b>⑤ 公示情况记录表（确定入党积极分子公示）</b>：公示 5 个工作日，无异议后进入考察</span></div>
    </div>
    <h5>时间节奏（模板里的真实例子）</h5>
    <p>9/15 递交申请 → 9/18 支部收到 → 9/20 谈话 → 9/21–9/27 提交申请公示 → 次年 3/15 推优大会 → 3/16–3/22 推优公示 → 3/24 党支部同意。从递交申请到成为积极分子，大约一个学期。</p>
    <h5>基本门槛</h5>
    <ul>
      <li>年满 18 周岁，共青团员（推优对象），入党动机端正、无违纪</li>
      <li>成绩与综合测评在班级前列，群众基础好</li>
      <li>名额按批次由学院党支部确定，具体时间听辅导员通知</li>
    </ul>
    <p class="ai-note">材料交给辅导员或团支部书记；推优大会由团支部组织，公示无异议后由党支部确定并备案。</p>
    ${libSrc(['talk', 'pub1', 'tuiyou', 'pub2'])}
  </div>`;
}
function libPractice(t) {
  return `<div class="ai-doc">
    <div class="ai-kicker">学校资源库 · 2026 寒假社会实践</div>
    <p>「发现家乡的美」2026 年寒假社会实践，全日制在校生都能报；团队申报为主，也可以个人分散实践。要求分四块看：</p>
    <h5>组队与选题</h5>
    <ul>
      <li>团队申报，鼓励跨学院组队；跨学院项目以<b>负责人所在学院</b>为申报单位</li>
      <li>必须填写 <b>1–3 名实践指导教师</b></li>
      <li>六类活动任选：百千万突击队、家乡故事、主题调研、返家乡、短视频征集、其他</li>
      <li>主题调研类：同一申请人只能申请并参加<b>一个</b>项目</li>
    </ul>
    <h5>材料清单（点一下可以勾掉）</h5>
    <div class="ai-ticks">
      <div class="ai-tick"><i>${icon('check', 10)}</i><span>项目申报书 + 安全责任书 + 家长/监护人知情同意书（智慧校园 3.0 提交）</span></div>
      <div class="ai-tick"><i>${icon('check', 10)}</i><span>保险凭证：医保凭证，或实践期间人身意外险（所有人都要）</span></div>
      <div class="ai-tick"><i>${icon('check', 10)}</i><span>调研类：调查报告 <b>≥3000 字</b>；宣讲类：结项报告 ≥3000 字 + 宣讲视频 ≤5 分钟</span></div>
      <div class="ai-tick"><i>${icon('check', 10)}</i><span>家乡故事：演讲/表演 ≤7 分钟；摄影 JPG 单张或组图 ≤5 张，单张 ≥1MB</span></div>
      <div class="ai-tick"><i>${icon('check', 10)}</i><span>短视频：第一人称、≤3 分钟、横屏 16:9、1920×1080、200–500MB、MP4</span></div>
      <div class="ai-tick"><i>${icon('check', 10)}</i><span>所有团队：活动照片 ≥5 张，其中 1 张集体照，JPG 格式</span></div>
    </div>
    <h5>时间节点</h5>
    <div class="ai-quota">
      <div><span>团队申报截止</span><b>1 月 15 日 13:00</b></div>
      <div><span>活动实施</span><b>1–3 月</b></div>
      <div><span>总结材料</span><b>3 月 10 日前</b></div>
    </div>
    <p>申报走智慧校园 3.0「学生事务 → 社会实践」，附件1 还要交 Excel 可编辑版 + 盖章 PDF 到校团委邮箱；实践期间每天向学院报备安全（一天一报）。</p>
    <p class="ai-note">个人分散实践不用交安全责任书，但家长/监护人知情同意书和保险凭证仍要交；短视频参加省级评选的，学院汇总后推荐 1–2 个，同样 1 月 15 日 13:00 前报校团委。</p>
    ${libSrc(['win-notice', 'win-a1', 'win-a2', 'win-a3'])}
  </div>`;
}
function libOverview() {
  return `<div class="ai-doc">
    <div class="ai-kicker">学校资源库 · 同步于 ${LIBRARY.synced}</div>
    <p>资料库「${LIBRARY.title}」已经接进来了，共 <b>${LIBRARY.total}</b> 份材料：</p>
    <div class="ai-quota">
      ${LIBRARY.groups.map((g) => `<div><span>${g.name}</span><b>${g.docs.length} 份</b></div>`).join('')}
    </div>
    <p>问「奖学金怎么申领」「申请入党积极分子需要准备什么」「寒假社会实践有什么要求」，我会直接按文件回答；想看原文就点右上角「资料库」，19 份材料都能逐个打开。</p>
    ${libSrc(['notice', 'rule', 'tuiyou'])}
  </div>`;
}
function libAnswer(t) {
  if (/社会实践|寒假实践|发现家乡的美|百千万|返家乡|三下乡|实践申报/.test(t)) return libPractice(t);
  if (/奖学金|奖助|评奖|评优|励志|三好/.test(t)) return libScholarship(t);
  if (/名额/.test(t) && !/跑腿|推流|积分/.test(t)) return libScholarship(t);
  if (/入党|积极分子|推优|党课|发展对象|预备党员|转正/.test(t)) return libActivist(t);
  if (/^(资料库|资源库)$/.test(t) || /有哪些资料|有哪些材料|资料清单|资料库里有什么|资料库有什么|资料库都有什么|都接入了什么/.test(t)) return libOverview();
  return '';
}
/* 兜底：用中文二元组重合度在资料库里找最接近的一份 */
function libFind(t) {
  const q = t.replace(/[的了呢吗啊呀哦请问一下怎么如何哪里哪个哪些我想查查]+/g, '');
  let best = null;
  let bestScore = 0;
  LIB_DOCS.forEach((d) => {
    const hay = (d.t + d.tag + d.brief).replace(/\s/g, '');
    let score = 0;
    for (let i = 0; i < q.length - 1; i++) {
      const bg = q.slice(i, i + 2);
      if (/^[\u4e00-\u9fa5]{2}$/.test(bg) && hay.includes(bg)) score += 1;
    }
    if (q.length >= 3 && d.t.includes(q.slice(0, 3))) score += 2;
    /* 资料库标签里的专有词直接命中，比如「挑战杯」「短视频」 */
    d.tag.split(/\s+/).forEach((w) => { if (w.length >= 3 && q.includes(w)) score += 3; });
    if (score > bestScore) { bestScore = score; best = d; }
  });
  return bestScore >= 3 ? best : null;
}
