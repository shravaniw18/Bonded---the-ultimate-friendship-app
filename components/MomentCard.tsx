import React from 'react'
import { View, Text, Image, StyleSheet } from 'react-native'
import { colors, font, spacing, radius, shadow } from '@/lib/theme'
import { ReactionPill } from './ReactionPill'

type Props = {
  imageUrl: string
  caption?: string
  timeAgo: string
  username: string
}

export const MomentCard = ({ imageUrl, caption, timeAgo, username }: Props) => {
  return (
    <View style={styles.card}>
      <Image source={{ uri: imageUrl }} style={styles.image} />
      <View style={styles.footer}>
        <View style={styles.meta}>
          <Text style={styles.username}>{username}</Text>
          <Text style={styles.time}>{timeAgo}</Text>
        </View>
        {caption && <Text style={styles.caption}>{caption}</Text>}
        <View style={styles.reactions}>
          <ReactionPill emoji="❤️" count={0} onPress={() => {}} />
<<<<<<< HEAD
          <ReactionPill emoji="😂" count={0} onPress={() => {}} />
          <ReactionPill emoji="😮" count={0} onPress={() => {}} />
=======
  <ReactionPill emoji="😂" count={0} onPress={() => {}} />
  <ReactionPill emoji="😮" count={0} onPress={() => {}} />
  <ReactionPill emoji="🔥" count={0} onPress={() => {}} />
  <ReactionPill emoji="😭" count={0} onPress={() => {}} />
  <ReactionPill emoji="🥹" count={0} onPress={() => {}} />
  <ReactionPill emoji="💀" count={0} onPress={() => {}} />
>>>>>>> shravani
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    borderRadius:    radius.lg,
    overflow:        'hidden',
    backgroundColor: colors.white,
    marginBottom:    spacing[4],
    ...shadow.md,
  },
  image: {
    width:  '100%',
    height: 300,
    resizeMode: 'cover',
  },
  footer: {
    padding: spacing[3],
    gap:     spacing[2],
  },
  meta: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'center',
  },
  username: {
    fontSize:   font.md,
    fontWeight: font.semibold,
    color:      colors.gray900,
  },
  time: {
    fontSize: font.xs,
    color:    colors.gray400,
  },
  caption: {
    fontSize:   font.base,
    color:      colors.gray700,
    lineHeight: font.normal * font.base,
  },
  reactions: {
    flexDirection: 'row',
    gap:           spacing[2],
    marginTop:     spacing[1],
  },
})