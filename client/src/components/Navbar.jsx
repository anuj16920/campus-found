import { Link, useLocation } from 'react-router-dom';
import { Home, Plus, Search } from 'lucide-react';

export default function Navbar() {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-dark-800 border-t border-dark-700 z-50">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center justify-around h-16">
          <Link
            to="/"
            className={`flex flex-col items-center gap-1 ${
              isActive('/') ? 'text-primary-500' : 'text-dark-400'
            }`}
          >
            <Home className="w-6 h-6" />
            <span className="text-xs">Home</span>
          </Link>

          <Link
            to="/search"
            className={`flex flex-col items-center gap-1 ${
              isActive('/search') ? 'text-primary-500' : 'text-dark-400'
            }`}
          >
            <Search className="w-6 h-6" />
            <span className="text-xs">Search</span>
          </Link>

          <Link
            to="/create"
            className={`flex flex-col items-center gap-1 ${
              isActive('/create') ? 'text-primary-500' : 'text-dark-400'
            }`}
          >
            <Plus className="w-6 h-6" />
            <span className="text-xs">Post</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}
