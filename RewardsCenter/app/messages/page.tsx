'use client';

import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  Send, 
  MoreVertical, 
  Check,
  CheckCheck,
  ArrowLeft,
  Loader2,
  Users,
  MessageCircle,
  Smile,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { Avatar } from "@/components/common/Avatar";
import { useMessagesRealtime } from "@/lib/useSupabaseRealtime";
import { useTranslation } from "@/lib/i18n";

interface Conversation {
  conversationId?: string;
  friendId: string;
  friendName: string;
  friendAvatarUrl: string | null;
  lastMessage: string;
  lastMessageTime: string;
  lastMessageSenderId: string;
  unreadCount: number;
}

interface Message {
  id: string;
  conversation_id?: string;
  sender_id: string;
  sender_name: string;
  sender_avatar_url: string | null;
  content: string;
  is_read: boolean;
  created_at: string;
}

interface Friend {
  id: string;
  friendId: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  friendsSince: string;
}

export default function MessagesPage() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const router = useRouter();
  const preselectedFriendId = searchParams.get('friend');
  
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [showFriendPicker, setShowFriendPicker] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const mobileEmojiPickerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [isMobileChatOpen, setIsMobileChatOpen] = useState(false);

  // Common emojis organized by category
  const emojis = {
    'Smileys': ['😀', '😃', '😄', '😁', '😅', '😂', '🤣', '😊', '😇', '🙂', '😉', '😍', '🥰', '😘', '😋', '😜', '🤪', '😎', '🤩', '🥳'],
    'Gestures': ['👍', '👎', '👌', '✌️', '🤞', '🤟', '🤙', '👋', '🙌', '👏', '🤝', '🙏', '💪', '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤'],
    'Objects': ['🎉', '🎊', '🎁', '🏆', '⭐', '🌟', '✨', '💫', '🔥', '💯', '💰', '💎', '🎮', '🎯', '🎲', '🎵', '🎶', '☕', '🍕', '🍔']
  };

  // Close emoji picker when clicking outside (desktop only)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Only handle for desktop emoji picker
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        // Check if we're on mobile (if mobile chat is open, don't use this handler)
        if (!isMobileChatOpen) {
          setShowEmojiPicker(false);
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobileChatOpen]);

  // Insert emoji at cursor position
  const insertEmoji = (emoji: string) => {
    if (newMessage.length + emoji.length <= 100) {
      setNewMessage(prev => prev + emoji);
      inputRef.current?.focus();
    }
  };

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch conversations and friends
  const fetchData = useCallback(async () => {
    if (!user) return;

    try {
      const [conversationsRes, friendsRes] = await Promise.all([
        fetch(`/api/messages?user_id=${user.id}`),
        fetch(`/api/friends?user_id=${user.id}`)
      ]);

      if (conversationsRes.ok) {
        const data = await conversationsRes.json();
        setConversations(data.data || []);
      }

      if (friendsRes.ok) {
        const data = await friendsRes.json();
        setFriends(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Real-time message subscription
  const handleNewMessage = useCallback((newMsg: any) => {
    // Check if this message is for the current conversation
    if (selectedConversation && newMsg.conversation_id && user) {
      // Skip messages sent by current user - they're already added via API response
      if (newMsg.sender_id === user.id) {
        return;
      }
      
      // Check if this message is from the friend in current conversation
      const isRelevant = newMsg.sender_id === selectedConversation.friendId;
      
      if (isRelevant) {
        // Add to messages if not already present
        setMessages(prev => {
          if (prev.some(m => m.id === newMsg.id)) return prev;
          const newMessageObj: Message = {
            id: newMsg.id,
            conversation_id: newMsg.conversation_id,
            sender_id: newMsg.sender_id,
            sender_name: selectedConversation.friendName,
            sender_avatar_url: selectedConversation.friendAvatarUrl || null,
            content: newMsg.content,
            is_read: newMsg.is_read || false,
            created_at: newMsg.created_at
          };
          return [...prev, newMessageObj];
        });
      }
    }
    
    // Also refresh conversations to update last message preview
    fetchData();
  }, [selectedConversation, user, fetchData]);

  const handleMessageRead = useCallback((messageId: string) => {
    setMessages(prev => prev.map(m => 
      m.id === messageId ? { ...m, is_read: true } : m
    ));
  }, []);

  // Subscribe to realtime messages
  useMessagesRealtime(
    user?.id,
    selectedConversation?.conversationId,
    handleNewMessage,
    handleMessageRead
  );

  // Handle preselected friend from URL
  useEffect(() => {
    if (preselectedFriendId && friends.length > 0 && !selectedConversation) {
      const friend = friends.find(f => f.friendId === preselectedFriendId);
      if (friend) {
        // Check if there's an existing conversation
        const existingConv = conversations.find(c => c.friendId === preselectedFriendId);
        if (existingConv) {
          setSelectedConversation(existingConv);
          setIsMobileChatOpen(true);
        } else {
          // Create a new conversation placeholder
          setSelectedConversation({
            friendId: friend.friendId,
            friendName: friend.name,
            friendAvatarUrl: friend.avatarUrl,
            lastMessage: '',
            lastMessageTime: '',
            lastMessageSenderId: '',
            unreadCount: 0
          });
          setIsMobileChatOpen(true);
        }
      }
    }
  }, [preselectedFriendId, friends, conversations, selectedConversation]);

  // Fetch messages when selecting a conversation
  useEffect(() => {
    async function fetchMessages() {
      if (!user || !selectedConversation) return;

      try {
        const response = await fetch(
          `/api/messages?user_id=${user.id}&friend_id=${selectedConversation.friendId}`
        );
        if (response.ok) {
          const data = await response.json();
          setMessages(data.data || []);
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    }

    fetchMessages();
  }, [user, selectedConversation]);

  // Send a message
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || !user) return;

    setIsSending(true);
    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender_id: user.id,
          receiver_id: selectedConversation.friendId,
          content: newMessage.trim()
        })
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(prev => [...prev, data.data]);
        setNewMessage('');
        
        // Update conversations list
        fetchData();
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
    }
  };

  // Start new conversation with a friend
  const handleStartConversation = (friend: Friend) => {
    const conv = {
      friendId: friend.friendId,
      friendName: friend.name,
      friendAvatarUrl: friend.avatarUrl,
      lastMessage: '',
      lastMessageTime: '',
      lastMessageSenderId: '',
      unreadCount: 0
    };
    selectConversation(conv);
    setShowFriendPicker(false);
    setMessages([]);
  };

  // Helper to select conversation and update URL
  const selectConversation = useCallback((conv: Conversation | null) => {
    setSelectedConversation(conv);
    if (conv) {
      // Update URL without full page reload
      window.history.replaceState(null, '', `/messages?friend=${conv.friendId}`);
      // Open mobile chat modal
      setIsMobileChatOpen(true);
    } else {
      window.history.replaceState(null, '', '/messages');
      setIsMobileChatOpen(false);
    }
  }, []);

  // Close mobile chat
  const closeMobileChat = useCallback(() => {
    setIsMobileChatOpen(false);
    setShowEmojiPicker(false);
    setSelectedConversation(null);
    window.history.replaceState(null, '', '/messages');
  }, []);

  const filteredConversations = conversations.filter(conv =>
    conv.friendName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Format time for display
  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else if (days === 1) {
      return 'Yesterday';
    } else if (days < 7) {
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
          <p className="text-white/60">{t.common.loading}...</p>
        </div>
      </div>
    );
  }

  return (
    <section className="flex h-[calc(100vh-140px)] sm:h-[calc(100vh-140px)] flex-col gap-4 sm:gap-6">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">{t.messages.title}</h1>
          <p className="text-sm sm:text-base text-white/60">{t.messages.subtitle}</p>
        </div>
        <button
          onClick={() => setShowFriendPicker(true)}
          className="flex items-center gap-2 rounded-xl bg-brand-500/20 px-4 py-2 text-brand-400 transition hover:bg-brand-500/30"
        >
          <MessageCircle size={18} />
          <span className="hidden sm:inline">{t.messages.newChat}</span>
        </button>
      </motion.div>

      {/* Chat Container */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-1 overflow-hidden rounded-2xl sm:rounded-3xl border border-white/5 bg-slate-950/40 backdrop-blur-2xl"
      >
        {/* Chat List */}
        <div className={cn(
          "w-full flex-col border-r border-white/5 md:flex md:w-80",
          selectedConversation ? "hidden" : "flex"
        )}>
          {/* Search */}
          <div className="border-b border-white/5 p-4">
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
              <input
                type="text"
                placeholder={t.messages.searchConversations}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-white/40 focus:border-brand-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Conversation List */}
          <div className="flex-1 overflow-y-auto scrollbar-hover">
            {filteredConversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4">
                <MessageCircle size={48} className="text-white/20 mb-4" />
                <p className="text-white/60 text-center">
                  {conversations.length === 0 
                    ? t.messages.noMessagesDescription 
                    : t.messages.noSearchResults}
                </p>
              </div>
            ) : (
              filteredConversations.map((conv) => (
                <button
                  key={conv.friendId}
                  onClick={() => selectConversation(conv)}
                  className={cn(
                    "flex w-full items-center gap-3 border-b border-white/5 p-4 text-left transition hover:bg-white/5",
                    selectedConversation?.friendId === conv.friendId && "bg-white/5"
                  )}
                >
                  <Avatar
                    src={conv.friendAvatarUrl}
                    name={conv.friendName}
                    size="md"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-white">{conv.friendName}</p>
                      <span className="text-xs text-white/40">
                        {conv.lastMessageTime ? formatTime(conv.lastMessageTime) : ''}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm text-white/50">{conv.lastMessage}</p>
                      {conv.unreadCount > 0 && (
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-500 text-xs font-bold text-white">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chat View - Desktop */}
        <div className={cn(
          "flex-1 flex-col",
          "hidden md:flex"
        )}>
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="flex items-center justify-between border-b border-white/5 px-4 py-3">
                <div className="flex items-center gap-3">
                  <Avatar
                    src={selectedConversation.friendAvatarUrl}
                    name={selectedConversation.friendName}
                    size="sm"
                  />
                  <div>
                    <p className="font-semibold text-white">{selectedConversation.friendName}</p>
                  </div>
                </div>
                <button className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 text-white/60 transition hover:bg-white/10 hover:text-white">
                  <MoreVertical size={18} />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 scrollbar-hover">
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full">
                    <MessageCircle size={48} className="text-white/20 mb-4" />
                    <p className="text-white/60">{t.messages.noMessages}</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={cn(
                          "flex",
                          message.sender_id === user?.id ? "justify-end" : "justify-start"
                        )}
                      >
                        <div
                          className={cn(
                            "max-w-[70%] rounded-2xl px-4 py-2.5",
                            message.sender_id === user?.id
                              ? "bg-gradient-to-r from-brand-600 to-brand-500 text-white"
                              : "bg-white/10 text-white"
                          )}
                        >
                          <p className="text-sm">{message.content}</p>
                          <div className={cn(
                            "mt-1 flex items-center justify-end gap-1 text-xs",
                            message.sender_id === user?.id ? "text-white/70" : "text-white/40"
                          )}>
                            <span>{formatTime(message.created_at)}</span>
                            {message.sender_id === user?.id && (
                              message.is_read ? <CheckCheck size={14} /> : <Check size={14} />
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              {/* Message Input */}
              <div className="border-t border-white/5 p-4">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    {/* Emoji Picker */}
                    <div className="relative" ref={emojiPickerRef}>
                      <button
                        type="button"
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/60 transition hover:bg-white/10 hover:text-white"
                      >
                        <Smile size={20} />
                      </button>
                      {showEmojiPicker && (
                        <div className="absolute bottom-12 left-0 z-50 w-80 rounded-2xl border border-white/10 bg-slate-900/98 shadow-2xl backdrop-blur-2xl overflow-hidden">
                          {/* Header */}
                          <div className="px-4 py-3 border-b border-white/5">
                            <p className="text-sm font-semibold text-white">Emojis</p>
                          </div>
                          {/* Emoji Grid */}
                          <div className="max-h-56 overflow-y-auto p-3 scrollbar-hover">
                            {Object.entries(emojis).map(([category, emojiList]) => (
                              <div key={category} className="mb-3 last:mb-0">
                                <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-white/30">{category}</p>
                                <div className="grid grid-cols-8 gap-1">
                                  {emojiList.map((emoji, i) => (
                                    <button
                                      key={i}
                                      type="button"
                                      onClick={() => insertEmoji(emoji)}
                                      className="flex h-9 w-9 items-center justify-center rounded-lg text-xl transition-all hover:bg-white/10 hover:scale-110 active:scale-95"
                                    >
                                      {emoji}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="relative flex-1">
                      <input
                        ref={inputRef}
                        type="text"
                        placeholder={t.messages.typeMessage}
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value.slice(0, 100))}
                        onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSendMessage()}
                        maxLength={100}
                        className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-4 pr-4 text-sm text-white placeholder:text-white/40 focus:border-brand-500 focus:outline-none"
                      />
                    </div>
                    <button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim() || isSending}
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 text-white shadow-lg transition hover:from-brand-500 hover:to-brand-400 disabled:opacity-50"
                    >
                      {isSending ? (
                        <Loader2 size={18} className="animate-spin" />
                      ) : (
                        <Send size={18} />
                      )}
                    </button>
                  </div>
                  <div className="text-right text-xs text-white/40">
                    {newMessage.length}/100
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center">
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-white/5">
                  <Send size={32} className="text-white/40" />
                </div>
                <p className="text-lg font-semibold text-white">{t.messages.selectConversation}</p>
                <p className="mt-1 text-sm text-white/50">{t.messages.chooseChat}</p>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Mobile Chat Modal */}
      <AnimatePresence>
        {isMobileChatOpen && selectedConversation && (
          <motion.div
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="fixed inset-0 z-[100] bg-slate-950 md:hidden"
          >
            {/* Mobile Chat Header - Fixed Top */}
            <div className="fixed top-0 left-0 right-0 z-[101] flex items-center justify-between border-b border-white/10 bg-slate-900 px-4 py-3">
              <div className="flex items-center gap-3">
                <button
                  onClick={closeMobileChat}
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white transition active:scale-95"
                >
                  <ArrowLeft size={20} />
                </button>
                <Avatar
                  src={selectedConversation.friendAvatarUrl}
                  name={selectedConversation.friendName}
                  size="sm"
                />
                <p className="font-semibold text-white">{selectedConversation.friendName}</p>
              </div>
              <button className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white/60">
                <MoreVertical size={18} />
              </button>
            </div>

            {/* Mobile Messages Area - Scrollable Middle */}
            <div 
              ref={messagesContainerRef}
              className="fixed top-[72px] left-0 right-0 overflow-y-auto px-4 py-4"
              style={{ 
                bottom: showEmojiPicker ? '280px' : '100px',
                WebkitOverflowScrolling: 'touch'
              }}
            >
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full min-h-[200px]">
                  <MessageCircle size={48} className="text-white/20 mb-4" />
                  <p className="text-white/60">{t.messages.noMessages}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={cn(
                        "flex",
                        message.sender_id === user?.id ? "justify-end" : "justify-start"
                      )}
                    >
                      <div
                        className={cn(
                          "max-w-[80%] rounded-2xl px-4 py-2.5",
                          message.sender_id === user?.id
                            ? "bg-gradient-to-r from-brand-600 to-brand-500 text-white"
                            : "bg-white/10 text-white"
                        )}
                      >
                        <p className="text-sm">{message.content}</p>
                        <div className={cn(
                          "mt-1 flex items-center justify-end gap-1 text-xs",
                          message.sender_id === user?.id ? "text-white/70" : "text-white/40"
                        )}>
                          <span>{formatTime(message.created_at)}</span>
                          {message.sender_id === user?.id && (
                            message.is_read ? <CheckCheck size={14} /> : <Check size={14} />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Mobile Emoji Picker - Fixed Above Input */}
            <AnimatePresence>
              {showEmojiPicker && (
                <motion.div
                  ref={mobileEmojiPickerRef}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 180, opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="fixed left-0 right-0 bottom-[100px] z-[102] border-t border-white/10 bg-slate-900 overflow-hidden"
                  onPointerDown={(e) => e.stopPropagation()}
                >
                  <div className="px-4 py-2 border-b border-white/5 flex items-center justify-between">
                    <p className="text-sm font-semibold text-white">Emojis</p>
                    <button
                      onClick={() => setShowEmojiPicker(false)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-white"
                    >
                      <X size={16} />
                    </button>
                  </div>
                  <div className="h-[130px] overflow-y-auto p-3">
                    {Object.entries(emojis).map(([category, emojiList]) => (
                      <div key={category} className="mb-3 last:mb-0">
                        <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-white/30">{category}</p>
                        <div className="grid grid-cols-8 gap-1">
                          {emojiList.map((emoji, i) => (
                            <button
                              key={i}
                              type="button"
                              onPointerDown={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                              }}
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                insertEmoji(emoji);
                              }}
                              className="flex h-10 w-10 items-center justify-center rounded-lg text-xl active:scale-90 active:bg-white/20"
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Mobile Message Input - Fixed Bottom */}
            <div className="fixed bottom-0 left-0 right-0 z-[102] border-t border-white/10 bg-slate-900 px-4 py-3 pb-safe">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className={cn(
                    "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border transition active:scale-95",
                    showEmojiPicker 
                      ? "bg-brand-500/20 text-brand-400 border-brand-500/30" 
                      : "bg-white/10 text-white/60 border-white/10"
                  )}
                >
                  <Smile size={24} />
                </button>
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value.slice(0, 100))}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  maxLength={100}
                  className="flex-1 h-12 rounded-xl border border-white/10 bg-white/5 px-4 text-base text-white placeholder:text-white/40 focus:border-brand-500 focus:outline-none"
                  autoComplete="off"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || isSending}
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 text-white shadow-lg transition active:scale-95 disabled:opacity-50"
                >
                  {isSending ? (
                    <Loader2 size={22} className="animate-spin" />
                  ) : (
                    <Send size={22} />
                  )}
                </button>
              </div>
              <div className="mt-1 text-right text-xs text-white/40">
                {newMessage.length}/100
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Friend Picker Modal */}
      {showFriendPicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-900 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">{t.messages.newConversation}</h2>
              <button
                onClick={() => setShowFriendPicker(false)}
                className="text-white/60 hover:text-white"
              >
                ✕
              </button>
            </div>
            
            {friends.length === 0 ? (
              <div className="py-8 text-center">
                <Users size={48} className="mx-auto mb-4 text-white/20" />
                <p className="text-white/60">{t.messages.addFriendsFirst}</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {friends.map(friend => (
                  <button
                    key={friend.id}
                    onClick={() => handleStartConversation(friend)}
                    className="flex w-full items-center gap-3 rounded-xl p-3 text-left transition hover:bg-white/5"
                  >
                    <Avatar
                      src={friend.avatarUrl}
                      name={friend.name}
                      size="md"
                    />
                    <div>
                      <p className="font-medium text-white">{friend.name}</p>
                      <p className="text-sm text-white/50">{friend.email}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </section>
  );
}
