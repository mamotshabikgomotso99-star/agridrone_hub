import { useState } from 'react';
import { ScrollView, Text, TextInput, View } from 'react-native';

import { Button, Card, PageTitle, Pill, Screen, palette } from '@/components/marketplace-ui';
import { useMarketplace } from '@/hooks/use-marketplace';

const conversations = [
  { id: 'conversation-thabo-lerato', title: 'Thabo Molefe · Lerato Mokoena', participants: ['farmer-thabo', 'operator-lerato'], topic: 'Aerial Crop Health Assessment' },
  { id: 'conversation-nandi-amina', title: 'Nandi Dlamini · Amina Jacobs', participants: ['farmer-nandi', 'operator-amina'], topic: 'Orchard Health Survey' },
  { id: 'conversation-pieter-amina', title: 'Pieter van der Merwe · Amina Jacobs', participants: ['farmer-pieter', 'operator-amina'], topic: 'Irrigation Line Inspection' },
];

export default function MessagesScreen() {
  const { data, activeUser, sendMessage } = useMarketplace();
  const [selectedId, setSelectedId] = useState('');
  const [draft, setDraft] = useState('');
  const [feedback, setFeedback] = useState('');
  if (!activeUser) return null;

  const available = activeUser.role === 'admin'
    ? conversations
    : conversations.filter((conversation) => conversation.participants.includes(activeUser.id));
  const selected = available.find((conversation) => conversation.id === selectedId) ?? available[0];
  const messages = selected ? data.messages.filter((message) => message.conversationId === selected.id) : [];
  const latestText = (conversationId: string) => data.messages.filter((message) => message.conversationId === conversationId).at(-1)?.body ?? 'No messages yet';

  async function send() {
    if (!selected) return;
    try {
      await sendMessage(selected.id, draft);
      setDraft('');
      setFeedback('');
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Message could not be saved.');
    }
  }

  return (
    <Screen>
      <PageTitle eyebrow="LOCAL DEMO MESSAGING" title="Messages" subtitle="Prototype conversations are stored on this device. No messages are sent externally." />
      {available.length === 0 ? (
        <Card><Text style={{ color: palette.muted, fontSize: 11 }}>No sample conversations are linked to this account yet. Explore a listing to find a professional.</Text></Card>
      ) : (
        <>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
            {available.map((conversation) => (
              <Button key={conversation.id} label={conversation.title.split(' · ')[1] ?? conversation.title} variant={selected?.id === conversation.id ? 'primary' : 'quiet'} onPress={() => setSelectedId(conversation.id)} />
            ))}
          </ScrollView>
          {selected ? (
            <Card style={{ minHeight: 390 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View>
                  <Text style={{ color: palette.navy, fontSize: 13, fontWeight: '800' }}>{selected.title}</Text>
                  <Text style={{ color: palette.muted, fontSize: 9, marginTop: 3 }}>{selected.topic}</Text>
                </View>
                <Pill label="Sample chat" tone="blue" />
              </View>
              <View style={{ flex: 1, gap: 10 }}>
                {messages.map((message) => {
                  const mine = message.senderId === activeUser.id;
                  const sender = data.users.find((user) => user.id === message.senderId);
                  return (
                    <View key={message.id} style={{ alignSelf: mine ? 'flex-end' : 'flex-start', maxWidth: '88%', backgroundColor: mine ? palette.softGreen : palette.lightGrey, padding: 11, borderRadius: 13 }}>
                      {!mine ? <Text style={{ color: palette.green, fontSize: 9, fontWeight: '800', marginBottom: 4 }}>{sender?.fullName ?? 'Sample user'}</Text> : null}
                      <Text style={{ color: palette.navy, fontSize: 11, lineHeight: 16 }}>{message.body}</Text>
                    </View>
                  );
                })}
                {messages.length === 0 ? <Text style={{ color: palette.muted, fontSize: 11 }}>Start a new sample conversation.</Text> : null}
              </View>
              {feedback ? <Text accessibilityRole="alert" style={{ color: palette.red, fontSize: 10 }}>{feedback}</Text> : null}
              <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                <TextInput value={draft} onChangeText={setDraft} onSubmitEditing={send} returnKeyType="send" placeholder="Write a message..." placeholderTextColor={palette.placeholder} accessibilityLabel="Write a message" style={{ flex: 1, minHeight: 44, paddingHorizontal: 12, backgroundColor: palette.white, borderColor: palette.border, borderWidth: 1, borderRadius: 12, fontSize: 11, color: palette.navy }} />
                <Button label="Send" onPress={send} accessibilityLabel="Send message" />
              </View>
            </Card>
          ) : null}
          <Card>
            <Text style={{ color: palette.navy, fontSize: 13, fontWeight: '800' }}>Recent conversations</Text>
            {available.map((conversation) => <View key={conversation.id} style={{ gap: 3, paddingVertical: 5 }}><Text style={{ color: palette.navy, fontSize: 10, fontWeight: '700' }}>{conversation.title}</Text><Text style={{ color: palette.muted, fontSize: 9 }}>{latestText(conversation.id)}</Text></View>)}
          </Card>
        </>
      )}
    </Screen>
  );
}
