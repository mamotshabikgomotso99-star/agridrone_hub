import { router } from 'expo-router';
import { z } from 'zod';
import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { Pressable, Text, View } from 'react-native';

import { Button, Card, FieldInput, PageTitle, Pill, Screen, palette } from '@/components/marketplace-ui';
import { useMarketplace } from '@/hooks/use-marketplace';

const categories = ['Crop Monitoring', 'Aerial Mapping', 'Land Surveying', 'Crop Health Analysis', 'Irrigation Inspection', 'Infrastructure Inspection', 'Pest and Disease Monitoring', 'General Agricultural Services'];
function isCalendarDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

const schema = z.object({
  title: z.string().trim().min(5, 'Enter a job title with at least 5 characters.'),
  category: z.string().min(1, 'Choose a service category.'),
  description: z.string().trim().min(20, 'Add at least 20 characters of project details.'),
  farmName: z.string().trim().min(2, 'Enter the farm name.'),
  location: z.string().trim().min(2, 'Enter the farm location.'),
  province: z.string().trim().min(2, 'Enter the province.'),
  area: z.coerce.number().positive('Farm size must be greater than zero.'),
  preferredDate: z.string().refine(isCalendarDate, 'Enter a real date using YYYY-MM-DD.').refine((date) => date >= new Date().toISOString().slice(0, 10), 'Preferred date must be today or later.'),
  skills: z.string().trim().min(2, 'List a required skill.'),
  equipment: z.string().trim().min(2, 'List required equipment.'),
  budgetMin: z.coerce.number().positive('Minimum budget must be greater than zero.'),
  budgetMax: z.coerce.number().positive('Maximum budget must be greater than zero.'),
}).refine((values) => values.budgetMax >= values.budgetMin, {
  message: 'Maximum budget must be at least the minimum budget.',
  path: ['budgetMax'],
});

type JobDraft = {
  title: string;
  category: string;
  description: string;
  farmName: string;
  location: string;
  province: string;
  area: string;
  preferredDate: string;
  skills: string;
  equipment: string;
  budgetMin: string;
  budgetMax: string;
};

const emptyDraft: JobDraft = {
  title: '',
  category: '',
  description: '',
  farmName: '',
  location: '',
  province: '',
  area: '',
  preferredDate: '',
  skills: '',
  equipment: '',
  budgetMin: '',
  budgetMax: '',
};

const steps = ['Service details', 'Requirements', 'Budget', 'Review'];

