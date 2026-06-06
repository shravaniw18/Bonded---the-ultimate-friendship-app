import { useState } from 'react'
import { View, Text, TouchableOpacity, TextInput, StyleSheet, ScrollView, FlatList } from 'react-native'
import { colors, font, spacing, radius, shadow } from '@/lib/theme'

// ── mock data ─────────────────────────────────
const mockCafes = [
  {
    id:       '1',
    name:     'The Brew Lab',
    rating:   4.8,
    distance: '0.3 km',
    tags:     ['Cozy', 'WiFi', 'Quiet'],
    saved:    false,
  },
  {
    id:       '2',
    name:     'Monsoon Cafe',
    rating:   4.5,
    distance: '0.7 km',
    tags:     ['Aesthetic', 'Outdoor'],
    saved:    true,
  },
  {
    id:       '3',
    name:     'Third Wave Coffee',
    rating:   4.6,
    distance: '1.2 km',
    tags:     ['Specialty', 'WiFi', 'Study'],
    saved:    false,
  },
  {
    id:       '4',
    name:     'Filter Stories',
    rating:   4.3,
    distance: '1.8 km',
    tags:     ['Chill', 'Books'],
    saved:    false,
  },
]

type Cafe = typeof mockCafes[0]

export default function CafeScreen() {
  const [search, setSearch]   = useState('')
  const [cafes, setCafes]     = useState(mockCafes)
  const [tab, setTab]         = useState<'nearby' | 'saved'>('nearby')

  const filtered = cafes.filter((c) => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase())
    const matchesTab    = tab === 'saved' ? c.saved : true
    return matchesSearch && matchesTab
  })

  function toggleSave(id: string) {
    setCafes((prev) =>
      prev.map((c) => c.id === id ? { ...c, saved: !c.saved } : c)
    )
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* header */}
      <Text style={styles.heading}>☕ Cafe Finder</Text>
      <Text style={styles.sub}>Find your next hangout spot</Text>

      {/* search */}
      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search cafes..."
          placeholderTextColor={colors.gray400}
          value={search}
          onChangeText={setSearch}
        />
        <TouchableOpacity style={styles.searchBtn}>
          <Text style={styles.searchBtnText}>🔍</Text>
        </TouchableOpacity>
      </View>

      {/* tab switcher */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tabBtn, tab === 'nearby' && styles.tabActive]}
          onPress={() => setTab('nearby')}
        >
          <Text style={[styles.tabText, tab === 'nearby' && styles.tabTextActive]}>
            📍 Nearby
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabBtn, tab === 'saved' && styles.tabActive]}
          onPress={() => setTab('saved')}
        >
          <Text style={[styles.tabText, tab === 'saved' && styles.tabTextActive]}>
            🔖 Saved
          </Text>
        </TouchableOpacity>
      </View>

      {/* cafe list */}
      {filtered.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>☕</Text>
          <Text style={styles.emptyText}>No cafes found</Text>
          <Text style={styles.emptySub}>Try a different search or explore nearby</Text>
        </View>
      ) : (
        filtered.map((cafe) => (
          <CafeCard
            key={cafe.id}
            cafe={cafe}
            onSave={() => toggleSave(cafe.id)}
          />
        ))
      )}
    </ScrollView>
  )
}

