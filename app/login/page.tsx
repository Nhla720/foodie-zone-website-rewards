'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Login() {
const r = useRouter();
const [resetSuccess, setResetSuccess] = useState(false);
const [e, setE] = useState('');
const [p, setP] = useState('');
const [show, setShow] = useState(false);
const [err, setErr] = useState('');
const [busy, setBusy] = useState(false);

useEffect(() => {
setResetSuccess(
new URLSearchParams(window.location.search).get('reset') === 'success'
);
}, []);

async function submit(x: FormEvent) {
x.preventDefault();
setErr('');
setBusy(true);


try {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: e, password: p }),
  });

  const d = await res.json();

  if (!res.ok) {
    setErr(d.error || 'Login failed');
    return;
  }

  r.push(d.mustUpgradePassword ? '/update-password' : '/dashboard');
} catch {
  setErr('Unable to log in right now.');
} finally {
  setBusy(false);
}


}

return ( <main className="wrap"> <div className="card form"> <div className="eyebrow">FOODIE ZONE REWARDS</div>


    <h1>Welcome back</h1>

    {resetSuccess && (
      <div className="success">
        Your password has been updated. You can now log in.
      </div>
    )}

    {err && <div className="error">{err}</div>}

    <form onSubmit={submit}>
      <div className="field">
        <label>Email</label>
        <input
          type="email"
          value={e}
          onChange={(x) => setE(x.target.value)}
          autoComplete="email"
          required
        />
      </div>

      <div className="field">
        <div className="field-label-row">
          <label>Password</label>
          <Link href="/forgot-password">Forgot password?</Link>
        </div>

        <div className="password-field">
          <input
            type={show ? 'text' : 'password'}
            value={p}
            onChange={(x) => setP(x.target.value)}
            autoComplete="current-password"
            required
          />

          <button
            type="button"
            className="show-password"
            onClick={() => setShow(!show)}
          >
            {show ? 'Hide' : 'Show'}
          </button>
        </div>
      </div>

      <button className="primary" disabled={busy}>
        {busy ? 'Logging in...' : 'Login'}
      </button>
    </form>

    <div className="links">
      <Link href="/register">Create account</Link>
      <Link href="/admin">Admin Login</Link>
      <Link href="/">Home</Link>
    </div>
  </div>
</main>

);
}

