const cors = require("cors");
const express = require("express");
const helmet = require("helmet");
const {
  buildConfirmationToken,
  callUpstream,
  CONFIRM_TOKEN_TTL_MS,
  createUpstreamErrorPayload,
  isPaidPlan,
  mapCodeInfo,
  parseSessionInput,
  sanitizeCode,
  verifyConfirmationToken
} = require("../api/_lib/utils");

const app = express();
const PORT = Number(process.env.PORT || 3000);
const ALLOWED_ORIGINS = String(process.env.ALLOWED_ORIGINS || "")
  .split(",")
  .map((item) => item.trim())
  .filter(Boolean);

app.use(
  helmet({
    contentSecurityPolicy: false
  })
);

app.use(express.json({ limit: "1mb" }));
app.use(
  cors({
    origin(origin, callback) {
      if (!origin) {
        callback(null, true);
        return;
      }
      if (ALLOWED_ORIGINS.length === 0 || ALLOWED_ORIGINS.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error("Origin không được phép."));
    }
  })
);

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, mode: "vps-backend" });
});

app.get("/api/cdk/:code", async (req, res) => {
  const code = sanitizeCode(req.params.code);
  if (!code) {
    res.status(400).json({ error: "Mã CDK không hợp lệ." });
    return;
  }

  try {
    const upstream = await callUpstream(`/keys/${encodeURIComponent(code)}`);
    if (!upstream.ok) {
      res.status(upstream.status).json(createUpstreamErrorPayload("Không thể kiểm tra CDK.", upstream));
      return;
    }
    res.json(mapCodeInfo(upstream.data));
  } catch (_err) {
    res.status(502).json({ error: "Lỗi kết nối upstream." });
  }
});

app.post("/api/activation/preview", async (req, res) => {
  try {
    const code = sanitizeCode(req.body?.code);
    const session = parseSessionInput(req.body?.session);

    if (!code) {
      res.status(400).json({ error: "Mã CDK không hợp lệ." });
      return;
    }

    const upstream = await callUpstream(`/keys/${encodeURIComponent(code)}`);
    if (!upstream.ok) {
      res.status(upstream.status).json(createUpstreamErrorPayload("Không thể kiểm tra CDK.", upstream));
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

    res.json({
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
    res.status(400).json({ error: error.message });
  }
});

app.post("/api/activation/start", async (req, res) => {
  try {
    const code = sanitizeCode(req.body?.code);
    const session = parseSessionInput(req.body?.session);
    const confirmToken = req.body?.confirmToken;

    if (!code) {
      res.status(400).json({ error: "Mã CDK không hợp lệ." });
      return;
    }

    const verification = verifyConfirmationToken(confirmToken, {
      code,
      email: session.email,
      currentPlan: session.currentPlan
    });
    if (!verification.ok) {
      res.status(400).json({ error: verification.error });
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
      res
        .status(upstream.status)
        .json(createUpstreamErrorPayload("Không thể bắt đầu kích hoạt.", upstream));
      return;
    }

    res.json(upstream.data);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get("/api/activation/:code", async (req, res) => {
  const code = sanitizeCode(req.params.code);
  if (!code) {
    res.status(400).json({ error: "Mã CDK không hợp lệ." });
    return;
  }

  try {
    const upstream = await callUpstream(`/keys/${encodeURIComponent(code)}/activation`);
    if (!upstream.ok) {
      res
        .status(upstream.status)
        .json(createUpstreamErrorPayload("Không thể lấy trạng thái kích hoạt.", upstream));
      return;
    }
    res.json(upstream.data);
  } catch (_err) {
    res.status(502).json({ error: "Lỗi kết nối upstream." });
  }
});

app.post("/api/cdk/bulk-status", async (req, res) => {
  const rawCodes = Array.isArray(req.body?.codes) ? req.body.codes : [];
  const codes = rawCodes.map(sanitizeCode).filter(Boolean);

  if (codes.length === 0) {
    res.status(400).json({ error: "Danh sách mã CDK trống." });
    return;
  }

  try {
    const upstream = await callUpstream("/keys/bulk-status", {
      method: "POST",
      body: { codes }
    });
    if (!upstream.ok) {
      res
        .status(upstream.status)
        .json(createUpstreamErrorPayload("Không thể kiểm tra nhiều CDK.", upstream));
      return;
    }
    res.json(upstream.data);
  } catch (_err) {
    res.status(502).json({ error: "Lỗi kết nối upstream." });
  }
});

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
