import { router } from 'expo-router';
import { ArrowRight, Drone } from 'lucide-react-native';
import { useEffect } from 'react';
import { Pressable, StatusBar, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useEvent } from 'expo';
import { VideoView, useVideoPlayer } from 'expo-video';
import { useReducedMotion } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { palette } from '@/components/marketplace-ui';

function HeroVideoPlayback({ width, height }: { width: number; height: number }) {
  const player = useVideoPlayer(require('../../assets/videos/agri-drone-flight-hero.mp4'), (videoPlayer) => {
    videoPlayer.muted = true;
    videoPlayer.loop = true;
  });
  const { status } = useEvent(player, 'statusChange', { status: player.status });
  const videoWidth = Math.max(width, height * (16 / 9));
  const videoLeft = width / 2 - videoWidth * (width < 760 ? 0.45 : 0.5);

  useEffect(() => {
    if (status === 'readyToPlay') player.play();
  }, [player, status]);

  return (
    <VideoView
      player={player}
      contentFit="cover"
      nativeControls={false}
      playsInline
      pointerEvents="none"
      style={{ position: 'absolute', top: 0, left: videoLeft, width: videoWidth, height: '100%', opacity: status === 'readyToPlay' ? 1 : 0 }}
    />
  );
}

function HeroVideoBackground({ width, height }: { width: number; height: number }) {
  const reduceMotion = useReducedMotion();

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Image
        source={require('../../assets/images/agri-drones/aomori-rice-drone.jpg')}
        contentFit="cover"
        contentPosition={{ left: 'center', top: '58%' }}
        priority="high"
        accessibilityLabel="Agricultural drone above green rice fields"
        style={StyleSheet.absoluteFill}
      />
      {reduceMotion ? null : <HeroVideoPlayback width={width} height={height} />}
      <LinearGradient
        colors={['rgba(5, 23, 16, 0.42)', 'rgba(5, 23, 16, 0.08)', 'rgba(5, 23, 16, 0.82)']}
        locations={[0, 0.42, 1]}
        style={StyleSheet.absoluteFill}
      />
    </View>
  );
}

export default function LandingPage() {
  const { width, height } = useWindowDimensions();
  const wide = width >= 760;
  const compact = width < 430;
  const smallButtons = width < 430;
  const horizontalPadding = wide ? 64 : compact ? 22 : 26;
  const titleSize = height < 600 ? (wide ? 48 : 32) : wide ? 62 : compact ? 34 : 40;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0A2118' }} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" />
      <View style={{ flex: 1, width: '100%', position: 'relative', overflow: 'hidden', backgroundColor: '#0A2118' }}>
        <HeroVideoBackground width={width} height={height} />

        <View style={{ flex: 1, justifyContent: 'space-between', paddingHorizontal: horizontalPadding, paddingTop: wide ? 28 : 18, paddingBottom: wide ? 48 : 28 }}>
          <View style={{ width: '100%', maxWidth: 1440, alignSelf: 'center', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <View style={{ width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: '#B4DB5D' }}>
                <Drone size={21} color={palette.green} />
              </View>
              <Text style={{ color: palette.white, fontSize: 16, fontWeight: '900', letterSpacing: 0.2 }}>AgriDrone Hub</Text>
            </View>
            <View style={{ borderRadius: 20, paddingHorizontal: 13, paddingVertical: 8, backgroundColor: 'rgba(246, 250, 244, 0.92)' }}>
              <Text style={{ color: palette.green, fontSize: 10, fontWeight: '900', letterSpacing: 0.8 }}>SOUTH AFRICA</Text>
            </View>
          </View>

          <View style={{ width: '100%', maxWidth: 1440, alignSelf: 'center', marginTop: 'auto', paddingTop: wide ? 100 : 70 }}>
            <View style={{ alignSelf: 'flex-start', borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.38)', paddingHorizontal: 12, paddingVertical: 7, backgroundColor: 'rgba(8, 40, 27, 0.56)' }}>
              <Text style={{ color: '#D9F19D', fontSize: 10, fontWeight: '900', letterSpacing: 1.4 }}>AGRICULTURE, FROM ABOVE</Text>
            </View>

            <Text
              accessibilityRole="header"
              style={{ maxWidth: 820, marginTop: 16, color: palette.white, fontSize: titleSize, lineHeight: titleSize * 1.08, fontWeight: '900', letterSpacing: wide ? -1.7 : -1 }}>
              Connecting Agriculture to the Future of Drone Technology.
            </Text>

            <Text style={{ maxWidth: 670, marginTop: 15, color: 'rgba(255,255,255,0.9)', fontSize: wide ? 17 : 14, lineHeight: wide ? 26 : 21 }}>
              Discover a smarter way to connect certified drone operators with farms that need surveying, mapping, monitoring and inspection services.
            </Text>

            <View style={{ flexDirection: compact ? 'column' : 'row', alignItems: compact ? 'stretch' : 'center', gap: 11, marginTop: compact ? 16 : 24 }}>
              <Pressable
                accessibilityRole="button"
                onPress={() => router.push('/(tabs)/explore')}
                style={({ pressed }) => ({
                  minHeight: 54,
                  flex: compact ? undefined : 1,
                  maxWidth: compact ? undefined : 210,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: smallButtons ? 6 : 9,
                  borderRadius: 14,
                  paddingHorizontal: smallButtons ? 10 : 18,
                  backgroundColor: '#245A3D',
                  borderWidth: 1,
                  borderColor: '#A8D34E',
                  opacity: pressed ? 0.86 : 1,
                })}>
                <Text style={{ color: palette.white, fontSize: smallButtons ? 12 : 14, fontWeight: '900' }}>Explore Services</Text>
                <ArrowRight size={17} color={palette.white} />
              </Pressable>

              <Pressable
                accessibilityRole="button"
                onPress={() => router.push('/register')}
                style={({ pressed }) => ({
                  minHeight: 54,
                  flex: compact ? undefined : 1,
                  maxWidth: compact ? undefined : 220,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 14,
                  borderWidth: 1,
                  borderColor: 'rgba(255,255,255,0.74)',
                  paddingHorizontal: smallButtons ? 10 : 18,
                  backgroundColor: 'rgba(7, 28, 19, 0.34)',
                  opacity: pressed ? 0.78 : 1,
                })}>
                <Text style={{ color: palette.white, fontSize: smallButtons ? 12 : 14, fontWeight: '900' }}>Join AgriDrone Hub</Text>
              </Pressable>
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 5, marginTop: 13 }}>
              <Text style={{ color: 'rgba(255,255,255,0.82)', fontSize: 12 }}>Already have an account?</Text>
              <Pressable accessibilityRole="button" onPress={() => router.push('/login')} hitSlop={8}>
                <Text style={{ color: '#D9F19D', fontSize: 12, fontWeight: '900' }}>Sign in</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
