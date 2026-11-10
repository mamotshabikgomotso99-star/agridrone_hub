import { router } from 'expo-router';
import { Bell, CheckCheck } from 'lucide-react-native';
import { useState } from 'react';
import { Text, View } from 'react-native';

import { Button, Card, PageTitle, Pill, Screen, palette } from '@/components/marketplace-ui';
import { useMarketplace } from '@/hooks/use-marketplace';

export default function NotificationsScreen() {
  const { data, activeUser, markNotificationsRead } = useMarketplace();
  const [error, setError] = useState('');
  if (!activeUser) return null;
  const activeUserId = activeUser.id;
  const notifications = data.notifications.filter((item) => item.userId === activeUser.id);

  async function markRead() {
    try {
      await markNotificationsRead(activeUserId);
      setError('');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not mark notifications as read.');
    }
  }

  return (
    <Screen>
      <Button label="‹ Back" variant="quiet" onPress={() => router.back()} />
      <PageTitle eyebrow="LOCAL DEMO ALERTS" title="Notifications" subtitle="These sample alerts are stored in the local prototype. Push notifications are not configured." />
      {error ? <Text accessibilityRole="alert" style={{ color: palette.red, fontSize: 10 }}>{error}</Text> : null}
      {notifications.some((item) => !item.read) ? <Button label="Mark all as read" variant="quiet" onPress={markRead} /> : null}
      {notifications.length === 0 ? <Card><Bell color={palette.green} size={22} /><Text style={{ color: palette.muted, fontSize: 11 }}>No notifications yet.</Text></Card> : notifications.map((item) => (
        <Card key={item.id} style={{ borderColor: item.read ? palette.border : palette.greenBorder, backgroundColor: item.read ? palette.white : palette.softGreen }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
            <Text style={{ flex: 1, color: palette.navy, fontSize: 12, fontWeight: '800' }}>{item.title}</Text>
            <Pill label={item.read ? 'Read' : 'New'} tone={item.read ? 'gray' : 'green'} />
          </View>
          <Text style={{ color: palette.muted, fontSize: 10, lineHeight: 16 }}>{item.message}</Text>
          <Text style={{ color: palette.muted, fontSize: 9 }}>{new Date(item.createdAt).toLocaleString()}</Text>
          {item.title.toLowerCase().includes('verification') ? <Button label="Review verification" variant="quiet" onPress={() => router.push('/(tabs)/explore')} /> : null}
          {item.title.toLowerCase().includes('application') ? <Button label="Open my jobs" variant="quiet" onPress={() => router.push('/(tabs)/jobs')} /> : null}
          {item.title.toLowerCase().includes('booking') || item.title.toLowerCase().includes('work') ? <Button label="View bookings" variant="quiet" onPress={() => router.push('/(tabs)/jobs')} /> : null}
        </Card>
      ))}
      <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <CheckCheck color={palette.green} size={16} />
        <Text style={{ flex: 1, color: palette.muted, fontSize: 9 }}>Updates you create in the sample workflow are saved locally and visible on the relevant demo accounts.</Text>
      </Card>
    </Screen>
  );
}
