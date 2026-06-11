// frontend/app/(tabs)/index.tsx
// Home screen showing the moments feed from you and your friend, a pet HP indicator, and a floating camera action.

import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { theme } from '../../lib/theme';
import { MomentCard } from '../../components/MomentCard';

interface Moment {
  id: string;
  username: string;
  caption: string;
  timestamp: string;
}

const INITIAL_MOMENTS: Moment[] = [
  { id: '1', username: 'madiha', caption: 'coffee run ☕ before the chaos', timestamp: '2 hours ago' },
  { id: '2', username: 'shravani', caption: 'finally submitted 😭🙏', timestamp: '5 hours ago' },
  { id: '3', username: 'you', caption: 'caught the sunset from the roof 🌅', timestamp: 'yesterday' },
];

export default function HomeFeed() {
  const router = useRouter();
  const [moments, setMoments] = useState<Moment[]>(INITIAL_MOMENTS);

  const handleCameraPress = () => {
    router.push('/camera');
  };

  const handleReact = (id: string, emoji: string) => {
    console.log(`Reacted with ${emoji} to moment ${id}`);
  };

  const handleSave = (id: string) => {
    console.log(`Saved moment ${id}`);
  };

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

        {/* Circular Avatar */}
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>SA</Text>
        </View>
      </View>

      {/* Feed FlatList */}
      <FlatList
        data={moments}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.feedContent}
        renderItem={({ item }) => (
          <MomentCard
            id={item.id}
            username={item.username}
            caption={item.caption}
            timestamp={item.timestamp}
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
