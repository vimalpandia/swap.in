'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, CornerDownRight, Send } from 'lucide-react';
import { CommentItem } from '@swap/shared';
import { formatTimeAgo } from '../../lib/utils';
import { useAuthStore } from '../../store/authStore';
import { api } from '../../lib/api';

interface CommentDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  postId?: string;
  reelId?: string;
  initialComments?: CommentItem[];
}

export function CommentDrawer({ isOpen, onClose, postId, reelId, initialComments = [] }: CommentDrawerProps) {
  const { user } = useAuthStore();
  const [comments, setComments] = useState<CommentItem[]>(initialComments);
  const [inputText, setInputText] = useState('');
  const [replyingTo, setReplyingTo] = useState<CommentItem | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newComment: CommentItem = {
      id: `c-${Date.now()}`,
      content: inputText.trim(),
      postId: postId || null,
      reelId: reelId || null,
      parentId: replyingTo ? replyingTo.id : null,
      author: {
        id: user?.id || 'me',
        username: user?.username || 'user',
        name: user?.name || 'User',
        avatarUrl: user?.avatarUrl || null,
      },
      likesCount: 0,
      isLiked: false,
      replyCount: 0,
      createdAt: new Date().toISOString(),
    };

    if (replyingTo) {
      setComments((prev) =>
        prev.map((c) =>
          c.id === replyingTo.id
            ? { ...c, replies: [...(c.replies || []), newComment], replyCount: c.replyCount + 1 }
            : c
        )
      );
    } else {
      setComments((prev) => [newComment, ...prev]);
    }

    const payload = {
      content: inputText.trim(),
      postId,
      reelId,
      parentId: replyingTo?.id || null,
    };

    setInputText('');
    setReplyingTo(null);

    try {
      await api.post('/comments', payload);
    } catch {
      // Optimistic state preserved
    }
  };

  const toggleCommentLike = (commentId: string) => {
    setComments((prev) =>
      prev.map((c) => {
        if (c.id === commentId) {
          const isLiked = !c.isLiked;
          return {
            ...c,
            isLiked,
            likesCount: isLiked ? c.likesCount + 1 : c.likesCount - 1,
          };
        }
        return c;
      })
    );
    api.post(`/comments/${commentId}/like`, {}).catch(() => {});
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="w-full max-w-md h-full bg-[#12141F] border-l border-[#1F2438] flex flex-col justify-between select-none"
        >
          {/* Header */}
          <div className="p-4 border-b border-[#1F2438] flex items-center justify-between">
            <h3 className="font-semibold text-white text-sm">Comments</h3>
            <button onClick={onClose} className="p-1 rounded-lg text-gray-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Comment list */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {comments.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-gray-500">
                <p className="text-sm">No comments yet</p>
                <p className="text-xs">Start the conversation</p>
              </div>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="space-y-2">
                  <div className="flex items-start gap-3">
                    <img
                      src={comment.author.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                      alt={comment.author.username}
                      className="w-8 h-8 rounded-full object-cover border border-[#1F2438]"
                    />
                    <div className="flex-1">
                      <div className="flex items-baseline gap-2">
                        <span className="text-xs font-bold text-white">@{comment.author.username}</span>
                        <span className="text-[10px] text-gray-500">{formatTimeAgo(comment.createdAt)}</span>
                      </div>
                      <p className="text-xs text-gray-200 mt-0.5 leading-relaxed">{comment.content}</p>

                      <div className="flex items-center gap-4 mt-1.5 text-[11px] text-gray-400">
                        <button
                          onClick={() => setReplyingTo(comment)}
                          className="hover:text-cyan-400 transition-colors"
                        >
                          Reply
                        </button>
                        {comment.likesCount > 0 && <span>{comment.likesCount} likes</span>}
                      </div>
                    </div>

                    <button
                      onClick={() => toggleCommentLike(comment.id)}
                      className={`p-1 transition-colors ${
                        comment.isLiked ? 'text-rose-500' : 'text-gray-500 hover:text-white'
                      }`}
                    >
                      <Heart className={`w-3.5 h-3.5 ${comment.isLiked ? 'fill-current' : ''}`} />
                    </button>
                  </div>

                  {/* Nested Replies */}
                  {comment.replies && comment.replies.length > 0 && (
                    <div className="pl-9 space-y-2 border-l border-[#1F2438] ml-4">
                      {comment.replies.map((reply) => (
                        <div key={reply.id} className="flex items-start gap-2.5">
                          <img
                            src={reply.author.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                            alt={reply.author.username}
                            className="w-6 h-6 rounded-full object-cover"
                          />
                          <div className="flex-1">
                            <span className="text-xs font-bold text-white">@{reply.author.username}</span>
                            <p className="text-xs text-gray-300">{reply.content}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Comment input footer */}
          <form onSubmit={handleSubmit} className="p-3 border-t border-[#1F2438] bg-[#090A0F]/50">
            {replyingTo && (
              <div className="flex items-center justify-between text-xs text-cyan-400 pb-1.5 px-1">
                <span>Replying to @{replyingTo.author.username}</span>
                <button onClick={() => setReplyingTo(null)} className="text-gray-400 hover:text-white">
                  Cancel
                </button>
              </div>
            )}
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder={replyingTo ? 'Write a reply...' : 'Add a comment...'}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="flex-1 bg-[#161926] border border-[#1F2438] rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-violet-500"
              />
              <button
                type="submit"
                disabled={!inputText.trim()}
                className="p-2 rounded-xl bg-violet-600 text-white hover:bg-violet-500 disabled:opacity-40 transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