// ── cafe card ─────────────────────────────────
function CafeCard({ cafe, onSave }: { cafe: Cafe; onSave: () => void }) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.cafeIcon}>
          <Text style={{ fontSize: font.xl }}>☕</Text>
        </View>
        <View style={styles.cafeInfo}>
          <Text style={styles.cafeName}>{cafe.name}</Text>
          <View style={styles.cafeMeta}>
            <Text style={styles.cafeRating}>⭐ {cafe.rating}</Text>
            <Text style={styles.cafeDot}>·</Text>
            <Text style={styles.cafeDistance}>📍 {cafe.distance}</Text>
          </View>
        </View>
        <TouchableOpacity onPress={onSave} style={styles.saveBtn}>
          <Text style={{ fontSize: font.lg }}>
            {cafe.saved ? '🔖' : '🤍'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* tags */}
      <View style={styles.tags}>
        {cafe.tags.map((tag) => (
          <View key={tag} style={styles.tag}>
            <Text style={styles.tagText}>{tag}</Text>
          </View>
        ))}
      </View>

      {/* action buttons */}
      <View style={styles.cardActions}>
        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.primaryLight }]}>
          <Text style={[styles.actionText, { color: colors.primaryDark }]}>📍 Directions</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.successLight }]}>
          <Text style={[styles.actionText, { color: colors.successDark }]}>💬 Share</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex:            1,
    backgroundColor: colors.gray50,
  },
  content: {
    padding:    spacing[5],
    paddingTop: spacing[12],
    gap:        spacing[4],
  },
  heading: {
    fontSize:   font['2xl'],
    fontWeight: font.bold,
    color:      colors.gray900,
  },
  sub: {
    fontSize: font.sm,
    color:    colors.gray500,
  },
  searchRow: {
    flexDirection: 'row',
    gap:           spacing[2],
  },
  searchInput: {
    flex:            1,
    backgroundColor: colors.white,
    color:           colors.gray900,
    padding:         spacing[3],
    borderRadius:    radius.md,
    fontSize:        font.base,
    ...shadow.sm,
  },
  searchBtn: {
    backgroundColor: colors.primary,
    width:           48,
    borderRadius:    radius.md,
    alignItems:      'center',
    justifyContent:  'center',
  },
  searchBtnText: {
    fontSize: font.lg,
  },
  tabs: {
    flexDirection:   'row',
    backgroundColor: colors.gray100,
    borderRadius:    radius.md,
    padding:         spacing[1],
  },
  tabBtn: {
    flex:         1,
    padding:      spacing[2],
    alignItems:   'center',
    borderRadius: radius.sm,
  },
  tabActive: {
    backgroundColor: colors.white,
    ...shadow.sm,
  },
  tabText: {
    fontSize:   font.sm,
    fontWeight: font.medium,
    color:      colors.gray500,
  },
  tabTextActive: {
    color: colors.gray900,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius:    radius.lg,
    padding:         spacing[4],
    gap:             spacing[3],
    ...shadow.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           spacing[3],
  },
  cafeIcon: {
    width:           48,
    height:          48,
    borderRadius:    radius.md,
    backgroundColor: colors.warningLight,
    alignItems:      'center',
    justifyContent:  'center',
  },
  cafeInfo: {
    flex: 1,
    gap:  spacing[1],
  },
  cafeName: {
    fontSize:   font.md,
    fontWeight: font.semibold,
    color:      colors.gray900,
  },
  cafeMeta: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           spacing[2],
  },
  cafeRating: {
    fontSize: font.sm,
    color:    colors.gray500,
  },
  cafeDot: {
    fontSize: font.sm,
    color:    colors.gray400,
  },
  cafeDistance: {
    fontSize: font.sm,
    color:    colors.gray500,
  },
  saveBtn: {
    padding: spacing[1],
  },
  tags: {
    flexDirection: 'row',
    flexWrap:      'wrap',
    gap:           spacing[2],
  },
  tag: {
    backgroundColor:   colors.gray100,
    paddingVertical:   spacing[1],
    paddingHorizontal: spacing[2],
    borderRadius:      radius.full,
  },
  tagText: {
    fontSize: font.xs,
    color:    colors.gray500,
  },
  cardActions: {
    flexDirection: 'row',
    gap:           spacing[2],
  },
  actionBtn: {
    flex:           1,
    padding:        spacing[2],
    borderRadius:   radius.md,
    alignItems:     'center',
  },
  actionText: {
    fontSize:   font.sm,
    fontWeight: font.semibold,
  },
  empty: {
    alignItems:    'center',
    justifyContent: 'center',
    paddingVertical: spacing[12],
    gap:            spacing[2],
  },
  emptyEmoji: {
    fontSize: 40,
  },
  emptyText: {
    fontSize:   font.lg,
    fontWeight: font.semibold,
    color:      colors.gray900,
  },
  emptySub: {
    fontSize:  font.sm,
    color:     colors.gray500,
    textAlign: 'center',
  },
})