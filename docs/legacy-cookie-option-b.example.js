/**
 * Legacy Express (Node 8) — session cookie for iframe Option B.
 * Use on login AND ensure iframe src is https://localhost:9001 (not http).
 */
function setSessionCookie(res, sessionId) {
  res.cookie('SESSION_ID', sessionId, {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    path: '/',
    maxAge: 8 * 60 * 60 * 1000,
  })
}

// iframe in legacy HTML:
// <iframe src="https://localhost:9001" title="Recruta Simples"></iframe>

module.exports = { setSessionCookie }
