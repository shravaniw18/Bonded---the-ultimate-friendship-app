import { useEffect, useState } from 'react'
import {
  View, Text, TouchableOpacity, TextInput,
  StyleSheet, ScrollView, ActivityIndicator,
  Alert, Linking,
} from 'react-native'
import * as Location from 'expo-location'
import { supabase } from '@/lib/supabase'
import { colors, font, spacing, radius, shadow } from '@/lib/theme'

// No API key needed — Overpass is fully open source

type Cafe = {
  place_id:  string
  name:      string
  rating:    number
  distance:  string
  address:   string
  tags:      string[]
  saved:     boolean
  lat:       number
  lng:       number
}

type SavedCafe = {
  place_id: string
  name:     string
  rating:   number
  address:  string
}

export default function CafeScreen() {
  const [nearbyCafes, setNearbyCafes]   = useState<Cafe[]>([])
  const [savedCafes, setSavedCafes]     = useState<SavedCafe[]>([])
  const [search, setSearch]             = useState('')
  const [tab, setTab]                   = useState<'nearby' | 'saved'>('nearby')
  const [loading, setLoading]           = useState(true)
  const [searching, setSearching]       = useState(false)
  const [friendshipId, setFriendshipId] = useState<string | null>(null)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)

  useEffect(() => { init() }, [])

  async function init() {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: friendship } = await supabase
        .from('friendships')
        .select('id')
        .or(`user_a.eq.${user.id},user_b.eq.${user.id}`)
        .single()

      if (friendship) {
        setFriendshipId(friendship.id)
        await fetchSaved(friendship.id)
      }

      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== 'granted') {
        Alert.alert('Location needed', 'Enable location to find cafes near you.')
        setLoading(false)
        return
      }

      const loc    = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced })
      const coords = { lat: loc.coords.latitude, lng: loc.coords.longitude }
      setUserLocation(coords)
      await fetchNearbyCafes(coords, friendship?.id ?? null)
    } finally {
      setLoading(false)
    }
  }

  async function fetchSaved(fid: string) {
    const { data } = await supabase
      .from('saved_cafes')
      .select('place_id, name, rating, address')
      .eq('friendship_id', fid)
      .order('created_at', { ascending: false })

    setSavedCafes((data as SavedCafe[]) ?? [])
  }

  async function fetchNearbyCafes(
    coords: { lat: number; lng: number },
    fid: string | null,
  ) {
    setSearching(true)
    try {
      // Overpass QL — finds cafes within 2km radius
      const query = `
        [out:json][timeout:10];
        (
          node["amenity"="cafe"](around:2000,${coords.lat},${coords.lng});
          way["amenity"="cafe"](around:2000,${coords.lat},${coords.lng});
        );
        out center 20;
      `

      const res  = await fetch('https://overpass-api.de/api/interpreter', {
        method:  'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body:    `data=${encodeURIComponent(query)}`,
      })
      const json = await res.json()

      const savedIds = fid
        ? (await supabase
            .from('saved_cafes')
            .select('place_id')
            .eq('friendship_id', fid)
          ).data?.map(s => s.place_id) ?? []
        : []

      const cafes: Cafe[] = (json.elements ?? [])
        .filter((el: any) => el.tags?.name)   // skip unnamed cafes
        .slice(0, 15)
        .map((el: any) => {
          const lat = el.lat ?? el.center?.lat ?? 0
          const lng = el.lon ?? el.center?.lon ?? 0
          return {
            place_id: String(el.id),
            name:     el.tags.name,
            rating:   0,                        // OSM doesn't have ratings
            address:  buildAddress(el.tags),
            distance: getDistanceLabel(coords.lat, coords.lng, lat, lng),
            tags:     buildTags(el.tags),
            saved:    savedIds.includes(String(el.id)),
            lat,
            lng,
          }
        })
        .sort((a: Cafe, b: Cafe) =>
          parseFloat(a.distance) - parseFloat(b.distance)
        )

      setNearbyCafes(cafes)
    } catch (e: any) {
      Alert.alert('Error loading cafes', e.message)
    } finally {
      setSearching(false)
    }
  }

  async function toggleSave(cafe: Cafe) {
    if (!friendshipId) return

    if (cafe.saved) {
      await supabase
        .from('saved_cafes')
        .delete()
        .eq('friendship_id', friendshipId)
        .eq('place_id', cafe.place_id)
    } else {
      await supabase.from('saved_cafes').insert({
        friendship_id: friendshipId,
        place_id:      cafe.place_id,
        name:          cafe.name,
        rating:        cafe.rating,
        address:       cafe.address,
      })
    }

    setNearbyCafes(prev =>
      prev.map(c => c.place_id === cafe.place_id ? { ...c, saved: !c.saved } : c)
    )
    await fetchSaved(friendshipId)
  }

  function openDirections(cafe: Cafe) {
    const url = `https://www.openstreetmap.org/directions?to=${cafe.lat},${cafe.lng}`
    Linking.openURL(url)
  }

  // ── Loading ────────────────────────────────────────────────────
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    )
  }

  const displayedNearby = nearbyCafes.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  )

  const savedAsCafes: Cafe[] = savedCafes.map(s => ({
    ...s,
    distance: '',
    tags:     [],
    saved:    true,
    lat:      0,
    lng:      0,
  }))

  const displayed = tab === 'saved' ? savedAsCafes : displayedNearby

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.heading}>☕ Cafe Finder</Text>
      <Text style={styles.sub}>Find your next hangout spot</Text>

      {/* Search — filters locally, no extra API call needed */}
      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search cafes..."
          placeholderTextColor={colors.gray400}
          value={search}
          onChangeText={setSearch}
          returnKeyType="search"
        />
        {searching && (
          <ActivityIndicator
            color={colors.primary}
            style={styles.searchSpinner}
          />
        )}
      </View>

      {/* Tabs */}
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
            🔖 Saved ({savedCafes.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Refresh nearby button */}
      {tab === 'nearby' && userLocation && (
        <TouchableOpacity
          style={styles.refreshBtn}
          onPress={() => fetchNearbyCafes(userLocation, friendshipId)}
          disabled={searching}
        >
          <Text style={styles.refreshText}>
            {searching ? 'Loading...' : '🔄 Refresh nearby'}
          </Text>
        </TouchableOpacity>
      )}

      {/* List */}
      {displayed.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>☕</Text>
          <Text style={styles.emptyText}>
            {tab === 'saved' ? 'No saved cafes yet' : 'No cafes found nearby'}
          </Text>
          <Text style={styles.emptySub}>
            {tab === 'saved'
              ? 'Tap 🔖 on a nearby cafe to save it'
              : 'Try refreshing or moving to a different area'
            }
          </Text>
        </View>
      ) : (
        displayed.map(cafe => (
          <CafeCard
            key={cafe.place_id}
            cafe={cafe}
            onSave={() => toggleSave(cafe)}
            onDirections={() => openDirections(cafe)}
            showDirections={tab === 'nearby' && cafe.lat !== 0}
          />
        ))
      )}
    </ScrollView>
  )
}

