'use strict';

/* ================= 小轻 AI · 配置与计费声明 =================
   本文件只放常量：助手身份、系统提示词、模型偏好、调用约束、计费说明。
   不放任何业务逻辑，方便单独调整口径而不用碰调用与渲染代码。 */

const AI_ASSISTANT = {
  name: '小轻',
  title: '小轻 · 校园助手',
  subtitle: '资料库 + WorkBuddy 在线模型'
};

/* 系统提示词：每次请求都必须作为 messages[0]，否则接口会拒绝（SDK 不代填）。 */
const AI_SYSTEM_PROMPT = [
  '你是「智慧校园4.0」的校园助手小轻。',
  '事实性问题（时间、金额、名额、流程、材料）只能依据下面提供的学校资源库摘要回答；摘要里没有就直说没有，并建议去问辅导员或查看学校通知，绝不编造。',
  '写作类请求（申请理由、口号、文案、润色、翻译、总结）可以正常完成，但要在结尾注明「以上为参考表达，具体以学校通知为准」，不得把编造的政策细节写进去。',
  '用简体中文回答，先给结论，再分点说明，控制在 220 字以内。分点用「·」，不要使用 Markdown 标题、加粗或表格。',
  '不索取也不复述账号密码、身份证号、手机号等个人信息。'
].join('');

/* 模型偏好：目录里的 reasoning 标记不完全可靠，优先选已知快、便宜的 flash 模型，
   再退回任意非推理模型。命中不了就让用户等一段 reasoning，体验很差。 */
const AI_MODEL_PREFERENCE = ['deepseek-v4.1-flash', 'glm-5.3-flash', 'hunyuan-chat'];

const AI_RUNTIME = {
  /* SDK 走 CDN，首次打开面板预热，避免第一次提问等下载 */
  sdkUrl: 'https://cdn.jsdelivr.net/npm/@tencent-ai/workbuddy-cloud-sdk@dev/lib/index.global.js',
  /* 单次回答的超时；超时后中断并退回本地答案 */
  timeoutMs: 45000,
  /* 两次在线调用之间的最小间隔，防止连续点击把应用额度刷完 */
  minIntervalMs: 1500,
  temperature: 0.3,
  /* 资料库摘要的字符预算：只放目录 + 命中要点，不整库上传 */
  contextBudget: 3200
};

/* ================= 计费声明（唯一事实来源） =================
   页面上的说明文案、AI 面板底部的提示、说明弹层都读这里，
   改口径只需要改这一处。 */
const AI_BILLING = {
  provider: 'WorkBuddy 云服务 · LLM API',
  endpoint: 'cloud.llm.chat.completions.create（流式 SSE）',
  keyless: true,
  /* 关键结论，写进 UI 与文档 */
  consumesCreatorQuota: true,
  consumesVisitorPoints: false,
  consumesAppPoints: false,
  requiresVisitorAccount: false,
  summary: '在线回答由 WorkBuddy 云服务提供：消耗的是应用创建者的模型额度，不消耗你本人的积分。',
  short: 'WorkBuddy 在线模型 · 不扣校园积分',
  /* 说明弹层里的分条解释 */
  facts: [
    {
      k: '用的是哪个接口',
      v: 'WorkBuddy 云服务的 LLM API（cloud.llm.chat.completions.create），流式返回；浏览器只带 publishableKey，模型密钥留在服务端，属于免密钥调用。'
    },
    {
      k: '会消耗谁的额度',
      v: '消耗应用创建者（也就是本项目部署者）的 WorkBuddy LLM 额度。额度用完或触发限流时，接口返回 quota_ 开头的错误，小轻会自动改用本地资料库回答。'
    },
    {
      k: '会不会扣你的积分',
      v: '不会。访问者不需要登录 WorkBuddy、不需要自己的 API Key，调用也不消耗访问者本人账号的任何积分或额度。'
    },
    {
      k: '和校园积分的关系',
      v: '页面里的「积分」是本地演示数据（localStorage），只用于发布、跑腿和推流；AI 问答既不读也不写积分流水，问多少次都不会扣分。'
    },
    {
      k: '在哪里看额度',
      v: 'WorkBuddy 控制台的云服务用量页。接口只回传本次调用的 usage（tokens 与 credit 诊断值），不作为账单也不展示余额，所以应用内无法知道「还剩多少」。'
    }
  ],
  /* 实测样本（真实调用，仅作量级参考，换模型或改提示词后会变） */
  observed: {
    date: '2026-10-30',
    model: 'DeepSeek-V4.1-Flash',
    tokens: '约 1000 tokens',
    credit: '0.01–0.02 credits',
    note: '样本 2 次：写作类（上下文 1353 字 / 990 输入 tokens + 47 输出）与资料库问答（988 + 92）；实际随问题长度浮动。'
  }
};
