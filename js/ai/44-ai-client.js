'use strict';

/* ================= 小轻 AI · WorkBuddy 接口客户端 =================
   只做一件事：把 WorkBuddy 云服务的 LLM 接口包成三个方法
   （loadSdk / ensureReady / streamChat），不碰任何 DOM。
   接口形态见 https://www.workbuddy.cn/docs/workbuddy/Overview 对应的云服务 LLM 文档：
     cloud.llm.models.list()              → 取可用模型
     cloud.llm.chat.completions.create()  → 流式对话（stream 必须为 true）

   计费：按「应用创建者」的 WorkBuddy LLM 额度计费，不消耗访问者本人的积分，
   也不扣页面里的校园积分（本地演示数据）。完整口径见 js/ai/40-ai-config.js 的 AI_BILLING。 */

const WBAI = (function createWorkBuddyAI() {
  const state = { sdk: null, client: null, model: null };
  let sdkPromise = null;
  let readyPromise = null;

  function isConfigured() {
    return Boolean(CLOUD_CONFIG && CLOUD_CONFIG.endpoint && CLOUD_CONFIG.publishableKey);
  }

  /* CDN 按需加载；失败后清空 promise，下次还能重试 */
  function loadSdk() {
    if (window.WorkBuddyCloud) return Promise.resolve(window.WorkBuddyCloud);
    if (sdkPromise) return sdkPromise;
    sdkPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      const timer = setTimeout(() => reject(new Error('sdk_load_timeout')), 12000);
      script.src = AI_RUNTIME.sdkUrl;
      script.async = true;
      script.onload = () => {
        clearTimeout(timer);
        if (window.WorkBuddyCloud) resolve(window.WorkBuddyCloud);
        else reject(new Error('sdk_invalid'));
      };
      script.onerror = () => {
        clearTimeout(timer);
        reject(new Error('sdk_load_failed'));
      };
      document.head.appendChild(script);
    }).catch((e) => {
      sdkPromise = null;
      throw e;
    });
    return sdkPromise;
  }

  /* 客户端与模型列表只初始化一次，后续所有调用复用 */
  function ensureReady() {
    if (state.client && state.model) return Promise.resolve({ client: state.client, model: state.model });
    if (readyPromise) return readyPromise;
    readyPromise = (async () => {
      if (!isConfigured()) {
        const err = new Error('cloud_not_configured');
        err.code = 'config_missing';
        throw err;
      }
      const sdk = await loadSdk();
      if (typeof sdk.createWorkBuddyCloud !== 'function') throw new Error('sdk_invalid');
      if (!state.client) {
        state.client = sdk.createWorkBuddyCloud({
          endpoint: CLOUD_CONFIG.endpoint,
          publishableKey: CLOUD_CONFIG.publishableKey,
          oauthRelayBaseUrl: CLOUD_CONFIG.oauthRelayBaseUrl
        });
      }
      if (!state.model) {
        const list = await state.client.llm.models.list();
        /* disabled === true 表示目录里不可选，绝不作为兜底；空列表是合法结果 */
        const usable = (list || []).filter((m) => m.disabled !== true && m.enabled !== false);
        const picked = AI_MODEL_PREFERENCE.map((id) => usable.find((m) => m.id === id)).find(Boolean)
          || usable.find((m) => m.supportsReasoning !== true)
          || usable[0];
        if (!picked) {
          const err = new Error('no_model');
          err.code = 'no_model';
          throw err;
        }
        state.model = picked;
      }
      return { client: state.client, model: state.model };
    })().catch((e) => {
      readyPromise = null;
      throw e;
    });
    return readyPromise;
  }

  function modelLabel() {
    const m = state.model;
    return m ? (m.name || m.id) : '';
  }

  /* 流式对话：onDelta(增量, 累计文本) 逐段回调，返回完整文本与用量 */
  async function streamChat({ messages, signal, onDelta }) {
    if (!Array.isArray(messages) || !messages.length || messages[0].role !== 'system') {
      const err = new Error('system_message_required');
      err.code = 'request_system_missing';
      throw err;
    }
    const { client, model } = await ensureReady();
    let text = '';
    let usage = null;
    const stream = client.llm.chat.completions.create({
      model: model.id,
      messages,
      stream: true,
      temperature: AI_RUNTIME.temperature,
      signal,
      stream_options: { include_usage: true }
    });
    for await (const chunk of stream) {
      const delta = chunk.choices && chunk.choices[0] && chunk.choices[0].delta;
      if (delta && delta.content) {
        text += delta.content;
        if (onDelta) onDelta(delta.content, text);
      }
      /* usage 通常在最后一个 chunk，仅作诊断，不作为账单 */
      if (chunk.usage) usage = chunk.usage;
    }
    return { text, model, usage };
  }

  /* 把 SDK 错误翻译成稳定的 code 前缀 + 人话，UI 只认这个结果 */
  function describeError(e) {
    if (!e) return { code: '', message: '未知错误' };
    if (e.code === 'config_missing') return { code: 'config_missing', message: '云服务未配置' };
    if (e.name === 'AbortError' || e.code === 'ABORT_ERR') return { code: 'aborted', message: '已超时或取消' };
    const raw = (e.error && e.error.code) || e.code || e.message || '';
    const code = String(raw);
    if (code === 'no_model') return { code, message: '模型目录为空' };
    if (code.indexOf('sdk_load') === 0 || code === 'sdk_invalid') return { code: 'sdk_load_failed', message: 'SDK 未加载' };
    if (code === 'empty') return { code, message: '返回内容为空' };
    if (code.indexOf('quota_') === 0) {
      return { code, message: '应用额度不足', retryable: code === 'quota_rate_limited' };
    }
    if (code.indexOf('auth_') === 0) return { code, message: '域名未授权' };
    if (code.indexOf('gateway_') === 0 || code.indexOf('model_') === 0) return { code, message: '模型服务暂不可用' };
    if (code.indexOf('request_') === 0) return { code, message: '请求参数不合法' };
    return { code, message: e.message || '调用失败' };
  }

  return { isConfigured, loadSdk, ensureReady, streamChat, modelLabel, describeError };
})();
