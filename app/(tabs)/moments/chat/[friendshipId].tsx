import { useEffect, useState, useRef } from 'react'
import {
  View, Text, FlatList, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { supabase } from '@/lib/supabase'
import { colors, font, spacing, radius } from '@/lib/theme'

type Message = {
  id:         string
  sender_id:  string
  text:       string
  created_at: string
}

export default function ChatScreen() {
  const { friendshipId, username } = useLocalSearchParams<{
    friendshipId: string
    username:     string
  }>()

  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput]       = useState('')
  const [loading, setLoading]   = useState(true)
  const [sending, setSending]   = useState(false)
  const [myId, setMyId]         = useState<string | null>(null)
  const listRef                 = useRef<FlatList>(null)

  useEffect(() => {
    init()

    const channel = supabase
      .channel(`chat-${friendshipId}`)
      .on('postgres_changes', {
        event:  'INSERT',
        schema: 'public',
        table:  'messages',
        filter: `friendship_id=eq.${friendshipId}`,
      }, (payload) => {
        setMessages(prev => [...prev, payload.new as Message])
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [friendshipId])

  async function init() {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) setMyId(user.id)
    await fetchMessages()
  }

  async function fetchMessages() {
    try {
      const { data } = await supabase
        .from('messages')
        .select('id, sender_id, text, created_at')
        .eq('friendship_id', friendshipId)
        .order('created_at', { ascending: true })

      setMessages((data as Message[]) ?? [])
    } finally {
      setLoading(false)
    }
  }

  async function sendMessage() {
    const text = input.trim()
    if (!text || !myId || sending) return

    setSending(true)
    setInput('')

    try {
      const { error } = await supabase.from('messages').insert({
        friendship_id: friendshipId,
        sender_id:     myId,
        text,
      })
      if (error) throw error
    } catch (e) {
      setInput(text) // restore on failure
    } finally {
      setSending(false)
    }
  }

  function formatTime(dateStr: string) {
    return new Date(dateStr).toLocaleTimeString('en-US', {
      hour: 'numeric', minute: '2-digit',
    })
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    )
  }

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{username}</Text>
        <View style={styles.backBtn} />
      </View>

      {/* Messages */}
      {messages.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyEmoji}>💬</Text>
          <Text style={styles.emptyTitle}>No messages yet</Text>
          <Text style={styles.emptySub}>Say hi to {username}!</Text>
        </View>
      ) : (
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
          renderItem={({ item }) => {
            const isMe = item.sender_id === myId
            return (
              <View style={[
                styles.bubbleRow,
                isMe ? styles.bubbleRowMe : styles.bubbleRowFriend,
              ]}>
                <View style={[
                  styles.bubble,
                  isMe ? styles.bubbleMe : styles.bubbleFriend,
                ]}>
                  <Text style={[
                    styles.bubbleText,
                    isMe ? styles.bubbleTextMe : styles.bubbleTextFriend,
                  ]}>
                    {item.text}
                  </Text>
                </View>
                <Text style={styles.bubbleTime}>{formatTime(item.created_at)}</Text>
              </View>
            )
          }}
        />
      )}

      {/* Input */}
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Message..."
          placeholderTextColor={colors.gray400}
          value={input}
          onChangeText={setInput}
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={[styles.sendBtn, (!input.trim() || sending) && styles.sendBtnDisabled]}
          onPress={sendMessage}
          disabled={!input.trim() || sending}
        >
          <Text style={styles.sendBtnText}>➤</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  screen:           { flex: 1, backgroundColor: colors.gray50 },
  center:           { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing[3] },
  emptyEmoji:       { fontSize: 48 },
  emptyTitle:       { fontSize: font.xl, fontWeight: font.bold, color: colors.gray900 },
  emptySub:         { fontSize: font.sm, color: colors.gray500 },
  header:           { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing[5], paddingTop: spacing[12], paddingBottom: spacing[3], backgroundColor: colors.white, borderBottomWidth: 0.5, borderBottomColor: colors.gray200 },
  backBtn:          { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  backText:         { fontSize: 32, color: colors.gray700, lineHeight: 36 },
  headerTitle:      { fontSize: font.lg, fontWeight: font.bold, color: colors.gray900 },
  list:             { padding: spacing[4], gap: spacing[2] },
  bubbleRow:        { maxWidth: '80%', marginBottom: spacing[2], gap: 2 },
  bubbleRowMe:      { alignSelf: 'flex-end', alignItems: 'flex-end' },
  bubbleRowFriend:  { alignSelf: 'flex-start', alignItems: 'flex-start' },
  bubble:           { borderRadius: radius.lg, paddingVertical: spacing[2], paddingHorizontal: spacing[3] },
  bubbleMe:         { backgroundColor: colors.primary },
  bubbleFriend:     { backgroundColor: colors.white },
  bubbleText:       { fontSize: font.base },
  bubbleTextMe:     { color: colors.white },
  bubbleTextFriend: { color: colors.gray900 },
  bubbleTime:       { fontSize: font.xs, color: colors.gray400, marginHorizontal: spacing[1] },
  inputRow:         { flexDirection: 'row', alignItems: 'flex-end', gap: spacing[2], padding: spacing[3], backgroundColor: colors.white, borderTopWidth: 0.5, borderTopColor: colors.gray200 },
  input:            { flex: 1, backgroundColor: colors.gray100, borderRadius: radius.lg, paddingHorizontal: spacing[4], paddingVertical: spacing[3], fontSize: font.base, color: colors.gray900, maxHeight: 100 },
  sendBtn:          { width: 44, height: 44, borderRadius: radius.full, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  sendBtnDisabled:  { backgroundColor: colors.gray300 },
  sendBtnText:      { color: colors.white, fontSize: font.lg },
})