export default function PostJobScreen() {
  const { activeUser, postJob } = useMarketplace();
  const [step, setStep] = useState(0);
  const { control, setValue, getValues } = useForm<JobDraft>({ defaultValues: emptyDraft, mode: 'onChange' });
  const watchedDraft = useWatch<JobDraft>({ control });
  const draft: JobDraft = { ...emptyDraft, ...watchedDraft };
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  if (!activeUser || activeUser.role !== 'farmer') {
    return <Screen><PageTitle title="Farm owner access" subtitle="Switch to a farm-owner demo account to publish a service request." /><Button label="Back" onPress={() => router.back()} /></Screen>;
  }
  const farmerId = activeUser.id;

  function update(key: keyof JobDraft, value: string) {
    setValue(key, value, { shouldDirty: true, shouldValidate: true });
    setError('');
  }

  function validateStep() {
    if (step === 0) {
      if (draft.title.trim().length < 5) return 'Enter a job title with at least 5 characters.';
      if (!draft.category) return 'Choose a service category.';
      if (draft.description.trim().length < 20) return 'Add at least 20 characters of project details.';
      if (!draft.farmName.trim() || !draft.location.trim() || !draft.province.trim()) return 'Complete the farm name, location, and province.';
    }
    if (step === 1) {
      if (!draft.area || Number(draft.area) <= 0) return 'Enter a farm size greater than zero.';
      if (!draft.skills.trim() || !draft.equipment.trim()) return 'List the skills and equipment required.';
      if (!isCalendarDate(draft.preferredDate) || draft.preferredDate < new Date().toISOString().slice(0, 10)) return 'Enter a valid date today or later as YYYY-MM-DD.';
    }
    if (step === 2) {
      const result = schema.safeParse(getValues());
      if (!result.success) return result.error.issues[0]?.message ?? 'Please check the budget details.';
    }
    return '';
  }

  function continueFlow() {
    const message = validateStep();
    if (message) {
      setError(message);
      return;
    }
    setStep((current) => Math.min(3, current + 1));
  }

  async function publish() {
    const result = schema.safeParse(draft);
    if (!result.success) {
      setError(result.error.issues[0]?.message ?? 'Please correct the job details.');
      return;
    }
    setSaving(true);
    try {
      const valid = result.data;
      await postJob({
        farmerId,
        title: valid.title,
        category: valid.category,
        description: valid.description,
        location: `${valid.farmName} · ${valid.location}`,
        province: valid.province,
        farmSizeHectares: valid.area,
        budgetMin: valid.budgetMin,
        budgetMax: valid.budgetMax,
        preferredDate: valid.preferredDate,
        requiredSkills: valid.skills.split(',').map((item) => item.trim()).filter(Boolean),
        requiredEquipment: valid.equipment.split(',').map((item) => item.trim()).filter(Boolean),
      });
      router.replace('/(tabs)/jobs');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not publish this service request.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Screen>
      <Button label="‹ Back to dashboard" variant="quiet" onPress={() => router.back()} />
      <PageTitle eyebrow="NEW SERVICE REQUEST" title="Find the right flight for your farm" subtitle="Tell operators what you need. This request will be saved in the local demo marketplace." />
      <View style={{ flexDirection: 'row', gap: 6 }}>
        {steps.map((label, index) => <View key={label} style={{ flex: 1, gap: 6 }}><View style={{ height: 5, borderRadius: 5, backgroundColor: index <= step ? palette.brightGreen : palette.border }} /><Text style={{ color: index === step ? palette.green : palette.muted, fontSize: 8, fontWeight: '700' }}>{index + 1}. {label}</Text></View>)}
      </View>
      {error ? <Card style={{ backgroundColor: palette.softRed, borderColor: palette.redBorder }}><Text accessibilityRole="alert" style={{ color: palette.red, fontSize: 11 }}>{error}</Text></Card> : null}
      <Card>
        {step === 0 ? (
          <>
            <Text style={{ color: palette.navy, fontSize: 15, fontWeight: '800' }}>Service details</Text>
            <FieldInput label="Job title" value={draft.title} onChangeText={(value) => update('title', value)} placeholder="e.g. Seasonal crop health survey" />
            <Text style={{ color: palette.navy, fontSize: 11, fontWeight: '700' }}>Service category</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 7 }}>
              {categories.map((category) => <Pressable key={category} onPress={() => update('category', category)} accessibilityRole="button" accessibilityState={{ selected: draft.category === category }} style={{ borderRadius: 18, paddingHorizontal: 10, paddingVertical: 8, backgroundColor: draft.category === category ? palette.softGreen : palette.white, borderWidth: 1, borderColor: draft.category === category ? palette.greenBorder : palette.border }}><Text style={{ color: palette.green, fontSize: 9, fontWeight: '700' }}>{category}</Text></Pressable>)}
            </View>
            <FieldInput label="Project description" value={draft.description} onChangeText={(value) => update('description', value)} placeholder="Describe the fields, requested imagery, and deliverables..." multiline />
            <FieldInput label="Farm name" value={draft.farmName} onChangeText={(value) => update('farmName', value)} placeholder="Farm or business name" />
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 9 }}>
              <View style={{ flex: 1, minWidth: 150 }}><FieldInput label="Town / location" value={draft.location} onChangeText={(value) => update('location', value)} placeholder="Delmas" /></View>
              <View style={{ flex: 1, minWidth: 150 }}><FieldInput label="Province" value={draft.province} onChangeText={(value) => update('province', value)} placeholder="Mpumalanga" /></View>
            </View>
          </>
        ) : null}
        {step === 1 ? (
          <>
            <Text style={{ color: palette.navy, fontSize: 15, fontWeight: '800' }}>Requirements</Text>
            <FieldInput label="Farm size (hectares)" value={draft.area} onChangeText={(value) => update('area', value)} placeholder="e.g. 24.5" keyboardType="decimal-pad" />
            <FieldInput label="Preferred completion date (YYYY-MM-DD)" value={draft.preferredDate} onChangeText={(value) => update('preferredDate', value)} placeholder="2026-11-20" />
            <FieldInput label="Required skills (comma separated)" value={draft.skills} onChangeText={(value) => update('skills', value)} placeholder="Crop analysis, photogrammetry" />
            <FieldInput label="Equipment (comma separated)" value={draft.equipment} onChangeText={(value) => update('equipment', value)} placeholder="RGB camera, multispectral drone" />
            <Pill label="Dates and equipment are not externally validated" tone="blue" />
          </>
        ) : null}
        {step === 2 ? (
          <>
            <Text style={{ color: palette.navy, fontSize: 15, fontWeight: '800' }}>Budget in South African rand</Text>
            <FieldInput label="Minimum budget (R)" value={draft.budgetMin} onChangeText={(value) => update('budgetMin', value)} placeholder="4500" keyboardType="number-pad" />
            <FieldInput label="Maximum budget (R)" value={draft.budgetMax} onChangeText={(value) => update('budgetMax', value)} placeholder="6000" keyboardType="number-pad" />
            <Text style={{ color: palette.muted, fontSize: 10 }}>Budget figures are part of the fictional demo. Enter a valid range with no negative values.</Text>
          </>
        ) : null}
        {step === 3 ? (
          <>
            <Text style={{ color: palette.navy, fontSize: 15, fontWeight: '800' }}>Review request</Text>
            <Text style={{ color: palette.muted, fontSize: 11, lineHeight: 18 }}>{draft.title} · {draft.category}</Text>
            <Text style={{ color: palette.muted, fontSize: 11 }}>{draft.description}</Text>
            <Text style={{ color: palette.muted, fontSize: 11 }}>{draft.farmName} · {draft.location}, {draft.province} · {draft.area} ha</Text>
            <Text style={{ color: palette.muted, fontSize: 11 }}>Required skills: {draft.skills}</Text>
            <Text style={{ color: palette.muted, fontSize: 11 }}>Equipment: {draft.equipment}</Text>
            <Text style={{ color: palette.green, fontSize: 13, fontWeight: '800' }}>R{draft.budgetMin}–R{draft.budgetMax} · preferred by {draft.preferredDate}</Text>
            <Pill label="Will be visible to demo operator accounts" />
          </>
        ) : null}
      </Card>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 10 }}>
        <Button label="Previous" variant="quiet" disabled={step === 0} onPress={() => { setError(''); setStep((value) => Math.max(0, value - 1)); }} />
        {step < 3 ? <Button label="Continue" onPress={continueFlow} /> : <Button label={saving ? 'Publishing…' : 'Publish request'} disabled={saving} onPress={publish} />}
      </View>
    </Screen>
  );
}
