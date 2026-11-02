import React, { useEffect, useRef, useState } from 'react';
let loading;
function loadProvider() {
  if (window.grecaptcha?.render) return Promise.resolve(window.grecaptcha);
  if (!loading) loading = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    let settled = false;
    const timer = setTimeout(() => finish(new Error('Verification did not load.')), 15000);
    function finish(error) {
      if (settled) return; settled = true; clearTimeout(timer);
      if (error) reject(error); else resolve(window.grecaptcha);
    }
    window.module6CaptchaLoaded = () => finish();
    script.src = 'https://www.google.com/recaptcha/api.js?onload=module6CaptchaLoaded&render=explicit';
    script.async = true; script.defer = true;
    script.onerror = () => finish(new Error('Verification could not load.'));
    document.head.append(script);
  });
  return loading;
}
export function Captcha({ siteKey, onToken, resetVersion }) {
  const host = useRef(null), widget = useRef(null), callback = useRef(onToken);
  const [error, setError] = useState('');
  callback.current = onToken;
  useEffect(() => {
    let active = true;
    loadProvider().then(provider => {
      if (!active) return;
      widget.current = provider.render(host.current, {
        sitekey: siteKey, size: 'compact',
        callback: token => { if (active) { setError(''); callback.current(token); } },
        'expired-callback': () => { if (active) { callback.current(''); setError('Verification expired. Complete it again.'); } },
        'error-callback': () => { if (active) { callback.current(''); setError('Verification failed. Reload when the connection returns.'); } }
      });
    }).catch(() => { if (active) setError('Verification could not load. Check the connection, then reload.'); });
    return () => { active = false; if (widget.current !== null) window.grecaptcha?.reset(widget.current); };
  }, [siteKey]);
  useEffect(() => { if (widget.current !== null) window.grecaptcha?.reset(widget.current); }, [resetVersion]);
  return <section aria-label="Registration verification"><p>Complete the verification before registering. This loads a Google service.</p>
    <div ref={host} /><p role="status">{error}</p>
    <p>If the challenge prevents access, contact the course instructor through Canvas for assistance.</p>
  </section>;
}
