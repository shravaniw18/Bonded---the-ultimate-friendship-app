// frontend/app/(tabs)/poop.tsx
// Poop league module for logging daily gut health metrics, rating bowel movements, and viewing competitive scoreboards.

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, SafeAreaView, ScrollView } from 'react-native';
import { theme } from '../../lib/theme';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';

export default function PoopLeague() {
  const [notes, setNotes] = useState('');
  const [rating, setRating] = useState(3);
  const [yourScore, setYourScore] = useState(25);
  const [friendScore, setFriendScore] = useState(30);

  const handleSubmit = () => {
    if (!notes.trim()) {
      Alert.alert('notes required', 'please add a short description of the log.');
      return;
    }

    setYourScore(prev => prev + rating * 2);
    setNotes('');
    Alert.alert('poop logged! 💩', `successfully logged with rating ${rating}/5. you gained +${rating * 2} league points!`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>poop league 💩</Text>

        {/* Leaderboard/Score Card */}
        <View style={styles.scoreCard}>
          <Text style={styles.sectionTitle}>league standing</Text>
          <View style={styles.scoreRow}>
            <View style={styles.scoreCol}>
              <Text style={styles.scoreLabel}>you</Text>
              <Text style={styles.scoreValue}>{yourScore} pts</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.scoreCol}>
              <Text style={styles.scoreLabel}>madiha</Text>
              <Text style={styles.scoreValue}>{friendScore} pts</Text>
            </View>
          </View>
          <Text style={styles.leadingText}>
            {yourScore > friendScore ? '👑 you are dominating the league!' : '🏃 madiha is leading by a log! catch up!'}
          </Text>
        </View>

        {/* Log Form Card */}
        <View style={styles.formCard}>
          <Text style={styles.sectionTitle}>log bowel movement</Text>

          {/* Star Rating Emojis */}
          <Text style={styles.ratingLabel}>rate quality (1-5)</Text>
          <View style={styles.starRow}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity
                key={star}
                onPress={() => setRating(star)}
                activeOpacity={0.7}
              >
                <Text style={styles.starText}>
                  {star <= rating ? '⭐' : '☆'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Input
            label="quick notes"
            placeholder="e.g. hydration was key today"
            value={notes}
            onChangeText={setNotes}
          />

          <Button
            label="submit 💩"
            onPress={handleSubmit}
          />
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
  scoreCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl,
    padding: theme.spacing.lg,
    shadowColor: theme.colors.dark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: theme.fontSizes.lg,
    fontWeight: theme.fontWeights.black,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
    textTransform: 'lowercase',
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginBottom: theme.spacing.md,
  },
  scoreCol: {
    alignItems: 'center',
  },
  scoreLabel: {
    fontSize: theme.fontSizes.sm,
    fontWeight: theme.fontWeights.bold,
    color: theme.colors.text.secondary,
    textTransform: 'lowercase',
  },
  scoreValue: {
    fontSize: theme.fontSizes.xl,
    fontWeight: theme.fontWeights.black,
    color: theme.colors.text.primary,
  },
  divider: {
    width: 2,
    height: 40,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  leadingText: {
    fontSize: theme.fontSizes.sm,
    fontWeight: theme.fontWeights.bold,
    color: theme.colors.text.primary,
    textAlign: 'center',
    textTransform: 'lowercase',
  },
  formCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.xl,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.surface,
  },
  ratingLabel: {
    fontSize: theme.fontSizes.sm,
    fontWeight: theme.fontWeights.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
    textTransform: 'lowercase',
  },
  starRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
    marginTop: theme.spacing.xs,
  },
  starText: {
    fontSize: 36,
  },
});
