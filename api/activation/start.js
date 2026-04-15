const {
  allowMethod,
  callUpstream,
  createUpstreamErrorPayload,
  parseSessionInput,
  sanitizeCode,
  sendJson,
  verifyConfirmationToken
} = require("../_lib/utils");

module.exports = async function handler(req, res) {
  if (!allowMethod(req, res, "POST")) {
    return;
  }

  try {
    const code = sanitizeCode(req.body?.code);
    const session = parseSessionInput(req.body?.session);
    const confirmToken = req.body?.confirmToken;

    if (!code) {
      sendJson(res, 400, { error: "Mã CDK không hợp lệ." });
      return;
    }

    const verification = verifyConfirmationToken(confirmToken, {
      code,
      email: session.email,
      currentPlan: session.currentPlan
    });
    if (!verification.ok) {
      sendJson(res, 400, { error: verification.error });
      return;
    }

    const upstream = await callUpstream("/keys/activate-session", {
      method: "POST",
      body: {
        code,
        session: session.raw
      }
    });

    if (!upstream.ok) {
      sendJson(
        res,
        upstream.status,
        createUpstreamErrorPayload("Không thể bắt đầu kích hoạt.", upstream)
      );
      return;
    }

    sendJson(res, 200, upstream.data);
  } catch (error) {
    sendJson(res, 400, { error: error.message });
  }
};
