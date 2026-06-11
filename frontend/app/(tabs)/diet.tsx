// frontend/app/(tabs)/diet.tsx
// Diet sync module for tracking shared nutrition goals, meal logs, and listing recent meals.

import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, Alert, SafeAreaView } from 'react-native';
import { theme } from '../../lib/theme';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';

interface Meal {
  id: string;
  name: string;
  user: string;
  time: string;
}

const INITIAL_MEALS: Meal[] = [
  { id: '1', name: 'avocado toast 🥑', user: 'you', time: '10:30 am' },
  { id: '2', name: 'protein shake 🥛', user: 'madiha', time: '8:00 am' },
  { id: '3', name: 'sushi platter 🍣', user: 'madiha', time: 'yesterday' },
];

export default function DietSync() {
  const [mealInput, setMealInput] = useState('');
  const [meals, setMeals] = useState<Meal[]>(INITIAL_MEALS);
  const [progress, setProgress] = useState(60); // 60% progress

  const handleLogMeal = () => {
    if (!mealInput.trim()) {
      Alert.alert('empty meal', 'please write what you ate before logging.');
      return;
    }

    const newMeal: Meal = {
      id: (meals.length + 1).toString(),
      name: mealInput.trim().toLowerCase(),
      user: 'you',
      time: 'just now',
    };

    setMeals([newMeal, ...meals]);
    setMealInput('');
    setProgress(prev => Math.min(100, prev + 10));
    Alert.alert('meal synced!', 'your bestie will see what you ate. 🥗');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>diet sync 🥗</Text>

        {/* Goal Card */}
        <View style={styles.goalCard}>
          <View style={styles.goalHeader}>
            <Text style={styles.goalTitle}>today's goal progress</Text>
            <Text style={styles.goalValue}>{progress}%</Text>
          </View>
          <View style={styles.track}>
            <View style={[styles.fill, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.goalSubtitle}>log meals together to hit 100%!</Text>
        </View>

        {/* Log Meal Card */}
        <View style={styles.formCard}>
          <Text style={styles.sectionTitle}>log a meal</Text>
          <Input
            label="what did you eat?"
            placeholder="e.g. acai bowl 🍓"
            value={mealInput}
            onChangeText={setMealInput}
          />
          <Button
            label="log meal +"
            onPress={handleLogMeal}
          />
        </View>

        {/* History List */}
        <View style={styles.historyContainer}>
          <Text style={styles.sectionTitle}>recent meals</Text>
          <FlatList
            data={meals}
            keyExtractor={item => item.id}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <View style={styles.mealItem}>
                <View style={styles.mealLeft}>
                  <Text style={styles.mealText}>{item.name}</Text>
                  <Text style={styles.mealUser}>logged by {item.user}</Text>
                </View>
                <Text style={styles.mealTime}>{item.time}</Text>
              </View>
            )}
            contentContainerStyle={styles.listContent}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
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
  goalCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl,
    padding: theme.spacing.lg,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  goalTitle: {
    fontSize: theme.fontSizes.sm,
    fontWeight: theme.fontWeights.bold,
    color: theme.colors.text.primary,
    textTransform: 'lowercase',
  },
  goalValue: {
    fontSize: theme.fontSizes.lg,
    fontWeight: theme.fontWeights.black,
    color: theme.colors.text.primary,
  },
  track: {
    height: 14,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: theme.radius.full,
    overflow: 'hidden',
    marginBottom: theme.spacing.xs,
  },
  fill: {
    height: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.full,
  },
  goalSubtitle: {
    fontSize: theme.fontSizes.xs,
    fontWeight: theme.fontWeights.medium,
    color: theme.colors.text.secondary,
    textTransform: 'lowercase',
  },
  formCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.xl,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.surface,
  },
  sectionTitle: {
    fontSize: theme.fontSizes.lg,
    fontWeight: theme.fontWeights.black,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
    textTransform: 'lowercase',
  },
  historyContainer: {
    flex: 1,
  },
  listContent: {
    paddingBottom: theme.spacing.lg,
  },
  mealItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.xs,
    borderWidth: 1,
    borderColor: theme.colors.surface,
  },
  mealLeft: {
    flexDirection: 'column',
  },
  mealText: {
    fontSize: theme.fontSizes.md,
    fontWeight: theme.fontWeights.bold,
    color: theme.colors.text.primary,
  },
  mealUser: {
    fontSize: theme.fontSizes.xs,
    fontWeight: theme.fontWeights.medium,
    color: theme.colors.text.secondary,
    textTransform: 'lowercase',
  },
  mealTime: {
    fontSize: theme.fontSizes.xs,
    fontWeight: theme.fontWeights.bold,
    color: theme.colors.text.secondary,
  },
});
