const UPSTREAM_BASE_URL =
  process.env.DOREMON_BASE_URL ||
  "https://doremon.me/shop/api/activate/chatgpt";

function sendJson(res, status, payload) {
  res.status(status).json(payload);
}

function allowMethod(req, res, method) {
  if (req.method !== method) {
    res.setHeader("Allow", method);
    sendJson(res, 405, { error: "Method không được hỗ trợ." });
    return false;
  }
  return true;
}

function sanitizeCode(code = "") {
  return String(code).trim().toUpperCase();
}

function parseSessionInput(sessionInput) {
  if (typeof sessionInput !== "string") {
    throw new Error("Session phải là chuỗi JSON.");
  }

  const trimmed = sessionInput.trim();
  if (!trimmed) {
    throw new Error("Session JSON không được để trống.");
  }

  let parsed;
  try {
    parsed = JSON.parse(trimmed);
  } catch (_err) {
    throw new Error("Session JSON không hợp lệ.");
  }

  if (!parsed?.user?.email) {
    throw new Error("Không tìm thấy email trong session JSON.");
  }

  return {
    raw: trimmed,
    email: String(parsed.user.email).trim(),
    currentPlan:
      String(parsed.account_plan?.subscription_plan || parsed.account_plan?.id || "").trim() ||
      "unknown",
    userName: String(parsed.user.name || "").trim()
  };
}

async function callUpstream(endpoint, options = {}) {
  const response = await fetch(`${UPSTREAM_BASE_URL}${endpoint}`, {
    method: options.method || "GET",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    },
    body: options.body ? JSON.stringify(options.body) : undefined
  });

  let data = {};
  try {
    data = await response.json();
  } catch (_err) {
    data = { message: "Upstream trả về dữ liệu không hợp lệ." };
  }

  return { ok: response.ok, status: response.status, data };
}

module.exports = {
  allowMethod,
  callUpstream,
  parseSessionInput,
  sanitizeCode,
  sendJson
};
