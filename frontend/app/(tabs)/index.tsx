// frontend/app/(tabs)/index.tsx
// Home screen showing the moments feed from you and your friend, a pet HP indicator, and a floating camera action.

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { theme } from '../../lib/theme';
import { MomentCard } from '../../components/MomentCard';
// @ts-ignore
import { supabase } from '../../backend/lib/supabase';
// @ts-ignore
import { getMoments, subscribeMoments } from '../../backend/lib/moments';

interface Moment {
  id: string;
  user_id: string;
  image_url: string;
  caption: string | null;
  created_at: string;
}

export default function HomeFeed() {
  const router = useRouter();
  const [moments, setMoments] = useState<Moment[]>([]);
  const [loading, setLoading] = useState(true);
  const [friendshipId, setFriendshipId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [friendUsername, setFriendUsername] = useState('friend');

  const fetchInitialData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }
      setUserId(user.id);

      const { data: friendship, error: friendshipError } = await supabase
        .from('friendships')
        .select('id, user_a, user_b')
        .or(`user_a.eq.${user.id},user_b.eq.${user.id}`)
        .eq('status', 'active')
        .single();

      if (friendshipError || !friendship) {
        setLoading(false);
        return;
      }

      setFriendshipId(friendship.id);

      // Fetch friend's username
      const friendId = friendship.user_a === user.id ? friendship.user_b : friendship.user_a;
      if (friendId) {
        const { data: friendUser } = await supabase
          .from('users')
          .select('username')
          .eq('id', friendId)
          .single();
        if (friendUser) {
          setFriendUsername(friendUser.username);
        }
      }

      // Fetch moments
      const momentsData = await getMoments(friendship.id);
      setMoments(momentsData || []);
    } catch (error: any) {
      Alert.alert('oops', error.message || 'failed to load moments feed 😭');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (!friendshipId) return;

    const channel = subscribeMoments(friendshipId, (newMoment: any) => {
      setMoments((prev) => {
        if (prev.some((m) => m.id === newMoment.id)) return prev;
        return [newMoment, ...prev];
      });
    });

    return () => {
      if (channel) {
        channel.unsubscribe();
      }
    };
  }, [friendshipId]);

  const handleCameraPress = () => {
    router.push('/camera');
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error: any) {
      Alert.alert('oops', error.message || 'failed to log out 😭');
    }
  };

  const getTimeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  const handleReact = (id: string, emoji: string) => {
    console.log(`Reacted with ${emoji} to moment ${id}`);
  };

  const handleSave = (id: string) => {
    console.log(`Saved moment ${id}`);
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </SafeAreaView>
    );
  }

  if (!friendshipId) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.logoText}>bonded 💛</Text>
          <TouchableOpacity style={styles.avatar} onPress={handleLogout} activeOpacity={0.8}>
            <Text style={styles.avatarText}>SA</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.center}>
          <Text style={styles.emptyText}>no friend connected yet 🥺 share your invite code!</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Header Bar */}
      <View style={styles.header}>
        <View style={styles.leftContainer}>
          <Text style={styles.logoText}>bonded 💛</Text>
          {/* Pet HP Mini Bar */}
          <View style={styles.hpContainer}>
            <Text style={styles.hpHeart}>❤️</Text>
            <View style={styles.hpTrack}>
              <View style={styles.hpFill} />
            </View>
          </View>
        </View>

        {/* Circular Avatar / Logout button */}
        <TouchableOpacity style={styles.avatar} onPress={handleLogout} activeOpacity={0.8}>
          <Text style={styles.avatarText}>SA</Text>
        </TouchableOpacity>
      </View>

      {/* Feed FlatList */}
      <FlatList
        data={moments}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.feedContent}
        renderItem={({ item }) => (
          <MomentCard
            id={item.id}
            username={item.user_id === userId ? 'you' : friendUsername}
            caption={item.caption || ''}
            timestamp={getTimeAgo(item.created_at)}
            imageUri={item.image_url}
            onReact={(emoji) => handleReact(item.id, emoji)}
            onSave={() => handleSave(item.id)}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>no moments yet 👀 take the first one!</Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
      />

      {/* Floating Moment Button */}
      <TouchableOpacity
        style={styles.floatingButton}
        onPress={handleCameraPress}
        activeOpacity={0.9}
      >
        <Text style={styles.floatingButtonText}>📸 moment</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderColor: theme.colors.surface,
    backgroundColor: theme.colors.white,
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  logoText: {
    fontSize: theme.fontSizes.lg,
    fontWeight: theme.fontWeights.black,
    color: theme.colors.text.primary,
  },
  hpContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.xs,
    paddingVertical: 2,
    borderRadius: theme.radius.full,
    gap: 4,
  },
  hpHeart: {
    fontSize: 10,
  },
  hpTrack: {
    width: 48,
    height: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: theme.radius.full,
    overflow: 'hidden',
  },
  hpFill: {
    width: '80%', // Lizzie has 80 HP
    height: '100%',
    backgroundColor: theme.colors.primary,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: theme.fontSizes.sm,
    fontWeight: theme.fontWeights.bold,
    color: theme.colors.white,
  },
  feedContent: {
    padding: theme.spacing.md,
    paddingBottom: 90, // room for floating button
  },
  emptyState: {
    paddingVertical: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: theme.fontSizes.md,
    fontWeight: theme.fontWeights.medium,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    textTransform: 'lowercase',
  },
  floatingButton: {
    position: 'absolute',
    bottom: theme.spacing.md,
    right: theme.spacing.md,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.radius.full,
    shadowColor: theme.colors.dark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 5,
  },
  floatingButtonText: {
    fontSize: theme.fontSizes.md,
    fontWeight: theme.fontWeights.black,
    color: theme.colors.white,
    textTransform: 'lowercase',
  },
});
