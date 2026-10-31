'use strict';

/* WorkBuddy 云服务 publicConfig
   由 workbuddy_cloud_service 激活时返回，只包含可公开在前端使用的值：
   endpoint 是本应用的发布域名数据面，publishableKey 只标识应用、本身不带权限，
   服务端做精确 Origin 校验。重新绑定应用或更换发布域名后需要同步更新这里。
   这里不放任何模型密钥 —— 在线模型是免密钥调用，计费口径见 js/ai/40-ai-config.js。 */
const CLOUD_CONFIG = {
  endpoint: 'https://smart-campus-4.app.workbuddy.host',
  publishableKey: 'wbpk_aqYQxSAkZ1kkKZTq4kPW3n_dibYPH4RAVk9Lc4W8x2tEuWfRJjvhTqC',
  oauthRelayBaseUrl: 'https://www.workbuddy.cn/v2/as/genie-baas/oauth'
};
