'use strict';

/* ================= 小轻 AI · 对话面板 =================
   只负责界面：气泡、流式渲染、面板与资料库 / 计费说明层。
   路由与调用细节在 45-ai-service.js，接口在 44-ai-client.js。 */

let aiHistory = [];
let aiBusy = false;

function pushAIMsg(role, html, cls) {
  aiHistory.push({ role, html, cls: cls || '' });
  const box = $('#aiMsgs');
  if (!box) return;
  box.insertAdjacentHTML('beforeend', `<div class="ai-msg ai-msg--${role === 'me' ? 'me' : 'bot'} ${cls || ''}">${role === 'bot' ? '<span class="ai-mini-ava">轻</span>' : ''}<div class="bub">${html}</div></div>`);
  box.scrollTop = box.scrollHeight;
}

function renderLocalAnswer(html, box, delay) {
  setTimeout(() => {
    const typing = box.querySelector('#aiTyping');
    if (typing) typing.remove();
    const wide = html.includes('class="ai-doc"');
    pushAIMsg('bot', html, wide ? 'ai-msg--wide' : '');
    /* 长回答对齐到顶部，避免一进来只看到来源标签 */
    if (wide) {
      const last = box.lastElementChild;
      if (last) box.scrollTop += last.getBoundingClientRect().top - box.getBoundingClientRect().top - 12;
    }
  }, delay || 420);
}

function createStreamBubble(box) {
  const el = document.createElement('div');
  el.className = 'ai-msg ai-msg--bot ai-msg--wide';
  el.innerHTML = '<span class="ai-mini-ava">轻</span><div class="bub"><span class="ai-stream"></span><span class="ai-caret"></span></div>';
  box.appendChild(el);
  box.scrollTop = box.scrollHeight;
  return el;
}

function appendCloudNote(el, text) {
  const note = document.createElement('div');
  note.className = 'ai-cloud-note';
  note.textContent = text;
  el.querySelector('.bub').appendChild(note);
}

/* 在线回答：WorkBuddy 接口流式输出；失败时保留已生成的部分，整段失败则退回本地答案 */
async function askCloud(q, box, typingEl) {
  if (aiBusy) { toast('小轻还在回答上一条，稍等一下'); return; }
  aiBusy = true;
  let el = null;
  let text = '';
  try {
    const result = await AIService.ask(q, (delta, acc) => {
      if (!el) {
        if (typingEl) typingEl.remove();
        el = createStreamBubble(box);
      }
      text = acc;
      el.querySelector('.ai-stream').textContent = acc;
      box.scrollTop = box.scrollHeight;
    });
    if (!el) { if (typingEl) typingEl.remove(); el = createStreamBubble(box); }
    el.querySelector('.ai-stream').textContent = result.text;
    el.querySelector('.ai-caret')?.remove();
    const noteText = `${result.model ? (result.model.name || result.model.id) : '在线模型'} 生成 · 以资料库原文为准`;
    appendCloudNote(el, noteText);
    aiHistory.push({ role: 'bot', html: esc(result.text) + `<div class="ai-cloud-note">${esc(noteText)}</div>`, cls: 'ai-msg--wide' });
    box.scrollTop = box.scrollHeight;
  } catch (e) {
    if (el && text.trim()) {
      el.querySelector('.ai-caret')?.remove();
      appendCloudNote(el, '生成中断 · 可以再问一次');
      aiHistory.push({ role: 'bot', html: esc(text) + '<div class="ai-cloud-note">生成中断</div>', cls: 'ai-msg--wide' });
    } else {
      if (el) el.remove();
      if (typingEl) typingEl.remove();
      const reason = AIService.note(e);
      /* 写作类请求本地接不住，别用「资料库里没找到」误导，直接说明为什么用不了在线模型 */
      const html = AIService.isGeneration(q)
        ? `<div class="ai-doc"><div class="ai-kicker">在线模型 · 暂不可用</div><p>「写 / 翻译 / 润色 / 总结」这类请求需要在线模型，本地资料库只能回答政策与校园数据。</p><p>${esc(reason)}</p></div>`
        : aiAnswer(q);
      const wide = html.includes('class="ai-doc"');
      pushAIMsg('bot', html + (AIService.isGeneration(q) ? '' : `<p class="ai-note">${esc(reason)}</p>`), wide ? 'ai-msg--wide' : '');
    }
  } finally {
    aiBusy = false;
  }
}

