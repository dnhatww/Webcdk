const state = {
  codeInfo: null,
  preview: null,
  pollTimer: null,
  language: "vi"
};

const codeInput = document.getElementById("codeInput");
const sessionInput = document.getElementById("sessionInput");
const checkCodeBtn = document.getElementById("checkCodeBtn");
const previewBtn = document.getElementById("previewBtn");
const startBtn = document.getElementById("startBtn");
const bulkCodesInput = document.getElementById("bulkCodesInput");
const bulkCheckBtn = document.getElementById("bulkCheckBtn");

const codeResult = document.getElementById("codeResult");
const previewResult = document.getElementById("previewResult");
const activationResult = document.getElementById("activationResult");
const bulkResult = document.getElementById("bulkResult");
const langToggleBtn = document.getElementById("langToggleBtn");

const i18n = {
  vi: {
    pageTitle: "Nạp CDK ChatGPT",
    flowHint:
      "Luồng 4 bước: kiểm tra CDK, nhập session JSON, xác nhận thông tin và kích hoạt.",
    step1Title: "Bước 1: Kiểm tra CDK",
    step2Title: "Bước 2: Dán session JSON",
    step3Title: "Bước 3: Xác nhận tài khoản đích",
    step4Title: "Bước 4: Kích hoạt và theo dõi trạng thái",
    sessionWarn:
      "Session JSON chỉ được gửi từ backend của bạn tới API kích hoạt, không log ra console hoặc bên thứ ba.",
    bulkTitle: "Kiểm tra nhiều CDK",
    bulkHint: "Nhập nhiều mã, cách nhau bởi dấu phẩy hoặc xuống dòng.",
    codePlaceholder: "Nhập mã CDK, ví dụ ABC123",
    sessionPlaceholder: "Dán JSON từ https://chatgpt.com/api/auth/session",
    bulkPlaceholder: "ABC123, DEF456, GHI789",
    checkBtn: "Kiểm tra",
    previewBtn: "Xem thông tin xác nhận",
    startBtn: "Bắt đầu kích hoạt",
    bulkCheckBtn: "Kiểm tra hàng loạt",
    unknownError: "Có lỗi xảy ra.",
    enterCode: "Vui lòng nhập mã CDK.",
    checkingCode: "Đang kiểm tra CDK...",
    needCodeFirst: "Bạn cần nhập mã CDK trước.",
    needStep1First: "Hãy kiểm tra CDK ở bước 1 trước.",
    preparingPreview: "Đang xử lý thông tin xác nhận...",
    previewHeader: "Thông tin xác nhận:",
    email: "Email",
    name: "Tên",
    noName: "(không có)",
    currentPlanInSession: "Gói hiện tại trong session",
    cardCode: "Mã thẻ",
    targetPlan: "Gói đích",
    term: "Thời hạn",
    service: "Dịch vụ",
    needFinishStep1: "Bạn cần hoàn thành bước 1 trước.",
    needConfirmStep3: "Bạn cần xác nhận bước 3 trước khi kích hoạt.",
    startingActivation: "Đang bắt đầu kích hoạt...",
    activationStarted: "Khởi động thành công. Trạng thái",
    code: "Code",
    status: "Status",
    activatedEmail: "Activated email",
    pollError: "Poll lỗi",
    enterAtLeastOneCode: "Vui lòng nhập ít nhất 1 mã CDK.",
    checkingBulk: "Đang kiểm tra hàng loạt...",
    unknown: "unknown",
    dash: "-"
  },
  en: {
    pageTitle: "ChatGPT CDK Activation",
    flowHint:
      "4-step flow: check CDK, paste session JSON, confirm account, then activate.",
    step1Title: "Step 1: Check CDK",
    step2Title: "Step 2: Paste Session JSON",
    step3Title: "Step 3: Confirm Target Account",
    step4Title: "Step 4: Start Activation and Poll Status",
    sessionWarn:
      "Session JSON is sent only from your backend to activation API, and should never be logged to console or third parties.",
    bulkTitle: "Check Multiple CDKs",
    bulkHint: "Enter multiple codes separated by commas or new lines.",
    codePlaceholder: "Enter CDK code, e.g. ABC123",
    sessionPlaceholder: "Paste JSON from https://chatgpt.com/api/auth/session",
    bulkPlaceholder: "ABC123, DEF456, GHI789",
    checkBtn: "Check",
    previewBtn: "Preview Confirmation",
    startBtn: "Start Activation",
    bulkCheckBtn: "Bulk Check",
    unknownError: "Something went wrong.",
    enterCode: "Please enter a CDK code.",
    checkingCode: "Checking CDK...",
    needCodeFirst: "You need to enter CDK code first.",
    needStep1First: "Please complete step 1 first.",
    preparingPreview: "Preparing confirmation data...",
    previewHeader: "Confirmation details:",
    email: "Email",
    name: "Name",
    noName: "(not provided)",
    currentPlanInSession: "Current plan in session",
    cardCode: "Card code",
    targetPlan: "Target plan",
    term: "Term",
    service: "Service",
    needFinishStep1: "You need to complete step 1 first.",
    needConfirmStep3: "You need to confirm step 3 before activation.",
    startingActivation: "Starting activation...",
    activationStarted: "Activation started. Status",
    code: "Code",
    status: "Status",
    activatedEmail: "Activated email",
    pollError: "Polling failed",
    enterAtLeastOneCode: "Please enter at least one CDK code.",
    checkingBulk: "Checking in bulk...",
    unknown: "unknown",
    dash: "-"
  }
};

