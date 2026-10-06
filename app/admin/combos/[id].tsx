import { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { adminStyles } from '@/components/admin/adminStyles';
import { Button } from '@/components/ui/Button';
import { colors, spacing } from '@/constants/theme';
import { useResponsive } from '@/hooks/useResponsive';
import { adminGetExperience } from '@/lib/adminFirestore';
import { useAdminStore } from '@/store/adminStore';
import type { Experience, ProductAddon, RentalPlan } from '@/types';
import {
  DEFAULT_PLAN_TEMPLATES,
  describeControllerPrice,
  isControllerAddon,
  priceForAddon,
} from '@/utils/rentalPricing';
import { formatINR } from '@/utils/format';

const EMPTY: Experience = {
  id: '',
  name: '',
  description: '',
  categoryId: 'party-social',
  image: '',
  price: 0,
  durationLabel: '12h',
  etaMinutes: 30,
  tag: 'COMBO',
  chips: [],
  people: '2–4',
  includes: [],
  productIds: [],
  howItWorks: [],
};

export default function AdminComboEditScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const isNew = id === 'new';
  const { horizontalPadding } = useResponsive();
  const saveExperience = useAdminStore((s) => s.saveExperience);
  const products = useAdminStore((s) => s.products);
  const categories = useAdminStore((s) => s.categories);
  const [form, setForm] = useState<Experience>(EMPTY);
  const [chipsText, setChipsText] = useState('');
  const [includesText, setIncludesText] = useState('');
  const [howText, setHowText] = useState('');
  const [plans, setPlans] = useState<RentalPlan[]>(
    DEFAULT_PLAN_TEMPLATES.filter((plan) => [1, 3, 6, 12].includes(plan.hours)).map((plan) => ({
      ...plan,
      price: 0,
    }))
  );
  const [controllerTiers, setControllerTiers] = useState<
    { upToHours: string; price: string; mode: 'flat' | 'hourly' }[]
  >([]);
  const [controllerMax, setControllerMax] = useState('3');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isNew) {
      setForm(EMPTY);
      setChipsText('');
      setIncludesText('');
      setHowText('');
      setControllerTiers([]);
      setControllerMax('3');
      return;
    }
    void (async () => {
      const e = await adminGetExperience(id);
      if (e) {
        setForm(e);
        setChipsText((e.chips ?? []).join(', '));
        setIncludesText((e.includes ?? []).join('\n'));
        setHowText((e.howItWorks ?? []).join('\n'));
        const ctrl = (e.addons ?? []).find((a) => isControllerAddon(a));
        setControllerTiers(
          ctrl?.pricing.tiers?.length
            ? ctrl.pricing.tiers.map((t) => ({
                upToHours: String(t.upToHours),
                price: String(t.price),
                mode: t.mode ?? 'flat',
              }))
            : []
        );
        setControllerMax(ctrl ? String(ctrl.maxQuantity) : '3');
        setPlans(
          e.plans?.length
            ? e.plans
            : [
                {
                  id: 'combo',
                  label: e.durationLabel || 'Session',
                  hours: Number(String(e.durationLabel).match(/\d+/)?.[0]) || 12,
                  price: e.price,
                },
              ]
        );
      }
    })();
  }, [id, isNew]);

  const setField = <K extends keyof Experience>(key: K, value: Experience[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const toggleProduct = (productId: string) => {
    setForm((prev) => {
      const has = prev.productIds.includes(productId);
      return {
        ...prev,
        productIds: has
          ? prev.productIds.filter((p) => p !== productId)
          : [...prev.productIds, productId],
      };
    });
  };

  const onSave = async () => {
    setError(null);
    const eid = (isNew ? form.id : id).trim();
    if (!eid || !form.name.trim()) {
      setError('ID and name are required');
      return;
    }
    setSaving(true);
    try {
      const cleanedPlans = plans
        .map((plan) => ({
          ...plan,
          id: plan.id.trim() || `${plan.hours}h`,
          label: plan.label.trim() || `${plan.hours} Hours`,
          hours: Math.max(1, plan.hours),
          price: Math.max(0, plan.price),
        }))
        .filter((plan) => plan.hours > 0);
      if (!cleanedPlans.length) {
        setError('Add at least one package, such as 1 hour, 3 hours, and 6 hours');
        setSaving(false);
        return;
      }
      const featured = cleanedPlans.find((plan) => plan.popular) ?? cleanedPlans[0];
      const tiers = controllerTiers
        .map((t) => ({
          upToHours: Number(t.upToHours.replace(/[^0-9]/g, '')) || 0,
          price: Number(t.price.replace(/[^0-9]/g, '')) || 0,
          mode: t.mode,
        }))
        .filter((t) => t.upToHours > 0)
        .sort((a, b) => a.upToHours - b.upToHours);
      const controllerAddon: ProductAddon[] = tiers.length
        ? [
            {
              id: 'extra-controller',
              name: 'Extra Controller',
              maxQuantity: Math.max(1, Number(controllerMax.replace(/[^0-9]/g, '')) || 1),
              pricing: { perHour: 0, perHourMaxPlanHours: 6, flatPrice: 0, flatMinPlanHours: 12, tiers },
            },
          ]
        : [];
      if (controllerAddon[0]) {
        controllerAddon[0].description = describeControllerPrice(controllerAddon[0]);
      }
      await saveExperience({
        ...form,
        id: eid,
        plans: cleanedPlans,
        price: featured.price,
        durationLabel: featured.label,
        addons: controllerAddon,
        chips: chipsText
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
        includes: includesText
          .split('\n')
          .map((t) => t.trim())
          .filter(Boolean),
        howItWorks: howText
          .split('\n')
          .map((t) => t.trim())
          .filter(Boolean),
      });
      router.replace('/admin/combos' as never);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView
      style={adminStyles.page}
      contentContainerStyle={[adminStyles.scroll, { paddingHorizontal: horizontalPadding, paddingTop: spacing.xl }]}
    >
      <Text style={adminStyles.title}>{isNew ? 'New combo' : 'Edit combo'}</Text>
      <Text style={adminStyles.subtitle}>
        One combo, several packages. Name it once — for example PS5 + Meta Quest 2 — then set 1 hour, 3 hours, and 6 hours. Don’t make a separate combo for each length.
      </Text>

      {isNew ? (
        <View style={adminStyles.field}>
          <Text style={adminStyles.label}>ID (slug)</Text>
          <TextInput
            style={adminStyles.input}
            value={form.id}
            onChangeText={(t) => setField('id', t.trim().toLowerCase().replace(/\s+/g, '-'))}
            autoCapitalize="none"
            placeholderTextColor={colors.mutedText}
          />
        </View>
      ) : null}

      {(
        [
          ['name', 'Name'],
          ['description', 'Description'],
          ['image', 'Image URL'],
          ['tag', 'Tag'],
          ['people', 'People'],
          ['categoryId', 'Category ID'],
        ] as const
      ).map(([key, label]) => (
        <View key={key} style={adminStyles.field}>
          <Text style={adminStyles.label}>{label}</Text>
          <TextInput
            style={[adminStyles.input, key === 'description' && { minHeight: 88, textAlignVertical: 'top' }]}
            value={String(form[key] ?? '')}
            onChangeText={(t) => setField(key, t as never)}
            multiline={key === 'description'}
            autoCapitalize={key === 'image' || key === 'categoryId' ? 'none' : 'sentences'}
            placeholderTextColor={colors.mutedText}
          />
        </View>
      ))}

      {categories.length ? (
        <View style={adminStyles.row}>
          {categories.map((c) => (
            <Button
              key={c.id}
              title={c.shortName || c.id}
              size="sm"
              variant={form.categoryId === c.id ? 'primary' : 'secondary'}
              onPress={() => setField('categoryId', c.id)}
            />
          ))}
        </View>
      ) : null}

      <Text style={adminStyles.cardTitle}>Packages</Text>
      <Text style={[adminStyles.subtitle, { marginBottom: spacing.md }]}>
        Customers pick one of these on the combo, the same way they pick a rental plan on a product.
      </Text>
      <View style={[adminStyles.row, { marginBottom: spacing.md, flexWrap: 'wrap', gap: 8 }]}>
        <Button
          title="1h / 3h / 6h / 12h"
          size="sm"
          variant="secondary"
          onPress={() =>
            setPlans(
              DEFAULT_PLAN_TEMPLATES.filter((plan) => [1, 3, 6, 12].includes(plan.hours)).map((plan) => ({
                ...plan,
                price: plans.find((existing) => existing.hours === plan.hours)?.price ?? 0,
              }))
            )
          }
        />
        <Button
          title="Add package"
          size="sm"
          variant="secondary"
          onPress={() =>
            setPlans((prev) => [
              ...prev,
              { id: `${prev.length + 1}h`, label: 'New package', hours: 1, price: 0 },
            ])
          }
        />
      </View>
      {plans.map((plan, index) => (
        <View key={`plan-${index}`} style={adminStyles.card}>
          <View style={adminStyles.row}>
            <View style={[adminStyles.field, { flex: 1.4, marginBottom: 0 }]}>
              <Text style={adminStyles.label}>Label</Text>
              <TextInput
                style={adminStyles.input}
                value={plan.label}
                onChangeText={(t) =>
                  setPlans((prev) => prev.map((row, i) => (i === index ? { ...row, label: t } : row)))
                }
                placeholderTextColor={colors.mutedText}
              />
            </View>
            <View style={[adminStyles.field, { flex: 0.7, marginBottom: 0, marginLeft: 8 }]}>
              <Text style={adminStyles.label}>Hours</Text>
              <TextInput
                style={adminStyles.input}
                keyboardType="numeric"
                value={String(plan.hours)}
                onChangeText={(t) =>
                  setPlans((prev) =>
                    prev.map((row, i) =>
                      i === index ? { ...row, hours: Number(t.replace(/[^0-9]/g, '')) || 0 } : row
                    )
                  )
                }
                placeholderTextColor={colors.mutedText}
              />
            </View>
            <View style={[adminStyles.field, { flex: 0.8, marginBottom: 0, marginLeft: 8 }]}>
              <Text style={adminStyles.label}>Price ₹</Text>
              <TextInput
                style={adminStyles.input}
                keyboardType="numeric"
                value={plan.price ? String(plan.price) : ''}
                onChangeText={(t) =>
                  setPlans((prev) =>
                    prev.map((row, i) =>
                      i === index ? { ...row, price: Number(t.replace(/[^0-9]/g, '')) || 0 } : row
                    )
                  )
                }
                placeholder="0"
                placeholderTextColor={colors.mutedText}
              />
            </View>
          </View>
          <Button
            title="Remove"
            size="sm"
            variant="ghost"
            onPress={() => setPlans((prev) => prev.filter((_, i) => i !== index))}
          />
        </View>
      ))}
      <View style={adminStyles.field}>
        <Text style={adminStyles.label}>ETA minutes</Text>
        <TextInput
          style={adminStyles.input}
          keyboardType="numeric"
          value={String(form.etaMinutes ?? 30)}
          onChangeText={(t) => setField('etaMinutes', Number(t.replace(/[^0-9]/g, '')) || 30)}
          placeholderTextColor={colors.mutedText}
        />
      </View>
      <Text style={adminStyles.cardTitle}>Extra controllers for this combo</Text>
      <Text style={[adminStyles.subtitle, { marginBottom: spacing.md }]}>
        Same prices as products — per-hour rate or flat fee per session length.
        Leave every row empty and this combo offers no extra controllers.
      </Text>
      {controllerTiers.map((tier, index) => (
        <View key={`ctier-${index}`} style={adminStyles.card}>
          <View style={adminStyles.row}>
            <View style={[adminStyles.field, { flex: 1, marginBottom: 8 }]}>
              <Text style={adminStyles.label}>Up to hours</Text>
              <TextInput
                style={adminStyles.input}
                keyboardType="numeric"
                value={tier.upToHours}
                onChangeText={(t) =>
                  setControllerTiers((prev) => prev.map((r, i) => (i === index ? { ...r, upToHours: t } : r)))
                }
                placeholder="6"
                placeholderTextColor={colors.mutedText}
              />
            </View>
            <View style={[adminStyles.field, { flex: 1, marginBottom: 8, marginLeft: 8 }]}>
              <Text style={adminStyles.label}>₹ amount</Text>
              <TextInput
                style={adminStyles.input}
                keyboardType="numeric"
                value={tier.price}
                onChangeText={(t) =>
                  setControllerTiers((prev) => prev.map((r, i) => (i === index ? { ...r, price: t } : r)))
                }
                placeholder={tier.mode === 'hourly' ? '20' : '100'}
                placeholderTextColor={colors.mutedText}
              />
            </View>
          </View>
          <View style={[adminStyles.row, { marginTop: 4 }]}>
            {(['hourly', 'flat'] as const).map((m) => {
              const on = tier.mode === m;
              return (
                <Pressable
                  key={m}
                  onPress={() =>
                    setControllerTiers((prev) => prev.map((r, i) => (i === index ? { ...r, mode: m } : r)))
                  }
                  style={[adminStyles.chip, on && adminStyles.chipActive]}
                >
                  <Text style={[adminStyles.chipText, on && adminStyles.chipTextActive]}>
                    {m === 'hourly' ? '₹ per hour' : 'Flat fee'}
                  </Text>
                </Pressable>
              );
            })}
            <Pressable
              onPress={() => setControllerTiers((prev) => prev.filter((_, i) => i !== index))}
              style={{ justifyContent: 'center', marginLeft: 'auto' }}
            >
              <Text style={{ color: colors.danger }}>Remove</Text>
            </Pressable>
          </View>
        </View>
      ))}
      <View style={[adminStyles.row, { marginBottom: spacing.md, flexWrap: 'wrap', gap: 8 }]}>
        <Button
          title="Add price tier"
          size="sm"
          variant="secondary"
          onPress={() => setControllerTiers((prev) => [...prev, { upToHours: '', price: '', mode: 'hourly' }])}
        />
        <Button
          title="Use 100 / 120 / 150 flat"
          size="sm"
          variant="secondary"
          onPress={() =>
            setControllerTiers([
              { upToHours: '6', price: '100', mode: 'flat' },
              { upToHours: '12', price: '120', mode: 'flat' },
              { upToHours: '24', price: '150', mode: 'flat' },
            ])
          }
        />
      </View>
      <View style={adminStyles.field}>
        <Text style={adminStyles.label}>Max extra controllers a customer can add</Text>
        <TextInput
          style={adminStyles.input}
          keyboardType="numeric"
          value={controllerMax}
          onChangeText={setControllerMax}
          placeholder="3"
          placeholderTextColor={colors.mutedText}
        />
      </View>
      <ControllerTierPreview tiers={controllerTiers} plans={plans} />
      <View style={adminStyles.field}>
        <Text style={adminStyles.label}>Chips (comma-separated)</Text>
        <TextInput
          style={adminStyles.input}
          value={chipsText}
          onChangeText={setChipsText}
          placeholderTextColor={colors.mutedText}
        />
      </View>
      <View style={adminStyles.field}>
        <Text style={adminStyles.label}>Includes (one per line)</Text>
        <TextInput
          style={[adminStyles.input, { minHeight: 88, textAlignVertical: 'top' }]}
          value={includesText}
          onChangeText={setIncludesText}
          multiline
          placeholderTextColor={colors.mutedText}
        />
      </View>
      <View style={adminStyles.field}>
        <Text style={adminStyles.label}>How it works (one step per line)</Text>
        <TextInput
          style={[adminStyles.input, { minHeight: 88, textAlignVertical: 'top' }]}
          value={howText}
          onChangeText={setHowText}
          multiline
          placeholderTextColor={colors.mutedText}
        />
      </View>

      <Text style={adminStyles.cardTitle}>Linked products</Text>
      <View style={adminStyles.row}>
        {products.map((p) => {
          const on = form.productIds.includes(p.id);
          return (
            <Pressable
              key={p.id}
              style={[adminStyles.chip, on && adminStyles.chipActive]}
              onPress={() => toggleProduct(p.id)}
            >
              <Text style={[adminStyles.chipText, on && adminStyles.chipTextActive]}>
                {p.shortName || p.id}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {error ? <Text style={adminStyles.error}>{error}</Text> : null}
      <View style={adminStyles.row}>
        <Button title="Cancel" variant="ghost" size="sm" onPress={() => router.back()} />
        <Button
          title={saving ? 'Saving…' : 'Save combo'}
          size="sm"
          disabled={saving}
          onPress={() => void onSave()}
        />
      </View>
    </ScrollView>
  );
}

function ControllerTierPreview({
  tiers,
  plans,
}: {
  tiers: { upToHours: string; price: string; mode: 'flat' | 'hourly' }[];
  plans: RentalPlan[];
}) {
  const parsed = tiers
    .map((t) => ({
      upToHours: Number(t.upToHours.replace(/[^0-9]/g, '')) || 0,
      price: Number(t.price.replace(/[^0-9]/g, '')) || 0,
      mode: t.mode,
    }))
    .filter((t) => t.upToHours > 0)
    .sort((a, b) => a.upToHours - b.upToHours);
  if (!parsed.length) {
    return (
      <Text style={[adminStyles.subtitle, { marginTop: 8, marginBottom: spacing.lg }]}>
        No extra controllers on this combo until you add a tier above.
      </Text>
    );
  }
  const draft: ProductAddon = {
    id: 'extra-controller',
    name: 'Extra Controller',
    maxQuantity: 1,
    pricing: { perHour: 0, perHourMaxPlanHours: 6, flatPrice: 0, flatMinPlanHours: 12, tiers: parsed },
  };
  return (
    <View style={{ marginTop: 8, marginBottom: spacing.lg, gap: 4 }}>
      <Text style={adminStyles.label}>Customer sees</Text>
      <Text style={adminStyles.cardMeta}>{describeControllerPrice(draft)}</Text>
      {plans
        .filter((p) => p.hours > 0)
        .map((p) => (
          <Text key={p.id || String(p.hours)} style={adminStyles.cardMeta}>
            {p.label || `${p.hours}h`} · {formatINR(priceForAddon(draft, p.hours, 1))} each
          </Text>
        ))}
    </View>
  );
}
