'use client';

import React, { useState, useEffect } from 'react';
import { ChatList } from '../../components/chat/ChatList';
import { ChatWindow } from '../../components/chat/ChatWindow';
import { ConversationItem } from '@swap/shared';
import { MessageSquare } from 'lucide-react';
import { api } from '../../lib/api';

const demoConversations: ConversationItem[] = [
  {
    id: 'conv-demo-1',
    isGroup: false,
    participants: [
      {
        id: 'maya_id',
        username: 'maya_creates',
        name: 'Maya Lin',
        avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
      },
      {
        id: 'alex_id',
        username: 'alex_swap',
        name: 'Alex Rivera',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      },
    ],
    lastMessage: {
      id: 'm-last',
      conversationId: 'conv-demo-1',
      sender: {
        id: 'maya_id',
        username: 'maya_creates',
        name: 'Maya Lin',
        avatarUrl: null,
      },
      type: 'TEXT',
      content: 'Did you see the new Time Wasted meter? I am already a Golden Idler today 😂',
      isDeleted: false,
      readBy: [],
      reactions: {},
      createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    },
    unreadCount: 1,
    streakWithPeer: 14, // 14-day streak 🔥
    updatedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
  },
  {
    id: 'conv-demo-2',
    isGroup: false,
    participants: [
      {
        id: 'marcus_id',
        username: 'marcus_dev',
        name: 'Marcus Vance',
        avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
      },
    ],
    lastMessage: {
      id: 'm-last-2',
      conversationId: 'conv-demo-2',
      sender: {
        id: 'marcus_id',
        username: 'marcus_dev',
        name: 'Marcus Vance',
        avatarUrl: null,
      },
      type: 'TEXT',
      content: 'Just deployed the Cloudinary video worker. Super fast transcode.',
      isDeleted: false,
      readBy: [],
      reactions: {},
      createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    },
    unreadCount: 0,
    streakWithPeer: 7, // 7-day streak 🔥
    updatedAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
  },
];

export default function ChatPage() {
  const [conversations, setConversations] = useState<ConversationItem[]>(demoConversations);
  const [selectedConv, setSelectedConv] = useState<ConversationItem | null>(demoConversations[0]);

  useEffect(() => {
    api
      .get('/chat/conversations')
      .then((res) => {
        if (res.data.success && res.data.data.length > 0) {
          setConversations(res.data.data);
          if (!selectedConv) setSelectedConv(res.data.data[0]);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="w-full h-[calc(100vh-4rem)] md:h-screen flex overflow-hidden">
      {/* Conversation List */}
      <div className={`w-full md:w-80 h-full ${selectedConv ? 'hidden md:block' : 'block'}`}>
        <ChatList
          conversations={conversations}
          selectedId={selectedConv?.id || null}
          onSelect={(conv) => setSelectedConv(conv)}
        />
      </div>

      {/* Active Conversation Window */}
      <div className={`flex-1 h-full ${selectedConv ? 'block' : 'hidden md:flex'}`}>
        {selectedConv ? (
          <ChatWindow conversation={selectedConv} />
        ) : (
          <div className="flex-1 h-full flex flex-col items-center justify-center text-center p-6 text-gray-500 bg-[#08090E]">
            <MessageSquare className="w-12 h-12 text-swap-border mb-2" />
            <p className="text-sm font-semibold text-gray-400">Select a conversation</p>
            <p className="text-xs">Chat, react, and start Watch Parties in sync</p>
          </div>
        )}
      </div>
    </div>
  );
}