function aiSend(text) {
  const q = (text || '').trim();
  if (!q) return;
  pushAIMsg('me', esc(q));
  const box = $('#aiMsgs');
  box.insertAdjacentHTML('beforeend', `<div class="ai-msg ai-msg--bot" id="aiTyping"><span class="ai-mini-ava">轻</span><div class="bub"><span class="typing"><i></i><i></i><i></i></span></div></div>`);
  box.scrollTop = box.scrollHeight;
  const typingEl = box.querySelector('#aiTyping');
  const local = aiAnswer(q);
  /* 本地答不上来，或用户要写要译，交给 WorkBuddy 在线模型；失败会退回本地答案 */
  if (AIService.shouldUseCloud(q, local)) {
    askCloud(q, box, typingEl);
    return;
  }
  renderLocalAnswer(local, box, 620);
}

/* 在线模型与积分说明：计费口径全部来自 AI_BILLING，不在这里另写一份 */
function openAIBilling() {
  const usage = AIService.usage();
  const issue = AIService.envIssue();
  const observed = AI_BILLING.observed;
  let stat = '本次打开页面还没有发起过在线调用。';
  if (usage.calls) {
    const parts = [`已发起 <b>${usage.calls}</b> 次在线调用`];
    if (usage.tokens) parts.push(`累计 <b>${usage.tokens}</b> tokens`);
    if (usage.credits) parts.push(`接口上报 <b>${usage.credits.toFixed(2)}</b> credits`);
    if (usage.modelLabel) parts.push(esc(usage.modelLabel));
    stat = `本次打开页面${parts.join(' · ')}。`;
  }
  return openSheet({
    cls: 'sheet--ai',
    head: false,
    body: `<div class="ai-panel">
      <div class="ai-head">
        <button class="ai-back" data-action="open-ai" aria-label="返回小轻">${icon('back', 17)}</button>
        <div><b>在线模型与积分</b><small>${esc(AI_BILLING.provider)}</small></div>
        <button class="sheet__x" data-action="close-sheet" aria-label="关闭">${icon('close', 17)}</button>
      </div>
      <div class="ai-bills">
        ${issue ? `<div class="ai-bill-state">
          <b>${esc(issue.title)}</b>
          <p>${esc(issue.detail)}</p>
          <code>${esc(issue.fix)}</code>
        </div>` : ''}
        <div class="ai-bill-hero">
          <span class="ai-bill-badge">${AI_BILLING.consumesVisitorPoints ? '会扣积分' : '不扣你的积分'}</span>
          <p>${esc(AI_BILLING.summary)}</p>
        </div>
        <dl class="ai-facts">
          ${AI_BILLING.facts.map((f) => `<div><dt>${esc(f.k)}</dt><dd>${esc(f.v)}</dd></div>`).join('')}
        </dl>
        <div class="ai-bill-stat">${icon('coin', 14)}<span>${stat}</span></div>
        <div class="ai-bill-ref">
          <b>额度怎么算</b>
          <p>单次回答实测 ${esc(observed.tokens)}、${esc(observed.credit)}（${esc(observed.model)}，${esc(observed.date)}）。${esc(observed.note)}</p>
          <p>credit 是接口回传的诊断值，不等于余额或账单；剩余额度与账期只在 WorkBuddy 控制台查看。</p>
        </div>
        <p class="ai-lib-note">接口：${esc(AI_BILLING.endpoint)}。浏览器端只持有可公开的 publishableKey，模型密钥与真实环境 id 都在服务端。</p>
      </div>
    </div>`
  });
}

