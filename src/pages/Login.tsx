// src/pages/Login.tsx
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import AuthLayout from '../layouts/AuthLayout';
import { TdsMessage } from '@scania/tegel-react';

const Login = () => {
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!token.trim()) {
      setError('Please enter a GitHub token');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await login(token.trim());
    } catch (err) {
      console.error('Login error:', err);
      setError('Invalid GitHub token');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="login-card lex flex-col flex-grow">
        <div className="">
          <h1 className="">Log in</h1>
          <p className="">Enter your Personal Access Token</p>
        </div>

        {error && (
          <TdsMessage variant="error" className="mb-4">
            {error}
          </TdsMessage>
        )}

        <div className="space-y-4">
          <input
            type="password"
            className="w-full p-2 border rounded"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Enter your GitHub token"
            disabled={isLoading}
          />

          <button
            className="w-full bg-blue-600 text-white py-2 px-4 rounded disabled:opacity-50"
            onClick={handleLogin}
            disabled={isLoading || !token.trim()}
          >
            {isLoading ? 'Logging in...' : 'Log in'}
          </button>
        </div>

        <div className="login-info">
          <p>Need a GitHub token? Follow these steps:</p>
          <ol className="list-decimal ml-5 mt-2">
            <li>Go to GitHub Settings</li>
            <li>Scroll to Developer Settings</li>
            <li>Select Personal Access Tokens → Tokens (classic)</li>
            <li>Generate new token with required permissions</li>
          </ol>
        </div>
      </div>
    </AuthLayout>
  );
};

export default Login;