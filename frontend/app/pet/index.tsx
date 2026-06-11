// frontend/app/pet/index.tsx
// Pet system screen tracking your shared lizard pet status, with buttons to feed/check-in and a history feed

import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { theme } from '../../lib/theme';

interface ActivityItem {
  id: string;
  text: string;
}

const INITIAL_ACTIVITIES: ActivityItem[] = [
  { id: '1', text: '📸 sarvami posted a moment → +10 EXP' },
  { id: '2', text: '📚 madiha logged 2 study hours → +20 EXP' },
  { id: '3', text: '💩 poop logged → +5 EXP 😂' },
];

export default function PetDashboard() {
  const router = useRouter();
  const [activities, setActivities] = useState<ActivityItem[]>(INITIAL_ACTIVITIES);
  const [fed, setFed] = useState(true);
  const [hp, setHp] = useState(80);
  const [exp, setExp] = useState(240);

  const handleCheckIn = () => {
    // Add a check in event
    const newId = (activities.length + 1).toString();
    const newActivity = { id: newId, text: '🦎 checked in together! → +15 EXP' };
    setActivities([newActivity, ...activities]);
    setExp(prev => prev + 15);
    setHp(prev => Math.min(100, prev + 5));
  };

  const handleFeed = () => {
    // Feed the lizard
    setFed(true);
    const newId = (activities.length + 1).toString();
    const newActivity = { id: newId, text: '🍃 fed lizzie → +10 EXP' };
    setActivities([newActivity, ...activities]);
    setExp(prev => prev + 10);
    setHp(prev => Math.min(100, prev + 10));
  };

  const handleNavigateToUpgrade = () => {
    router.push('/pet/upgrade');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>your lizard 🦎</Text>
        <TouchableOpacity style={styles.streakBadge} onPress={handleNavigateToUpgrade}>
          <Text style={styles.streakText}>🔥 day 12</Text>
        </TouchableOpacity>
      </View>

      {/* Main Pet Card */}
      <View style={styles.petCard}>
        <View style={styles.levelBadge}>
          <Text style={styles.levelText}>Lv.1</Text>
        </View>
        <Text style={styles.petEmoji}>🦎</Text>
        <Text style={styles.petName}>Lizzie</Text>

        {/* Stats Grid */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>❤️ HP</Text>
            <Text style={styles.statValue}>{hp}/100</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>⚡ EXP</Text>
            <Text style={styles.statValue}>{exp}</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>😊 Mood</Text>
            <Text style={styles.statValue}>happy</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>🍃 Fed</Text>
            <Text style={styles.statValue}>{fed ? 'yes' : 'no'}</Text>
          </View>
        </View>
      </View>

      {/* Actions */}
      <View style={styles.actionContainer}>
        <TouchableOpacity style={styles.primaryButton} onPress={handleCheckIn}>
          <Text style={styles.primaryButtonText}>check in 🦎</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryButton} onPress={handleFeed}>
          <Text style={styles.secondaryButtonText}>feed lizzie 🍃</Text>
        </TouchableOpacity>
      </View>

      {/* Activity Log */}
      <View style={styles.logContainer}>
        <Text style={styles.logTitle}>activity log</Text>
        <FlatList
          data={activities}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <View style={styles.logItem}>
              <Text style={styles.logItemText}>{item.text}</Text>
            </View>
          )}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  headerTitle: {
    fontSize: theme.fontSizes.xl,
    fontWeight: theme.fontWeights.black,
    color: theme.colors.text.primary,
    textTransform: 'lowercase',
  },
  streakBadge: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radius.full,
  },
  streakText: {
    fontSize: theme.fontSizes.sm,
    fontWeight: theme.fontWeights.bold,
    color: theme.colors.white,
    textTransform: 'lowercase',
  },
  petCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl,
    height: 280,
    padding: theme.spacing.lg,
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'relative',
    marginBottom: theme.spacing.md,
    shadowColor: theme.colors.dark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  levelBadge: {
    position: 'absolute',
    top: theme.spacing.md,
    left: theme.spacing.md,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radius.full,
  },
  levelText: {
    fontSize: theme.fontSizes.xs,
    fontWeight: theme.fontWeights.bold,
    color: theme.colors.white,
  },
  petEmoji: {
    fontSize: 80,
    marginTop: theme.spacing.sm,
  },
  petName: {
    fontSize: theme.fontSizes.xl,
    fontWeight: theme.fontWeights.black,
    color: theme.colors.text.primary,
    textTransform: 'lowercase',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.md,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.xs,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: theme.fontSizes.xs,
    fontWeight: theme.fontWeights.bold,
    color: theme.colors.text.secondary,
    marginBottom: 2,
    textTransform: 'lowercase',
  },
  statValue: {
    fontSize: theme.fontSizes.sm,
    fontWeight: theme.fontWeights.bold,
    color: theme.colors.text.primary,
    textTransform: 'lowercase',
  },
  actionContainer: {
    flexDirection: 'column',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  primaryButton: {
    width: '100%',
    height: 50,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: theme.fontSizes.md,
    fontWeight: theme.fontWeights.bold,
    color: theme.colors.white,
    textTransform: 'lowercase',
  },
  secondaryButton: {
    width: '100%',
    height: 50,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: theme.fontSizes.md,
    fontWeight: theme.fontWeights.bold,
    color: theme.colors.text.primary,
    textTransform: 'lowercase',
  },
  logContainer: {
    flex: 1,
  },
  logTitle: {
    fontSize: theme.fontSizes.lg,
    fontWeight: theme.fontWeights.black,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
    textTransform: 'lowercase',
  },
  listContent: {
    paddingBottom: theme.spacing.lg,
  },
  logItem: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.xs,
    borderWidth: 1,
    borderColor: theme.colors.surface,
  },
  logItemText: {
    fontSize: theme.fontSizes.sm,
    fontWeight: theme.fontWeights.medium,
    color: theme.colors.text.primary,
  },
});