// ── Cafe card ──────────────────────────────────────────────────────
type CafeCardProps = {
  cafe:           Cafe
  onSave:         () => void
  onDirections:   () => void
  showDirections: boolean
}

function CafeCard({ cafe, onSave, onDirections, showDirections }: CafeCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.cafeIcon}>
          <Text style={{ fontSize: font.xl }}>☕</Text>
        </View>
        <View style={styles.cafeInfo}>
          <Text style={styles.cafeName}>{cafe.name}</Text>
          <View style={styles.cafeMeta}>
            {cafe.distance ? (
              <Text style={styles.cafeDistance}>📍 {cafe.distance}</Text>
            ) : null}
          </View>
          {cafe.address ? (
            <Text style={styles.cafeAddress} numberOfLines={1}>
              {cafe.address}
            </Text>
          ) : null}
        </View>
        <TouchableOpacity onPress={onSave} style={styles.saveBtn}>
          <Text style={{ fontSize: font.lg }}>
            {cafe.saved ? '🔖' : '🤍'}
          </Text>
        </TouchableOpacity>
      </View>

      {cafe.tags.length > 0 && (
        <View style={styles.tags}>
          {cafe.tags.map(tag => (
            <View key={tag} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      )}

      {showDirections && (
        <View style={styles.cardActions}>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: colors.primaryLight }]}
            onPress={onDirections}
          >
            <Text style={[styles.actionText, { color: colors.primaryDark }]}>
              📍 Directions
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  )
}

// ── Helpers ────────────────────────────────────────────────────────
function buildAddress(tags: any): string {
  const parts = [
    tags['addr:housenumber'],
    tags['addr:street'],
    tags['addr:suburb'] ?? tags['addr:city'],
  ].filter(Boolean)
  return parts.join(', ')
}