function t(key) {
  return i18n[state.language][key] || key;
}

function applyLanguage() {
  document.documentElement.lang = state.language;
  document.title = t("pageTitle");
  document.getElementById("pageTitle").textContent = t("pageTitle");
  document.getElementById("flowHint").textContent = t("flowHint");
  document.getElementById("step1Title").textContent = t("step1Title");
  document.getElementById("step2Title").textContent = t("step2Title");
  document.getElementById("step3Title").textContent = t("step3Title");
  document.getElementById("step4Title").textContent = t("step4Title");
  document.getElementById("sessionWarn").textContent = t("sessionWarn");
  document.getElementById("bulkTitle").textContent = t("bulkTitle");
  document.getElementById("bulkHint").textContent = t("bulkHint");
  codeInput.placeholder = t("codePlaceholder");
  sessionInput.placeholder = t("sessionPlaceholder");
  bulkCodesInput.placeholder = t("bulkPlaceholder");
  checkCodeBtn.textContent = t("checkBtn");
  previewBtn.textContent = t("previewBtn");
  startBtn.textContent = t("startBtn");
  bulkCheckBtn.textContent = t("bulkCheckBtn");
  langToggleBtn.textContent = state.language === "vi" ? "EN" : "VI";
}

function normalizedCode() {
  return codeInput.value.trim().toUpperCase();
}

function setResult(element, text, isError = false) {
  element.textContent = text;
  element.style.color = isError ? "#b91c1c" : "#111827";
}

async function requestJSON(url, options = {}) {
  const response = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    if (data.error && data.details?.message) {
      throw new Error(`${data.error} (${data.details.message})`);
    }
    throw new Error(data.error || t("unknownError"));
  }
  return data;
}

checkCodeBtn.addEventListener("click", async () => {
  const code = normalizedCode();
  state.preview = null;
  previewResult.textContent = "";
  activationResult.textContent = "";

  if (!code) {
    setResult(codeResult, t("enterCode"), true);
    return;
  }

  checkCodeBtn.disabled = true;
  setResult(codeResult, t("checkingCode"));
  try {
    const data = await requestJSON(`/api/cdk/${encodeURIComponent(code)}`);
    state.codeInfo = data;
    setResult(
      codeResult,
      `${t("code")}: ${data.code}\n${t("status")}: ${data.status}\n${t("service")}: ${data.service}\nPlan: ${data.plan}\n${t("term")}: ${data.term}`
    );
  } catch (error) {
    state.codeInfo = null;
    setResult(codeResult, error.message, true);
  } finally {
    checkCodeBtn.disabled = false;
  }
});

