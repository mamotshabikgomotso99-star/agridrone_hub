import { router } from 'expo-router';
import { BriefcaseBusiness, MapPin, Star } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';

import { Button, Card, PageTitle, Pill, Screen, palette } from '@/components/marketplace-ui';
import { useMarketplace } from '@/hooks/use-marketplace';
import type { JobStatus } from '@/types/marketplace';
import { formatRand, labelStatus } from '@/utils/formatting';

export default function JobsScreen() {
  const { data, activeUser, acceptApplication, declineApplication, updateJobStatus, submitReview } = useMarketplace();
  const [filter, setFilter] = useState('All');
  const [feedback, setFeedback] = useState('');
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [reviewComments, setReviewComments] = useState<Record<string, string>>({});
  if (!activeUser) return null;

  const farmer = activeUser.role === 'farmer';
  const operator = activeUser.role === 'operator';
  const jobs = data.jobs.filter((job) => farmer ? job.farmerId === activeUser.id : operator ? job.acceptedOperatorId === activeUser.id || data.applications.some((application) => application.jobId === job.id && application.operatorId === activeUser.id) : true);
  const visible = jobs.filter((job) => filter === 'All' || job.status === filter.toLowerCase().replaceAll(' ', '_'));

  async function applicationAction(id: string, accept: boolean) {
    try {
      if (accept) await acceptApplication(id);
      else await declineApplication(id);
      setFeedback(accept ? 'Operator selected. A booking was created for both accounts.' : 'Application declined in the local demo.');
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Could not update this application.');
    }
  }

  async function update(jobId: string, status: JobStatus, message: string) {
    try {
      await updateJobStatus(jobId, status);
      setFeedback(message);
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Could not update job progress.');
    }
  }

  async function review(jobId: string) {
    try {
      await submitReview(jobId, ratings[jobId] ?? 5, reviewComments[jobId] ?? '');
      setFeedback('Your sample review has been saved for the completed service.');
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Could not save the review.');
    }
  }

  const filters = ['All', 'Confirmed', 'In Progress', 'Work Submitted', 'Completed', 'Open'];

  return (
    <Screen>
      <PageTitle
        eyebrow={activeUser.role === 'admin' ? 'MARKETPLACE OVERSIGHT' : 'SERVICE REQUESTS & BOOKINGS'}
        title={activeUser.role === 'admin' ? 'Job management' : farmer ? 'My farm jobs' : 'My assignments'}
        subtitle={farmer ? 'Review operator proposals and track the work booked for your farm.' : operator ? 'Track submitted proposals, confirmed work, and completed assignments.' : 'Browse the local demonstration jobs dataset.'}
      />
      {feedback ? <Card style={{ backgroundColor: palette.softGreen }}><Text accessibilityRole="alert" style={{ color: palette.successText, fontSize: 11 }}>{feedback}</Text></Card> : null}
      {farmer ? <Button label="＋ Post a service request" onPress={() => router.push('/post-job')} /> : null}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 7 }}>
        {filters.map((item) => (
          <Button key={item} label={item} variant={item === filter ? 'primary' : 'quiet'} onPress={() => setFilter(item)} />
        ))}
      </View>

      {visible.map((job) => {
        const farmerUser = data.users.find((user) => user.id === job.farmerId);
        const assignedOperator = data.users.find((user) => user.id === job.acceptedOperatorId);
        const applications = farmer ? data.applications.filter((application) => application.jobId === job.id) : [];
        const myApplication = operator ? data.applications.find((application) => application.jobId === job.id && application.operatorId === activeUser.id) : null;
        return (
          <Card key={job.id}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8 }}>
              <Text style={{ flex: 1, color: palette.navy, fontSize: 14, fontWeight: '800' }}>{job.title}</Text>
              <Pill label={labelStatus(job.status)} tone={job.status === 'completed' ? 'green' : job.status === 'in_progress' ? 'blue' : job.status === 'cancelled' ? 'red' : 'amber'} />
            </View>
            <Text style={{ color: palette.agriculturalGreen, fontSize: 10, fontWeight: '700' }}>{job.category}</Text>
            <Text style={{ color: palette.muted, fontSize: 11, lineHeight: 17 }}>{job.description}</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 13 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}><MapPin size={12} color={palette.blue} /><Text style={{ color: palette.muted, fontSize: 10 }}>{job.location}, {job.province}</Text></View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}><BriefcaseBusiness size={12} color={palette.earthBrown} /><Text style={{ color: palette.muted, fontSize: 10 }}>{job.farmSizeHectares} ha</Text></View>
              <Text style={{ color: palette.green, fontSize: 10, fontWeight: '800' }}>{formatRand(job.budgetMin)}–{formatRand(job.budgetMax)}</Text>
            </View>
            <Text style={{ color: palette.muted, fontSize: 9 }}>Preferred date: {job.preferredDate} · Farm owner: {farmerUser?.fullName ?? 'Sample account'}</Text>
            {assignedOperator ? <Text style={{ color: palette.agriculturalGreen, fontSize: 10 }}>Assigned to {assignedOperator.fullName} · sample booking</Text> : null}
            {operator && myApplication ? <Text style={{ color: palette.muted, fontSize: 10 }}>Your application: {labelStatus(myApplication.status)} · proposed {formatRand(myApplication.proposedPrice)}</Text> : null}
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
              {['open', 'application_received', 'confirmed', 'in_progress', 'work_submitted', 'completed'].map((stage) => {
                const currentIndex = ['open', 'application_received', 'confirmed', 'in_progress', 'work_submitted', 'completed'].indexOf(job.status);
                const stageIndex = ['open', 'application_received', 'confirmed', 'in_progress', 'work_submitted', 'completed'].indexOf(stage);
                return <Pill key={stage} label={labelStatus(stage)} tone={stageIndex <= currentIndex ? 'green' : 'gray'} />;
              })}
            </View>

            {farmer && applications.length > 0 ? (
              <View style={{ gap: 9, borderTopWidth: 1, borderTopColor: palette.border, paddingTop: 12 }}>
                <Text style={{ color: palette.navy, fontSize: 12, fontWeight: '800' }}>Operator applications ({applications.length})</Text>
                {applications.map((application) => {
                  const applicant = data.users.find((user) => user.id === application.operatorId);
                  return (
                    <View key={application.id} style={{ borderRadius: 12, backgroundColor: palette.lightGrey, padding: 11, gap: 6 }}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 7 }}>
                        <Text style={{ color: palette.navy, fontSize: 11, fontWeight: '800' }}>{applicant?.fullName ?? 'Operator'}</Text>
                        <Pill label={labelStatus(application.status)} tone={application.status === 'accepted' ? 'green' : application.status === 'declined' ? 'gray' : 'amber'} />
                      </View>
                      <Text style={{ color: palette.muted, fontSize: 10 }}>{applicant?.businessName} · {applicant?.services.join(', ')}</Text>
                      <Text style={{ color: palette.muted, fontSize: 10 }}>{application.message}</Text>
                      <Text style={{ color: palette.green, fontSize: 10, fontWeight: '800' }}>Proposal {formatRand(application.proposedPrice)} · {application.proposedCompletionDate}</Text>
                      {application.status === 'pending' ? (
                        <View style={{ flexDirection: 'row', gap: 8 }}>
                          <Button label="Accept proposal" onPress={() => applicationAction(application.id, true)} />
                          <Button label="Decline" variant="quiet" onPress={() => applicationAction(application.id, false)} />
                        </View>
                      ) : null}
                    </View>
                  );
                })}
              </View>
            ) : null}

            {operator && job.acceptedOperatorId === activeUser.id ? (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {job.status === 'confirmed' ? <Button label="Start work" onPress={() => update(job.id, 'in_progress', 'Job marked in progress for the assigned operator.')} /> : null}
                {job.status === 'in_progress' ? <Button label="Submit work" onPress={() => update(job.id, 'work_submitted', 'Work submitted for the farm owner to confirm.')} /> : null}
              </View>
            ) : null}
            {farmer && job.status === 'work_submitted' ? <Button label="Confirm completion" onPress={() => update(job.id, 'completed', 'Completion confirmed by the farm owner.')} /> : null}
            {farmer && job.status === 'completed' && job.acceptedOperatorId ? (() => {
              const existingReview = data.reviews.find((item) => item.jobId === job.id && item.farmerId === activeUser.id);
              return existingReview ? (
                <View style={{ borderTopWidth: 1, borderTopColor: palette.border, paddingTop: 10, gap: 5 }}>
                  <Text style={{ color: palette.agriculturalGreen, fontSize: 10, fontWeight: '800' }}>Your sample review · {existingReview.rating}/5 stars</Text>
                  <Text style={{ color: palette.muted, fontSize: 10 }}>{existingReview.comment || 'No written comment.'}</Text>
                </View>
              ) : (
                <View style={{ borderTopWidth: 1, borderTopColor: palette.border, paddingTop: 10, gap: 8 }}>
                  <Text style={{ color: palette.navy, fontSize: 11, fontWeight: '800' }}>Rate the completed service</Text>
                  <View style={{ flexDirection: 'row', gap: 9 }}>
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <Pressable key={rating} accessibilityRole="button" accessibilityLabel={`${rating} stars`} accessibilityState={{ selected: (ratings[job.id] ?? 5) === rating }} onPress={() => setRatings((current) => ({ ...current, [job.id]: rating }))} style={{ minWidth: 36, minHeight: 36, borderRadius: 11, backgroundColor: (ratings[job.id] ?? 5) >= rating ? '#FEF3C7' : palette.lightGrey, alignItems: 'center', justifyContent: 'center' }}>
                        <Star size={16} color={palette.amber} fill={(ratings[job.id] ?? 5) >= rating ? '#FCD34D' : 'transparent'} />
                      </Pressable>
                    ))}
                  </View>
                  <TextInput value={reviewComments[job.id] ?? ''} onChangeText={(value) => setReviewComments((current) => ({ ...current, [job.id]: value }))} placeholder="Optional feedback for the operator" placeholderTextColor={palette.placeholder} accessibilityLabel="Review comment" multiline style={{ minHeight: 60, borderWidth: 1, borderColor: palette.border, backgroundColor: palette.white, borderRadius: 11, padding: 10, color: palette.navy, fontSize: 10, textAlignVertical: 'top' }} />
                  <Button label="Submit sample review" onPress={() => review(job.id)} />
                </View>
              );
            })() : null}
          </Card>
        );
      })}

      {visible.length === 0 ? <Card><Text style={{ color: palette.muted, fontSize: 11 }}>Nothing matches this status yet. Try another filter.</Text></Card> : null}
      <Text style={{ color: palette.muted, textAlign: 'center', fontSize: 9 }}>Sample prices and booking dates · local prototype only</Text>
    </Screen>
  );
}
