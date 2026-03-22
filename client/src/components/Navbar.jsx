import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Plus, Search, User, LogOut, LogIn } from 'lucide-react';
import { useAuthStore } from '../stores/auth.store';

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthStore();

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <>
      {/* Top header */}
      <header className="fixed top-0 left-0 right-0 bg-dark-800 border-b border-dark-700 z-50 h-14 flex items-center px-4">
        <div className="max-w-4xl mx-auto w-full flex items-center justify-between">
          <Link to="/" className="text-xl font-bold text-primary-500">CampusFind</Link>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <span className="text-dark-300 text-sm hidden sm:block">
                  {user?.name || user?.email}
                </span>
                <Link
                  to="/profile"
                  className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white font-bold text-sm"
                >
                  {(user?.name || user?.email || 'U')[0].toUpperCase()}
                </Link>
                <button onClick={handleLogout} className="text-dark-400 hover:text-white">
                  <LogOut className="w-5 h-5" />
                </button>
              </>
            ) : (
              <Link to="/auth" className="flex items-center gap-1 text-sm text-primary-500 hover:text-primary-400">
                <LogIn className="w-4 h-4" />
                Sign In
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-dark-800 border-t border-dark-700 z-50">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center justify-around h-16">
            <Link to="/" className={`flex flex-col items-center gap-1 ${isActive('/') ? 'text-primary-500' : 'text-dark-400'}`}>
              <Home className="w-6 h-6" />
              <span className="text-xs">Home</span>
            </Link>

            <Link to="/search" className={`flex flex-col items-center gap-1 ${isActive('/search') ? 'text-primary-500' : 'text-dark-400'}`}>
              <Search className="w-6 h-6" />
              <span className="text-xs">Search</span>
            </Link>

            <Link to="/create" className={`flex flex-col items-center gap-1 ${isActive('/create') ? 'text-primary-500' : 'text-dark-400'}`}>
              <Plus className="w-6 h-6" />
              <span className="text-xs">Post</span>
            </Link>

            <Link to={isAuthenticated ? '/profile' : '/auth'} className={`flex flex-col items-center gap-1 ${isActive('/profile') || isActive('/auth') ? 'text-primary-500' : 'text-dark-400'}`}>
              <User className="w-6 h-6" />
              <span className="text-xs">{isAuthenticated ? 'Profile' : 'Login'}</span>
            </Link>
          </div>
        </div>
      </nav>
    </>
  );
}
