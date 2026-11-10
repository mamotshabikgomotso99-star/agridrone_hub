import { router } from 'expo-router';
import { Bell, CircleCheck, CloudSun, MapPin, ShieldCheck, Star, Users, Wind } from 'lucide-react-native';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { Button, Card, DroneArtwork, FarmArtwork, HeroBanner, Metric, PageTitle, Pill, Screen, palette } from '@/components/marketplace-ui';
import { useMarketplace } from '@/hooks/use-marketplace';
import { labelStatus, verificationTone } from '@/utils/formatting';

export default function DashboardScreen() {
  const { data, activeUser } = useMarketplace();
  if (!activeUser) return null;

  const farmer = activeUser.role === 'farmer';
  const operator = activeUser.role === 'operator';
  const admin = activeUser.role === 'admin';
  const myJobs = data.jobs.filter((job) => farmer ? job.farmerId === activeUser.id : operator ? job.acceptedOperatorId === activeUser.id : true);
  const activeBookings = data.bookings.filter((booking) => farmer ? booking.farmerId === activeUser.id : operator ? booking.operatorId === activeUser.id : true);
  const pendingApplications = farmer
    ? data.applications.filter((application) => data.jobs.some((job) => job.id === application.jobId && job.farmerId === activeUser.id) && application.status === 'pending')
    : [];
  const pendingVerifications = data.users.filter((user) => user.role === 'operator' && user.verificationStatus === 'pending').length;

  return (
    <Screen>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
        <View>
          <Text style={{ color: palette.agriculturalGreen, fontSize: 10, fontWeight: '800', letterSpacing: 1.2 }}>{admin ? 'ADMIN DEMO' : farmer ? 'FARM OWNER' : 'OPERATOR WORKSPACE'}</Text>
          <Text style={{ color: palette.navy, fontSize: 20, fontWeight: '800', marginTop: 3 }}>Hello, {activeUser.fullName.split(' ')[0]} 👋</Text>
        </View>
        <Pressable accessibilityRole="button" accessibilityLabel="Open notifications" onPress={() => router.push('/notifications')} style={{ flexDirection: 'row', alignItems: 'center', gap: 7 }}>
          <Bell size={16} color={palette.green} />
          <Text style={{ color: palette.muted, fontSize: 10 }}>Demo mode</Text>
        </Pressable>
      </View>

      {farmer ? (
        <>
          <Card>
            <FarmArtwork height={205} label="YOUR FARM · FIELD VIEW" />
            <View style={{ gap: 8 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                <View style={{ flex: 1, gap: 3 }}>
                  <Text style={{ color: palette.navy, fontSize: 17, fontWeight: '900' }}>Your farm, smarter.</Text>
                  <Text style={{ color: palette.muted, fontSize: 10, lineHeight: 15 }}>See your farm from a new perspective and connect with drone professionals.</Text>
                </View>
                <View style={{ width: 42, height: 42, borderRadius: 15, backgroundColor: palette.softGreen, alignItems: 'center', justifyContent: 'center' }}>
                  <CloudSun size={21} color={palette.agriculturalGreen} />
                </View>
              </View>
              <Button label="Explore drone operators" onPress={() => router.push('/(tabs)/explore')} />
            </View>
            <View style={{ height: 1, backgroundColor: palette.border }} />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
              <View style={{ flex: 1, gap: 3 }}>
                <Text style={{ color: palette.navy, fontSize: 12, fontWeight: '800' }}>{activeUser.farmName ?? 'My farm'}</Text>
                <Text style={{ color: palette.muted, fontSize: 10 }}>{activeUser.farmType ?? 'Farm profile'}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <MapPin size={11} color={palette.blue} />
                  <Text style={{ color: palette.muted, fontSize: 9 }}>{activeUser.location}, {activeUser.province}</Text>
                </View>
              </View>
              <View style={{ alignItems: 'flex-end', gap: 2, borderRadius: 13, paddingHorizontal: 12, paddingVertical: 9, backgroundColor: palette.softGreen }}>
                <Text style={{ color: palette.green, fontSize: 15, fontWeight: '900' }}>{activeUser.farmSizeHectares ?? '—'} ha</Text>
                <Text style={{ color: palette.muted, fontSize: 8, fontWeight: '700' }}>FARM AREA</Text>
              </View>
            </View>
          </Card>
          <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: palette.softGreen, borderColor: palette.greenBorder }}>
            <View style={{ width: 40, height: 40, borderRadius: 14, backgroundColor: palette.white, alignItems: 'center', justifyContent: 'center' }}>
              <CloudSun size={21} color={palette.info} />
            </View>
            <View style={{ flex: 1, gap: 3 }}>
              <Text style={{ color: palette.navy, fontSize: 11, fontWeight: '800' }}>Weather snapshot · {activeUser.location}</Text>
              <Text style={{ color: palette.muted, fontSize: 9 }}>Example conditions only · no live weather service connected</Text>
            </View>
            <View style={{ alignItems: 'flex-end', gap: 2 }}>
              <Text style={{ color: palette.navy, fontSize: 20, fontWeight: '900' }}>22°</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                <Wind size={10} color={palette.info} />
                <Text style={{ color: palette.muted, fontSize: 8 }}>8 km/h</Text>
              </View>
            </View>
          </Card>
          <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: 8 }}>
            <View style={{ flex: 1 }}>
              <PageTitle eyebrow="FIELD ACTIVITY" title="My farm projects" subtitle="Recent service requests from your farm." />
            </View>
            <Button label="See all" variant="quiet" onPress={() => router.push('/(tabs)/jobs')} />
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingRight: 20 }} nestedScrollEnabled>
            {myJobs.slice(0, 4).map((job) => (
              <Pressable key={job.id} accessibilityRole="button" accessibilityLabel={`View ${job.title}`} onPress={() => router.push('/(tabs)/jobs')} style={({ pressed }) => ({ width: 218, padding: 10, gap: 9, borderRadius: 18, borderWidth: 1, borderColor: palette.border, backgroundColor: palette.white, opacity: pressed ? 0.85 : 1 })}>
                <FarmArtwork height={104} label="FARM PROJECT · DEMO" />
                <View style={{ gap: 4 }}>
                  <Text numberOfLines={1} style={{ color: palette.agriculturalGreen, fontSize: 9, fontWeight: '800' }}>{job.category}</Text>
                  <Text numberOfLines={2} style={{ minHeight: 34, color: palette.navy, fontSize: 11, lineHeight: 16, fontWeight: '800' }}>{job.title}</Text>
                  <Text style={{ color: palette.muted, fontSize: 9 }}>{job.location} · {job.farmSizeHectares} ha</Text>
                </View>
              </Pressable>
            ))}
            {myJobs.length === 0 ? (
              <Card style={{ width: 218, justifyContent: 'center', backgroundColor: palette.softGreen }}>
                <Text style={{ color: palette.navy, fontSize: 11, fontWeight: '800' }}>Your field projects will appear here</Text>
                <Text style={{ color: palette.muted, fontSize: 9, lineHeight: 14 }}>Post a service request to get started.</Text>
              </Card>
            ) : null}
          </ScrollView>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 9 }}>
            <Metric label="Jobs posted" value={`${myJobs.length}`} />
            <Metric label="Active bookings" value={`${activeBookings.filter((booking) => !['completed', 'cancelled'].includes(booking.status)).length}`} color={palette.info} />
            <Metric label="Applications" value={`${pendingApplications.length}`} color={palette.purple} />
          </View>
          <View style={{ flexDirection: 'row', gap: 9 }}>
            <Button label="Post a service request" onPress={() => router.push('/post-job')} />
            <Button label="My jobs" variant="quiet" onPress={() => router.push('/(tabs)/jobs')} />
          </View>
          <PageTitle eyebrow="Nearby professionals" title="Recommended operators" subtitle="Ratings and prices below are fictional demonstration data." />
          {data.users.filter((user) => user.role === 'operator').slice(0, 3).map((user) => (
            <Card key={user.id}>
              <DroneArtwork />
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 11 }}>
                <View style={{ width: 42, height: 42, borderRadius: 15, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.softGreen }}>
                  <Text style={{ color: palette.green, fontWeight: '800' }}>{user.fullName.split(' ').map((name) => name[0]).join('')}</Text>
                </View>
                <View style={{ flex: 1, gap: 3 }}>
                  <Text style={{ color: palette.navy, fontSize: 12, fontWeight: '800' }}>{user.fullName}</Text>
                  <Text style={{ color: palette.muted, fontSize: 10 }}>{user.services[0]} · {user.location}</Text>
                  <Text style={{ color: palette.muted, fontSize: 9 }}>{user.droneEquipment?.[0] ?? 'Agricultural drone fleet'}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    {user.verificationStatus === 'verified' ? <ShieldCheck size={12} color={palette.success} /> : null}
                    <Text style={{ color: palette.muted, fontSize: 9 }}>{user.verificationStatus === 'verified' ? 'Demo verified' : 'Verification pending'} · sample profile</Text>
                  </View>
                </View>
                <View style={{ alignItems: 'flex-end', gap: 4 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}><Star size={11} color={palette.amber} /><Text style={{ color: palette.earthBrown, fontSize: 10, fontWeight: '800' }}>{user.rating?.toFixed(1) ?? '—'}</Text></View>
                  <Text style={{ color: palette.agriculturalGreen, fontSize: 10, fontWeight: '700' }}>From R3,200</Text>
                </View>
              </View>
            </Card>
          ))}
        </>
      ) : operator ? (
        <>
          <HeroBanner title="Ready to Take Flight?" body="Find agricultural projects that match your skills and equipment." colors={[palette.green, palette.agriculturalGreen]} action="Browse opportunities" onAction={() => router.push('/(tabs)/explore')} />
          {activeUser.verificationStatus !== 'verified' ? (
            <Card style={{ borderColor: palette.amberBorder, backgroundColor: palette.softAmber }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <ShieldCheck color={palette.amber} size={19} />
                <Text style={{ color: palette.earthBrown, fontSize: 13, fontWeight: '800' }}>Complete your verification</Text>
                <Pill tone={verificationTone(activeUser.verificationStatus)} label={labelStatus(activeUser.verificationStatus ?? 'not_submitted')} />
              </View>
              <Text style={{ color: palette.muted, fontSize: 11, lineHeight: 17 }}>Submit demonstration credentials for review. Uploading a file does not certify your account.</Text>
              <Button label="Verify my account" onPress={() => router.push('/verification')} variant="secondary" />
            </Card>
          ) : (
            <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: palette.softGreen }}>
              <CircleCheck color={palette.success} size={18} />
              <Text style={{ color: palette.successText, fontWeight: '700', fontSize: 11 }}>Verified in this demonstration workspace</Text>
            </Card>
          )}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 9 }}>
            <Metric label="Open opportunities" value={`${data.jobs.filter((job) => ['open', 'application_received'].includes(job.status)).length}`} />
            <Metric label="Active assignments" value={`${activeBookings.filter((booking) => !['completed', 'cancelled'].includes(booking.status)).length}`} color={palette.info} />
            <Metric label="Demo earnings" value="R12,400" color={palette.purple} />
          </View>
          <Card>
            <Text style={{ color: palette.navy, fontWeight: '800', fontSize: 13 }}>Profile completion</Text>
            <View style={{ height: 8, backgroundColor: palette.lightGrey, borderRadius: 8, overflow: 'hidden' }}>
              <View style={{ width: '72%', height: '100%', backgroundColor: palette.brightGreen }} />
            </View>
            <Text style={{ color: palette.muted, fontSize: 10 }}>72% · Add a portfolio and equipment details to complete your sample profile.</Text>
          </Card>
          <Button label="Open my assignments" variant="quiet" onPress={() => router.push('/(tabs)/jobs')} />
        </>
      ) : (
        <>
          <HeroBanner title="Marketplace overview" body="Review demonstration activity, verification requests, and sample marketplace jobs." colors={[palette.green, palette.agriculturalGreen]} />
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 9 }}>
            <Metric label="Registered users" value={`${data.users.length}`} />
            <Metric label="Farmers" value={`${data.users.filter((user) => user.role === 'farmer').length}`} color={palette.info} />
            <Metric label="Operators" value={`${data.users.filter((user) => user.role === 'operator').length}`} color={palette.purple} />
            <Metric label="Awaiting review" value={`${pendingVerifications}`} color={palette.amber} />
          </View>
          <Card>
            <Text style={{ color: palette.navy, fontSize: 14, fontWeight: '800' }}>Administrator demo tools</Text>
            <Text style={{ color: palette.muted, fontSize: 11 }}>Actions update only the local demonstration dataset.</Text>
            <Button label="Open admin console" onPress={() => router.push('/admin')} />
            <Button label="Review operator credentials" variant="quiet" onPress={() => router.push('/(tabs)/explore')} />
          </Card>
          <Card style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
            <Users size={18} color={palette.purple} />
            <Text style={{ flex: 1, color: palette.muted, fontSize: 11 }}>Sample users, jobs, and bookings are stored locally on this device.</Text>
            <MapPin size={15} color={palette.green} />
          </Card>
        </>
      )}

      <Text style={{ textAlign: 'center', color: palette.muted, fontSize: 9 }}>Fictional sample data · no live services connected</Text>
      {admin ? <Button label="View all jobs" onPress={() => router.push('/(tabs)/jobs')} variant="quiet" /> : null}
    </Screen>
  );
}
