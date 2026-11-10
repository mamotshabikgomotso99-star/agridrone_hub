import { router } from 'expo-router';
import { MapPin, Search, ShieldCheck, Star } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';

import { Button, Card, DroneArtwork, FarmArtwork, PageTitle, Pill, Screen, palette } from '@/components/marketplace-ui';
import { useMarketplace } from '@/hooks/use-marketplace';
import { formatRand, labelStatus, verificationTone } from '@/utils/formatting';

const categories = ['All services', 'Crop Monitoring', 'Aerial Mapping', 'Land Surveying', 'Crop Health Analysis', 'Irrigation Inspection', 'Infrastructure Inspection', 'Pest and Disease Monitoring'];
const farmArtworkVariants = ['rice', 'golden', 'seedlings'] as const;

export default function ExploreScreen() {
  const { data, activeUser, applyForJob, updateVerification } = useMarketplace();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All services');
  const [notice, setNotice] = useState('');
  if (!activeUser) return null;

  const isOperator = activeUser.role === 'operator';
  const isAdmin = activeUser.role === 'admin';
  const filteredJobs = data.jobs.filter((job) => {
    const matchesSearch = `${job.title} ${job.category} ${job.location} ${job.province}`.toLowerCase().includes(query.toLowerCase());
    return job.moderationStatus !== 'suspended' && matchesSearch && (category === 'All services' || job.category === category);
  });
  const operators = data.users.filter((user) => user.role === 'operator').filter((user) => {
    const matchesSearch = `${user.fullName} ${user.businessName} ${user.location} ${user.services.join(' ')} ${user.droneEquipment?.join(' ') ?? ''}`.toLowerCase().includes(query.toLowerCase());
    return matchesSearch && (category === 'All services' || user.services.includes(category));
  });
  const farms = data.users.filter((user) => user.role === 'farmer').filter((user) => (
    `${user.farmName} ${user.farmType} ${user.fullName} ${user.location} ${user.province}`.toLowerCase().includes(query.toLowerCase())
  ));
  const farmShowcase = farms.length > 0 ? (
    <>
      <PageTitle eyebrow="Farm profiles" title="Farms & fields" subtitle="Explore sample farms, their crops, and the service requests posted across the marketplace." />
      {farms.map((farm, index) => {
        const farmJobs = data.jobs.filter((job) => job.farmerId === farm.id);
        return (
          <Card key={farm.id}>
            <FarmArtwork variant={farmArtworkVariants[index % farmArtworkVariants.length]} />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
              <View style={{ flex: 1, gap: 3 }}>
                <Text style={{ color: palette.navy, fontSize: 13, fontWeight: '800' }}>{farm.farmName ?? 'Sample farm'}</Text>
                <Text style={{ color: palette.muted, fontSize: 10 }}>{farm.farmType ?? 'Mixed agriculture'} · {farm.location}, {farm.province}</Text>
              </View>
              <Text style={{ color: palette.green, fontSize: 14, fontWeight: '800' }}>{farm.farmSizeHectares ?? '—'} ha</Text>
            </View>
            <Text style={{ color: palette.muted, fontSize: 10 }}>Farm owner: {farm.fullName} · {farmJobs.length} sample service requests</Text>
          </Card>
        );
      })}
    </>
  ) : null;
  const pendingOperators = data.users.filter((user) => user.role === 'operator' && ['pending', 'more_info', 'not_submitted'].includes(user.verificationStatus ?? 'not_submitted'));

  async function apply(jobId: string) {
    try {
      await applyForJob(jobId, 'I am interested in this project and can complete the requested survey.');
      setNotice('Your sample application was sent to the farm owner.');
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Could not submit your application.');
    }
  }

  async function reviewOperator(userId: string, status: 'verified' | 'rejected' | 'more_info') {
    try {
      await updateVerification(userId, status);
      setNotice(`Demonstration verification updated to ${status.replace('_', ' ')}.`);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Could not update this review.');
    }
  }

  return (
    <Screen>
      <PageTitle
        eyebrow={isAdmin ? 'ADMIN REVIEW QUEUE' : isOperator ? 'FIND YOUR NEXT PROJECT' : 'PROFESSIONAL MARKETPLACE'}
        title={isAdmin ? 'Operator verification' : isOperator ? 'Job opportunities' : 'Find drone operators'}
        subtitle={isAdmin ? 'Review sample operator submissions. This is not a real certification service.' : isOperator ? 'Open agricultural work posted by demonstration farm owners.' : 'Connect with operators across South Africa. Profiles, ratings, and offers are sample data.'}
      />
      {!isAdmin ? (
        <>
          <View style={{ minHeight: 46, borderWidth: 1, borderColor: palette.border, borderRadius: 12, backgroundColor: palette.white, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Search size={17} color={palette.muted} />
            <TextInput value={query} onChangeText={setQuery} placeholder={isOperator ? 'Search jobs, farms, or location' : 'Search operators, farms, or services'} placeholderTextColor={palette.placeholder} accessibilityLabel="Search marketplace" style={{ flex: 1, color: palette.navy, fontSize: 12 }} />
          </View>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 7 }}>
            {categories.map((item) => (
              <Pressable key={item} accessibilityRole="button" accessibilityState={{ selected: item === category }} onPress={() => setCategory(item)} style={{ paddingHorizontal: 10, paddingVertical: 8, borderRadius: 20, backgroundColor: item === category ? palette.softGreen : palette.white, borderWidth: 1, borderColor: item === category ? palette.greenBorder : palette.border }}>
                <Text style={{ color: item === category ? palette.green : palette.muted, fontSize: 9, fontWeight: '700' }}>{item}</Text>
              </Pressable>
            ))}
          </View>
        </>
      ) : null}

      {notice ? <Card style={{ backgroundColor: palette.softGreen }}><Text accessibilityRole="alert" style={{ color: palette.successText, fontSize: 11 }}>{notice}</Text></Card> : null}
      {!isAdmin ? farmShowcase : null}

      {isAdmin ? (
        <>
          <Card style={{ backgroundColor: palette.softPurple, borderColor: palette.purpleBorder }}>
            <Text style={{ color: palette.purple, fontSize: 12, fontWeight: '800' }}>Verification is simulated</Text>
            <Text style={{ color: palette.muted, fontSize: 10, lineHeight: 15 }}>No real licence documents are stored or assessed. Approvals only change the local sample account status.</Text>
            <Button label="Admin overview" variant="quiet" onPress={() => router.push('/admin')} />
          </Card>
          {pendingOperators.map((user) => (
            <Card key={user.id}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ color: palette.navy, fontSize: 14, fontWeight: '800' }}>{user.fullName}</Text>
                <Pill tone={verificationTone(user.verificationStatus)} label={labelStatus(user.verificationStatus ?? 'not_submitted')} />
              </View>
              <Text style={{ color: palette.muted, fontSize: 11 }}>{user.businessName} · {user.location}, {user.province}</Text>
              <Text style={{ color: palette.muted, fontSize: 10 }}>Services: {user.services.join(', ')} · {user.experienceYears} years experience</Text>
              <Text style={{ color: palette.muted, fontSize: 9 }}>Sample profile data only. Credential file storage is not configured.</Text>
              <Text style={{ color: palette.muted, fontSize: 9 }}>Submitted filename: {user.credentialFileName ?? 'No demo document submitted'}</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                <Button label="Approve demo" onPress={() => reviewOperator(user.id, 'verified')} />
                <Button label="Request info" variant="quiet" onPress={() => reviewOperator(user.id, 'more_info')} />
                <Button label="Reject" variant="danger" onPress={() => reviewOperator(user.id, 'rejected')} />
              </View>
            </Card>
          ))}
        </>
      ) : isOperator ? (
        <>
          {filteredJobs.filter((job) => ['open', 'application_received'].includes(job.status)).map((job) => {
            const applied = data.applications.some((application) => application.jobId === job.id && application.operatorId === activeUser.id);
            return (
              <Card key={job.id}>
                <FarmArtwork />
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 10 }}>
                  <View style={{ flex: 1, gap: 6 }}>
                    <Text style={{ color: palette.navy, fontSize: 14, fontWeight: '800' }}>{job.title}</Text>
                    <Text style={{ color: palette.agriculturalGreen, fontSize: 10, fontWeight: '700' }}>{job.category}</Text>
                  </View>
                  <Pill label={job.status === 'open' ? 'New opportunity' : 'Applications open'} />
                </View>
                <Text style={{ color: palette.muted, fontSize: 11, lineHeight: 17 }}>{job.description}</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 13 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}><MapPin size={12} color={palette.blue} /><Text style={{ color: palette.muted, fontSize: 10 }}>{job.location}, {job.province}</Text></View>
                  <Text style={{ color: palette.earthBrown, fontSize: 10 }}>🌾 {job.farmSizeHectares} ha</Text>
                  <Text style={{ color: palette.green, fontSize: 10, fontWeight: '800' }}>{formatRand(job.budgetMin)}–{formatRand(job.budgetMax)}</Text>
                </View>
                <Text style={{ color: palette.muted, fontSize: 9 }}>By {data.users.find((user) => user.id === job.farmerId)?.fullName ?? 'Farm owner'} · preferred by {job.preferredDate}</Text>
                <Text style={{ color: palette.muted, fontSize: 9 }}>Needs: {job.requiredSkills.join(', ')} · Equipment: {job.requiredEquipment.join(', ')}</Text>
                {activeUser.verificationStatus !== 'verified' ? (
                  <View style={{ gap: 8 }}>
                    <Text style={{ color: palette.earthBrown, fontSize: 10 }}>Complete demo verification before applying. Uploading credentials is not official certification.</Text>
                    <Button label="Open verification" variant="secondary" onPress={() => router.push('/verification')} />
                  </View>
                ) : (
                  <Button label={applied ? 'Application sent' : 'Apply for this job'} disabled={applied} onPress={() => apply(job.id)} />
                )}
              </Card>
            );
          })}
        </>
      ) : (
        <>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {['Crop Monitoring', 'Aerial Mapping', 'Land Surveying', 'Crop Health Analysis', 'Irrigation Inspection', 'Infrastructure Inspection', 'Pest and Disease Monitoring', 'General Agricultural Services'].map((service, index) => (
              <Pressable key={service} onPress={() => setCategory(service)} accessibilityRole="button" style={{ flexGrow: 1, flexBasis: 140, minHeight: 72, padding: 12, borderRadius: 15, backgroundColor: [palette.service.cropMonitoring, palette.service.aerialMapping, palette.service.landSurveying, palette.service.cropHealth, palette.service.irrigation, palette.service.infrastructure, palette.service.pestMonitoring, palette.service.general][index], justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 19 }}>{['🌿', '🗺️', '📐', '🌱', '💧', '🏡', '🔎', '🚁'][index]}</Text>
                <Text style={{ color: palette.navy, fontSize: 10, fontWeight: '800' }}>{service}</Text>
              </Pressable>
            ))}
          </View>
          {operators.map((user) => (
            <Card key={user.id}>
              <DroneArtwork />
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 11 }}>
                <View style={{ width: 44, height: 44, borderRadius: 15, backgroundColor: palette.softGreen, alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ color: palette.green, fontWeight: '800' }}>{user.fullName.split(' ').map((part) => part[0]).join('')}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: palette.navy, fontWeight: '800', fontSize: 13 }}>{user.fullName}</Text>
                  <Text style={{ color: palette.muted, fontSize: 10 }}>{user.businessName}</Text>
                </View>
                {user.verificationStatus === 'verified' ? <ShieldCheck size={18} color={palette.success} /> : <Pill tone={verificationTone(user.verificationStatus)} label={labelStatus(user.verificationStatus ?? 'not_submitted')} />}
              </View>
              <Text style={{ color: palette.muted, fontSize: 10 }}>{user.services.join(' · ')}</Text>
              <Text style={{ color: palette.green, fontSize: 10, fontWeight: '700' }}>Aircraft: {user.droneEquipment?.join(', ') ?? 'Agricultural drone fleet'}</Text>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap', gap: 6 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}><MapPin size={12} color={palette.blue} /><Text style={{ color: palette.muted, fontSize: 10 }}>{user.location}, {user.province}</Text></View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}><Star size={12} color={palette.amber} /><Text style={{ color: palette.earthBrown, fontSize: 10 }}>{user.rating?.toFixed(1)} · sample</Text></View>
              </View>
              <Text style={{ color: palette.muted, fontSize: 10 }}>{user.experienceYears} years experience · {user.reviewCount} sample reviews · from R3,200</Text>
              <Button label="Open demo messages" variant="quiet" onPress={() => router.push('/(tabs)/messages')} />
            </Card>
          ))}
        </>
      )}
      {!isAdmin && (isOperator ? filteredJobs.length === 0 : operators.length === 0 && farms.length === 0) ? <Card><Text style={{ color: palette.muted, fontSize: 12 }}>No matching marketplace listings. Try another search or filter.</Text></Card> : null}
      <Text style={{ color: palette.muted, textAlign: 'center', fontSize: 9 }}>Fictional demonstration marketplace · no real credentials, prices, or bookings</Text>
    </Screen>
  );
}
