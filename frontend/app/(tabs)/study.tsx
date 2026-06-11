// frontend/app/(tabs)/study.tsx
// Study battles module for logging study session hours, maintaining streaks, and competing on a leaderboard with progress bars.

import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Alert } from 'react-native';
import { theme } from '../../lib/theme';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';

export default function StudyBattles() {
  const [hoursInput, setHoursInput] = useState('');
  const [yourHours, setYourHours] = useState(14);
  const [friendHours, setFriendHours] = useState(18);
  const [streak, setStreak] = useState(12);

  const handleLogHours = () => {
    const hoursNum = parseFloat(hoursInput);
    if (isNaN(hoursNum) || hoursNum <= 0) {
      Alert.alert('invalid entry', 'please enter a valid number of hours.');
      return;
    }

    if (hoursNum > 24) {
      Alert.alert('unrealistic study session', 'you cannot study for more than 24 hours at once!');
      return;
    }

    setYourHours(prev => prev + hoursNum);
    setStreak(prev => prev + 1);
    setHoursInput('');
    Alert.alert('hours logged!', `logged ${hoursNum} study hours. lizzie gained EXP! 📚`);
  };

  const totalLeaderboardHours = Math.max(yourHours + friendHours, 1);
  const yourPercentage = (yourHours / totalLeaderboardHours) * 100;
  const friendPercentage = (friendHours / totalLeaderboardHours) * 100;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>study battles 📚</Text>

        {/* Streak Card */}
        <View style={styles.streakCard}>
          <Text style={styles.streakLabel}>current streak</Text>
          <Text style={styles.streakNumber}>🔥 {streak} days</Text>
          <Text style={styles.streakSubtitle}>keep studying daily to stay ahead!</Text>
        </View>

        {/* Log Hours Form */}
        <View style={styles.formCard}>
          <Text style={styles.sectionTitle}>log study hours</Text>
          <Input
            label="how many hours did you hit?"
            placeholder="e.g. 2.5"
            keyboardType="numeric"
            value={hoursInput}
            onChangeText={setHoursInput}
          />
          <Button
            label="log hours +"
            onPress={handleLogHours}
          />
        </View>

        {/* Leaderboard Card */}
        <View style={styles.leaderboardCard}>
          <Text style={styles.sectionTitle}>weekly leaderboard</Text>

          {/* You Row */}
          <View style={styles.progressRow}>
            <View style={styles.rowHeader}>
              <Text style={styles.nameLabel}>you (sarvami)</Text>
              <Text style={styles.hoursValue}>{yourHours.toFixed(1)} hrs</Text>
            </View>
            <View style={styles.track}>
              <View style={[styles.fill, { width: `${yourPercentage}%`, backgroundColor: theme.colors.primary }]} />
            </View>
          </View>

          {/* Friend Row */}
          <View style={styles.progressRow}>
            <View style={styles.rowHeader}>
              <Text style={styles.nameLabel}>madiha</Text>
              <Text style={styles.hoursValue}>{friendHours.toFixed(1)} hrs</Text>
            </View>
            <View style={styles.track}>
              <View style={[styles.fill, { width: `${friendPercentage}%`, backgroundColor: theme.colors.dark }]} />
            </View>
          </View>
          
          <Text style={styles.loserDisclaimer}>
            ☕ current loser: {yourHours < friendHours ? 'you' : 'madiha'} buys coffee!
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  title: {
    fontSize: theme.fontSizes.xl,
    fontWeight: theme.fontWeights.black,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
    textTransform: 'lowercase',
  },
  streakCard: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.xl,
    padding: theme.spacing.lg,
    alignItems: 'center',
    shadowColor: theme.colors.dark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  streakLabel: {
    fontSize: theme.fontSizes.sm,
    fontWeight: theme.fontWeights.bold,
    color: 'rgba(255, 255, 255, 0.8)',
    textTransform: 'lowercase',
    marginBottom: 4,
  },
  streakNumber: {
    fontSize: theme.fontSizes.xxl,
    fontWeight: theme.fontWeights.black,
    color: theme.colors.white,
    marginBottom: 4,
  },
  streakSubtitle: {
    fontSize: theme.fontSizes.xs,
    fontWeight: theme.fontWeights.medium,
    color: 'rgba(255, 255, 255, 0.9)',
    textTransform: 'lowercase',
  },
  formCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl,
    padding: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.fontSizes.lg,
    fontWeight: theme.fontWeights.black,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
    textTransform: 'lowercase',
  },
  leaderboardCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.xl,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.surface,
  },
  progressRow: {
    marginBottom: theme.spacing.md,
  },
  rowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  nameLabel: {
    fontSize: theme.fontSizes.sm,
    fontWeight: theme.fontWeights.bold,
    color: theme.colors.text.primary,
    textTransform: 'lowercase',
  },
  hoursValue: {
    fontSize: theme.fontSizes.sm,
    fontWeight: theme.fontWeights.black,
    color: theme.colors.text.primary,
  },
  track: {
    height: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: theme.radius.full,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: theme.radius.full,
  },
  loserDisclaimer: {
    fontSize: theme.fontSizes.sm,
    fontWeight: theme.fontWeights.bold,
    color: theme.colors.error,
    textAlign: 'center',
    marginTop: theme.spacing.sm,
    textTransform: 'lowercase',
  },
});
