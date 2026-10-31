'use strict';

/* ================= 小轻 AI · 在线回答服务 =================
   夹在「本地规则引擎」与「WorkBuddy 接口」之间，负责三件事：
     1. 路由：这条问题该本地答，还是交给在线模型；
     2. 上下文：把资料库目录 + 命中要点压成受预算限制的摘要；
     3. 兜底：超时、额度、网络、授权失败时给出人话说明并退回本地答案。
   不渲染任何 DOM，UI 只订阅回调。 */

const AIService = (function createAIService() {
  const WEAK_LOCAL = /^资料库里没有找到直接相关的内容/;
  const GEN_REQUEST = /帮我写|写一份|写一段|草拟|生成一份|翻译|润色|总结一下|列个提纲|提个建议|改一改|扩写|缩写/;

  const stats = { calls: 0, lastModel: '', totalChars: 0, tokens: 0, credits: 0 };
  let lastCallAt = 0;

  /* 本地能答的（课表 / 二手 / 跑腿 / 积分 / 三类政策问答）继续走本地，省额度也更快；
     本地兜底说明没找到，或用户明确要「写 / 译 / 总结」，才交给在线模型。 */
  function shouldUseCloud(question, localHtml) {
    if (!WBAI.isConfigured()) return false;
    if (GEN_REQUEST.test(question)) return true;
    return WEAK_LOCAL.test(String(localHtml || ''));
  }

  /* 写作类请求只有在线模型能答，本地资料库接不住 */
  function isGeneration(question) {
    return GEN_REQUEST.test(String(question || ''));
  }

  /* 资料库摘要：只放目录 + libFind 命中的要点，控制在预算内，不整库上传 */
  function buildContext(question) {
    const lines = [`资料库：${LIBRARY.title}（${LIBRARY.total} 份材料，同步于 ${LIBRARY.synced}）`];
    LIBRARY.groups.forEach((group) => {
      lines.push(`【${group.name}】`);
      group.docs.forEach((doc) => lines.push(`· ${doc.t}：${doc.brief}`));
    });
    const hit = libFind(question);
    if (hit && hit.points && hit.points.length) {
      lines.push(`【与问题最相关的要点：${hit.s}】`);
      hit.points.forEach((point) => lines.push(`· ${point}`));
    }
    let text = lines.join('\n');
    if (text.length > AI_RUNTIME.contextBudget) {
      text = text.slice(0, AI_RUNTIME.contextBudget) + '\n…（摘要已截断）';
    }
    return text;
  }

  function buildMessages(question) {
    return [
      { role: 'system', content: AI_SYSTEM_PROMPT },
      { role: 'user', content: `【学校资源库摘要】\n${buildContext(question)}\n\n【问题】\n${question}` }
    ];
  }

  /* 简单的客户端节流：连续提问时拉开间隔，避免一次点击把应用额度刷掉 */
  async function throttle() {
    const wait = AI_RUNTIME.minIntervalMs - (Date.now() - lastCallAt);
    if (wait > 0) await new Promise((resolve) => setTimeout(resolve, wait));
    lastCallAt = Date.now();
  }

  /* 环境自检：这两种情况下根本发不出合法请求，先判定再决定要不要联网。
     file:// 打开时浏览器把来源当成 null，云服务按发布域名做 Origin 校验，请求会被拦成
     ERR_FAILED / Failed to fetch；本地静态服务（任意端口的 localhost）不受影响。 */
  function envIssue() {
    if (typeof location !== 'undefined' && location.protocol === 'file:') {
      return {
        code: 'file_protocol',
        title: '当前是 file:// 直接打开',
        detail: '浏览器会把页面来源当成 null，云服务按发布域名校验后拒绝跨域请求，所以在线模型一定失败。用 http://localhost:8080 或已发布域名打开即可恢复，本地资料库回答不受影响。',
        fix: 'python -m http.server 8080 → http://localhost:8080'
      };
    }
    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      return {
        code: 'offline',
        title: '设备当前离线',
        detail: '在线模型需要联网加载 SDK 并请求云服务，本地资料库回答仍然可用。',
        fix: '联网后重新提问即可'
      };
    }
    return null;
  }

  /* 发起一次在线回答；超时由内部 AbortController 控制，返回完整文本 */
  async function ask(question, onDelta) {
    const issue = envIssue();
    if (issue) {
      const err = new Error(issue.code);
      err.code = issue.code;
      throw err;
    }
    await throttle();
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), AI_RUNTIME.timeoutMs);
    try {
      const result = await WBAI.streamChat({
        messages: buildMessages(question),
        signal: controller.signal,
        onDelta
      });
      if (!result.text || !result.text.trim()) {
        const err = new Error('empty');
        err.code = 'empty';
        throw err;
      }
      stats.calls += 1;
      stats.lastModel = result.model ? (result.model.name || result.model.id) : '';
      stats.totalChars += result.text.length;
      /* usage 只是诊断值：tokens 可估算量级，credit 不等于账单或余额，缺字段也不当错误 */
      const u = result.usage;
      if (u) {
        if (typeof u.total_tokens === 'number') stats.tokens += u.total_tokens;
        if (typeof u.credit === 'number') stats.credits += u.credit;
      }
      return result;
    } finally {
      clearTimeout(timer);
    }
  }

  /* 错误 → 一句能读懂的话；文案里点明额度是应用创建者的，不是访问者的 */
  function note(error) {
    const info = WBAI.describeError(error);
    switch (info.code) {
      case 'file_protocol':
        return '当前是 file:// 直接打开，浏览器来源为 null，云服务会拦掉跨域请求。用 http://localhost 打开就能恢复在线模型，本地资料库回答不受影响。';
      case 'offline':
        return '设备当前离线，已用本地资料库回答；联网后再问一次就能用在线模型。';
      case 'no_model':
        return '在线模型暂未开放，已用本地资料库回答。';
      case 'config_missing':
        return '未配置云服务，已用本地资料库回答。';
      case 'sdk_load_failed':
        return '在线模型组件加载失败（可能被网络拦截），已用本地资料库回答。';
      case 'aborted':
        return '在线回答超时，已用本地资料库回答。';
      case 'empty':
        return '在线模型没有返回内容，已用本地资料库回答。';
      default:
        break;
    }
    if (info.code === 'gateway_network_error') return '在线模型请求被网络或跨域策略拦截，已用本地资料库回答。';
    if (info.code.indexOf('auth_') === 0) return '当前访问域名未授权在线模型，已用本地资料库回答。';
    if (info.code.indexOf('quota_') === 0) return '应用创建者的模型额度不足，已用本地资料库回答（不影响你的积分）。';
    if (info.code.indexOf('gateway_') === 0 || info.code.indexOf('model_') === 0) {
      return '在线模型暂时不可用，已用本地资料库回答。';
    }
    return '在线模型调用失败，已用本地资料库回答。';
  }

  /* 当前可用模式：cloud / file / offline，面板据此显示状态 */
  function mode() {
    const issue = envIssue();
    if (!issue) return 'cloud';
    return issue.code === 'file_protocol' ? 'file' : 'offline';
  }

  /* 打开面板时预热 SDK 与模型列表，第一次提问不用等 CDN */
  function warm() {
    if (!WBAI.isConfigured() || envIssue()) return;
    WBAI.loadSdk().then(() => WBAI.ensureReady()).catch(() => {});
  }

  function usage() {
    return {
      calls: stats.calls,
      lastModel: stats.lastModel,
      totalChars: stats.totalChars,
      tokens: stats.tokens,
      credits: stats.credits,
      modelLabel: WBAI.modelLabel()
    };
  }

  return { shouldUseCloud, isGeneration, ask, note, mode, envIssue, warm, usage, buildContext };
})();
