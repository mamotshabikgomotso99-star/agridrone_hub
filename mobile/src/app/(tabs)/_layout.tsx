import { Tabs, router } from 'expo-router';
import { BriefcaseBusiness, Compass, House, MessageCircle, UserRound, ShieldCheck } from 'lucide-react-native';
import { useEffect } from 'react';
import { useMarketplace } from '@/hooks/use-marketplace';
import { palette } from '@/components/marketplace-ui';

const icons = [House, Compass, BriefcaseBusiness, MessageCircle, UserRound];

export default function MarketplaceTabs() {
  const { activeUser, ready } = useMarketplace();
  useEffect(() => {
    if (ready && !activeUser) router.replace('/login');
  }, [ready, activeUser]);
  if (!ready || !activeUser) return null;

  const admin = activeUser.role === 'admin';
  return (
    <Tabs
      screenOptions={({ route }) => {
        const index = ['dashboard', 'explore', 'jobs', 'messages', 'profile'].indexOf(route.name);
        const Icon = icons[index] ?? ShieldCheck;
        return {
          headerShown: false,
          tabBarActiveTintColor: palette.green,
          tabBarInactiveTintColor: palette.muted,
          tabBarLabelStyle: { fontSize: 10, fontWeight: '700' },
          tabBarStyle: { height: 62, paddingTop: 5, paddingBottom: 5, borderTopColor: palette.border, backgroundColor: palette.white },
          tabBarIcon: ({ color, size }) => <Icon color={color} size={size} strokeWidth={2} />,
        };
      }}>
      <Tabs.Screen name="dashboard" options={{ title: admin ? 'Overview' : 'Home' }} />
      <Tabs.Screen name="explore" options={{ title: admin ? 'Review' : activeUser.role === 'operator' ? 'Opportunities' : 'Explore' }} />
      <Tabs.Screen name="jobs" options={{ title: admin ? 'Manage' : 'My Jobs' }} />
      <Tabs.Screen name="messages" options={{ title: 'Messages' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
    </Tabs>
  );
}
