import Constants from 'expo-constants';
import { router } from 'expo-router';
import { ArrowRight, Drone, Eye, EyeOff, Leaf, LockKeyhole, Mail, ShieldCheck } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import {
  ActivityIndicator,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  type TextInputInstance,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import LandingPage from '@/components/landing-page';
import { palette } from '@/components/marketplace-ui';
import { useMarketplace } from '@/hooks/use-marketplace';

function resolveApiBaseUrl() {
  const configured = process.env.EXPO_PUBLIC_API_URL;
  if (configured) return configured.replace(/\/$/, '');

  const hostUri = Constants.expoConfig?.hostUri ?? Constants.expoGoConfig?.hostUri ?? 'localhost:8081';
  const host = hostUri.split(':')[0];
  if (host && host !== 'localhost' && host !== '127.0.0.1' && host !== '0.0.0.0') {
    return `http://${host}:5000`;
  }

  return 'http://localhost:5000';
}

const apiBaseUrl = resolveApiBaseUrl();

export function LoginScreen() {
  const { activeUser, ready, storageError, signIn } = useMarketplace();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [focusedField, setFocusedField] = useState<'email' | 'password' | null>(null);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [backendState, setBackendState] = useState<'checking' | 'online' | 'offline'>('checking');
  const [showForm, setShowForm] = useState(false);
  const redirectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const passwordInput = useRef<TextInputInstance | null>(null);

  useEffect(() => {
    if (ready && activeUser && !submitting) router.replace('/(tabs)/dashboard');
  }, [activeUser, ready, submitting]);

  useEffect(() => {
    let isActive = true;

    async function verifyBackend() {
      try {
        const response = await fetch(`${apiBaseUrl}/api/health`);
        const payload = await response.json();
        if (!isActive) return;
        if (!response.ok || !payload.ok) {
          setBackendState('offline');
          return;
        }
        setBackendState('online');
      } catch {
        if (isActive) setBackendState('offline');
      }
    }

    verifyBackend();
    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => () => {
    if (redirectTimer.current) clearTimeout(redirectTimer.current);
  }, []);

  const handleSignIn = async () => {
    setError('');
    setFeedback('');
    const normalizedEmail = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setError('Enter a valid email address.');
      return;
    }
    if (!password.trim()) {
      setError('Enter a password to continue.');
      return;
    }

    setSubmitting(true);
    try {
      await signIn(normalizedEmail, password);
      setSubmitting(false);
      setFeedback('Sign-in successful. Opening your workspace…');
      redirectTimer.current = setTimeout(() => router.replace('/(tabs)/dashboard'), 450);
    } catch (signInError) {
      setError(signInError instanceof Error ? signInError.message : 'Could not sign in.');
      setSubmitting(false);
    }
  };

  if (!ready) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: palette.cream }}>
        <ActivityIndicator color={palette.green} />
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#E5E7E4' }} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, paddingVertical: 18, justifyContent: 'center', alignItems: 'center' }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          {!showForm ? (
            <Animated.View entering={FadeIn.duration(450)} style={{ width: '100%', maxWidth: 410, alignSelf: 'center', paddingHorizontal: 12 }}>
              <View style={{ alignSelf: 'center', width: '100%', maxWidth: 390, borderRadius: 36, backgroundColor: '#F2F4EF', padding: 10, shadowColor: '#0F172A', shadowOpacity: 0.12, shadowRadius: 18, shadowOffset: { width: 0, height: 10 }, elevation: 8 }}>
                <View style={{ borderRadius: 28, overflow: 'hidden', backgroundColor: '#EFF7ED', borderWidth: 1, borderColor: '#DDECDD' }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 18, paddingTop: 18, paddingBottom: 8 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <View style={{ width: 26, height: 26, borderRadius: 9, backgroundColor: '#F5FAF4', alignItems: 'center', justifyContent: 'center' }}>
                        <Drone size={16} color={palette.green} />
                      </View>
                      <Text style={{ color: '#1B312A', fontSize: 14, fontWeight: '900' }}>AgriDrone Hub</Text>
                    </View>
                    <View style={{ borderRadius: 12, paddingHorizontal: 10, paddingVertical: 5, backgroundColor: '#EEF7EF' }}>
                      <Text style={{ color: '#1D5B44', fontSize: 9, fontWeight: '800' }}>Start free</Text>
                    </View>
                  </View>

                  <ImageBackground
                    source={{ uri: 'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=1200&q=80' }}
                    resizeMode="cover"
                    style={{ width: '100%', height: 260, justifyContent: 'space-between', overflow: 'hidden' }}>
                    <View style={{ flex: 1, justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 10, paddingBottom: 14, backgroundColor: 'rgba(15, 35, 28, 0.18)' }}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <View />
                        <View style={{ borderRadius: 18, paddingHorizontal: 9, paddingVertical: 5, backgroundColor: '#F2F7F0', opacity: 0.98 }}>
                          <Text style={{ color: '#1D5B44', fontSize: 9, fontWeight: '800' }}>Stay safe</Text>
                        </View>
                      </View>
                      <View style={{ alignSelf: 'flex-start', borderRadius: 18, paddingHorizontal: 10, paddingVertical: 6, backgroundColor: '#F7FBF4', opacity: 0.9 }}>
                        <Text style={{ color: '#204F3C', fontSize: 9, fontWeight: '900' }}>PRECISION AGRICULTURE</Text>
                      </View>
                    </View>
                  </ImageBackground>

                  <View style={{ backgroundColor: '#F6FAF4', paddingHorizontal: 18, paddingTop: 18, paddingBottom: 20 }}>
                    <Text style={{ color: '#1F3D35', fontSize: 10, fontWeight: '800', letterSpacing: 1.2, textTransform: 'uppercase' }}>The agriculture service network</Text>
                    <Text style={{ color: '#142C26', fontSize: 28, lineHeight: 33, fontWeight: '900', letterSpacing: -0.8, marginTop: 10 }}>Better farm decisions, from above.</Text>
                    <Text style={{ color: '#4E6761', fontSize: 13, lineHeight: 20, marginTop: 10 }}>Connect with verified drone specialists for mapping, crop monitoring, spraying, and inspection.</Text>

                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 16 }}>
                      {['Verified operators', 'Local expertise'].map((label) => (
                        <View key={label} style={{ borderRadius: 12, paddingHorizontal: 10, paddingVertical: 6, backgroundColor: '#E4F2E6', borderWidth: 1, borderColor: '#D5EAD8' }}>
                          <Text style={{ color: '#1A4A39', fontSize: 9, fontWeight: '800' }}>{label}</Text>
                        </View>
                      ))}
                    </View>

                    <Pressable
                      accessibilityRole="button"
                      onPress={() => setShowForm(true)}
                      style={({ pressed }) => ({
                        minHeight: 52,
                        marginTop: 22,
                        borderRadius: 14,
                        backgroundColor: '#1C4E3A',
                        opacity: pressed ? 0.9 : 1,
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexDirection: 'row',
                        gap: 8,
                      })}>
                      <Text style={{ color: '#FFFFFF', fontSize: 15, fontWeight: '900' }}>Get started</Text>
                      <ArrowRight size={17} color={palette.white} />
                    </Pressable>

                    <Pressable
                      accessibilityRole="button"
                      onPress={() => setShowForm(true)}
                      style={{ alignSelf: 'center', marginTop: 12 }}>
                      <Text style={{ color: '#1A4A39', fontSize: 12, fontWeight: '800' }}>I already have an account</Text>
                    </Pressable>
                  </View>
                </View>
              </View>
            </Animated.View>
          ) : (
            <Animated.View entering={FadeInDown.delay(100).duration(350)} style={{ width: '100%', maxWidth: 520, alignSelf: 'center', paddingHorizontal: 22, paddingTop: 23, gap: 16 }}>
              <View style={{ gap: 5 }}>
                <Text accessibilityRole="header" style={{ color: palette.navy, fontSize: 28, lineHeight: 34, fontWeight: '900', letterSpacing: -0.8 }}>Welcome Back</Text>
                <Text style={{ color: palette.muted, fontSize: 13, lineHeight: 19 }}>Your gateway to smarter agricultural drone services.</Text>
              </View>

              {backendState !== 'checking' ? (
                <View style={{ borderRadius: 12, paddingHorizontal: 10, paddingVertical: 8, backgroundColor: backendState === 'online' ? palette.softGreen : '#FDECEC', borderWidth: 1, borderColor: backendState === 'online' ? palette.greenBorder : '#F4B5B5' }}>
                  <Text style={{ color: backendState === 'online' ? palette.green : '#B42318', fontSize: 10, fontWeight: '800' }}>
                    {backendState === 'online' ? 'Account service connected' : 'Account service unavailable'}
                  </Text>
                </View>
              ) : null}

              <View style={{ gap: 12, borderRadius: 22, borderWidth: 1, borderColor: palette.greenBorder, padding: 17, backgroundColor: palette.white, shadowColor: palette.green, shadowOpacity: 0.07, shadowRadius: 16, shadowOffset: { width: 0, height: 7 }, elevation: 3 }}>
                <View style={{ gap: 6 }}>
                  <Text style={{ color: palette.navy, fontSize: 11, fontWeight: '800' }}>Email Address</Text>
                  <View style={{ minHeight: 50, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 13, borderRadius: 13, borderWidth: 1, borderColor: focusedField === 'email' ? palette.brightGreen : palette.border, backgroundColor: palette.white }}>
                    <Mail size={17} color={focusedField === 'email' ? palette.green : palette.muted} />
                    <TextInput
                      accessibilityLabel="Email Address"
                      value={email}
                      onChangeText={(value) => { setEmail(value); setError(''); }}
                      onFocus={() => setFocusedField('email')}
                      onBlur={() => setFocusedField(null)}
                      onSubmitEditing={() => passwordInput.current?.focus()}
                      placeholder="Enter your email address"
                      placeholderTextColor={palette.placeholder}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                      autoComplete="email"
                      textContentType="emailAddress"
                      returnKeyType="next"
                      style={{ flex: 1, minHeight: 48, color: palette.navy, fontSize: 13 }}
                    />
                  </View>
                </View>

                <View style={{ gap: 6 }}>
                  <Text style={{ color: palette.navy, fontSize: 11, fontWeight: '800' }}>Password</Text>
                  <View style={{ minHeight: 50, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 13, borderRadius: 13, borderWidth: 1, borderColor: focusedField === 'password' ? palette.brightGreen : palette.border, backgroundColor: palette.white }}>
                    <LockKeyhole size={17} color={focusedField === 'password' ? palette.green : palette.muted} />
                    <TextInput
                      ref={passwordInput}
                      accessibilityLabel="Password"
                      value={password}
                      onChangeText={(value) => { setPassword(value); setError(''); }}
                      onFocus={() => setFocusedField('password')}
                      onBlur={() => setFocusedField(null)}
                      onSubmitEditing={handleSignIn}
                      placeholder="Enter your password"
                      placeholderTextColor={palette.placeholder}
                      secureTextEntry={!passwordVisible}
                      autoCapitalize="none"
                      autoComplete="password"
                      textContentType="password"
                      returnKeyType="go"
                      style={{ flex: 1, minHeight: 48, color: palette.navy, fontSize: 13 }}
                    />
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={passwordVisible ? 'Hide password' : 'Show password'}
                      onPress={() => setPasswordVisible((visible) => !visible)}
                      hitSlop={10}
                      style={{ minWidth: 32, minHeight: 42, alignItems: 'center', justifyContent: 'center' }}>
                      {passwordVisible ? <EyeOff size={17} color={palette.muted} /> : <Eye size={17} color={palette.muted} />}
                    </Pressable>
                  </View>
                  <Pressable onPress={() => router.push('/forgot-password')} accessibilityRole="button" style={{ alignSelf: 'flex-end', paddingVertical: 4 }}>
                    <Text style={{ color: palette.green, fontSize: 11, fontWeight: '800' }}>Forgot Password?</Text>
                  </Pressable>
                </View>

                <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8, borderRadius: 11, padding: 10, backgroundColor: palette.softGreen }}>
                  <ShieldCheck size={15} color={palette.green} style={{ marginTop: 1 }} />
                  <Text style={{ flex: 1, color: palette.green, fontSize: 10, lineHeight: 15 }}>
                    Your password is verified by the account service and is not stored on this device.
                  </Text>
                </View>

                {storageError ? <Text accessibilityRole="alert" style={{ color: palette.red, fontSize: 11 }}>Saved marketplace data could not be loaded: {storageError}</Text> : null}
                {error ? <Text accessibilityRole="alert" style={{ color: palette.red, fontSize: 11, lineHeight: 16 }}>{error}</Text> : null}
                {feedback ? <Text accessibilityRole="alert" style={{ color: palette.green, fontSize: 11, lineHeight: 16 }}>{feedback}</Text> : null}

                <Pressable
                  accessibilityRole="button"
                  disabled={submitting}
                  onPress={handleSignIn}
                  style={({ pressed }) => ({
                    minHeight: 52,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 9,
                    borderRadius: 14,
                    backgroundColor: palette.green,
                    opacity: submitting ? 0.8 : pressed ? 0.88 : 1,
                    shadowColor: palette.green,
                    shadowOpacity: 0.2,
                    shadowRadius: 8,
                    shadowOffset: { width: 0, height: 4 },
                    elevation: 3,
                  })}>
                  {submitting ? <ActivityIndicator color={palette.white} size="small" /> : null}
                  <Text style={{ color: palette.white, fontSize: 14, fontWeight: '900' }}>{submitting ? 'Signing in…' : 'Sign In'}</Text>
                  {!submitting ? <ArrowRight size={17} color={palette.white} /> : null}
                </Pressable>

                <View style={{ flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap', gap: 4, paddingTop: 2 }}>
                  <Text style={{ color: palette.muted, fontSize: 11 }}>Don’t have an account?</Text>
                  <Pressable onPress={() => router.push('/register')} accessibilityRole="button">
                    <Text style={{ color: palette.green, fontSize: 11, fontWeight: '900' }}>Create Account</Text>
                  </Pressable>
                </View>
              </View>
            </Animated.View>
          )}

          {!showForm ? null : (
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingHorizontal: 18, paddingTop: 18 }}>
              <Leaf size={13} color={palette.agriculturalGreen} />
              <Text style={{ color: palette.muted, fontSize: 10 }}>Empowering farmers through drone technology.</Text>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export default function HomeScreen() {
  return <LandingPage />;
}
