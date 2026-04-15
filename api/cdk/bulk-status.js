const { allowMethod, callUpstream, sanitizeCode, sendJson } = require("../_lib/utils");

module.exports = async function handler(req, res) {
  if (!allowMethod(req, res, "POST")) {
    return;
  }

  const rawCodes = Array.isArray(req.body?.codes) ? req.body.codes : [];
  const codes = rawCodes.map(sanitizeCode).filter(Boolean);

  if (codes.length === 0) {
    sendJson(res, 400, { error: "Danh sách mã CDK trống." });
    return;
  }

  try {
    const upstream = await callUpstream("/keys/bulk-status", {
      method: "POST",
      body: { codes }
    });

    if (!upstream.ok) {
      sendJson(res, upstream.status, {
        error: "Không thể kiểm tra nhiều CDK.",
        details: upstream.data
      });
      return;
    }

    sendJson(res, 200, upstream.data);
  } catch (_err) {
    sendJson(res, 502, { error: "Lỗi kết nối upstream." });
  }
};
