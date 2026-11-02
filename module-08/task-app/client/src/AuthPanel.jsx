import React, { useEffect, useRef, useState } from 'react';
import { api, initializeSession } from './api.js';

export function AuthPanel({ onSignedIn, captchaEnabled = false, captchaToken = '', captchaContent = null, onRegistrationAttempt }) {
  const [mode, setMode] = useState('login');
  const [pending, setPending] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [resendAt, setResendAt] = useState(0);
  const [time, setTime] = useState(Date.now());
  const form = useRef(null), otpInput = useRef(null), locked = useRef(false);
  useEffect(() => {
    const url = new URL(window.location.href);
    const result = url.searchParams.get('verification');
    if (result) {
      setMessage(result === 'success' ? 'Email verified. Enter your email and password to receive a login code.' : 'This verification link is invalid, expired, or already used. Try signing in, or request a new link.');
      url.searchParams.delete('verification');
      window.history.replaceState(null, '', url.pathname + url.search + url.hash);
    }
  }, []);
  useEffect(() => {
    if (!pending) return;
    otpInput.current?.focus();
    const timer = setInterval(() => setTime(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [pending]);
  useEffect(() => {
    let ignore = false;
    api('/auth/pending').then(data => {
      if (!ignore && data.otpRequired) awaitCode(data);
    }).catch(failure => { if (!ignore) setError(failure.message); });
    return () => { ignore = true; };
  }, []);
  const wait = Math.max(0, Math.ceil((resendAt - time) / 1000));
  async function run(action) {
    if (locked.current) return;
    locked.current = true; setBusy(true); setError(''); setMessage('');
    try { await action(); }
    catch (failure) {
      setError(failure.message);
      if (failure.status === 403) {
        try { await initializeSession(); } catch { setError('Connection lost. Reload the page and try again.'); }
      }
    } finally { locked.current = false; setBusy(false); }
  }
  function awaitCode(data) {
    setPending(true);
    setTime(Date.now()); setResendAt(Date.now() + data.resendAfterSeconds * 1000);
    setMessage('Check your email for the six-digit code. Enter it here within five minutes.');
  }
  function submit(event, action = mode) {
    event.preventDefault();
    if (!form.current.reportValidity()) return;
    const values = new FormData(form.current);
    if (action === 'register' && captchaEnabled && !captchaToken) { setError('Complete the verification challenge before registering.'); return; }
    run(async () => {
      const data = await api(`/auth/${action}`, { method: 'POST', timeoutMs: 30000,
        body: { email: values.get('email'), password: values.get('password'), ...(action === 'register' ? { captchaToken } : {}) } });
      if (action === 'login') { form.current.reset(); awaitCode(data); }
      else { form.current.reset(); setMode('login'); setMessage(data.message); }
    }).finally(() => { if (action === 'register') onRegistrationAttempt?.(); });
  }
  function verify(event) {
    event.preventDefault();
    const code = new FormData(event.currentTarget).get('code');
    run(async () => {
      const data = await api('/auth/verify-otp', { method: 'POST', body: { code } });
      await onSignedIn(data.user);
    });
  }
  function restart() {
    run(async () => {
      await api('/auth/logout', { method: 'POST' });
      await initializeSession();
      setPending(false); setMode('login'); setMessage('Enter your email and password to start again.');
    });
  }
  return <section aria-labelledby="account-heading">
    <h2 id="account-heading">{pending ? 'Enter your email code' : mode === 'login' ? 'Sign in' : 'Create an account'}</h2>
    {message && <p role="status">{message}</p>}
    {error && <p role="alert">{error}</p>}
    {pending ? <>
      <form onSubmit={verify}><fieldset disabled={busy}><legend>Complete sign-in</legend>
        <label htmlFor="login-code">Six-digit code</label>
        <input ref={otpInput} id="login-code" name="code" type="text" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" minLength={6} maxLength={6} aria-describedby="code-help" required />
        <p id="code-help">Use the newest code in this browser tab. Each code expires after five minutes and allows five attempts.</p>
        <button>Verify code and sign in</button>
      </fieldset></form>
      <button disabled={busy || wait > 0} onClick={() => run(async () => {
        awaitCode(await api('/auth/resend-otp', { method: 'POST', timeoutMs: 30000 }));
        if (otpInput.current) otpInput.current.value = '';
      })}>{wait > 0 ? `Resend code in ${wait}s` : 'Resend login code'}</button>{' '}
      <button disabled={busy} onClick={restart}>Start again</button>
    </> : <>
      <p>{mode === 'register' ? 'Use an email inbox you can open. We will send a verification link.' : 'After your password is accepted, we will email a sign-in code.'}</p>
      <form ref={form} onSubmit={submit}><fieldset disabled={busy}><legend>Account details</legend>
        <label htmlFor="email">Email</label><input id="email" name="email" type="email" autoComplete="username" required />
        <label htmlFor="password">Password (15–128 characters)</label><input id="password" name="password" type="password" minLength={15} maxLength={128} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} required />
        {mode === 'register' && captchaContent}
        <button>{mode === 'login' ? 'Send login code' : 'Register and send verification link'}</button>
        {mode === 'login' && <button type="button" onClick={event => submit(event, 'resend-verification')}>Resend verification link</button>}
      </fieldset></form>
      <button disabled={busy} onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setMessage(''); setError(''); }}>{mode === 'login' ? 'Need an account?' : 'Already have an account?'}</button>
    </>}
    {busy && <p role="status">Working…</p>}
  </section>;
}
