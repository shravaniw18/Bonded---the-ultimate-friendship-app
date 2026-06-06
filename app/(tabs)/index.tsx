import { View, Text, StyleSheet } from 'react-native'
import { colors, font, spacing } from '@/lib/theme'

export default function MomentsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>📸</Text>
      <Text style={styles.title}>Moments</Text>
      <Text style={styles.sub}>Your friend's moments will appear here</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex:            1,
    backgroundColor: colors.gray50,
    alignItems:      'center',
    justifyContent:  'center',
    padding:         spacing[6],
  },
  emoji: {
    fontSize:     40,
    marginBottom: spacing[3],
  },
  title: {
    fontSize:     font.xl,
    fontWeight:   font.bold,
    color:        colors.gray900,
    marginBottom: spacing[2],
  },
  sub: {
    fontSize:  font.sm,
    color:     colors.gray500,
    textAlign: 'center',
  },
})