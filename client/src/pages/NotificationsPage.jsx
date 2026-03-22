import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, Link } from 'react-router-dom';
import { Bell, Check, Package, X, MessageCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { api } from '../services/api.service';
import { useAuthStore } from '../stores/auth.store';

const iconMap = {
  new_claim: <Package className="w-5 h-5 text-blue-400" />,
  claim_approved: <Check className="w-5 h-5 text-green-400" />,
  claim_rejected: <X className="w-5 h-5 text-red-400" />,
  new_message: <MessageCircle className="w-5 h-5 text-primary-400" />,
};

export default function NotificationsPage() {
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => api.get('/notifications').then(r => r.data),
    enabled: isAuthenticated,
  });

  const markReadMutation = useMutation({
    mutationFn: () => api.put('/notifications/read'),
    onSuccess: () => queryClient.invalidateQueries(['notifications']),
  });

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <p className="text-dark-400">Sign in to see your notifications.</p>
        <button onClick={() => navigate('/auth')} className="btn-primary px-6 py-2">Sign In</button>
      </div>
    );
  }

  const notifications = data?.notifications || [];
  const unread = notifications.filter(n => !n.read).length;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Bell className="w-6 h-6 text-primary-500" />
          <h1 className="text-2xl font-bold text-white">Notifications</h1>
          {unread > 0 && (
            <span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">{unread} new</span>
          )}
        </div>
        {unread > 0 && (
          <button
            onClick={() => markReadMutation.mutate()}
            className="text-sm text-primary-500 hover:text-primary-400"
          >
            Mark all as read
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="text-center text-dark-400 py-12">Loading...</div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-16">
          <Bell className="w-12 h-12 text-dark-600 mx-auto mb-3" />
          <p className="text-dark-400">No notifications yet</p>
          <p className="text-dark-500 text-sm mt-1">When someone claims your post, you'll see it here</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map(n => (
            <Link
              key={n.id}
              to={n.data?.conversation_id ? `/chat/${n.data.conversation_id}` : n.data?.post_id ? `/post/${n.data.post_id}` : '#'}
              className={`flex items-start gap-3 p-4 rounded-xl border transition-colors ${
                !n.read
                  ? 'bg-dark-700 border-primary-500/30'
                  : 'bg-dark-800 border-dark-700'
              }`}
            >
              <div className="mt-0.5 shrink-0">
                {iconMap[n.type] || <Bell className="w-5 h-5 text-dark-400" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm">{n.message}</p>
                <p className="text-dark-400 text-xs mt-1">
                  {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                </p>
              </div>
              {!n.read && (
                <div className="w-2 h-2 rounded-full bg-primary-500 mt-1.5 shrink-0" />
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
