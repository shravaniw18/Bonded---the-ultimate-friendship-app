// frontend/components/MomentCard.tsx
// Renders a media card for shared moments, with reaction emoji buttons, save button, and click handlers.

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { theme } from '../lib/theme';

export interface MomentCardProps {
  id: string;
  username: string;
  caption: string;
  timestamp: string;
  onReact?: (emoji: string) => void;
  onSave?: () => void;
}

export const MomentCard: React.FC<MomentCardProps> = ({
  username,
  caption,
  timestamp,
  onReact,
  onSave,
}) => {
  const [reactions, setReactions] = useState({
    '❤️': { count: 4, active: false },
    '😂': { count: 2, active: false },
    '😮': { count: 0, active: false },
  });
  const [isSaved, setIsSaved] = useState(false);

  const handleReactClick = (emoji: '❤️' | '😂' | '😮') => {
    setReactions((prev) => {
      const current = prev[emoji];
      const nextActive = !current.active;
      const nextCount = nextActive ? current.count + 1 : current.count - 1;
      return {
        ...prev,
        [emoji]: { count: nextCount, active: nextActive },
      };
    });
    if (onReact) onReact(emoji);
  };

  const handleSaveClick = () => {
    setIsSaved(!isSaved);
    if (onSave) onSave();
  };

  return (
    <View style={styles.card}>
      {/* Save Button */}
      <TouchableOpacity style={styles.saveButton} onPress={handleSaveClick} activeOpacity={0.7}>
        <Text style={[styles.saveText, isSaved && styles.activeSaveText]}>
          {isSaved ? '🔖 saved' : '🔖'}
        </Text>
      </TouchableOpacity>

      {/* Image Placeholder */}
      <View style={styles.imagePlaceholder}>
        <Text style={styles.imagePlaceholderText}>📸 moment image</Text>
      </View>

      {/* Content */}
      <View style={styles.contentContainer}>
        <View style={styles.metaRow}>
          <Text style={styles.username}>{username}</Text>
          <Text style={styles.timestamp}>{timestamp}</Text>
        </View>
        <Text style={styles.caption}>{caption}</Text>

        {/* Reaction Row */}
        <View style={styles.reactionsRow}>
          {(Object.keys(reactions) as Array<'❤️' | '😂' | '😮'>).map((emoji) => {
            const reaction = reactions[emoji];
            return (
              <TouchableOpacity
                key={emoji}
                style={[
                  styles.reactionPill,
                  reaction.active ? styles.activeReaction : styles.inactiveReaction,
                ]}
                onPress={() => handleReactClick(emoji)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.reactionEmoji,
                    reaction.active ? styles.activeReactionText : styles.inactiveReactionText,
                  ]}
                >
                  {emoji}
                </Text>
                {reaction.count > 0 && (
                  <Text
                    style={[
                      styles.reactionCount,
                      reaction.active ? styles.activeReactionText : styles.inactiveReactionText,
                    ]}
                  >
                    {reaction.count}
                  </Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    position: 'relative',
    shadowColor: theme.colors.dark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  saveButton: {
    position: 'absolute',
    top: theme.spacing.md,
    right: theme.spacing.md,
    zIndex: 10,
    backgroundColor: theme.colors.white,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radius.full,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  saveText: {
    fontSize: theme.fontSizes.sm,
    fontWeight: theme.fontWeights.bold,
    color: theme.colors.text.primary,
  },
  activeSaveText: {
    color: theme.colors.primary,
  },
  imagePlaceholder: {
    height: 200,
    backgroundColor: theme.colors.muted,
    opacity: 0.3,
    borderRadius: theme.radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  imagePlaceholderText: {
    color: theme.colors.text.primary,
    fontSize: theme.fontSizes.sm,
    fontWeight: theme.fontWeights.bold,
  },
  contentContainer: {
    marginTop: theme.spacing.xs,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.xs,
  },
  username: {
    fontSize: theme.fontSizes.md,
    fontWeight: theme.fontWeights.bold,
    color: theme.colors.text.primary,
  },
  timestamp: {
    fontSize: theme.fontSizes.xs,
    fontWeight: theme.fontWeights.medium,
    color: theme.colors.text.secondary,
  },
  caption: {
    fontSize: theme.fontSizes.md,
    fontWeight: theme.fontWeights.medium,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  reactionsRow: {
    flexDirection: 'row',
    gap: theme.spacing.xs,
  },
  reactionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radius.full,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  activeReaction: {
    backgroundColor: theme.colors.primary,
  },
  inactiveReaction: {
    backgroundColor: theme.colors.accent,
  },
  reactionEmoji: {
    fontSize: theme.fontSizes.sm,
    marginRight: 2,
  },
  reactionCount: {
    fontSize: theme.fontSizes.xs,
    fontWeight: theme.fontWeights.bold,
  },
  activeReactionText: {
    color: theme.colors.white,
  },
  inactiveReactionText: {
    color: theme.colors.text.primary,
  },
});
