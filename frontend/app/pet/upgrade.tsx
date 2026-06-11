// frontend/app/pet/upgrade.tsx
// Upgrade selection modal for the lizard pet featuring rarity card styling and selection state.

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { theme } from '../../lib/theme';

interface UpgradeOption {
  id: string;
  name: string;
  emoji: string;
  rarity: 'common' | 'rare' | 'epic';
  desc: string;
}

const UPGRADES: UpgradeOption[] = [
  {
    id: '1',
    name: 'quick snapper',
    emoji: '⚡',
    rarity: 'common',
    desc: 'lizzie moves faster when you post moments back to back',
  },
  {
    id: '2',
    name: 'mood boost',
    emoji: '💛',
    rarity: 'rare',
    desc: 'checking in together gives double EXP on weekends',
  },
  {
    id: '3',
    name: 'study scales',
    emoji: '📚',
    rarity: 'epic',
    desc: 'every study hour logged adds +5 to lizzie\'s max HP permanently',
  },
];

export default function PetUpgrade() {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const getRarityColor = (rarity: 'common' | 'rare' | 'epic') => {
    switch (rarity) {
      case 'common':
        return theme.colors.surface;
      case 'rare':
        return theme.colors.accent;
      case 'epic':
        return theme.colors.primary;
    }
  };

  const handleLearn = () => {
    if (selectedId) {
      // Logic for choosing upgrade
      router.back();
    }
  };

  const handleClose = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.closeArea} activeOpacity={1} onPress={handleClose}>
        <View style={styles.contentContainer}>
          <TouchableOpacity activeOpacity={1} style={styles.modalCard}>
            {/* Sparkles and Lizard */}
            <View style={styles.sparkleContainer}>
              <Text style={styles.sparkle}>✨</Text>
              <Text style={styles.petEmoji}>🦎</Text>
              <Text style={styles.sparkle}>✨</Text>
            </View>

            {/* Headers */}
            <Text style={styles.title}>level up! 🎉</Text>
            <Text style={styles.subtitle}>choose an upgrade for Lizzie</Text>

            {/* Upgrade Options */}
            <View style={styles.upgradesList}>
              {UPGRADES.map((item) => {
                const isSelected = selectedId === item.id;
                const rarityColor = getRarityColor(item.rarity);
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={[
                      styles.upgradeCard,
                      { backgroundColor: rarityColor },
                      isSelected && styles.selectedCard,
                    ]}
                    onPress={() => setSelectedId(item.id)}
                  >
                    <View style={styles.cardHeader}>
                      <View style={styles.emojiNameRow}>
                        <Text style={styles.cardEmoji}>{item.emoji}</Text>
                        <Text style={styles.cardName}>{item.name}</Text>
                      </View>
                      <View style={styles.rarityBadge}>
                        <Text style={styles.rarityText}>{item.rarity}</Text>
                      </View>
                    </View>
                    <Text style={styles.cardDesc}>{item.desc}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Learn button */}
            <TouchableOpacity
              style={[styles.learnButton, !selectedId && styles.disabledButton]}
              disabled={!selectedId}
              onPress={handleLearn}
            >
              <Text style={styles.learnText}>learn ✨</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
  },
  closeArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    width: '90%',
    maxWidth: 400,
    alignItems: 'center',
  },
  modalCard: {
    width: '100%',
    backgroundColor: 'transparent',
    alignItems: 'center',
    padding: theme.spacing.md,
  },
  sparkleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
  },
  sparkle: {
    fontSize: 32,
    marginHorizontal: theme.spacing.sm,
  },
  petEmoji: {
    fontSize: 80,
  },
  title: {
    fontSize: theme.fontSizes.xxl,
    fontWeight: theme.fontWeights.black,
    color: theme.colors.white,
    textAlign: 'center',
    marginBottom: theme.spacing.xs,
    textTransform: 'lowercase',
  },
  subtitle: {
    fontSize: theme.fontSizes.md,
    fontWeight: theme.fontWeights.medium,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
    textTransform: 'lowercase',
  },
  upgradesList: {
    width: '100%',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
  upgradeCard: {
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    borderWidth: 3,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  selectedCard: {
    borderColor: theme.colors.text.primary,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  emojiNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardEmoji: {
    fontSize: theme.fontSizes.lg,
    marginRight: theme.spacing.sm,
  },
  cardName: {
    fontSize: theme.fontSizes.md,
    fontWeight: theme.fontWeights.bold,
    color: theme.colors.text.primary,
    textTransform: 'lowercase',
  },
  rarityBadge: {
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: theme.radius.full,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
  },
  rarityText: {
    fontSize: 10,
    fontWeight: theme.fontWeights.bold,
    color: theme.colors.text.primary,
    textTransform: 'uppercase',
  },
  cardDesc: {
    fontSize: theme.fontSizes.sm,
    fontWeight: theme.fontWeights.medium,
    color: theme.colors.text.primary,
    lineHeight: 18,
    textTransform: 'lowercase',
  },
  learnButton: {
    width: '100%',
    height: 52,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: theme.colors.muted,
    opacity: 0.5,
  },
  learnText: {
    fontSize: theme.fontSizes.md,
    fontWeight: theme.fontWeights.bold,
    color: theme.colors.white,
    textTransform: 'lowercase',
  },
});
