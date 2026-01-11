import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn } from 'lucide-react';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error || 'An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="logo-icon">
            <img src="/logo.svg" alt="Sarfa" style={{ width: '100%', height: '100%' }} />
          </div>
          <h1>Welcome Back</h1>
          <p>Sign in to continue to Sarfa</p>
        </div>

        {error && (
          <div className="error-alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              className="form-input"
              placeholder="demo@expenses.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <input
              id="password"
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            disabled={loading}
            style={{ width: '100%' }}
          >
            <LogIn size={20} />
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="login-footer">
          <p>
            Don't have an account?{' '}
            <Link to="/register" className="login-link">
              Create one
            </Link>
          </p>
          <div className="demo-hint">
            <p className="text-sm text-gray-500">
              Demo credentials: <strong>demo@expenses.com</strong> / <strong>demo123</strong>
            </p>
          </div>
        </div>
      </div>

      <style>{`
        .login-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: var(--space-6);
        }

        .login-card {
          width: 100%;
          max-width: 450px;
          background: var(--color-bg-secondary);
          border-radius: var(--radius-2xl);
          padding: var(--space-10);
          box-shadow: var(--shadow-2xl);
          animation: slideIn 0.3s ease-out;
        }

        .login-header {
          text-align: center;
          margin-bottom: var(--space-8);
        }

        .logo-icon {
          width: 80px;
          height: 80px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto var(--space-4);
        }

        .login-header h1 {
          font-size: var(--font-size-3xl);
          color: var(--color-gray-900);
          margin-bottom: var(--space-2);
        }

        .login-header p {
          color: var(--color-gray-600);
          margin-bottom: 0;
        }

        .error-alert {
          background-color: #fee2e2;
          border-left: 4px solid var(--color-error);
          color: #991b1b;
          padding: var(--space-4);
          border-radius: var(--radius-md);
          margin-bottom: var(--space-6);
          font-size: var(--font-size-sm);
        }

        .login-form {
          margin-bottom: var(--space-6);
        }

        .login-footer {
          text-align: center;
          padding-top: var(--space-6);
          border-top: 1px solid var(--color-gray-200);
        }

        .login-footer p {
          color: var(--color-gray-600);
          margin-bottom: var(--space-4);
        }

        .login-link {
          color: var(--color-primary-600);
          font-weight: var(--font-weight-semibold);
          text-decoration: none;
        }

        .login-link:hover {
          color: var(--color-primary-700);
          text-decoration: underline;
        }

        .demo-hint {
          background-color: var(--color-gray-50);
          padding: var(--space-4);
          border-radius: var(--radius-md);
        }

        @keyframes slideIn {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        @media (max-width: 640px) {
          .login-card {
            padding: var(--space-6);
          }

          .logo-icon {
            width: 60px;
            height: 60px;
          }
        }
      `}</style>
    </div>
  );
};

export default Login;
