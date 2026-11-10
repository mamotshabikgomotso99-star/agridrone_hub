import * as DocumentPicker from 'expo-document-picker';
import { router } from 'expo-router';
import { FileCheck2, ShieldCheck, Upload } from 'lucide-react-native';
import { useState } from 'react';
import { Text, View } from 'react-native';

import { Button, Card, PageTitle, Pill, Screen, palette } from '@/components/marketplace-ui';
import { useMarketplace } from '@/hooks/use-marketplace';
import { labelStatus, verificationTone } from '@/utils/formatting';

export default function VerificationScreen() {
  const { activeUser, submitVerification } = useMarketplace();
  const [fileName, setFileName] = useState(activeUser?.credentialFileName ?? '');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  if (!activeUser) return null;

  async function pickFile() {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: ['application/pdf', 'image/*'], copyToCacheDirectory: false });
      if (!result.canceled && result.assets[0]) {
        setFileName(result.assets[0].name);
        setNotice('File selected on this device. The file itself is not uploaded or securely stored.');
      }
    } catch (error) {
      setNotice(error instanceof Error ? `Could not select a document: ${error.message}` : 'Could not select a document.');
    }
  }

  async function submit() {
    if (!fileName) {
      setNotice('Select a PDF or image before submitting.');
      return;
    }
    setBusy(true);
    try {
      await submitVerification(fileName);
      setNotice('Your demonstration credential has been queued for admin review.');
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Could not submit this credential.');
    } finally {
      setBusy(false);
    }
  }

  const status = activeUser.verificationStatus ?? 'not_submitted';
  return (
    <Screen>
      <Button label="‹ Back to profile" variant="quiet" onPress={() => router.back()} />
      <PageTitle eyebrow="OPERATOR ONBOARDING" title="Credential review" subtitle="Select a demonstration file to preview the operator verification workflow." />
      <Card style={{ backgroundColor: status === 'verified' ? palette.softGreen : '#FFFBEB', borderColor: status === 'verified' ? palette.greenBorder : palette.amberBorder }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ color: palette.navy, fontSize: 13, fontWeight: '800' }}>Review status</Text>
          <Pill tone={verificationTone(status)} label={labelStatus(status)} />
        </View>
        <Text style={{ color: palette.muted, fontSize: 10, lineHeight: 16 }}>
          {status === 'verified' ? 'This sample operator is marked as verified for prototype testing.' : status === 'pending' ? 'A demo administrator can update this status in the verification queue.' : 'No official credential assessment or certification is performed by this app.'}
        </Text>
      </Card>
      <Card>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 9 }}>
          <ShieldCheck color={palette.green} size={19} />
          <Text style={{ color: palette.navy, fontSize: 13, fontWeight: '800' }}>Credential document</Text>
        </View>
        <Text style={{ color: palette.muted, fontSize: 10, lineHeight: 16 }}>Choose a relevant licence, qualification, or identity file for this local demo. Your selection is not transferred to a server.</Text>
        <Button label="Choose PDF or image" variant="secondary" onPress={pickFile} />
        {fileName ? <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, padding: 11, borderRadius: 12, backgroundColor: palette.softGreen }}><FileCheck2 color={palette.green} size={18} /><Text style={{ flex: 1, color: palette.navy, fontSize: 10 }}>{fileName}</Text></View> : <View style={{ alignItems: 'center', paddingVertical: 17, borderStyle: 'dashed', borderWidth: 1, borderColor: palette.greenBorder, borderRadius: 13, gap: 8 }}><Upload color={palette.agriculturalGreen} size={21} /><Text style={{ color: palette.muted, fontSize: 10 }}>No document selected</Text></View>}
        <Button label={busy ? 'Submitting…' : 'Submit for demo review'} disabled={busy || !fileName || activeUser.role !== 'operator'} onPress={submit} />
        {activeUser.role !== 'operator' ? <Text style={{ color: palette.earthBrown, fontSize: 10 }}>Switch to an operator demo account to submit sample credentials.</Text> : null}
        {notice ? <Text accessibilityRole="alert" style={{ color: notice.startsWith('Could not') ? palette.errorText : palette.successText, fontSize: 10 }}>{notice}</Text> : null}
      </Card>
      <Card style={{ backgroundColor: palette.softPurple, borderColor: palette.purpleBorder }}>
        <Text style={{ color: palette.purple, fontSize: 12, fontWeight: '800' }}>Local file selection ≠ secure storage</Text>
        <Text style={{ color: palette.muted, fontSize: 10, lineHeight: 16 }}>The prototype saves only the selected filename and review status in local app storage. It does not upload or retain the document. Real verification requires a protected backend and a documented review policy.</Text>
      </Card>
    </Screen>
  );
}
