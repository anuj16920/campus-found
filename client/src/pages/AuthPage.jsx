import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/auth.store';

export default function AuthPage() {
  const navigate = useNavigate();
  const { login, register, isLoading, error, clearError } = useAuthStore();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ email: '', password: '', name: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    try {
      if (isLogin) {
        await login(formData.email, formData.password);
      } else {
        await register(formData.email, formData.password, formData.name);
      }
      navigate('/');
    } catch {
      // error is set in store
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-900 px-4">
      <div className="card p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">CampusFind</h1>
          <p className="text-dark-400">{isLogin ? 'Welcome back!' : 'Create an account'}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-sm text-dark-300 mb-1">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input w-full"
                placeholder="Your name"
              />
            </div>
          )}

          <div>
            <label className="block text-sm text-dark-300 mb-1">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="input w-full"
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-dark-300 mb-1">Password</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="input w-full"
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button type="submit" disabled={isLoading} className="btn-primary w-full py-3">
            {isLoading ? 'Please wait...' : isLogin ? 'Sign In' : 'Sign Up'}
          </button>
        </form>

        <p className="text-center text-dark-400 mt-6">
          {isLogin ? "Don't have an account? " : 'Already have an account? '}
          <button
            onClick={() => { setIsLogin(!isLogin); clearError(); }}
            className="text-primary-500 hover:text-primary-400"
          >
            {isLogin ? 'Sign Up' : 'Sign In'}
          </button>
        </p>
      </div>
    </div>
  );
}
