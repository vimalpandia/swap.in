'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Send, Users2, Trash2, Heart, Flame, Sparkles } from 'lucide-react';
import { ConversationItem, MessageItem } from '@swap/shared';
import { useAuthStore } from '../../store/authStore';
import { useUIStore } from '../../store/uiStore';
import { getSocket } from '../../lib/socket';
import { api } from '../../lib/api';

interface ChatWindowProps {
  conversation: ConversationItem;
}

export function ChatWindow({ conversation }: ChatWindowProps) {
  const { user } = useAuthStore();
  const { startWatchParty } = useUIStore();
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [peerTyping, setPeerTyping] = useState<string | null>(null);
  const [smartReplies, setSmartReplies] = useState<string[]>([
    'Count me in! 🙌',
    'Joining the Watch Party! 🍿',
    'Keeping the streak alive! 🔥',
  ]);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const peer = conversation.participants.find((p) => p.id !== user?.id) || conversation.participants[0];

  useEffect(() => {
    // Fetch initial messages
    api
      .get(`/chat/conversations/${conversation.id}/messages`)
      .then((res) => {
        if (res.data.success) {
          setMessages(res.data.data.items || []);
        }
      })
      .catch(() => {});

    // Socket listeners
    const socket = getSocket();
    socket.emit('join_conversation', conversation.id);

    socket.on('new_message', (msg: MessageItem) => {
      if (msg.conversationId === conversation.id) {
        setMessages((prev) => [...prev, msg]);
      }
    });

    socket.on('user_typing', (data: any) => {
      if (data.conversationId === conversation.id && data.userId !== user?.id) {
        setPeerTyping(data.username);
      }
    });

    socket.on('user_stopped_typing', (data: any) => {
      if (data.conversationId === conversation.id) {
        setPeerTyping(null);
      }
    });

    return () => {
      socket.emit('leave_conversation', conversation.id);
      socket.off('new_message');
      socket.off('user_typing');
      socket.off('user_stopped_typing');
    };
  }, [conversation.id, user?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    const optimisticMsg: MessageItem = {
      id: `msg-${Date.now()}`,
      conversationId: conversation.id,
      sender: {
        id: user?.id || 'me',
        username: user?.username || 'user',
        name: user?.name || 'User',
        avatarUrl: user?.avatarUrl || null,
      },
      type: 'TEXT',
      content: text.trim(),
      isDeleted: false,
      readBy: [],
      reactions: {},
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, optimisticMsg]);
    setInputText('');

    const socket = getSocket();
    socket.emit('typing_stop', { conversationId: conversation.id });
    setIsTyping(false);

    try {
      const res = await api.post('/chat/messages', {
        conversationId: conversation.id,
        content: text.trim(),
        type: 'TEXT',
      });

      if (res.data.success) {
        socket.emit('send_message', res.data.data);
      }
    } catch {
      // Optimistic message kept
    }
  };

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
    const socket = getSocket();

    if (!isTyping) {
      setIsTyping(true);
      socket.emit('typing_start', { conversationId: conversation.id });
    }

    // Auto-stop typing debounce
    setTimeout(() => {
      setIsTyping(false);
      socket.emit('typing_stop', { conversationId: conversation.id });
    }, 2000);
  };

  const toggleReaction = async (messageId: string, emoji: string) => {
    try {
      await api.post(`/chat/messages/${messageId}/reaction`, { emoji });
      setMessages((prev) =>
        prev.map((m) => {
          if (m.id === messageId) {
            const current = m.reactions[emoji] || [];
            const hasReacted = current.includes(user?.id || '');
            const updated = hasReacted
              ? current.filter((id) => id !== user?.id)
              : [...current, user?.id || ''];
            return {
              ...m,
              reactions: { ...m.reactions, [emoji]: updated },
            };
          }
          return m;
        })
      );
    } catch {}
  };

  return (
    <div className="flex-1 h-full flex flex-col bg-[#090A0F] select-none">
      {/* Chat Header */}
      <div className="p-3.5 border-b border-[#1F2438] bg-[#12141F] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img
            src={peer?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
            alt={peer?.username || 'User'}
            className="w-9 h-9 rounded-full object-cover border border-violet-500/40"
          />
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-white">
                {conversation.isGroup ? conversation.title : peer?.name}
              </span>
              {conversation.streakWithPeer ? (
                <span className="text-[11px] font-mono text-amber-400 font-bold flex items-center">
                  <Flame className="w-3.5 h-3.5 fill-amber-400 mr-0.5" />
                  {conversation.streakWithPeer} day streak
                </span>
              ) : null}
            </div>
            <span className="text-[10px] text-emerald-400 font-medium">Online</span>
          </div>
        </div>

        {/* Watch Party Launcher */}
        <button
          onClick={() => startWatchParty(`party-${conversation.id}`, 'reel-collab-1')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 via-pink-600 to-amber-500 text-white hover:opacity-95 text-xs font-semibold shadow-md shadow-pink-600/20 transition-all"
        >
          <Users2 className="w-3.5 h-3.5 text-white" />
          <span>Start Watch Party</span>
        </button>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3">
        {messages.map((m) => {
          const isMe = m.sender.id === user?.id || m.sender.username === user?.username;

          return (
            <div
              key={m.id}
              className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} space-y-1`}
            >
              <div
                className={`max-w-xs sm:max-w-md px-3.5 py-2.5 rounded-2xl text-xs relative group ${
                  isMe
                    ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-br-none'
                    : 'bg-[#161926] border border-[#1F2438] text-gray-200 rounded-bl-none'
                }`}
              >
                {/* Watch Party Invite Message Card */}
                {m.type === 'WATCH_PARTY_INVITE' ? (
                  <div className="p-2 space-y-2">
                    <p className="font-semibold text-cyan-300 flex items-center gap-1.5">
                      <Users2 className="w-4 h-4" /> Watch Party Invitation
                    </p>
                    <p className="text-gray-200">{m.content}</p>
                    <button
                      onClick={() => startWatchParty('demo-party-room', 'reel-1')}
                      className="w-full py-1.5 rounded-lg bg-cyan-500 text-black font-bold text-[11px] hover:bg-cyan-400"
                    >
                      Join Watch Room 🍿
                    </button>
                  </div>
                ) : (
                  <p className="leading-relaxed">{m.content}</p>
                )}

                {/* Reaction button */}
                <button
                  onClick={() => toggleReaction(m.id, '🔥')}
                  className="opacity-0 group-hover:opacity-100 absolute -top-2 right-0 p-0.5 rounded-full bg-[#12141F] text-amber-400 hover:scale-125 transition-all text-xs"
                >
                  🔥
                </button>
              </div>

              {/* Message reactions tags */}
              {Object.keys(m.reactions).length > 0 && (
                <div className="flex gap-1">
                  {Object.entries(m.reactions).map(([emoji, userIds]) =>
                    userIds.length > 0 ? (
                      <span
                        key={emoji}
                        className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#161926] border border-[#1F2438] text-gray-300 font-mono"
                      >
                        {emoji} {userIds.length}
                      </span>
                    ) : null
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* Peer Typing Indicator */}
        {peerTyping && (
          <div className="flex items-center gap-1.5 text-[11px] text-cyan-400 animate-pulse italic">
            <span>@{peerTyping} is typing...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* AI Smart Replies Bar */}
      <div className="px-4 py-1.5 flex items-center gap-2 overflow-x-auto border-t border-[#1F2438]/60 bg-[#090A0F]">
        <Sparkles className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
        {smartReplies.map((reply) => (
          <button
            key={reply}
            onClick={() => handleSend(reply)}
            className="text-[11px] px-2.5 py-1 rounded-full bg-[#161926] border border-cyan-500/30 text-cyan-300 hover:text-white hover:border-cyan-400 whitespace-nowrap transition-colors"
          >
            {reply}
          </button>
        ))}
      </div>

      {/* Chat Input */}
      <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="p-3 bg-[#12141F] border-t border-[#1F2438] flex items-center gap-2">
        <input
          type="text"
          placeholder="Message or paste media..."
          value={inputText}
          onChange={handleTyping}
          className="flex-1 bg-[#161926] border border-[#1F2438] rounded-xl px-3.5 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-violet-500"
        />
        <button
          type="submit"
          disabled={!inputText.trim()}
          className="p-2 rounded-xl bg-violet-600 text-white hover:bg-violet-500 disabled:opacity-40 transition-colors"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}

