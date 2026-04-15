const {
  allowMethod,
  callUpstream,
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

    const upstream = await callUpstream("/keys/activate-session", {
      method: "POST",
      body: {
        code,
        session: session.raw
      }
    });

    if (!upstream.ok) {
      sendJson(res, upstream.status, {
        error: "Không thể bắt đầu kích hoạt.",
        details: upstream.data
      });
      return;
    }

    sendJson(res, 200, upstream.data);
  } catch (error) {
    sendJson(res, 400, { error: error.message });
  }
};
