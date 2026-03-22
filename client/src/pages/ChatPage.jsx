import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Send, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { api } from '../services/api.service';
import { useAuthStore } from '../stores/auth.store';

export default function ChatPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();
  const [text, setText] = useState('');
  const bottomRef = useRef(null);

  const { data, isLoading } = useQuery({
    queryKey: ['chat', id],
    queryFn: () => api.get(`/conversations/${id}/messages`).then(r => r.data),
    enabled: isAuthenticated,
    refetchInterval: 5000, // poll every 5s for new messages
  });

  const sendMutation = useMutation({
    mutationFn: (content) => api.post(`/conversations/${id}/messages`, { content }),
    onSuccess: () => {
      queryClient.invalidateQueries(['chat', id]);
      queryClient.invalidateQueries(['conversations']);
      setText('');
    },
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [data?.messages]);

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <p className="text-dark-400">Sign in to chat.</p>
        <button onClick={() => navigate('/auth')} className="btn-primary px-6 py-2">Sign In</button>
      </div>
    );
  }

  const messages = data?.messages || [];
  const conv = data?.conversation;
  const otherId = conv?.user1_id === user?.id ? conv?.user2_id : conv?.user1_id;

  const handleSend = () => {
    if (!text.trim()) return;
    sendMutation.mutate(text.trim());
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="max-w-2xl mx-auto flex flex-col h-[calc(100vh-7rem)]">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-dark-700 bg-dark-800">
        <button onClick={() => navigate('/chat')} className="text-dark-400 hover:text-white">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1 min-w-0">
          {conv?.post && (
            <Link to={`/post/${conv.post.id}`} className="text-primary-500 text-xs hover:underline truncate block">
              re: {conv.post.title}
            </Link>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {isLoading ? (
          <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-primary-500" /></div>
        ) : messages.length === 0 ? (
          <p className="text-center text-dark-500 text-sm py-8">No messages yet. Say hi!</p>
        ) : (
          messages.map(m => {
            const isMe = m.sender_id === user?.id;
            return (
              <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm ${
                  isMe
                    ? 'bg-primary-500 text-white rounded-br-sm'
                    : 'bg-dark-700 text-white rounded-bl-sm'
                }`}>
                  <p>{m.content}</p>
                  <p className={`text-xs mt-1 ${isMe ? 'text-primary-200' : 'text-dark-400'}`}>
                    {formatDistanceToNow(new Date(m.created_at), { addSuffix: true })}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-dark-700 bg-dark-800 flex gap-2">
        <input
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Type a message..."
          className="input flex-1"
          maxLength={1000}
        />
        <button
          onClick={handleSend}
          disabled={!text.trim() || sendMutation.isPending}
          className="btn-primary px-4 py-2 shrink-0"
        >
          {sendMutation.isPending
            ? <Loader2 className="w-4 h-4 animate-spin" />
            : <Send className="w-4 h-4" />
          }
        </button>
      </div>
    </div>
  );
}
