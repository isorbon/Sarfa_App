import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus, Wallet } from 'lucide-react';

const Register: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);

    try {
      await register(email, password, name);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error || 'An error occurred during registration');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <div className="register-header">
          <div className="logo-icon">
            <Wallet size={40} />
          </div>
          <h1>Create Account</h1>
          <p>Join your family in tracking expenses</p>
        </div>

        {error && (
          <div className="error-alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="register-form">
          <div className="form-group">
            <label htmlFor="name" className="form-label">
              Full Name
            </label>
            <input
              id="name"
              type="text"
              className="form-input"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoComplete="name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              className="form-input"
              placeholder="john@example.com"
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
              autoComplete="new-password"
              minLength={6}
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword" className="form-label">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              autoComplete="new-password"
              minLength={6}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            disabled={loading}
            style={{ width: '100%' }}
          >
            <UserPlus size={20} />
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="register-footer">
          <p>
            Already have an account?{' '}
            <Link to="/login" className="register-link">
              Sign in
            </Link>
          </p>
        </div>
      </div>

      <style>{`
        .register-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: var(--space-6);
        }

        .register-card {
          width: 100%;
          max-width: 450px;
          background: var(--color-bg-secondary);
          border-radius: var(--radius-2xl);
          padding: var(--space-10);
          box-shadow: var(--shadow-2xl);
          animation: slideIn 0.3s ease-out;
        }

        .register-header {
          text-align: center;
          margin-bottom: var(--space-8);
        }

        .logo-icon {
          width: 80px;
          height: 80px;
          background: linear-gradient(135deg, var(--color-primary-600), var(--color-blue-500));
          border-radius: var(--radius-xl);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto var(--space-4);
          color: white;
        }

        .register-header h1 {
          font-size: var(--font-size-3xl);
          color: var(--color-gray-900);
          margin-bottom: var(--space-2);
        }

        .register-header p {
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

        .register-form {
          margin-bottom: var(--space-6);
        }

        .register-footer {
          text-align: center;
          padding-top: var(--space-6);
          border-top: 1px solid var(--color-gray-200);
        }

        .register-footer p {
          color: var(--color-gray-600);
          margin-bottom: 0;
        }

        .register-link {
          color: var(--color-primary-600);
          font-weight: var(--font-weight-semibold);
          text-decoration: none;
        }

        .register-link:hover {
          color: var(--color-primary-700);
          text-decoration: underline;
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
          .register-card {
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

export default Register;
