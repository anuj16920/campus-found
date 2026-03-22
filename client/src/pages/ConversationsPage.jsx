import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { api } from '../services/api.service';
import { useAuthStore } from '../stores/auth.store';

export default function ConversationsPage() {
  const { isAuthenticated, user } = useAuthStore();
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ['conversations'],
    queryFn: () => api.get('/conversations').then(r => r.data),
    enabled: isAuthenticated,
  });

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <p className="text-dark-400">Sign in to see your messages.</p>
        <button onClick={() => navigate('/auth')} className="btn-primary px-6 py-2">Sign In</button>
      </div>
    );
  }

  const conversations = data?.conversations || [];

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-center gap-2 mb-6">
        <MessageCircle className="w-6 h-6 text-primary-500" />
        <h1 className="text-2xl font-bold text-white">Messages</h1>
      </div>

      {isLoading ? (
        <div className="text-center text-dark-400 py-12">Loading...</div>
      ) : conversations.length === 0 ? (
        <div className="text-center py-16">
          <MessageCircle className="w-12 h-12 text-dark-600 mx-auto mb-3" />
          <p className="text-dark-400">No conversations yet</p>
          <p className="text-dark-500 text-sm mt-1">Start a chat from a post page</p>
        </div>
      ) : (
        <div className="space-y-2">
          {conversations.map(c => (
            <button
              key={c.id}
              onClick={() => navigate(`/chat/${c.id}`)}
              className="w-full flex items-center gap-3 p-4 bg-dark-800 hover:bg-dark-700 rounded-xl border border-dark-700 transition-colors text-left"
            >
              <div className="w-11 h-11 rounded-full bg-primary-500 flex items-center justify-center text-white font-bold shrink-0">
                {(c.other_user?.name || 'U')[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-white font-medium truncate">{c.other_user?.name || 'User'}</p>
                  {c.last_message && (
                    <p className="text-dark-500 text-xs shrink-0 ml-2">
                      {formatDistanceToNow(new Date(c.last_message.created_at), { addSuffix: true })}
                    </p>
                  )}
                </div>
                {c.post && (
                  <p className="text-primary-500 text-xs truncate">re: {c.post.title}</p>
                )}
                {c.last_message && (
                  <p className="text-dark-400 text-sm truncate mt-0.5">
                    {c.last_message.sender_id === user?.id ? 'You: ' : ''}{c.last_message.content}
                  </p>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
