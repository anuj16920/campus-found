import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/auth.store';
import { LogOut, Wrench } from 'lucide-react';
import { api } from '../services/api.service';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <p className="text-dark-400">You're not logged in.</p>
        <button onClick={() => navigate('/auth')} className="btn-primary px-6 py-2">
          Sign In
        </button>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const [fixing, setFixing] = useState(false);
  const handleFixPosts = async () => {
    setFixing(true);
    try {
      const res = await api.post('/posts/fix-ownership');
      toast.success(`Fixed ${res.data.fixed} post(s) — you now own them!`);
    } catch {
      toast.error('Failed to fix posts');
    } finally {
      setFixing(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-8">
      <div className="card p-6 flex flex-col items-center gap-4">
        <div className="w-20 h-20 rounded-full bg-primary-500 flex items-center justify-center text-white text-3xl font-bold">
          {(user?.name || user?.email || 'U')[0].toUpperCase()}
        </div>
        <div className="text-center">
          <h2 className="text-xl font-bold text-white">{user?.name || 'User'}</h2>
          <p className="text-dark-400 text-sm">{user?.email}</p>
        </div>
        <button
          onClick={handleFixPosts}
          disabled={fixing}
          className="flex items-center gap-2 text-primary-400 hover:text-primary-300 mt-2 text-sm"
        >
          <Wrench className="w-4 h-4" />
          {fixing ? 'Fixing...' : 'Fix My Posts Ownership'}
        </button>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-red-400 hover:text-red-300 mt-2"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </div>
  );
}
