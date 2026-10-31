'use strict';

/* 校园数据问答：课表、二手、跑腿、积分、好店、空教室、食堂等。
   读的是 localStorage 里的演示数据，不联网。 */

function aiCourseLines(list) {
  return list.map((c) => `· ${esc(c.name)} · 第 ${c.start}-${c.start + c.len - 1} 节 · ${esc(c.room)} · ${esc(c.teacher)}`).join('<br>');
}
function coursesOn(dow) {
  return db.courses.filter((c) => c.day === dow).sort((a, b) => a.start - b.start);
}
function aiAnswer(raw) {
  const t = raw.replace(/\s/g, '');
  const now = new Date();
  const tmr = addDays(now, 1);
  const tmrIdx = tmr.getDay() === 0 ? 7 : tmr.getDay();

  const lib = libAnswer(t);
  if (lib) return lib;
  if (/跑腿|代取|代买|代排队|接单|帮取|带饭/.test(t)) {
    const open = db.errands.filter((x) => x.status === 'open');
    const top = open.slice().sort((a, b) => b.reward - a.reward)[0];
    return `校园跑腿现在有 <b>${open.length}</b> 单待接${top ? `，悬赏最高的是「${esc(top.title)}」¥${num(top.reward)}` : ''}。<br>· 发布一单需求 +10 积分<br>· 接单并送达 +15 积分<br>· 完成交易再 +20 积分<br>在「校园服务 → 校园跑腿」可以发布或接单，急单还能用积分推流。`;
  }
  if (/积分|推流|曝光|赚分/.test(t)) {
    return `你现在有 <b>${num(myPoints())}</b> 积分。获取方式：<br>· 新人注册 +100 · 发帖 +5 · 发布闲置或跑腿 +10<br>· 完成交易 +20 · 完成跑腿 +15 · 邀请同学 +30<br>推流档位：${BOOST_TIERS.map((b) => `${b.pts} 积分 / ${b.label}`).join('、')}。推流后内容会置顶展示，并带「推流中」标识。`;
  }
  if (/好店|店铺|商家|入驻|打印店|理发|咖啡店|便利店/.test(t)) {
    const list = db.shops.slice(0, 3);
    return `附近有 <b>${db.shops.length}</b> 家店可以逛，这几家同学去得最多：<br>${list.map((s) => `· ${esc(s.name)} — ${esc(s.addr)} · ${esc(s.hours)}`).join('<br>')}<br>点开卡片能看到店铺简介、促销活动和最新动态，商家也可以自助入驻。`;
  }
  if (/课表|有课|上课|几节|明天|今天|下周/.test(t)) {
    let target = tmrIdx;
    let label = `明天（周${WD[tmrIdx]}）`;
    if (/今天/.test(t)) { target = todayIdx(); label = `今天（周${WD[todayIdx()]}）`; }
    else if (/下周/.test(t)) { target = tmrIdx; label = `明天（周${WD[tmrIdx]}）`; }
    const list = coursesOn(target);
    if (!list.length) return `${label}没有安排课程，可以睡到自然醒，或者去图书馆四楼靠窗的位置自习`;
    const nowLine = /今天/.test(t) ? `现在离最近一节课还有 ${Math.max(0, Math.round((toMin(PERIODS[list[0].start - 1].s) - nowMin()) / 60))} 小时左右。<br>` : '';
    return `${label}你有 <b>${list.length}</b> 门课：<br>${aiCourseLines(list)}<br>${nowLine}要我顺便帮你看看空教室吗？`;
  }
  if (/二手|跳蚤|教材|自行车|单车|耳机|平板|买|卖|闲置/.test(t)) {
    let kw = '';
    if (/教材|书/.test(t)) kw = '教材';
    else if (/自行车|单车/.test(t)) kw = '出行';
    else if (/耳机/.test(t)) kw = '耳机';
    else if (/平板|iPad/i.test(t)) kw = 'iPad';
    let list = db.items.filter((i) => !kw || (i.title + i.cat).includes(kw));
    if (!list.length) return `跳蚤市场里暂时没有「${esc(kw)}」相关的宝贝，可以换个关键词，或者自己发一条求购～`;
    list = list.slice(0, 3);
    return `跳蚤市场现在有 <b>${db.items.length}</b> 件好物，这几件可能合适：<br>${list.map((i) => `· ${esc(i.title)} — <b>¥${num(i.price)}</b> · ${esc(i.place)}`).join('<br>')}<br>在「校园服务 → 跳蚤市场」可以看到全部。`;
  }
  if (/空教室|自习|安静|图书馆/.test(t)) {
    const list = ROOM_DATA.slice(0, 3);
    return `现在这几个地方比较适合自习：<br>${list.map((r) => `· ${esc(r.b)} ${esc(r.r)}（${esc(r.cap)}）· ${esc(r.when)}`).join('<br>')}<br>图书馆四楼靠窗的位置下午光线最好，早点去占座～`;
  }
  if (/墙|发帖|动态|小红书|匿名/.test(t)) {
    return `校园墙发帖很简单：<br>1. 进入「校园服务 → 校园墙」<br>2. 点右上角「发帖」，写标题和正文<br>3. 选一个话题和封面，想匿名就打开「匿名发布」<br>发出去之后，同学可以点赞、收藏和评论。`;
  }
  if (/食堂|吃|饭|美食|奶茶|咖啡/.test(t)) {
    return `今天想吃点什么？给你几个校内选择：<br>· 二食堂麻辣香锅：8 元一大盘，微辣刚好<br>· 一食堂三楼砂锅粥：晚上 6 点后不用排队<br>· 图书馆负一层咖啡：美式 9.9，赶 due 必备<br>校园墙的「美食探店」话题里还有同学的真实评价。`;
  }
  if (/你好|hi|hello|在吗|你是谁/.test(t)) {
    return `我是小轻，智慧校园4.0 的 AI 助手。学校资源库已经接进来了，奖学金、入党积极分子的通知和模板都能直接查；课表、二手、空教室也照样能问。`;
  }
  if (/谢谢|感谢/.test(t)) return `不客气，随时叫我。材料交之前记得再对一遍清单，别漏了签字和日期。`;
  const hit = libFind(t);
  if (hit) {
    return `<div class="ai-doc">
      <div class="ai-kicker">学校资源库 · ${hit.k.toUpperCase()}</div>
      <h5>${esc(hit.t)}</h5>
      <p>${esc(hit.brief)}</p>
      ${hit.points ? `<ul>${hit.points.map((p) => `<li>${esc(p)}</li>`).join('')}</ul>` : ''}
      <p>${hit.points ? '要我按这份文件继续展开，直接说就行。' : '资料库里目前只有这份文件，具体要求以发布单位的通知为准。'}</p>
      ${libSrc([hit.id])}
    </div>`;
  }
  return `资料库里没有找到直接相关的内容。我目前最擅长：<br>· 奖学金怎么申领、班里有多少名额<br>· 申请入党积极分子要准备哪些材料<br>· 学校通知原文（挑战杯、寒假社会实践等）<br>· 课表、二手、跑腿、空教室、附近好店`;
}
