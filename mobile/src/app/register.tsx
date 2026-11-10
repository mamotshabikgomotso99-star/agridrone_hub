import { router } from 'expo-router';
import { ArrowLeft, Leaf, LockKeyhole, Mail, UserRound } from 'lucide-react-native';
import { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { palette } from '@/components/marketplace-ui';
import { useMarketplace } from '@/hooks/use-marketplace';
import type { UserRole } from '@/types/marketplace';

export default function RegisterScreen() {
  const { registerAccount } = useMarketplace();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Extract<UserRole, 'farmer' | 'operator'>>('farmer');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const roles = [
    { id: 'farmer' as const, label: 'Farm owner', subtitle: 'Post jobs and manage field work' },
    { id: 'operator' as const, label: 'Drone operator', subtitle: 'Offer services and bid on jobs' },
  ];

  const createAccount = async () => {
    setError('');
    if (fullName.trim().length < 2) {
      setError('Enter your full name.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Enter a valid email address.');
      return;
    }
    if (password.length < 8) {
      setError('Choose a password with at least 8 characters.');
      return;
    }
    setSubmitting(true);
    try {
      await registerAccount(fullName, email, password, role);
      router.replace('/(tabs)/dashboard');
    } catch (registrationError) {
      setError(registrationError instanceof Error ? registrationError.message : 'Could not create your account.');
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: palette.cream }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingHorizontal: 22, paddingVertical: 28 }} keyboardShouldPersistTaps="handled">
          <View style={{ width: '100%', maxWidth: 480, alignSelf: 'center', gap: 18 }}>
            <Pressable onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Back to sign in" style={{ flexDirection: 'row', alignItems: 'center', gap: 7, alignSelf: 'flex-start', paddingVertical: 6 }}>
              <ArrowLeft size={18} color={palette.green} />
              <Text style={{ color: palette.green, fontSize: 12, fontWeight: '800' }}>Back to sign in</Text>
            </Pressable>

            <View style={{ gap: 8 }}>
              <View style={{ width: 52, height: 52, borderRadius: 17, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.softGreen }}>
                <Leaf size={27} color={palette.green} />
              </View>
              <Text style={{ color: palette.navy, fontSize: 28, fontWeight: '900' }}>Create account</Text>
              <Text style={{ color: palette.muted, fontSize: 13, lineHeight: 20 }}>Join South Africa’s trusted agricultural drone network.</Text>
            </View>

            <View style={{ gap: 12, borderRadius: 22, borderWidth: 1, borderColor: palette.greenBorder, padding: 18, backgroundColor: palette.white, shadowColor: palette.green, shadowOpacity: 0.06, shadowRadius: 14, shadowOffset: { width: 0, height: 6 }, elevation: 2 }}>
              <View style={{ gap: 6 }}>
                <Text style={{ color: palette.navy, fontSize: 11, fontWeight: '800' }}>Full name</Text>
                <View style={{ minHeight: 50, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 13, borderRadius: 13, borderWidth: 1, borderColor: palette.border, backgroundColor: palette.white }}>
                  <UserRound size={17} color={palette.muted} />
                  <TextInput value={fullName} onChangeText={setFullName} accessibilityLabel="Full name" placeholder="Enter your full name" placeholderTextColor={palette.placeholder} autoCapitalize="words" autoComplete="name" returnKeyType="next" style={{ flex: 1, minHeight: 48, color: palette.navy, fontSize: 13 }} />
                </View>
              </View>
              <View style={{ gap: 6 }}>
                <Text style={{ color: palette.navy, fontSize: 11, fontWeight: '800' }}>Email address</Text>
                <View style={{ minHeight: 50, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 13, borderRadius: 13, borderWidth: 1, borderColor: palette.border, backgroundColor: palette.white }}>
                  <Mail size={17} color={palette.muted} />
                  <TextInput value={email} onChangeText={setEmail} accessibilityLabel="Email address" placeholder="Enter your email address" placeholderTextColor={palette.placeholder} keyboardType="email-address" autoCapitalize="none" autoCorrect={false} autoComplete="email" returnKeyType="done" style={{ flex: 1, minHeight: 48, color: palette.navy, fontSize: 13 }} />
                </View>
              </View>

              <View style={{ gap: 6 }}>
                <Text style={{ color: palette.navy, fontSize: 11, fontWeight: '800' }}>Password</Text>
                <View style={{ minHeight: 50, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 13, borderRadius: 13, borderWidth: 1, borderColor: palette.border, backgroundColor: palette.white }}>
                  <LockKeyhole size={17} color={palette.muted} />
                  <TextInput value={password} onChangeText={(value) => { setPassword(value); setError(''); }} accessibilityLabel="Password" placeholder="At least 8 characters" placeholderTextColor={palette.placeholder} secureTextEntry autoCapitalize="none" autoComplete="new-password" returnKeyType="done" style={{ flex: 1, minHeight: 48, color: palette.navy, fontSize: 13 }} />
                </View>
              </View>
              <View style={{ gap: 8 }}>
                <Text style={{ color: palette.navy, fontSize: 11, fontWeight: '800' }}>Account type</Text>
                <View style={{ gap: 8 }}>
                  {roles.map((option) => (
                    <Pressable
                      key={option.id}
                      accessibilityRole="button"
                      accessibilityState={{ selected: role === option.id }}
                      onPress={() => setRole(option.id)}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        borderRadius: 14,
                        borderWidth: 1,
                        borderColor: role === option.id ? palette.green : palette.border,
                        backgroundColor: role === option.id ? palette.softGreen : palette.white,
                        paddingHorizontal: 12,
                        paddingVertical: 12,
                      }}>
                      <View>
                        <Text style={{ color: role === option.id ? palette.green : palette.navy, fontSize: 12, fontWeight: '800' }}>{option.label}</Text>
                        <Text style={{ color: palette.muted, fontSize: 10, marginTop: 3 }}>{option.subtitle}</Text>
                      </View>
                      <View style={{ width: 18, height: 18, borderRadius: 9, borderWidth: 1.5, borderColor: role === option.id ? palette.green : palette.border, backgroundColor: role === option.id ? palette.green : 'transparent', alignItems: 'center', justifyContent: 'center' }} />
                    </Pressable>
                  ))}
                </View>
              </View>
              {error ? <Text accessibilityRole="alert" style={{ color: palette.red, fontSize: 11, lineHeight: 16 }}>{error}</Text> : null}
              <Pressable onPress={createAccount} disabled={submitting} accessibilityRole="button" style={({ pressed }) => ({ minHeight: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9, borderRadius: 14, backgroundColor: palette.green, opacity: submitting ? 0.8 : pressed ? 0.88 : 1 })}>
                {submitting ? <ActivityIndicator color={palette.white} size="small" /> : null}
                <Text style={{ color: palette.white, fontSize: 14, fontWeight: '900' }}>{submitting ? 'Creating account…' : 'Create Account'}</Text>
              </Pressable>
            </View>

            <Text style={{ color: palette.muted, fontSize: 10, lineHeight: 16, textAlign: 'center' }}>Your account details are stored securely with AgriDrone Hub.</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
