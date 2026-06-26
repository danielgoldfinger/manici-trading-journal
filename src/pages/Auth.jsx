import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function Auth() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState('password'); // 'password' | 'magic'
  const [status, setStatus] = useState(null);
  const [error, setError] = useState(null);

  async function handlePasswordSignIn(e) {
    e.preventDefault();
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError(error.message);
    else navigate('/log');
  }

  async function handleSignUp(e) {
    e.preventDefault();
    setError(null);
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) setError(error.message);
    else setStatus('Check your email to confirm your account.');
  }

  async function handleMagicLink(e) {
    e.preventDefault();
    setError(null);
    const { error } = await supabase.auth.signInWithOtp({ email });
    if (error) setError(error.message);
    else setStatus('Check your email for a magic link.');
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-sm space-y-4">
        <h1 className="text-xl font-semibold">Mancini Trading Journal</h1>

        <div className="flex gap-2 text-sm">
          <button
            className={mode === 'password' ? 'font-medium text-purple-600' : 'text-gray-500'}
            onClick={() => setMode('password')}
          >
            Password
          </button>
          <span className="text-gray-400">/</span>
          <button
            className={mode === 'magic' ? 'font-medium text-purple-600' : 'text-gray-500'}
            onClick={() => setMode('magic')}
          >
            Magic link
          </button>
        </div>

        <form onSubmit={mode === 'password' ? handlePasswordSignIn : handleMagicLink} className="space-y-3">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900"
          />
          {mode === 'password' && (
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900"
            />
          )}
          <button
            type="submit"
            className="w-full rounded bg-purple-600 px-3 py-2 text-sm font-medium text-white hover:bg-purple-700"
          >
            {mode === 'password' ? 'Sign in' : 'Send magic link'}
          </button>
          {mode === 'password' && (
            <button
              type="button"
              onClick={handleSignUp}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm font-medium dark:border-gray-700"
            >
              Create account
            </button>
          )}
        </form>

        {error && <p className="text-sm text-red-600">{error}</p>}
        {status && <p className="text-sm text-green-600">{status}</p>}
      </div>
    </div>
  );
}
