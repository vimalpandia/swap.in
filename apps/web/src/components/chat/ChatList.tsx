'use client';

import React from 'react';
import { Flame, Users } from 'lucide-react';
import { ConversationItem } from '@swap/shared';
import { formatTimeAgo } from '../../lib/utils';
import { useAuthStore } from '../../store/authStore';

interface ChatListProps {
  conversations: ConversationItem[];
  selectedId: string | null;
  onSelect: (conv: ConversationItem) => void;
}

export function ChatList({ conversations, selectedId, onSelect }: ChatListProps) {
  const { user } = useAuthStore();

  return (
    <div className="w-full md:w-80 h-full border-r border-[#1F2438] bg-[#090A0F] flex flex-col select-none">
      <div className="p-4 border-b border-[#1F2438] flex items-center justify-between">
        <h2 className="text-base font-bold text-white">Direct Messages</h2>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-950/80 border border-violet-500/40 text-violet-300 font-mono">
          Streaks Active 🔥
        </span>
      </div>

      <div className="flex-1 overflow-y-auto divide-y divide-[#1F2438]/50">
        {conversations.map((conv) => {
          const peer = conv.participants.find((p) => p.id !== user?.id) || conv.participants[0];
          const isSelected = selectedId === conv.id;

          return (
            <div
              key={conv.id}
              onClick={() => onSelect(conv)}
              className={`p-3.5 flex items-center gap-3 cursor-pointer transition-colors ${
                isSelected ? 'bg-[#161926]' : 'hover:bg-[#12141F]'
              }`}
            >
              {/* Avatar with Online Presence Dot */}
              <div className="relative flex-shrink-0">
                <img
                  src={peer?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                  alt={peer?.username || 'User'}
                  className="w-11 h-11 rounded-full object-cover border border-violet-500/30"
                />
                <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-[#090A0F]" />
              </div>

              {/* Conversation Meta */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="text-xs font-bold text-white truncate">
                      {conv.isGroup ? conv.title : peer?.name || peer?.username}
                    </span>
                    {/* Streaks Badge 🔥 */}
                    {conv.streakWithPeer && conv.streakWithPeer > 0 ? (
                      <span className="flex items-center text-[11px] font-mono text-amber-400 font-bold bg-amber-950/60 border border-amber-500/40 px-1 rounded">
                        <Flame className="w-3 h-3 fill-amber-400 mr-0.5" />
                        {conv.streakWithPeer}
                      </span>
                    ) : null}
                  </div>
                  <span className="text-[10px] text-gray-500 flex-shrink-0">
                    {formatTimeAgo(conv.updatedAt)}
                  </span>
                </div>

                <p className="text-xs text-gray-400 truncate">
                  {conv.lastMessage ? conv.lastMessage.content : 'No messages yet'}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

