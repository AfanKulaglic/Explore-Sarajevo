'use client';

import { useEffect, useRef } from 'react';
import { supabase } from './supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

type SubscriptionCallback = (payload: any) => void;

interface RealtimeSubscription {
  table: string;
  event: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
  filter?: string;
  callback: SubscriptionCallback;
}

/**
 * Hook to subscribe to Supabase realtime updates
 * @param subscriptions Array of subscription configurations
 * @param deps Dependencies to trigger re-subscription
 */
export function useSupabaseRealtime(
  subscriptions: RealtimeSubscription[],
  deps: any[] = []
) {
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    if (subscriptions.length === 0) return;

    // Create a unique channel name
    const channelName = `realtime-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const channel = supabase.channel(channelName);

    // Add each subscription to the channel
    subscriptions.forEach(({ table, event, filter, callback }) => {
      const config: any = {
        event,
        schema: 'rewardscenter',
        table,
      };

      if (filter) {
        config.filter = filter;
      }

      channel.on('postgres_changes', config, (payload) => {
        callback(payload);
      });
    });

    // Subscribe to the channel
    channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        console.log(`Realtime subscribed to channel: ${channelName}`);
      }
    });

    channelRef.current = channel;

    // Cleanup on unmount or when deps change
    return () => {
      if (channelRef.current) {
        console.log(`Unsubscribing from channel: ${channelName}`);
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return channelRef;
}

/**
 * Hook specifically for messages realtime updates
 */
export function useMessagesRealtime(
  userId: string | undefined,
  conversationId: string | undefined,
  onNewMessage: (message: any) => void,
  onMessageRead: (messageId: string) => void
) {
  useEffect(() => {
    if (!userId) return;

    const channelName = `messages-${userId}-${Date.now()}`;
    const channel = supabase.channel(channelName);

    // Listen for new messages in any conversation the user is part of
    // We'll filter client-side based on the current conversation
    channel.on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'rewardscenter',
        table: 'messages',
      },
      (payload) => {
        console.log('New message received:', payload);
        onNewMessage(payload.new);
      }
    );

    // Listen for message read status updates
    channel.on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'rewardscenter',
        table: 'messages',
      },
      (payload) => {
        if (payload.new && payload.old && payload.new.is_read !== payload.old.is_read) {
          onMessageRead(payload.new.id);
        }
      }
    );

    channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        console.log('Messages realtime subscribed');
      }
    });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, conversationId, onNewMessage, onMessageRead]);
}

/**
 * Hook specifically for friend requests realtime updates
 */
export function useFriendRequestsRealtime(
  userId: string | undefined,
  onNewRequest: (request: any) => void,
  onRequestUpdated: (request: any) => void
) {
  useEffect(() => {
    if (!userId) return;

    const channelName = `friend-requests-${userId}-${Date.now()}`;
    const channel = supabase.channel(channelName);

    // Listen for new friend requests (where user is the addressee)
    channel.on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'rewardscenter',
        table: 'friendships',
      },
      (payload) => {
        console.log('New friendship event:', payload);
        // Only trigger if this is a new request where user is the recipient
        if (payload.new && payload.new.addressee_id === userId && !payload.new.accepted_at) {
          onNewRequest(payload.new);
        }
      }
    );

    // Listen for updates (accepted/declined)
    channel.on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'rewardscenter',
        table: 'friendships',
      },
      (payload) => {
        console.log('Friendship updated:', payload);
        onRequestUpdated(payload.new);
      }
    );

    channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        console.log('Friend requests realtime subscribed');
      }
    });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, onNewRequest, onRequestUpdated]);
}
