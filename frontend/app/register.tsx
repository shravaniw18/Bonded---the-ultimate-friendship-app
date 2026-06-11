// frontend/app/register.tsx
// Registration screen for Bonded app, implementing forms validation, email and password checks, and onboarding redirect.

import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { theme } from '../lib/theme';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
// @ts-ignore
import { supabase } from '../../backend/lib/supabase';

export default function Register() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [usernameError, setUsernameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    let hasError = false;

    if (!username.trim()) {
      setUsernameError('username is required');
      hasError = true;
    } else {
      setUsernameError('');
    }

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

    if (!confirmPassword.trim()) {
      setConfirmPasswordError('confirm password is required');
      hasError = true;
    } else if (password !== confirmPassword) {
      setConfirmPasswordError('passwords do not match');
      hasError = true;
    } else {
      setConfirmPasswordError('');
    }

    if (hasError) {
      Alert.alert('oops', 'fill in all fields 🙏');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
      });
      if (error) throw error;

      // Insert username into users table
      if (data.user) {
        const { error: insertError } = await supabase.from('users').insert({
          id: data.user.id,
          username: username.trim(),
          email: email.trim(),
        });
        if (insertError) throw insertError;
      }
      
      router.replace('/onboarding');
    } catch (error: any) {
      Alert.alert('error', error.message || 'something went wrong 😭');
    } finally {
      setLoading(false);
    }
  };

  const handleLoginRedirect = () => {
    router.replace('/login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <Text style={styles.title}>join bonded 🫶</Text>
          </View>

          <View style={styles.form}>
            <Input
              label="username"
              placeholder="choose a cool username"
              autoCapitalize="none"
              value={username}
              onChangeText={setUsername}
              error={usernameError}
            />

            <Input
              label="email"
              placeholder="your email address"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
              error={emailError}
            />

            <Input
              label="password"
              placeholder="create a strong password"
              secureTextEntry
              autoCapitalize="none"
              value={password}
              onChangeText={setPassword}
              error={passwordError}
            />

            <Input
              label="confirm password"
              placeholder="repeat your password"
              secureTextEntry
              autoCapitalize="none"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              error={confirmPasswordError}
            />

            <Button
              label="create account →"
              onPress={handleRegister}
              style={styles.registerButton}
              loading={loading}
            />

            <TouchableOpacity style={styles.loginLink} onPress={handleLoginRedirect}>
              <Text style={styles.loginText}>already in? log in ↗</Text>
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
    paddingVertical: theme.spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  title: {
    fontSize: theme.fontSizes.xxl,
    fontWeight: theme.fontWeights.black,
    color: theme.colors.dark,
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  registerButton: {
    marginTop: theme.spacing.md,
    width: '100%',
  },
  loginLink: {
    marginTop: theme.spacing.lg,
    alignItems: 'center',
  },
  loginText: {
    fontSize: theme.fontSizes.sm,
    fontWeight: theme.fontWeights.bold,
    color: theme.colors.primary,
    textTransform: 'lowercase',
  },
});