previewBtn.addEventListener("click", async () => {
  const code = normalizedCode();
  const session = sessionInput.value;

  if (!code) {
    setResult(previewResult, t("needCodeFirst"), true);
    return;
  }

  if (!state.codeInfo) {
    setResult(previewResult, t("needStep1First"), true);
    return;
  }

  previewBtn.disabled = true;
  setResult(previewResult, t("preparingPreview"));
  try {
    const data = await requestJSON("/api/activation/preview", {
      method: "POST",
      body: JSON.stringify({ code, session })
    });
    state.preview = data;
    setResult(
      previewResult,
      [
        t("previewHeader"),
        `${t("email")}: ${data.email}`,
        `${t("name")}: ${data.name || t("noName")}`,
        `${t("currentPlanInSession")}: ${data.currentPlan}`,
        `${t("cardCode")}: ${state.codeInfo.code}`,
        `${t("targetPlan")}: ${state.codeInfo.plan}`,
        `${t("term")}: ${state.codeInfo.term}`,
        `${t("service")}: ${state.codeInfo.service}`
      ].join("\n")
    );
  } catch (error) {
    state.preview = null;
    setResult(previewResult, error.message, true);
  } finally {
    previewBtn.disabled = false;
  }
});

async function pollActivation(code) {
  if (state.pollTimer) {
    clearInterval(state.pollTimer);
  }

  state.pollTimer = setInterval(async () => {
    try {
      const data = await requestJSON(`/api/activation/${encodeURIComponent(code)}`);
      setResult(
        activationResult,
        [
          `${t("code")}: ${data.code || code}`,
          `${t("status")}: ${data.status || t("unknown")}`,
          `${t("activatedEmail")}: ${data.activated_email || t("dash")}`,
          `${t("name")}: ${data.name || t("dash")}`,
          `Plan: ${data.plan || "-"}`,
          `${t("term")}: ${data.term || t("dash")}`
        ].join("\n"),
        String(data.status).toLowerCase() === "error"
      );

      const status = String(data.status || "").toLowerCase();
      if (status === "activated" || status === "error") {
        clearInterval(state.pollTimer);
        state.pollTimer = null;
        startBtn.disabled = false;
      }
    } catch (error) {
      clearInterval(state.pollTimer);
      state.pollTimer = null;
      startBtn.disabled = false;
      setResult(activationResult, `${t("pollError")}: ${error.message}`, true);
    }
  }, 1000);
}

startBtn.addEventListener("click", async () => {
  const code = normalizedCode();
  const session = sessionInput.value;

  if (!state.codeInfo) {
    setResult(activationResult, t("needFinishStep1"), true);
    return;
  }

  if (!state.preview) {
    setResult(activationResult, t("needConfirmStep3"), true);
    return;
  }

  startBtn.disabled = true;
  setResult(activationResult, t("startingActivation"));
  try {
    const data = await requestJSON("/api/activation/start", {
      method: "POST",
      body: JSON.stringify({ code, session })
    });
    setResult(activationResult, `${t("activationStarted")}: ${data.status}`);
    await pollActivation(code);
  } catch (error) {
    startBtn.disabled = false;
    setResult(activationResult, error.message, true);
  }
});

bulkCheckBtn.addEventListener("click", async () => {
  const codes = bulkCodesInput.value
    .split(/[\n,]+/)
    .map((code) => code.trim().toUpperCase())
    .filter(Boolean);

  if (codes.length === 0) {
    setResult(bulkResult, t("enterAtLeastOneCode"), true);
    return;
  }

  bulkCheckBtn.disabled = true;
  setResult(bulkResult, t("checkingBulk"));
  try {
    const data = await requestJSON("/api/cdk/bulk-status", {
      method: "POST",
      body: JSON.stringify({ codes })
    });
    setResult(bulkResult, JSON.stringify(data, null, 2));
  } catch (error) {
    setResult(bulkResult, error.message, true);
  } finally {
    bulkCheckBtn.disabled = false;
  }
});

langToggleBtn.addEventListener("click", () => {
  state.language = state.language === "vi" ? "en" : "vi";
  applyLanguage();
});

applyLanguage();
