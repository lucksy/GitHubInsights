import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '../layouts/AuthLayout';
import { TdsMessage } from '@scania/tegel-react';

interface LoginProps {
  onLogin: () => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [token, setToken] = useState(''); // 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
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!token.trim()) {
      setError('Please enter a GitHub token');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('https://api.github.com/user', {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'Authorization': `token ${token.trim()}`
        }
      });

      const data = await response.json();

      if (response.ok && data.id) {
        localStorage.setItem('github_token', token.trim());
        localStorage.setItem('github_user', JSON.stringify(data));
        onLogin();
        navigate('/dashboard');
      } else {
        setError(data.message || 'Invalid GitHub token');
      }
    } catch (err) {
      console.error(err);
      setError('Failed to authenticate');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="flex flex-col flex-grow">
        <div className="mb-8">
          <h1 className="text-xl text-[#0D1C2E]">Log in to GitHub</h1>
          <p className="text-gray-500">Enter your Personal Access Token</p>
        </div>

        {error && (
          <TdsMessage variant="error" className="mb-4">
            {error}
          </TdsMessage>
        )}

        <div className="space-y-4">
          <input
            type="text"
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

        <div className="mt-4 text-sm text-gray-600">
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
}