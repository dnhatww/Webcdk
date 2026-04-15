const { allowMethod, sendJson } = require("./_lib/utils");

module.exports = async function handler(req, res) {
  if (!allowMethod(req, res, "GET")) {
    return;
  }

  sendJson(res, 200, { ok: true });
};