function buildTags(tags: any): string[] {
  const result: string[] = []
  if (tags.wifi === 'yes' || tags.internet_access === 'wlan') result.push('WiFi')
  if (tags.outdoor_seating === 'yes')   result.push('Outdoor')
  if (tags.takeaway === 'yes')          result.push('Takeaway')
  if (tags.drive_through === 'yes')     result.push('Drive-through')
  if (tags.cuisine)                     result.push(capitalize(tags.cuisine))
  if (tags['diet:vegan'] === 'yes')     result.push('Vegan')
  return result.slice(0, 4)
}

function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

function getDistanceLabel(
  lat1: number, lng1: number,
  lat2: number, lng2: number,
): string {
  const R    = 6371
  const dLat = deg2rad(lat2 - lat1)
  const dLng = deg2rad(lng2 - lng1)
  const a    =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLng / 2) ** 2
  const km = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return km < 1 ? `${Math.round(km * 1000)}m` : `${km.toFixed(1)}km`
}

function deg2rad(deg: number) { return deg * (Math.PI / 180) }

// ── Styles ─────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  screen:        { flex: 1, backgroundColor: colors.gray50 },
  content:       { padding: spacing[5], paddingTop: spacing[12], gap: spacing[4] },
  center:        { flex: 1, alignItems: 'center', justifyContent: 'center' },
  heading:       { fontSize: font['2xl'], fontWeight: font.bold, color: colors.gray900 },
  sub:           { fontSize: font.sm, color: colors.gray500 },
  searchRow:     { flexDirection: 'row', alignItems: 'center', gap: spacing[2] },
  searchInput:   { flex: 1, backgroundColor: colors.white, color: colors.gray900, padding: spacing[3], borderRadius: radius.md, fontSize: font.base, ...shadow.sm },
  searchSpinner: { position: 'absolute', right: spacing[3] },
  tabs:          { flexDirection: 'row', backgroundColor: colors.gray100, borderRadius: radius.md, padding: spacing[1] },
  tabBtn:        { flex: 1, padding: spacing[2], alignItems: 'center', borderRadius: radius.sm },
  tabActive:     { backgroundColor: colors.white, ...shadow.sm },
  tabText:       { fontSize: font.sm, fontWeight: font.medium, color: colors.gray500 },
  tabTextActive: { color: colors.gray900 },
  refreshBtn:    { backgroundColor: colors.white, borderRadius: radius.md, padding: spacing[3], alignItems: 'center', ...shadow.sm },
  refreshText:   { fontSize: font.sm, fontWeight: font.medium, color: colors.primary },
  card:          { backgroundColor: colors.white, borderRadius: radius.lg, padding: spacing[4], gap: spacing[3], ...shadow.sm },
  cardHeader:    { flexDirection: 'row', alignItems: 'center', gap: spacing[3] },
  cafeIcon:      { width: 48, height: 48, borderRadius: radius.md, backgroundColor: colors.warningLight, alignItems: 'center', justifyContent: 'center' },
  cafeInfo:      { flex: 1, gap: spacing[1] },
  cafeName:      { fontSize: font.md, fontWeight: font.semibold, color: colors.gray900 },
  cafeMeta:      { flexDirection: 'row', alignItems: 'center', gap: spacing[2] },
  cafeDistance:  { fontSize: font.sm, color: colors.gray500 },
  cafeAddress:   { fontSize: font.xs, color: colors.gray400 },
  saveBtn:       { padding: spacing[1] },
  tags:          { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[2] },
  tag:           { backgroundColor: colors.gray100, paddingVertical: spacing[1], paddingHorizontal: spacing[2], borderRadius: radius.full },
  tagText:       { fontSize: font.xs, color: colors.gray500 },
  cardActions:   { flexDirection: 'row', gap: spacing[2] },
  actionBtn:     { flex: 1, padding: spacing[2], borderRadius: radius.md, alignItems: 'center' },
  actionText:    { fontSize: font.sm, fontWeight: font.semibold },
  empty:         { alignItems: 'center', justifyContent: 'center', paddingVertical: spacing[12], gap: spacing[2] },
  emptyEmoji:    { fontSize: 40 },
  emptyText:     { fontSize: font.lg, fontWeight: font.semibold, color: colors.gray900 },
  emptySub:      { fontSize: font.sm, color: colors.gray500, textAlign: 'center' },
})