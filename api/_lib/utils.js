const crypto = require("crypto");

const DEFAULT_UPSTREAM_BASE_URL = "https://doremon.me/shop/api/activate/chatgpt";
const UPSTREAM_BASE_URL = process.env.DOREMON_BASE_URL || DEFAULT_UPSTREAM_BASE_URL;
const CONFIRM_TOKEN_TTL_MS = Number(process.env.CONFIRM_TOKEN_TTL_MS || 5 * 60 * 1000);
const CONFIRM_TOKEN_SECRET = String(
  process.env.ACTIVATION_CONFIRM_SECRET || "change-this-confirm-secret"
);

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

function mapCodeInfo(raw = {}) {
  return {
    code: String(raw.code || "").trim(),
    status: String(raw.status || "unknown").trim(),
    service: String(raw.service || "chatgpt").trim(),
    plan: String(raw.plan || "unknown").trim(),
    term: String(raw.term || "unknown").trim()
  };
}

function isPaidPlan(plan = "") {
  const normalized = String(plan).trim().toLowerCase();
  if (!normalized) {
    return false;
  }
  return [
    "plus",
    "pro",
    "team",
    "enterprise",
    "business",
    "premium",
    "paid"
  ].some((keyword) => normalized.includes(keyword));
}

function getUpstreamErrorMessage(data) {
  if (typeof data?.message === "string" && data.message.trim()) {
    return data.message.trim();
  }
  if (typeof data?.error === "string" && data.error.trim()) {
    return data.error.trim();
  }
  return "Upstream xử lý thất bại.";
}

function createUpstreamErrorPayload(error, upstream) {
  return {
    error,
    details: {
      status: upstream.status,
      message: getUpstreamErrorMessage(upstream.data)
    }
  };
}

function base64UrlEncode(input) {
  return Buffer.from(input, "utf8").toString("base64url");
}

function signPayload(payload) {
  return crypto.createHmac("sha256", CONFIRM_TOKEN_SECRET).update(payload).digest("base64url");
}

function buildConfirmationToken(payload) {
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signature = signPayload(encodedPayload);
  return `${encodedPayload}.${signature}`;
}

function verifyConfirmationToken(token, expectedFields) {
  if (typeof token !== "string" || !token.includes(".")) {
    return { ok: false, error: "Thiếu xác nhận từ bước 3." };
  }

  const [encodedPayload, signature] = token.split(".");
  if (!encodedPayload || !signature) {
    return { ok: false, error: "Xác nhận bước 3 không hợp lệ." };
  }

  const expectedSignature = signPayload(encodedPayload);
  if (signature !== expectedSignature) {
    return { ok: false, error: "Xác nhận bước 3 không hợp lệ." };
  }

  let decoded;
  try {
    decoded = JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf8"));
  } catch (_err) {
    return { ok: false, error: "Xác nhận bước 3 không hợp lệ." };
  }

  if (!decoded?.expiresAt || Number(decoded.expiresAt) < Date.now()) {
    return { ok: false, error: "Xác nhận bước 3 đã hết hạn. Vui lòng xác nhận lại." };
  }

  const checks = [
    ["code", expectedFields.code],
    ["email", expectedFields.email],
    ["currentPlan", expectedFields.currentPlan]
  ];
  for (const [field, expectedValue] of checks) {
    if (String(decoded[field] || "") !== String(expectedValue || "")) {
      return { ok: false, error: "Dữ liệu xác nhận không khớp. Vui lòng xác nhận lại." };
    }
  }

  return { ok: true, payload: decoded };
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
  buildConfirmationToken,
  callUpstream,
  createUpstreamErrorPayload,
  isPaidPlan,
  mapCodeInfo,
  parseSessionInput,
  sanitizeCode,
  sendJson,
  verifyConfirmationToken,
  CONFIRM_TOKEN_TTL_MS
};
