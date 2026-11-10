import { LinearGradient } from 'expo-linear-gradient';
import { useState, type ReactNode } from 'react';
import { Drone } from 'lucide-react-native';
import { ImageBackground, Pressable, ScrollView, StyleSheet, Text, TextInput, View, type StyleProp, type TextInputProps, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { palette } from '@/constants/theme';

export { palette };

export function Screen({ children }: { children: ReactNode }) {
  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
      <SafeAreaView style={styles.screen}>{children}</SafeAreaView>
    </ScrollView>
  );
}

export function PageTitle({ eyebrow, title, subtitle }: { eyebrow?: string; title: string; subtitle?: string }) {
  return (
    <View style={styles.titleWrap}>
      {eyebrow ? <Text style={styles.eyebrow}>{eyebrow.toUpperCase()}</Text> : null}
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

export function Card({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function Button({ label, onPress, variant = 'primary', disabled = false, accessibilityLabel }: {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'quiet' | 'danger';
  disabled?: boolean;
  accessibilityLabel?: string;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        variant === 'primary' && styles.buttonPrimary,
        variant === 'secondary' && styles.buttonSecondary,
        variant === 'quiet' && styles.buttonQuiet,
        variant === 'danger' && styles.buttonDanger,
        disabled && styles.buttonDisabled,
        pressed && !disabled && styles.pressed,
      ]}>
      <Text style={[
        styles.buttonText,
        variant === 'secondary' && styles.buttonTextSecondary,
        variant === 'quiet' && styles.buttonTextQuiet,
        variant === 'danger' && styles.buttonTextDanger,
      ]}>{label}</Text>
    </Pressable>
  );
}

export function Pill({ label, tone = 'green' }: { label: string; tone?: 'green' | 'blue' | 'amber' | 'purple' | 'gray' | 'red' }) {
  return <View style={[styles.pill, styles[`pill_${tone}`]]}><Text style={[styles.pillText, styles[`pillText_${tone}`]]}>{label}</Text></View>;
}

export function FieldInput({ label, value, onChangeText, placeholder, keyboardType, multiline, onFocus, onBlur, ...props }: TextInputProps & {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={styles.inputWrap}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={palette.placeholder}
        keyboardType={keyboardType}
        multiline={multiline}
        onFocus={(event) => { setFocused(true); onFocus?.(event); }}
        onBlur={(event) => { setFocused(false); onBlur?.(event); }}
        textAlignVertical={multiline ? 'top' : 'center'}
        style={[styles.input, focused && styles.inputFocused, multiline && styles.inputMultiline]}
        {...props}
      />
    </View>
  );
}

export function HeroBanner({ title, body, action, onAction, colors = [palette.green, palette.agriculturalGreen] }: {
  title: string;
  body: string;
  action?: string;
  onAction?: () => void;
  colors?: readonly [string, string, ...string[]];
}) {
  return (
    <LinearGradient colors={colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
      <View style={styles.heroDecor} />
      <Text style={styles.heroEyebrow}>AGRIDRONE HUB · DEMO</Text>
      <Text style={styles.heroTitle}>{title}</Text>
      <Text style={styles.heroBody}>{body}</Text>
      {action && onAction ? <Button label={action} onPress={onAction} variant="secondary" /> : null}
    </LinearGradient>
  );
}

export function Metric({ label, value, color = palette.green }: { label: string; value: string; color?: string }) {
  return <View style={styles.metric}><Text style={[styles.metricValue, { color }]}>{value}</Text><Text style={styles.metricLabel}>{label}</Text></View>;
}

const farmArtworkSources = {
  default: require('../../assets/images/farm-fields.jpg'),
  rice: require('../../assets/images/farm-fields-rice.jpg'),
  golden: require('../../assets/images/farm-fields-golden.jpg'),
  seedlings: require('../../assets/images/farm-fields-seedlings.jpg'),
} as const;

const farmArtworkDescriptions = {
  default: 'Photograph of an agricultural drone flying over a green rice field',
  rice: 'Photograph of a green rice field with an agricultural drone',
  golden: 'Photograph of a golden grain field at sunset',
  seedlings: 'Photograph of young crop seedlings growing in a nursery',
} as const;

export function FarmArtwork({ height = 142, label = 'FIELD VIEW · DEMO FARM', variant = 'default' }: { height?: number; label?: string; variant?: keyof typeof farmArtworkSources }) {
  return (
    <ImageBackground
      accessible
      accessibilityRole="image"
      accessibilityLabel={farmArtworkDescriptions[variant]}
      source={farmArtworkSources[variant]}
      resizeMode="cover"
      style={{ height, overflow: 'hidden', borderRadius: 14, justifyContent: 'flex-end', padding: 11 }}>
      <View style={{ alignSelf: 'flex-start', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 5, backgroundColor: '#FFFFFFE8' }}>
        <Text style={{ color: palette.green, fontSize: 8, fontWeight: '800', letterSpacing: 0.6 }}>{label}</Text>
      </View>
    </ImageBackground>
  );
}

export function DroneArtwork() {
  return (
    <View accessible accessibilityRole="image" accessibilityLabel="Photograph of a camera-equipped drone flying over green fields" style={{ height: 132, overflow: 'hidden', borderRadius: 14, backgroundColor: '#DDF1F5' }}>
      <ImageBackground
        source={require('../../assets/images/drone-farm-hero.jpg')}
        resizeMode="cover"
        imageStyle={{ opacity: 0.96 }}
        style={{ width: '100%', height: '100%', justifyContent: 'space-between', padding: 11 }}>
        <LinearGradient
          colors={['#102A4320', '#071D167A']}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={{ ...StyleSheet.absoluteFill }}
        />
        <View style={{ alignSelf: 'flex-end', width: 30, height: 30, borderRadius: 11, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFFE8' }}>
          <Drone size={17} color={palette.green} strokeWidth={1.8} />
        </View>
        <View style={{ alignSelf: 'flex-start', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 5, backgroundColor: '#FFFFFFE8' }}>
          <Text style={{ color: palette.green, fontSize: 8, fontWeight: '800', letterSpacing: 0.4 }}>PRECISION AGRICULTURE · DEMO PHOTO</Text>
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: palette.background },
  scrollContent: { flexGrow: 1, paddingBottom: 38 },
  screen: { width: '100%', maxWidth: 840, alignSelf: 'center', paddingHorizontal: 20, paddingTop: 26, gap: 16 },
  titleWrap: { gap: 6, marginBottom: 3 },
  eyebrow: { color: palette.agriculturalGreen, fontSize: 10, fontWeight: '800', letterSpacing: 1.5 },
  title: { color: palette.navy, fontSize: 27, lineHeight: 34, fontWeight: '800', letterSpacing: -0.6 },
  subtitle: { color: palette.muted, fontSize: 13, lineHeight: 20 },
  card: { backgroundColor: palette.surfaceGreen, borderRadius: 18, borderWidth: 1, borderColor: palette.border, padding: 17, gap: 12 },
  button: { alignSelf: 'flex-start', minHeight: 43, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 16, borderRadius: 12 },
  buttonPrimary: { backgroundColor: palette.green },
  buttonSecondary: { backgroundColor: palette.softGreen, borderWidth: 1, borderColor: palette.greenBorder },
  buttonQuiet: { backgroundColor: palette.lightGrey, borderWidth: 1, borderColor: palette.border },
  buttonDanger: { backgroundColor: '#FEF2F2' },
  buttonDisabled: { opacity: 0.45 },
  buttonText: { color: palette.white, fontSize: 12, fontWeight: '800' },
  buttonTextSecondary: { color: palette.green },
  buttonTextQuiet: { color: palette.green },
  buttonTextDanger: { color: palette.red },
  pressed: { opacity: 0.75, transform: [{ scale: 0.99 }] },
  pill: { alignSelf: 'flex-start', borderRadius: 20, paddingHorizontal: 9, paddingVertical: 5 },
  pill_green: { backgroundColor: palette.softGreen },
  pill_blue: { backgroundColor: '#E0F2FE' },
  pill_amber: { backgroundColor: '#FFF3D9' },
  pill_purple: { backgroundColor: '#F0EAFE' },
  pill_gray: { backgroundColor: palette.lightGrey },
  pill_red: { backgroundColor: '#FEF2F2' },
  pillText: { fontSize: 9, fontWeight: '800' },
  pillText_green: { color: palette.successText },
  pillText_blue: { color: palette.infoText },
  pillText_amber: { color: palette.warningText },
  pillText_purple: { color: '#7042C6' },
  pillText_gray: { color: palette.muted },
  pillText_red: { color: palette.errorText },
  inputWrap: { gap: 6 },
  inputLabel: { color: palette.navy, fontSize: 11, fontWeight: '700' },
  input: { minHeight: 46, borderWidth: 1, borderColor: palette.border, borderRadius: 11, backgroundColor: palette.white, paddingHorizontal: 12, color: palette.navy, fontSize: 13 },
  inputFocused: { borderColor: palette.brightGreen },
  inputMultiline: { minHeight: 96, paddingTop: 12 },
  hero: { overflow: 'hidden', borderRadius: 21, padding: 22, gap: 12 },
  heroDecor: { position: 'absolute', width: 190, height: 190, borderRadius: 100, borderWidth: 1, borderColor: '#FFFFFF1C', right: -55, top: -84 },
  heroEyebrow: { color: palette.lime, fontSize: 9, fontWeight: '800', letterSpacing: 1.2 },
  heroTitle: { color: palette.white, fontSize: 25, lineHeight: 31, fontWeight: '800', maxWidth: 450 },
  heroBody: { color: '#E8F7E5', fontSize: 12, lineHeight: 19, maxWidth: 480 },
  metric: { flex: 1, minWidth: 100, backgroundColor: palette.white, borderWidth: 1, borderColor: palette.border, borderRadius: 15, padding: 14, gap: 6 },
  metricValue: { fontSize: 23, fontWeight: '800' },
  metricLabel: { color: palette.muted, fontSize: 9, fontWeight: '700' },
});
