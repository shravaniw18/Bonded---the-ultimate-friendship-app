// frontend/app/onboarding.tsx
// RPG-style intro flow for onboarding the users with Gen Z aesthetic and custom progress indicators

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { theme } from '../lib/theme';

interface Slide {
  emoji: string;
  title: string;
  desc: string;
  highlight: string;
}

const SLIDES: Slide[] = [
  {
    emoji: '🦎',
    title: 'meet your lizard 🦎',
    desc: 'this little guy is yours and your bestie\'s to raise together. feed it, check in, keep it alive — or face the consequences 💀',
    highlight: 'yours and your bestie\'s',
  },
  {
    emoji: '📸',
    title: 'live moments 📸',
    desc: 'drop a photo right now. your friend sees it on their home screen instantly. no feed. no algorithm. just you two.',
    highlight: 'instantly',
  },
  {
    emoji: '📚',
    title: 'study battles 📚',
    desc: 'log your study hours and compete on weekly streaks. loser buys coffee ☕ — house rules.',
    highlight: 'loser buys coffee',
  },
  {
    emoji: '🥗',
    title: 'diet sync 🥗',
    desc: 'log meals, set goals together, cheer each other on. or judge silently. we don\'t care.',
    highlight: 'cheer each other on',
  },
  {
    emoji: '💩',
    title: 'poop league 💩',
    desc: 'yes this is real. log, rate, and compete. your gut health has never been this competitive.',
    highlight: 'this is real',
  },
  {
    emoji: '☕',
    title: 'cafe finder ☕',
    desc: 'AI picks the perfect hangout spot based on your vibe. save your favourites as a duo.',
    highlight: 'your vibe',
  },
];

export default function Onboarding() {
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleNext = () => {
    if (currentSlide < SLIDES.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      router.replace('/(tabs)');
    }
  };

  const handleSkip = () => {
    router.replace('/(tabs)');
  };

  const slide = SLIDES[currentSlide];

  const renderDescription = (text: string, highlight: string) => {
    const parts = text.split(highlight);
    if (parts.length > 1) {
      return (
        <Text style={styles.description}>
          {parts[0]}
          <Text style={styles.highlightText}>{highlight}</Text>
          {parts[1]}
        </Text>
      );
    }
    return <Text style={styles.description}>{text}</Text>;
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with Skip Button */}
      <View style={styles.header}>
        <View style={styles.dotsContainer}>
          {SLIDES.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                index === currentSlide ? styles.activeDot : styles.inactiveDot,
              ]}
            />
          ))}
        </View>
        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <Text style={styles.skipText}>skip ↗</Text>
        </TouchableOpacity>
      </View>

      {/* Main Content Card */}
      <View style={styles.cardContainer}>
        <View style={styles.emojiCard}>
          <Text style={styles.emojiText}>{slide.emoji}</Text>
        </View>
        <Text style={styles.title}>{slide.title}</Text>
        {renderDescription(slide.desc, slide.highlight)}
      </View>

      {/* Footer Controls */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>
            {currentSlide === SLIDES.length - 1 ? 'let\'s go 🦎' : 'next →'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: theme.spacing.md,
    height: 40,
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    height: 8,
    borderRadius: theme.radius.full,
    marginRight: theme.spacing.xs,
  },
  activeDot: {
    width: 24,
    backgroundColor: theme.colors.primary,
  },
  inactiveDot: {
    width: 8,
    backgroundColor: theme.colors.accent,
  },
  skipButton: {
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
  },
  skipText: {
    fontFamily: undefined,
    fontSize: theme.fontSizes.sm,
    fontWeight: theme.fontWeights.bold,
    color: theme.colors.text.secondary,
  },
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
  },
  emojiCard: {
    width: '100%',
    height: 240,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
    shadowColor: theme.colors.dark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  emojiText: {
    fontSize: 96,
  },
  title: {
    fontSize: theme.fontSizes.xl,
    fontWeight: theme.fontWeights.black,
    color: theme.colors.text.primary,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
    textTransform: 'lowercase',
  },
  description: {
    fontSize: theme.fontSizes.md,
    fontWeight: theme.fontWeights.medium,
    color: theme.colors.text.primary,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: theme.spacing.sm,
  },
  highlightText: {
    color: theme.colors.primary,
    fontWeight: theme.fontWeights.bold,
  },
  footer: {
    paddingBottom: theme.spacing.xxl,
    alignItems: 'center',
  },
  nextButton: {
    width: '100%',
    height: 54,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.full,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: theme.colors.dark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  nextButtonText: {
    fontSize: theme.fontSizes.lg,
    fontWeight: theme.fontWeights.black,
    color: theme.colors.white,
    textTransform: 'lowercase',
  },
});
