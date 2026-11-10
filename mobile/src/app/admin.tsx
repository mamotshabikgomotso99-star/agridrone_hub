import { router } from 'expo-router';
import { Activity, ClipboardCheck, ShieldCheck, Users } from 'lucide-react-native';
import { useState } from 'react';
import { Text, View } from 'react-native';

import { Button, Card, Metric, PageTitle, Pill, Screen, palette } from '@/components/marketplace-ui';
import { useMarketplace } from '@/hooks/use-marketplace';
import type { JobModerationStatus } from '@/types/marketplace';
import { verificationTone } from '@/utils/formatting';

export default function AdminConsole() {
  const { activeUser, data, moderateJob } = useMarketplace();
  const [feedback, setFeedback] = useState('');
  if (!activeUser) return null;
  if (activeUser.role !== 'admin') {
    return <Screen><PageTitle title="Administrator access required" subtitle="This console is available to the administrator account only." /><Button label="Back to dashboard" onPress={() => router.replace('/(tabs)/dashboard')} /></Screen>;
  }

  const operators = data.users.filter((user) => user.role === 'operator');
  const pending = operators.filter((user) => user.verificationStatus === 'pending').length;
  const openJobs = data.jobs.filter((job) => ['open', 'application_received'].includes(job.status)).length;
  const activeBookings = data.bookings.filter((booking) => ['confirmed', 'in_progress', 'work_submitted'].includes(booking.status)).length;
  return (
    <Screen>
      <Button label="‹ Back to overview" variant="quiet" onPress={() => router.back()} />
      <PageTitle eyebrow="AGRIDRONE HUB · ADMIN DEMO" title="Marketplace console" subtitle="All figures below are calculated from fictional local sample records." />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        <Metric label="Total users" value={`${data.users.length}`} />
        <Metric label="Operators" value={`${operators.length}`} color={palette.info} />
        <Metric label="Open listings" value={`${openJobs}`} color={palette.purple} />
        <Metric label="Active bookings" value={`${activeBookings}`} color={palette.amber} />
      </View>
      <Card style={{ backgroundColor: palette.softPurple, borderColor: palette.purpleBorder }}>
        <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
          <ShieldCheck size={18} color={palette.purple} />
          <Text style={{ color: palette.purple, fontSize: 13, fontWeight: '800' }}>Verification queue · {pending} pending</Text>
          {pending ? <Pill tone="amber" label="Review needed" /> : null}
        </View>
        <Text style={{ color: palette.muted, fontSize: 10, lineHeight: 16 }}>Review sample operator profiles and change their local demonstration status. No document is securely stored or assessed.</Text>
        <Button label="Review operators" onPress={() => router.push('/(tabs)/explore')} />
      </Card>
      <Card>
        <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
          <ClipboardCheck size={18} color={palette.green} />
          <Text style={{ color: palette.navy, fontSize: 13, fontWeight: '800' }}>Job listings</Text>
        </View>
        <Text style={{ color: palette.muted, fontSize: 10 }}>Browse the demo marketplace lifecycle and booking statuses.</Text>
        <Button label="Browse demo jobs" variant="quiet" onPress={() => router.push('/(tabs)/jobs')} />
        {data.jobs.map((job) => (
          <View key={job.id} style={{ borderTopWidth: 1, borderTopColor: palette.border, paddingTop: 10, gap: 6 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
              <Text style={{ flex: 1, color: palette.navy, fontSize: 10, fontWeight: '700' }}>{job.title}</Text>
              <Pill label={job.moderationStatus ?? 'active'} tone={job.moderationStatus === 'suspended' ? 'red' : job.moderationStatus === 'flagged' ? 'amber' : 'green'} />
            </View>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 7 }}>
              {(['flagged', 'suspended', 'active'] as JobModerationStatus[]).filter((status) => status !== (job.moderationStatus ?? 'active')).map((status) => (
                <Button key={status} label={status === 'active' ? 'Restore listing' : status === 'flagged' ? 'Flag listing' : 'Suspend listing'} variant={status === 'suspended' ? 'danger' : 'quiet'} onPress={() => moderateJob(job.id, status).then(() => setFeedback(`${job.title} is now ${status}.`)).catch((error: unknown) => setFeedback(error instanceof Error ? error.message : 'Could not moderate listing.'))} />
              ))}
            </View>
          </View>
        ))}
        {feedback ? <Text accessibilityRole="alert" style={{ color: palette.successText, fontSize: 10 }}>{feedback}</Text> : null}
      </Card>
      <Card>
        <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
          <Users size={18} color={palette.info} />
          <Text style={{ color: palette.navy, fontSize: 13, fontWeight: '800' }}>Demonstration users</Text>
        </View>
        {data.users.map((user) => <View key={user.id} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderTopWidth: 1, borderTopColor: palette.border }}>
          <View><Text style={{ color: palette.navy, fontSize: 10, fontWeight: '700' }}>{user.fullName}</Text><Text style={{ color: palette.muted, fontSize: 9 }}>{user.role} · {user.location}</Text></View>
          {user.verificationStatus ? <Pill label={user.verificationStatus.replace('_', ' ')} tone={verificationTone(user.verificationStatus)} /> : <Pill label="sample" tone="gray" />}
        </View>)}
      </Card>
      <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 9 }}>
        <Activity color={palette.purple} size={17} />
        <Text style={{ flex: 1, color: palette.muted, fontSize: 10 }}>Administrator access in this prototype is role switching only. A production app must enforce permissions on its backend.</Text>
      </Card>
    </Screen>
  );
}
