import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Plus, Search, User, LogOut, LogIn, Bell, MessageCircle } from 'lucide-react';
import { useAuthStore } from '../stores/auth.store';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { api } from '../services/api.service';
import { formatDistanceToNow } from 'date-fns';

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [showNotifs, setShowNotifs] = useState(false);
  const queryClient = useQueryClient();

  const isActive = (path) => location.pathname === path;

  const { data: notifsData } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => api.get('/notifications').then(r => r.data),
    enabled: isAuthenticated,
    refetchInterval: 30000, // poll every 30s
  });

  const markReadMutation = useMutation({
    mutationFn: () => api.put('/notifications/read'),
    onSuccess: () => queryClient.invalidateQueries(['notifications']),
  });

  const notifications = notifsData?.notifications || [];
  const unread = notifications.filter(n => !n.read).length;

  const handleBell = () => {
    setShowNotifs(!showNotifs);
    if (!showNotifs && unread > 0) markReadMutation.mutate();
  };

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
                {/* Bell */}
                <div className="relative">
                  <button onClick={handleBell} className="relative text-dark-400 hover:text-white">
                    <Bell className="w-5 h-5" />
                    {unread > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">
                        {unread > 9 ? '9+' : unread}
                      </span>
                    )}
                  </button>

                  {/* Dropdown */}
                  {showNotifs && (
                    <div className="absolute right-0 top-8 w-80 bg-dark-800 border border-dark-600 rounded-xl shadow-xl z-50 max-h-96 overflow-y-auto">
                      <div className="p-3 border-b border-dark-700 text-sm font-medium text-white">
                        Notifications
                      </div>
                      {notifications.length === 0 ? (
                        <p className="text-dark-400 text-sm text-center py-6">No notifications yet</p>
                      ) : (
                        notifications.map(n => (
                          <div
                            key={n.id}
                            className={`p-3 border-b border-dark-700 text-sm ${!n.read ? 'bg-dark-700' : ''}`}
                          >
                            <p className="text-white">{n.message}</p>
                            <p className="text-dark-400 text-xs mt-1">
                              {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>

                <span className="text-dark-300 text-sm hidden sm:block">{user?.name || user?.email}</span>
                <Link to="/profile" className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white font-bold text-sm">
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

      {/* Backdrop to close notifs */}
      {showNotifs && <div className="fixed inset-0 z-40" onClick={() => setShowNotifs(false)} />}

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
            <Link to="/notifications" className={`flex flex-col items-center gap-1 relative ${isActive('/notifications') ? 'text-primary-500' : 'text-dark-400'}`}>
              <div className="relative">
                <Bell className="w-6 h-6" />
                {unread > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">
                    {unread > 9 ? '9+' : unread}
                  </span>
                )}
              </div>
              <span className="text-xs">Alerts</span>
            </Link>
            <Link to="/chat" className={`flex flex-col items-center gap-1 ${isActive('/chat') ? 'text-primary-500' : 'text-dark-400'}`}>
              <MessageCircle className="w-6 h-6" />
              <span className="text-xs">Chat</span>
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
