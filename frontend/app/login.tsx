// frontend/app/login.tsx
// Login screen for Bonded application, allowing credentials verification with basic validation and route transitions

import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { theme } from '../lib/theme';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
// @ts-ignore
import { supabase } from '../../backend/lib/supabase';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    let hasError = false;

    if (!email.trim()) {
      setEmailError('email is required');
      hasError = true;
    } else {
      setEmailError('');
    }

    if (!password.trim()) {
      setPasswordError('password is required');
      hasError = true;
    } else {
      setPasswordError('');
    }

    if (hasError) {
      Alert.alert('oops', 'fill in all fields 🙏');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) throw error;
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert('error', error.message || 'something went wrong 😭');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUpRedirect = () => {
    router.push('/register');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <Text style={styles.title}>bonded 💛</Text>
            <Text style={styles.subtitle}>your friendship, documented.</Text>
          </View>

          <View style={styles.form}>
            <Input
              label="email"
              placeholder="enter your email address"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
              error={emailError}
            />

            <Input
              label="password"
              placeholder="enter your password"
              secureTextEntry
              autoCapitalize="none"
              value={password}
              onChangeText={setPassword}
              error={passwordError}
            />

            <Button
              label="let's go →"
              onPress={handleLogin}
              style={styles.loginButton}
              loading={loading}
            />

            <TouchableOpacity style={styles.registerLink} onPress={handleSignUpRedirect}>
              <Text style={styles.registerText}>new here? sign up ↗</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing.xxl,
  },
  title: {
    fontSize: theme.fontSizes.xxl,
    fontWeight: theme.fontWeights.black,
    color: theme.colors.dark,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    fontSize: theme.fontSizes.md,
    fontStyle: 'italic',
    fontWeight: theme.fontWeights.medium,
    color: theme.colors.muted,
  },
  form: {
    width: '100%',
  },
  loginButton: {
    marginTop: theme.spacing.md,
    width: '100%',
  },
  registerLink: {
    marginTop: theme.spacing.lg,
    alignItems: 'center',
  },
  registerText: {
    fontSize: theme.fontSizes.sm,
    fontWeight: theme.fontWeights.bold,
    color: theme.colors.primary,
    textTransform: 'lowercase',
  },
});
