'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  UserPlus,
  Users,
  MessageCircle,
  Check,
  X,
  Clock,
  Star,
  Loader2,
  UserX,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useFriends } from '@/lib/friends-context';
import { Avatar } from '@/components/common/Avatar';
import { useFriendRequestsRealtime } from '@/lib/useSupabaseRealtime';
import { useTranslation } from '@/lib/i18n';

interface Friend {
  id: string;
  friendId: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  friendsSince: string;
}

interface FriendRequest {
  id: string;
  sender_id: string;
  sender_email: string;
  sender_name: string;
  sender_avatar_url: string | null;
  created_at: string;
}

interface SearchUser {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  level: number;
  isFriend: boolean;
  isPending: boolean;
}

export default function FriendsPage() {
  const { user } = useAuth();
  const { decrementFriendRequestCount, refreshFriendRequestCount } = useFriends();
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'requests' | 'search'>('all');
  const [friends, setFriends] = useState<Friend[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [searchResults, setSearchResults] = useState<SearchUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [addFriendQuery, setAddFriendQuery] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Fetch friends and requests
  const fetchData = useCallback(async () => {
    if (!user) return;

    try {
      const [friendsRes, requestsRes] = await Promise.all([
        fetch(`/api/friends?user_id=${user.id}`),
        fetch(`/api/friends/requests?user_id=${user.id}&type=received`)
      ]);

      if (friendsRes.ok) {
        const data = await friendsRes.json();
        setFriends(data.data || []);
      }

      if (requestsRes.ok) {
        const data = await requestsRes.json();
        setFriendRequests(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching friends data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Real-time friend requests subscription
  const handleNewRequest = useCallback(async (newRequest: any) => {
    console.log('New friend request received:', newRequest);
    // Fetch updated friend requests to get full sender info
    if (!user) return;
    
    try {
      const requestsRes = await fetch(`/api/friends/requests?user_id=${user.id}&type=received`);
      if (requestsRes.ok) {
        const data = await requestsRes.json();
        setFriendRequests(data.data || []);
        refreshFriendRequestCount(); // Update global count
        // Switch to requests tab to show new request
        if (data.data && data.data.length > 0) {
          setActiveTab('requests');
        }
      }
    } catch (error) {
      console.error('Error fetching updated requests:', error);
    }
  }, [user, refreshFriendRequestCount]);

  const handleRequestUpdated = useCallback((updatedRequest: any) => {
    console.log('Friend request updated:', updatedRequest);
    // If request was accepted, refresh friends list
    if (updatedRequest.accepted_at) {
      fetchData();
    } else {
      // Remove from requests if declined
      setFriendRequests(prev => prev.filter(r => r.id !== updatedRequest.id));
    }
  }, [fetchData]);

  // Subscribe to realtime friend request updates
  useFriendRequestsRealtime(
    user?.id,
    handleNewRequest,
    handleRequestUpdated
  );

  // Search for users
  const handleSearch = async () => {
    if (!user || addFriendQuery.length < 2) return;

    setIsSearching(true);
    setActiveTab('search');
    
    try {
      const response = await fetch(
        `/api/friends/search?q=${encodeURIComponent(addFriendQuery)}&user_id=${user.id}`
      );
      
      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.data || []);
      }
    } catch (error) {
      console.error('Error searching users:', error);
    } finally {
      setIsSearching(false);
    }
  };

  // Send friend request
  const handleSendRequest = async (targetUser: SearchUser) => {
    if (!user) return;
    
    setActionLoading(targetUser.id);
    try {
      const response = await fetch('/api/friends', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender_id: user.id,
          sender_email: user.email,
          sender_name: user.name,
          sender_avatar_url: user.avatarUrl,
          receiver_id: targetUser.id,
          receiver_email: targetUser.email
        })
      });

      if (response.ok) {
        // Update search results to show pending
        setSearchResults(prev => 
          prev.map(u => u.id === targetUser.id ? { ...u, isPending: true } : u)
        );
      }
    } catch (error) {
      console.error('Error sending friend request:', error);
    } finally {
      setActionLoading(null);
    }
  };

  // Accept friend request
  const handleAcceptRequest = async (request: FriendRequest) => {
    if (!user) return;
    
    setActionLoading(request.id);
    try {
      const response = await fetch('/api/friends/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          request_id: request.id,
          action: 'accept',
          user_id: user.id,
          user_email: user.email,
          user_name: user.name,
          user_avatar_url: user.avatarUrl
        })
      });

      if (response.ok) {
        setFriendRequests(prev => prev.filter(r => r.id !== request.id));
        decrementFriendRequestCount(); // Update global count immediately
        fetchData(); // Refresh friends list
      }
    } catch (error) {
      console.error('Error accepting friend request:', error);
    } finally {
      setActionLoading(null);
    }
  };

  // Decline friend request
  const handleDeclineRequest = async (request: FriendRequest) => {
    if (!user) return;
    
    setActionLoading(request.id);
    try {
      const response = await fetch('/api/friends/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          request_id: request.id,
          action: 'decline',
          user_id: user.id
        })
      });

      if (response.ok) {
        setFriendRequests(prev => prev.filter(r => r.id !== request.id));
        decrementFriendRequestCount(); // Update global count immediately
      }
    } catch (error) {
      console.error('Error declining friend request:', error);
    } finally {
      setActionLoading(null);
    }
  };

  // Remove friend
  const handleRemoveFriend = async (friend: Friend) => {
    if (!user || !confirm(`Remove ${friend.name} from friends?`)) return;
    
    setActionLoading(friend.id);
    try {
      const response = await fetch(
        `/api/friends/${friend.id}?user_id=${user.id}`,
        { method: 'DELETE' }
      );

      if (response.ok) {
        setFriends(prev => prev.filter(f => f.id !== friend.id));
      }
    } catch (error) {
      console.error('Error removing friend:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const filteredFriends = friends.filter((friend) => {
    if (!searchQuery) return true;
    return friend.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
           friend.email.toLowerCase().includes(searchQuery.toLowerCase());
  });

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
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-white/10 bg-gradient-to-br from-sky-600/30 via-blue-600/20 to-slate-900/50 p-4 sm:p-8 backdrop-blur-2xl"
      >
        <div className="absolute -top-20 -right-20 h-60 w-60 rounded-full bg-sky-500/20 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-blue-500/20 blur-3xl" />

        <div className="relative">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl sm:rounded-2xl bg-gradient-to-br from-sky-500 to-blue-500">
              <Users size={20} className="text-white sm:hidden" />
              <Users size={24} className="text-white hidden sm:block" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">{t.friends.title}</h1>
              <p className="text-sm sm:text-base text-white/60">
                {friends.length} {t.friends.title.toLowerCase()}
              </p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mt-4 sm:mt-6 relative max-w-xl">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40"
              size={20}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.friends.searchFriends}
              className="w-full rounded-xl sm:rounded-2xl border border-white/10 bg-white/5 py-3 sm:py-4 pl-12 pr-4 text-white placeholder-white/40 outline-none transition focus:border-brand-500/50 focus:ring-2 focus:ring-brand-500/20"
            />
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {[
          { id: 'all', label: t.friends.allFriends, count: friends.length },
          { id: 'requests', label: t.friends.friendRequests, count: friendRequests.length },
          { id: 'search', label: t.friends.searchUsers, count: searchResults.length },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition ${
              activeTab === tab.id
                ? 'bg-brand-500/20 text-brand-400 border border-brand-500/30'
                : 'bg-white/5 text-white/60 border border-white/10 hover:bg-white/10 hover:text-white'
            }`}
          >
            {tab.label}
            {tab.count > 0 && (
              <span
                className={`rounded-full px-2 py-0.5 text-xs ${
                  activeTab === tab.id ? 'bg-brand-500/30' : 'bg-white/10'
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Friend Requests */}
          <AnimatePresence>
            {activeTab === 'requests' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="rounded-3xl border border-white/10 bg-slate-950/40 p-6 backdrop-blur-2xl"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-500">
                    <Clock size={18} className="text-white" />
                  </div>
                  <h2 className="text-lg font-semibold text-white">
                    {t.friends.pendingRequests} ({friendRequests.length})
                  </h2>
                </div>

                {friendRequests.length === 0 ? (
                  <div className="py-12 text-center">
                    <Clock size={48} className="mx-auto mb-4 text-white/20" />
                    <p className="text-white/60">{t.friends.noPendingRequests}</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {friendRequests.map((request) => (
                      <div
                        key={request.id}
                        className="flex items-center gap-4 rounded-2xl border border-white/5 bg-white/5 p-4"
                      >
                        <Avatar
                          src={request.sender_avatar_url}
                          name={request.sender_name}
                          size="md"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-white">{request.sender_name}</p>
                          <p className="text-sm text-white/50">
                            {request.sender_email} · {new Date(request.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleAcceptRequest(request)}
                            disabled={actionLoading === request.id}
                            className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 transition hover:bg-emerald-500/30 disabled:opacity-50"
                          >
                            {actionLoading === request.id ? (
                              <Loader2 size={18} className="animate-spin" />
                            ) : (
                              <Check size={18} />
                            )}
                          </button>
                          <button
                            onClick={() => handleDeclineRequest(request)}
                            disabled={actionLoading === request.id}
                            className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/20 text-rose-400 transition hover:bg-rose-500/30 disabled:opacity-50"
                          >
                            <X size={18} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Search Results */}
          <AnimatePresence>
            {activeTab === 'search' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="rounded-3xl border border-white/10 bg-slate-950/40 p-6 backdrop-blur-2xl"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-500">
                    <Search size={18} className="text-white" />
                  </div>
                  <h2 className="text-lg font-semibold text-white">
                    {t.friends.searchResults}
                  </h2>
                </div>

                {isSearching ? (
                  <div className="py-12 text-center">
                    <Loader2 size={48} className="mx-auto mb-4 text-white/20 animate-spin" />
                    <p className="text-white/60">{t.friends.searching}...</p>
                  </div>
                ) : searchResults.length === 0 ? (
                  <div className="py-12 text-center">
                    <Search size={48} className="mx-auto mb-4 text-white/20" />
                    <p className="text-white/60">{t.friends.noSearchResults}</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {searchResults.map((searchUser) => (
                      <div
                        key={searchUser.id}
                        className="flex items-center gap-4 rounded-2xl border border-white/5 bg-white/5 p-4"
                      >
                        <Avatar
                          src={searchUser.avatarUrl}
                          name={searchUser.name}
                          size="md"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-white">{searchUser.name}</p>
                            <span className="flex items-center gap-1 rounded-full bg-amber-500/20 px-2 py-0.5 text-xs text-amber-400">
                              <Star size={10} />
                              {searchUser.level}
                            </span>
                          </div>
                        </div>
                        {searchUser.isFriend ? (
                          <span className="px-3 py-2 rounded-xl bg-emerald-500/20 text-emerald-400 text-sm">
                            {t.friends.alreadyFriends}
                          </span>
                        ) : searchUser.isPending ? (
                          <span className="px-3 py-2 rounded-xl bg-amber-500/20 text-amber-400 text-sm">
                            {t.friends.requestPending}
                          </span>
                        ) : (
                          <button
                            onClick={() => handleSendRequest(searchUser)}
                            disabled={actionLoading === searchUser.id}
                            className="flex items-center gap-2 rounded-xl bg-brand-500/20 px-4 py-2 text-brand-400 transition hover:bg-brand-500/30 disabled:opacity-50"
                          >
                            {actionLoading === searchUser.id ? (
                              <Loader2 size={16} className="animate-spin" />
                            ) : (
                              <UserPlus size={16} />
                            )}
                            {t.friends.add}
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Friends List */}
          {activeTab === 'all' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-3xl border border-white/10 bg-slate-950/40 p-6 backdrop-blur-2xl"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white">{t.friends.allFriends}</h2>
                <span className="text-sm text-white/50">
                  {filteredFriends.length} {t.friends.title.toLowerCase()}
                </span>
              </div>

              {filteredFriends.length === 0 ? (
                <div className="py-12 text-center">
                  <Users size={48} className="mx-auto mb-4 text-white/20" />
                  <p className="text-white/60">
                    {friends.length === 0 
                      ? t.friends.noFriendsDescription 
                      : t.friends.noSearchResults}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredFriends.map((friend) => (
                    <div
                      key={friend.id}
                      className="group flex items-center gap-4 rounded-2xl border border-white/5 bg-white/5 p-4 transition hover:border-white/10 hover:bg-white/10"
                    >
                      <Avatar
                        src={friend.avatarUrl}
                        name={friend.name}
                        size="md"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-white truncate">
                          {friend.name}
                        </p>
                        <p className="text-sm text-white/50">
                          {t.friends.friendsSince} {new Date(friend.friendsSince).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2 sm:opacity-0 sm:group-hover:opacity-100 transition">
                        <Link
                          href={`/messages?friend=${friend.friendId}`}
                          className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg sm:rounded-xl bg-brand-500/20 text-brand-400 transition hover:bg-brand-500/30"
                        >
                          <MessageCircle size={14} className="sm:hidden" />
                          <MessageCircle size={16} className="hidden sm:block" />
                        </Link>
                        <button
                          onClick={() => handleRemoveFriend(friend)}
                          disabled={actionLoading === friend.id}
                          className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg sm:rounded-xl bg-rose-500/20 text-rose-400 transition hover:bg-rose-500/30 disabled:opacity-50"
                        >
                          {actionLoading === friend.id ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <>
                              <UserX size={14} className="sm:hidden" />
                              <UserX size={16} className="hidden sm:block" />
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </div>

        {/* Sidebar - Add Friend */}
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-3xl border border-white/10 bg-slate-950/40 p-6 backdrop-blur-2xl"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-violet-500">
                <UserPlus size={18} className="text-white" />
              </div>
              <h3 className="font-semibold text-white">{t.friends.addFriend}</h3>
            </div>
            <p className="text-sm text-white/50 mb-4">
              {t.friends.searchByEmail}
            </p>
            <div className="space-y-3">
              <input
                type="text"
                value={addFriendQuery}
                onChange={(e) => setAddFriendQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder={t.friends.searchByEmail}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/40 outline-none transition focus:border-brand-500/50"
              />
              <button
                onClick={handleSearch}
                disabled={addFriendQuery.length < 2 || isSearching}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 py-3 text-sm font-semibold text-white transition hover:from-brand-600 hover:to-brand-700 disabled:opacity-50"
              >
                {isSearching ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Search size={16} />
                )}
                {t.friends.searchUsers}
              </button>
            </div>
          </motion.div>

          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-3xl border border-white/10 bg-gradient-to-br from-violet-600/20 to-purple-600/20 p-6 backdrop-blur-2xl"
          >
            <h3 className="font-semibold text-white mb-4">{t.friends.friendStats}</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-white/5 p-3 text-center">
                <p className="text-2xl font-bold text-white">{friends.length}</p>
                <p className="text-xs text-white/50">{t.friends.totalFriends}</p>
              </div>
              <div className="rounded-xl bg-white/5 p-3 text-center">
                <p className="text-2xl font-bold text-amber-400">{friendRequests.length}</p>
                <p className="text-xs text-white/50">{t.friends.pending}</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
