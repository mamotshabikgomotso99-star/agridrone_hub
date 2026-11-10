import { router } from 'expo-router';
import { Building2, KeyRound, MapPin, UserRound } from 'lucide-react-native';
import { useState } from 'react';
import { Text, TextInput, View } from 'react-native';

import { Button, Card, PageTitle, Pill, Screen, palette } from '@/components/marketplace-ui';
import { useMarketplace } from '@/hooks/use-marketplace';
import { labelStatus, verificationTone } from '@/utils/formatting';

export default function ProfileScreen() {
  const { activeUser, updateAccount, changePassword, signOut } = useMarketplace();
  const [fullName, setFullName] = useState(activeUser?.fullName ?? '');
  const [email, setEmail] = useState(activeUser?.email ?? '');
  const [phone, setPhone] = useState(activeUser?.phone ?? '');
  const [location, setLocation] = useState(activeUser?.location ?? '');
  const [province, setProvince] = useState(activeUser?.province ?? '');
  const [organizationName, setOrganizationName] = useState(activeUser?.role === 'operator' ? activeUser.businessName ?? '' : activeUser?.farmName ?? '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  if (!activeUser) return null;

  async function saveAccount() {
    setError('');
    setFeedback('');
    setSaving(true);
    try {
      await updateAccount({
        fullName,
        email,
        phone,
        location,
        province,
        ...(activeUser?.role === 'operator' ? { businessName: organizationName } : { farmName: organizationName }),
      });
      setFeedback('Account details saved.');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Could not save account details.');
    } finally {
      setSaving(false);
    }
  }

  async function savePassword() {
    setError('');
    setFeedback('');
    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }
    setSaving(true);
    try {
      await changePassword(currentPassword, newPassword);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setFeedback('Password updated.');
    } catch (passwordError) {
      setError(passwordError instanceof Error ? passwordError.message : 'Could not update your password.');
    } finally {
      setSaving(false);
    }
  }

  async function handleSignOut() {
    setSaving(true);
    try {
      await signOut();
      router.replace('/');
    } catch (signOutError) {
      setError(signOutError instanceof Error ? signOutError.message : 'Could not sign out.');
    } finally {
      setSaving(false);
    }
  }

  const fieldStyle = { minHeight: 44, borderWidth: 1, borderColor: palette.border, borderRadius: 10, paddingHorizontal: 12, color: palette.navy, fontSize: 12 } as const;

  return (
    <Screen>
      <PageTitle eyebrow="ACCOUNT SETTINGS" title="Your profile" subtitle="Manage the details and security for your AgriDrone Hub account." />
      <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 13 }}>
        <View style={{ width: 54, height: 54, borderRadius: 18, backgroundColor: palette.softGreen, alignItems: 'center', justifyContent: 'center' }}>
          <UserRound size={24} color={palette.green} />
        </View>
        <View style={{ flex: 1, gap: 4 }}>
          <Text style={{ color: palette.navy, fontSize: 15, fontWeight: '800' }}>{activeUser.fullName}</Text>
          <Text style={{ color: palette.muted, fontSize: 10 }}>{activeUser.email} · {activeUser.role === 'operator' ? 'Drone operator' : 'Farm owner'}</Text>
        </View>
      </Card>
      <Card>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7 }}>
          {activeUser.role === 'operator' ? <UserRound size={17} color={palette.green} /> : <Building2 size={17} color={palette.green} />}
          <Text style={{ color: palette.navy, fontSize: 13, fontWeight: '800' }}>Personal details</Text>
        </View>
        <TextInput accessibilityLabel="Full name" value={fullName} onChangeText={setFullName} placeholder="Full name" style={fieldStyle} />
        <TextInput accessibilityLabel="Email address" value={email} onChangeText={setEmail} placeholder="Email address" autoCapitalize="none" keyboardType="email-address" style={fieldStyle} />
        <TextInput accessibilityLabel="Phone number" value={phone} onChangeText={setPhone} placeholder="Phone number" keyboardType="phone-pad" style={fieldStyle} />
        <TextInput accessibilityLabel={activeUser.role === 'operator' ? 'Business name' : 'Farm name'} value={organizationName} onChangeText={setOrganizationName} placeholder={activeUser.role === 'operator' ? 'Business name' : 'Farm name'} style={fieldStyle} />
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}><MapPin size={12} color={palette.green} /><Text style={{ color: palette.muted, fontSize: 10 }}>Location</Text></View>
        <TextInput accessibilityLabel="City or town" value={location} onChangeText={setLocation} placeholder="City or town" style={fieldStyle} />
        <TextInput accessibilityLabel="Province" value={province} onChangeText={setProvince} placeholder="Province" style={fieldStyle} />
        <Button label={saving ? 'Saving…' : 'Save account details'} disabled={saving} onPress={saveAccount} />
      </Card>
      {activeUser.role === 'operator' ? <Card>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7 }}>
          <Pill tone={verificationTone(activeUser.verificationStatus)} label={`Verification: ${labelStatus(activeUser.verificationStatus ?? 'not_submitted')}`} />
        </View>
        <Button label="Manage credentials" variant="quiet" onPress={() => router.push('/verification')} />
      </Card> : null}
      <Card>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7 }}>
          <KeyRound size={17} color={palette.green} />
          <Text style={{ color: palette.navy, fontSize: 13, fontWeight: '800' }}>Password</Text>
        </View>
        <TextInput accessibilityLabel="Current password" value={currentPassword} onChangeText={setCurrentPassword} placeholder="Current password" secureTextEntry autoComplete="current-password" style={fieldStyle} />
        <TextInput accessibilityLabel="New password" value={newPassword} onChangeText={setNewPassword} placeholder="New password, at least 8 characters" secureTextEntry autoComplete="new-password" style={fieldStyle} />
        <TextInput accessibilityLabel="Confirm new password" value={confirmPassword} onChangeText={setConfirmPassword} placeholder="Confirm new password" secureTextEntry autoComplete="new-password" style={fieldStyle} />
        <Button label={saving ? 'Saving…' : 'Update password'} variant="secondary" disabled={saving} onPress={savePassword} />
        {error ? <Text accessibilityRole="alert" style={{ color: palette.red, fontSize: 10 }}>{error}</Text> : null}
        {feedback ? <Text accessibilityRole="alert" style={{ color: palette.successText, fontSize: 10 }}>{feedback}</Text> : null}
      </Card>
      <Button label="Sign out" variant="quiet" disabled={saving} onPress={handleSignOut} />
    </Screen>
  );
}
