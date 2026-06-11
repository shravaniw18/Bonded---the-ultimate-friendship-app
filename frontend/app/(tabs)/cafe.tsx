// frontend/app/(tabs)/cafe.tsx
// Cafe finder module for search, filtering by vibes, and listing recommendations with bookmark toggles.

import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView } from 'react-native';
import { theme } from '../../lib/theme';
import { Input } from '../../components/Input';

interface Cafe {
  id: string;
  name: string;
  distance: string;
  tags: string[];
}

const CAFES: Cafe[] = [
  { id: '1', name: 'the grind house ☕', distance: '0.4 km away', tags: ['chill', 'studious'] },
  { id: '2', name: 'brew & bloom 🌸', distance: '1.2 km away', tags: ['aesthetic', 'chill'] },
  { id: '3', name: 'loud espresso 🎸', distance: '2.5 km away', tags: ['loud'] },
  { id: '4', name: 'study cove 📖', distance: '0.8 km away', tags: ['studious', 'aesthetic'] },
  { id: '5', name: 'vibe check cafe ✨', distance: '1.7 km away', tags: ['aesthetic', 'chill'] },
];

const FILTERS = ['chill', 'studious', 'aesthetic', 'loud'];

export default function CafeFinder() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [savedStatus, setSavedStatus] = useState<Record<string, boolean>>({});

  const toggleSave = (id: string) => {
    setSavedStatus(prev => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const filteredCafes = CAFES.filter(cafe => {
    const matchesSearch = cafe.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = activeFilter ? cafe.tags.includes(activeFilter) : true;
    return matchesSearch && matchesFilter;
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>cafe finder ☕</Text>

        {/* Search Bar */}
        <Input
          label="what's your vibe today?"
          placeholder="search cafes..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />

        {/* Filter Pills */}
        <View style={styles.filterRow}>
          {FILTERS.map((filter) => {
            const isActive = activeFilter === filter;
            return (
              <TouchableOpacity
                key={filter}
                style={[
                  styles.filterPill,
                  isActive ? styles.activeFilterPill : styles.inactiveFilterPill,
                ]}
                onPress={() => setActiveFilter(isActive ? null : filter)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.filterText,
                    isActive ? styles.activeFilterText : styles.inactiveFilterText,
                  ]}
                >
                  #{filter}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Cafes List */}
        <FlatList
          data={filteredCafes}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const isSaved = !!savedStatus[item.id];
            return (
              <View style={styles.cafeCard}>
                <View style={styles.cardLeft}>
                  <Text style={styles.cafeName}>{item.name}</Text>
                  <Text style={styles.cafeDistance}>{item.distance}</Text>
                  <View style={styles.tagRow}>
                    {item.tags.map(tag => (
                      <View key={tag} style={styles.tagBadge}>
                        <Text style={styles.tagText}>#{tag}</Text>
                      </View>
                    ))}
                  </View>
                </View>
                
                <TouchableOpacity
                  style={[styles.saveButton, isSaved && styles.savedButton]}
                  onPress={() => toggleSave(item.id)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.saveIcon}>{isSaved ? '🔖 saved' : '🔖'}</Text>
                </TouchableOpacity>
              </View>
            );
          }}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>no cafes match this vibe 😭</Text>
            </View>
          }
          contentContainerStyle={styles.listContent}
        />
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
  },
  title: {
    fontSize: theme.fontSizes.xl,
    fontWeight: theme.fontWeights.black,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
    textTransform: 'lowercase',
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.lg,
  },
  filterPill: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radius.full,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  activeFilterPill: {
    backgroundColor: theme.colors.primary,
  },
  inactiveFilterPill: {
    backgroundColor: theme.colors.accent,
  },
  filterText: {
    fontSize: theme.fontSizes.xs,
    fontWeight: theme.fontWeights.bold,
  },
  activeFilterText: {
    color: theme.colors.white,
  },
  inactiveFilterText: {
    color: theme.colors.text.primary,
  },
  listContent: {
    paddingBottom: theme.spacing.lg,
  },
  cafeCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.xl,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.surface,
    shadowColor: theme.colors.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  cardLeft: {
    flex: 1,
    flexDirection: 'column',
    gap: 4,
  },
  cafeName: {
    fontSize: theme.fontSizes.md,
    fontWeight: theme.fontWeights.black,
    color: theme.colors.text.primary,
  },
  cafeDistance: {
    fontSize: theme.fontSizes.xs,
    fontWeight: theme.fontWeights.medium,
    color: theme.colors.text.secondary,
    textTransform: 'lowercase',
  },
  tagRow: {
    flexDirection: 'row',
    gap: 4,
    marginTop: theme.spacing.xs,
  },
  tagBadge: {
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.radius.full,
  },
  tagText: {
    fontSize: 10,
    fontWeight: theme.fontWeights.bold,
    color: theme.colors.text.primary,
  },
  saveButton: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.full,
  },
  savedButton: {
    backgroundColor: theme.colors.primary,
  },
  saveIcon: {
    fontSize: theme.fontSizes.sm,
    fontWeight: theme.fontWeights.bold,
    color: theme.colors.text.primary,
  },
  emptyContainer: {
    paddingVertical: 80,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: theme.fontSizes.sm,
    fontWeight: theme.fontWeights.medium,
    color: theme.colors.text.secondary,
    textTransform: 'lowercase',
  },
});
