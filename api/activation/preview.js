const {
  allowMethod,
  buildConfirmationToken,
  callUpstream,
  CONFIRM_TOKEN_TTL_MS,
  createUpstreamErrorPayload,
  isPaidPlan,
  mapCodeInfo,
  parseSessionInput,
  sanitizeCode,
  sendJson
} = require("../_lib/utils");

module.exports = async function handler(req, res) {
  if (!allowMethod(req, res, "POST")) {
    return;
  }

  try {
    const code = sanitizeCode(req.body?.code);
    const session = parseSessionInput(req.body?.session);

    if (!code) {
      sendJson(res, 400, { error: "Mã CDK không hợp lệ." });
      return;
    }

    const upstream = await callUpstream(`/keys/${encodeURIComponent(code)}`);
    if (!upstream.ok) {
      sendJson(res, upstream.status, createUpstreamErrorPayload("Không thể kiểm tra CDK.", upstream));
      return;
    }

    const codeInfo = mapCodeInfo(upstream.data);
    const expiresAt = Date.now() + CONFIRM_TOKEN_TTL_MS;
    const confirmToken = buildConfirmationToken({
      code,
      email: session.email,
      currentPlan: session.currentPlan,
      expiresAt
    });

    sendJson(res, 200, {
      code: codeInfo.code || code,
      codeStatus: codeInfo.status,
      email: session.email,
      currentPlan: session.currentPlan,
      currentPlanIsPaid: isPaidPlan(session.currentPlan),
      name: session.userName,
      service: codeInfo.service,
      plan: codeInfo.plan,
      term: codeInfo.term,
      confirmToken,
      confirmExpiresAt: new Date(expiresAt).toISOString()
    });
  } catch (error) {
    sendJson(res, 400, { error: error.message });
  }
};
