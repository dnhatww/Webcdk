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
      Accept: "application/json, text/plain, */*",
      "Content-Type": "application/json",
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
      ...(options.headers || {})
    },
    body: options.body ? JSON.stringify(options.body) : undefined
  });

  const contentType = response.headers.get("content-type") || "";
  let data = {};

  if (contentType.includes("application/json")) {
    try {
      data = await response.json();
    } catch (_err) {
      data = {
        message: "Upstream trả về JSON không hợp lệ.",
        upstream_status: response.status,
        upstream_status_text: response.statusText
      };
    }
  } else {
    const rawText = await response.text();
    data = {
      message: "Upstream không trả về JSON.",
      upstream_status: response.status,
      upstream_status_text: response.statusText,
      upstream_content_type: contentType || "unknown",
      upstream_body_preview: rawText.slice(0, 200)
    };
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
