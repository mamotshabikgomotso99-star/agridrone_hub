import { router } from 'expo-router';
import { ArrowLeft, Leaf } from 'lucide-react-native';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { palette } from '@/components/marketplace-ui';

export default function ForgotPasswordScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: palette.cream }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingHorizontal: 22, paddingVertical: 28 }} keyboardShouldPersistTaps="handled">
          <View style={{ width: '100%', maxWidth: 480, alignSelf: 'center', gap: 20 }}>
            <Pressable onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Back to sign in" style={{ flexDirection: 'row', alignItems: 'center', gap: 7, alignSelf: 'flex-start', paddingVertical: 6 }}>
              <ArrowLeft size={18} color={palette.green} />
              <Text style={{ color: palette.green, fontSize: 12, fontWeight: '800' }}>Back to sign in</Text>
            </Pressable>
            <View style={{ gap: 8 }}>
              <View style={{ width: 52, height: 52, borderRadius: 17, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.softGreen }}>
                <Leaf size={27} color={palette.green} />
              </View>
              <Text style={{ color: palette.navy, fontSize: 28, fontWeight: '900' }}>Forgot Password?</Text>
              <Text style={{ color: palette.muted, fontSize: 13, lineHeight: 20 }}>Password reset email delivery is not configured. If you can sign in, change your password in Account Settings.</Text>
            </View>
            <View style={{ gap: 14, borderRadius: 22, borderWidth: 1, borderColor: palette.greenBorder, padding: 18, backgroundColor: palette.white }}>
              <Text style={{ color: palette.muted, fontSize: 11, lineHeight: 17 }}>For account security, password changes require signing in with your current password.</Text>
              <Pressable onPress={() => router.replace('/login')} accessibilityRole="button" style={({ pressed }) => ({ minHeight: 52, alignItems: 'center', justifyContent: 'center', borderRadius: 14, backgroundColor: palette.green, opacity: pressed ? 0.88 : 1 })}>
                <Text style={{ color: palette.white, fontSize: 14, fontWeight: '900' }}>Back to Sign In</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
