import { router } from 'expo-router';
import { ArrowLeft, ExternalLink, Image as ImageIcon } from 'lucide-react-native';
import { Linking, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Card, PageTitle, palette } from '@/components/marketplace-ui';

const credits = [
  {
    title: 'Agricultural spraying drone over crop rows',
    attribution: 'Afrispace Drone Academy · image supplied by the user',
    source: 'https://afrispacedroneacademy.com/',
  },
  {
    title: 'Aerial drone spraying technology on a farm field',
    attribution: 'Magda Ehlers · Pexels Free License',
    source: 'https://www.pexels.com/video/aerial-drone-spraying-technology-on-farm-field-34182418/',
  },
  {
    title: 'DJI Agras T50 in flight',
    attribution: 'Photo by Blervis · CC0',
    source: 'https://commons.wikimedia.org/wiki/File:DJI_Agras_T50_in_flight.jpg',
  },
  {
    title: 'DJI Agras T50 sprayer demonstration',
    attribution: 'Photo by Blervis · CC0',
    source: 'https://commons.wikimedia.org/wiki/File:DJI_Agras_T50_demonstrating_sprayers_in_flight.jpg',
  },
  {
    title: 'DJI Agras T50 on ground',
    attribution: 'Photo by Blervis · CC0',
    source: 'https://commons.wikimedia.org/wiki/File:DJI_Agras_T50_on_ground.jpg',
  },
  {
    title: 'DJI Agras T10',
    attribution: 'Photo by ZLEA · CC BY-SA 4.0',
    source: 'https://commons.wikimedia.org/wiki/File:DJI_3WWDZ-10A_Agras_T10_(FA3XY4XTKM)_(4-9-2024).jpg',
  },
  {
    title: 'Agricultural drone spraying on paddy field',
    attribution: 'Photo by Shreesha Sharma · CC BY-SA 4.0',
    source: 'https://commons.wikimedia.org/wiki/File:Agricultural_drone_spraying_on_paddy_field.jpg',
  },
  {
    title: 'Agricultural drone in use on rice field near Nisoshi, Aomori',
    attribution: 'Photo by Benlisquare · CC BY-SA 4.0',
    source: 'https://commons.wikimedia.org/wiki/File:Agricultural_drone_in_use_on_rice_field_near_Nisoshi,_Aomori.jpg',
  },
];

export default function ImageCreditsScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: palette.background }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 30 }}>
        <View style={{ width: '100%', maxWidth: 840, alignSelf: 'center', paddingHorizontal: 20, paddingTop: 18, gap: 16 }}>
          <Pressable onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Back to AgriDrone Hub" style={{ flexDirection: 'row', alignItems: 'center', gap: 7, alignSelf: 'flex-start', paddingVertical: 6 }}>
            <ArrowLeft size={17} color={palette.green} />
            <Text style={{ color: palette.green, fontSize: 12, fontWeight: '800' }}>Back to AgriDrone Hub</Text>
          </Pressable>
          <PageTitle eyebrow="Image sources" title="Photo credits" subtitle="Product and field-operation photographs are linked to their original source pages and licenses." />
          {credits.map((credit) => (
            <Card key={credit.source} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View style={{ width: 40, height: 40, borderRadius: 13, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.softGreen }}>
                <ImageIcon size={19} color={palette.agriculturalGreen} />
              </View>
              <View style={{ flex: 1, gap: 4 }}>
                <Text style={{ color: palette.navy, fontSize: 12, fontWeight: '800' }}>{credit.title}</Text>
                <Text style={{ color: palette.muted, fontSize: 10 }}>{credit.attribution}</Text>
              </View>
              <Pressable accessibilityRole="link" onPress={() => Linking.openURL(credit.source)} hitSlop={8} style={{ flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 7 }}>
                <Text style={{ color: palette.agriculturalGreen, fontSize: 10, fontWeight: '800' }}>Source</Text>
                <ExternalLink size={13} color={palette.agriculturalGreen} />
              </Pressable>
            </Card>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}