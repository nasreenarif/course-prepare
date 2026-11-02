export function securityHeaders({ production = false, captcha = false } = {}) {
  const scripts = "'self'" + (captcha ? ' https://www.google.com/recaptcha/ https://www.gstatic.com/recaptcha/' : '');
  const frames = captcha ? 'https://www.google.com/recaptcha/ https://recaptcha.google.com/recaptcha/' : "'none'";
  const connections = "'self'" + (captcha ? ' https://www.google.com/recaptcha/' : '');
  return (req, res, next) => {
    res.set('X-Content-Type-Options', 'nosniff');
    res.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.set('X-Frame-Options', 'DENY');
    // Enforce on Express-served built HTML, not Vite's development page.
    res.set('Content-Security-Policy', [
      "default-src 'self'", `script-src ${scripts}`, "style-src 'self'",
      "img-src 'self' data:", `connect-src ${connections}`, `frame-src ${frames}`,
      "object-src 'none'", "base-uri 'none'", "form-action 'self'", "frame-ancestors 'none'"
    ].join('; '));
    if (production) res.set('Strict-Transport-Security', 'max-age=31536000');
    next();
  };
}