function openAI() {
  const mode = AIService.mode();
  const online = mode === 'cloud';
  const tCount = coursesOn(todayIdx()).length;
  const welcome = aiHistory.length
    ? ''
    : (online
      ? `${greet()}，我是小轻。学校资源库和 WorkBuddy 在线模型都接进来了：政策问题按资料库原文答，答不上来的交给在线模型，也能帮你写申请理由。在线调用消耗的是应用额度，不扣你的校园积分。今天你有 <b>${tCount}</b> 门课。`
      : `${greet()}，我是小轻。不过现在是用 file:// 直接打开的，浏览器会拦掉在线模型，我先按本地资料库回答；用 http://localhost 打开就能恢复在线模型。今天你有 <b>${tCount}</b> 门课。`);
  if (!aiHistory.length) aiHistory.push({ role: 'bot', html: welcome, cls: '' });
  const sheet = openSheet({
    cls: 'sheet--ai',
    head: false,
    body: `<div class="ai-panel">
      <div class="ai-head">
        <span class="ai-ava">轻</span>
        <div><b>${esc(AI_ASSISTANT.title)}</b><small>${online
          ? `<span class="online"></span>在线 · ${esc(AI_ASSISTANT.subtitle)}`
          : `<span class="online is-off"></span>本地模式 · 在线模型不可用`}</small></div>
        <button class="ai-lib-btn" data-action="open-library">${icon('folder', 13)}资料库</button>
        <button class="sheet__x" data-action="close-sheet" aria-label="关闭">${icon('close', 17)}</button>
      </div>
      <div class="ai-msgs" id="aiMsgs">
        ${aiHistory.map((m) => `<div class="ai-msg ai-msg--${m.role === 'me' ? 'me' : 'bot'} ${m.cls || ''}">${m.role === 'bot' ? '<span class="ai-mini-ava">轻</span>' : ''}<div class="bub">${m.html}</div></div>`).join('')}
      </div>
      <div class="ai-chips">
        ${['奖学金怎么申领', '申请入党积极分子需要准备什么'].map((c) => `<button class="ai-chip" data-aiq="${c}">${c}</button>`).join('')}
      </div>
      <div class="ai-bill" data-action="ai-billing" role="button" tabindex="0" aria-label="查看在线模型与积分说明">
        ${icon('coin', 12)}<span>${esc(online ? AI_BILLING.short : (mode === 'file' ? '本地模式 · file:// 下在线模型不可用' : '本地模式 · 当前离线'))}</span><em>说明</em>
      </div>
      <div class="ai-input">
        <input id="aiInput" placeholder="问问小轻：奖学金怎么申领？" maxlength="60" />
        <button class="ai-send" id="aiSendBtn" aria-label="发送">${icon('send', 17)}</button>
      </div>
    </div>`
  });
  const msgs = sheet.querySelector('#aiMsgs');
  msgs.scrollTop = msgs.scrollHeight;
  const lastMsg = msgs.lastElementChild;
  if (lastMsg && lastMsg.classList.contains('ai-msg--wide')) {
    msgs.scrollTop += lastMsg.getBoundingClientRect().top - msgs.getBoundingClientRect().top - 12;
  }
  const input = sheet.querySelector('#aiInput');
  const send = () => { const v = input.value; input.value = ''; aiSend(v); };
  sheet.querySelector('#aiSendBtn').addEventListener('click', send);
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter') send(); });
  sheet.querySelectorAll('[data-aiq]').forEach((b) => b.addEventListener('click', () => {
    aiSend(b.dataset.aiq);
  }));
  /* 清单勾选：回答里的 .ai-tick 点一下切换，只在本机生效 */
  msgs.addEventListener('click', (e) => {
    const tick = e.target.closest('.ai-tick');
    if (tick) tick.classList.toggle('is-done');
  });
  AIService.warm();
  setTimeout(() => input.focus(), 360);
}

function openLibrary() {
  const sheet = openSheet({
    cls: 'sheet--ai',
    head: false,
    body: `<div class="ai-panel">
      <div class="ai-head">
        <button class="ai-back" data-action="open-ai" aria-label="返回小轻">${icon('back', 17)}</button>
        <div><b>学校资源库</b><small><span class="online"></span>${LIBRARY.total} 份材料 · 同步于 ${LIBRARY.synced}</small></div>
        <button class="sheet__x" data-action="close-sheet" aria-label="关闭">${icon('close', 17)}</button>
      </div>
      <div class="ai-lib">
        <div class="ai-lib-stat">${icon('folder', 18)}<div><b>${LIBRARY.total}</b> 份材料已接入小轻 · ${LIBRARY.dept}</div></div>
        ${LIBRARY.groups.map((g) => `<div class="ai-lib-group">
          <h4>${g.name}<em>${g.note}</em></h4>
          ${g.docs.map((d) => `<a class="ai-lib-row" href="${d.u}" target="_blank" rel="noopener">
            <span class="ftag">${d.k}</span><span>${esc(d.t)}</span>${icon('chev', 14)}
          </a>`).join('')}
        </div>`).join('')}
        <a class="ai-lib-open" href="${LIBRARY.url}" target="_blank" rel="noopener">在 WorkBuddy 资料库打开 ${icon('chev', 13)}</a>
        <p class="ai-lib-note">这里是小轻内置的资料库快照，文件标题、要点与名额数据均来自「${LIBRARY.title}」，点任意一行可跳回资料库看原文。资料库更新后重新同步一次快照即可。</p>
      </div>
    </div>`
  });
  return sheet;
}
