const {
  allowMethod,
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

    sendJson(res, 200, {
      code,
      email: session.email,
      currentPlan: session.currentPlan,
      name: session.userName
    });
  } catch (error) {
    sendJson(res, 400, { error: error.message });
  }
};
