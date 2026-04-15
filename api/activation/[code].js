const {
  allowMethod,
  callUpstream,
  createUpstreamErrorPayload,
  sanitizeCode,
  sendJson
} = require("../_lib/utils");

module.exports = async function handler(req, res) {
  if (!allowMethod(req, res, "GET")) {
    return;
  }

  const code = sanitizeCode(req.query?.code);
  if (!code) {
    sendJson(res, 400, { error: "Mã CDK không hợp lệ." });
    return;
  }

  try {
    const upstream = await callUpstream(`/keys/${encodeURIComponent(code)}/activation`);

    if (!upstream.ok) {
      sendJson(
        res,
        upstream.status,
        createUpstreamErrorPayload("Không thể lấy trạng thái kích hoạt.", upstream)
      );
      return;
    }

    sendJson(res, 200, upstream.data);
  } catch (_err) {
    sendJson(res, 502, { error: "Lỗi kết nối upstream." });
  }
};
